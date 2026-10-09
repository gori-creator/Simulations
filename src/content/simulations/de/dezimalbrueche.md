---
description: "Brüche schriftlich in Dezimalbrüche umwandeln: Wann geht die Division auf, wann entsteht eine Periode – und wie verraten es die Primfaktoren des Nenners?"
---

## Worum geht es?

Ein Bruch ist eine Division: $\frac{3}{8} = 3 : 8$. Bei der **schriftlichen Division** setzt man nach dem ganzzahligen Teil ein Komma und hängt an jeden Rest eine **Null** an:

$$
30 : 8 = 3 \text{ Rest } 6, \quad 60 : 8 = 7 \text{ Rest } 4, \quad 40 : 8 = 5 \text{ Rest } 0
$$

Also ist $\frac{3}{8} = 0{,}375$. Weil irgendwann der Rest $0$ bleibt, ist das ein **endlicher Dezimalbruch**.

Bei $\frac{3}{7}$ bleibt nie der Rest $0$. Die Reste sind $3, 2, 6, 4, 5, 1$ – und dann wieder $3$. Ab hier wiederholt sich die ganze Rechnung, also auch die Ziffern. So entsteht ein **periodischer Dezimalbruch**. Die Ziffern, die sich wiederholen, heißen **Periode** und bekommen einen **Periodenstrich**:

$$
\frac{3}{7} = 0{,}428571428571\ldots = 0{,}\overline{428571}
$$

Gelesen: „null Komma Periode vier zwei acht fünf sieben eins“. Beginnt die Periode nicht direkt nach dem Komma, heißen die Ziffern davor **Vorperiode**: $\frac{1}{6} = 0{,}1\overline{6}$ („null Komma eins Periode sechs“). Man unterscheidet **rein periodische** ($0{,}\overline{3}$) und **gemischt periodische** Dezimalbrüche ($0{,}1\overline{6}$).

**Warum muss sich etwas wiederholen?** Beim Teilen durch $n$ ist jeder Rest kleiner als $n$. Außer $0$ gibt es also nur die Reste $1, 2, \ldots, n-1$. Spätestens nach $n - 1$ Schritten muss ein Rest zum zweiten Mal auftreten. Deshalb hat die Periode eines Bruchs mit dem Nenner $n$ **höchstens $n - 1$ Ziffern**. Der **Restekreis** zeigt das: Jeder Pfeil führt von einem Rest zum nächsten; der Weg endet bei $0$ oder läuft im Kreis.

**Endlich oder periodisch – ohne zu rechnen:** Man kürzt den Bruch vollständig und zerlegt den Nenner in Primfaktoren.

- Kommen **nur die Primfaktoren 2 und 5** vor, kann man auf $10$, $100$, $1000$, … erweitern; der Dezimalbruch ist **endlich**: $\frac{3}{8} = \frac{3 \cdot 125}{8 \cdot 125} = \frac{375}{1000} = 0{,}375$.
- Kommt **weder 2 noch 5** vor, ist er **rein periodisch**: $\frac{5}{11} = 0{,}\overline{45}$.
- Kommen **2 oder 5 und andere Primfaktoren** vor, ist er **gemischt periodisch**: $\frac{5}{12} = 0{,}41\overline{6}$, denn $12 = 2 \cdot 2 \cdot 3$.

Wichtig: erst **kürzen**! $\frac{3}{6}$ hat den Nenner $6 = 2 \cdot 3$, ist aber gleich $\frac{1}{2} = 0{,}5$.

Die **Zahlenstrahl-Lupe** zeigt, was eine Ziffer bedeutet: Die erste Nachkommastelle sagt, in welchem Zehntel zwischen zwei ganzen Zahlen der Bruch liegt. Vergrößert man dieses Zehntel zehnfach, liest man die Hundertstel ab – und so weiter.

## Ausprobieren

