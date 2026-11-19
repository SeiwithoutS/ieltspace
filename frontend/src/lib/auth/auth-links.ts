// Parse email callback fragments without logging or persisting credentials.
export function parseAuthLink(pathname: string, hash: string) {
  const fragment = hash.replace(/^#/, '');
  const legacyRecovery = fragment.startsWith('ResetPassword?');
  const params = new URLSearchParams(legacyRecovery ? fragment.split('?')[1] : fragment);
  if ((pathname === '/reset-password' && (!fragment || fragment.includes('=') || fragment === 'ResetPassword')) || legacyRecovery) {
    const type = params.get('type');
    return {
      page: 'ResetPassword',
      token: (!type || type === 'recovery') ? params.get('token_hash') || '' : '',
      notice: params.has('error') || params.has('error_code')
        ? 'Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu email mới.' : '',
    };
  }
  if (params.has('error') || params.has('error_code')) {
    return { page: 'Login', token: '', notice: 'Liên kết xác minh không hợp lệ hoặc đã hết hạn. Hãy kiểm tra email mới nhất.' };
  }
  if (params.has('access_token')) {
    return { page: 'Login', token: '', notice: 'Đã nhận phản hồi từ liên kết email. Hãy đăng nhập để tiếp tục.' };
  }
  return null;
}

const callback = parseAuthLink(location.pathname, location.hash);
let recoveryToken = callback?.token || '';
export const emailCallback = callback ? { page: callback.page, notice: callback.notice } : null;
if (callback) history.replaceState(null, '', `${location.pathname}#${callback.page}`);
export function takeRecoveryToken() {
  const token = recoveryToken;
  recoveryToken = '';
  return token;
}
