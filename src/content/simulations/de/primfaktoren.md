---
description: Interaktive Simulation zu Primzahlen – Faktorbäume wachsen lassen, Teilbarkeitsregeln prüfen, das Sieb des Eratosthenes durchführen und ggT und kgV im Mengenbild bestimmen.
---

## Worum geht es?

Eine **Primzahl** ist eine natürliche Zahl, die genau **zwei Teiler** hat: $1$ und sich selbst. $2, 3, 5, 7, 11, 13, \ldots$ sind Primzahlen. Die $1$ ist keine Primzahl, denn sie hat nur einen Teiler. Zahlen mit mehr als zwei Teilern heißen **zusammengesetzt**.

**Primfaktorzerlegung:** Jede natürliche Zahl größer als $1$ lässt sich als Produkt von Primzahlen schreiben. Im **Faktorbaum** zerlegt man so lange, bis nur noch Primzahlen übrig sind:

$$
360 = 18 \cdot 20 = 2 \cdot 2 \cdot 2 \cdot 3 \cdot 3 \cdot 5 = 2^3 \cdot 3^2 \cdot 5
$$

Wie man den Baum auch beginnt – am Ende stehen immer **dieselben Primfaktoren**. Die Primfaktorzerlegung ist (bis auf die Reihenfolge) eindeutig.

**Teilbarkeitsregeln** helfen, Teiler schnell zu finden:

- durch $2$, $5$ oder $10$: Man schaut auf die **letzte Ziffer**.
- durch $4$ oder $25$: Man schaut auf die Zahl aus den **letzten beiden Ziffern**.
- durch $3$ oder $9$: Man prüft die **Quersumme**, z. B. $3 + 6 + 0 = 9$.
- durch $6$: Die Zahl ist durch $2$ **und** durch $3$ teilbar.

**Sieb des Eratosthenes:** Man streicht die $1$. Die kleinste nicht gestrichene Zahl ist eine Primzahl; man umkreist sie und streicht alle ihre Vielfachen. Bis $100$ genügen $2, 3, 5$ und $7$, denn schon $11 \cdot 11 = 121$ ist größer als $100$.

**ggT und kgV:** Der größte gemeinsame Teiler ist das Produkt der **gemeinsamen** Primfaktoren, das kleinste gemeinsame Vielfache das Produkt **aller** Primfaktoren, wobei gemeinsame nur einmal gezählt werden. Mit $24 = 2 \cdot 2 \cdot 2 \cdot 3$ und $36 = 2 \cdot 2 \cdot 3 \cdot 3$:

$$
\text{ggT}(24; 36) = 2 \cdot 2 \cdot 3 = 12 \qquad \text{kgV}(24; 36) = 2 \cdot 2 \cdot 2 \cdot 3 \cdot 3 = 72
$$

## Ausprobieren

1. Zerlege [360 Schritt für Schritt](?show=0): Tippe auf die gestrichelten Zahlen oder drücke **Zerlegen**.
2. Drücke mehrmals **Anderer Baum**. Was ändert sich, was bleibt immer gleich?
3. Spalte immer den [kleinsten Primfaktor ab](?split=klein). Wie sieht der Baum jetzt aus?
4. Zerlege [512](?n=512&split=klein) und schreibe das Ergebnis als Potenz.
5. Tippe im Baum auf eine Zahl: Rechts siehst du, durch welche Zahlen sie teilbar ist. Probiere [783](?n=783) – die Quersumme verrät viel.
6. Führe das [Sieb bis 100](?mode=sieb&show=0) mit **Nächste Primzahl** durch. Tippe auf eine gestrichene Zahl: Welche Primzahl hat sie gestrichen?
7. Ordne die Zahlen in [6 Spalten](?mode=sieb&cols=6&max=120) an. In welchen Spalten stehen die Primzahlen ab $5$? Warum?
8. Bestimme ggT und kgV von [24 und 36](?mode=ggt&show=0) mit **Faktoren zuordnen**. Was passiert bei [8 und 15](?mode=ggt&a=8&b=15)?

## Aufgaben

### Aufgabe 1: Primfaktorzerlegung

[Aufgabe laden](?n=84&show=0&_hide=1) Zerlege $84$, $126$ und $500$ in Primfaktoren und schreibe mit Potenzen.

<details>
<summary>Lösung anzeigen</summary>

$84 = 2^2 \cdot 3 \cdot 7$, $126 = 2 \cdot 3^2 \cdot 7$ und $500 = 2^2 \cdot 5^3$. [126 zeigen](?n=126) · [500 zeigen](?n=500)

