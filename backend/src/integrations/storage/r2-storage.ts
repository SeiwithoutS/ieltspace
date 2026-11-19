import { AwsClient } from 'aws4fetch';
import { env } from '../../config.js';

export class R2StorageError extends Error {
  constructor(readonly operation: string, readonly status?: number) {
    super(`R2 ${operation} failed${status ? ` (${status})` : ''}`);
  }
}

export const r2Configured = Boolean(env.R2_ENDPOINT && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY);
const client = env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY ? new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  service: 's3', region: 'auto', retries: 0,
}) : undefined;

function objectUrl(bucket: string, key: string) {
  const parts = key.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) {
    throw new TypeError('Invalid R2 object key');
  }
  return new URL(`/${bucket}/${parts.map(encodeURIComponent).join('/')}`, env.R2_ENDPOINT);
}

export function r2Bucket(bucket: string) {
  async function send(method: 'PUT' | 'DELETE', key: string, options: RequestInit = {}) {
    if (!client || !r2Configured) throw new R2StorageError(method);
    const url = objectUrl(bucket, key);
    let response: Response;
    try {
      response = await client.fetch(url, { ...options, method, redirect: 'error', signal: AbortSignal.timeout(15_000) });
    } catch {
      throw new R2StorageError(method);
    }
    await response.body?.cancel();
    if (!response.ok && !(method === 'DELETE' && response.status === 404)) {
      throw new R2StorageError(method, response.status);
    }
  }

  return {
    put(key: string, bytes: Buffer, contentType: string) {
      return send('PUT', key, { body: new Blob([new Uint8Array(bytes)]), headers: { 'Content-Type': contentType } });
    },
    remove(key: string) {
      return send('DELETE', key);
    },
    async signedReadUrl(key: string, seconds: number) {
      if (!client || !r2Configured) throw new R2StorageError('SIGN');
      if (!Number.isInteger(seconds) || seconds < 1 || seconds > 300) {
        throw new RangeError('Use a read URL lifetime from 1 to 300 seconds');
      }
      const url = objectUrl(bucket, key);
      url.searchParams.set('X-Amz-Expires', String(seconds));
      return (await client.sign(url, { method: 'GET', aws: { signQuery: true } })).url;
    },
  };
}

export const recordingsBucket = r2Bucket(env.R2_RECORDINGS_BUCKET);
