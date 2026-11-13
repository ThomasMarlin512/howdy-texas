# Howdy Texas

Gemeinsame Roadtrip-Website für vier Reisende: [GitHub Pages](https://thomasmarlin512.github.io/howdy-texas/).

## Funktionen

- 15 Reiseziele, 13 Unterkünfte und vier Routenvorschläge als unverbindliche Ideen mit Ortsfotos und offiziellen Links.
- Eigene Ziele und Hotels vorschlagen, bearbeiten und zurückziehen; persönliche Favoriten sowie getrennte Ja/Vielleicht/Nein-Abstimmungen.
- Mietwagenangebote mit Gepäckplatz, Stationen, Versicherung, Selbstbehalt, Kaution, Zusatzfahrern, Tankregelung und Einweggebühr vergleichen.
- Flüge, Hotels, Mietwagen und Aktivitäten als Idee, eingeplant, gebucht oder verworfen verwalten.
- Tagesplan mit Ortszeiten und Zeitzonen, Überschneidungshinweisen, zugeordneten Unterlagen und Druckansicht zum Speichern als PDF.
- Gebuchte Gesamtpreise getrennt in EUR und USD; Budgetschätzung und Aufgaben bleiben separat.
- Private Flugtickets, Hotelbestätigungen und Mietwagen-Voucher hochladen und herunterladen: PDF, JPEG, PNG, WebP, HEIC/HEIF, maximal 10 MiB pro Datei.
- Terminabstimmung mit Kalender und gemeinsamer Festlegung; früheste Abreise 22.04.2027, maximal 14 Kalendertage einschließlich Heimkehr.
- Feste Reisegruppe: Alle vier Mitglieder sind bestätigt; keine erneute Teilnahmeabfrage.
- Gemeinsamen externen Albumlink hinterlegen; Fotos werden direkt beim Albumanbieter hochgeladen.

Keine automatische Buchung, keine Zusage von Preisen oder Verfügbarkeit. Jeder Eintrag bleibt eine Idee, bis die Gruppe seinen Status ändert. Änderungen erscheinen auf anderen Geräten nach Anmeldung oder „Aktualisieren“.

## Anmeldung und Datenschutz

Vorname ohne Beachtung der Groß-/Kleinschreibung und vereinbartes Gruppenpasswort. Die Passwortschreibweise zählt genau. Vier unabhängige Texas-Zugänge; Passwort und Hashes stehen nicht im Quellcode. Ein gemeinsames Passwort prüft die Gruppenzugehörigkeit, nicht unabhängig die Identität einer Person.

Supabase prüft die verifizierte Gruppensitzung bei jedem Datenzugriff. Buchungen und gemeinsame Einstellungen darf die Gruppe bearbeiten; eigene Stimmen und Dokumente nur das jeweilige Mitglied. Revisionen schützen gemeinsame Buchungen und Einstellungen gegen versehentliches Überschreiben.

Unterlagen liegen in einem privaten Storage-Bucket, niemals im öffentlichen GitHub-Repository. Auch eine normale anonyme Auth-Sitzung genügt nicht zum Zugriff: Die Gruppenanmeldung muss erfolgreich gewesen sein. Downloads benötigen die gültige Gruppensitzung. Beim Abmelden wird die Berechtigung serverseitig entzogen. Bereits heruntergeladene Dateien bleiben auf dem Gerät. Für die Freigabe eines externen Fotoalbums gelten die Einstellungen des Albumanbieters.

## Entwicklung und Backend

Node 22+, keine Build-Abhängigkeiten. `npm test` und `npm run check`.
Statische Dateien: `dist/`. [Backend, Migrationen und Tests](backend/DEPLOYMENT.md).

## Hosting

Das öffentliche Repository veröffentlicht ausschließlich `dist/` mit `.github/workflows/pages.yml`. In Settings → Pages ist GitHub Actions die Quelle. Der frühere ChatGPT-Sites-Link wird nicht aktualisiert.

## Anreise April / Mai 2027

Vier Personen, früheste Abreise laut Manu am 22. April. Die Beispielrouten umfassen 10 / 12 / 14 Kalendertage insgesamt mit 8 / 10 / 12 US-Nächten. Rückflug am 30. April / 2. Mai / 4. Mai und Heimkehr in Bürs / Nenzing am 1. / 3. / 5. Mai. Annahme: Ankunft am Hinflugtag, Rückflug über Nacht. Spätere Abreise verschiebt die Beispiele.

## Quellen

Hotelangaben: offizielle Links pro Karte, Bestand geprüft am 11.11.2026, Erweiterungen am 12.11.2026. Bildquellen, Urheber und Lizenzen in `dist/data.js` und im Footer. Hotelkarten zeigen ausdrücklich Stadtmotive. Bilder werden beschnitten und abgedunkelt. Supabase JS ist auf 2.57.4 festgelegt.

