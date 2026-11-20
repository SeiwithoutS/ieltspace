import { getAccessToken, recheckAuthProfile, refresh } from '../auth/auth';

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
export const apiUrl = (path: string) => base + (path.startsWith('/') ? path : '/' + path);

function isTokenExpiringSoon(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // Làm mới nếu còn dưới 60 giây hoặc đã hết hạn
    return payload.exp * 1000 - Date.now() < 60_000;
  } catch {
    return false;
  }
}

export type ApiFetchOptions = {
  method?: string;
  auth?: boolean;
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
  const authenticated = options.auth !== false;
  const headers: Record<string, string> = { ...options.headers };

  let token = authenticated ? getAccessToken() : '';
  if (token && isTokenExpiringSoon(token) && !retried) {
    try {
      await refresh();
      token = getAccessToken();
    } catch {
      // Tiếp tục với token hiện tại nếu refresh gặp lỗi tạm thời
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  const url = apiUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      credentials: authenticated ? 'include' : 'omit',
    });
  } catch (_netErr) {
    throw new ApiError(0, 'NETWORK_ERROR', 'Không thể kết nối. Vui lòng thử lại.');
  }

  if (authenticated && res.status === 401 && !retried) {
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
    if (authenticated && res.status === 403 &&
      (code === 'ACCOUNT_UNAVAILABLE' || code === 'PROFILE_NOT_FOUND' || code === 'FORBIDDEN')) {
      void recheckAuthProfile();
    }
    const message = data?.message || 'Lỗi từ máy chủ. Vui lòng thử lại.';
    const details = data?.details;
    throw new ApiError(res.status, code, message, details);
  }

  return data as T;
}

