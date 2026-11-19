import type {
  SampleAssetKind,
  SampleAssetUrlResponse,
  SampleMediaRef,
  SampleMediaScope,
} from "./sample-media-types";
import { apiFetch } from "../shared/api";
import type { SampleImportPreview, SampleImportResult, SampleImportWorkbook } from "./sample-import";
import {
  encodeSampleQuery,
  type PublicSampleListResponse,
  type PublicSampleQuery,
  type PublicSampleResponse,
} from "./sample-public";
import type {
  AdminSampleListResponse,
  AdminSampleQuery,
  AdminSampleResponse,
  CreateSampleRequest,
  SamplePublicationRequest,
  SaveSampleDraftRequest,
} from "./sample-types";

function queryString(query: AdminSampleQuery): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const result = params.toString();
  return result ? `?${result}` : "";
}

function samplePath(id: string): string {
  return `/admin/samples/${encodeURIComponent(id)}`;
}

function uploadContentType(file: File): string {
  if (file.type) return file.type;

  // Chỉ hỗ trợ browser không cung cấp MIME.
  // Backend vẫn phải kiểm tra bytes thật.
  const extension = file.name.split(".").pop()?.toLowerCase();

  const fallback: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
  };

  return fallback[extension || ""] || "application/octet-stream";
}

export const sampleApi = {
  previewImport(workbook: SampleImportWorkbook) {
    return apiFetch<SampleImportPreview>("/admin/samples/import/preview", { method: "POST", json: workbook });
  },

  confirmImport(requestKey: string, workbook: SampleImportWorkbook) {
    return apiFetch<SampleImportResult>("/admin/samples/import/confirm", { method: "POST", json: { requestKey, workbook } });
  },

  uploadAsset(
    id: string,
    kind: SampleAssetKind,
    file: File,
  ) {
    const query = new URLSearchParams({
      kind,
      originalName: file.name,
    });

    return apiFetch<{ asset: SampleMediaRef }>(
      `${samplePath(id)}/assets?${query.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": uploadContentType(file),
        },
        body: file,
      },
    );
  },

  assetUrl(
    id: string,
    path: string,
    scope: SampleMediaScope,
  ) {
    const prefix =
      scope === "admin"
        ? samplePath(id)
        : `/samples/${encodeURIComponent(id)}`;

    const query = new URLSearchParams({ path });

    return apiFetch<SampleAssetUrlResponse>(
      `${prefix}/assets/url?${query.toString()}`,
      {
        auth: scope === "admin",
      },
    );
  },

  listPublic(query: PublicSampleQuery = {}) {
    const encoded = encodeSampleQuery(query);
    return apiFetch<PublicSampleListResponse>(`/samples${encoded ? `?${encoded}` : ""}`, {
      auth: false,
    });
  },

  getPublic(id: string) {
    return apiFetch<PublicSampleResponse>(`/samples/${encodeURIComponent(id)}`, { auth: false });
  },

  list(query: AdminSampleQuery = {}) {
    return apiFetch<AdminSampleListResponse>(
      `/admin/samples${queryString(query)}`,
    );
  },

  create(request: CreateSampleRequest) {
    return apiFetch<AdminSampleResponse>("/admin/samples", {
      method: "POST",
      json: request,
    });
  },

  get(id: string) {
    return apiFetch<AdminSampleResponse>(samplePath(id));
  },

  saveDraft(id: string, request: SaveSampleDraftRequest) {
    return apiFetch<AdminSampleResponse>(`${samplePath(id)}/draft`, {
      method: "PUT",
      json: request,
    });
  },

  publication(id: string, request: SamplePublicationRequest) {
    return apiFetch<AdminSampleResponse>(
      `${samplePath(id)}/publication`,
      {
        method: "POST",
        json: request,
      },
    );
  },
};
