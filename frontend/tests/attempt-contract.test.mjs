import test from "node:test";
import assert from "node:assert/strict";
import { apiLimitMinutes } from "../src/lib/attempts/time-limits.ts";

// Backend (zod) chỉ nhận limitMinutes là số nguyên 1..30 hoặc null.
const valid = (v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 30);

test("create-attempt limitMinutes is always an integer 1..30 or null", () => {
  for (const mode of ["real", "practice"])
    for (const limit of [0, 1, 15, 30, 31, 60, -3, 2.5, NaN, undefined])
      assert.ok(valid(apiLimitMinutes(mode, limit)), mode + " " + limit);
  assert.equal(apiLimitMinutes("practice", 0), null); // Không giới hạn
  assert.equal(apiLimitMinutes("practice", 20), 20);
  assert.equal(apiLimitMinutes("real", 15), null); // Thi thật: giờ do máy chủ tính
});
