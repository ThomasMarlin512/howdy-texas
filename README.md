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
Das GitHub-Repository und die bestehende Sites-Veröffentlichung sind privat. Die äußere Sites-Freigabe ist getrennt vom Gruppenlogin; für weitere Reisende muss der Site-Zugang noch freigegeben werden.

## Quellen
Hotelangaben: offizielle Links pro Karte, geprüft am 11.11.2026. Bildquellen, Urheber und Lizenzen stehen in `dist/data.js` und im Footer. Fotos werden in der Darstellung beschnitten und abgedunkelt. Keine externen Bilder sind als eigene Werke ausgegeben.
Supabase JS ist auf 2.57.4 festgelegt.
