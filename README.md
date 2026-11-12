# Howdy Texas

Eigenständige Roadtrip-Website mit Reiseideen, Hotelvorschlägen und gemeinsamem Plan.

## Funktionen
- 15 Reiseziele als unverbindliche Vorschläge, ohne feste Tagesreihenfolge.
- 13 Unterkunftsideen mit Links zu den offiziellen Hotelseiten. Keine Preise oder Verfügbarkeit zugesagt.
- Ortsfotos als Kartenhintergrund; Hotels zeigen ausdrücklich Stadtmotive. Bildnachweise im Footer.
- Angemeldete Crewmitglieder können Reiseziele und Hotels vorschlagen, eigene Einträge bearbeiten, zurückziehen und wieder aufnehmen.
- Persönliche Favoriten, gemeinsame Favoritenübersicht, Regionfilter und Suche.
- Einstellbare Reisedauer, gemeinsames Budget, Termin, Aufgaben und Notizen.

- Vier Routenvorschläge mit Übernachtungsverteilung: 10 Tage Texas, 12 Tage Texas mit Ranch, 14 Tage Nashville–Texas oder New Orleans–Texas.
- Früheste Abreise 22.04.2027; maximal 14 Kalendertage einschließlich Hinreise und Rückkehr. Annahme: Ankunft am Hinflugtag, Rückflug über Nacht.

## Anmeldung
Vorname ohne Beachtung der Groß-/Kleinschreibung und das vereinbarte Gruppenpasswort. Die Passwortschreibweise zählt genau. Vier unabhängige Texas-Zugänge; Passwort und Hashes stehen nicht im Quellcode. Eine Anmeldung mit dem Gruppenpasswort ist keine unabhängige Identitätsprüfung.

## Entwicklung
Node 22+, keine Build-Abhängigkeiten. `npm test` und `npm run check`.
Die statischen Dateien liegen in `dist/`. [Backend und Tests](backend/DEPLOYMENT.md).

## Speicherung
Supabase RLS prüft die bestätigte Gruppenmitgliedschaft bei jedem Datenzugriff. Einträge sind für die Gruppe lesbar und nur vom jeweiligen Mitglied änderbar. Revisionen verhindern das Überschreiben inzwischen geänderter Vorschläge und Pläne. Neue Ideen erscheinen nach Anmeldung oder „Vorschläge aktualisieren“ auf anderen Geräten.

## Hosting
Das öffentliche Repository veröffentlicht `dist/` über `.github/workflows/pages.yml` auf https://thomasmarlin512.github.io/howdy-texas/ . Quelle in Settings → Pages: GitHub Actions. Der frühere Sites-Link erhält keine weiteren Aktualisierungen.

## Quellen
Hotelangaben: offizielle Links pro Karte, Bestand geprüft am 11.11.2026; neue Ziele und vier Unterkünfte am 12.11.2026. Bildquellen, Urheber und Lizenzen stehen in `dist/data.js` und im Footer. Fotos werden in der Darstellung beschnitten und abgedunkelt. Keine externen Bilder sind als eigene Werke ausgegeben.
Supabase JS ist auf 2.57.4 festgelegt.

## Anreise April / Mai 2027
Suchvorgaben für vier Personen ab 22. April: 10 / 12 / 14 Kalendertage insgesamt, 8 / 10 / 12 Nächte in den USA. Rückflug am 30. April / 2. Mai / 4. Mai; geplante Heimkehr am 1. / 3. / 5. Mai. Maximal 14 Tage, mit einer späteren Abreise verschieben sich die Beispiele. Flughäfen passend zur gewählten Route, keine datumsgenau bestätigten Flüge oder Preise.

## Katalog-Erweiterung November 2026
Nach `backend/ideas.sql` die Migration `backend/migrations/20261112_flexible_routes.sql` anwenden. Sie erweitert die erlaubten Bildmotive und ergänzt Louisiana, aktualisiert ausschließlich Startvorschläge und fügt sechs Ziele sowie vier Unterkünfte hinzu. Crew-Einträge, Favoriten und der gemeinsame Plan bleiben erhalten. `dist/routes.js` berechnet die Kalenderdaten aus Start und Nächten; Tests prüfen das 14-Tage-Limit und die Anschlussdaten.
