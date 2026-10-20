---
description: "Interaktive Simulation für die Oberstufe: Extremwertprobleme mit Differentialrechnung – Schachtel aus Karton (zum Falten), Dose mit kleinster Oberfläche, Rechteck unter einer e-Funktion, größter Zylinder im Kegel und schnellster Weg eines Rettungsschwimmers, mit gekoppeltem Graphen, Ableitung, Randwertvergleich und Lösungsweg Schritt für Schritt."
---

## Worum geht es?

Bei einem **Extremwertproblem** sucht man den größten oder kleinsten Wert einer Größe – das größte Volumen, die kleinste Oberfläche, die kürzeste Zeit. Oben im Bild verändert sich das Objekt mit der Variablen, darunter läuft der Punkt auf dem Graphen der **Zielfunktion** mit, ganz unten zeigt der Streifen die **Ableitung**: grün, wo die Zielfunktion steigt, rot, wo sie fällt. Das Vorgehen ist immer gleich:

1. **Zielfunktion:** die Größe, die optimal werden soll, als Formel (z. B. $V = \text{Länge} \cdot \text{Breite} \cdot \text{Höhe}$).
2. **Nebenbedingung:** Zusammenhänge nutzen, bis nur noch **eine** Variable übrig ist.
3. **Definitionsbereich:** Welche Werte sind im Sachzusammenhang sinnvoll?
4. **Notwendige und hinreichende Bedingung:** $Z'(x) = 0$; Vorzeichenwechsel von $Z'$ oder Vorzeichen von $Z''$.
5. **Ränder vergleichen** (ein Randwert kann besser sein als jedes lokale Extremum!) und das **Ergebnis** im Sachzusammenhang formulieren.

*Schachtel:* Aus einem Karton $30\,\text{cm} \times 20\,\text{cm}$ werden an den Ecken Quadrate der Seitenlänge $x$ ausgeschnitten, dann werden die Ränder hochgeklappt: $V(x) = x(30 - 2x)(20 - 2x) = 4x^3 - 100x^2 + 600x$, $0 < x < 10$. $V'(x) = 12x^2 - 200x + 600 = 0 \iff 3x^2 - 50x + 150 = 0$ liefert $x_1 \approx 3{,}92$ und $x_2 \approx 12{,}74 \notin D$. Mit $V''(3{,}92) < 0$ und $V(0) = V(10) = 0$ ist das Maximum $V \approx 1056{,}3\,\text{cm}^3$.

*Dose:* Bei festem Volumen $V$ gilt $h = \frac{V}{\pi r^2}$, also $O(r) = 2\pi r^2 + \frac{2V}{r}$. Aus $O'(r) = 4\pi r - \frac{2V}{r^2} = 0$ folgt $r = \sqrt[3]{\frac{V}{2\pi}}$ – und dann ist $h = 2r$: Die beste Dose ist so hoch wie breit. Für $V = 1\,\text{L}$: $r \approx 5{,}42\,\text{cm}$, $h \approx 10{,}84\,\text{cm}$, $O = 6\pi r^2 \approx 553{,}6\,\text{cm}^2$.

*Zylinder im Kegel:* Nach dem Strahlensatz ist $h = H\left(1 - \frac{r}{R}\right)$, also $V(r) = \pi r^2 H\left(1 - \frac{r}{R}\right)$. Das Maximum liegt bei $r = \frac{2}{3}R$, $h = \frac{H}{3}$ mit $V = \frac{4\pi R^2 H}{27}$ – das sind immer $\frac{4}{9}$ des Kegelvolumens.

*Rettungsschwimmer:* Er steht $20\,\text{m}$ vom Wasser entfernt, die Person ist $30\,\text{m}$ vom Ufer und seitlich $60\,\text{m}$ entfernt. Geht er an der Stelle $x$ ins Wasser, braucht er $T(x) = \frac{\sqrt{20^2 + x^2}}{v_1} + \frac{\sqrt{30^2 + (60 - x)^2}}{v_2}$, $0 \le x \le 60$. $T'(x) = 0$ lässt sich nur numerisch lösen (die Karte zeigt das Newton-Verfahren). Für $v_1 = 7\,\frac{\text{m}}{\text{s}}$ und $v_2 = 2\,\frac{\text{m}}{\text{s}}$: $x \approx 51{,}71\,\text{m}$, $T \approx 23{,}48\,\text{s}$. Im Optimum gilt $\frac{\sin \alpha_1}{v_1} = \frac{\sin \alpha_2}{v_2}$ – das **Brechungsgesetz** der Optik.

