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
    message: string,
    public details?: unknown
  ) {
    super(message);
  }

  get status(): number {
    return this.statusCode;
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
