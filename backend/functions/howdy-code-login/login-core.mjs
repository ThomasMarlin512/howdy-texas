const origins=new Set(['https://howdy-texas.thomas-marlin.chatgpt.site','https://thomasmarlin512.github.io']);
export function normalizeName(name){return typeof name==='string'?name.trim().toLocaleLowerCase('de-AT'):'';}
async function bodyOf(req){
 const reader=req.body?.getReader();if(!reader)throw Error('body');
 const chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw Error('body');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
export function createHandler(admin){return async req=>{
 const origin=req.headers.get('origin');
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
 if(origin&&origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!origins.has(origin))return reply({error:'Diese Herkunft ist nicht erlaubt.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'POST erforderlich.'},405);
 try{
  const token=req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if(!token)return reply({error:'Bitte Seite neu laden.'},401);
  const caller=await admin.auth.getUser(token);
  if(caller.error||!caller.data?.user?.id)return reply({error:'Sitzung abgelaufen.'},401);
  const uid=caller.data.user.id;
  let b;try{b=await bodyOf(req);}catch{return reply({error:'Ungültige Eingabe.'},400);}
  const name=normalizeName(b.name),code=typeof b.code==='string'?b.code:'';
  if(name.length<2||name.length>40||code.length<4||code.length>64||new TextEncoder().encode(code).length>72)return reply({error:'Bitte Vorname und Passwort eingeben.'},400);
  const network=req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||uid;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(network));
  const clientKey=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  const result=await admin.rpc('howdy_authenticate',{p_name:name,p_code:code,p_requester:uid,p_client_key:clientKey});
  if(result.error)return reply({error:'Anmeldung momentan nicht möglich.'},503);
  if(!result.data?.ok)return reply({error:result.data?.limited?'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.':'Vorname oder Passwort ungültig.'},result.data?.limited?429:400);
  return reply({ok:true});
 }catch{return reply({error:'Dienst momentan nicht erreichbar. Bitte erneut versuchen.'},503);}
};}

