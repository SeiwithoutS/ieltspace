import { PrismaClient } from "@prisma/client";
import { timingStorage } from "../middleware/server-timing.js";

const shouldLogQueries = process.env.LOG_QUERIES === "1";

const basePrisma = new PrismaClient(
  shouldLogQueries
    ? {
        log: [{ emit: "event", level: "query" }],
      }
    : undefined
);

if (shouldLogQueries) {
  (basePrisma as any).$on("query", (e: { query: string; duration: number }) => {
    const ctx = timingStorage.getStore();
    if (ctx) {
      ctx.queryCount += 1;
      ctx.db += typeof e.duration === "number" ? e.duration : 0;
    }
    console.log(`[SQL ${e.duration}ms] ${e.query}`);
  });
}

export const prisma = (shouldLogQueries
  ? basePrisma
  : basePrisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const ctx = timingStorage.getStore();
            if (!ctx) {
              return query(args);
            }
            ctx.queryCount += 1;
            const start = process.hrtime.bigint();
            try {
              return await query(args);
            } finally {
              const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
              ctx.db += ms;
            }
          },
        },
      },
    })) as unknown as PrismaClient;

// Mở sẵn kết nối DB khi khởi động
if (process.env.NODE_ENV !== "test") {
  prisma.$queryRawUnsafe("SELECT 1").catch(() => {});
}
