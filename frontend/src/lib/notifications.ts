import {useSyncExternalStore} from 'react';
import seed from '../data/notifications.json';
import {getAccount,type Role} from './account';
const event='ieltspace-notifications-change';
function subscribe(callback:()=>void){window.addEventListener(event,callback);window.addEventListener('storage',callback);window.addEventListener('ieltspace-account-change',callback);return()=>{window.removeEventListener(event,callback);window.removeEventListener('storage',callback);window.removeEventListener('ieltspace-account-change',callback);};}
const key=(role?:Role)=>'ieltspace-notifications:'+getAccount(role).id;
function snapshot(role?:Role){try{return localStorage.getItem(key(role))||'[]';}catch{return '[]';}}
export function useNotifications(role?:Role){const account=getAccount(role);const raw=useSyncExternalStore(subscribe,()=>snapshot(role));let read:string[]=[];try{const value=JSON.parse(raw);if(Array.isArray(value))read=value.filter(v=>typeof v==='string');}catch{}
 const items=seed[account.role].map(item=>({...item,unread:item.unread&&!read.includes(item.id)}));
 const markRead=(ids:string[])=>{const next=Array.from(new Set([...read,...ids]));localStorage.setItem(key(role),JSON.stringify(next));window.dispatchEvent(new Event(event));};
 return {items,unread:items.filter(i=>i.unread).length,markRead,markAll:()=>markRead(items.map(i=>i.id))};
}
