import {TASKS,BUDGET_KEYS,PHOTOS} from './data.js';
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function validDate(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T12:00:00');return !Number.isNaN(d.getTime())&&d.getFullYear()>=2020&&d.getFullYear()<=2100&&d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')===v;}
export function cleanState(raw){const r=raw&&typeof raw==='object'?raw:{};return {start:validDate(r.start)?r.start:'',days:Number.isInteger(r.days)&&r.days>=2&&r.days<=60?r.days:10,note:typeof r.note==='string'?r.note.slice(0,5000):'',tasks:Object.fromEntries(TASKS.map(([id])=>[id,r.tasks?.[id]===true])),budget:Object.fromEntries(BUDGET_KEYS.map(k=>[k,typeof r.budget?.[k]==='number'&&Number.isFinite(r.budget[k])&&r.budget[k]>=0&&r.budget[k]<=100000?r.budget[k]:null]))};}
export function totalBudget(b,days=10){return(b.flight||0)*4+(b.stay||0)+(b.car||0)+(b.road||0)+(b.food||0)*4*days+(b.fun||0)*4+(b.extra||0);}
export function maps(d){const u=new URL('https://www.google.com/maps/search/');u.searchParams.set('api','1');u.searchParams.set('query',[d.title,d.location,d.region,'USA'].filter(Boolean).join(' '));return u.href;}
export function nextRevision(revision){if(!Number.isInteger(revision)||revision<0||revision>=2147483647)throw Error('Ungültiger Planungsstand');return revision+1;}
export function safeURL(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}}
export function validateIdea(raw){const out={};for(const [k,max,min] of [['title',120,2],['location',120,2],['description',2000,10]]){const v=typeof raw[k]==='string'?raw[k].trim():'';if(v.length<min||v.length>max)throw Error(k==='description'?'Bitte beschreibe deine Idee in 10 bis 2.000 Zeichen.':'Name und Ort benötigen jeweils 2 bis 120 Zeichen.');out[k]=v;}
if(!['destination','hotel'].includes(raw.kind))throw Error('Bitte Reiseziel oder Hotel auswählen.');out.kind=raw.kind;
if(!['Tennessee','Arkansas','Texas','Andere'].includes(raw.region))throw Error('Bitte eine Region auswählen.');out.region=raw.region;
if(!Object.hasOwn(PHOTOS,raw.photo_key))throw Error('Bitte ein Bildmotiv auswählen.');out.photo_key=raw.photo_key;
const url=typeof raw.url==='string'?raw.url.trim():'';if(url&&(url.length>2000||!safeURL(url)))throw Error('Bitte einen vollständigen https://-Link ohne Zugangsdaten eintragen.');out.url=url?safeURL(url):'';return out;}
