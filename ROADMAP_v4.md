# Roadmap v4, Architekturvorschlaege

**Stand:** 2026-06-18 (nach Release v3.38)
**Rahmen:** Alle Vorschlaege respektieren die Constraints der App: Single-File HTML PWA, offline-first, keine externen CDN-Scripts, dark forest-green Branding, DSGVO als oberste Prioritaet (oeffentliches GitHub-Pages-Deployment).

---

## Paket 0 (NEU, hohe Prioritaet): Service Worker mit Versions-Hash fuer Cache-Invalidation

**Anlass:** Live-Tester berichteten, dass Aenderungen am Desktop-PC nicht ankamen (alte gecachte Version), waehrend das Handy frisch war. Aktuell ist KEIN Service Worker registriert, es gibt also keine kontrollierte Cache-Strategie, der Browser-HTTP-Cache entscheidet allein.

**Problem:** Ohne Service Worker kein echtes Offline, ABER mit einem naiv gecachten Service Worker droht das umgekehrte Problem: die App bleibt auf einer alten Version „kleben". Beides loest man mit einem versionierten Cache.

**Vorschlag:**
- Inline-Service-Worker (als `data:`- oder Blob-URL registriert, damit Single-File bleibt), der einen Cache-Namen mit `APP_VERSION` als Hash nutzt, z.B. `bh-cache-v3.39`.
- Strategie: „network-first" fuer das HTML-Dokument (immer frisch laden, Fallback auf Cache wenn offline), „cache-first" fuer statische Assets (hier minimal, da Single-File).
- Beim `activate`-Event alle alten Caches loeschen, deren Name nicht zum aktuellen `APP_VERSION` passt. Das eliminiert das stuck-version-Problem.
- `skipWaiting()` + `clients.claim()`, damit eine neue Version sofort aktiv wird, plus ein dezenter In-App-Hinweis „Neue Version geladen, bitte einmal neu laden".
- Optional: ein „Nach Updates suchen / App neu laden"-Knopf in den Einstellungen als manuelle Notbremse.

**DSGVO:** Unkritisch, der Service Worker cached nur die eigene App, keine Personendaten verlassen das Geraet.

**Groesse-Impact:** sehr gering (wenige KB Inline-Code).
**Aufwand:** 0,5 bis 1 Session. Sorgfaeltig testen (Service Worker sind fehleranfaellig: einmal falsch gecacht, schwer zu debuggen).
**Risiko:** mittel. Erst nach gruendlichem Test auf allen Zielbrowsern ausrollen, sonst tauscht man ein Cache-Problem gegen ein schlimmeres.

---

## Paket 1: PDF-Annotation

**Anforderung:** Belege als PDF, der Nutzer soll darauf zeichnen / markieren koennen (z.B. relevante Betraege einkreisen).

**Vorschlag:**
- Render-Layer: `pdf.js` rendert die PDF-Seite in ein `<canvas>`. pdf.js ist offline-faehig und wird in der App bereits fuer die PDF-Beleg-Vorschau genutzt, also keine neue externe Abhaengigkeit.
- Annotations-Layer: ein zweites, transparentes `<canvas>` ueber dem PDF-Canvas. Eigene, leichtgewichtige Zeichenlogik (Pointer-Events fuer Maus + Touch + Stylus) statt einer schweren Bibliothek wie fabric.js, um Single-File und Bundle-Groesse zu schonen.
- Modi: Stift (freihand), Marker (halbtransparent), Text-Stempel, Radierer. Farbauswahl aus dem Branding.
- Speicherung: die Annotationsebene wird als zusaetzliches PNG gerendert und mit der Beleg-Seite zusammengefuehrt (flatten), dann als neuer Attachment-Eintrag im Doc gespeichert. Original bleibt erhalten (non-destruktiv).

**Bibliotheken:** pdf.js (bereits vorhanden). fabric.js NICHT empfohlen (zu gross fuer Single-File, eigene Canvas-Logik reicht).
**Groesse-Impact:** gering, wenn eigene Zeichenlogik (~20 bis 40 KB). Mit fabric.js ~300 KB, daher abgelehnt.
**DSGVO:** unkritisch, alles lokal im Browser.
**Aufwand:** 1 bis 2 Sessions.
**Risiko:** niedrig bis mittel (Touch-/Stylus-Praezision auf verschiedenen Geraeten testen).

---

## Paket 2: E2E-Cloud-Sync

**Anforderung:** Daten zwischen Geraeten (PC und Handy) synchronisieren, ohne dass der Anbieter Klartext sieht.

