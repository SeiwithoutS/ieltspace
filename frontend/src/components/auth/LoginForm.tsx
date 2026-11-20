import React, { useState } from 'react';
import { login, navigate, home, openEmailVerification, getAuthUser } from '../../lib/auth/auth';
import { isSupportLogin, supportDestination } from '../../lib/reports/support-navigation';
import { Field, Notice, GoogleButton } from './AuthFields';
export default function LoginForm({ callbackNotice }: {
    callbackNotice?: string;
}) { const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''); async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); if (busy)
    return; setBusy(true); setError(''); try {
    const support = isSupportLogin();
    await login(email, password);
    navigate(support ? supportDestination(getAuthUser()?.role) : home());
}
catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'EMAIL_NOT_VERIFIED') {
        openEmailVerification(email);
        return;
    }
    setError(e instanceof Error ? e.message : 'Thao tác không thành công. Vui lòng thử lại.');
}
finally {
    setBusy(false);
} } return <form className="auth-form" onSubmit={submit}><h1>Đăng nhập</h1><p>Dùng chung cho Người học, Giáo viên và Quản lý. Hệ thống tự nhận biết vai trò theo tài khoản và đưa bạn đến đúng trang.</p><GoogleButton />{callbackNotice && <p role="status">{callbackNotice}</p>}<Notice error={error}/><fieldset disabled={busy}><Field label="Email" type="email" placeholder="ban@email.com" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)}/><Field label="Mật khẩu" type="password" placeholder="Mật khẩu của bạn" autoComplete="current-password" required maxLength={128} value={password} onChange={e => setPassword(e.target.value)}/><div className="auth-forgot"><a href="ForgotPassword.dc.html">Quên mật khẩu?</a></div><button className="auth-primary">{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button></fieldset><div className="auth-switch">Chưa có tài khoản? <a href="Register.dc.html">Đăng ký miễn phí</a></div></form>; }
