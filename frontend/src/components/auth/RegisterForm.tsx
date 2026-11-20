import React, { useState } from 'react';
import { openEmailVerification, register } from '../../lib/auth/auth';
import { Field, Notice, GoogleButton } from './AuthFields';
export default function RegisterForm() { const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''); async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); if (busy)
    return; setError(''); if (password !== confirm) {
    setError('Hai mật khẩu không khớp.');
    return;
} setBusy(true); try {
    await register(email, password, name);
    setPassword('');
    setConfirm('');
    openEmailVerification(email, true);
}
catch (e) {
    setError(e instanceof Error ? e.message : 'Thao tác không thành công. Vui lòng thử lại.');
}
finally {
    setBusy(false);
} } return <form className="auth-form" onSubmit={submit}><h1>Tạo tài khoản</h1><p>Tài khoản đăng ký công khai luôn là Người học. Đăng ký bằng email cần xác minh trước lần đăng nhập đầu tiên.</p><GoogleButton register/><Notice error={error}/><fieldset disabled={busy}><Field label="Họ và tên" placeholder="Nguyễn Minh Anh" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)}/><Field label="Email" placeholder="ban@email.com" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)}/><Field label="Mật khẩu" placeholder="Tối thiểu 8 ký tự" hint="Tối thiểu 8 ký tự" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)}/><Field label="Nhập lại mật khẩu" placeholder="Nhập lại mật khẩu" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)}/><button className="auth-primary">{busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}</button></fieldset><div className="auth-switch">Đã có tài khoản? <a href="Login.dc.html">Đăng nhập</a></div></form>; }
