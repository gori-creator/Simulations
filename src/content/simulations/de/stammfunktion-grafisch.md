## Worum geht es?

Eine Funktion $F$ heißt **Stammfunktion** von $f$, wenn $F'(x) = f(x)$ gilt. Die Werte von $f$ sind also die **Steigungen** von $F$: Die Höhe des Graphen von $f$ an der Stelle $x$ ist die Steigung des Graphen von $F$ an derselben Stelle.

Daraus lässt sich $F$ skizzieren, ohne zu rechnen (**grafisches Aufleiten**):

- Wo $f(x) > 0$ ist, **steigt** $F$; wo $f(x) < 0$ ist, **fällt** $F$. Je größer $|f(x)|$, desto steiler ist $F$.
- Eine Nullstelle von $f$ **mit Vorzeichenwechsel** ist eine **Extremstelle** von $F$: von $+$ nach $-$ ein Hochpunkt, von $-$ nach $+$ ein Tiefpunkt. Ohne Vorzeichenwechsel entsteht ein **Terrassenpunkt**.
- Eine **Extremstelle von $f$** ist eine **Wendestelle** von $F$ – dort ist $F$ am steilsten oder am flachsten. Wo $f$ steigt, ist $F$ linksgekrümmt, wo $f$ fällt, rechtsgekrümmt.
- Die **Fläche** zwischen dem Graphen von $f$ und der $x$-Achse zwischen zwei Nullstellen ist die **Höhenänderung** von $F$ dort (oberhalb positiv, unterhalb negativ).

Stammfunktionen sind nicht eindeutig: Mit $F$ ist auch $F + C$ eine Stammfunktion, denn die Konstante fällt beim Ableiten weg. Alle Stammfunktionen bilden eine **Kurvenschar**, deren Graphen nur senkrecht gegeneinander verschoben sind. Im **Richtungsfeld** sieht man das: Die kleinen Striche mit Steigung $f(x)$ sind in jeder senkrechten Spalte gleich.

Ein **Anfangswert** wählt aus der Schar genau eine Stammfunktion aus (**Anfangswertproblem**): Aus $F(x) = F_0(x) + C$ und $F(x_0) = y_0$ folgt

$$
C = y_0 - F_0(x_0).
$$

Beispiel: $f(x) = 3x^2 - 2$ hat die Stammfunktionen $x^3 - 2x + C$. Mit $F(1) = 4$ gilt $1 - 2 + C = 4$, also $C = 5$ und $F(x) = x^3 - 2x + 5$.

Im Alltag ist $f$ oft eine **Änderungsrate** und $F$ ein **Bestand**: Zufluss → Wassermenge, Einzahlungsrate → Kontostand, Steiggeschwindigkeit → Höhe, Ladestrom → Ladung. Der Anfangsbestand ist die Konstante.

## Ausprobieren

1. [Steigung übertragen](?mode=trace&fn=par&x=-3): Drücke „P durchlaufen lassen“. Vergleiche die Länge des lila Balkens oben mit der senkrechten Seite des Steigungsdreiecks unten.
2. [Richtungsfeld](?mode=feld&fn=par): Zieh den Anfangspunkt nach oben und unten. Warum bleibt die Kurve immer „im Strom“ der Striche? Drücke „C durchprobieren“.
3. [Anfangswertproblem](?mode=feld&fn=par&pa=3&pb=0&pc=-2&x0=1&c=4): Lies $C$ in der Karte ab und prüfe die Rechnung oben.
4. [Merkmale](?mode=feat&fn=par): Drücke „Merkmale Schritt für Schritt“. Welche Stelle von $f$ gehört zum Wendepunkt von $F$?
5. [Nullstelle ohne Vorzeichenwechsel](?mode=feat&fn=par&pa=1&pb=0&pc=0): Was hat $F$ bei $x = 0$?
6. [Flächenstücke von sin](?mode=area&fn=sin): Drücke „Flächen übertragen“. Warum ist jedes Stück gleich groß?
7. [Umgekehrt: F → f](?mode=back&fn=cub&x=-3.2): Lass die Tangente laufen. Wo ist $f$ null, wo am kleinsten?
8. [Treppe](?mode=trace&fn=step&x=-4) und [selbst gezeichnete Funktion](?mode=feat&fn=own): Ziehe die blauen Punkte oben – $F$ ändert sich sofort mit.
9. Alltag: [Sparkonto](?mode=feld&kind=app&app=konto), [Heißluftballon](?mode=trace&kind=app&app=ballon&x=0), [Aufzug](?mode=area&kind=app&app=lift), [Heizung](?mode=feat&kind=app&app=heat), [Akku](?mode=trace&kind=app&app=akku&x=0), [Parkhaus](?mode=back&kind=app&app=park&x=6), [CO₂ im Klassenzimmer](?mode=area&kind=app&app=co2). Was bedeuten Hochpunkt und Wendepunkt jeweils?

