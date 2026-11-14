export const NAV_GROUPS=[
 {id:'start',label:'Start',href:'reiseinfos',views:[['reiseinfos','Reiseinfos']]},
 {id:'route',label:'Route',href:'routen',views:[['routen','Routenvorschläge'],['programm','Reiseziele'],['hotels','Hotelideen']]},
 {id:'buchungen',label:'Buchungen',href:'reiseplan',views:[['reiseplan','Reiseplan'],['anreise','Flüge'],['mietwagen','Mietwagen'],['planung','Budget & Aufgaben']]},
 {id:'unterlagen',label:'Unterlagen',href:'unterlagen',views:[['unterlagen','Tickets & Bestätigungen']]},
 {id:'gruppe',label:'Gruppe',href:'gruppe',views:[['gruppe','Unsere Crew'],['termine','Termine'],['fotos','Fotos']]}
];
const ALIASES={uebersicht:'reiseinfos',route:'programm',crew:'gruppe',reiseideen:'programm',start:'reiseinfos',buchungen:'reiseplan'};
export function resolveView(hash){
 const raw=String(hash||'').replace(/^#/,'').split('?')[0]||'reiseinfos',view=ALIASES[raw]||raw;
 const group=NAV_GROUPS.find(g=>g.views.some(([id])=>id===view))||NAV_GROUPS[0];
 return {view:group.views.some(([id])=>id===view)?view:'reiseinfos',group};
}
export function updateNavigation(view){
 const {group}=resolveView(view);
 document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===group.id)a.setAttribute('aria-current',a.hash==='#'+view?'page':'true');else a.removeAttribute('aria-current');});
 const sub=document.querySelector('#section-nav');sub.hidden=group.views.length===1;sub.setAttribute('aria-label',group.label+' – Unterbereiche');
 sub.innerHTML=group.views.map(([id,label])=>'<a href="#'+id+'"'+(id===view?' aria-current="page"':'')+'>'+label+'</a>').join('');
}
