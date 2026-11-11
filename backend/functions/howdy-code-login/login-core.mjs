const origins=new Set(['https://howdy-texas.thomas-marlin.chatgpt.site','https://thomasmarlin512.github.io']);
async function bodyOf(req){
 const reader=req.body?.getReader();if(!reader)throw Error('body');
 const chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw Error('body');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
export function createHandler(admin,freshClient){return async req=>{
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
  if(b.action==='provision'){
   if(typeof b.member!=='string'||!/^[a-z0-9_-]{2,40}$/.test(b.member))return reply({error:'Zugang nicht verfügbar.'},400);
   const check=await admin.rpc('howdy_provision_target',{p_requester:uid,p_member:b.member});
   if(check.error||!check.data?.email)return reply({error:'Zugang bereits eingerichtet oder keine Berechtigung.'},403);
   const bytes=crypto.getRandomValues(new Uint8Array(24));
   const password=Array.from(bytes,v=>v.toString(16).padStart(2,'0')).join('');
   const account=await admin.auth.admin.createUser({email:check.data.email,password,email_confirm:true});
   if(account.error||!account.data?.user?.id)return reply({error:'Zugang konnte nicht erstellt werden. Bitte Verwaltung prüfen.'},503);
   const link=await admin.rpc('howdy_provision_target',{p_requester:uid,p_member:b.member,p_user_id:account.data.user.id});
   if(link.error)return reply({error:'Konto erstellt, aber Zuordnung fehlt. Bitte Verwaltung prüfen.'},503);
   return reply({ok:true,name:check.data.name,password});
  }
  const name=typeof b.name==='string'?b.name.trim():'';
  const code=typeof b.code==='string'?b.code.trim():'';
  if(name.length<2||name.length>254||code.length<4||code.length>64||new TextEncoder().encode(code).length>72)return reply({error:'Bitte Name und Passwort eingeben.'},400);
  const target=await admin.rpc('howdy_login_target',{p_name:name});
  if(target.error)return reply({error:'Die Anmeldung ist noch nicht verfügbar.'},503);
  if(!target.data?.ready)return reply({error:'Name oder Passwort ungültig. Bei einem neuen Zugang bitte Thomas kontaktieren.'},400);
  if(!target.data.legacy){
   const signed=await freshClient().auth.signInWithPassword({email:target.data.email,password:code});
   if(signed.error||!signed.data?.session)return reply({error:'Name oder Passwort ungültig.'},400);
   return reply({ok:true,session:{access_token:signed.data.session.access_token,refresh_token:signed.data.session.refresh_token}});
  }
  const network=req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||uid;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(network));
  const clientKey=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  const result=await admin.rpc('login_with_member_code',{p_name:target.data.name,p_code:code,p_requester:uid,p_client_key:clientKey});
  if(result.error)return reply({error:'Anmeldung momentan nicht möglich.'},503);
  if(!result.data?.ok)return reply({error:result.data?.error||'Name oder Passwort ungültig.'},result.data?.limited?429:400);
  if(result.data.mode==='email'){
   const link=await admin.auth.admin.generateLink({type:'magiclink',email:result.data.email});
   if(link.error||link.data?.user?.id!==result.data.user_id||!link.data?.properties?.hashed_token)return reply({error:'Anmeldung konnte nicht abgeschlossen werden.'},503);
   return reply({ok:true,token_hash:link.data.properties.hashed_token});
  }
  if(result.data.mode!=='member')return reply({error:'Anmeldung fehlgeschlagen.'},503);
  return reply({ok:true});
 }catch{return reply({error:'Dienst momentan nicht erreichbar. Bitte erneut versuchen.'},503);}
};}
