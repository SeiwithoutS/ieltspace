import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  Chip,
  ConfirmDialog,
  CoverPicker,
  CoverThumb,
  DataCard,
  DataTable,
  Dialog,
  DialogBody,
  DialogFoot,
  DialogHead,
  EmptyState,
  FilterBar,
  Icon,
  PageHeader,
  SearchField,
  SegmentedTabs,
  StatCard,
  StatGrid,
  TextField,
} from "../../components/shared/ui";
import { type VocabularySet } from "../../data/vocabulary";
import {
  listAdminVocabularySets,
  createVocabularySet,
  deleteVocabularySet,
  type DatabaseVocabularySet,
} from "../../lib/vocabulary/vocabulary-api";
import {
  isManagedVocabularyImage,
  uploadVocabularyImage,
  useVocabularyImagePreview,
} from "../../lib/vocabulary/vocabulary-media";

const coverChoices = [
  ["Tím", "#4338a4", "#6764c4"],
  ["Xanh dương", "#426cb8", "#abc7ef"],
  ["Cam", "#f08b58", "#ffe0a2"],
  ["Xanh lá", "#438261", "#a4d8b5"],
].map(([name, base, highlight]) => ({
  name,
  url:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect width="300" height="200" fill="${base}"/><g fill="${highlight}"><circle cx="245" cy="45" r="42"/><circle cx="25" cy="230" r="104"/></g></svg>`,
    ),
}));

type SetStatus = DatabaseVocabularySet["status"];

export const statusLabels: Record<SetStatus, string> = {
  PUBLISHED: "Công khai",
  DRAFT: "Bản nháp",
  HIDDEN: "Đã ẩn",
};
export const statusTone = {
  PUBLISHED: "published",
  DRAFT: "draft",
  HIDDEN: "hidden",
} as const;
const statusOptions = ["", "PUBLISHED", "DRAFT", "HIDDEN"] as const;

export function VocabularyStats({
  stats,
}: {
  stats: readonly (readonly [string, number | string])[];
}) {
  return (
    <StatGrid min={150} label="Thống kê">
      {stats.map(([label, count]) => (
        <StatCard key={label} label={label} value={count} />
      ))}
    </StatGrid>
  );
}

export function SetDirectory({
  onOpen,
}: {
  onOpen: (set: VocabularySet) => void;
}) {
  const [deleting, setDeleting] = useState<VocabularySet | null>(null);
  const [status, setStatus] = useState<SetStatus | "">("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [records, setRecords] = useState<DatabaseVocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [removing, setRemoving] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listAdminVocabularySets()
      .then((result) => {
        if (active) setRecords(result.sets);
      })
      .catch((error) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : "Không tải được danh sách.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const visible = records.filter(
    (set) =>
      (!status || status === set.status) &&
      set.title.toLocaleLowerCase("vi").includes(normalizedQuery),
  );
  const stats = [
    ["Tổng bộ từ", records.length],
    [
      "Tổng số từ",
      records.reduce((total, set) => total + (set.wordCount ?? 0), 0),
    ],
    ["Công khai", records.filter((set) => set.status === "PUBLISHED").length],
    ["Bản nháp", records.filter((set) => set.status === "DRAFT").length],
    ["Đã ẩn", records.filter((set) => set.status === "HIDDEN").length],
  ] as const;

  return (
    <>
      <PageHeader
        title="Quản lý bộ từ vựng"
        description="Nhập từ, quản lý nội dung và công bố bộ từ cho người học."
        actions={
          <Button
            variant="primary"
            className="press"
            onClick={() => setCreating(true)}
            aria-haspopup="dialog"
          >
            <Icon name="plus" />
            Tạo bộ từ
          </Button>
        }
      />
      <VocabularyStats
        stats={stats.map(([label, count]) => [
          label,
          loading || (error && !records.length) ? "—" : count,
        ])}
      />
      {creating && (
        <SetForm
          initial={{ id: "", title: "", cover: "" }}
          onSave={async (set) => {
            const result = await createVocabularySet(set);
            setRecords((current) => [result.set, ...current]);
            setQuery("");
            setStatus("");
            setError("");
          }}
          close={() => setCreating(false)}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          setRemoving(true);
          try {
            await deleteVocabularySet(deleting.id);
            setRecords((items) =>
              items.filter((item) => item.id !== deleting.id),
            );
            setDeleting(null);
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Không xóa được bộ.",
            );
            setDeleting(null);
          } finally {
            setRemoving(false);
          }
        }}
        label="Xóa bộ từ"
        width={440}
        tone="danger"
        icon={<Icon name="trash" size={20} />}
        title={`Xóa bộ “${deleting?.title ?? ""}”?`}
        cancelVariant="danger"
        confirmVariant="danger-solid"
        confirmClassName="ui-btn--on-solid"
        confirmDisabled={removing}
        confirmLabel={
          <>
            <Icon name="trash" />
            Xóa bộ từ
          </>
        }
      >
        Bộ nháp này sẽ bị xóa khỏi database. Bộ đã công bố không thể xóa tại
        bước này.
      </ConfirmDialog>
      <FilterBar
        label="Tìm và lọc bộ từ"
        count={loading ? undefined : visible.length + " bộ từ"}
        filtered={Boolean(query || status)}
        onClear={() => {
          setQuery("");
          setStatus("");
        }}
      >
        <SearchField
          label="Tìm bộ từ theo tên"
          placeholder="Tìm theo tên bộ từ"
          value={query}
          onChange={setQuery}
        />
        <SegmentedTabs
          label="Trạng thái bộ từ"
          value={status}
          onChange={setStatus}
          options={statusOptions.map((option) => ({
            value: option,
            label: option ? statusLabels[option] : "Tất cả",
          }))}
        />
      </FilterBar>

      {error && (
        <div
          className="vocab-feedback flex flex-wrap items-center justify-between gap-3"
          role="alert"
        >
          <span>{error}</span>
          <Button onClick={() => setReload((value) => value + 1)}>
            Tải lại danh sách
          </Button>
        </div>
      )}
      <section aria-label="Danh sách bộ từ" aria-busy={loading}>
        {loading ? (
          <EmptyState kind="loading">Đang tải danh sách…</EmptyState>
        ) : (
          <DataCard>
            <DataTable label="Bảng danh sách bộ từ" minWidth={512}>
              <thead>
                <tr>
                  <th scope="col" className="ui-th">
                    Tên bộ từ
                  </th>
                  <th scope="col" className="ui-th">
                    Số từ
                  </th>
                  <th scope="col" className="ui-th">
                    Trạng thái
                  </th>
                  <th scope="col" className="ui-th">
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((set) => (
                  <tr key={set.id}>
                    <td className="ui-td">
                      <div className="flex items-center gap-3">
                        <VocabularySetCover set={set} />
                        <strong className="break-words">{set.title}</strong>
                      </div>
                    </td>
                    <td className="ui-td tabular-nums">{set.wordCount ?? 0}</td>
                    <td className="ui-td">
                      <Chip tone={statusTone[set.status]}>
                        {statusLabels[set.status]}
                      </Chip>
                    </td>
                    <td className="ui-td ui-td--right ui-td--nowrap">
                      <span className="ui-rowactions">
                        <Button
                          className="press ui-btn--h34"
                          aria-label={`Mở bộ ${set.title}`}
                          onClick={() => onOpen(set)}
                        >
                          Mở <Icon name="chevron-right" size={15} />
                        </Button>
                        <Button
                          icon
                          size="sm"
                          variant="danger"
                          className="press"
                          aria-label={`Xóa bộ ${set.title}`}
                          title={
                            set.status === "DRAFT"
                              ? "Xóa bộ từ"
                              : "Chỉ xóa được bộ từ ở trạng thái bản nháp"
                          }
                          disabled={set.status !== "DRAFT"}
                          onClick={() => setDeleting(set)}
                        >
                          <Icon name="trash" size={15} />
                        </Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            {!visible.length && (
              <EmptyState inline>
                {error
                  ? "Chưa tải được danh sách."
                  : query || status
                    ? "Không có bộ từ phù hợp với bộ lọc."
                    : "Chưa có bộ từ nào."}
              </EmptyState>
            )}
          </DataCard>
        )}
      </section>
    </>
  );
}

// Ảnh bìa bộ từ: CoverThumb chung, riêng Từ vựng tự gia hạn URL ảnh khi tải lỗi.
export function VocabularySetCover({
  set,
  size,
}: {
  set: VocabularySet;
  size?: "sm" | "lg";
}) {
  const { source, renew } = useVocabularyImagePreview(
    set.cover,
    set.coverPreview,
  );
  return (
    <CoverThumb
      src={source}
      initial={set.title.slice(0, 1)}
      size={size}
      onImageError={() => void renew()}
    />
  );
}

export function SetForm({
  initial,
  onSave,
  close,
}: {
  initial: VocabularySet;
  onSave: (set: VocabularySet) => void | Promise<void>;
  close: () => void;
}) {
  const [editing, setEditing] = useState(initial);
  const [error, setError] = useState("");
  // Lỗi tải ảnh bìa hiện ngay dưới nút tải ảnh (như hộp "Tạo bộ đề mới").
  const [coverMsg, setCoverMsg] = useState("");
  // Bấm lưu rồi mới báo lỗi ô nhập (giống hộp "Tạo bộ đề mới"); lỗi tự hết khi sửa đúng.
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const managed = isManagedVocabularyImage(editing.cover);
  const { source: coverSource, renew } = useVocabularyImagePreview(
    editing.cover,
    editing.coverPreview,
  );
  const coverUrl =
    managed || editing.cover.startsWith("data:") ? "" : editing.cover.trim();
  const titleError = tried && !editing.title.trim() ? "Nhập tên bộ từ." : "";
  const coverError =
    tried && coverUrl && !/^https?:\/\/\S+$/i.test(coverUrl)
      ? "Nhập URL hợp lệ, bắt đầu bằng http:// hoặc https://."
      : "";
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving || uploading) return;
    const title = editing.title.trim();
    if (!title || (coverUrl && !/^https?:\/\/\S+$/i.test(coverUrl))) {
      setTried(true);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: editing.id,
        title,
        description: editing.description?.trim(),
        cover: editing.cover.trim(),
        coverPreview: editing.coverPreview,
      });
      close();

      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Chưa lưu được bộ từ vào database.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onClose={close}
      label={editing.id ? "Sửa bộ từ" : "Tạo bộ từ mới"}
      width={660}
    >
      <DialogBody as="form" onSubmit={submit}>
        <DialogHead
          title={editing.id ? "Sửa bộ từ" : "Tạo bộ từ"}
          description={
            editing.id
              ? "Cập nhật thông tin bộ từ."
              : "Bộ mới ở trạng thái Bản nháp. Thêm từ sau khi tạo bộ."
          }
          onClose={close}
        />
        <div className="ui-split">
          <CoverPicker
            src={coverSource}
            onImageError={() => void renew()}
            uploadLabel={uploading ? "Đang tải ảnh…" : "Tải ảnh lên"}
            disabled={uploading || saving}
            onFile={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file || uploading || saving) return;
              if (
                !["image/png", "image/jpeg", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 1024 * 1024
              ) {
                setCoverMsg("Chọn ảnh JPG, PNG hoặc WebP tối đa 1 MB.");
                return;
              }
              setUploading(true);
              setCoverMsg("");
              try {
                const { image, imagePreview } =
                  await uploadVocabularyImage(file);
                setEditing((current) => ({
                  ...current,
                  cover: image,
                  coverPreview: imagePreview,
                }));
              } catch (failure) {
                setCoverMsg(
                  failure instanceof Error
                    ? failure.message
                    : "Chưa tải được ảnh bìa.",
                );
              } finally {
                setUploading(false);
              }
            }}
            presets={coverChoices.map((choice) => ({
              name: choice.name,
              src: choice.url,
              selected: editing.cover === choice.url,
              onPick: () => {
                setCoverMsg("");
                setEditing({
                  ...editing,
                  cover: choice.url,
                  coverPreview: undefined,
                });
              },
            }))}
            message={coverMsg}
            note="JPG, PNG hoặc WebP, tối đa 1 MB. Nên dùng ảnh ngang 3:2."
          />
          <div className="ui-split__main">
            <TextField
              className="ui-control--lg"
              label="Tên bộ từ"
              required
              showCount
              maxLength={80}
              error={titleError}
              data-autofocus
              placeholder="Ví dụ: Từ vựng chủ đề Môi trường"
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
            />
            <TextField
              className="ui-control--lg"
              label="URL ảnh bìa"
              type="url"
              disabled={uploading}
              error={coverError}
              placeholder="https://…"
              value={
                managed || editing.cover.startsWith("data:")
                  ? ""
                  : editing.cover
              }
              onChange={(e) =>
                setEditing({
                  ...editing,
                  cover: e.target.value,
                  coverPreview: undefined,
                })
              }
            />
            <TextField
              as="textarea"
              rows={4}
              label="Mô tả (không bắt buộc)"
              value={editing.description ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
            />
          </div>
        </div>
        {error && (
          <p role="alert" className="ui-dlg__alert">
            {error}
          </p>
        )}
        <DialogFoot>
          <Button className="press" onClick={close}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="press"
            disabled={saving || uploading}
          >
            {saving ? (
              "Đang lưu…"
            ) : editing.id ? (
              "Lưu thay đổi"
            ) : (
              <>
                <Icon name="plus" />
                Tạo bộ từ
              </>
            )}
          </Button>
        </DialogFoot>
      </DialogBody>
    </Dialog>
  );
}