## Aufgaben

### Aufgabe 1: Selbst skizzieren

Skizziere die Stammfunktion von $f(x) = x^2 - 1$ mit $F(0) = 0$: Zieh die sieben Punkte, dann „Lösung aufdecken“. [Aufgabe laden](?mode=draw&fn=par&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f > 0$ für $|x| > 1$, $f < 0$ für $|x| < 1$. $F$ steigt bis $x = -1$ (Hochpunkt, $f$: $+ \to -$), fällt bis $x = 1$ (Tiefpunkt, $f$: $- \to +$) und steigt dann. Bei $x = 0$ hat $f$ einen Tiefpunkt, also hat $F$ dort einen Wendepunkt. $F(x) = \frac{1}{3}x^3 - x$, Hochpunkt $\left(-1 \mid \frac{2}{3}\right)$, Tiefpunkt $\left(1 \mid -\frac{2}{3}\right)$. [Lösung zeigen](?mode=feat&fn=par)

</details>

### Aufgabe 2: Anfangswertproblem

Bestimme die Stammfunktion von $f(x) = 3x^2 - 2$ mit $F(1) = 4$ und berechne $F(2)$. [Aufgabe laden](?mode=feld&pa=3&pb=0&pc=-2&x0=1&c=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F(x) = x^3 - 2x + C$; $F(1) = 1 - 2 + C = 4 \Rightarrow C = 5$. Also $F(x) = x^3 - 2x + 5$ und $F(2) = 8 - 4 + 5 = 9$. [Lösung zeigen](?mode=feld&pa=3&pb=0&pc=-2&x0=1&c=4)

</details>

### Aufgabe 3: Kosinus und Exponentialfunktion

a) Welche Stammfunktion von $\cos x$ geht durch $(0 \mid 1)$? Berechne $F\left(\frac{\pi}{2}\right)$. b) Welche Stammfunktion von $e^x$ geht durch $(0 \mid 3)$? [Aufgabe laden](?mode=feld&fn=cos&x0=0&c=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

a) $F(x) = \sin x + C$, $\sin 0 + C = 1 \Rightarrow C = 1$, $F\left(\frac{\pi}{2}\right) = 1 + 1 = 2$. [Zeigen](?mode=feld&fn=cos&x0=0&c=1) b) $F(x) = e^x + C$, $e^0 + C = 3 \Rightarrow C = 2$, also $F(x) = e^x + 2$. [Zeigen](?mode=feld&fn=exp&x0=0&c=3)

</details>

### Aufgabe 4: Regenbecken

