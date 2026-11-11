# Howdy Texas

Eigenständige Roadtrip-Website mit Reiseideen, Hotelvorschlägen und gemeinsamem Plan.

## Funktionen
- Neun Reiseziele als unverbindliche Vorschläge, ohne feste Tagesreihenfolge.
- Neun Hotelideen mit Links zu den offiziellen Hotelseiten. Keine Preise oder Verfügbarkeit zugesagt.
- Ortsfotos als Kartenhintergrund; Hotels zeigen ausdrücklich Stadtmotive. Bildnachweise im Footer.
- Angemeldete Crewmitglieder können Reiseziele und Hotels vorschlagen, eigene Einträge bearbeiten, zurückziehen und wieder aufnehmen.
- Persönliche Favoriten, gemeinsame Favoritenübersicht, Regionfilter und Suche.
- Einstellbare Reisedauer, gemeinsames Budget, Termin, Aufgaben und Notizen.

## Anmeldung
Vorname ohne Beachtung der Groß-/Kleinschreibung und das vereinbarte Gruppenpasswort. Die Passwortschreibweise zählt genau. Vier unabhängige Texas-Zugänge; Passwort und Hashes stehen nicht im Quellcode. Eine Anmeldung mit dem Gruppenpasswort ist keine unabhängige Identitätsprüfung.

## Entwicklung
Node 22+, keine Build-Abhängigkeiten. `npm test` und `npm run check`.
Die statischen Dateien liegen in `dist/`. [Backend und Tests](backend/DEPLOYMENT.md).

## Speicherung
Supabase RLS prüft die bestätigte Gruppenmitgliedschaft bei jedem Datenzugriff. Einträge sind für die Gruppe lesbar und nur vom jeweiligen Mitglied änderbar. Revisionen verhindern das Überschreiben inzwischen geänderter Vorschläge und Pläne. Neue Ideen erscheinen nach Anmeldung oder „Vorschläge aktualisieren“ auf anderen Geräten.

## Hosting
Zielhosting ist GitHub Pages. Der Workflow `.github/workflows/pages.yml` veröffentlicht ausschließlich `dist/`. Einmalig unter Settings → Pages die Quelle GitHub Actions aktivieren. Das private Repository benötigt für Pages einen geeigneten GitHub-Plan; andernfalls ist eine bewusste Freigabe des Quellcodes erforderlich. Zieladresse nach erfolgreicher Aktivierung: https://thomasmarlin512.github.io/howdy-texas/ . Der frühere Sites-Link wurde öffentlich freigegeben; bei dieser Umstellung wird dort keine neue Version veröffentlicht.

## Quellen
Hotelangaben: offizielle Links pro Karte, geprüft am 11.11.2026. Bildquellen, Urheber und Lizenzen stehen in `dist/data.js` und im Footer. Fotos werden in der Darstellung beschnitten und abgedunkelt. Keine externen Bilder sind als eigene Werke ausgegeben.
Supabase JS ist auf 2.57.4 festgelegt.

## Anreise April 2027
Suchvorschlag für vier Personen: 21.–30. April vor Ort (zehn Kalendertage einschließlich An-/Abflugtag, neun Nächte), Heimkehr 1. Mai. Zwei Flugideen mit noch ungeprüfter datumsgenauer Verfügbarkeit; keine bestätigten Preise oder Buchungen.
