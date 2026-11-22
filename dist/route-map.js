import {ROUTES} from './routes.js';
import {ROAD_DATA} from './road-data.js';
import {routeMapData,distanceLabel,durationLabel,googleLegURL} from './route-map-core.js';
import {escapeHTML as esc} from './core.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const fmt=iso=>new Date(iso+'T12:00:00Z').toLocaleDateString('de-AT',{day:'2-digit',month:'2-digit',timeZone:'UTC'});
let leafletPromise,leafletReady=false;
function leaflet(){
 if(leafletReady&&window.L?.version==='1.9.4')return Promise.resolve(window.L);
 if(leafletPromise)return leafletPromise;
 leafletPromise=Promise.all([
  new Promise((resolve,reject)=>{const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';css.integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';css.crossOrigin='anonymous';const timeout=setTimeout(()=>{css.remove();reject(Error('Kartenstil konnte nicht geladen werden.'));},12000);css.onload=()=>{clearTimeout(timeout);resolve();};css.onerror=()=>{clearTimeout(timeout);css.remove();reject(Error('Kartenstil konnte nicht geladen werden.'));};document.head.append(css);}),
  new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';script.crossOrigin='anonymous';const timeout=setTimeout(()=>{script.remove();reject(Error('Karte konnte nicht geladen werden.'));},12000);script.onload=()=>{clearTimeout(timeout);resolve();};script.onerror=()=>{clearTimeout(timeout);script.remove();reject(Error('Karte konnte nicht geladen werden.'));};document.head.append(script);})
 ]).then(()=>{if(!window.L)throw Error('Karte momentan nicht verfügbar.');leafletReady=true;return window.L;}).catch(e=>{leafletPromise=null;throw e;});
 return leafletPromise;
}
export function createRouteExplorer(){
 let selected=ROUTES[0],data=routeMapData(selected),map=null,layer=null,legLayers=[],markers=[],loading=false,activeLeg=null,activeStop=null,tileErrors=0;
 const latLng=coordinate=>[coordinate[1],coordinate[0]];
 const live=message=>$('#route-map-status').textContent=message;
 function render(){
  data=routeMapData(selected);$('#map-route-select').value=selected.id;
  $('#route-map-title').textContent=selected.title;
  $('#route-map-summary').innerHTML='<div><span>Straßenstrecke</span><strong>'+distanceLabel(data.totalMeters)+'</strong></div><div><span>Reine Fahrzeit</span><strong>'+durationLabel(data.totalSeconds)+'</strong></div><div><span>Übernachtungen</span><strong>'+data.nights+' Nächte · '+data.stops.length+' Orte</strong></div><div><span>Fahrten über 4 Std.</span><strong>'+data.longDrives+'</strong></div>';
  $('#route-map-dates').textContent=fmt(data.start)+' – '+fmt(data.home)+'2027 · '+data.days+' Kalendertage inklusive Heimkehr';
  $('#map-stop-list').innerHTML=data.stops.map((s,i)=>'<li><button type="button" class="map-stop-button" data-map-stop="'+i+'" aria-pressed="false"><span class="stop-number">'+(i+1)+'</span><span><strong>'+esc(s.name)+'</strong><small>'+s.nights+' '+(s.nights===1?'Nacht':'Nächte')+' · '+fmt(s.arrival)+' – '+fmt(s.departure)+'</small></span></button></li>').join('');
  $('#map-leg-list').innerHTML=data.legs.map(l=>'<li class="map-leg'+(l.longDrive?' long-drive':'')+'"><div class="leg-heading"><span>Etappe '+(l.index+1)+' · '+fmt(l.date)+'</span>'+(l.longDrive?'<strong>Langer Fahrtag</strong>':'')+'</div><h4>'+esc(l.fromStop.name)+' → '+esc(l.toStop.name)+'</h4><p><b>'+distanceLabel(l.meters)+'</b><span>'+durationLabel(l.seconds)+'</span></p>'+(l.longDrive?'<p class="muted">Pausen zusätzlich einplanen und den Tag nicht mit weiteren Pflichtstopps füllen.</p>':'')+'<div class="hub-actions"><button type="button" class="quiet" data-map-leg="'+l.index+'" aria-pressed="false">Etappe auf Karte</button><a href="'+esc(googleLegURL(l))+'" target="_blank" rel="noopener noreferrer">In Google Maps öffnen ↗</a></div></li>').join('');
  $('#map-selection').textContent='Ort oder Etappe auswählen, um sie auf der Karte hervorzuheben.';
  $('#route-map-source-date').textContent=new Date((selected.checkedAt??ROAD_DATA.checkedAt)+'T12:00:00Z').toLocaleDateString('de-AT',{timeZone:'UTC'});
  if(map)draw();
 }
 function paint(){
  legLayers.forEach((p,i)=>p.setStyle({color:i===activeLeg?'#b94420':data.legs[i].longDrive?'#8a361c':'#243e32',weight:i===activeLeg?7:4,opacity:(activeLeg===null||i===activeLeg)?0.95:0.35,dashArray:data.legs[i].longDrive?'8 7':null}));
  markers.forEach((m,i)=>m.getElement()?.classList.toggle('is-selected',i===activeStop));
  $$('[data-map-leg]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mapLeg)===activeLeg)));
  $$('[data-map-stop]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mapStop)===activeStop)));
 }
 function fit(){
  if(!map||!layer?.getLayers().length)return;
  activeLeg=null;activeStop=null;map.closePopup();paint();map.invalidateSize({pan:false});map.fitBounds(layer.getBounds(),{padding:[32,32],maxZoom:9,animate:false});
  $('#map-selection').textContent='Gesamte Route: '+selected.title+'.';
 }
 function selectStop(i){
  const s=data.stops[i];if(!s)return;activeStop=i;activeLeg=null;paint();
  $('#map-selection').textContent=s.name+': '+s.nights+' '+(s.nights===1?'Nacht':'Nächte')+', '+fmt(s.arrival)+' – '+fmt(s.departure)+'.';
  if(map){map.setView(latLng(s.coordinates),10,{animate:false});markers[i].openPopup();}
 }
 function selectLeg(i){
  const l=data.legs[i];if(!l)return;activeLeg=i;activeStop=null;paint();
  $('#map-selection').textContent=l.fromStop.name+' → '+l.toStop.name+': '+distanceLabel(l.meters)+', '+durationLabel(l.seconds)+(l.longDrive?' · Langer Fahrtag.':'.');
  if(map){map.closePopup();map.fitBounds(legLayers[i].getBounds(),{padding:[35,35],maxZoom:10,animate:false});}
 }
 function draw(){
  const L=window.L;
  if(layer)layer.remove();layer=L.featureGroup().addTo(map);
  legLayers=data.legs.map(l=>L.polyline(l.coordinates.map(latLng),{color:'#243e32',weight:4}).on('click',()=>selectLeg(l.index)).addTo(layer));
  markers=data.stops.map(s=>{
   const m=L.marker(latLng(s.coordinates),{icon:L.divIcon({className:'roadtrip-pin',html:'<span>'+(s.index+1)+'</span>',iconSize:[36,36],iconAnchor:[18,18]}),title:s.name+', '+s.nights+' Nächte',alt:s.name,keyboard:true,autoPanOnFocus:false}).addTo(layer);
   const popup=document.createElement('div');popup.className='route-popup';const strong=document.createElement('strong');strong.textContent=s.name;const nights=document.createElement('p');nights.textContent=s.nights+' '+(s.nights===1?'Nacht':'Nächte')+' · '+fmt(s.arrival)+' – '+fmt(s.departure);const link=document.createElement('button');link.type='button';link.className='quiet';link.dataset.detail='destination-'+s.key;link.textContent='Reiseziel ansehen →';popup.append(strong,nights,link);m.bindPopup(popup).on('click',()=>selectStop(s.index));return m;
  });
  fit();
 }
 async function activate(){
  if(map){fit();return;}if(loading)return;
  loading=true;$('#route-map-retry').hidden=true;live('Karte wird geladen …');
  try{
   const L=await leaflet();
   if(document.querySelector('[data-view="routen"]').hidden)return;
   map=L.map('route-map',{scrollWheelZoom:false,dragging:!matchMedia('(pointer:coarse)').matches,touchZoom:true,doubleClickZoom:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false,attributionControl:true});
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap-Mitwirkende</a>',keepBuffer:1,referrerPolicy:'strict-origin-when-cross-origin'}).on('loading',()=>{tileErrors=0;}).on('tileerror',()=>{tileErrors++;live('Der Kartenhintergrund ist teilweise nicht verfügbar. Etappen, Entfernungen und Übernachtungen bleiben lesbar.');}).on('load',()=>{if(!tileErrors)live('Straßenkarte geladen. Nummern zeigen eure Übernachtungsorte.');}).addTo(map);
   L.control.scale({imperial:false}).addTo(map);$('#map-gesture').hidden=false;$('#map-gesture').setAttribute('aria-pressed',String(map.dragging.enabled()));$('#map-gesture').textContent=map.dragging.enabled()?'Verschieben sperren':'Karte verschieben';$('#route-map').classList.toggle('map-can-drag',map.dragging.enabled());
   map.zoomControl.getContainer().querySelector('.leaflet-control-zoom-in').setAttribute('aria-label','Karte vergrößern');
   map.zoomControl.getContainer().querySelector('.leaflet-control-zoom-out').setAttribute('aria-label','Karte verkleinern');
   draw();live('Nummern zeigen die Übernachtungsorte. Etappen und Nächte stehen auch unter der Karte.');
  }catch(e){if(map){map.remove();map=null;layer=null;}live(e.message+' Alle Streckendaten stehen weiterhin unterhalb.');$('#route-map-retry').hidden=false;}
  finally{loading=false;}
 }
 function choose(id){const r=ROUTES.find(r=>r.id===id);if(!r)return;selected=r;activeLeg=null;activeStop=null;render();if(!map&&!loading)activate();}
 $('#map-route-select').innerHTML=ROUTES.map(r=>'<option value="'+r.id+'">'+esc(r.title)+' · '+r.days+' Tage</option>').join('');
 $('#map-route-select').addEventListener('change',e=>choose(e.target.value));
 $('#route-map-reset').addEventListener('click',fit);
 $('#route-map-retry').addEventListener('click',activate);
 $('#map-gesture').addEventListener('click',e=>{if(!map)return;const enable=!map.dragging.enabled();enable?map.dragging.enable():map.dragging.disable();e.currentTarget.setAttribute('aria-pressed',String(enable));e.currentTarget.textContent=enable?'Verschieben sperren':'Karte verschieben';$('#route-map').classList.toggle('map-can-drag',enable);});
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-map-stop],[data-map-leg],[data-map-route]');if(!b)return;
  if(b.hasAttribute('data-map-stop'))selectStop(Number(b.dataset.mapStop));
  else if(b.hasAttribute('data-map-leg'))selectLeg(Number(b.dataset.mapLeg));
  else{choose(b.dataset.mapRoute);$('#route-explorer').scrollIntoView({behavior:'instant',block:'start'});$('#map-route-select').focus({preventScroll:true});}
 });
 render();return {activate};
}
