import {routeSchedule} from './routes.js';
import {ROAD_DATA} from './road-data.js';
export const LONG_DRIVE_SECONDS=4*3600;
export const minutesFor=seconds=>Math.ceil(seconds/900)*15;
export const distanceLabel=meters=>'ca. '+new Intl.NumberFormat('de-AT').format(Math.round(meters/5000)*5)+' km';
export function durationLabel(seconds){const m=minutesFor(seconds);return 'ca. '+Math.floor(m/60)+' Std.'+(m%60?' '+m%60+' Min.':'');}
export function routeMapData(route,roads=ROAD_DATA){
 const schedule=routeSchedule(route);
 const stops=schedule.stops.map((s,index)=>{const point=roads.points[s.key];if(!point)throw Error('Ort fehlt: '+s.key);return {...s,...point,index};});
 const legs=stops.slice(1).map((to,i)=>{
  const from=stops[i],road=roads.legs[from.key+'--'+to.key];
  if(!road||road.from!==from.key||road.to!==to.key||!Number.isFinite(road.meters)||road.meters<=0||!Number.isFinite(road.seconds)||road.seconds<=0||road.coordinates?.length<2)throw Error('Straßenetappe fehlt: '+from.key+' – '+to.key);
  return {...road,index:i,date:from.departure,longDrive:road.seconds>LONG_DRIVE_SECONDS,fromStop:from,toStop:to};
 });
 return {...schedule,stops,legs,totalMeters:legs.reduce((v,l)=>v+l.meters,0),totalSeconds:legs.reduce((v,l)=>v+l.seconds,0),longDrives:legs.filter(l=>l.longDrive).length};
}
export function googleLegURL(leg){
 const start=leg.fromStop.coordinates,end=leg.toStop.coordinates;
 const q=new URLSearchParams({api:'1',origin:start[1]+','+start[0],destination:end[1]+','+end[0],travelmode:'driving'});
 return 'https://www.google.com/maps/dir/?'+q;
}
