import test from 'node:test';
import assert from 'node:assert/strict';
import {TRIP,ROUTES,travelWindow,routeSchedule,addDays} from '../dist/routes.js';
import {IDEAS,PHOTOS} from '../dist/data.js';
test('ten, twelve and fourteen days include overnight return and homecoming',()=>{
 for(const [days,nights,departUS,home] of [[10,8,'2027-04-30','2027-05-01'],[12,10,'2027-05-02','2027-05-03'],[14,12,'2027-05-04','2027-05-05']]){
  assert.deepEqual(travelWindow(days),{start:'2027-04-22',days,nights,departUS,home});
 }
 assert.equal(travelWindow(14,'2027-04-24').home,'2027-05-07');
});
test('no departure before Manu is available and no trip beyond fourteen days',()=>{
 for(const d of [0,2,15,60,12.5,NaN])assert.throws(()=>travelWindow(d));
 for(const s of ['2027-04-21','2027-04-31','2027-02-30','not-a-date'])assert.throws(()=>travelWindow(14,s));
});
test('all routes have continuous stays, exact nights, real destination links and a final flight day',()=>{
 for(const r of ROUTES){
  const w=routeSchedule(r);assert.ok(r.days<=TRIP.maxDays);assert.ok(PHOTOS[r.photo]);
  assert.equal(w.stops[0].arrival,TRIP.earliestStart);
  assert.equal(w.stops.at(-1).departure,w.departUS);
  assert.equal(addDays(w.departUS,1),w.home);
  assert.equal((Date.parse(w.home)-Date.parse(w.start))/86400000+1,r.days);
  for(let j=0;j<w.stops.length;j++){const s=w.stops[j];assert.ok(IDEAS.some(i=>i.id==='destination-'+s.key));assert.equal((Date.parse(s.departure)-Date.parse(s.arrival))/86400000,s.nights);if(j)assert.equal(s.arrival,w.stops[j-1].departure);}
  for(const key of r.optional)assert.ok(IDEAS.some(i=>i.id==='destination-'+key));
 }
 assert.throws(()=>routeSchedule({...ROUTES[0],stops:[['austin',9,'']]}));
});
