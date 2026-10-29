import type { ErrorRequestHandler } from 'express';
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) { next(error); return; }
  console.error(error);
  const malformedJson = error instanceof SyntaxError && 'status' in error && error.status === 400;
  res.status(malformedJson ? 400 : 500).json({ message: malformedJson ? 'JSON không hợp lệ.' : 'Lỗi máy chủ.' });
};