</details>

### Aufgabe 2: Teilbarkeitsregeln

Prüfe ohne Taschenrechner, ob $852$ durch $2$, $3$, $4$, $6$ und $9$ teilbar ist.

<details>
<summary>Lösung anzeigen</summary>

Die Endziffer $2$ ist gerade: durch $2$ teilbar. Die Quersumme $8 + 5 + 2 = 15$ ist durch $3$, aber nicht durch $9$ teilbar. $52$ ist durch $4$ teilbar, also auch $852$. Durch $2$ und $3$ teilbar heißt durch $6$ teilbar. Nur durch $9$ ist $852$ nicht teilbar. [Prüfen](?n=852)

</details>

### Aufgabe 3: Primzahlen suchen

Welche Primzahlen liegen zwischen $50$ und $70$?

<details>
<summary>Lösung anzeigen</summary>

$53$, $59$, $61$ und $67$. Alle anderen Zahlen dazwischen sind durch $2$, $3$, $5$ oder $7$ teilbar, z. B. $51 = 3 \cdot 17$ und $57 = 3 \cdot 19$. [Sieb zeigen](?mode=sieb)

</details>

### Aufgabe 4: ggT und kgV

[Aufgabe laden](?mode=ggt&a=60&b=84&show=0&_hide=1) Bestimme ggT und kgV von $60$ und $84$ über die Primfaktoren.

<details>
<summary>Lösung anzeigen</summary>

$60 = 2 \cdot 2 \cdot 3 \cdot 5$ und $84 = 2 \cdot 2 \cdot 3 \cdot 7$. Gemeinsam sind $2 \cdot 2 \cdot 3$, also $\text{ggT}(60; 84) = 12$. Alle Faktoren: $\text{kgV}(60; 84) = 2 \cdot 2 \cdot 3 \cdot 5 \cdot 7 = 420$.

</details>

### Aufgabe 5: Busse

Zwei Busse fahren um $8$ Uhr gleichzeitig ab. Bus A fährt alle $12$ Minuten, Bus B alle $18$ Minuten. Wann fahren sie das nächste Mal gleichzeitig ab?

<details>
<summary>Lösung anzeigen</summary>

Gesucht ist das kleinste gemeinsame Vielfache: $\text{kgV}(12; 18) = 36$. Die Busse fahren um $8{:}36$ Uhr wieder gleichzeitig. [In der Simulation zeigen](?mode=ggt&a=12&b=18)

</details>

### Aufgabe 6: Warum genügt die 7?

Begründe, warum man beim Sieb bis $100$ nach den Vielfachen von $7$ aufhören kann.

<details>
<summary>Lösung anzeigen</summary>

Eine zusammengesetzte Zahl bis $100$ ist ein Produkt $a \cdot b$ mit $a \le b$. Wäre $a$ größer als $10$, dann wäre $a \cdot b > 10 \cdot 10 = 100$. Also hat jede zusammengesetzte Zahl bis $100$ einen Teiler bis $10$ und damit einen Primfaktor $2$, $3$, $5$ oder $7$ – sie ist schon gestrichen.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 5, Lernbereich 3.1 (Primfaktorzerlegung und Teilbarkeitsregeln). ggT und kgV werden später beim Kürzen und beim Gleichnamigmachen von Brüchen gebraucht (Jahrgangsstufe 6).
- **Drei Ansichten:** Faktorbaum mit Teilbarkeitsregeln, Sieb des Eratosthenes und ggT/kgV im Mengenbild. Jede Primzahl hat in allen Ansichten dieselbe Farbe.
- **Schritt für Schritt:** Ist „Ergebnis sofort zeigen“ ausgeschaltet (`show=0`), beginnen Baum, Sieb und Mengenbild leer und werden mit den Knöpfen oder durch Antippen aufgebaut.
- **Eindeutigkeit:** „Anderer Baum“ zerlegt mit zufälligen Teilern. Dass immer dieselben Primfaktoren entstehen, ist ein guter Anlass für die Frage nach dem Warum (ohne Beweis in Jahrgangsstufe 5).
- **Typische Fehlvorstellungen:**
  - „$1$ ist eine Primzahl.“
  - „Ungerade Zahlen sind Primzahlen.“ – $9$, $15$, $51 = 3 \cdot 17$ oder $91 = 7 \cdot 13$ sind es nicht.
  - Die Quersummenregel wird auf $4$ übertragen.
  - ggT und kgV werden verwechselt; das Mengenbild zeigt: Schnittmenge ergibt den ggT, alles zusammen den kgV.
