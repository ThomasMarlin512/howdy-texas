import {DALLAS_TRIP,travelWindow} from './routes.js';
import {escapeHTML as esc,safeURL,nextRevision} from './core.js';
import {KINDS,STATUSES,CHOICES,ZONES,FIELDS,validateBooking,bookingOrder,overlaps,sumBookings,inspectUpload} from './travel-core.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const day=s=>s?new Date(s.slice(0,10)+'T12:00:00Z').toLocaleDateString('de-AT',{timeZone:'UTC'}):'Noch offen';
const money=(n,c)=>n===null?'Preis offen':new Intl.NumberFormat('de-AT',{style:'currency',currency:c}).format(n);
const localTime=(s,z)=>s?day(s)+' · '+s.slice(11,16)+' ('+(z==='Europe/Zurich'?'Zürich':'Central Time')+')':'Zeit noch offen';
const fixedTransport=b=>b.kind==='flight'||b.kind==='car';
const tripDates=travelWindow(DALLAS_TRIP.days,DALLAS_TRIP.start);
const BUCKET='howdy-documents';
export function createTravelHub({client,context,ideas,toast,openLogin,onChange}){
 let bookings=[],documents=[],ballots=[],settings=null,editing=null,formIdea=null,busy=false,epoch=0;
 let dirtyForms=new Set(),confirmResolve=null;
 const same=c=>context()===c&&!!c;
 const memberName=key=>context()?.people.find(p=>p.key===key)?.name||'Crewmitglied';
 const status=s=>$$('.hub-status').forEach(el=>el.textContent=s);
 async function rows(table,order='id'){let result=[];for(let offset=0;;offset+=1000){const r=await client().from(table).select('*').order(order).range(offset,offset+999);if(r.error)throw Error('Gemeinsame Reisedaten konnten nicht geladen werden. Bitte erneut versuchen.');result.push(...r.data);if(r.data.length<1000)return result;}}
 async function load(){
  const c=context(),version=epoch;if(!c)return;
  const result=await Promise.all([rows('howdy_bookings'),rows('howdy_documents'),rows('howdy_idea_ballots','idea_id'),rows('howdy_trip_settings')]);
  if(!same(c)||version!==epoch)return;
  [bookings,documents,ballots]=result;settings=result[3][0];render();onChange();status('Gemeinsamer Stand · '+new Date().toLocaleTimeString('de-AT'));
 }
 function voteControls(type,id,rows,key){
  const own=rows.find(v=>v[key]===id&&v.member_key===context()?.me)?.choice;
  return '<div class="choice-buttons" role="group" aria-label="Abstimmung">'+Object.entries(CHOICES).map(([value,label])=>'<button type="button" data-hub-vote="'+type+'" data-option="'+esc(id)+'" data-choice="'+value+'" aria-pressed="'+(own===value)+'">'+label+' <small>'+rows.filter(v=>v[key]===id&&v.choice===value).length+'</small></button>').join('')+'</div>'+(own?'<button class="quiet small" data-hub-vote="'+type+'" data-option="'+esc(id)+'" data-choice="clear">Stimme zurücknehmen</button>':'')+(context()?'<details class="vote-names"><summary>Stimmen ansehen</summary>'+context().people.map(p=>'<p>'+esc(p.name)+': '+esc(CHOICES[rows.find(v=>v[key]===id&&v.member_key===p.key)?.choice]||'Noch offen')+'</p>').join('')+'</details>':'<small>Anmelden, um abzustimmen.</small>');
 }
 function ideaMarkup(i){
  const related=bookings.filter(b=>b.idea_id===i.id&&['planned','booked'].includes(b.status));
  return '<div class="idea-ballot">'+(related.length?'<p class="booking-status">'+(related.some(b=>b.status==='booked')?'Gebucht':'Eingeplant')+' · <a href="#reiseplan">Im Reiseplan ansehen</a></p>':'')+voteControls('idea',i.id,ballots,'idea_id')+'<button class="quiet" data-book-idea="'+esc(i.id)+'">In den Reiseplan aufnehmen +</button></div>';
 }
 function bookingCard(b,conflicts=new Set()){
  const attached=documents.filter(d=>d.booking_id===b.id&&d.ready);
  const outside=b.start_local&&(b.start_local.slice(0,10)<tripDates.start||(b.end_local||b.start_local).slice(0,10)>tripDates.home);
  return '<article class="panel booking-card"><div class="booking-top"><span class="booking-status status-'+esc(b.status)+'">'+esc(STATUSES[b.status])+'</span><span>'+esc(KINDS[b.kind])+'</span></div><h3>'+esc(b.title)+'</h3><p>'+esc(localTime(b.start_local,b.start_zone))+(b.end_local?'<br>bis '+esc(localTime(b.end_local,b.end_zone)):'')+'</p>'+(outside?'<p class="inline-warning">Liegt teilweise außerhalb des festgelegten Reisetermins.</p>':'')+(conflicts.has(b.id)?'<p class="inline-warning">Zeitliche Überschneidung mit einem anderen Flug oder einer Aktivität.</p>':'')+'<p class="booking-price">'+esc(money(b.amount,b.currency))+' <small>Gesamtpreis</small></p><details><summary>Details & Buchungsangaben</summary><dl class="booking-details">'+FIELDS[b.kind].filter(([k])=>b.details?.[k]).map(([k,label])=>'<dt>'+esc(label)+'</dt><dd>'+esc(b.details[k])+'</dd>').join('')+'</dl>'+(b.notes?'<p class="preserve-lines">'+esc(b.notes)+'</p>':'')+(safeURL(b.url)?'<a href="'+esc(safeURL(b.url))+'" target="_blank" rel="noopener noreferrer">Angebot / Anbieter öffnen ↗</a>':'')+'</details><div class="hub-actions">'+(fixedTransport(b)?'':'<button class="quiet" data-book-edit="'+esc(b.id)+'">Bearbeiten</button>')+'<button class="quiet" data-doc-for="'+esc(b.id)+'">Unterlage hinzufügen +</button></div>'+(attached.length?'<div class="booking-docs">'+attached.map(d=>'<button class="quiet" data-doc-download="'+esc(d.id)+'">↓ '+esc(d.title)+'</button>').join(''):'<small>Noch keine Bestätigung hinterlegt.</small>')+'</article>';
 }
 function renderBookings(){
  const sorted=bookings.filter(b=>!fixedTransport(b)||b.status==='booked').sort(bookingOrder),planned=sorted.filter(b=>['planned','booked'].includes(b.status)),conflicts=overlaps(planned);
  const groups=new Map();for(const b of planned){const key=b.start_local?.slice(0,10)||'';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(b);}
  $('#trip-timeline').innerHTML=groups.size?[...groups].map(([date,items])=>'<section class="timeline-day"><h3>'+esc(date?day(date):'Noch ohne Datum')+'</h3>'+items.map(b=>bookingCard(b,conflicts)).join('')+'</section>').join(''):'<div class="empty-state"><h3>Weitere Gruppeneinträge</h3><p>Eine Unterkunft oder Aktivität hinzufügen. Wähle „Eingeplant“ oder „Gebucht“, damit ein Eintrag hier erscheint.</p></div>';
  $('#booking-ideas').innerHTML=sorted.filter(b=>!['planned','booked'].includes(b.status)).map(b=>bookingCard(b)).join('')||'<p>Noch keine weiteren Einträge.</p>';
  const sums=sumBookings(bookings);$('#booking-totals').innerHTML='<div class="booking-totals"><strong>Summe der privaten Buchungseinträge:</strong><span>'+esc(money(sums.EUR,'EUR'))+'</span><span>'+esc(money(sums.USD,'USD'))+'</span></div><p class="muted">Summe der eingetragenen Gesamtpreise. EUR und USD werden nicht umgerechnet; leere Preisfelder fehlen. Die Budgetschätzung unter „Planung“ wird nicht automatisch überschrieben.</p>';
  const select=$('#document-booking'),previous=select.value;
  select.innerHTML='<option value="">Ohne Zuordnung</option>'+sorted.map(b=>'<option value="'+esc(b.id)+'">'+esc(KINDS[b.kind]+': '+b.title)+'</option>').join('');select.value=previous;
 }
 function renderDocs(){
  $('#document-list').innerHTML=documents.map(d=>'<article class="panel document-row"><div><span class="eyebrow">'+esc(KINDS[d.category]||'Weitere Unterlage')+'</span><h3>'+esc(d.title)+'</h3><p>'+esc(d.file_name)+' · '+(d.bytes/1048576).toLocaleString('de-AT',{maximumFractionDigits:1})+' MB</p><small>'+esc(d.booking_id?bookings.find(b=>b.id===d.booking_id)?.title||'Buchung':'Ohne Zuordnung')+' · von '+esc(memberName(d.created_by))+'</small></div><div class="hub-actions">'+(d.ready?'<button class="button dark" data-doc-download="'+esc(d.id)+'">Herunterladen ↓</button>':'<p>Upload noch nicht abgeschlossen.</p><button class="quiet" data-doc-recover="'+esc(d.id)+'">Datei prüfen</button>')+(d.created_by===context()?.me?'<button class="quiet" data-doc-delete="'+esc(d.id)+'">Entfernen</button>':'')+'</div></article>').join('')||'<div class="empty-state"><h3>Noch keine Unterlagen.</h3><p>Tickets und Bestätigungen bleiben ausschließlich im Gruppenbereich.</p></div>';
 }
 function renderAlbum(){
  $('#album-link').innerHTML=settings?.album_url&&safeURL(settings.album_url)?'<p class="eyebrow">UNSER GETEILTES ALBUM</p><h3>'+esc(settings.album_label)+'</h3><a class="button primary" href="'+esc(safeURL(settings.album_url))+'" target="_blank" rel="noopener noreferrer">Fotoalbum öffnen ↗</a>':'<h3>Noch kein Album verlinkt.</h3><p>Ein gemeinsames Album bei eurem Fotoanbieter erstellen und den Freigabelink unten ergänzen.</p>';
  if(!dirtyForms.has('album-form')){const f=$('#album-form');f.elements.album_label.value=settings?.album_label||'Unser gemeinsames Fotoalbum';f.elements.album_url.value=settings?.album_url||'';}
 }
 function render(){renderBookings();renderDocs();renderAlbum();}
 async function run(action,errorTarget){
  if(!context()){openLogin();return;}if(busy)return;
  const c=context();busy=true;
  try{await action(c);}catch(e){if(same(c)){if(errorTarget)$(errorTarget).textContent=e.message;toast(e.message);}}
  finally{busy=false;}
 }
 function check(r,message){if(r.error)throw Error(message);return r.data;}
 function confirmAction(message){return new Promise(resolve=>{confirmResolve=resolve;$('#hub-confirm-text').textContent=message;$('#hub-confirm-dialog').showModal();});}
 function confirmDone(value){const resolve=confirmResolve;confirmResolve=null;$('#hub-confirm-dialog').close();resolve?.(value);}
 function renderFields(kind,details={}){$('#booking-fields').innerHTML=FIELDS[kind].map(([k,label])=>'<label>'+esc(label)+'<input name="detail-'+k+'" maxlength="500" value="'+esc(details[k]||'')+'"></label>').join('');}
 function openBooking(kind,id=null,idea=null){
  if(!context()){openLogin();return;}
  if(dirtyForms.has('booking-form')){toast('Bitte den offenen Reiseeintrag zuerst speichern oder schließen.');return;}
  editing=id?bookings.find(b=>b.id===id):null;formIdea=editing?.idea_id||idea?.id||null;
  const f=$('#booking-form');f.reset();f.elements.kind.value=editing?.kind||kind;
  for(const key of ['title','status','start_local','end_local','start_zone','end_zone','amount','currency','url','notes'])if(editing)f.elements[key].value=editing[key]??'';
  if(!editing&&idea){f.elements.title.value=idea.title;f.elements.url.value=idea.url||'';f.elements.notes.value=idea.description||'';}
  renderFields(f.elements.kind.value,editing?.details||{});$('#booking-error').textContent='';$('#booking-heading').textContent=editing?'Reiseeintrag bearbeiten':KINDS[f.elements.kind.value]+' hinzufügen';$('#booking-dialog').showModal();
 }
 async function settingsUpdate(patch,c){if(!settings)throw Error('Gemeinsame Einstellungen neu laden.');const r=await client().from('howdy_trip_settings').update({...patch,revision:nextRevision(settings.revision)}).eq('id',1).eq('revision',settings.revision).select();check(r,'Einstellungen konnten nicht gespeichert werden.');if(r.data.length!==1)throw Error('Inzwischen geändert. Bitte aktualisieren und erneut versuchen.');if(same(c))settings=r.data[0];}
 async function upload(c){
  const f=$('#document-form'),file=f.elements.file.files[0],info=await inspectUpload(file);
  const title=f.elements.title.value.trim();if(title.length<2)throw Error('Bezeichnung eingeben.');
  const id=crypto.randomUUID(),path=c.me+'/'+id+'.'+info.extension;
  const payload={id,path,title,booking_id:f.elements.booking_id.value||null,category:f.elements.category.value,file_name:info.file_name,mime_type:info.mime_type,bytes:info.bytes};
  $('#document-submit').disabled=true;$('#document-error').textContent='Wird hochgeladen …';let created=false;
  try{
   check(await client().from('howdy_documents').insert(payload),'Unterlage konnte nicht vorbereitet werden.');created=true;if(!same(c))return;
   check(await client().storage.from(BUCKET).upload(path,file,{upsert:false,contentType:info.mime_type,cacheControl:'0'}),'Upload fehlgeschlagen. Bitte Verbindung prüfen und erneut versuchen.');if(!same(c))return;
   const r=await client().from('howdy_documents').update({ready:true}).eq('id',id).select();check(r,'Datei übertragen, Abschluss noch offen. „Datei prüfen“ verwenden.');if(r.data.length!==1)throw Error('Upload-Abschluss fehlgeschlagen.');
   if(same(c)){f.reset();dirtyForms.delete('document-form');$('#document-error').textContent='Für die Gruppe gespeichert.';await load();toast('Unterlage hochgeladen.');}
  }catch(e){
   if(created&&same(c)){try{const removed=await client().storage.from(BUCKET).remove([path]);if(!removed.error)await client().from('howdy_documents').delete().eq('id',id);await load();}catch{}}
   throw e;
  }finally{$('#document-submit').disabled=false;}
 }
 async function download(id,c){
  const d=documents.find(x=>x.id===id&&x.ready);if(!d)return;
  const r=await client().storage.from(BUCKET).download(d.path);check(r,'Datei konnte nicht geladen werden. Bitte erneut anmelden oder aktualisieren.');if(!same(c))return;
  const url=URL.createObjectURL(new Blob([r.data],{type:'application/octet-stream'}));const a=document.createElement('a');
  const ext={'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/heic':'heic','image/heif':'heif'}[d.mime_type];
  a.href=url;a.download=d.file_name.replace(/\.[^.]*$/,'').replace(/[\\/<>:"|?*]/g,'_')+'.'+ext;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 document.addEventListener('click',async e=>{
  const target=e.target.closest('[data-book-new],[data-book-edit],[data-book-idea],[data-hub-refresh],[data-hub-vote],[data-doc-for],[data-doc-download],[data-doc-delete],[data-doc-recover],[data-hub-close]');
  if(!target)return;
  if(target.dataset.hubClose){if(busy)return;if(dirtyForms.has('booking-form')&&!await confirmAction('Ungespeicherte Änderungen an diesem Reiseeintrag verwerfen?'))return;dirtyForms.delete('booking-form');$('#booking-dialog').close();return;}
  if(target.dataset.bookNew){openBooking(target.dataset.bookNew);return;}
  if(target.dataset.bookEdit){openBooking('activity',target.dataset.bookEdit);return;}
  if(target.dataset.bookIdea){const i=ideas().find(i=>i.id===target.dataset.bookIdea);if(i)openBooking(i.kind==='hotel'?'hotel':'activity',null,i);return;}
  await run(async c=>{
   target.disabled=true;
   try{
    if(target.hasAttribute('data-hub-refresh')){await load();return;}
    if(target.dataset.hubVote==='idea'){
     const choice=target.dataset.choice,id=target.dataset.option,table='howdy_idea_ballots',key='idea_id';
     const query=choice==='clear'?client().from(table).delete().eq('member_key',c.me).eq(key,id):client().from(table).upsert({member_key:c.me,[key]:id,choice},{onConflict:'member_key,'+key});
     check(await query,'Stimme konnte nicht gespeichert werden.');await load();
    }else if(target.dataset.docFor){
     location.hash='unterlagen';$('#document-booking').value=target.dataset.docFor;const b=bookings.find(b=>b.id===target.dataset.docFor);if(b){$('#document-form').elements.category.value=b.kind==='activity'?'other':b.kind;$('#document-form').elements.title.value=b.title+' · Bestätigung';dirtyForms.add('document-form');}$('#document-form').elements.file.focus();
    }else if(target.dataset.docDownload){await download(target.dataset.docDownload,c);}
    else if(target.dataset.docDelete){
     const d=documents.find(d=>d.id===target.dataset.docDelete&&d.created_by===c.me);if(!d)return;
     if(!await confirmAction('„'+d.title+'“ für die Gruppe endgültig entfernen?'))return;if(!same(c))return;
     check(await client().storage.from(BUCKET).remove([d.path]),'Datei konnte nicht entfernt werden.');
     const removed=await client().from('howdy_documents').delete().eq('id',d.id).select('id');check(removed,'Datei entfernt; Listeneintrag konnte nicht entfernt werden. Bitte erneut versuchen.');await load();if(removed.data.length!==1&&documents.some(x=>x.id===d.id))throw Error('Der Listeneintrag ist noch vorhanden. Bitte erneut versuchen.');toast('Unterlage entfernt.');
    }else if(target.dataset.docRecover){
     const d=documents.find(d=>d.id===target.dataset.docRecover&&d.created_by===c.me);if(!d)return;
     const r=await client().storage.from(BUCKET).download(d.path);check(r,'Keine vollständige Datei gefunden. Den unvollständigen Eintrag entfernen und erneut hochladen.');
     if(r.data.size!==d.bytes)throw Error('Dateigröße stimmt nicht. Bitte entfernen und erneut hochladen.');
     const completed=await client().from('howdy_documents').update({ready:true}).eq('id',d.id).select('id');check(completed,'Abschluss fehlgeschlagen.');if(completed.data.length!==1)throw Error('Unterlage inzwischen geändert. Bitte aktualisieren.');await load();toast('Unterlage ist vollständig.');
    }
   }finally{target.disabled=false;}
  });
 });
 $('#booking-kind').addEventListener('change',e=>{const old=Object.fromEntries($$('#booking-fields input').map(el=>[el.name.slice(7),el.value]));renderFields(e.target.value,old);});
 $('#booking-form').addEventListener('submit',e=>{e.preventDefault();run(async c=>{
  const f=e.target,raw=Object.fromEntries(new FormData(f));raw.idea_id=formIdea;raw.details=Object.fromEntries(FIELDS[raw.kind].map(([k])=>[k,raw['detail-'+k]]));const draft=validateBooking(raw);
  $('#booking-save').disabled=true;$('#booking-error').textContent='';
  try{const r=editing?await client().from('howdy_bookings').update({...draft,revision:nextRevision(editing.revision)}).eq('id',editing.id).eq('revision',editing.revision).select():await client().from('howdy_bookings').insert(draft).select();check(r,'Reiseeintrag konnte nicht gespeichert werden.');if(r.data.length!==1)throw Error('Dieser Eintrag wurde inzwischen geändert. Eingaben bleiben erhalten; bitte kopieren, schließen und den gemeinsamen Stand aktualisieren.');if(same(c)){dirtyForms.delete('booking-form');$('#booking-dialog').close();await load();toast('Reiseeintrag für die Gruppe gespeichert.');}}
  finally{$('#booking-save').disabled=false;}
 },'#booking-error');});
 $('#document-form').addEventListener('submit',e=>{e.preventDefault();run(upload,'#document-error');});
 $('#album-form').addEventListener('submit',e=>{e.preventDefault();run(async c=>{const f=e.target,album_url=f.elements.album_url.value.trim(),album_label=f.elements.album_label.value.trim();if(album_url&&!safeURL(album_url))throw Error('Bitte einen gültigen HTTPS-Albumlink ohne Zugangsdaten eingeben.');if(!album_label)throw Error('Bezeichnung eingeben.');await settingsUpdate({album_url,album_label},c);if(same(c)){dirtyForms.delete('album-form');renderAlbum();$('#album-error').textContent='Für die Gruppe gespeichert.';}},'#album-error');});
 for(const id of ['booking-form','document-form','album-form'])$('#'+id).addEventListener('input',()=>dirtyForms.add(id));
 $('#booking-dialog').addEventListener('cancel',async e=>{e.preventDefault();if(busy)return;if(!dirtyForms.has('booking-form')||await confirmAction('Ungespeicherte Änderungen verwerfen?')){dirtyForms.delete('booking-form');$('#booking-dialog').close();}});
 $('#booking-dialog').addEventListener('close',()=>{editing=null;formIdea=null;dirtyForms.delete('booking-form');$('#booking-form').reset();});
 $('#hub-confirm-yes').addEventListener('click',()=>confirmDone(true));$('#hub-confirm-no').addEventListener('click',()=>confirmDone(false));
 $('#hub-confirm-dialog').addEventListener('cancel',e=>{e.preventDefault();confirmDone(false);});
 let printDetails=[];
 window.addEventListener('beforeprint',()=>{printDetails=$$('#trip-timeline details:not([open])');printDetails.forEach(d=>d.open=true);});
 window.addEventListener('afterprint',()=>{printDetails.forEach(d=>d.open=false);printDetails=[];});
 $('#trip-print').addEventListener('click',()=>window.print());
 function clear(){
  epoch++;bookings=[];documents=[];ballots=[];settings=null;editing=null;formIdea=null;dirtyForms.clear();
  if(confirmResolve)confirmDone(false);
  if($('#booking-dialog').open)$('#booking-dialog').close();
  for(const id of ['booking-form','document-form','album-form'])$('#'+id).reset();
  for(const id of ['booking-error','document-error','album-error'])$('#'+id).textContent='';
  render();
 }
 return {load,clear,ideaMarkup,isDirty:()=>dirtyForms.size>0,isBusy:()=>busy};
}

