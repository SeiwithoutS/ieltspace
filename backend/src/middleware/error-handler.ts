import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof HttpError) {
    const body: Record<string, unknown> = {
      message: error.message,
      code: error.code,
    };
    if (error.details !== undefined) {
      body.details = error.details;
    }
    res.status(error.statusCode).json(body);
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Thông tin không hợp lệ. Kiểm tra email, họ tên và mật khẩu (8–128 ký tự).',
    });
    return;
  }
  const bad = error instanceof SyntaxError && 'status' in error && error.status === 400;
  console.error('Request failed:', error instanceof Error ? error.name : 'Unknown error');
  res.status(bad ? 400 : 500).json({
    message: bad ? 'JSON không hợp lệ.' : 'Lỗi máy chủ. Vui lòng thử lại.',
  });
};
