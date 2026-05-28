# Taetigkeitsbericht zur Frontend-Entwicklung von Beat the Dice

## 1. Ausgangslage und Auswertungsgrundlage

Dieser Bericht fasst die Entwicklung des Frontends von Beat the Dice im Zeitraum vom 12.03.2026 bis zum 28.05.2026 zusammen. Die Auswertung basiert auf:

- 53 gemergten Pull Requests in chronologischer Reihenfolge
- den zugehoerigen GitHub-Issues, soweit eine fachliche Zuordnung moeglich war
- der fruehen Game-Design-Spezifikation vom 12.03.2026
- der lokalen Git-Historie und den dabei sichtbar gewordenen Architektur- und Refactoring-Schritten

Wichtig fuer die Einordnung: Nicht alle PRs referenzieren ein Issue direkt. In diesen Faellen wurden Problemstellung und fachliche Zielsetzung aus PR-Titel, Merge-Commit und den betroffenen Dateien abgeleitet. Dadurch bleibt die Chronologie belastbar, gleichzeitig wird transparent gemacht, wo die fachliche Rueckbindung nur indirekt moeglich ist.

Aus einer technischen Sicht laesst sich die Entwicklung in sechs klar erkennbare Phasen gliedern: von der Anforderungsklaerung ueber die Kernmechanik und Progression bis hin zu Endlosmodus, Deployment, Build-Stabilisierung und finalem Polishing.

## 2. Chronologische Phasenuebersicht

| Zeitraum | Relevante PRs | Wichtige Issues | Schwerpunkt |
| --- | --- | --- | --- |
| 12.03.2026 | #24, #25 | #1-#13 | Produktidee, Anforderungsstruktur, erste Personalisierung |
| 19.03.2026 bis 06.04.2026 | #29, #31, #33, #34, #41 sowie #32, #36-#38 | #14, #15, #16, #18, #19, #20, #30 | Hauptmenue, erste Wuerfellogik, Animation, erster Gegner |
| 10.04.2026 bis 25.04.2026 | #45, #46, #54, #55, #56, #57, #58 sowie #47-#53 | #17, #22, #23, #26, #42 | Level-Fortschritt, Reward-Flow, persistenter Spielzustand, Boss-Mechanik |
| 30.04.2026 bis 14.05.2026 | #61, #63, #67, #76, #77, #78, #79, #80, #81, #82, #83 sowie #68-#75 | #27, #44, #59, #60, #62, #66, #72 | Deployment, UI-Ueberarbeitung, Label-System, Endlosmodus |
| 16.05.2026 bis 22.05.2026 | #84, #85, #88, #89, #90 | #65, #86, #87 | neue Wuerfeltypen, Midgame-/Endgame-Ausbau, Fehlerkorrekturen |
| 26.05.2026 bis 28.05.2026 | #91, #92, #93, #96, #97, #98, #99 | #60, #86, #87 | finale Bugfixes, lebendiger Hintergrund, Type-Safety, Asset-Korrekturen |

## 3. Entwicklungsprozess und technische Entscheidungen

### Phase 1: Problemverstaendnis, Anforderungsstruktur und Konzeptionsphase

Die erste sichtbare Aktivitaet war keine Implementierung, sondern die fachliche Strukturierung des Projekts. Die Design-Spezifikation und die Issues #1 bis #13 definieren bereits sehr klar, welches Spiel entstehen soll: ein browserbasiertes Dice-Roguelike mit Build-Entscheidungen, Boss-Regeln, Reward-Flow, Endlosmodus und UI-Overlays. Damit lag frueh ein relativ vollstaendiges Zielbild vor.

Aus Sicht des Software Engineering ist diese Phase besonders wichtig, weil hier nicht nur Features gesammelt wurden, sondern weil Anforderungen in voneinander trennbare Arbeitsbereiche zerlegt wurden: Kern-Gameplay, Reward-System, Dice-Registry, HUD, Boss-Mechaniken, Game-Over-Flow und Endlosmodus. Genau diese Zerlegung macht spaetere PRs nachvollziehbar und hat die technische Umsetzung in kleine, mergebare Schritte zerlegt.

