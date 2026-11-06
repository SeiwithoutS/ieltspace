import {emailCallback} from '../lib/auth-links';
import {useAuth,refresh,logout,home,navigate} from '../lib/auth';
import React, { useEffect, useState } from 'react';
import AccountMenu from '../components/account/AccountMenu';
import { pages, type PageName } from './pages';
const googleCallback = location.pathname === '/auth/callback' && !location.hash;
const googleError = new URLSearchParams(location.search).get('auth_error');
const googleNotice = googleError === 'account_unavailable' ? 'Tài khoản không được phép truy cập hoặc thiếu hồ sơ.' : googleError ? 'Không thể hoàn tất đăng nhập Google. Hãy thử lại.' : '';
if(googleError) history.replaceState(null,'','/login#Login');
const initialRoute = location.hash.slice(1);
const initialContext = /^(Admin|Question)/.test(initialRoute) ? 'AdminHome' : /^Teacher/.test(initialRoute) ? 'TeacherHome' : /^(Student|Profile$|MyWS$|Vocab$|Flashcard$)/.test(initialRoute) ? 'StudentHome' : sessionStorage.getItem('ieltspace-context') || 'StudentHome';
sessionStorage.setItem('ieltspace-context', initialContext);
(window as any).__dcFrom = initialContext;
const aliases: Record<string, string> = {AvatarMenu:'Profile', ResultsHistory:'StudentHome', QTPractice:'PracticeLibrary', AdminContent:'AdminSamples'};
function resolve(name: string): PageName { name=name.split('?')[0]; return (aliases[name] || name) in pages ? (aliases[name] || name) as PageName : 'Main'; }
export default function App() {
 const auth=useAuth();
 useEffect(()=>{void refresh().catch(()=>{});},[]);

 const [page, setPage] = useState<PageName>(() => resolve(location.hash.slice(1) || (location.pathname === "/login" ? "Login" : "Main")));
 useEffect(()=>{if(googleCallback&&auth.ready&&!auth.error){history.replaceState(null,'','/');navigate(auth.user?home():'Login');}},[auth.ready,auth.user,auth.error]);
 const [revision, setRevision] = useState(0);
 const [menu, setMenu] = useState(false);
 useEffect(() => {
  let context = sessionStorage.getItem('ieltspace-context') || (/^Admin|^Question/.test(page) ? 'AdminHome' : /^Teacher/.test(page) ? 'TeacherHome' : 'StudentHome'), previous = page;
  (window as any).__dcFrom = context;
  const go = (name: string) => { const next = resolve(name); (window as any).__dcFrom = /^(Notifications|StaffProfile)$/.test(next) ? context : previous;
   if (/^(Admin|Question)/.test(next)) context = 'AdminHome'; else if (/^Teacher/.test(next)) context = 'TeacherHome'; else if (!/^(Notifications|StaffProfile|Main|Login|Register|ForgotPassword|CheckEmail|ResetPassword)$/.test(next)) context = 'StudentHome';
   sessionStorage.setItem('ieltspace-context',context); previous = next; setMenu(false); setPage(next); window.scrollTo(0,0);
  };
  const pop = () => { const name=location.hash.slice(1).split('?')[0]; if(name in pages || name in aliases) go(name); };
  const click = (e: MouseEvent) => {
   const target = e.target instanceof Element ? e.target : null;
   const theme = target?.closest('[data-theme-toggle]');
   if (theme) { e.preventDefault(); const dark = theme.getAttribute('data-theme-toggle') === 'dark'; document.documentElement.classList.toggle('dark', dark); try { localStorage.setItem('ieltspace-app',JSON.stringify({dark})); } catch {} setRevision(v=>v+1); return; }
   const a = target?.closest('a[href]');
   const authAnchor = a?.getAttribute('href');
   if(authAnchor === '#dang-ky' || authAnchor === '#dang-nhap') { e.preventDefault(); e.stopPropagation(); const route=authAnchor === '#dang-ky' ? 'Register' : 'Login'; history.pushState(null,'','#'+route); go(route); return; }
   if(a?.textContent?.includes('Đăng xuất')){e.preventDefault();e.stopPropagation();void logout().catch(err=>window.alert(err.message));return;}

   if(a?.getAttribute('href') === 'AvatarMenu.dc.html') { e.preventDefault(); setMenu(v=>!v); return; }
   if(a?.getAttribute('href') === '#') { e.preventDefault(); return; }
   const match = /^([A-Za-z0-9_-]+)\.dc\.html(#.*)?$/.exec(a?.getAttribute('href') || '');
   if (match && !e.defaultPrevented) { e.preventDefault(); history.pushState(null,'','#'+resolve(match[1])); go(match[1]); if(match[2]) setTimeout(()=>document.getElementById(match[2].slice(1))?.scrollIntoView(),100); }
  };
  document.addEventListener('click',click,true); window.addEventListener('popstate',pop);
  return () => {document.removeEventListener('click',click,true);window.removeEventListener('popstate',pop);};
 }, []);
 const publicPage=['Main','Login','Register','ForgotPassword','CheckEmail','ResetPassword'].includes(page);
 const denied=(!auth.user&&!publicPage)||(auth.user?.role!=='ADMIN'&&/^(Admin|Question)/.test(page))||(auth.user?.role!=='TEACHER'&&/^Teacher/.test(page));
 useEffect(()=>{if(auth.ready&&denied&&!auth.error)navigate(auth.user?home():'Login');},[auth.ready,auth.user,page,denied,auth.error]);
 if(!auth.ready)return <p role="status">Đang kiểm tra phiên đăng nhập…</p>;
 if(auth.error)return <div role="alert"><p>{auth.error}</p><button onClick={()=>{void refresh().catch(()=>{});}}>Thử lại</button></div>;
 if(denied)return <p>Đang chuyển trang…</p>;
 const Page = pages[page];
 return <><React.Suspense fallback={<div role="status" style={{padding:24,fontFamily:"Inter, sans-serif"}}>Đang tải…</div>}>{React.createElement(Page as React.ComponentType<any>, {key:page, themeRevision:revision, callbackNotice:googleNotice || emailCallback?.notice})}</React.Suspense>{menu && <AccountMenu onClose={()=>setMenu(false)} />}</>;
}
