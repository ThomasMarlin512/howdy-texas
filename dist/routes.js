// Calendar days include outbound travel and the overnight return to Europe.
export const TRIP={earliestStart:'2027-04-22',maxDays:14,checkedAt:'2026-11-12'};
export const ROUTES=[
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
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||Number.isNaN(Date.parse(start+'T12:00:00Z'))||addDays(start,0)!==start||start<TRIP.earliestStart)throw Error('Abreise frühestens am 22.04.2027');
 return {start,days,nights:days-2,departUS:addDays(start,days-2),home:addDays(start,days-1)};
}
export function routeSchedule(route){
 const window=travelWindow(route.days);let offset=0;
 const stops=route.stops.map(([key,nights,note])=>{if(!Number.isInteger(nights)||nights<1)throw Error('Ungültige Übernachtungszahl');const arrival=addDays(window.start,offset);offset+=nights;return{key,nights,note,arrival,departure:addDays(window.start,offset)};});
 if(offset!==window.nights)throw Error('Übernachtungen passen nicht zur Reisedauer');
 return {...window,stops};
}
