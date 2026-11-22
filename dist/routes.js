// Calendar days include outbound travel and the overnight return to Europe.
export const TRIP={earliestStart:'2027-04-20',maxDays:14,checkedAt:'2026-11-22'};
export const DALLAS_TRIP={
  id:'dallas-runde', title:'Unsere Texas-Runde ab Dallas', days:12, start:TRIP.earliestStart, checkedAt:TRIP.checkedAt,
  photo:'fortworth', tag:'Gewählte Reise · 20. April bis 1. Mai 2027',
  airports:['Dallas/Fort Worth (DFW)','Dallas/Fort Worth (DFW)'],
  intro:'Zehn Nächte zwischen den Stockyards und dem Hill Country. Den SUV übernehmen wir bei der Ankunft in Dallas/Fort Worth und geben ihn am selben Flughafen zurück.',
  pace:'Die längste Fahrt liegt am Vortag des Rückflugs. Die letzte Nacht verbringen wir in Dallas.',
  stops:[
    ['fortworth',2,'20.–22. April · Nach dem Flug in Ruhe ankommen. Der volle zweite Tag gehört den Stockyards.'],
    ['waco',1,'22.–23. April · Magnolia Silos und ein Spaziergang über die Suspension Bridge.'],
    ['austin',2,'23.–25. April · South Congress, Lady Bird Lake und ein Abend mit Live-Musik.'],
    ['sanantonio',2,'25.–27. April · Auf der Anreise Pause in Gruene. In San Antonio bleiben Zeit für den River Walk und Mission San José.'],
    ['hillcountry',2,'27.–29. April · Fredericksburg als Basis für Luckenbach und einen Ausflug zum Enchanted Rock.'],
    ['dallas',1,'29.–30. April · Rückfahrt aus dem Hill Country. Hotel mit guter Anbindung an DFW wählen.']
  ],
  optional:['gruene'], note:'Für Konzerte, Eintrittskarten und Unterkünfte prüft die Gruppe Termine und Verfügbarkeit.'
};
export const TRIP_DAYS=[
  ['Ankunft in Texas','14:15 Uhr Landung in Dallas/Fort Worth. Nach Einreise und Gepäckausgabe den SUV übernehmen und nach Fort Worth fahren. Für den ersten Abend nur ein gemeinsames Essen vorsehen.'],
  ['Fort Worth Stockyards','Die Exchange Avenue und die historischen Viehhöfe zu Fuß erkunden. Wer den Viehtrieb sehen möchte, schaut vorher in den Tageskalender.','https://www.fortworthstockyards.org/'],
  ['Fort Worth → Waco','Nach dem Einchecken zu den Magnolia Silos. Am späten Nachmittag über die Suspension Bridge am Brazos River spazieren.','https://www.destinationwaco.org/'],
  ['Waco → Austin','Nach Austin fahren, auf South Congress bummeln und abends in einen Musikclub einkehren.','https://www.austintexas.org/'],
  ['Ein ganzer Tag in Austin','Vormittags das Texas Capitol ansehen, nachmittags ein Stück am Lady Bird Lake gehen. Zeit für Foodtrucks und einen freien Abend lassen.','https://tspb.texas.gov/plan/tours/tours.html'],
  ['Über Gruene nach San Antonio','In Gruene Mittagspause machen und bei der Gruene Hall vorbeischauen. Nach der Weiterfahrt am River Walk essen.','https://www.gruenetexas.com/'],
  ['San Antonios Missionen','Vormittags Mission San José besuchen. Nachmittags je nach Interesse das Alamo besichtigen oder am River Walk bleiben.','https://www.nps.gov/saan/planyourvisit/basicinfo.htm'],
  ['San Antonio → Fredericksburg','In Fredericksburg einchecken und die Main Street erkunden. Luckenbach ist unser Vorschlag für den Country-Abend. Das Musikprogramm vorab prüfen.','https://www.luckenbachtexas.com/'],
  ['Enchanted Rock oder Fredericksburg','Bei gutem Wetter am Vormittag zum Enchanted Rock fahren. Tagespass vorab prüfen. Wer einen ruhigeren Tag möchte, bleibt in Fredericksburg.','https://tpwd.texas.gov/state-parks/enchanted-rock'],
  ['Fredericksburg → Dallas','Rund 420 km und fünf Stunden reine Fahrzeit. Pause einplanen, in Dallas einchecken und gemeinsam BBQ essen.'],
  ['Mietwagen zurückgeben und heimfliegen','Früh zum Mietwagenzentrum DFW fahren. Der Flug nach Chicago startet um 12:21 Uhr, der Anschluss nach Zürich um 15:50 Uhr Ortszeit.'],
  ['Zurück in Vorarlberg','07:45 Uhr Landung in Zürich. Nach Gepäckausgabe gemeinsame Heimfahrt nach Bürs oder Nenzing.']
];
export const ROUTES=[DALLAS_TRIP,
  {
    "id": "texas-kompakt",
    "title": "Texas kompakt",
    "days": 10,
    "photo": "fortworth",
    "tag": "Für zehn Tage",
    "airports": [
      "Dallas/Fort Worth (DFW)",
      "San Antonio (SAT)"
    ],
    "intro": "Cowboy-Flair, Musik und Hill Country mit vier Übernachtungsorten. Unser Vorschlag, wenn die Heimkehr am 1. Mai bleiben soll.",
    "pace": "Überschaubare Strecke innerhalb von Texas; kein zusätzlicher Inlandflug eingeplant.",
    "stops": [
      [
        "fortworth",
        2,
        "Basis für die Stockyards; Dallas bei Interesse als Ausflug."
      ],
      [
        "austin",
        2,
        "Auf der Anfahrt Waco optional als Pause. Musikabend und South Congress."
      ],
      [
        "hillcountry",
        2,
        "Fredericksburg und Luckenbach, mit Zeit für Landstraßen."
      ],
      [
        "sanantonio",
        2,
        "River Walk und Alamo. Am 30. April beginnt der Rückflug."
      ]
    ],
    "optional": [
      "waco",
      "dallas"
    ],
    "note": "Gruene ist eine mögliche Alternative zu einem anderen Zwischenstopp. Nicht alle Zusatzideen in diese kurze Variante packen."
  },
  {
    "id": "texas-ranch",
    "title": "Texas mit Ranch-Pause",
    "days": 12,
    "photo": "bandera",
    "tag": "Unser Favorit für mehr Ruhe",
    "airports": [
      "Dallas/Fort Worth (DFW)",
      "San Antonio (SAT)"
    ],
    "intro": "Zwei zusätzliche Nächte für ein Ranch-Erlebnis bei Bandera. Eine gute Mischung aus Städten, kleinen Orten und Cowboy-Alltag.",
    "pace": "Fünf Übernachtungsorte, jeweils zwei Nächte. Mehr Zeit für Texas als bei einer Route ab Nashville.",
    "stops": [
      [
        "fortworth",
        2,
        "Stockyards und optional Dallas."
      ],
      [
        "austin",
        2,
        "Live-Musik und Stadtbummel; Waco kann als Pause auf der Anfahrt passen."
      ],
      [
        "hillcountry",
        2,
        "Fredericksburg und Luckenbach."
      ],
      [
        "bandera",
        2,
        "Ranchpaket oder Ausritt anfragen; Reiten bleibt freiwillig."
      ],
      [
        "sanantonio",
        2,
        "Entspannter Abschluss und Rückflug am 2. Mai."
      ]
    ],
    "optional": [
      "waco",
      "gruene"
    ],
    "note": "Ranchpakete können Mindestaufenthalte haben. Gruene lässt sich bei Bedarf gegen einen anderen Zwischenstopp tauschen."
  },
  {
    "id": "musik-texas",
    "title": "Von Nashville nach Texas",
    "days": 14,
    "photo": "nashville",
    "tag": "Für Country- & Bluesfans",
    "airports": [
      "Nashville (BNA)",
      "San Antonio (SAT)"
    ],
    "intro": "Die Musikstädte bleiben drin, danach geht es über Arkansas zu den Stockyards und nach Texas. Die Variante mit dem größten Fahranteil.",
    "pace": "Sechs Übernachtungsorte und mehrere längere Transfers. Insbesondere Hot Springs–Fort Worth braucht einen großzügigen Fahrtag.",
    "stops": [
      [
        "nashville",
        3,
        "Ankommen, Broadway und Zeit für eine ausgewählte Show."
      ],
      [
        "memphis",
        2,
        "Beale Street und je nach Interesse Sun Studio oder Graceland."
      ],
      [
        "hotsprings",
        1,
        "Kurze Pause an der Bathhouse Row."
      ],
      [
        "fortworth",
        2,
        "Stockyards; Dallas nur, wenn Zeit und Energie bleiben."
      ],
      [
        "austin",
        2,
        "Musik und Foodtrucks."
      ],
      [
        "sanantonio",
        2,
        "River Walk und Rückflug am 4. Mai."
      ]
    ],
    "optional": [
      "littlerock",
      "waco",
      "gruene"
    ],
    "note": "Little Rock ist als Pause oder Ersatz für Hot Springs gedacht. Bandera, Hill Country und New Orleans zusätzlich würden diese Route zu dicht machen."
  },
  {
    "id": "golfkueste",
    "title": "New Orleans & Texas-Küste",
    "days": 14,
    "photo": "neworleans",
    "tag": "Jazz, Raumfahrt & Meer",
    "airports": [
      "New Orleans (MSY)",
      "Austin (AUS)"
    ],
    "intro": "Eine eigene Alternative mit Jazz in Louisiana, Houston und einer Küstenpause in Galveston. Danach San Antonio und Austin.",
    "pace": "Fünf Übernachtungsorte. New Orleans–Houston ist eine lange Fahretappe; mit Pausen einen vollen Transfer-Tag vorsehen.",
    "stops": [
      [
        "neworleans",
        3,
        "French Quarter und Frenchmen Street; Veranstaltungszeiten prüfen."
      ],
      [
        "houston",
        2,
        "Ein Tag für Space Center Houston oder die Museen."
      ],
      [
        "galveston",
        2,
        "Küste und Strand District, wetterabhängig."
      ],
      [
        "sanantonio",
        3,
        "River Walk, Alamo und Luft für einen ruhigen Tag."
      ],
      [
        "austin",
        2,
        "Abschluss mit Musik; Rückflug am 4. Mai."
      ]
    ],
    "optional": [
      "gruene"
    ],
    "note": "Diese Route ersetzt Nashville und Memphis. Wenn ihr weniger fahren möchtet: New Orleans weglassen und die zusätzlichen Nächte in Texas verteilen."
  }
];
export function addDays(iso,days){const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function travelWindow(days,start=TRIP.earliestStart){
 if(!Number.isInteger(days)||days<3||days>TRIP.maxDays)throw Error('Reisedauer außerhalb des Rahmens');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||Number.isNaN(Date.parse(start+'T12:00:00Z'))||addDays(start,0)!==start||start<TRIP.earliestStart)throw Error('Abreise frühestens am 20.04.2027');
 return {start,days,nights:days-2,departUS:addDays(start,days-2),home:addDays(start,days-1)};
}
export function routeSchedule(route){
 const window=travelWindow(route.days,route.start ?? '2027-04-22');let offset=0;
 const stops=route.stops.map(([key,nights,note])=>{if(!Number.isInteger(nights)||nights<1)throw Error('Ungültige Übernachtungszahl');const arrival=addDays(window.start,offset);offset+=nights;return{key,nights,note,arrival,departure:addDays(window.start,offset)};});
 if(offset!==window.nights)throw Error('Übernachtungen passen nicht zur Reisedauer');
 return {...window,stops};
}