1. Rechne [3/7 Schritt für Schritt](?z=3&n=7&show=0) mit „Nächste Stelle“. Notiere die Reste. Wann merkst du, dass sich die Ziffern wiederholen?
2. Vergleiche mit [3/8](?z=3&n=8&show=0). Woran erkennst du am Rechenblatt, dass die Division aufgeht?
3. Bei [1/6](?z=1&n=6) wiederholt sich der Rest $4$ sofort. Warum steht die $1$ nicht unter dem Periodenstrich?
4. Schau dir [1/13 mit allen Restepfeilen](?z=1&n=13&alle=1) an. Tippe dann im Restekreis auf die $2$. Wie viele Kreisläufe gibt es bei $13$?
5. Vergleiche [1/17](?z=1&n=17) mit [1/16](?z=1&n=16). Der Nenner ist fast gleich – das Ergebnis ganz verschieden. Woran liegt das?
6. Öffne die [Zahlenstrahl-Lupe für 1/3](?z=1&n=3&bild=lupe). Warum sieht jede Stufe gleich aus? Vergleiche mit der [Lupe für 3/8](?z=3&n=8&bild=lupe).
7. In der [Tafel aller Nenner](?mode=tafel&z=1&fak=1) sind die endlichen Brüche grün. Welche Nenner sind das? Stelle danach den [Zähler 3](?mode=tafel&z=3&fak=1) ein: Warum werden einige Kacheln grün?
8. Ist [22/7](?z=22&n=7) gleich $\pi = 3{,}14159\ldots$? Ab welcher Stelle unterscheiden sie sich?

## Aufgaben

### Aufgabe 1: Erweitern auf eine Zehnerpotenz

Schreibe als Dezimalbruch, ohne schriftlich zu dividieren: a) $\frac{7}{20}$ b) $\frac{3}{16}$ c) $\frac{9}{12}$ [Aufgabe b laden](?z=3&n=16&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

a) $\frac{7}{20} = \frac{35}{100} = 0{,}35$. b) $16 = 2^4$, also mit $5^4 = 625$ erweitern: $\frac{3}{16} = \frac{1875}{10000} = 0{,}1875$. c) Erst kürzen: $\frac{9}{12} = \frac{3}{4} = \frac{75}{100} = 0{,}75$. [Tafel ansehen](?mode=tafel&z=3&n=16&fak=1)

</details>

### Aufgabe 2: Endlich oder periodisch?

Entscheide nur mit den Primfaktoren des Nenners: $\frac{7}{40}$, $\frac{5}{6}$, $\frac{9}{12}$, $\frac{4}{15}$, $\frac{11}{22}$, $\frac{3}{14}$. [Tafel für Zähler 3](?mode=tafel&z=3&fak=1&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

- $\frac{7}{40}$: $40 = 2^3 \cdot 5$ → endlich ($0{,}175$).
- $\frac{5}{6}$: $6 = 2 \cdot 3$ → gemischt periodisch ($0{,}8\overline{3}$).
- $\frac{9}{12} = \frac{3}{4}$ → endlich ($0{,}75$).
- $\frac{4}{15}$: $15 = 3 \cdot 5$ → gemischt periodisch ($0{,}2\overline{6}$).
- $\frac{11}{22} = \frac{1}{2}$ → endlich ($0{,}5$).
- $\frac{3}{14}$: $14 = 2 \cdot 7$ → gemischt periodisch ($0{,}2\overline{142857}$). [Zeigen](?z=3&n=14)

</details>

### Aufgabe 3: Schriftlich dividieren

Berechne $\frac{5}{12}$ schriftlich. Notiere alle Reste und gib das Ergebnis mit Periodenstrich an. [Aufgabe laden](?z=5&n=12&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$50 : 12 = 4$ Rest $2$, $20 : 12 = 1$ Rest $8$, $80 : 12 = 6$ Rest $8$ – der Rest $8$ wiederholt sich. Also $\frac{5}{12} = 0{,}41\overline{6}$ mit der Vorperiode $41$. [Zeigen](?z=5&n=12)

</details>

### Aufgabe 4: Zwei Kreisläufe

Berechne $\frac{1}{13}$ und $\frac{2}{13}$. Beide Perioden haben $6$ Ziffern. Warum nicht $12$, obwohl es $12$ Reste ungleich $0$ gibt?

<details>
<summary>Lösung anzeigen</summary>

$\frac{1}{13} = 0{,}\overline{076923}$ mit den Resten $1, 10, 9, 12, 3, 4$; $\frac{2}{13} = 0{,}\overline{153846}$ mit den Resten $2, 7, 5, 11, 6, 8$. Die $12$ möglichen Reste zerfallen in **zwei** Kreisläufe zu je $6$ Resten. Welcher durchlaufen wird, hängt vom Startrest ab. „Höchstens $n - 1$“ heißt also nicht „immer $n - 1$“. [Restekreis mit allen Pfeilen](?z=1&n=13&alle=1)

</details>

### Aufgabe 5: Zurück zum Bruch

a) Schreibe $0{,}35$ und $0{,}125$ als vollständig gekürzte Brüche. b) Es ist $\frac{1}{9} = 0{,}\overline{1}$ und $\frac{1}{99} = 0{,}\overline{01}$. Schreibe damit $0{,}\overline{4}$ und $0{,}\overline{36}$ als Brüche.

