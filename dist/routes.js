// Calendar days include outbound travel and the overnight return to Europe.
export const TRIP={earliestStart:'2027-04-19',maxDays:14,checkedAt:'2026-11-22'};
export const DALLAS_TRIP={
  id:'dallas-nashville', title:'Von Dallas nach Nashville', days:13, start:TRIP.earliestStart, checkedAt:TRIP.checkedAt,
  photo:'fortworth', tag:'Routenvorschlag · 19. April bis 1. Mai 2027',
  airports:['Dallas/Fort Worth (DFW)','Nashville (BNA)'],
  intro:'Mit einem großen SUV von Texas nach Tennessee. Die Flüge stehen für die Planung fest. Unterkünfte, Mietwagen und Ausritte sind Vorschläge.',
  pace:'Am 27. April liegt die längste Etappe. Am Geburtstag steht der SUV auf der Ranch.',
  stops:[
  ["dallas", 2, "19.–21. April · Mit dem Muscle-Car zum White Rock Lake, abends Line Dance im Round-Up Saloon."],
  ["wildcatter", 2, "21.–23. April · Auf dem Weg wandern, in Cabin Suites schlafen und am nächsten Morgen mit den Wranglern ausreiten."],
  ["fortworth", 2, "23.–25. April · Tanzfläche bei Billy Bob’s, dann Stockyards und Samstagabend-Rodeo."],
  ["mountvernon", 2, "25.–27. April · Zwei Nächte am Deer Lake. Am Geburtstag zu viert im UTV durch die Piney Woods, dann Kajak und BBQ am See."],
  ["memphis", 1, "27.–28. April · Ein Abend mit Live-Blues auf der Beale Street."],
  ["nashville", 2, "28.–30. April · Countrytanz im Nashville Palace und traditionelle Honky-Tonk-Musik am Broadway."]
],
  optional:[], note:'Die Karte führt zu beiden Ranchzufahrten. Die Wanderung bei Mineral Wells und die Dallas-Rundfahrt kommen zur direkten Straßenstrecke hinzu.'
};
export const TRIP_DAYS=[
  ["Ankunft in Dallas", "British Airways ab Zürich um 10:35 Uhr, via London nach Dallas/Fort Worth um 17:05 Uhr. SUV abholen. Für den ersten Abend nur ein gemeinsames Essen einplanen.", null, "dallas"],
  ["Mit dem Muscle-Car zum White Rock Lake", "Vormittags einen Viersitzer bei Dallas Exotics in Downtown übernehmen. Über Lakewood zum White Rock Lake fahren, für Picknick und Fotos am See halten. Nachmittags zurück zur selben Station, solange sie geöffnet ist. SUV und Koffer bleiben am Hotel. Abends per Taxi zum Round-Up Saloon für den Anfängertanzkurs. Tagespreis und Modell sind offen.", "https://www.enterprise.com/en/car-rental-locations/us/tx/dallas-exotics-09xl.html", "mustang"],
  ["Durch die Sandsteinfelsen zur Wildcatter Ranch", "Von Dallas mit dem SUV zum Lake Mineral Wells State Park. Vom Ostufer führt der Red Waterfront Trail zu den Felswänden von Penitentiary Hollow. Der Park nennt 1,3 km und 45 Minuten für den einfachen Weg. Mit Rückweg und Fotostopps rund zwei Stunden einplanen. Weiter zu den Cabin Suites bei Graham. Für den Abend im Steakhouse ein veganes Hauptgericht vorab bestätigen lassen.", "https://tpwd.texas.gov/state-parks/lake-mineral-wells/trails-info"],
  ["Longhorns und euer erster Western-Ausritt", "Laut Ranch beginnt die Longhorn-Fütterung um 9 Uhr. Für 11 Uhr den geführten Ausritt im Schritttempo anfragen. Für vier Anfänger passt die einstündige Runde. Listenpreis 85 US-$ pro Person, zusammen 340 US-$ vor Steuern und Trinkgeld. Nachmittags als Option mit dem SUV zum Possum Kingdom Lake. Ausritt und Zeiten für Donnerstag sind noch offen.", "https://wildcatterranch.com/activities/horse-trails/", "brazos"],
  ["Fort Worth · Freitag bei Billy Bob’s Texas", "Vormittags von der Ranch nach Fort Worth. Nachmittags die Stockyards zu Fuß erkunden und den Longhorn-Cattle-Drive ansehen, wenn er stattfindet. Abends zum Two-Step bei Billy Bob’s Texas. Besetzung und Einlass für Freitag beim Veranstalter prüfen.", "https://www.fortworthstockyards.org/business/billy-bobs-texas", "fortworth"],
  ["Rodeo und White Elephant Saloon", "Tagsüber Zeit für die Sattler- und Westernläden. Um 19:30 Uhr ist im Cowtown Coliseum das Stockyards Championship Rodeo angesetzt. Anschließend zu Fuß zum White Elephant Saloon mit Live-Musik. Tickets offen.", "https://www.axs.com/events/1676078/stockyards-championship-rodeo-424-tickets"],
  ["Einziehen am Deer Lake", "Von Fort Worth rund drei Stunden bis Mount Vernon einplanen. Vor dem Check-in fürs Geburtstagsessen einkaufen. Unser Hausvorschlag Kangaroo Corner hat zwei Schlafzimmer mit eigenem Bad, einen privaten Steg und eine Feuerstelle. Abends zu viert am Wasser essen. Fotos der Zimmer, Terrasse und des Stegs beim Anbieter ansehen.", "https://deerlakecabins.com/kc/"],
  ["Geburtstag auf vier Rädern und im Kajak", "Vormittags ein viersitziges Side-by-Side für alle vier übernehmen und die ausgeschilderten Ranchwege erkunden. Insgesamt gibt es rund 24 km Wege. Nachmittags mit den Kajaks aufs Wasser. Am Abend am Haus Steaks und ein veganes BBQ mit Portobellos und Mais vorbereiten. UTV laut Ranch ab 75 US-$; Preis für den Viersitzer und den gewünschten Zeitraum offen. Reservierungen öffnen laut Ranch 14 Tage vor Anreise.", "https://deerlakecabins.com/activities/", "pines"],
  ["Memphis · Blues im Rum Boogie Cafe", "Heute liegt die längste Fahretappe vor euch. Für die rund 575 km etwa 6½ Stunden reine Fahrt und zusätzlich Zeit für Mittagessen und Fahrerwechsel einplanen. Nach dem Einchecken zu Fuß zur Beale Street. Im Rum Boogie Cafe gibt es laut Veranstalter jeden Abend Live-Blues.", "https://bealestreet.com/go/rum-boogie-cafe", "memphis"],
  ["Nashville Palace · Country auf der Tanzfläche", "Von Memphis nach Nashville fahren. Im Nashville Palace gibt es mittwochs laut Hausprogramm offene Tanzfläche bis 22 Uhr. Der Line-Dance-Abend ist mittwochs ab 21 Jahren.", "https://www.thefamousnashvillepalace.com/contact"],
  ["Honky-Tonk-Abend am Broadway", "Tagsüber das Ryman Auditorium erkunden. Ab 18 Uhr zu Robert’s Western World: Eintritt ab 21 Jahren und traditionelle Countrymusik. Für den letzten Abend den SUV am Hotel lassen.", "https://nashvillelife.com/Roberts-Western-World/TN", "nashville"],
  ["Rückflug ab Nashville", "Den SUV gegen 09:30 Uhr am Flughafen BNA zurückgeben. United startet um 13:10 Uhr nach Washington-Dulles. Um 17:35 Uhr geht es weiter nach Zürich."],
  ["Heimkehr", "Landung in Zürich um 08:05 Uhr. Nach der Gepäckausgabe gemeinsame Heimfahrt nach Bürs oder Nenzing."]
];
export const ROUTES=[DALLAS_TRIP];
export function addDays(iso,days){const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function travelWindow(days,start=TRIP.earliestStart){
 if(!Number.isInteger(days)||days<3||days>TRIP.maxDays)throw Error('Reisedauer außerhalb des Rahmens');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||Number.isNaN(Date.parse(start+'T12:00:00Z'))||addDays(start,0)!==start||start<TRIP.earliestStart)throw Error('Abreise frühestens am 19.04.2027');
 return {start,days,nights:days-2,departUS:addDays(start,days-2),home:addDays(start,days-1)};
}
export function routeSchedule(route){
 const window=travelWindow(route.days,route.start ?? '2027-04-22');let offset=0;
 const stops=route.stops.map(([key,nights,note])=>{if(!Number.isInteger(nights)||nights<1)throw Error('Ungültige Übernachtungszahl');const arrival=addDays(window.start,offset);offset+=nights;return{key,nights,note,arrival,departure:addDays(window.start,offset)};});
 if(offset!==window.nights)throw Error('Übernachtungen passen nicht zur Reisedauer');
 return {...window,stops};
}
