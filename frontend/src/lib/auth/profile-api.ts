import { updateAuthProfile, type AuthUser } from './auth';
import { apiFetch } from '../shared/api';

const profilePath = '/auth/me';

export function getAvatarOptions() {
  return apiFetch<{ maxBytes: number }>(`${profilePath}/avatar-options`);
}

export async function saveDisplayName(displayName: string) {
  const { user } = await apiFetch<{ user: AuthUser }>(profilePath, { method: 'PATCH', json: { displayName } });
  await updateAuthProfile(user);
}

export async function saveAvatar(file: File) {
  const { user } = await apiFetch<{ user: AuthUser }>(`${profilePath}/avatar`, {
    method: 'PUT', body: file, headers: { 'Content-Type': file.type },
  });
  await updateAuthProfile(user);
}

export async function deleteAvatar() {
  const { user } = await apiFetch<{ user: AuthUser }>(`${profilePath}/avatar`, { method: 'DELETE' });
  await updateAuthProfile(user);
}

let avatarRequest: { path: string; validUntil: number; result: Promise<string | null> } | undefined;

export function getAvatarUrl(path: string) {
  if (avatarRequest?.path === path && avatarRequest.validUntil > Date.now()) return avatarRequest.result;
  const result = apiFetch<{ url: string | null }>(`${profilePath}/avatar`)
    .then(({ url }) => {
      if (!url && avatarRequest?.result === result) avatarRequest = undefined;
      return url;
    })
    .catch((error: unknown) => {
      if (avatarRequest?.result === result) avatarRequest = undefined;
      throw error;
    });
  avatarRequest = { path, validUntil: Date.now() + 4 * 60 * 1000, result };
  return result;
}

export function getPasswordOptions() {
  return apiFetch<{ google: boolean; canSendSetupEmail: boolean; authenticator: boolean }>(`${profilePath}/password-options`);
}

export function getAuthenticatorStatus() {
  return apiFetch<{ enabled: boolean }>(`${profilePath}/authenticator`);
}

export function enrollAuthenticator() {
  return apiFetch<{ factorId: string; qrCode: string }>(`${profilePath}/authenticator/enroll`, { method: 'POST' });
}

export function sendPasswordSetupEmail() {
  return apiFetch<{ message: string }>(`${profilePath}/password/setup`, { method: 'POST' });
}
