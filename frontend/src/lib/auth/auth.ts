import { useSyncExternalStore } from 'react';
import { rememberGoogleSupport } from '../reports/support-navigation';
export type AuthUser = {
 id: string;
 full_name: string;
 display_name?: string | null;
 email: string | null;
 avatar_url?: string | null;
 role: 'LEARNER' | 'TEACHER' | 'ADMIN';
 must_change_password?: boolean;
};
let user: AuthUser|null=null;
let accessToken='';
let ready=false;
let refreshPromise:Promise<void>|null=null;
let profileCheck: Promise<void> | null = null;
let timer:ReturnType<typeof setTimeout>|undefined;
let refreshAt = 0;
let signingOut=false;
let passwordChangeNotice: string | undefined;
const listeners=new Set<()=>void>();
let snapshot:{user:AuthUser|null;ready:boolean;error:string}={user,ready,error:''};
function publish(error='') { snapshot={user,ready,error}; listeners.forEach(fn=>fn()); window.dispatchEvent(new Event('ieltspace-account-change')); }
export function getAuthUser(){return user;}
export function useAuth(){return useSyncExternalStore(fn=>{listeners.add(fn);return ()=>{listeners.delete(fn);};},()=>snapshot);}
const base=(import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';
async function request(path:string,body?:unknown,token?:string){
 const headers: Record<string, string> = {'Content-Type':'application/json'};
 if (token) headers.Authorization = `Bearer ${token}`;
 const res=await fetch(base+'/auth/'+path,{method:'POST',credentials:'include',headers,body:JSON.stringify(body || {})});
 const data=res.status===204?{}:await res.json();
 if(!res.ok) throw Object.assign(new Error(data.message || data.error?.message || 'Không thể kết nối. Vui lòng thử lại.'),{status:res.status,code:data.code ?? data.error?.code});
 return data;
}
function scheduleRefresh() {
 clearTimeout(timer);
 if (user && !signingOut) timer = setTimeout(() => { void refresh().catch(() => {}); }, Math.max(1000, refreshAt - Date.now()));
}
function accept(data:any){user=data.user;accessToken=data.session.accessToken;ready=true;publish();refreshAt=Date.now()+(data.session.expiresIn-60)*1000;scheduleRefresh();}
export function refresh():Promise<void>{
 if(signingOut)return Promise.resolve();
 if(!refreshPromise) refreshPromise=request('refresh').then(accept).catch(error=>{ready=true;if(error.status===401 || error.status===403){user=null;accessToken='';publish();}else publish('Chưa thể khôi phục phiên. Kiểm tra kết nối rồi thử lại.');throw error;}).finally(()=>{refreshPromise=null;});
 return refreshPromise;
}
export async function login(email:string,password:string){
 await refreshPromise?.catch(()=>{});
 const data = await request('login',{email,password});
 pendingVerification = undefined;
 try { sessionStorage.removeItem(emailVerificationKey); } catch {}
 accept(data);
}
export async function register(email:string,password:string,fullName:string){return request('register',{email,password,fullName});}

const emailVerificationKey = 'ieltspace-email-verification';
type EmailVerification = { email: string; availableAt: number };
let pendingVerification: EmailVerification | undefined;

export function getEmailVerification(): EmailVerification | undefined {
 if (pendingVerification) return pendingVerification;
 try {
  const saved = JSON.parse(sessionStorage.getItem(emailVerificationKey) || 'null');
  if (typeof saved?.email === 'string' && Number.isFinite(saved.availableAt)) return saved;
 } catch {
  // The current tab can still retain the address in memory.
 }
}

function rememberVerification(email: string, delayMs: number) {
 pendingVerification = { email: email.trim().toLowerCase(), availableAt: Date.now() + delayMs };
 try { sessionStorage.setItem(emailVerificationKey, JSON.stringify(pendingVerification)); } catch {}
 return pendingVerification;
}

export function openEmailVerification(email: string, justRegistered = false) {
 const saved = getEmailVerification();
 if (justRegistered || saved?.email !== email.trim().toLowerCase()) {
  rememberVerification(email, justRegistered ? 60_000 : 0);
 }
 navigate('CheckEmail');
}

export async function resendVerification(email: string) {
 try {
  const { message } = await request('resend-verification', { email });
  rememberVerification(email, 60_000);
  return message as string;
 } catch (error) {
  if (error instanceof Error && 'status' in error && error.status === 429) rememberVerification(email, 60_000);
  throw error;
 }
}
export async function logout(){signingOut=true;clearTimeout(timer);try{await refreshPromise?.catch(()=>{});await request('logout');user=null;accessToken='';ready=true;publish();navigate('Login');}finally{signingOut=false;}}
export function navigate(page:string){history.pushState(null,'','#'+page);window.dispatchEvent(new PopStateEvent('popstate'));}
export function home(){return user?.role==='ADMIN'?'AdminHome':user?.role==='TEACHER'?'TeacherHome':'StudentHome';}
export function getAccessToken(){return accessToken;}

export function recheckAuthProfile(): Promise<void> {
 const token = accessToken;
 if (!token || !user || signingOut) return Promise.resolve();
 if (profileCheck) return profileCheck;

 profileCheck = fetch(base.replace(/\/$/, '') + '/auth/me', {
  headers: { Authorization: `Bearer ${token}` },
  cache: 'no-store',
 }).then(async response => {
  if (response.status !== 403 && !response.ok) return;
  const payload = await response.json();
  if (token !== accessToken || !user || signingOut) return;
  if (payload.code === 'ACCOUNT_UNAVAILABLE' || payload.code === 'PROFILE_NOT_FOUND') {
   clearTimeout(timer);
   user = null;
   accessToken = '';
   publish();
  } else if (response.ok && payload.user?.id === user.id &&
      (payload.user.role !== user.role || payload.user.must_change_password !== user.must_change_password)) {
   user = payload.user;
   publish();
  }
 }).catch(() => {
  // Keep the active session on a temporary network error.
 }).finally(() => { profileCheck = null; });
 return profileCheck;
}

export async function updateAuthProfile(profile: AuthUser) {
 await refreshPromise?.catch(() => {});
 if (user?.id !== profile.id) return;
 user = { ...user, display_name: profile.display_name, avatar_url: profile.avatar_url };
 publish();
}

export async function changePassword(currentPassword: string, newPassword: string, code?: string) {
 if (signingOut) throw new Error('Phiên đăng nhập đang thay đổi. Vui lòng thử lại.');
 signingOut = true;
 clearTimeout(timer);
 try {
  await refreshPromise?.catch(() => {});
  if (!accessToken) throw new Error('Vui lòng đăng nhập lại.');
  const { message } = await request('me/password', { currentPassword, newPassword, code }, accessToken);
  passwordChangeNotice = message;
  user = null;
  accessToken = '';
  publish();
  navigate('Login');
 } finally {
  signingOut = false;
  scheduleRefresh();
 }
}

export function takePasswordChangeNotice() {
 const notice = passwordChangeNotice;
 passwordChangeNotice = undefined;
 return notice;
}

export function forgotPassword(email:string){return request('forgot-password',{email});}
export async function finishAuthenticatorSetup(factorId: string, code: string) {
 await refreshPromise?.catch(() => {});
 if (!accessToken || signingOut) throw new Error('Vui lòng đăng nhập lại.');
 clearTimeout(timer);
 try {
  const data = await request('me/authenticator/verify', { factorId, code }, accessToken);
  if (!signingOut && user?.id === data.user.id) accept(data);
 } finally {
  scheduleRefresh();
 }
}
export async function resetPassword(tokenHash:string,password:string,code?:string){signingOut=true;clearTimeout(timer);try{await refreshPromise?.catch(()=>{});const result=await request('reset-password',{tokenHash,password,code});user=null;accessToken='';publish();return result;}finally{signingOut=false;scheduleRefresh();}}

export async function loginWithGoogle(){const data=await request('google');if(!data.url)throw new Error('Không thể bắt đầu đăng nhập Google.');rememberGoogleSupport();window.location.assign(data.url);}
