import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NAV_GROUPS,resolveView} from '../dist/navigation.js';
import {ROUTES} from '../dist/routes.js';
import {ROAD_DATA} from '../dist/road-data.js';
import {routeMapData,distanceLabel,durationLabel,googleLegURL,LONG_DRIVE_SECONDS} from '../dist/route-map-core.js';
test('five main sections retain every existing page and direct link',()=>{
 assert.deepEqual(NAV_GROUPS.map(g=>g.label),['Start','Route','Buchungen','Unterlagen','Gruppe']);
 const views=NAV_GROUPS.flatMap(g=>g.views.map(([id])=>id));
 assert.equal(views.length,12);assert.equal(new Set(views).size,12);
 for(const group of NAV_GROUPS){assert.ok(group.views.some(([id])=>id===group.href));for(const [view] of group.views){assert.equal(resolveView('#'+view).view,view);assert.equal(resolveView('#'+view).group.id,group.id);}}
 assert.equal(resolveView('#hotels').group.id,'route');
 assert.equal(resolveView('#mietwagen').group.id,'buchungen');
 assert.equal(resolveView('#termine').group.id,'gruppe');
 for(const [hash,view] of Object.entries({'#uebersicht':'reiseinfos','#route':'programm','#crew':'gruppe','#reiseideen':'programm','#routen?x=1':'routen','#unknown':'reiseinfos','':'reiseinfos'}))assert.equal(resolveView(hash).view,view);
});
test('each route uses directed road legs in overnight order and preserves exact nights',()=>{
 for(const route of ROUTES){const data=routeMapData(route);assert.equal(data.legs.length,route.stops.length-1);assert.equal(data.stops.reduce((n,s)=>n+s.nights,0),route.days-2);
  data.legs.forEach((l,i)=>{assert.equal(l.from,data.stops[i].key);assert.equal(l.to,data.stops[i+1].key);assert.equal(l.date,data.stops[i+1].arrival);assert.equal(l.date,data.stops[i].departure);});
  assert.equal(data.totalMeters,data.legs.reduce((n,l)=>n+l.meters,0));assert.equal(data.totalSeconds,data.legs.reduce((n,l)=>n+l.seconds,0));
 }
 assert.notEqual(ROAD_DATA.legs['austin--sanantonio'].meters,ROAD_DATA.legs['sanantonio--austin'].meters);
 const incomplete={...ROAD_DATA,legs:{...ROAD_DATA.legs}};delete incomplete.legs['fortworth--waco'];assert.throws(()=>routeMapData(ROUTES[0],incomplete));
});
test('road coordinates use longitude first and stay near the intended cities',()=>{
 const near=(a,b)=>Math.hypot((a[0]-b[0])*90,(a[1]-b[1])*111);
 for(const leg of Object.values(ROAD_DATA.legs)){
  assert.ok(leg.meters>50000&&leg.meters<800000);assert.ok(leg.seconds>0&&leg.seconds<10*3600);
  assert.ok(near(leg.coordinates[0],ROAD_DATA.points[leg.from].coordinates)<1);
  assert.ok(near(leg.coordinates.at(-1),ROAD_DATA.points[leg.to].coordinates)<1);
  for(const [lon,lat] of leg.coordinates){assert.ok(lon>-105&&lon<-80);assert.ok(lat>25&&lat<40);}
  assert.equal(new URL(leg.source).hostname,'routing.openstreetmap.de');
 }
});
test('long drive warnings use actual duration rather than rounded display',()=>{
 assert.deepEqual(ROUTES.map(r=>routeMapData(r).longDrives),[1,0,0,1,2]);
 assert.equal(routeMapData(ROUTES[3]).legs[0].longDrive,false);
 const modified=structuredClone(ROAD_DATA),first=modified.legs['fortworth--waco'];first.seconds=LONG_DRIVE_SECONDS;
 assert.equal(routeMapData(ROUTES[0],modified).legs[0].longDrive,false);
 first.seconds++;assert.equal(routeMapData(ROUTES[0],modified).legs[0].longDrive,true);
 assert.equal(durationLabel(3.91*3600),'ca. 4 Std.');assert.equal(durationLabel(5.62*3600),'ca. 5 Std. 45 Min.');
 assert.equal(distanceLabel(304123),'ca. 305 km');
});
test('directions links preserve each endpoint without dropping mobile waypoints',()=>{
 for(const route of ROUTES)for(const leg of routeMapData(route).legs){const u=new URL(googleLegURL(leg));assert.equal(u.origin,'https://www.google.com');assert.equal(u.searchParams.get('travelmode'),'driving');assert.equal(u.searchParams.get('origin'),[...leg.fromStop.coordinates].reverse().join(','));assert.equal(u.searchParams.get('destination'),[...leg.toStop.coordinates].reverse().join(','));assert.equal(u.searchParams.has('waypoints'),false);}
});
test('navigation and map controls have matching markup and a readable fallback',()=>{
 const read=p=>fs.readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');
 const html=read('index.html'),nav=html.match(/<nav class="view-nav"[\s\S]*?<\/nav>/)[0];
 assert.equal([...nav.matchAll(/data-nav=/g)].length,5);
 for(const group of NAV_GROUPS){assert.ok(nav.includes('data-nav="'+group.id+'"'));assert.ok(nav.includes('href="#'+group.href+'"'));}
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 for(const file of ['route-map.js','navigation.js'])for(const [,id]of read(file).matchAll(/\$\('#([\w-]+)'\)/g))assert.ok(ids.includes(id),'Missing '+id);
 for(const view of NAV_GROUPS.flatMap(g=>g.views.map(([id])=>id)))assert.ok(html.includes('data-view="'+view+'"'));
 assert.ok(html.includes('id="map-stop-list"'));assert.ok(html.includes('id="map-leg-list"'));assert.ok(html.includes('Keine Live-Verkehrsdaten'));assert.ok(html.includes('fixthemap'));
 assert.ok(read('route-map.js').includes('scrollWheelZoom:false'));assert.ok(read('route-map.js').includes('if(document.querySelector'));
});
