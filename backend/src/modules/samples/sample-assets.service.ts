import crypto from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";

import { env } from "../../config.js";
import {
  detectAudioExtension,
  detectImageExtension,
  getStorageClient,
} from "../../integrations/storage/supabase-storage.js";
import { HttpError } from "../../utils/http.js";
import type { SampleDocument } from "./samples.schemas.js";

export type SampleAssetKind = "cover" | "prompt-image" | "audio";
export type SampleMediaRef = NonNullable<SampleDocument["cover"]>;

type Database = Pick<Prisma.TransactionClient, "$queryRaw">;

type MediaEntry = {
  kind: SampleAssetKind;
  ref: SampleMediaRef;
};

type AssetRow = SampleMediaRef & {
  kind: SampleAssetKind;
};

export const SAMPLE_IMAGE_LIMIT = 5 * 1024 * 1024;
export const SAMPLE_AUDIO_LIMIT = 50 * 1024 * 1024;
const SIGNED_URL_SECONDS = 300;

const formats = {
  jpg: {
    mimeType: "image/jpeg",
    declared: ["image/jpeg"],
  },
  png: {
    mimeType: "image/png",
    declared: ["image/png"],
  },
  webp: {
    mimeType: "image/webp",
    declared: ["image/webp"],
  },
  mp3: {
    mimeType: "audio/mpeg",
    declared: ["audio/mpeg", "audio/mp3", "audio/x-mpeg", "audio/x-mp3"],
  },
  wav: {
    mimeType: "audio/wav",
    declared: ["audio/wav", "audio/x-wav", "audio/wave"],
  },
  m4a: {
    mimeType: "audio/mp4",
    declared: ["audio/mp4", "audio/x-m4a", "audio/m4a"],
  },
} as const;

function storageUnavailable(): never {
  throw new HttpError(
    503,
    "SAMPLE_STORAGE_UNAVAILABLE",
    "Dịch vụ media chưa sẵn sàng. Vui lòng thử lại sau.",
  );
}

function assetNotFound(): never {
  throw new HttpError(
    404,
    "SAMPLE_ASSET_NOT_FOUND",
    "Không tìm thấy tệp được phép truy cập.",
  );
}

function invalidAsset(): never {
  throw new HttpError(
    400,
    "SAMPLE_ASSET_INVALID",
    "Media không hợp lệ hoặc không thuộc bài mẫu này. Hãy tải lại tệp.",
  );
}

function sameMedia(a: SampleMediaRef, b: SampleMediaRef): boolean {
  return a.bucket === b.bucket
    && a.path === b.path
    && a.originalName === b.originalName
    && a.mimeType === b.mimeType
    && a.sizeBytes === b.sizeBytes;
}

export function sampleMediaEntries(
  document: SampleDocument,
): MediaEntry[] {
  const entries: MediaEntry[] = [];

  if (document.cover) {
    entries.push({ kind: "cover", ref: document.cover });
  }

  if (document.skill === "WRITING") {
    if (document.promptImage) {
      entries.push({ kind: "prompt-image", ref: document.promptImage });
    }
  } else {
    for (const item of document.items) {
      if (item.audio) {
        entries.push({ kind: "audio", ref: item.audio });
      }
    }
  }

  return entries;
}

/**
 * Gọi bên trong transaction đang khóa sample/draft khi lưu hoặc công bố.
 */
export async function assertSampleMedia(
  db: Database,
  sampleId: string,
  document: SampleDocument,
): Promise<void> {
  const entries = sampleMediaEntries(document);
  if (!entries.length) return;

  const paths = [...new Set(entries.map(entry => entry.ref.path))];

  const rows = await db.$queryRaw<AssetRow[]>(Prisma.sql`
    select
      kind,
      bucket,
      path,
      original_name as "originalName",
      mime_type as "mimeType",
      size_bytes as "sizeBytes"
    from public.sample_media_assets
    where sample_id = ${sampleId}::uuid
      and state = 'READY'
      and bucket = ${env.STORAGE_BUCKET_SAMPLE_ASSETS}
      and path in (${Prisma.join(paths)})
    for share
  `);

  for (const entry of entries) {
    const stored = rows.find(row =>
      row.kind === entry.kind
      && row.path === entry.ref.path
      && row.bucket === env.STORAGE_BUCKET_SAMPLE_ASSETS
      && sameMedia(row, entry.ref),
    );

    if (!stored) invalidAsset();
  }
}

/**
 * Không dùng public bucket cho media nháp.
 * Kiểm tra cấu hình để tránh vô tình upload vào bucket public.
 */