PR #24 markiert diesen Moment der Konzeptionsarbeit. Hier wurde die Spezifikation selbst versioniert und damit zu einem verbindlichen Artefakt gemacht. PR #25 ist fachlich klein, zeigt aber bereits einen ersten Schritt in Richtung Nutzerfokus: Texte und Rueckmeldungen werden nicht mehr nur technisch, sondern auch hinsichtlich Spielerwirkung betrachtet.

Die wichtigste technische Entscheidung dieser Phase war die fruehe Trennung zwischen:

- Vue fuer UI-Overlays und menueartige Interaktion
- Phaser fuer Rendern, Spielzustand und spaetere Physik
- einem EventBus als Bruecke zwischen beiden Welten

Diese Architekturentscheidung taucht spaeter mehrfach wieder auf und ist deshalb kein Detail, sondern ein tragendes Designmotiv.

### Phase 2: Aufbau der spielbaren Grundlage

Mit PR #29 wurde aus der Vorlage erstmals ein eigenes Spielgeruest. Das Hauptmenue bekam ein eigenes visuelles Erscheinungsbild mit Logo, Hintergrund, Fonts und Szenenwechseln. Gleichzeitig entstand die erste Dice-Klasse. Fachlich korrespondiert das mit den Issues #14 und #15: Das Spiel musste ueberhaupt startbar werden, und der erste Wuerfelwurf musste in der Game-Szene stattfinden.

Typische Engineering-Aktivitaeten in dieser Phase waren:

- Problemverstaendnis: Wie wird aus einem generischen Phaser/Vue-Template ein konkretes Spiel?
- Projektplanung: Zuerst Menue und Navigation, dann erster Spielzustand, danach Mechanikvertiefung
- Konzeption: Einstieg ueber Szenen statt ueber spontane Einzelobjekte; Wuerfel als eigene Klasse statt als lose Utility-Funktion
- Implementierung: Anpassung von MainMenu, Game, GameOver und Preloader sowie Einbau der ersten visuellen Assets

Die Entwicklungslogik war hier sinnvoll inkrementell. Erst als Navigation und Szenenwechsel standen, lohnte sich die Vertiefung der Spiellogik.

### Phase 3: Kernmechanik, Wuerfelanimation und erster Gegner

Mit PR #31 wurde die erste staerkere Kapselung eingefuehrt. Die Wuerfellogik wanderte in einen CombatHandler. Die dazugehoerige Anforderung war in Issue #30 sehr konkret beschrieben: Die Game-Szene soll nicht selbst alles berechnen, sondern die Verwaltung mehrerer Wuerfel an eine eigene Klasse delegieren. Das ist ein klassischer Schritt von einer prototypischen hin zu einer wartbareren Architektur.

Kurz darauf wurde der CombatHandler in PR #33 bereits wieder durch einen DiceHandler ersetzt. Diese Aenderung ist interessant, weil sie eine typische Entwicklungsrealitaet sichtbar macht: Die erste Abstraktion war funktional, aber noch nicht optimal fuer die naechsten Schritte wie mehrere Wuerfel, Anzeige, Animation und Persistenz. PR #34 mit dem direkten Handler-Fix bestaetigt diese Lesart. Die Architektur wurde nicht auf dem Papier perfektioniert, sondern unter realem Integrationsdruck geschliffen.

Gleichzeitig wurde die visuelle Kernmechanik aufgebaut:

- Issue #16 verlangte echte Wuerfelanimationen
- Issue #19 verlangte mehrere Wuerfel gleichzeitig und eine Gesamtsumme
- Issue #18 und #20 fuehrten den ersten Gegner mitsamt Bildzustaenden ein

PR #41 fuegte dann Enemy und LevelEngine als erste eigene Klassen ein. Das ist ein Schluesselmoment: Ab hier geht es nicht mehr nur um einzelne Wuerfe, sondern um einen geregelten Spielzustand mit Gegnerwerten, Trefferlogik und Fortschritt.