**Vorschlag:**
- Backend: Supabase (Frankfurt-Region, DSGVO-konform). Andre hat dort bereits ein Setup fuer die Sessions-PWA, Synergien nutzbar.
- Verschluesselung: Client-seitige Ende-zu-Ende-Verschluesselung mit `libsodium-wrappers` (WASM, offline-faehig). Schluessel wird aus einer Nutzer-Passphrase abgeleitet (Argon2id / scrypt) und verlaesst NIE das Geraet. Supabase speichert nur den verschluesselten Blob.
- Schema: Tabelle `user_data` mit `user_id` (anonyme UUID, kein Klarname), `encrypted_blob` (bytea / text), `updated_at`, `device_label` (optional, ebenfalls verschluesselt oder weggelassen).
- Konflikt-Loesung: Last-Write-Wins anhand `updated_at` als Default, plus eine manuelle Konfliktanzeige, wenn zwei Geraete seit dem letzten Sync beide geaendert haben („Version A vom Handy / Version B vom PC, welche behalten?").
- Auth: Supabase-Magic-Link oder Passphrase-basiert. Wichtig: die Sync-Passphrase ist getrennt vom Login, sie ist der Verschluesselungs-Schluessel.

**DSGVO-Konzept:**
- Andre ist Verantwortlicher. Auftragsverarbeitungsvertrag (AVV / DPA) mit Supabase erforderlich.
- Opt-In: Sync ist standardmaessig AUS. Der Nutzer aktiviert es bewusst, mit klarer Aufklaerung.
- Datenschutz-Hinweis und AGB-Erweiterung noetig (welche Daten, wo gespeichert, wie verschluesselt, wie loeschbar).
- „Recht auf Loeschung": ein Knopf, der den Server-Blob endgueltig entfernt.

**Bibliotheken:** supabase-js, libsodium-wrappers. Beide muessen inline gebundlet werden (Single-File), das erhoeht die Dateigroesse spuerbar, Pruefung noetig ob das mit dem Single-File-Ansatz noch vertretbar ist.
**Groesse-Impact:** hoch (libsodium WASM + supabase-js, grob 200 bis 400 KB). Konflikt mit „Single-File, klein" muss mit Andre abgewogen werden.
**Aufwand:** 3 bis 4 Sessions.
**Risiko:** hoch (Krypto richtig machen, Schlusselverlust bedeutet Datenverlust, gruendliche DSGVO-Pruefung).

---

## Paket 3: KI-Brief-Verbesserung

**Anforderung:** Brief-Vorlagen mit KI verfeinern (Tonfall, Grammatik, juristische Verstaendlichkeit).

**Vorschlag:**
- Modell: Anthropic API. Fuer Kostenoptimierung das guenstige, schnelle Modell der Haiku-Klasse (aktuell Claude Haiku 4.5, Modell-ID `claude-haiku-4-5-20251001`) als Default, mit optionalem Wechsel auf ein staerkeres Modell fuer schwierige Texte.
- API-Key: in den Nutzer-Einstellungen hinterlegt (der Nutzer bringt seinen eigenen Key mit, „bring your own key"). Kein zentraler Key, das vermeidet, dass Andre fuer alle Nutzer zahlt und haftet.
- Aufruf: direkter `fetch` an die Anthropic-API. Achtung: das ist der einzige erlaubte neue Netzwerk-Call und nur bei aktivem Opt-In.
- Kostenkontrolle: Token-Budget pro Tag / Monat, Anzeige der bisher verbrauchten Tokens / geschaetzten Kosten, harte Obergrenze.

**DSGVO (kritisch):**
- Der Brieftext wird an einen externen Dienst (Anthropic) gesendet, das ist eine Datenuebermittlung und MUSS Opt-In sein, mit deutlichem Hinweis.
- Anonymisierung VOR dem Senden: Namen, Adressen, Aktenzeichen durch Platzhalter ersetzen (`[NAME]`, `[AKTENZEICHEN]`), KI verbessert nur den anonymisierten Text, danach werden die Platzhalter lokal zurueckgesetzt. Das passt gut zur bestehenden Platzhalter-Architektur der App.
- Datenschutz-Hinweis mit Link zu Anthropics Datenverarbeitung, plus klare Aussage „dein Brieftext wird zur Verbesserung an Anthropic gesendet".

**Bibliotheken:** keine, direkter `fetch`. Anthropic-SDK nicht noetig und wuerde Single-File aufblaehen.
**Groesse-Impact:** minimal (nur eigener Code).
**Aufwand:** 1 bis 2 Sessions.
**Risiko:** mittel (DSGVO-Aufklaerung und Anonymisierung muessen wasserdicht sein, sonst landen echte Personendaten extern).

---

## Empfohlene Reihenfolge

1. **Paket 0 (Service Worker mit Cache-Bust)**, loest ein akutes Live-Problem, kleiner Aufwand, hoher Nutzen.
2. **Paket 1 (PDF-Annotation)**, klarer Mehrwert, geringes Risiko, kein DSGVO-Aufwand.
3. **Paket 3 (KI-Brief)**, mittlerer Aufwand, gut mit bestehender Platzhalter-Logik kombinierbar, DSGVO sorgfaeltig.
4. **Paket 2 (E2E-Cloud-Sync)**, hoechster Aufwand und hoechstes Risiko, gruendliche DSGVO- und Groessen-Abwaegung noetig, zuletzt.
