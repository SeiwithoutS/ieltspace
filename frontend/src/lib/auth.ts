import { useSyncExternalStore } from 'react';
export type AuthUser = {id:string;full_name:string;email:string;role:'LEARNER'|'TEACHER'|'ADMIN'};
let user: AuthUser|null=null;
let accessToken='';
let ready=false;
let refreshPromise:Promise<void>|null=null;
let timer:ReturnType<typeof setTimeout>|undefined;
let signingOut=false;
const listeners=new Set<()=>void>();
let snapshot:{user:AuthUser|null;ready:boolean;error:string}={user,ready,error:''};
function publish(error='') { snapshot={user,ready,error}; listeners.forEach(fn=>fn()); window.dispatchEvent(new Event('ieltspace-account-change')); }
export function getAuthUser(){return user;}
export function useAuth(){return useSyncExternalStore(fn=>{listeners.add(fn);return ()=>{listeners.delete(fn);};},()=>snapshot);}
const base=(import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';
async function request(path:string,body?:unknown){
 const res=await fetch(base+'/auth/'+path,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body || {})});
 const data=res.status===204?{}:await res.json();
 if(!res.ok) throw Object.assign(new Error(data.message || data.error?.message || 'Không thể kết nối. Vui lòng thử lại.'),{status:res.status});
 return data;
}
function accept(data:any){user=data.user;accessToken=data.session.accessToken;ready=true;publish();clearTimeout(timer);if(!signingOut) timer=setTimeout(()=>{void refresh().catch(()=>{});},Math.max(1000,(data.session.expiresIn-60)*1000));}
export function refresh():Promise<void>{
 if(signingOut)return Promise.resolve();
 if(!refreshPromise) refreshPromise=request('refresh').then(accept).catch(error=>{ready=true;if(error.status===401 || error.status===403){user=null;accessToken='';publish();}else publish('Chưa thể khôi phục phiên. Kiểm tra kết nối rồi thử lại.');throw error;}).finally(()=>{refreshPromise=null;});
 return refreshPromise;
}
export async function login(email:string,password:string){await refreshPromise?.catch(()=>{});accept(await request('login',{email,password}));}
export async function register(email:string,password:string,fullName:string){return request('register',{email,password,fullName});}
export async function logout(){signingOut=true;clearTimeout(timer);try{await refreshPromise?.catch(()=>{});await request('logout');user=null;accessToken='';ready=true;publish();navigate('Login');}finally{signingOut=false;}}
export function navigate(page:string){history.pushState(null,'','#'+page);window.dispatchEvent(new PopStateEvent('popstate'));}
export function home(){return user?.role==='ADMIN'?'AdminHome':user?.role==='TEACHER'?'TeacherHome':'StudentHome';}
export function getAccessToken(){return accessToken;}

export function forgotPassword(email:string){return request('forgot-password',{email});}
export async function resetPassword(tokenHash:string,password:string){signingOut=true;clearTimeout(timer);try{await refreshPromise?.catch(()=>{});const result=await request('reset-password',{tokenHash,password});user=null;accessToken='';publish();return result;}finally{signingOut=false;}}

export async function loginWithGoogle(){const data=await request('google');if(!data.url)throw new Error('Không thể bắt đầu đăng nhập Google.');window.location.assign(data.url);}
