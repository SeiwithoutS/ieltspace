import {useSyncExternalStore} from 'react';
import {getAuthUser} from './auth';
export type Role='learner'|'teacher'|'admin';
export type Account={id:string;role:Role;name:string;email:string;initials:string;avatar:string|null};
export function currentRole():Role{return (getAuthUser()?.role.toLowerCase() as Role)||'learner';}
export function getAccount(_role?: Role): Account {
 const user = getAuthUser();
 const name = user?.display_name?.trim() || user?.full_name || 'Khách';
 return {
  id: user?.id || '', role: currentRole(), name, email: user?.email || '',
  initials: name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase(),
  avatar: user?.avatar_url || null,
 };
}
export function useAccount(role?:Role){return JSON.parse(useSyncExternalStore(callback=>{window.addEventListener('ieltspace-account-change',callback);return ()=>window.removeEventListener('ieltspace-account-change',callback);},()=>JSON.stringify(getAccount(role)))) as Account;}
