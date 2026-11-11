# Howdy Texas

Eigenständige Roadtrip-Website mit Western-Gestaltung, zehn Tageskarten und geschützter Gruppenplanung für vier Reisende.

## Aktueller Stand
- Neues Design, Regionalfilter, Tagesdetails, Kartenlinks und Druckansicht.
- Anmeldung mit Name und persönlichem Passwort vorbereitet.
- Gemeinsame Termine, Budget, Aufgaben, Notizen und eigene Favoriten vorbereitet.
- **Backend noch nicht freigegeben:** `dist/config.js` setzt `backendReady: false`. Deshalb bleibt die Anmeldung sichtbar als noch einzurichten; keine privaten Daten werden ungeschützt eingebettet.
- Das Repository ist privat. Die bestehende Sites-Veröffentlichung bleibt ebenfalls privat.

## Entwicklung
Keine Build-Abhängigkeiten. Node 22+, `npm test` und `npm run check`.
Vorschau: `python -m http.server 4178 --directory dist --bind 127.0.0.1`.

## Freigabe und Einrichtung
Der genaue Umfang, die Tests nach Einrichtung und der Rückweg stehen in [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md).
Der öffentliche Supabase-Schlüssel ist kein Passwort. Der Service-Schlüssel gehört ausschließlich in die vorhandene Edge-Umgebung. Persönliche Kontozuordnungen werden separat eingerichtet und sind nicht im Repository.

## Inhalte und Bilder
Reisevorschlag Nashville → San Antonio, noch ohne feste Termine oder bestätigte Buchungen. Fahrwerte sind grobe Schätzungen.
Titelbild: [Ryan Hefner / Unsplash](https://unsplash.com/photos/RW4uu6dJCpY), [Unsplash License](https://unsplash.com/license).
Das West-Texas-Foto ist ein Stimmungsbild, kein vorgeschlagener Routenstopp.
Supabase JS ist im Browser und in der Edge-Funktion auf 2.57.4 festgelegt.