<details>
<summary>Lösung anzeigen</summary>

a) $0{,}35 = \frac{35}{100} = \frac{7}{20}$ und $0{,}125 = \frac{125}{1000} = \frac{1}{8}$.

b) $0{,}\overline{4} = 4 \cdot 0{,}\overline{1} = \frac{4}{9}$ und $0{,}\overline{36} = 36 \cdot 0{,}\overline{01} = \frac{36}{99} = \frac{4}{11}$. [Prüfen](?z=4&n=11)

</details>

### Aufgabe 6: Rekord (Knobelaufgabe)

Welcher Bruch mit einem Nenner bis $50$ hat die längste Periode? Begründe, warum sie nicht länger sein kann.

<details>
<summary>Lösung anzeigen</summary>

$\frac{1}{47}$ (und jeder andere Bruch $\frac{z}{47}$, der sich nicht kürzen lässt) hat eine Periode mit $46$ Ziffern. Länger geht es bei $47$ nicht, denn es gibt nur $46$ Reste ungleich $0$. Für eine noch längere Periode bräuchte man einen Nenner $48$, $49$ oder $50$: Brüche mit dem Nenner $50 = 2 \cdot 5^2$ sind aber endlich, $\frac{1}{48} = 0{,}0208\overline{3}$ hat nur eine einstellige Periode und bei $49$ hat die Periode $42$ Ziffern. [1/47 zeigen](?z=1&n=47)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe 6, Lernbereich 1.2 „Dezimalbrüche“ (LehrplanPLUS Bayern, Gymnasium): Brüche als endliche oder periodische Dezimalbrüche, Umwandeln. Geeignet zur Erarbeitung (Schritt für Schritt mit `show=0`) und zur Vertiefung (Restekreis, Tafel). Die Primfaktorzerlegung aus der Simulation „Primfaktorzerlegung und Teilbarkeit“ wird hier angewendet.
- **Zwei Ansichten:** *Schriftlich dividieren* (Rechenblatt auf Karopapier, wahlweise mit Restekreis oder Zahlenstrahl-Lupe) und *Welche Nenner?* (alle Brüche $\frac{z}{n}$ mit $n \leq 50$ als farbige Kacheln, wahlweise mit Primfaktoren; weggekürzte Faktoren sind durchgestrichen).
- **Begründen statt merken:** Der Restekreis macht das Schubfachprinzip sichtbar: Es gibt nur endlich viele Reste, also muss sich einer wiederholen. Die Plaketten an den Resten zeigen, dass jeder Rest seine nächste Ziffer festlegt – deshalb wiederholen sich mit dem Rest auch die Ziffern.
- **Zur Vertiefung:** Die Länge der Vorperiode ist der größere der beiden Exponenten von $2$ und $5$ im gekürzten Nenner ($12 = 2^2 \cdot 3$ → $2$ Stellen). Das Umwandeln gemischt periodischer Dezimalbrüche in Brüche wird hier nicht behandelt.
- **Typische Fehlvorstellungen:**
  - „Die Periode beginnt, sobald sich eine Ziffer wiederholt.“ – Bei $\frac{1}{17} = 0{,}0588\ldots$ kommt die $8$ doppelt vor, die Periode hat aber $16$ Ziffern. Entscheidend ist der **Rest**, nicht die Ziffer.
  - „$0{,}\overline{3}$ ist ungefähr $\frac{1}{3}$.“ – $0{,}\overline{3}$ ist **genau** $\frac{1}{3}$; nur $0{,}333$ ist gerundet. Taschenrechner zeigen gerundete Werte wie $0{,}6666666667$.
  - „Der Nenner $6$ enthält eine $2$, also ist $\frac{1}{6}$ endlich.“ – Es dürfen **nur** $2$ und $5$ vorkommen.
  - „$\frac{3}{6}$ ist periodisch, weil $6$ den Faktor $3$ hat.“ – Erst kürzen: $\frac{3}{6} = \frac{1}{2}$.
