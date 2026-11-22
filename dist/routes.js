// Calendar days include outbound travel and the overnight return to Europe.
export const TRIP={earliestStart:'2027-04-19',maxDays:14,checkedAt:'2026-11-22'};
export const DALLAS_TRIP={
  id:'dallas-nashville', title:'Von Dallas nach Nashville', days:13, start:TRIP.earliestStart, checkedAt:TRIP.checkedAt,
  photo:'fortworth', tag:'Routenvorschlag · 19. April bis 1. Mai 2027',
  airports:['Dallas/Fort Worth (DFW)','Nashville (BNA)'],
  intro:'Mit einem großen SUV von Texas nach Tennessee. Die Flüge stehen für die Planung fest. Unterkünfte, Mietwagen und Ausritte sind Vorschläge.',
  pace:'Am 27. April liegt die längste Etappe. Am Geburtstag steht der SUV auf der Ranch.',
  stops:[
  ["dallas", 2, "19.–21. April · Westernboots anprobieren und am Dienstag im Round-Up Saloon die ersten Schritte tanzen."],
  ["waco", 2, "21.–23. April · Wanderung über den Brazos, Texas-Whisky und ein Musikabend nach Spielplan."],
  ["fortworth", 2, "23.–25. April · Tanzfläche bei Billy Bob’s, dann Stockyards und Samstagabend-Rodeo."],
  ["mountvernon", 2, "25.–27. April · Ranchwege im Geländefahrzeug und ein geführter Geburtstagsausritt für vier."],
  ["memphis", 1, "27.–28. April · Ein Abend mit Live-Blues auf der Beale Street."],
  ["nashville", 2, "28.–30. April · Countrytanz im Nashville Palace und traditionelle Honky-Tonk-Musik am Broadway."]
  ],
  optional:[], note:'Bei Mount Vernon zeigt die Karte den Ortskern. Die Ranch liegt außerhalb.'
};
export const TRIP_DAYS=[
  ["Ankunft in Dallas", "British Airways ab Zürich um 10:35 Uhr, via London nach Dallas/Fort Worth um 17:05 Uhr. SUV abholen. Für den ersten Abend nur ein gemeinsames Essen einplanen."],
  ["Erster Tanzabend im Round-Up Saloon", "Tagsüber nach Westernboots schauen. Am Dienstag unterrichtet Dallas Does Dance im Round-Up Saloon um 20 und 21 Uhr zwei Anfängerkurse: einen Paartanz und einen Line Dance. Beide Paare können ohne Vorkenntnisse mitmachen.", "https://dallasdoesdance.org/pages/lessons"],
  ["Dallas → Waco · Raus an den Brazos", "Im Cameron Park den River Trail entlangwandern und zum Aussichtspunkt Lovers Leap hinauf. Abends in Waco essen.", "https://www.waco-texas.com/Departments/Parks-Recreation/Cameron-Park/Cameron-Park-Trail-System-Rules"],
  ["Texas-Whisky und eine Bühne in Waco", "Bei Balcones eine Führung mit Verkostung anfragen. Danach den SUV stehen lassen. Spielt im Backyard an diesem Donnerstag eine Countryband, dort den Abend verbringen. Das Konzertprogramm für den 22. April ist offen.", "https://destinationwaco.org/listing/balcones-distillery/"],
  ["Fort Worth · Freitag bei Billy Bob’s Texas", "Nach dem Einchecken zu Fuß durch die Stockyards und abends auf die Tanzfläche von Billy Bob’s Texas. Band, Einlass und Tickets für den 23. April im Kalender prüfen.", "https://www.fortworthstockyards.org/business/billy-bobs-texas"],
  ["Rodeo und White Elephant Saloon", "Tagsüber Zeit für die Sattler- und Westernläden. Um 19:30 Uhr ist im Cowtown Coliseum das Stockyards Championship Rodeo angesetzt. Anschließend zu Fuß zum White Elephant Saloon mit Live-Musik. Tickets offen.", "https://www.axs.com/events/1676078/stockyards-championship-rodeo-424-tickets"],
  ["Auf die Ranch · Mit dem UTV über die Wege", "Nach Mount Vernon fahren und die Cabin beziehen. Bei Deer Lake Cabins eine UTV-Tour für vier anfragen. Mit dem offenen Geländefahrzeug erkundet ihr die Ranchwege.", "https://deerlakecabins.com/activities/"],
  ["Geburtstag im Westernsattel", "Für Montag einen einstündigen geführten Ausritt für vier Anfänger anfragen. Der Listenpreis beträgt 70 US-$ pro Person. Anschließend Zeit am See und ein gemeinsamer Geburtstagsabend in der Cabin mit Texas-BBQ und einem veganen Hauptgericht. Ranch, Ausritt und Verpflegung sind noch offen.", "https://deerlakecabins.com/activities/"],
  ["Memphis · Blues im Rum Boogie Cafe", "Heute liegt die längste Fahretappe vor euch. Ohne weiteren Ausflugsstopp direkt nach Memphis. Nach dem Einchecken zu Fuß zur Beale Street. Im Rum Boogie Cafe gibt es laut Veranstalter jeden Abend Live-Blues.", "https://bealestreet.com/go/rum-boogie-cafe"],
  ["Nashville Palace · Country auf der Tanzfläche", "Von Memphis nach Nashville fahren. Im Nashville Palace gibt es mittwochs laut Hausprogramm offene Tanzfläche bis 22 Uhr. Der Line-Dance-Abend ist mittwochs ab 21 Jahren.", "https://www.thefamousnashvillepalace.com/contact"],
  ["Honky-Tonk-Abend am Broadway", "Tagsüber das Ryman Auditorium erkunden. Ab 18 Uhr zu Robert’s Western World: Eintritt ab 21 Jahren und traditionelle Countrymusik. Für den letzten Abend den SUV am Hotel lassen.", "https://nashvillelife.com/Roberts-Western-World/TN"],
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