## Ausprobieren

1. [Schachtel](?prob=box&a=30&b=20&x=2): Ziehe am Griff an der Schachtelkante oder am Punkt auf dem Graphen. Wann ist die Schachtel flach, wann hoch und schmal?
2. Drücke „Optimum suchen“: $x$ läuft durch den ganzen Definitionsbereich, der Graph entsteht, dann wird die Ableitung null gesetzt. Beobachte die Tangente.
3. [Karton flach](?prob=box&a=16&b=10&x=1&flat=1): Ziehe an der Ecke eines Ausschnitts und drücke dann „Falten“. Warum liegt die zweite Nullstelle von $V'$ bei $\frac{20}{3}$ nicht im Definitionsbereich? Und gilt beim [quadratischen Karton](?prob=box&a=30&b=30&x=3) $x = \frac{a}{6}$?
4. [1-Liter-Dose](?prob=can&v=1000&x=3): Ziehe den Rand der Dose. Ab wann wird die Dose „zu hoch“ für das Bild? Wie verhält sich $O(r)$ an den Rändern? Echte [Getränkedosen](?prob=can&v=350&x=3.3) sind schlanker als das Optimum – was könnte dafür sprechen?
5. [Rechteck](?prob=rect&x=0.8): Breiter heißt niedriger. Wo gleichen sich beide Effekte aus?
6. [Zylinder im Kegel](?prob=cone&cr=6&ch=12&x=2): Verändere $R$ und $H$. Was bleibt in der Karte „Probe“ immer gleich?
7. [Rettungsschwimmer](?prob=life&x=24): Die gerade Linie ist der kürzeste, aber nicht der schnellste Weg. Starte das „Wettrennen“. Vergleiche in der Karte „Brechungsgesetz“ die beiden Quotienten. Wo liegt das Optimum, wenn beide [gleich schnell](?prob=life&v1=4&v2=4&x=40) sind?

## Aufgaben

### Aufgabe 1: Kleiner Karton

