## Worum geht es?

Eine **Ungleichung** vergleicht zwei Terme mit einem der Zeichen $<$, $\le$, $>$ oder $\ge$. Ein Beispiel ist $2x + 1 < 7$. Anders als eine lineare Gleichung hat sie meist **unendlich viele** Lösungen, nämlich alle Zahlen eines Bereichs. Hier sind es alle $x$, die kleiner als $3$ sind.

### Lösungsmenge

Die **Lösungsmenge** fasst alle Lösungen zusammen:

$$L = \{x \mid x < 3\}$$

Am Zahlenstrahl ist das ein Strahl. Ein **offener Kreis** bedeutet, dass die Grenze nicht dazugehört ($<$ oder $>$). Ein **gefüllter Kreis** bedeutet, dass sie dazugehört ($\le$ oder $\ge$).

### Lösen durch Umformen

Man formt um wie bei einer Gleichung und schreibt die Umformung jeweils dahinter:

$$\begin{aligned} 3x - 2 &> x + 4 && \mid -x \\ 2x - 2 &> 4 && \mid +2 \\ 2x &> 6 && \mid :2 \\ x &> 3 \end{aligned}$$

Addieren und Subtrahieren ist immer erlaubt. Auch Multiplizieren und Dividieren mit einer **positiven** Zahl ändert nichts am Zeichen.

### Achtung: Zeichen umdrehen

Multipliziert oder dividiert man mit einer **negativen** Zahl, muss man das Relationszeichen **umdrehen**:

$$\begin{aligned} -2x + 4 &\ge 0 && \mid -4 \\ -2x &\ge -4 && \mid :(-2) \quad \text{Zeichen umdrehen!} \\ x &\le 2 \end{aligned}$$

Warum ist das so? Es gilt $1 < 2$. Nimmt man beide Seiten mal $-1$, erhält man $-1$ und $-2$. Am Zahlenstrahl liegt $-1$ rechts von $-2$, also gilt $-1 > -2$. Das Malnehmen mit einer negativen Zahl spiegelt alles an der Null, und dabei kehrt sich die Reihenfolge um.

### Grafisch lösen

Man zeichnet beide Seiten als Geraden: $y = ax + b$ und $y = cx + d$. Wo die linke Gerade **unterhalb** der rechten liegt, gilt $ax + b < cx + d$. Die Grenze liegt beim **Schnittpunkt** der beiden Geraden. In der Simulation ist dieser Bereich grün eingefärbt.

### Sonderfälle

Fallen beim Umformen alle $x$ weg, bleibt eine Aussage ohne $x$ übrig:

- $x + 1 > x$ führt auf $1 > 0$. Das ist **immer wahr**, also $L = \mathbb{R}$.
- $x > x + 1$ führt auf $0 > 1$. Das ist **nie wahr**, also $L = \{\,\}$.

Grafisch sind das zwei **parallele** Geraden.

### Ausprobieren mit der Waage

Wer noch nicht umformen möchte, kann Zahlen einsetzen: Für jedes x zeigt eine Waage, welche Seite größer ist. Probiert man viele Zahlen nacheinander aus, entsteht am Zahlenstrahl ein grüner Bereich – genau die Lösungsmenge. An der Grenze kippt die Waage.

### Zwei Bedingungen: und, oder

Oft gelten zwei Bedingungen zugleich, zum Beispiel $-2 < x \le 3$. Das heißt: $x > -2$ **und** $x \le 3$. Am Zahlenstrahl ist die Lösung der Bereich, in dem sich beide Strahlen überlappen. Man schreibt dafür das Intervall $]-2;\, 3]$: Die eckige Klammer nach außen bedeutet „Grenze gehört nicht dazu“. Bei **oder** reicht eine Bedingung: $x < -3$ oder $x > 4$ besteht aus zwei getrennten Strahlen. Passen die Bedingungen nicht zusammen ($x > 5$ und $x < 1$), ist die Lösungsmenge leer.

### Ungleichungen im Alltag

Viele Fragen aus dem Alltag sind Ungleichungen: Ab wie vielen Minuten lohnt sich die Flatrate? Wie viele Kisten darf ich in den Aufzug laden? Man stellt die Ungleichung auf, löst sie und rundet passend: Bei „höchstens“ wird abgerundet (22,4 Kisten → 22 Kisten), bei „mindestens“ aufgerundet (18,3 Wochen → 19 Wochen).

### Zwei Variablen: Halbebenen

Eine Ungleichung wie $y < 0{,}5x + 1$ hat unendlich viele Lösungspunkte $(x \mid y)$. Sie liegen alle **unterhalb** der Geraden $y = 0{,}5x + 1$ – eine Halbebene. Bei $<$ und $>$ gehört die Gerade selbst nicht dazu (gestrichelt), bei $\le$ und $\ge$ schon (durchgezogen).

## Ausprobieren

