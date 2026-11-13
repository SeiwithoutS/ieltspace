import { getAccessToken, refresh } from './auth';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const base = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

export type ApiFetchOptions = {
  method?: string;
  json?: unknown;
  body?: BodyInit | null;
  headers?: Record<string, string>;
};

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {},
  retried = false
): Promise<T> {
  const method = options.method || 'GET';
  const headers: Record<string, string> = { ...options.headers };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${cleanPath}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      credentials: 'include',
    });
  } catch (_netErr) {
    throw new ApiError(0, 'NETWORK_ERROR', 'Không thể kết nối. Vui lòng thử lại.');
  }

  if (res.status === 401 && !retried) {
    try {
      await refresh();
      return await apiFetch<T>(path, options, true);
    } catch {
      // If refresh failed, let 401 proceed
    }
  }

  if (res.status === 204) {
    return null as T;
  }

  let data: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const code = data?.code || 'API_ERROR';
    const message = data?.message || 'Lỗi từ máy chủ. Vui lòng thử lại.';
    const details = data?.details;
    throw new ApiError(res.status, code, message, details);
  }

  return data as T;
}

