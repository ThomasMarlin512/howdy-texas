import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBooking,zonedInstant,validateDates,calendarCells,overlaps,sumBookings,inspectUpload} from '../dist/travel-core.js';
const flight={kind:'flight',title:'Zürich – Dallas',status:'planned',start_local:'2027-04-22T10:00',end_local:'2027-04-22T14:00',start_zone:'Europe/Zurich',end_zone:'America/Chicago',amount:'950.50',currency:'EUR',url:'https://example.com/',details:{provider:'Airline'},notes:''};
test('flight chronology uses each airport timezone, not the browser timezone',()=>{
 const b=validateBooking(flight);assert.equal(zonedInstant(b.end_local,b.end_zone)-zonedInstant(b.start_local,b.start_zone),11*3600000);
 assert.equal(validateBooking({...flight,start_local:'2027-05-04T17:00',end_local:'2027-05-05T10:00',start_zone:'America/Chicago',end_zone:'Europe/Zurich'}).title,flight.title);
 assert.throws(()=>validateBooking({...flight,end_local:'2027-04-21T14:00'}));
 assert.throws(()=>zonedInstant('2027-03-14T02:30','America/Chicago'));
});
test('booking values and links reject invalid or unsafe data',()=>{
 assert.equal(validateBooking(flight).amount,950.5);
 assert.equal(validateBooking({...flight,amount:''}).amount,null);
 for(const patch of [{kind:'admin'},{status:'approved'},{amount:-2},{amount:'Infinity'},{currency:'BTC'},{url:'javascript:alert(1)'},{url:'https://user:password@example.com'},{start_local:null,end_local:flight.end_local},{start_zone:'invalid'}])assert.throws(()=>validateBooking({...flight,...patch}));
 assert.ok(!Object.hasOwn(validateBooking({...flight,details:{provider:'Airline',secret:'x'}}).details,'secret'));
});
test('date votes enforce Manu earliest departure and fourteen inclusive calendar days',()=>{
 assert.equal(validateDates('2027-04-22','2027-05-05').days,14);
 assert.throws(()=>validateDates('2027-04-21','2027-05-01'));
 assert.throws(()=>validateDates('2027-04-22','2027-05-06'));
 assert.throws(()=>validateDates('2027-04-31','2027-05-01'));
});
test('calendar highlights complete ranges spanning April and May',()=>{
 const options=[{id:'a',start_date:'2027-04-22',end_date:'2027-05-05'},{id:'b',start_date:'2027-04-25',end_date:'2027-04-30',archived:true}];
 const apr=calendarCells('2027-04',options),may=calendarCells('2027-05',options);
 assert.equal(apr.findIndex(Boolean),3);assert.equal(apr.filter(Boolean).length,30);
 assert.deepEqual(apr.find(c=>c?.date==='2027-04-25').options,['a']);
 assert.deepEqual(may.find(c=>c?.date==='2027-05-05').options,['a']);
 assert.deepEqual(may.find(c=>c?.date==='2027-05-06').options,[]);
});
test('only actual overlapping flights and activities warn; hotels and rentals can span days',()=>{
 const a={...validateBooking(flight),id:'a'},b={...a,id:'b',kind:'activity',start_zone:'America/Chicago',start_local:'2027-04-22T13:00',end_local:'2027-04-22T15:00'};
 assert.deepEqual([...overlaps([a,b])],['a','b']);
 assert.equal(overlaps([a,{...b,kind:'hotel'}]).size,0);
 assert.equal(overlaps([a,{...b,status:'idea'}]).size,0);
});
test('booked totals keep currencies separate and exclude ideas and cancellations',()=>{
 assert.deepEqual(sumBookings([{status:'booked',amount:100,currency:'EUR'},{status:'booked',amount:200,currency:'USD'},{status:'idea',amount:500,currency:'EUR'},{status:'cancelled',amount:80,currency:'USD'},{status:'booked',amount:null,currency:'EUR'}]),{EUR:100,USD:200});
});
test('uploads validate actual bytes, normalize unsafe file names and reject HTML or oversized files',async()=>{
 const pdf=new File(['%PDF-1.4\nHello'], '../evil.html',{type:'text/html'});const info=await inspectUpload(pdf);
 assert.equal(info.mime_type,'application/pdf');assert.equal(info.extension,'pdf');assert.ok(!info.file_name.includes('/'));assert.ok(info.file_name.endsWith('.pdf'));
 await assert.rejects(()=>inspectUpload(new File(['<html><script>bad</script>'],'ticket.pdf',{type:'application/pdf'})));
 await assert.rejects(()=>inspectUpload({size:10485761}));
 await assert.rejects(()=>inspectUpload(new File([],'empty.pdf')));
 const png=await inspectUpload(new File([new Uint8Array([137,80,78,71,13,10,26,10,0])],'photo.png'));assert.equal(png.mime_type,'image/png');
 const jpeg=await inspectUpload(new File([new Uint8Array([255,216,255,0])],'photo.jpg'));assert.equal(jpeg.mime_type,'image/jpeg');
 const heic=await inspectUpload(new File(['1234ftypheic0000'],'photo.HEIC'));assert.equal(heic.extension,'heic');
});
test('hub markup contains every static selector, gated page and no public document URLs',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),js=fs.readFileSync(new URL('../dist/travel.js',import.meta.url),'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 for(const [,id] of js.matchAll(/\$\('#([\w-]+)'\)/g))assert.ok(ids.includes(id),'Missing '+id);
 for(const view of ['mietwagen','reiseplan','unterlagen','termine','fotos']){const section=html.match(new RegExp('<section data-view="'+view+'"[\\s\\S]*?(?=<section data-view=|</main>)'))?.[0];assert.ok(section?.includes('class="private-gate"'));assert.ok(section?.includes('class="protected" hidden'));}
 assert.ok(!js.includes('getPublicUrl'));assert.ok(js.includes('upsert:false'));assert.ok(js.includes('URL.revokeObjectURL'));
});

