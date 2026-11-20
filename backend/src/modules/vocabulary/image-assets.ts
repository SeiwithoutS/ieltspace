import { Prisma, type PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { env } from '../../config.js';
import { r2Bucket, r2Configured } from '../../integrations/storage/r2-storage.js';
import { detectImageExtension } from '../../integrations/storage/supabase-storage.js';
import { HttpError } from '../../utils/http.js';

export const vocabularyImageLimit = 1024 * 1024;
export const vocabularyImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const prefix = 'vocab-image:';
const uuid = '[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}';
const referencePattern = new RegExp(`^${prefix}${uuid}$`);

export function isVocabularyImage(reference: string) {
  return referencePattern.test(reference);
}

const imageIds = (references: string[]) => [...new Set(references.filter(isVocabularyImage).map(value => value.slice(prefix.length)))];
type ImageAsset = { id: string; bucket: string; object_key: string };

export async function storeVocabularyImage(db: PrismaClient, bytes: Buffer, mime: string, source: 'UPLOAD' | 'PIXABAY') {
  if (!Buffer.isBuffer(bytes) || bytes.length === 0) throw new HttpError(400, 'EMPTY_IMAGE', 'Tệp ảnh trống.');
  if (bytes.length > vocabularyImageLimit) throw new HttpError(413, 'IMAGE_TOO_LARGE', 'Ảnh tối đa 1 MB.');
  const extension = detectImageExtension(bytes, mime, 'IMAGE_TYPE');
  const bucket = env.R2_VOCABULARY_BUCKET;
  if (!bucket || !r2Configured) throw new HttpError(503, 'VOCABULARY_STORAGE_UNAVAILABLE', 'Chưa cấu hình kho ảnh từ vựng.');

  const id = randomUUID();
  const key = `vocabulary/${id}.${extension}`;
  await db.$executeRaw`INSERT INTO public.vocabulary_image_assets(id,bucket,object_key,mime_type,size_bytes,source)
    VALUES (${id}::uuid,${bucket},${key},${mime},${bytes.length},${source})`;
  try {
    const storage = r2Bucket(bucket);
    await storage.put(key, bytes, mime);
    await db.$executeRaw`UPDATE public.vocabulary_image_assets SET state='READY' WHERE id=${id}::uuid`;
    return { image: prefix + id, imagePreview: await storage.signedReadUrl(key, 300) };
  } catch {
    // Retain the receipt for cleanup even when the upload outcome is unknown.
    throw new HttpError(503, 'VOCABULARY_STORAGE_UNAVAILABLE', 'Chưa lưu được ảnh vào kho từ vựng. Vui lòng thử lại.');
  }
}

export async function lockVocabularyImages(tx: Prisma.TransactionClient, references: string[]) {
  const ids = imageIds(references);
  if (!ids.length) return;
  const found = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM public.vocabulary_image_assets
    WHERE id = ANY(${ids}::uuid[]) AND state='READY' ORDER BY id FOR SHARE
  `;
  if (found.length !== ids.length) throw new HttpError(409, 'VOCABULARY_IMAGE_MISSING', 'Có ảnh chưa sẵn sàng. Hãy tải lại ảnh trước khi lưu.');
}

export async function vocabularyImagePreviews(db: PrismaClient, references: string[]) {
  const ids = imageIds(references);
  if (!ids.length || !r2Configured) return new Map<string, string>();
  const assets = await db.$queryRaw<ImageAsset[]>`SELECT id, bucket, object_key FROM public.vocabulary_image_assets
    WHERE id = ANY(${ids}::uuid[]) AND state='READY'`;
  return new Map(await Promise.all(assets.map(async asset =>
    [prefix + asset.id, await r2Bucket(asset.bucket).signedReadUrl(asset.object_key, 300)] as const)));
}

export async function publishedVocabularyImage(db: PrismaClient, id: string) {
  const reference = prefix + id;
  const [asset] = await db.$queryRaw<ImageAsset[]>`
    SELECT id, bucket, object_key FROM public.vocabulary_image_assets a
    WHERE id=${id}::uuid AND state='READY' AND (
      EXISTS (SELECT 1 FROM public.vocabulary_set_drafts d JOIN public.vocabulary_sets s ON s.id=d.set_id
        WHERE s.status='PUBLISHED' AND d.content->'publishedSet'->>'cover'=${reference})
      OR EXISTS (SELECT 1 FROM public.vocabularies v JOIN public.vocabulary_set_items i ON i.vocabulary_id=v.id
        JOIN public.vocabulary_sets s ON s.id=i.set_id
        WHERE s.status='PUBLISHED' AND v.definitions->0->>'image'=${reference})
    )`;
  if (!asset) throw new HttpError(404, 'VOCABULARY_IMAGE_NOT_FOUND', 'Không tìm thấy ảnh công khai.');
  if (!r2Configured) throw new HttpError(503, 'VOCABULARY_STORAGE_UNAVAILABLE', 'Chưa cấu hình kho ảnh từ vựng.');
  return r2Bucket(asset.bucket).signedReadUrl(asset.object_key, 60);
}

const unreferenced = Prisma.sql`
  NOT EXISTS (SELECT 1 FROM public.vocabulary_set_drafts d
    WHERE d.content->>'cover' = ('vocab-image:' || a.id)
      OR d.content->'publishedSet'->>'cover' = ('vocab-image:' || a.id)
      OR d.content->'words' @> jsonb_build_array(jsonb_build_object('image', 'vocab-image:' || a.id)))
  AND NOT EXISTS (SELECT 1 FROM public.vocabularies v
    JOIN public.vocabulary_set_items i ON i.vocabulary_id=v.id
    WHERE v.definitions->0->>'image' = ('vocab-image:' || a.id))
`;

export async function pruneVocabularyImages(db: PrismaClient) {
  if (!r2Configured) throw new HttpError(503, 'VOCABULARY_STORAGE_UNAVAILABLE', 'Chưa cấu hình kho ảnh từ vựng.');
  const candidates = await db.$transaction(async tx => {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT a.id FROM public.vocabulary_image_assets a
      WHERE a.created_at < now() - interval '1 day' AND ${unreferenced}
      ORDER BY a.created_at, a.id LIMIT 25 FOR UPDATE OF a SKIP LOCKED
    `;
    if (!rows.length) return [];
    const ids = rows.map(row => row.id);
    // Recheck references after acquiring the locks. Editors share-lock these same rows.
    return tx.$queryRaw<ImageAsset[]>`
      UPDATE public.vocabulary_image_assets a SET state='DELETING'
      WHERE a.id = ANY(${ids}::uuid[]) AND ${unreferenced}
      RETURNING a.id,a.bucket,a.object_key
    `;
  });
  let removed = 0;
  for (const asset of candidates) {
    try {
      await r2Bucket(asset.bucket).remove(asset.object_key);
      await db.$executeRaw`DELETE FROM public.vocabulary_image_assets WHERE id=${asset.id}::uuid AND state='DELETING'`;
      removed++;
    } catch {
      // Keep the receipt so a subsequent run can retry.
    }
  }
  return { removed, pending: candidates.length - removed };
}
