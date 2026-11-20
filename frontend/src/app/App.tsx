import DesktopOnly from "../components/attempts/DesktopOnly";
import {emailCallback} from '../lib/auth/auth-links';
import {useAuth,refresh,logout,home,navigate,getAuthUser,recheckAuthProfile} from '../lib/auth/auth';
import { sampleHashReplaced } from "../lib/samples/sample-navigation";
import { canNavigate } from "../lib/shared/navigation-guard";
import React, { useEffect, useState } from 'react';
import AttemptSession from "../components/attempts/AttemptSession";
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
const publicSamplePages: readonly PageName[] = ["SampleLibrary", "SampleWriting", "SampleSpeaking"];
const publicLibraryPages: readonly PageName[] = [
 ...publicSamplePages, "FullTests", "ExamDetail", "PracticeLibrary", "PracticeWS", "Vocab",
];
const learnerStudyPages: readonly PageName[] = ['Profile', 'Flashcard', 'StudentLanding', 'StudentHome'];
function resolve(name: string): PageName { name=name.split('?')[0]; return (aliases[name] || name) in pages ? (aliases[name] || name) as PageName : 'Main'; }
export default function App() {
 const auth=useAuth();
 useEffect(()=>{void refresh().catch(()=>{});},[]);
 useEffect(() => {
  if (!auth.user?.id) return;
  function checkVisibleSession() {
   if (document.visibilityState === 'visible') void recheckAuthProfile();
  }
  const timer = window.setInterval(checkVisibleSession, 60_000);
  document.addEventListener('visibilitychange', checkVisibleSession);
  return () => {
   window.clearInterval(timer);
   document.removeEventListener('visibilitychange', checkVisibleSession);
  };
 }, [auth.user?.id]);

 const [page, setPage] = useState<PageName>(() => resolve(location.hash.slice(1) || (location.pathname === "/login" ? "Login" : "Main")));
 const [routeHash, setRouteHash] = useState(() => location.hash);
 useEffect(()=>{if(googleCallback&&auth.ready&&!auth.error){history.replaceState(null,'','/');navigate(auth.user?home():'Login');}},[auth.ready,auth.user,auth.error]);
 const [revision, setRevision] = useState(0);
 const [menu, setMenu] = useState(false);
 useEffect(() => {
  let context = sessionStorage.getItem('ieltspace-context') || (/^Admin|^Question/.test(page) ? 'AdminHome' : /^Teacher/.test(page) ? 'TeacherHome' : 'StudentHome'), previous = page;
  let acceptedHash = location.hash;
  let restoring = false;
  const historyIndex = (): number | undefined => {
   const index: unknown = history.state?.ieltspaceRouteIndex;
   return typeof index === "number" ? index : undefined;
  };
  let acceptedIndex = historyIndex() ?? 0;
  history.replaceState({ ...history.state, ieltspaceRouteIndex: acceptedIndex }, "");
  (window as any).__dcFrom = context;
  const go = (name: string) => { const next = resolve(name); (window as any).__dcFrom = /^(Notifications|StaffProfile)$/.test(next) ? context : previous;
   if (/^(Admin|Question)/.test(next)) context = 'AdminHome'; else if (/^Teacher/.test(next)) context = 'TeacherHome'; else if (!/^(Notifications|StaffProfile|Main|Login|Register|ForgotPassword|CheckEmail|ResetPassword)$/.test(next)) context = 'StudentHome';
   acceptedHash = location.hash;
   setRouteHash(acceptedHash);
   sessionStorage.setItem('ieltspace-context',context); previous = next; setMenu(false); setPage(next); window.scrollTo(0,0);
  };
  const allowNavigation = () => getAuthUser()?.role !== "ADMIN" || canNavigate();
  const pushRoute = (route: string) => {
   if ("#" + route === acceptedHash || !allowNavigation()) return false;
   history.pushState({ ieltspaceRouteIndex: ++acceptedIndex }, "", "#" + route);
   go(route);
   return true;
  };
  const pop = () => {
   if (location.hash === acceptedHash) {
    restoring = false;
    return;
   }
   if (restoring) return;
   const route = location.hash.slice(1);
   const name = route.split("?")[0];
   if (name && !(name in pages || name in aliases)) return;
   const nextIndex = historyIndex();
   if (!allowNavigation()) {
    if (nextIndex !== undefined && nextIndex !== acceptedIndex) {
     restoring = true;
     history.go(acceptedIndex - nextIndex);
    } else {
     history.replaceState({ ...history.state, ieltspaceRouteIndex: acceptedIndex }, "",
      acceptedHash || location.pathname + location.search);
    }
    return;
   }
   acceptedIndex = nextIndex ?? acceptedIndex + 1;
   if (nextIndex === undefined) {
    history.replaceState({ ...history.state, ieltspaceRouteIndex: acceptedIndex }, "");
   }
   go(route || (location.pathname === "/login" ? "Login" : "Main"));
  };
  const syncSavedSample = () => {
   acceptedHash = location.hash;
   setRouteHash(acceptedHash);
  };
  const click = (e: MouseEvent) => {
   const target = e.target instanceof Element ? e.target : null;
   const theme = target?.closest('[data-theme-toggle]');
   if (theme) { e.preventDefault(); const dark = theme.getAttribute('data-theme-toggle') === 'dark'; document.documentElement.classList.toggle('dark', dark); try { localStorage.setItem('ieltspace-app',JSON.stringify({dark})); } catch {} setRevision(v=>v+1); return; }
   // Header dropdowns open on hover/focus; on touch there is no hover, so the first tap opens the menu instead of navigating.
   const openDd = document.querySelector('.bu-dd.is-open');
   const ddTrigger = target?.closest('.bu-dd > a[aria-haspopup]');
   if (openDd && !openDd.contains(target)) { openDd.classList.remove('is-open'); openDd.querySelector(':scope > a')?.setAttribute('aria-expanded','false'); }
   if (ddTrigger && lastPointer !== 'mouse' && lastPointer !== 'keyboard' && !ddTrigger.parentElement!.classList.contains('is-open')) {
    e.preventDefault(); e.stopPropagation(); ddTrigger.parentElement!.classList.add('is-open'); ddTrigger.setAttribute('aria-expanded','true'); return;
   }
   const a = target?.closest('a[href]');
   const authAnchor = a?.getAttribute('href');
   if(authAnchor === '#dang-ky' || authAnchor === '#dang-nhap') { e.preventDefault(); e.stopPropagation(); pushRoute(authAnchor === '#dang-ky' ? 'Register' : 'Login'); return; }
   if(a?.textContent?.includes('Đăng xuất')){e.preventDefault();e.stopPropagation();if(allowNavigation()) void logout().catch(err=>window.alert(err.message));return;}

   if(authAnchor === '#AvatarMenu' || authAnchor === 'AvatarMenu.dc.html') { e.preventDefault(); setMenu(v=>!v); return; }
   if(a?.getAttribute('href') === '#') { e.preventDefault(); return; }
   const match = /^([A-Za-z0-9_-]+)\.dc\.html(#.*)?$/.exec(a?.getAttribute('href') || '');
   if (match && !e.defaultPrevented) {
    e.preventDefault();
    const targetPage = resolve(match[1]);
    // Các thẻ cũ không mang UUID bài, mở danh mục kỹ năng tương ứng.
    if (targetPage === "SampleWriting" || targetPage === "SampleSpeaking") {
     pushRoute("SampleLibrary?skill=" + (targetPage === "SampleWriting" ? "WRITING" : "SPEAKING"));
    } else if (pushRoute(targetPage) && match[2]) {
     setTimeout(()=>document.getElementById(match[2].slice(1))?.scrollIntoView(),100);
    }
    return;
   }
   if (authAnchor?.startsWith("#") && !e.defaultPrevented && !e.ctrlKey && !e.metaKey &&
       !e.shiftKey && !e.altKey && !a?.hasAttribute("target") && !a?.hasAttribute("download")) {
    const route = authAnchor.slice(1);
    const name = route.split("?")[0];
    if ((name in pages || name in aliases) &&
        (resolve(name) === "AdminSamples" || /^AdminSample(Writing|Speaking)$/.test(resolve(name)) ||
         publicSamplePages.includes(resolve(name)) ||
         /^#Admin(?:Sample(?:s|Writing|Speaking)|Vocabulary)(?:\?|$)/.test(acceptedHash))) {
     e.preventDefault();
     pushRoute(route);
    }
   }
  };
  let lastPointer = 'mouse';
  const pointer = (e: PointerEvent) => { lastPointer = e.pointerType || 'mouse'; };
  const key = (e: KeyboardEvent) => {
   lastPointer = 'keyboard';
   if (e.key === 'Escape') { const dd = document.querySelector('.bu-dd.is-open'); if (dd) { dd.classList.remove('is-open'); const t = dd.querySelector<HTMLElement>(':scope > a'); t?.setAttribute('aria-expanded','false'); t?.focus(); } }
  };
  document.addEventListener('click',click,true); window.addEventListener('popstate',pop);
  window.addEventListener('hashchange',pop);
  window.addEventListener(sampleHashReplaced,syncSavedSample);
  document.addEventListener('pointerdown',pointer,true); document.addEventListener('keydown',key,true);
  return () => {document.removeEventListener('click',click,true);window.removeEventListener('popstate',pop);window.removeEventListener('hashchange',pop);window.removeEventListener(sampleHashReplaced,syncSavedSample);document.removeEventListener('pointerdown',pointer,true);document.removeEventListener('keydown',key,true);};
 }, []);
 const isPublicSamplePage = publicSamplePages.includes(page);
 const isPublicLibraryPage = publicLibraryPages.includes(page);
 const publicPage=isPublicLibraryPage||['Main','Login','Register','ForgotPassword','CheckEmail','ResetPassword'].includes(page);
 const denied =
  (!auth.user && !publicPage) ||
  (auth.user?.role !== 'LEARNER' && learnerStudyPages.includes(page)) ||
  (auth.user?.role !== 'ADMIN' && /^(Admin|Question)/.test(page)) ||
  (auth.user?.role !== 'TEACHER' && /^Teacher/.test(page)) ||
  (auth.user?.role === 'LEARNER' && page === 'StaffProfile');
 useEffect(()=>{if(auth.ready&&denied&&!auth.error)navigate(auth.user?home():'Login');},[auth.ready,auth.user,page,denied,auth.error]);
 if(!auth.ready&&!isPublicLibraryPage)return <p role="status">Đang kiểm tra phiên đăng nhập…</p>;
 if(auth.error&&!isPublicLibraryPage)return <div role="alert"><p>{auth.error}</p><button onClick={()=>{void refresh().catch(()=>{});}}>Thử lại</button></div>;
 if(denied)return <p>Đang chuyển trang…</p>;
 const Page = pages[page];
 const AttemptPage = page === "ReadingTest" || page === "ListeningTest" || page === "WritingTest" || page === "SpeakingTest" ? pages[page] : null;
 const query = new URLSearchParams(routeHash.split("?")[1]);
 const vocabularySetId = query.get("set") ?? undefined;
 return <><React.Suspense fallback={<div role="status" style={{padding:24,fontFamily:"Inter, sans-serif"}}>Đang tải…</div>}>{AttemptPage ? <DesktopOnly key={page}><AttemptSession page={page} Screen={AttemptPage}/></DesktopOnly> : React.createElement(Page as React.ComponentType<any>, {key:page === "Flashcard" ? `Flashcard:${auth.user?.id ?? ""}:${vocabularySetId ?? ""}` : page, vocabularySetId, themeRevision:revision, kyNang:query.get("skill") || undefined, cheDo:query.get("mode") || undefined, sampleId:query.get("id") || undefined, sampleType:query.get("sampleType") || undefined, sampleQuery:isPublicSamplePage ? query.toString() : undefined, callbackNotice:googleNotice || emailCallback?.notice})}</React.Suspense>{menu && <AccountMenu onClose={()=>setMenu(false)} />}</>;
}
