---
description: "Interaktive Simulation zum grafischen Lösen linearer Gleichungssysteme: zwei Geraden, Schnittpunkt ablesen, Probe durch Einsetzen, parallele und identische Geraden und ein Tarifvergleich als Sachaufgabe."
---

## Worum geht es?

Ein **lineares Gleichungssystem** mit zwei Variablen besteht aus zwei linearen Gleichungen, z. B.

$$
\begin{aligned}
\text{I}\quad & y = 2x - 1\\
\text{II}\quad & y = -x + 5
\end{aligned}
$$

Gesucht sind alle Zahlenpaare $(x \mid y)$, die **beide** Gleichungen erfüllen. Jede Gleichung beschreibt eine **Gerade**: Alle Punkte der Geraden erfüllen die Gleichung. Ein Punkt, der beide Gleichungen erfüllt, liegt also auf beiden Geraden – er ist ihr **Schnittpunkt**.

**Grafisches Lösungsverfahren:**

1. Beide Gleichungen nach $y$ auflösen (Normalform $y = mx + t$). Aus $2x + y = 5$ wird $y = -2x + 5$.
2. Beide Geraden zeichnen: $y$-Achsenabschnitt $t$ eintragen, dann mit dem Steigungsdreieck „1 nach rechts, $m$ nach oben“.
3. Den Schnittpunkt ablesen, hier $S(2 \mid 3)$.
4. **Probe** durch Einsetzen in beide Gleichungen: $2 \cdot 2 - 1 = 3$ ✓ und $-2 + 5 = 3$ ✓. Also $L = \{(2 \mid 3)\}$.

**Wie viele Lösungen gibt es?**

| Lage der Geraden | Kennzeichen | Lösungsmenge |
| --- | --- | --- |
| schneiden sich | verschiedene Steigungen | genau eine Lösung |
| parallel, verschieden | gleiche Steigung, verschiedene $t$ | keine Lösung: $L = \{\,\}$ |
| identisch | gleiche Steigung, gleiches $t$ | unendlich viele Lösungen |

**Grenzen des Verfahrens:** Liegt der Schnittpunkt nicht auf Gitterpunkten, kann man ihn nur ungefähr ablesen. Dann hilft ein rechnerisches Verfahren, z. B. das **Gleichsetzungsverfahren**: $2x - 1 = -x + 5 \Rightarrow 3x = 6 \Rightarrow x = 2$.

## Ausprobieren

1. Ziehe die markierten Punkte: den $y$-Achsenabschnitt und die Spitze des Steigungsdreiecks. Wie wandert der Schnittpunkt?
2. Drücke **Probe durch Einsetzen**.
3. Stelle [parallele Geraden](?m1=0.5&t1=1&m2=0.5&t2=-2) ein. Warum gibt es keinen Schnittpunkt?
4. Was passiert bei [2x − y = 1 und −4x + 2y = −2](?form=general&a1=2&b1=-1&c1=1&a2=-4&b2=2&c2=-2)?
5. Lies den Schnittpunkt von [y = x und y = −0,5x + 2](?m1=1&t1=0&m2=-0.5&t2=2) ab. Wie genau geht das?
6. Vergleiche zwei [Handytarife](?form=tarif): Ab wie vielen Gesprächsminuten lohnt sich Tarif A?

## Aufgaben

### Aufgabe 1: Grafisch lösen

[Aufgabe laden](?m1=1&t1=1&m2=-2&t2=7&_hide=1) Löse das System grafisch und mache die Probe:
$\text{I}\; y = x + 1$, $\text{II}\; y = -2x + 7$.

<details>
<summary>Lösung anzeigen</summary>

Die Geraden schneiden sich in $S(2 \mid 3)$. Probe: $2 + 1 = 3$ ✓ und $-2 \cdot 2 + 7 = 3$ ✓. $L = \{(2 \mid 3)\}$.

</details>

### Aufgabe 2: Erst nach y auflösen

[Aufgabe laden](?form=general&a1=1&b1=1&c1=6&a2=2&b2=-1&c2=3&_hide=1) Löse $\text{I}\; x + y = 6$, $\text{II}\; 2x - y = 3$.

<details>
<summary>Lösung anzeigen</summary>

$\text{I}\; y = -x + 6$ und $\text{II}\; y = 2x - 3$. Schnittpunkt $S(3 \mid 3)$; Probe: $3 + 3 = 6$ ✓, $2 \cdot 3 - 3 = 3$ ✓.

</details>

### Aufgabe 3: Anzahl der Lösungen

Entscheide ohne Zeichnung, wie viele Lösungen das System hat:
(a) $y = 3x - 2$ und $y = 3x + 1$, (b) $2x + 4y = 8$ und $x + 2y = 4$, (c) $y = 2x + 1$ und $y = -0{,}5x + 1$.

