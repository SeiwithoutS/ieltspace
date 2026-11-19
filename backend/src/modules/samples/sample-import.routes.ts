import express, { Router, type RequestHandler } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler, HttpError } from "../../utils/http.js";
import { parseInput } from "./samples.schemas.js";
import { confirmSampleImport, previewSampleImport, sampleImportConfirmSchema, sampleImportWorkbookSchema } from "./sample-import.service.js";

const json = express.json({ limit: "1mb", inflate: false });
const parseWorkbook: RequestHandler = (req, res, next) => {
  res.set("Cache-Control", "private, no-store");
  if (!req.is("application/json")) {
    next(new HttpError(415, "SAMPLE_IMPORT_TYPE", "Dữ liệu Excel cần được gửi dưới dạng JSON."));
    return;
  }
  json(req, res, (error?: { status?: number }) => {
    if (error?.status === 413) {
      next(new HttpError(413, "SAMPLE_IMPORT_TOO_LARGE", "Dữ liệu vượt quá 1 MiB. Hãy chia thành các tệp nhỏ hơn."));
    } else if (error?.status === 415) {
      next(new HttpError(415, "SAMPLE_IMPORT_TYPE", "Request nhập Excel cần gửi JSON UTF-8 không nén."));
    } else {
      next(error);
    }
  });
};

export function createSampleImportRouter(prisma: PrismaClient) {
  const router = Router();
  const admin = requireRole("ADMIN");
  router.post("/preview", requireAuth, admin, parseWorkbook, (req, res) => {
    res.json(previewSampleImport(parseInput(sampleImportWorkbookSchema, req.body)));
  });
  router.post("/confirm", requireAuth, admin, parseWorkbook, asyncHandler(async (req, res) => {
    const { requestKey, workbook } = parseInput(sampleImportConfirmSchema, req.body);
    const result = await confirmSampleImport(prisma, req.appUser!.id, requestKey, workbook);
    res.status(result.replayed ? 200 : 201).json(result);
  }));
  return router;
}