Ein Karton misst $16\,\text{cm} \times 10\,\text{cm}$. Stelle $V(x)$ als Polynom auf und bestimme das Maximum. [Aufgabe laden](?prob=box&a=16&b=10&x=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V(x) = x(16 - 2x)(10 - 2x) = 4x^3 - 52x^2 + 160x$, $0 < x < 5$. $V'(x) = 12x^2 - 104x + 160 = 0 \iff 3x^2 - 26x + 40 = 0 \iff x = 2$ oder $x = \frac{20}{3}$; nur $x = 2$ liegt in $D$. $V(2) = 2 \cdot 12 \cdot 6 = 144\,\text{cm}^3$. [In der Simulation zeigen](?prob=box&a=16&b=10&x=2)

</details>

### Aufgabe 2: Dose

Eine Dose soll $500\,\text{cm}^3$ fassen. Bestimme Radius, Höhe und Oberfläche der Dose mit dem geringsten Blechverbrauch. [Aufgabe laden](?prob=can&v=500&x=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$O(r) = 2\pi r^2 + \frac{1000}{r}$, $O'(r) = 4\pi r - \frac{1000}{r^2} = 0 \Rightarrow r^3 = \frac{250}{\pi} \Rightarrow r \approx 4{,}30\,\text{cm}$. $O''(r) = 4\pi + \frac{2000}{r^3} > 0$: Minimum. $h = \frac{500}{\pi r^2} \approx 8{,}60\,\text{cm} = 2r$, $O = 6\pi r^2 \approx 348{,}7\,\text{cm}^2$. [In der Simulation zeigen](?prob=can&v=500&x=4.3)

</details>

### Aufgabe 3: Rechteck unter der e-Funktion

Ein Rechteck liegt mit zwei Seiten auf den Koordinatenachsen, die vierte Ecke $P(u \mid f(u))$ liegt auf dem Graphen von $f(x) = 3e^{-0{,}5x}$. Für welches $u$ ist der Flächeninhalt maximal? [Aufgabe laden](?prob=rect&x=0.8&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A(u) = 3u\,e^{-0{,}5u}$, $A'(u) = 3e^{-0{,}5u}(1 - 0{,}5u) = 0 \Rightarrow u = 2$, da $e^{-0{,}5u} \neq 0$. $A''(2) = 3e^{-1}(0{,}5 - 1) < 0$. $A(2) = \frac{6}{e} \approx 2{,}21$. Ränder: $A(0) = 0$ und $A(u) \to 0$ für $u \to \infty$. [In der Simulation zeigen](?prob=rect&x=2)

</details>

### Aufgabe 4: Zylinder im Kegel

In einen Kegel mit $R = 9\,\text{cm}$ und $H = 15\,\text{cm}$ wird ein Zylinder gestellt. Welcher Zylinder hat das größte Volumen? Welcher Anteil des Kegels ist das? [Aufgabe laden](?prob=cone&cr=9&ch=15&x=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Strahlensatz: $\frac{h}{15} = \frac{9 - r}{9}$, also $h = 15 - \frac{5}{3}r$ und $V(r) = \pi\left(15r^2 - \frac{5}{3}r^3\right)$, $0 < r < 9$. $V'(r) = \pi(30r - 5r^2) = 5\pi r(6 - r) = 0 \Rightarrow r = 6$. $h = 5\,\text{cm}$, $V = 180\pi \approx 565{,}5\,\text{cm}^3$. Der Kegel hat $\frac{1}{3}\pi \cdot 81 \cdot 15 = 405\pi$, der Zylinder füllt also $\frac{4}{9}$ davon. [In der Simulation zeigen](?prob=cone&cr=9&ch=15&x=6)

</details>

### Aufgabe 5: Rettungsschwimmer

Stelle $T(x)$ für $v_1 = 7\,\frac{\text{m}}{\text{s}}$ und $v_2 = 2\,\frac{\text{m}}{\text{s}}$ auf. Vergleiche die gerade Linie (warum $x = 24$?), den Weg „erst bis gegenüber laufen“ ($x = 60$) und das Optimum. [Aufgabe laden](?prob=life&x=24&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die gerade Linie schneidet das Ufer nach dem Strahlensatz bei $x = 60 \cdot \frac{20}{50} = 24$: $T(24) \approx 27{,}89\,\text{s}$. Bis gegenüber: $T(60) = \frac{\sqrt{4000}}{7} + 15 \approx 24{,}04\,\text{s}$. Optimum (numerisch, z. B. Newton-Verfahren): $x \approx 51{,}71\,\text{m}$, $T \approx 23{,}48\,\text{s}$. Wegen $T(0) \approx 36{,}40\,\text{s}$ und $T(60) \approx 24{,}04\,\text{s}$ ist das Minimum global – aber nur knapp besser als der Rand. [In der Simulation zeigen](?prob=life&x=51.71)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Anwendungen der Differentialrechnung in der Oberstufe (LehrplanPLUS Gymnasium Bayern; die genaue Jahrgangsstufe und der Lernbereich bitte am Lehrplan prüfen). Die Schachtel eignet sich als Einstieg, Kegel und Rettungsschwimmer als Vertiefung.
- **Einstieg:** Schachteln aus DIN-A4-Papier mit verschiedenen $x$ falten und vergleichen; „Optimum suchen“ zeigt danach erst das Probieren, dann die Rechnung. Vielleicht schätzt die Klasse vorher, welches $x$ am besten ist.
- **Aufgabenmodus:** Mit „Lösungsweg zeigen“ aus sind Graph, Ergebnisse und Lösungsweg verdeckt; das Bild bleibt bedienbar. „Lösung aufdecken“ löst Schritt für Schritt auf.
- **Modellkritik:** Warum sind echte Getränkedosen nicht optimal? (Falz, Stabilität, Griffigkeit, Werbefläche.)
- **Fächerverbindend:** Der Rettungsschwimmer führt zum Brechungsgesetz und zum Fermat-Prinzip – ein Anlass für eine gemeinsame Stunde mit Physik.
- **Häufige Stolpersteine:**
  - Die Nebenbedingung wird nicht eingesetzt – die Zielfunktion hat noch zwei Variablen.
  - Lösungen außerhalb des Definitionsbereichs werden übernommen (zweite Nullstelle bei der Schachtel).
  - Die Randwerte werden nicht verglichen – beim Rettungsschwimmer ist $T(60)$ nur knapp schlechter als das Optimum.
  - Die zweite Ableitung wird an der falschen Stelle ausgewertet oder ihr Vorzeichen falsch gedeutet.