<details>
<summary>Lösung anzeigen</summary>

(a) Gleiche Steigung, verschiedene $y$-Achsenabschnitte: parallel, **keine** Lösung. [Zeigen](?m1=3&t1=-2&m2=3&t2=1)

(b) Beide ergeben $y = -0{,}5x + 2$: identisch, **unendlich viele** Lösungen. [Zeigen](?form=general&a1=2&b1=4&c1=8&a2=1&b2=2&c2=4)

(c) Verschiedene Steigungen: **genau eine** Lösung, nämlich $(0 \mid 1)$ – beide Geraden haben denselben $y$-Achsenabschnitt. [Zeigen](?m1=2&t1=1&m2=-0.5&t2=1)

</details>

### Aufgabe 4: Ablesen oder rechnen?

[Aufgabe laden](?m1=1&t1=0&m2=-0.5&t2=2&_hide=1) Lies den Schnittpunkt von $y = x$ und $y = -0{,}5x + 2$ ab und bestimme ihn dann rechnerisch.

<details>
<summary>Lösung anzeigen</summary>

Abgelesen etwa $S(1{,}3 \mid 1{,}3)$. Gleichsetzen: $x = -0{,}5x + 2 \Rightarrow 1{,}5x = 2 \Rightarrow x = \frac{4}{3}$, also $S\left(\frac{4}{3} \mid \frac{4}{3}\right)$ – grafisch nur ungefähr erkennbar.

</details>

### Aufgabe 5: Handytarife

Tarif A kostet $10\,€$ im Monat und $5\,\text{ct}$ pro Minute, Tarif B $4\,€$ im Monat und $11\,\text{ct}$ pro Minute. Stelle für beide Tarife die Kosten $y$ (in €) in Abhängigkeit von der Gesprächszeit $x$ (in min) auf. Ab welcher Gesprächszeit ist Tarif A günstiger? [Aufgabe laden](?form=tarif&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\text{A}\; y = 0{,}05x + 10$, $\text{B}\; y = 0{,}11x + 4$. Gleichsetzen: $0{,}05x + 10 = 0{,}11x + 4 \Rightarrow 6 = 0{,}06x \Rightarrow x = 100$. Bei $100$ Minuten kosten beide $15\,€$; bei mehr als 100 Minuten ist Tarif A günstiger.

Senkt Tarif B den Minutenpreis auf $9\,\text{ct}$, verschiebt sich die Grenze auf $150$ Minuten ($17{,}50\,€$). [Zeigen](?form=tarif&p2=9)

</details>

### Aufgabe 6: Zwei Zahlen gesucht

Die Summe zweier Zahlen ist $10$, ihre Differenz $4$. Stelle ein Gleichungssystem auf und löse es grafisch.

<details>
<summary>Lösung anzeigen</summary>

$\text{I}\; x + y = 10$, $\text{II}\; x - y = 4$. Die Geraden schneiden sich in $(7 \mid 3)$: Die Zahlen sind $7$ und $3$. [Zeigen](?form=general&a1=1&b1=1&c1=10&a2=1&b2=-1&c2=4)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 8, Lernbereich 6 (Lineare Gleichungssysteme: aufstellen, grafisch und rechnerisch lösen, Lösbarkeit und Lösungsvielfalt). Voraussetzung sind lineare Funktionen (Lernbereich 2).
- **Darstellungen:** Normalform $y = mx + t$ (Regler und ziehbare Punkte), allgemeine Form $ax + by = c$ mit ganzzahligen Koeffizienten (inklusive senkrechter Geraden; der Punkt auf der $y$-Achse verschiebt die Gerade parallel) und ein Tarifvergleich mit Achsen in Minuten und Euro. Beim Wechsel zwischen Normalform und allgemeiner Form werden die Gleichungen umgerechnet, soweit das mit den Reglern möglich ist.
- **Exaktheit:** Die Simulation rechnet mit Brüchen. Liegt der Schnittpunkt nicht auf „schönen“ Werten, zeigt sie den abgelesenen Näherungswert und den exakten Wert – ein guter Anlass für die rechnerischen Verfahren. Die Ergebnisse „Rechnerisch (Gleichsetzen)“ und „Probe“ lassen sich mit `_hide=1` verdecken.
- **Typische Fehlvorstellungen:**
  - Der Schnittpunkt wird nur mit einer Gleichung überprüft.
  - Parallele Geraden werden mit „Lösung $x = 0$“ verwechselt; bei identischen Geraden wird „keine Lösung“ angegeben.
  - Die Gleichung $ax + by = c$ wird ohne Auflösen nach $y$ gezeichnet, z. B. $c$ als $y$-Achsenabschnitt.
- **Schreibweise:** Lösungsmenge als $L = \{(2 \mid 3)\}$; bei identischen Geraden $L = \{(x \mid y) \mid y = 2x - 1\}$.