Der Netto-Zufluss ist $q(t) = -0{,}5t^2 + 4t - 3{,}5$ (in m³/h), zu Beginn sind $20$ m³ im Becken. Wann ist im Zeitraum $0 \leq t \leq 10$ h am wenigsten, wann am meisten Wasser im Becken? Wann nimmt die Wassermenge am schnellsten zu? [Aufgabe laden](?mode=feat&kind=app&app=pool&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$q(t) = -0{,}5(t - 1)(t - 7)$: Nullstellen $1$ ($- \to +$, Tiefpunkt) und $7$ ($+ \to -$, Hochpunkt). $V(t) = -\frac{1}{6}t^3 + 2t^2 - 3{,}5t + 20$, also $V(7) = \frac{109}{3} \approx 36{,}33$ m³ (am meisten). Am wenigsten Wasser ist bei $t = 1$ h und am Rand $t = 10$ h im Becken, je $\frac{55}{3} \approx 18{,}33$ m³: $V(1) = -\frac{1}{6} + 2 - 3{,}5 + 20 = \frac{55}{3}$ und $V(10) = -\frac{1000}{6} + 200 - 35 + 20 = \frac{55}{3}$. Am schnellsten nimmt $V$ zu, wo $q$ am größten ist: bei $t = 4$ h (Wendepunkt von $V$). [Zeigen](?mode=feat&kind=app&app=pool)

</details>

### Aufgabe 5: Aufzug

Ein Aufzug fährt 2 s an (bis 2 m/s), 6 s mit 2 m/s, bremst 2 s, hält 3 s und fährt dann abwärts: 2 s anfahren bis 2 m/s, 2 s mit 2 m/s, 2 s bremsen. Er startet im Erdgeschoss. In welcher Höhe hält er, in welcher steht er am Ende? Ein Stockwerk ist 4 m hoch. [Aufgabe laden](?mode=area&kind=app&app=lift&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Fläche aufwärts: $2 \cdot \frac{2 \cdot 2}{2} + 6 \cdot 2 = 4 + 12 = 16$ m (4. Stock). Abwärts: $2 \cdot \frac{2 \cdot 2}{2} + 2 \cdot 2 = 8$ m. Am Ende: $16 - 8 = 8$ m, also im 2. Stock. [Zeigen](?mode=area&kind=app&app=lift)

</details>

### Aufgabe 6: Wahr oder falsch?

„Hat $f$ bei $x_0$ einen Hochpunkt, so hat auch $F$ bei $x_0$ einen Hochpunkt.“

<details>
<summary>Lösung anzeigen</summary>

Falsch. Ein Hochpunkt von $f$ bedeutet: Die Steigung von $F$ ist dort am größten – $F$ hat bei $x_0$ eine Wendestelle. Beispiel $f(x) = x \cdot e^{-x^2/2}$: Hochpunkt bei $x = 1$, und $F$ hat dort einen Wendepunkt. [Beispiel](?mode=feat&fn=gauss)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe (Stammfunktion, grafisches Aufleiten, Integrationskonstante); Anfangswertprobleme als Ausblick auf Differentialgleichungen. Die Ansichten lassen sich als Abfolge nutzen: Steigung übertragen → Richtungsfeld → Merkmale → Flächenstücke → umgekehrt → eigene Skizze.
- **Aufgabenmodus:** In „Aufgabe: F skizzieren“ zeigt die Karte zunächst nur Hinweise (Anfangspunkt getroffen? Anzahl der Extremstellen?). Erst „Lösung aufdecken“ zeigt die richtige Kurve, die Abweichung und für jeden Abschnitt, ob die Steigung passt. Gut für Partnerarbeit: Eine Person skizziert, die andere begründet.
- **Gegenstück:** Zusammen mit „Ableitungsfunktion grafisch“ und „Integralfunktion und Hauptsatz“ einsetzen – dieselben Zusammenhänge in umgekehrter Richtung bzw. mit der Fläche als Integral.
- **Alltagsbezug:** Die acht Beispiele deuten Hochpunkte (meiste Wassermenge, höchster Kontostand, größte Höhe) und Wendepunkte (stärkste Zunahme) im Sachzusammenhang, mit Einheiten (m³/h · h = m³).
- **Häufige Stolpersteine:**
  - Hochpunkte von $f$ werden mit Hochpunkten von $F$ verwechselt.
  - Die Integrationskonstante wird vergessen oder man glaubt, es gäbe nur eine Stammfunktion.
  - Eine Nullstelle ohne Vorzeichenwechsel wird als Extremstelle von $F$ gedeutet.
  - Beim Anfangswert wird $C = y_0$ gesetzt, obwohl $F_0(x_0) \neq 0$ ist (z. B. bei $e^x$).
