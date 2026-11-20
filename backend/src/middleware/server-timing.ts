import { AsyncLocalStorage } from 'node:async_hooks';
import type { Request, Response, NextFunction } from 'express';

export type RequestTimingContext = {
  auth: number;
  db: number;
  queryCount: number;
};

export const timingStorage = new AsyncLocalStorage<RequestTimingContext>();

export function recordAuthTiming(ms: number) {
  const ctx = timingStorage.getStore();
  if (ctx) {
    ctx.auth += ms;
  }
}

export function recordDbTiming(ms: number) {
  const ctx = timingStorage.getStore();
  if (ctx) {
    ctx.db += ms;
    ctx.queryCount += 1;
  }
}

export function serverTiming(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const ctx: RequestTimingContext = { auth: 0, db: 0, queryCount: 0 };

  timingStorage.run(ctx, () => {
    const origWriteHead = res.writeHead.bind(res);
    res.writeHead = function (this: Response, statusCode: number, ...args: any[]) {
      const dur = Number(process.hrtime.bigint() - start) / 1_000_000;
      const timingParts = [
        `total;dur=${dur.toFixed(1)}`,
        `auth;dur=${ctx.auth.toFixed(1)}`,
        `db;dur=${ctx.db.toFixed(1)}`,
        `sql;desc="${ctx.queryCount} queries"`,
      ];
      try {
        res.setHeader('Server-Timing', timingParts.join(', '));
      } catch (err) {}
      return (origWriteHead as any)(statusCode, ...args);
    } as any;

    res.on('finish', () => {
      const totalMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      if (process.env.NODE_ENV !== 'production') {
        const method = req.method;
        // Query strings may contain account search terms or authentication codes.
        const [path] = (req.originalUrl || req.url).split('?', 1);
        const status = res.statusCode;
        console.log(
          `[HTTP] ${method} ${path} ${status} ${totalMs.toFixed(1)}ms ` +
            `(auth: ${ctx.auth.toFixed(1)}ms, db: ${ctx.db.toFixed(1)}ms, queries: ${ctx.queryCount})`
        );
      }
    });

    next();
  });
}
