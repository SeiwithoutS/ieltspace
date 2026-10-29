import React, { useEffect, useState } from 'react';
import AccountMenu from '../components/account/AccountMenu';
import { pages, type PageName } from './pages';
const initialRoute = location.hash.slice(1);
const initialContext = /^(Admin|Question)/.test(initialRoute) ? 'AdminHome' : /^Teacher/.test(initialRoute) ? 'TeacherHome' : /^(Student|Profile$|MyWS$|Vocab$|Flashcard$)/.test(initialRoute) ? 'StudentHome' : sessionStorage.getItem('ieltspace-context') || 'StudentHome';
sessionStorage.setItem('ieltspace-context', initialContext);
(window as any).__dcFrom = initialContext;
const aliases: Record<string, string> = {AvatarMenu:'Profile', ResultsHistory:'StudentHome', QTPractice:'PracticeLibrary', AdminContent:'AdminSamples'};
function resolve(name: string): PageName { return (aliases[name] || name) in pages ? (aliases[name] || name) as PageName : 'Main'; }
export default function App() {
 const [page, setPage] = useState<PageName>(() => resolve(location.hash.slice(1)));
 const [revision, setRevision] = useState(0);
 const [menu, setMenu] = useState(false);
 useEffect(() => {
  let context = sessionStorage.getItem('ieltspace-context') || (/^Admin|^Question/.test(page) ? 'AdminHome' : /^Teacher/.test(page) ? 'TeacherHome' : 'StudentHome'), previous = page;
  (window as any).__dcFrom = context;
  const go = (name: string) => { const next = resolve(name); (window as any).__dcFrom = /^(Notifications|StaffProfile)$/.test(next) ? context : previous;
   if (/^(Admin|Question)/.test(next)) context = 'AdminHome'; else if (/^Teacher/.test(next)) context = 'TeacherHome'; else if (!/^(Notifications|StaffProfile|Main|Login|Register|ForgotPassword|CheckEmail|ResetPassword)$/.test(next)) context = 'StudentHome';
   sessionStorage.setItem('ieltspace-context',context); previous = next; setMenu(false); setPage(next); window.scrollTo(0,0);
  };
  const pop = () => { const name=location.hash.slice(1); if(name in pages || name in aliases) go(name); };
  const click = (e: MouseEvent) => {
   const target = e.target instanceof Element ? e.target : null;
   const theme = target?.closest('[data-theme-toggle]');
   if (theme) { e.preventDefault(); const dark = theme.getAttribute('data-theme-toggle') === 'dark'; document.documentElement.classList.toggle('dark', dark); try { localStorage.setItem('ieltspace-app',JSON.stringify({dark})); } catch {} setRevision(v=>v+1); return; }
   const a = target?.closest('a[href]');
   if(a?.getAttribute('href') === 'AvatarMenu.dc.html') { e.preventDefault(); setMenu(v=>!v); return; }
   if(a?.getAttribute('href') === '#') { e.preventDefault(); return; }
   const match = /^([A-Za-z0-9_-]+)\.dc\.html(#.*)?$/.exec(a?.getAttribute('href') || '');
   if (match && !e.defaultPrevented) { e.preventDefault(); history.pushState(null,'','#'+resolve(match[1])); go(match[1]); if(match[2]) setTimeout(()=>document.getElementById(match[2].slice(1))?.scrollIntoView(),100); }
  };
  document.addEventListener('click',click,true); window.addEventListener('popstate',pop);
  return () => {document.removeEventListener('click',click,true);window.removeEventListener('popstate',pop);};
 }, []);
 const Page = pages[page];
 return <><React.Suspense fallback={<div role="status" style={{padding:24,fontFamily:"Inter, sans-serif"}}>Đang tải…</div>}>{React.createElement(Page as React.ComponentType<any>, {key:page, themeRevision:revision})}</React.Suspense>{menu && <AccountMenu onClose={()=>setMenu(false)} />}</>;
}
