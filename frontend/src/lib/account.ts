import {useSyncExternalStore} from 'react';
import {getAuthUser} from './auth';
export type Role='learner'|'teacher'|'admin';
export type Account={id:string;role:Role;name:string;email:string;initials:string};
export function currentRole():Role{return (getAuthUser()?.role.toLowerCase() as Role)||'learner';}
export function getAccount(_role?:Role):Account{const u=getAuthUser();const name=u?.full_name||'Khách';return {id:u?.id||'',role:currentRole(),name,email:u?.email||'',initials:name.split(' ').map(s=>s[0]).slice(-2).join('').toUpperCase()};}
export function useAccount(role?:Role){return JSON.parse(useSyncExternalStore(callback=>{window.addEventListener('ieltspace-account-change',callback);return ()=>window.removeEventListener('ieltspace-account-change',callback);},()=>JSON.stringify(getAccount(role)))) as Account;}
