/// <reference types="vite/client" />

import { useCallback, useEffect, useRef, useState } from "react";
import { StaffDataTable } from "../../../components/shared/StaffDataTable";
import { ApiError } from "../../../lib/shared/api";
import { sampleApi } from "../../../lib/samples/sample-api";
import { SAMPLE_TYPE_LABELS, sampleEditorHref } from "../../../lib/samples/sample-editor";
import { readSampleWorkbook, type SampleImportIssue, type SampleImportPreview, type SampleImportResult, type SampleImportWorkbook } from "../../../lib/samples/sample-import";
import { registerNavigationGuard } from "../../../lib/shared/navigation-guard";

export const sampleTemplateUrl = `${import.meta.env.BASE_URL}templates/sample-answers-v1.xlsx`;

type PendingImport = { workbook: SampleImportWorkbook; preview: SampleImportPreview; requestKey: string };
type Props = { onClose: () => void; onImported: () => void };

function validationIssues(error: unknown): SampleImportIssue[] {
  if (!(error instanceof ApiError) || error.code !== "SAMPLE_IMPORT_INVALID") return [];
  const details = error.details as { issues?: SampleImportIssue[] } | undefined;
  return Array.isArray(details?.issues) ? details.issues : [];
}

export default function SampleImportPanel({ onClose, onImported }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const running = useRef<"preview" | "confirm" | null>(null);
  const uncertainConfirm = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [result, setResult] = useState<SampleImportResult | null>(null);
  const [busy, setBusy] = useState<"preview" | "confirm" | null>(null);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<SampleImportIssue[]>([]);

  const canLeaveImport = useCallback(() => {
    if (running.current === "confirm") {
      window.alert("Đang xác nhận nhập. Hãy đợi kết quả trước khi rời trang.");
      return false;
    }
    return !uncertainConfirm.current || window.confirm(
      "Chưa xác nhận được kết quả lần nhập trước. Hãy thử lại cùng yêu cầu để tránh tạo trùng. Bạn có muốn bỏ lần nhập này?",
    );
  }, []);

  useEffect(() => {
    heading.current?.focus();
    const unregister = registerNavigationGuard(canLeaveImport);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (running.current !== "confirm" && !uncertainConfirm.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      unregister();
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [canLeaveImport]);

  async function run(phase: "preview" | "confirm", action: () => Promise<void>) {
    if (running.current) return;
    running.current = phase;
    setBusy(phase);
    setError("");
    try {
      await action();
    } catch (failure: unknown) {
      const errors = validationIssues(failure);
      if (errors.length) {
        setIssues(errors);
        setPending(null);
      }
      const message = failure instanceof Error ? failure.message : "Không xử lý được tệp Excel.";
      uncertainConfirm.current = phase === "confirm" && failure instanceof ApiError && (failure.status === 0 || failure.status >= 500);
      setError(uncertainConfirm.current
        ? `${message} Bấm Xác nhận nhập lần nữa để kiểm tra kết quả của cùng yêu cầu.`
        : message);
    } finally {
      running.current = null;
      setBusy(null);
    }
  }

  function preview() {
    if (!file) return;
    setPending(null);
    setIssues([]);
    void run("preview", async () => {
      const workbook = await readSampleWorkbook(file);
      const response = await sampleApi.previewImport(workbook);
      setPending({ workbook, preview: response, requestKey: crypto.randomUUID() });
      setIssues(response.issues);
    });
  }

  function confirm() {
    if (!pending?.preview.canConfirm || result) return;
    void run("confirm", async () => {
      const imported = await sampleApi.confirmImport(pending.requestKey, pending.workbook);
      uncertainConfirm.current = false;
      setResult(imported);
      setIssues([]);
      onImported();
    });
  }

  function selectFile(next: File) {
    if (!canLeaveImport()) return;
    uncertainConfirm.current = false;
    setFile(next);
    setPending(null);
    setResult(null);
    setIssues([]);
    setError("");
  }

  return (
    <section id="sample-import-panel" className="sample-panel sample-create-panel" aria-labelledby="sample-import-heading" aria-busy={Boolean(busy)}>
      <div className="sample-section-header">
        <div>
          <h2 id="sample-import-heading" ref={heading} tabIndex={-1}>Nhập bài mẫu từ Excel</h2>
          <p className="sample-muted">Giữ nguyên tiêu đề cột trong mẫu. Các bài được lưu ở trạng thái nháp.</p>
        </div>
        <button className="ui-btn" type="button" disabled={Boolean(busy)}
          onClick={() => { if (canLeaveImport()) onClose(); }}>Đóng</button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="sample-field min-w-0 grow sm:max-w-sm">
          <span>Tệp Excel (.xlsx, tối đa 5 MiB)</span>
          <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={Boolean(busy)} onChange={event => {
              const selected = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (selected) selectFile(selected);
            }} />
          {file && <small className="sample-muted break-all">{file.name}</small>}
        </label>
        <button type="button" className="ui-btn"
          disabled={!file || Boolean(busy) || Boolean(result) || Boolean(pending?.preview.canConfirm)} onClick={preview}>
          {busy === "preview" ? "Đang kiểm tra…" : "Kiểm tra tệp"}
        </button>
      </div>
      {error && <p className="sample-error" role="alert">{error}</p>}

      {pending && !result && (
        <div className="grid gap-3 min-w-0">
          <p role="status"><strong>{pending.preview.samples.length} bài hợp lệ</strong> · {pending.preview.dataRows} dòng dữ liệu</p>
          {!!pending.preview.samples.length && (
            <StaffDataTable label="Bài mẫu hợp lệ" className="sample-import-table">
              <thead>
                <tr>
                  <th scope="col">Tiêu đề</th>
                  <th scope="col">Mã bài</th>
                  <th scope="col">Loại bài</th>
                  <th scope="col">Số câu</th>
                </tr>
              </thead>
              <tbody>
                {pending.preview.samples.map(sample => (
                  <tr key={sample.sampleKey}>
                    <td className="break-words"><strong>{sample.title}</strong></td>
                    <td className="sample-muted whitespace-nowrap">{sample.sampleKey}</td>
                    <td>{SAMPLE_TYPE_LABELS[sample.sampleType]}</td>
                    <td>{sample.sampleType.startsWith("SPEAKING") ? sample.itemCount : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </StaffDataTable>
          )}
        </div>
      )}

      {!!issues.length && (
        <StaffDataTable label="Kết quả kiểm tra từng ô" className="sample-import-table">
          <thead><tr><th scope="col">Vị trí</th><th scope="col">Trường</th><th scope="col">Kết quả</th></tr></thead>
          <tbody>{issues.map((issue, i) => (
            <tr key={`${issue.sheet}-${issue.row}-${issue.field}-${i}`}>
              <td className="whitespace-nowrap">{issue.sheet} · {issue.column ? `${issue.column}${issue.row}` : `dòng ${issue.row}`}</td>
              <td>{issue.field}</td>
              <td><strong>{issue.severity === "ERROR" ? "Lỗi" : "Cảnh báo"} </strong>{issue.message}</td>
            </tr>
          ))}</tbody>
        </StaffDataTable>
      )}

      {pending && !result && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="sample-muted">
            {!pending.preview.canConfirm ? "Sửa các ô có lỗi rồi chọn lại tệp." :
              issues.length ? "Bạn có thể xử lý các cảnh báo trong trình chỉnh sửa trước khi công bố." : "Tệp đã sẵn sàng để nhập."}
          </p>
          <button type="button" className="ui-btn ui-btn--primary" disabled={Boolean(busy) || !pending.preview.canConfirm} onClick={confirm}>
            {busy === "confirm" ? "Đang tạo bản nháp…" : "Xác nhận nhập"}
          </button>
        </div>
      )}

      {result && (
        <div className="grid gap-2">
          <p role="status"><strong>{result.replayed ? "Đã tìm thấy" : "Đã tạo"} {result.createdCount} bản nháp.</strong></p>
          <ul className="grid gap-3 max-h-56 overflow-auto">
            {result.samples.map(sample => (
              <li key={sample.id}>
                <a className="ui-btn" href={sampleEditorHref(sample.skill, sample.id)}>
                  Mở nháp {sample.sampleKey}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
