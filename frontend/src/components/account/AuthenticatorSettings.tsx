import { useEffect, useState } from 'react';
import { finishAuthenticatorSetup } from '../../lib/auth/auth';
import { enrollAuthenticator, getAuthenticatorStatus } from '../../lib/auth/profile-api';

const button = 'rounded-full border border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-transparent px-4 py-2 text-sm font-semibold text-inherit disabled:opacity-50';

export default function AuthenticatorSettings({ temporaryPassword }: { temporaryPassword: boolean }) {
  const [enabled, setEnabled] = useState<boolean>();
  const [setup, setSetup] = useState<Awaited<ReturnType<typeof enrollAuthenticator>>>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    void getAuthenticatorStatus().then(status => {
      if (mounted) setEnabled(status.enabled);
    }).catch((error: Error) => {
      if (mounted) setError(error.message);
    });
    return () => { mounted = false; };
  }, []);

  async function begin() {
    setBusy(true);
    setError('');
    try {
      setSetup(await enrollAuthenticator());
      setCode('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chưa tạo được mã QR.');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!setup || busy) return;
    setBusy(true);
    setError('');
    try {
      await finishAuthenticatorSetup(setup.factorId, code);
      setEnabled(true);
      setSetup(undefined);
      setCode('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chưa xác minh được mã.');
    } finally {
      setBusy(false);
    }
  }

  return <section aria-label="Google Authenticator" className="grid gap-2 border-0 border-t border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] pt-4">
    <h3 className="m-0 text-sm font-semibold">Google Authenticator</h3>
    {enabled ? <p className="m-0 text-sm" role="status">Đã bật. Dùng mã 6 số khi xác nhận thao tác liên quan đến Quản lý.</p>
      : <p className="m-0 text-sm">{temporaryPassword
        ? 'Hãy đổi mật khẩu tạm trước khi thiết lập xác thực.'
        : 'Thiết lập ứng dụng xác thực để xác nhận các thao tác liên quan đến Quản lý.'}</p>}
    {!enabled && !setup && !temporaryPassword && (enabled === false || error) &&
      <button type="button" className={`${button} justify-self-start`} disabled={busy} onClick={() => void begin()}>Thiết lập</button>}
    {setup && <form className="grid justify-items-start gap-2" onSubmit={event => { event.preventDefault(); void verify(); }}>
      <p className="m-0 text-sm">Mở Google Authenticator, quét mã QR rồi nhập mã 6 số.</p>
      <img src={setup.qrCode} alt="Mã QR thiết lập Google Authenticator" className="h-40 w-40" />
      <label className="grid gap-1 text-sm">
        Mã Google Authenticator
        <input className="w-40 rounded-lg border border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-transparent px-3 py-2 text-inherit"
          inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required disabled={busy}
          value={code} onChange={event => setCode(event.currentTarget.value.replace(/\D/g, ''))} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={button} disabled={busy || code.length !== 6}>Xác minh và bật</button>
        <button type="button" className={button} disabled={busy} onClick={() => { setSetup(undefined); setCode(''); setError(''); }}>Hủy</button>
      </div>
    </form>}
    {error && <p role="alert" className="m-0 text-sm text-[var(--attempt-text-c0412a,#C0412A)]">{error}</p>}
  </section>;
}
