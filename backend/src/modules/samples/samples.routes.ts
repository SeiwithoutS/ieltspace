import express, { Router, type RequestHandler } from "express";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler, HttpError } from "../../utils/http.js";
import {
  adminListSchema,
  createSampleSchema,
  parseId,
  parseInput,
  publicListSchema,
  samplePublicationSchema,
  sampleAssetPath,
  saveSampleDraftSchema,
} from "./samples.schemas.js";
import {
  createSample,
  getAdminSample,
  getPublicSample,
  listSamples,
  saveSampleDraft,
  updateSamplePublication,
} from "./samples.service.js";

import {
  getSampleAssetUrl,
  SAMPLE_AUDIO_LIMIT,
  SAMPLE_IMAGE_LIMIT,
  uploadSampleAsset,
} from "./sample-assets.service.js";

const uploadAssetQuerySchema = z.object({
  kind: z.enum(["cover", "prompt-image", "audio"]),
  originalName: z.string().min(1).max(255),
}).strict();

const assetUrlQuerySchema = z.object({
  path: sampleAssetPath,
}).strict();

function parseSampleJson(limitMiB: number): RequestHandler {
  const json = express.json({ limit: limitMiB * 1024 ** 2 });
  return (req, res, next) => {
    json(req, res, (error?: { status?: number }) => {
      if (error?.status === 413) {
        next(new HttpError(413, "SAMPLE_DOCUMENT_TOO_LARGE", `Dữ liệu gửi lên vượt giới hạn ${limitMiB} MiB.`));
        return;
      }
      next(error);
    });
  };
}

// A 100-item Speaking draft can contain 4 million UTF-16 code units before JSON escaping.
const parseDraftBody = parseSampleJson(24);
const parsePublicationBody = parseSampleJson(1);

const imageMimes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const audioMimes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/x-mpeg",
  "audio/x-mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
]);

const parseSampleAssetBody: RequestHandler = (req, res, next) => {
  parseId(req.params.id);

  const query = parseInput(uploadAssetQuerySchema, req.query);
  const audio = query.kind === "audio";

  const contentType = (req.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  const allowed = audio ? audioMimes : imageMimes;

  if (!allowed.has(contentType)) {
    next(new HttpError(
      415,
      "SAMPLE_ASSET_TYPE",
      audio
        ? "Chỉ nhận MP3, WAV hoặc M4A."
        : "Chỉ nhận JPEG, PNG hoặc WebP.",
    ));
    return;
  }

  express.raw({
    type: () => true,
    limit: audio ? SAMPLE_AUDIO_LIMIT : SAMPLE_IMAGE_LIMIT,
    inflate: false,
  })(req, res, (error?: unknown) => {
    if (error) {
      const status =
        typeof error === "object"
        && error !== null
        && "status" in error
          ? error.status
          : undefined;

      if (status === 413) {
        next(new HttpError(
          413,
          "SAMPLE_ASSET_TOO_LARGE",
          audio ? "Audio tối đa 50 MiB." : "Ảnh tối đa 5 MiB.",
        ));
        return;
      }

      if (status === 415) {
        next(new HttpError(
          415,
          "SAMPLE_ASSET_ENCODING",
          "Không nhận request upload đã nén.",
        ));
        return;
      }

      next(error);
      return;
    }

    next();
  });
};

export function createSamplesAdminRouter(prisma: PrismaClient) {
  const router = Router();
  router.use((_req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    next();
  });
  router.use(requireAuth, requireRole("ADMIN"));

  router.post(
    "/:id/assets",
    parseSampleAssetBody,
    asyncHandler(async (req, res) => {
      const id = parseId(req.params.id);
      const query = parseInput(uploadAssetQuerySchema, req.query);

      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        throw new HttpError(
          400,
          "SAMPLE_ASSET_EMPTY",
          "Không có bytes của tệp tải lên.",
        );
      }

      const asset = await uploadSampleAsset(prisma, {
        sampleId: id,
        userId: req.appUser!.id,
        kind: query.kind,
        originalName: query.originalName,
        contentType: req.get("content-type") || "",
        buffer: req.body,
      });

      res.status(201).json({ asset });
    }),
  );

  router.get(
    "/:id/assets/url",
    asyncHandler(async (req, res) => {
      const id = parseId(req.params.id);
      const { path } = parseInput(assetUrlQuerySchema, req.query);

      res.json(await getSampleAssetUrl(prisma, id, path, true));
    }),
  );

  router.get("/", asyncHandler(async (req, res) => {
    res.json(await listSamples(prisma, parseInput(adminListSchema, req.query), true));
  }));

  router.post("/", parseDraftBody, asyncHandler(async (req, res) => {
    const { document } = parseInput(createSampleSchema, req.body);
    const sample = await createSample(prisma, req.appUser!.id, document);
    res.status(201).json({ sample });
  }));

  router.get("/:id", asyncHandler(async (req, res) => {
    res.json({ sample: await getAdminSample(prisma, parseId(req.params.id)) });
  }));

  router.put("/:id/draft", parseDraftBody, asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const { revision, document } = parseInput(saveSampleDraftSchema, req.body);
    const sample = await saveSampleDraft(prisma, id, req.appUser!.id, revision, document);
    res.json({ sample });
  }));

  router.post("/:id/publication", parsePublicationBody, asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const { revision, action } = parseInput(samplePublicationSchema, req.body);
    const sample = await updateSamplePublication(prisma, id, req.appUser!.id, revision, action);
    res.json({ sample });
  }));

  return router;
}

export function createSamplesPublicRouter(prisma: PrismaClient) {
  const router = Router();
  router.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  router.get(
    "/:id/assets/url",
    asyncHandler(async (req, res) => {
      const id = parseId(req.params.id);
      const { path } = parseInput(assetUrlQuerySchema, req.query);

      res.json(await getSampleAssetUrl(prisma, id, path, false));
    }),
  );

  router.get("/", asyncHandler(async (req, res) => {
    res.json(await listSamples(prisma, parseInput(publicListSchema, req.query), false));
  }));

  router.get("/:id", asyncHandler(async (req, res) => {
    res.json({ sample: await getPublicSample(prisma, parseId(req.params.id)) });
  }));

  return router;
}
