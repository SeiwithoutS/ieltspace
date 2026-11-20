import { takeRecoveryToken } from '../../lib/auth/auth-links';
import React, { useState, useEffect } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import { Field, Notice } from '../../components/auth/AuthFields';
import { resetPassword } from '../../lib/auth/auth';
export default function ResetPassword({ callbackNotice }: {
    callbackNotice?: string;
}) { const [token] = useState(takeRecoveryToken), [password, setPassword] = useState(''), [confirm, setConfirm] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
 const [needsCode, setNeedsCode] = useState(false), [code, setCode] = useState('');
 useEffect(() => { history.replaceState(null, '', location.pathname + '#ResetPassword'); }, []); async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); if (busy || !token)
    return; setError(''); if (password !== confirm) {
    setError('Hai mật khẩu không khớp.');
    return;
} setBusy(true); try {
    const result = await resetPassword(token, password, needsCode ? code : undefined);
    setMessage(result.message);
    setPassword('');
    setConfirm('');
    setCode('');
    setNeedsCode(false);
}
catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'AUTHENTICATOR_REQUIRED') setNeedsCode(true);
    setError(e instanceof Error ? e.message : 'Thao tác không thành công. Vui lòng thử lại.');
}
finally {
    setBusy(false);
} } return <AuthLayout card><form className="auth-form" onSubmit={submit}><h1>Đặt mật khẩu mới</h1><p>Liên kết đặt lại chỉ sử dụng được một lần.</p><Notice error={!token ? (callbackNotice || 'Hãy mở liên kết đặt lại từ email mới nhất.') : error} message={message}/><fieldset disabled={busy || !token || !!message}><Field label="Mật khẩu mới" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)}/><Field label="Nhập lại mật khẩu" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)}/>
 {needsCode && <Field label="Mã Google Authenticator" type="text" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} />}
 <button className="auth-primary">{busy ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}</button></fieldset><div className="auth-switch"><a href="Login.dc.html">Quay lại đăng nhập</a></div></form></AuthLayout>; }
