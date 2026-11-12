import {safeURL,validDate} from './core.js';
export const KINDS={flight:'Flug',hotel:'Unterkunft',car:'Mietwagen',activity:'Aktivität'};
export const STATUSES={idea:'Idee',planned:'Eingeplant',booked:'Gebucht',cancelled:'Verworfen / storniert'};
export const CHOICES={yes:'Ja',maybe:'Vielleicht',no:'Nein'};
export const ZONES={'America/Chicago':'USA · Central Time','Europe/Zurich':'Zürich / Österreich'};
export const FIELDS={
 flight:[['provider','Fluggesellschaft'],['number','Flugnummer(n)'],['from','Abflughafen / Terminal'],['to','Zielflughafen / Terminal'],['passengers','Reisende'],['baggage','Gepäck inklusive'],['reference','Buchungsnummer'],['cancellation','Umbuchung / Stornierung']],
 hotel:[['provider','Hotel / Anbieter'],['address','Adresse'],['rooms','Zimmeraufteilung'],['meals','Frühstück / Verpflegung'],['parking','Parken'],['reference','Buchungsnummer'],['cancellation','Stornierung / Frist']],
 car:[['provider','Vermieter / Buchungsportal'],['vehicle','Fahrzeugklasse / Beispielmodell'],['seats','Sitzplätze'],['baggage','Gepäckplatz (große / kleine Koffer)'],['from','Abholstation'],['to','Rückgabestation'],['insurance','Versicherung / Deckung'],['deductible','Selbstbehalt'],['deposit','Kaution / Kreditkarte'],['oneway','Einweggebühr (inklusive oder zusätzlich?)'],['drivers','Fahrer / Zusatzfahrer'],['fuel','Tankregelung / Kilometer'],['reference','Buchungsnummer'],['cancellation','Stornierung / Frist']],
 activity:[['address','Ort / Treffpunkt'],['provider','Veranstalter'],['participants','Teilnehmer'],['reference','Reservierungsnummer'],['cancellation','Stornierung / Frist']]
};
const text=(v,max=500)=>typeof v==='string'?v.trim().slice(0,max):'';
export function zonedInstant(local,zone){
 if(!local)return null;
 if(!Object.hasOwn(ZONES,zone)||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(local)||!validDate(local.slice(0,10)))throw Error('Datum oder Zeitzone ungültig.');
 const wall=Date.parse(local.slice(0,16)+':00Z');
 if(!Number.isFinite(wall))throw Error('Uhrzeit ungültig.');
 const fmt=new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const parts=t=>Object.fromEntries(fmt.formatToParts(new Date(t)).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
 const normalized=p=>p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute;
 let t=wall;
 for(let i=0;i<3;i++){const p=parts(t);const displayed=Date.parse(normalized(p)+':00Z');t+=wall-displayed;}
 if(normalized(parts(t))!==local.slice(0,16))throw Error('Diese Ortszeit existiert wegen der Zeitumstellung nicht.');
 return t;
}
export function validateBooking(raw){
 if(!Object.hasOwn(KINDS,raw.kind)||!Object.hasOwn(STATUSES,raw.status))throw Error('Art und Planungsstand auswählen.');
 const title=text(raw.title,160);if(title.length<2)throw Error('Bitte einen Titel eingeben.');
 const url=text(raw.url,2001);if(url&&(url.length>2000||!safeURL(url)))throw Error('Bitte einen vollständigen HTTPS-Link ohne Zugangsdaten verwenden.');
 const start_local=raw.start_local||null,end_local=raw.end_local||null;
 const start_zone=raw.start_zone,end_zone=raw.end_zone;
 if(!Object.hasOwn(ZONES,start_zone)||!Object.hasOwn(ZONES,end_zone))throw Error('Zeitzonen auswählen.');
 const start=zonedInstant(start_local,start_zone),end=zonedInstant(end_local,end_zone);
 if(end!==null&&(start===null||end<start))throw Error('Das Ende muss nach dem Beginn liegen; Ortszeiten und Zeitzonen prüfen.');
 const amount=raw.amount===''||raw.amount==null?null:Number(raw.amount);
 if(amount!==null&&(!Number.isFinite(amount)||amount<0||amount>1000000))throw Error('Gesamtpreis muss zwischen 0 und 1.000.000 liegen.');
 if(!['EUR','USD'].includes(raw.currency))throw Error('Währung auswählen.');
 const details=Object.fromEntries(FIELDS[raw.kind].map(([key])=>[key,text(raw.details?.[key])]));
 return {kind:raw.kind,title,status:raw.status,idea_id:raw.idea_id||null,start_local,end_local,start_zone,end_zone,amount,currency:raw.currency,url,details,notes:text(raw.notes,4000)};
}
export function validateDates(start,end){
 if(!validDate(start)||!validDate(end)||start<'2027-04-22')throw Error('Früheste Abreise ist der 22.04.2027.');
 const days=Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000)+1;
 if(days<3||days>14)throw Error('Bitte 3 bis maximal 14 Kalendertage inklusive Heimkehr wählen.');
 return {start_date:start,end_date:end,days};
}
export function calendarCells(month,options){
 const first=new Date(month+'-01T12:00:00Z');if(Number.isNaN(first.getTime()))throw Error('Monat ungültig.');
 const pad=(first.getUTCDay()+6)%7;const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 return [...Array(pad).fill(null),...Array.from({length:last},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0');return {date,options:options.filter(o=>!o.archived&&date>=o.start_date&&date<=o.end_date).map(o=>o.id)};})];
}
export function bookingOrder(a,b){return (a.start_local?zonedInstant(a.start_local,a.start_zone):Infinity)-(b.start_local?zonedInstant(b.start_local,b.start_zone):Infinity)||a.title.localeCompare(b.title,'de');}
export function overlaps(bookings){
 const items=bookings.filter(b=>['planned','booked'].includes(b.status)&&['flight','activity'].includes(b.kind)&&b.start_local&&b.end_local);
 const conflicts=new Set();
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];if(zonedInstant(a.start_local,a.start_zone)<zonedInstant(b.end_local,b.end_zone)&&zonedInstant(b.start_local,b.start_zone)<zonedInstant(a.end_local,a.end_zone)){conflicts.add(a.id);conflicts.add(b.id);}}
 return conflicts;
}
export function sumBookings(bookings){
 return Object.fromEntries(['EUR','USD'].map(c=>[c,bookings.filter(b=>b.currency===c&&b.status==='booked'&&b.amount!==null).reduce((n,b)=>n+Number(b.amount),0)]));
}
export async function inspectUpload(file){
 if(!file||!file.size||file.size>10485760)throw Error('Bitte eine Datei mit maximal 10 MB auswählen.');
 const b=new Uint8Array(await file.slice(0,32).arrayBuffer()),s=String.fromCharCode(...b);
 let mime='',ext='';
 if(s.startsWith('%PDF-')){mime='application/pdf';ext='pdf';}
 else if(b[0]===255&&b[1]===216&&b[2]===255){mime='image/jpeg';ext='jpg';}
 else if([137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v)){mime='image/png';ext='png';}
 else if(s.startsWith('RIFF')&&s.slice(8,12)==='WEBP'){mime='image/webp';ext='webp';}
 else if(s.slice(4,8)==='ftyp'&&/heic|heix|hevc|hevx|mif1|msf1/.test(s.slice(8))){ext=/heic|heix|hevc|hevx/.test(s.slice(8))?'heic':'heif';mime='image/'+ext;}
 if(!mime)throw Error('Erlaubt sind PDF, JPEG, PNG, WebP und HEIC/HEIF. Der Dateiinhalt muss zum Format passen.');
 const base=String(file.name||'Unterlage').replace(/\.[^.]*$/,'').replace(/[\\/<>:"|?*\x00-\x1f\x7f]/g,'_').slice(0,180)||'Unterlage';
 return {mime_type:mime,extension:ext,file_name:base+'.'+ext,bytes:file.size};
}

