import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export function asyncHandler(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