- [2x + 1 < 7](?a=2&b=1&rel=lt&c=0&d=7&t=1): Ziehe den Probepunkt. Wann stimmt die Ungleichung?
- [−2x + 4 ≥ 0](?a=-2&b=4&rel=ge&c=0&d=0&t=0): Achte auf den Schritt, in dem sich das Zeichen umdreht.
- [Tarifvergleich](?a=0.5&b=2&rel=lt&c=1&d=0&t=6): Tarif A kostet 2 € Grundgebühr plus 0,50 € pro Stunde, Tarif B kostet 1 € pro Stunde. Ab wann ist A günstiger?
- [x + 1 > x](?a=1&b=1&rel=gt&c=1&d=0&t=2): Was passiert, wenn die Geraden parallel sind?
- [Waage](?mode=waage&a=2&b=1&rel=lt&c=0&d=7&t=-4): Drücke „Alle Zahlen durchprobieren“.
- [−2 < x ≤ 3](?mode=doppelt&lo=-2&lr=lt&hi=3&hr=le&op=und) und [x < −3 oder x > 4](?mode=doppelt&lo=4&lr=lt&hi=-3&hr=lt&op=oder): Wie sieht „und“, wie „oder“ aus?
- [Handytarif](?mode=alltag&sc=handy&mh=60), [Sparen](?mode=alltag&sc=sparen&ws=10), [Aufzug](?mode=alltag&sc=aufzug&kb=10): Ziehe den Punkt bis zur Grenze.
- [Halbebene](?mode=halbebene&m=0.5&n=1&rel=lt&px=2&py=1): Welche Punkte erfüllen $y < 0{,}5x + 1$?
- [Üben](?mode=ueben&qn=1): Sechs Aufgabenarten mit Punktestand.

## Aufgaben

**1. Lösungsmenge.** Löse $3x - 5 \le 7$ und zeichne die Lösungsmenge am Zahlenstrahl. [Aufgabe laden](?a=3&b=-5&rel=le&c=0&d=7&t=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$3x \le 12$, also $x \le 4$. Die Lösungsmenge ist $L = \{x \mid x \le 4\}$: ein gefüllter Kreis bei $4$ und ein Strahl nach links.

</details>

**2. Zeichen umdrehen.** Löse $5 - x > 2$. [Aufgabe laden](?a=-1&b=5&rel=gt&c=0&d=2&t=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$-x > -3$. Teilt man durch $-1$, dreht sich das Zeichen um: $x < 3$.

</details>

**3. x auf beiden Seiten.** Löse $4x + 1 \ge 2x + 7$. [Aufgabe laden](?a=4&b=1&rel=ge&c=2&d=7&t=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$2x + 1 \ge 7$, dann $2x \ge 6$, also $x \ge 3$.

</details>

**4. Tarife.** Ein Fahrradverleih verlangt 2 € plus 0,50 € pro Stunde, ein zweiter 1 € pro Stunde ohne Grundgebühr. Ab wie vielen Stunden ist der erste günstiger? [Aufgabe laden](?a=0.5&b=2&rel=lt&c=1&d=0&t=2&_hide=1)

<details><summary>Lösung anzeigen</summary>

Gesucht ist $0{,}5x + 2 < x$, also $2 < 0{,}5x$ und damit $x > 4$. Ab mehr als 4 Stunden ist der erste Verleih günstiger. Bei genau 4 Stunden kosten beide 4 €.

</details>

**5. Zwischen zwei Zahlen.** Wie viele ganze Zahlen erfüllen $-2 < x \le 3$? [Aufgabe laden](?mode=doppelt&lo=-2&lr=lt&hi=3&hr=le&op=und&_hide=1)

<details><summary>Lösung anzeigen</summary>

$-1, 0, 1, 2, 3$ – also 5 Zahlen. Die −2 gehört nicht dazu, die 3 schon.

</details>

**6. Aufzug.** Ein Aufzug trägt höchstens 630 kg. Eine Person (80 kg) lädt Kisten zu je 25 kg ein. Wie viele Kisten darf sie höchstens mitnehmen? [Aufgabe laden](?mode=alltag&sc=aufzug&kb=10&_hide=1)

<details><summary>Lösung anzeigen</summary>

$25x + 80 \le 630$, also $25x \le 550$ und $x \le 22$. Höchstens 22 Kisten.

</details>

## Ideen für den Unterricht

- **Waage als Einstieg:** Erst Zahlen ausprobieren lassen, dann fragen, wie man die Grenze ohne Probieren findet.
- **Häufiger Fehler:** Beim Teilen durch eine negative Zahl wird das Zeichen vergessen. Mit der Probe an einer Zahl aus dem grünen Bereich fällt das sofort auf.
- **Alltag:** Schülerinnen und Schüler suchen eigene Tarife (Handy, Streaming, Kino-Abo) und stellen die Ungleichung selbst auf.
