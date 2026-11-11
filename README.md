# Howdy Texas

Eigenständige Roadtrip-Website mit Western-Gestaltung und zehn Tageskarten.

## Anmeldung
Vorname ohne Beachtung der Groß-/Kleinschreibung und das vereinbarte Gruppenpasswort. Die Passwortschreibweise zählt genau. Vier unabhängige Texas-Zugänge; Passwort und persönliche Kontodaten sind nicht im Quellcode.

## Funktionen
Gemeinsamer Reisezeitraum, Budget, Aufgaben, Notizen und persönliche Favoriten. Speicherung erfolgt für die angemeldete Reisegruppe in Supabase. Gleichzeitige Änderungen werden über Revisionen geprüft.

## Entwicklung
Node 22+, keine Build-Abhängigkeiten.
`npm test` und `npm run check`.
Vorschau: `python -m http.server 4178 --directory dist --bind 127.0.0.1`.
[Einrichtung und geprüfte Zugriffsbeschränkungen](backend/DEPLOYMENT.md).

## Hosting
Das eigene Repository und die bestehende Sites-Veröffentlichung sind weiterhin privat. Die Freigabe eines öffentlichen Hostings ist noch offen.

## Inhalte
Routenvorschlag Nashville → San Antonio, ohne feste Termine oder bestätigte Buchungen.
Titelbild: [Ryan Hefner / Unsplash](https://unsplash.com/photos/RW4uu6dJCpY), [Unsplash License](https://unsplash.com/license). Stimmungsbild aus West Texas, kein Routenstopp.
Supabase JS ist auf 2.57.4 festgelegt.

