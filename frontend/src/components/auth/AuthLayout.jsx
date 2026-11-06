import React from 'react';
import AuthHero from './AuthHero';
import './auth.css';
export default function AuthLayout({children,card=false}){return card?<main className="auth-standalone"><section className="auth-card">{children}</section></main>:<main className="auth-shell"><AuthHero/><section className="auth-panel"><a className="auth-back" href="Main.dc.html"><span aria-hidden="true">←</span> Về trang chủ</a><div className="auth-center">{children}</div></section></main>;}