async function privateStorage() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) storageUnavailable();
  const client = getStorageClient();
  const bucket = env.STORAGE_BUCKET_SAMPLE_ASSETS;

  const { data, error } = await client.storage.getBucket(bucket);

  if (error || !data || data.public) {
    storageUnavailable();
  }

  return { client, bucket };
}

function safeOriginalName(name: string): string {
  const basename = name.split(/[\\/]/).pop() || "upload";

  const clean = basename
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f\uD800-\uDFFF]/gu, "_")
    .trim();

  // Cắt theo code point, tránh tạo surrogate đơn.
  return Array.from(clean || "upload").slice(0, 120).join("");
}

// Require an M4A-compatible ISO BMFF brand, rather than accepting any MP4.
function hasM4aBrand(buffer: Buffer): boolean {
  if (buffer.length < 16 || buffer.toString("ascii", 4, 8) !== "ftyp") return false;
  const end = buffer.readUInt32BE(0);
  if (end < 16 || end > buffer.length || end > 4096) return false;
  if (buffer.toString("ascii", 8, 12) === "M4A ") return true;
  for (let i = 16; i + 4 <= end; i += 4) {
    if (buffer.toString("ascii", i, i + 4) === "M4A ") return true;
  }
  return false;
}

function hasPngData(buffer: Buffer): boolean {
  if (buffer.length < 45 || buffer.readUInt32BE(8) !== 13 || buffer.toString("ascii", 12, 16) !== "IHDR") return false;
  if (!buffer.readUInt32BE(16) || !buffer.readUInt32BE(20)) return false;
  let hasImageData = false;
  for (let offset = 8; offset + 12 <= buffer.length;) {
    const size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    offset += size + 12;
    if (offset > buffer.length) return false;
    if (type === "IDAT" && size > 0) hasImageData = true;
    if (type === "IEND") return size === 0 && hasImageData;
  }
  return false;
}

function riffChunks(buffer: Buffer, wanted: readonly string[]): Map<string, number> {
  const sizes = new Map<string, number>();
  const end = buffer.readUInt32LE(4) + 8;
  if (end > buffer.length) return sizes;
  for (let offset = 12; offset + 8 <= end;) {
    const name = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    offset += 8 + size;
    if (offset > end) return new Map();
    if (wanted.includes(name)) sizes.set(name, Math.max(sizes.get(name) ?? 0, size));
    offset += size % 2;
  }
  return sizes;
}

function hasM4aData(buffer: Buffer): boolean {
  if (!hasM4aBrand(buffer)) return false;
  let hasMetadata = false;
  let hasAudio = false;
  for (let offset = 0; offset + 8 <= buffer.length;) {
    const box = buffer.toString("ascii", offset + 4, offset + 8);
    let size = buffer.readUInt32BE(offset);
    const header = size === 1 ? 16 : 8;
    if (size === 1 && offset + header > buffer.length) return false;
    if (size === 1) size = Number(buffer.readBigUInt64BE(offset + 8));
    else if (size === 0) size = buffer.length - offset;
    if (size < header || size > buffer.length - offset) return false;
    if (size > header && box === "moov") hasMetadata = true;
    if (size > header && box === "mdat") hasAudio = true;
    offset += size;
  }
  return hasMetadata && hasAudio;
}