Aus Prozesssicht faellt in dieser Phase positiv auf, dass Content-Arbeit und Code-Arbeit parallelisiert wurden. Die Asset-PRs #32, #36, #37 und #38 lieferten die benoetigten Grafiken, waehrend die technischen PRs die Logik integrierten. Das ist fuer kleine Spieleprojekte effizient, weil dadurch weder Frontend-Logik noch Content-Produktion aufeinander warten muessen.

Zur Qualitaetssicherung ist festzuhalten: Statt automatisierter Tests ist hier vor allem ein iteratives, visuell pruefbares Vorgehen sichtbar. Die schnelle Folge aus Implementierung (#31, #33) und Korrektur (#34) spricht fuer unmittelbares manuelles Testen im laufenden Spiel.

### Phase 4: Level-Fortschritt, Rewards, Persistenz und Boss-Flow

Der naechste groessere Entwicklungssprung fand zwischen dem 10.04. und 25.04. statt. In dieser Phase wurde aus einer einzelnen Kampfszene schrittweise ein zusammenhaengender Run.

Die fachlichen Anforderungen kamen vor allem aus den Issues #17, #22, #23, #26 und #42:

- ein Wurfzaehler mit Niederlagenbedingung
- ein Reward-Screen nach gewonnenen Levels
- die Anzeige der aktuellen Wuerfel inklusive Hover-Informationen
- Level-Uebergaenge mit steigendem Schwierigkeitsgrad
- ein Bosskampf mit Sonderlogik

PR #45 fuehrte den Throw Counter ein und machte damit die Rundenstruktur explizit. PR #46 verband zwei fachlich eng gekoppelte Schritte: die Wuerfelanzeige und den Reward-Screen. Besonders wichtig ist hier, dass diese PR nicht nur UI liefert, sondern den Build-Gedanken spielmechanisch sichtbar macht. Erst durch die Sichtbarkeit und Auswahl von Wuerfeln werden Entscheidungen fuer den Spieler nachvollziehbar.

PR #54 ist aus architektonischer Sicht einer der wichtigsten Merges des gesamten Projekts. Die Ueberschrift benennt den Kern bereits selbst: persistente LevelEngine und persistenter DiceHandler. Damit wurde der Spielzustand nicht mehr pro Szene neu aufgebaut, sondern ueber mehrere Level hinweg getragen. Diese Entscheidung war Voraussetzung fuer:

- ein wachsendes Wuerfel-Set
- mehrstufige Levelprogression
- Boss- und Reward-Sequenzen ohne Verlust des Run-Zustands

Hier zeigt sich typisches Software Engineering unter steigender Komplexitaet: Eine einfache Scene-Logik reicht anfangs aus, spaeter braucht es eine explizite Zustandsverwaltung. Die Einfuehrung globaler Typdefinitionen und die Erweiterung der Preloader-/Reward-/Game-Logik deuten genau auf diese Reorganisation hin.

PR #56 dokumentiert anschliessend ein Refactoring der Szenen und Komponenten. Dieses Refactoring ist als Reaktion auf gewachsene Komplexitaet plausibel und fachlich sinnvoll. Es zeigt, dass die Entwicklung nicht bei einer funktionierenden, aber unaufgeraeumten Loesung stehen geblieben ist. Stattdessen wurde Struktur bereinigt, als die Anzahl der Spezialfaelle zunahm.

PR #57 erweiterte das Spiel schliesslich um verschiedene Wuerfel und das Boss-Level. Damit wurde ein zentraler Punkt der urspruenglichen Produktidee umgesetzt: Wuerfel sollen unterschiedliche Rollen uebernehmen, und Bosse sollen den Build herausfordern. Die dazugehoerigen Asset-PRs #47 bis #53 zeigen erneut, dass fachliche und visuelle Erweiterung parallel liefen.

PR #58 mit dem Reset-Fix nach Spielende ist ein typischer Stabilisierungsschritt nach einem groesseren Feature-Block. Gerade bei persistentem Zustand sind Reset-Pfade fehleranfaellig; die Existenz dieses Bugfixes ist deshalb nachvollziehbar und fachlich fast erwartbar.

### Phase 5: Deployment, UI-System, Endlosmodus und technische Hae rtung

Ab Ende April verschiebt sich der Schwerpunkt sichtbar. Das Projekt ist jetzt nicht mehr nur spielbar, sondern wird produktionsnaeher und nutzerfreundlicher gemacht.

Ein erster Strang war die Infrastruktur. PR #61 fuehrte einen GitHub-Actions-Workflow fuer die Auslieferung auf GitHub Pages ein, PR #63 refaktorierte diesen Workflow direkt nach. Das ist ein klassisches Muster: Der erste Pipeline-Aufschlag bringt ein Deployment an den Start, die Folge-PR beseitigt Reibung aus der realen Nutzung. Software Engineering umfasst hier also nicht nur Code im Spiel, sondern auch die Operationalisierung des Projekts.

Ein zweiter Strang war die Nutzeroberflaeche. PR #76 setzte die Wuerfel-Liste im Hauptmenue um und adressierte damit Issue #66. PR #77 griff Issue #72 auf und verbesserte sichtbare Bedienungselemente wie Dice Bag, Dice Cup, Hintergrund und HP-Darstellung. Das ist kein rein kosmetischer Schritt, sondern verbessert die Verstehbarkeit der Mechanik waehrend des Spiels.

Ein dritter Strang war die inhaltliche Abstraktion. PR #82 fuehrte mit `labels.ts` eine zentrale Label-Datei ein und setzte damit Issue #27 um. Diese Entscheidung ist besonders sauber, weil sie Texte aus der Szenenlogik herauszieht und spaetere Sprachumschaltung oder konsistente Formulierungen deutlich vereinfacht. Das ist eine kleine, aber sehr typische Qualitaetsverbesserung in Frontend-Projekten.

Parallel wurde mit PR #83 der Endlosmodus umgesetzt. Fachlich passt das zu Issue #62 und zu der bereits in der Spezifikation angelegten Idee, den Build auch nach dem eigentlichen Sieg weiterzutragen. Technisch ist der Endlosmodus relevant, weil er die LevelEngine erneut erweitert: Gegnerauswahl, Skalierung und spaetere Spezialereignisse muessen nun prozedural oder halbprozedural statt rein statisch gedacht werden.

Zusaetzlich fanden in derselben Phase mehrere technische Stabilisierungsschritte statt:

- PR #73 aktualisierte Phaser auf Version 4.1.0 und zog `terser` sauber in die Abhaengigkeiten
- PR #78 korrigierte die Production-Build-Aufteilung fuer Phaser
- PR #79 passte Asset-Pfade an neue Benennungskonventionen an
- PR #80 und PR #81 reparierten Import- und Runtime-Probleme rund um Phaser

Hier wird ein typischer Zielkonflikt sichtbar: Neue Features und UI-Verbesserungen erzeugen technischen Druck auf Build und Laufzeit. Statt diese Themen zu trennen, wurden sie parallel bearbeitet. Das ist fuer eine laufende Spielentwicklung pragmatisch, setzt aber gute Disziplin bei kleineren Folge-PRs voraus.

### Phase 6: Ausbau des Late-Game, Bugfixing und finales Polishing

Die letzte Phase ist gekennzeichnet durch Ausbau, Stabilisierung und Feinschliff. Sie wirkt weniger linear als die frueheren Phasen, ist aber fuer die Reife des Produkts entscheidend.

PR #84 fuehrte weitere Wuerfel und visuelle Erscheinungsstufen ein. PR #85 erweiterte das Spiel deutlich um Merchant-, Magician-, Artifact- und Enchantment-Logik und greift damit fachlich Issue #65 auf. Das ist aus Engineering-Sicht ein grosser Ausbau des Systems, weil damit nicht nur neue Inhalte kommen, sondern neue Arten von Zustand, Auswahl-Interaktion und Build-Veraenderung.

Die anschliessenden PRs #90 und #91 zeigen sehr deutlich, wie Qualitaetssicherung in diesem Projekt funktioniert hat. Es gibt keine sichtbare automatisierte Testsuite in den Projekt-Skripten; stattdessen laesst sich QA vor allem ueber folgende Muster nachweisen:

- Fehler werden als Issues oder Folge-PRs sichtbar gemacht
- nach umfangreichen Feature-Erweiterungen folgen gezielte Bugfix-Merges
- Balancing, UI-Korrekturen und Asset-Nacharbeiten werden in kurzen Intervallen nachgezogen

Konkret sprechen die Issues #86 und #87 fuer zwei typische spaete Erkenntnisse aus dem Spieltest:

- eine lange Dice-Liste braucht Scroll- oder Begrenzungslogik
- Sonderfaelle beim Vampir-Boss muessen auch fuer neue, staerkere Wuerfel konsistent behandelt werden

Ab dem 27.05. wurde das Spiel dann zusaetzlich visuell aufgewertet. PR #92 fuehrte einen lebendigeren Hintergrund mit Wolken und fallenden Blaettern ein. PR #93 und PR #96 passen diese Funktion nachtraeglich an. Auch das ist ein typisches Bild fuer UI- und Atmosphaerenfeatures: Sie wirken zunaechst gut, zeigen aber in angrenzenden Szenen oder Spezialfaellen noch Nacharbeitungsbedarf.

Parallel dazu lief weiterhin technische Haertung. PR #97 trennt Phaser-Type-Imports sauberer und verbessert damit die Typsicherheit. Dass dieses Thema nach #80 und #81 nochmals auftaucht, zeigt, dass Build- und Importprobleme nicht in einem Schritt final geloest waren. Das ist keine Schwaeche des Teams, sondern eher ein Hinweis auf die Tuecken von Framework-Upgrades und Bundler-Konfiguration im Zusammenspiel mit Phaser.

PR #98 und #99 schliessen die Chronologie mit sehr konkreten Fehlerkorrekturen ab: Sieglogik und Bildpfade werden bereinigt. Genau solche spaten Fixes sind typisch fuer die letzte Projektphase, weil sie erst dann sichtbar werden, wenn zuvor getrennte Systeme tatsaechlich miteinander zusammenspielen.

## 4. Einordnung typischer Software-Engineering-Aktivitaeten

### Problembeschreibung und Problemverstaendnis

Das Projekt startete mit einer ungewoehnlich klaren Fachbeschreibung. Schon frueh war definiert, dass das Spiel nicht nur aus einem Wuerfelwurf bestehen soll, sondern aus einem vollstaendigen Progressionssystem mit Build-Entscheidungen, Boss-Regeln und Endlosmodus. Dieses gemeinsame Problemverstaendnis hat verhindert, dass die Entwicklung in beliebige Einzelideen zerfaellt.

### Anforderungserhebung und -strukturierung

Die Anforderungen wurden sichtbar in zwei Ebenen zerlegt:

- zunaechst grob ueber die Design-Spezifikation
- anschliessend operativ ueber einzelne GitHub-Issues mit Schrittcharakter

Das war fuer den Projektablauf hilfreich, weil sich Features dadurch entlang fachlicher Teilprobleme umsetzen liessen: Menue, Wurfmechanik, Gegner, Rewards, Levelwechsel, Boss, Endless Mode, UI-Polish.

### Projektplanung und -ablauf

Der Ablauf war iterativ und sinnvoll inkrementell. Zuerst wurde eine spielbare Basis erzeugt, dann ein erster Gegner, danach der eigentliche Run-Flow und erst spaeter Infrastruktur, UI-Polish und Endgame-Features. Parallel dazu liefen immer wieder Asset-PRs. Daraus ergibt sich ein klarer Ablauf in Wellen:

- zuerst Spielbarkeit herstellen
- danach Progression und Content ausbauen
- anschliessend Struktur bereinigen
- zum Schluss Deployment, Qualitaet und Polishing absichern

### Konzeption

Mehrere technische Entscheidungen sind fuer den Entwicklungsprozess besonders hervorzuheben:

- Trennung von Vue-UI und Phaser-Spielwelt
- EventBus als Integrationsmuster
- DiceHandler und spaeter persistente LevelEngine als zentrale Zustandsobjekte
- Label-Datei fuer wiederverwendbare Texte
- GitHub Actions fuer standardisierbares Deployment

Diese Entscheidungen zeigen, dass das Team wiederholt versucht hat, wachsende Komplexitaet durch klarere Verantwortungsschnitte zu beherrschen.

### Implementierung

Die Implementierung verlief sichtbar in kleinen Schritten mit gut mergebaren PRs. Besonders auffaellig ist, dass groessere Features fast immer aus mehreren aufeinanderfolgenden PRs bestehen:

- erst Basismodell, dann UI, dann Bugfix
- erst Asset-Beschaffung, dann Integration, dann Benennungskorrektur
- erst Deployment-Workflow, dann Refactoring des Workflows

Das ist ein belastbares Indiz fuer ein pragmatisches, teamfaehiges Vorgehen.

### Testen und Qualitaetssicherung

Automatisierte Tests sind in der Historie nicht als eigener Projektbaustein erkennbar. In `package.json` existieren Build- und Dev-Skripte, aber keine Test-Skripte. Die Qualitaetssicherung erfolgte deshalb ueber andere Mittel:

- manuelles Testen im laufenden Spiel
- kurze Folge-PRs fuer Regressionen und Edge Cases
- Refactorings nach Funktionsausbau
- Build- und Import-Fixes nach Framework- und Infrastrukturveraenderungen

Fuer ein kleines Spieleprojekt ist dieses Vorgehen nachvollziehbar, allerdings steigt damit das Risiko spaeter Regressionen, sobald mehrere Systeme gleichzeitig angepasst werden.

### Reflexion und moegliche Verbesserung

Der Entwicklungsprozess zeigt mehrere Staerken:

- fruehe und klare Anforderungsstruktur
- sinnvolle Zerlegung in kleine, mergebare Schritte
- gute Parallelisierung von Code und Content
- Bereitschaft zum Refactoring statt blossen Anhaeufens neuer Logik

Gleichzeitig werden auch typische Verbesserungspotenziale sichtbar:

- PR-Issue-Verknuepfungen koennten konsistenter dokumentiert werden
- fuer Kernlogik wie Reset, Boss-Regeln und Reward-Flow waeren gezielte automatisierte Tests spaeter sinnvoll
- groessere Architektur-Reviews haetten moeglicherweise einige spaetere Fix-PRs verkuerzt
- offene Themen wie Leaderboard (#64), Tutorial (#74) und weitere Merchant-/Enchanter-Verbesserungen (#95) zeigen, dass der funktionale Ausbau noch nicht abgeschlossen ist

## 5. Gesamtfazit

Die PR-Historie zeigt einen fuer ein Spieleprojekt typischen, insgesamt aber gut nachvollziehbaren Entwicklungsprozess: von einer klaren Produktidee ueber eine spielbare Minimalversion hin zu einem deutlich komplexeren Spiel mit Progression, Boss-Logik, Endlosmodus, Build-Elementen, Deployment und Polishing.

Besonders positiv ist, dass zentrale technische Entscheidungen nicht nur einmal getroffen, sondern spaeter auch nachgeschaerft wurden. Die Einfuehrung von DiceHandler, LevelEngine, Labels und Build-Fixes zeigt ein Team, das unter wachsender Komplexitaet aktiv an Wartbarkeit gearbeitet hat. Gleichzeitig macht die Historie sichtbar, dass Qualitaet im Wesentlichen ueber manuelles Testen und schnelle Folge-PRs abgesichert wurde. Fuer die naechste Projektphase waere deshalb vor allem eine staerkere Absicherung der Kernmechaniken durch automatisierte Checks der logische naechste Schritt.

## 6. Anhang: Chronologische Liste aller gemergten PRs

| Merge-Datum | PR | Titel |
| --- | --- | --- |
| 2026-03-12 | #24 | feat: Plan |
| 2026-03-12 | #25 | feat: Personalize game messages for players |
| 2026-03-19 | #29 | Chore: Main menu, Relevante Scenes, Logo, Erste Wuerfel Mechanik |
| 2026-03-26 | #31 | Implement CombatHandler and integrate dice rolling functionality in Game scene |
| 2026-03-27 | #32 | Add files via upload |
| 2026-03-29 | #33 | feat: added Diceanimation |
| 2026-03-29 | #34 | fix: Dice handleradjustment |
| 2026-04-06 | #36 | Add files via upload |
| 2026-04-06 | #37 | Add files via upload |
| 2026-04-06 | #38 | Add files via upload |
| 2026-04-06 | #41 | First enemy |
| 2026-04-10 | #45 | Add Throw Counter and Logic to Game Scene |
| 2026-04-12 | #46 | Step 4 und Step 8 |
| 2026-04-23 | #54 | Level Progression und persistente LevelEngine und DiceHandler |
| 2026-04-23 | #53 | Add files via upload odddice |
| 2026-04-23 | #52 | Add files via upload evendice |
| 2026-04-23 | #51 | Add files via upload risk dice |
| 2026-04-23 | #50 | Add files via upload steel dice |
| 2026-04-23 | #48 | Vampire |
| 2026-04-23 | #47 | updated enemy images |
| 2026-04-24 | #55 | Minor Changes |
| 2026-04-25 | #56 | Refactor game scenes and components for improved structure |
| 2026-04-25 | #57 | Schritt 10 + Schritt 11: verschiedene Wuerfel implementiert + Boss Level |
| 2026-04-28 | #58 | Bugfix Reset Dice after Game |
| 2026-04-30 | #61 | Add GitHub Actions workflow for deploying static content to Pages |
| 2026-04-30 | #63 | Refactor GitHub Actions workflow for deploying to GitHub Pages |
| 2026-05-04 | #71 | New goblin color grey & red |
| 2026-05-04 | #70 | New slime color blue & purple |
| 2026-05-04 | #69 | dicecup |
| 2026-05-04 | #68 | Updating dice images |
| 2026-05-07 | #73 | chore: update phaser to version 4.1.0 and ensure terser is listed in ... |
| 2026-05-08 | #67 | Minor improvements |
| 2026-05-12 | #75 | Updating images |
| 2026-05-12 | #76 | added Dice List in Main Menu |
| 2026-05-12 | #78 | fix: update manualChunks configuration for phaser in production build |
| 2026-05-12 | #79 | fix: update vampire hit asset paths to reflect new naming conventions |
| 2026-05-12 | #80 | fix: update Phaser import and type references in game configuration |
| 2026-05-12 | #77 | UI improvement |
| 2026-05-12 | #81 | fix: update Phaser import to prevent runtime errors and add guidelines for runtime imports |
| 2026-05-14 | #82 | added Label File and translation |
| 2026-05-14 | #83 | Endless mode |
| 2026-05-16 | #84 | Added new Dice and a appearance Level |
| 2026-05-16 | #85 | Schritt 14: Wuerfel verbesserungen |
| 2026-05-20 | #89 | Update enemy names |
| 2026-05-21 | #88 | Fixing vampire ice images |
| 2026-05-22 | #90 | Bugfixes |
| 2026-05-26 | #91 | BugFixes + Minor Changes |
| 2026-05-27 | #92 | Living background |
| 2026-05-27 | #93 | fix: changed living background and adjusted feedback |
| 2026-05-28 | #97 | fix: update Phaser imports to use type imports for better type safety |
| 2026-05-28 | #98 | fixed vampire win |
| 2026-05-28 | #96 | fix: Living background fix |
| 2026-05-28 | #99 | Imagefix2 |