function hasMp3Frame(buffer: Buffer): boolean {
  let offset = 0;
  if (buffer.toString("ascii", 0, 3) === "ID3") {
    if (buffer.length < 10) return false;
    const tagSize = buffer.subarray(6, 10);
    if (tagSize.some(value => value > 127)) return false;
    offset = tagSize.reduce((size, value) => size * 128 + value, 0) + 10;
    if (buffer[3] === 4 && (buffer[5]! & 16)) offset += 10;
  }
  if (offset + 24 > buffer.length) return false;
  const flags = buffer[offset + 1]!;
  const version = (flags >> 3) & 3;
  const config = buffer[offset + 2]!;
  const rates = [44100, 48000, 32000];
  const sampleRate = rates[(config >> 2) & 3];
  const bitrateIndex = config >> 4;
  if (buffer[offset] !== 255 || (flags & 0xe6) !== 0xe2 || version === 1 || !sampleRate || bitrateIndex === 15) return false;
  // Free-format files have no bitrate available in their frame header.
  if (bitrateIndex === 0) return true;
  const bitrates = version === 3
    ? [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
    : [8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const coefficient = version === 0 ? 288_000 : 144_000;
  const length = Math.floor(coefficient * bitrates[bitrateIndex - 1]! / sampleRate) + ((config >> 1) & 1);
  return offset + length <= buffer.length;
}

function hasMediaData(buffer: Buffer, extension: keyof typeof formats): boolean {
  switch (extension) {
    case "png": return hasPngData(buffer);
    case "jpg": {
      const scan = buffer.indexOf(Buffer.from([255, 218]), 3);
      return scan >= 0 && buffer.indexOf(Buffer.from([255, 217]), scan + 4) >= 0;
    }
    case "webp": {
      const chunks = riffChunks(buffer, ["VP8 ", "VP8L", "ANMF"]);
      return (chunks.get("VP8 ") ?? 0) >= 10 || (chunks.get("VP8L") ?? 0) >= 5 || (chunks.get("ANMF") ?? 0) >= 16;
    }
    case "wav": {
      const chunks = riffChunks(buffer, ["fmt ", "data"]);
      return (chunks.get("fmt ") ?? 0) >= 16 && (chunks.get("data") ?? 0) > 0;
    }
    case "mp3": return hasMp3Frame(buffer);
    case "m4a": return hasM4aData(buffer);
  }
}

export async function uploadSampleAsset(
  prisma: PrismaClient,
  input: {
    sampleId: string;
    userId: string;
    kind: SampleAssetKind;
    originalName: string;
    contentType: string;
    buffer: Buffer;
  },
): Promise<SampleMediaRef> {
  const limit = input.kind === "audio" ? SAMPLE_AUDIO_LIMIT : SAMPLE_IMAGE_LIMIT;

  if (!input.buffer.length) {
    throw new HttpError(
      400,
      "SAMPLE_ASSET_EMPTY",
      "Tệp tải lên đang rỗng.",
    );
  }

  if (input.buffer.length > limit) {
    throw new HttpError(
      413,
      "SAMPLE_ASSET_TOO_LARGE",
      input.kind === "audio"
        ? "Audio tối đa 50 MiB."
        : "Ảnh tối đa 5 MiB.",
    );
  }

  const samples = await prisma.$queryRaw<{ id: string }[]>`
    select id
    from public.sample_answers
    where id = ${input.sampleId}::uuid
  `;

  const sample = samples[0];

  if (!sample) {
    throw new HttpError(
      404,
      "SAMPLE_NOT_FOUND",
      "Không tìm thấy bài mẫu.",
    );
  }

  const audio = input.kind === "audio";
  const declared = input.contentType.split(";")[0].trim().toLowerCase();
  let ext: keyof typeof formats;
  try {
    const detected = audio
      ? detectAudioExtension(input.buffer, declared)
      : detectImageExtension(input.buffer, declared);
    if (!Object.prototype.hasOwnProperty.call(formats, detected)) throw new Error("Unsupported format");
    ext = detected as keyof typeof formats;
    if (!formats[ext].declared.some(mime => mime === declared)) throw new Error("MIME mismatch");
    if (!hasMediaData(input.buffer, ext)) throw new Error("Incomplete media container");
  } catch {
    throw new HttpError(415, "SAMPLE_ASSET_TYPE", audio
      ? "Tệp audio bị hỏng hoặc sai định dạng. Chọn tệp MP3, WAV hoặc M4A hợp lệ."
      : "Tệp ảnh bị hỏng hoặc sai định dạng. Chọn tệp JPEG, PNG hoặc WebP hợp lệ.");
  }
  const format = formats[ext];

  const { client, bucket } = await privateStorage();

  const assetId = crypto.randomUUID();
  const path =
    `samples/${sample.id}/${input.kind}/${assetId}.${ext}`;

  const asset: SampleMediaRef = {
    bucket,
    path,
    originalName: safeOriginalName(input.originalName),
    mimeType: format.mimeType,
    sizeBytes: input.buffer.length,
  };

  // Register before uploading so an ambiguous Storage failure remains discoverable.
  await prisma.$executeRaw`
      insert into public.sample_media_assets (
        id,
        sample_id,
        kind,
        bucket,
        path,
        original_name,
        mime_type,
        size_bytes,
        created_by
      )
      values (
        ${assetId}::uuid,
        ${sample.id}::uuid,
        ${input.kind},
        ${asset.bucket},
        ${asset.path},
        ${asset.originalName},
        ${asset.mimeType},
        ${asset.sizeBytes},
        ${input.userId}::uuid
      )
  `;

  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(path, input.buffer, {
      contentType: asset.mimeType,
      upsert: false,
      cacheControl: "60",
    });
  if (uploadError) storageUnavailable();

  return asset;
}

type CleanupCandidate = { id: string; path: string };

// Match by path even if old references have metadata that differs from the receipt.
const unusedMedia = Prisma.sql`
  a.bucket = ${env.STORAGE_BUCKET_SAMPLE_ASSETS}
  and a.path ~ ('^samples/' || a.sample_id || '/' || a.kind || '/' || a.id || '[.](jpg|png|webp|mp3|wav|m4a)$')
  and (a.state = 'DELETING' or a.created_at <= now() - interval '7 days')
  and not exists (
    select 1 from (values (s.published_payload), (d.payload)) doc(payload)
    cross join lateral (values (doc.payload->'cover'), (doc.payload->'promptImage')) refs(ref)
    where refs.ref->>'path' = a.path
  )
  and not exists (
    select 1 from (values (s.published_payload), (d.payload)) doc(payload)
    cross join lateral jsonb_path_query(doc.payload, '$.items[*].audio') refs(ref)
    where refs.ref->>'path' = a.path
  )
`;

function cleanupCandidates(db: Database, lock: boolean) {
  return db.$queryRaw<CleanupCandidate[]>(Prisma.sql`
    select a.id, a.path
    from public.sample_media_assets a
    join public.sample_answers s on s.id = a.sample_id
    left join public.sample_answer_drafts d on d.sample_id = s.id
    where ${unusedMedia}
    order by (a.state = 'DELETING') desc, a.created_at, a.id
    limit 100
    ${lock ? Prisma.sql`for update of s skip locked` : Prisma.empty}
  `);
}

export async function cleanupSampleMedia(prisma: PrismaClient, apply: boolean) {
  if (!apply) {
    const candidates = await cleanupCandidates(prisma, false);
    return { candidates: candidates.length, removed: 0, failed: 0 };
  }
  const { client, bucket } = await privateStorage();
  const candidates = await prisma.$transaction(async tx => {
    const locked = await cleanupCandidates(tx, true);
    if (!locked.length) return [];

    // Draft saves and publication hold the same sample locks. Re-read after
    // acquiring them so a save that just committed is visible before claiming.
    return tx.$queryRaw<CleanupCandidate[]>(Prisma.sql`
      update public.sample_media_assets a set state = 'DELETING'
      from public.sample_answers s
      left join public.sample_answer_drafts d on d.sample_id = s.id
      where a.sample_id = s.id
        and a.id in (${Prisma.join(locked.map(item => Prisma.sql`${item.id}::uuid`))})
        and ${unusedMedia}
      returning a.id, a.path
    `);
  });
  if (!candidates.length) return { candidates: 0, removed: 0, failed: 0 };

  const { error } = await client.storage.from(bucket).remove(candidates.map(item => item.path));
  if (error) return { candidates: candidates.length, removed: 0, failed: candidates.length };
  await prisma.$executeRaw(Prisma.sql`
    delete from public.sample_media_assets
    where state = 'DELETING' and id in (${Prisma.join(candidates.map(item => Prisma.sql`${item.id}::uuid`))})
  `);
  return { candidates: candidates.length, removed: candidates.length, failed: 0 };
}

export async function getSampleAssetUrl(
  prisma: PrismaClient,
  sampleId: string,
  path: string,
  admin: boolean,
): Promise<{ url: string; expiresAt: string }> {
  const rows = await prisma.$queryRaw<(AssetRow & { document: SampleDocument | null })[]>`
    select a.kind, a.bucket, a.path, a.original_name as "originalName",
      a.mime_type as "mimeType", a.size_bytes as "sizeBytes",
      s.published_payload as document
    from public.sample_media_assets a
    join public.sample_answers s on s.id = a.sample_id
    where a.sample_id = ${sampleId}::uuid
      and a.bucket = ${env.STORAGE_BUCKET_SAMPLE_ASSETS}
      and a.path = ${path}
      and a.state = 'READY'
      and (${admin} or s.status = 'PUBLISHED')
  `;
  const asset = rows[0];
  if (!asset) assetNotFound();
  if (!admin && (!asset.document || !sampleMediaEntries(asset.document).some(
    entry => entry.kind === asset.kind && sameMedia(entry.ref, asset),
  ))) {
    assetNotFound();
  }

  const { client, bucket } = await privateStorage();
  const expiresAt = new Date(
    Date.now() + SIGNED_URL_SECONDS * 1000,
  ).toISOString();

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_SECONDS);

  if (error || !data?.signedUrl) storageUnavailable();

  return { url: data.signedUrl, expiresAt };
}
