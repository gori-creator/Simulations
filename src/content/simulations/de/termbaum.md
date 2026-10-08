---
description: "Interaktiver Termbaum: eigene Terme eingeben, die Struktur als Rechenbaum sehen, Schritt für Schritt in der richtigen Rechenreihenfolge ausrechnen und die Termart bestimmen."
---

## Worum geht es?

Ein **Term** ist eine sinnvolle Rechenvorschrift aus Zahlen, Variablen, Rechenzeichen und Klammern, z. B. $(12 - 4) \cdot 3 + 6 : 2$. Im **Termbaum** (Rechenbaum) sieht man, wie der Term aufgebaut ist: Oben stehen die Zahlen, darunter die Rechnungen. Jede Rechnung verbindet zwei Teilterme, ganz unten steht die **zuletzt ausgeführte Rechnung** – sie liefert den Termwert.

**Rechenreihenfolge:**

1. Was in **Klammern** steht, wird zuerst berechnet (bei mehreren Klammern die innerste zuerst).
2. **Potenz vor Punkt vor Strich:** erst Potenzen, dann $\cdot$ und $:$, zuletzt $+$ und $-$.
3. Sonst wird **von links nach rechts** gerechnet: $20 - 8 - 2 = 12 - 2 = 10$.

**Termart:** Ein Term wird nach der **zuletzt ausgeführten Rechnung** benannt:

| letzte Rechnung | Termart | Glieder |
| --- | --- | --- |
| $+$ | Summe | 1. Summand $+$ 2. Summand |
| $-$ | Differenz | Minuend $-$ Subtrahend |
| $\cdot$ | Produkt | 1. Faktor $\cdot$ 2. Faktor |
| $:$ | Quotient | Dividend $:$ Divisor |
| Potenzieren | Potenz | Basis$^{\text{Exponent}}$ |

So ist $(12 + 4) - 3 \cdot 2$ eine **Differenz**: die Differenz aus der Summe aus $12$ und $4$ und dem Produkt aus $3$ und $2$.

**Vorsicht bei Vorzeichen und Potenzen:** $-3^2$ ist die Gegenzahl von $3^2$, also $-9$. Dagegen ist $(-3)^2 = (-3) \cdot (-3) = 9$. Genauso bedeutet $2x^2$ dasselbe wie $2 \cdot x^2$ – nicht $(2x)^2$.

**Variablen:** Setzt man für eine Variable eine Zahl ein, erhält man einen **Termwert**. Negative Zahlen werden dabei eingeklammert: Für $x = -2$ ist $3x + 1 = 3 \cdot (-2) + 1 = -5$.

## Ausprobieren

1. Vergleiche die Bäume von [3 + 4 · 5](?term=3%20%2B%204%20%C2%B7%205) und [(3 + 4) · 5](?term=%283%20%2B%204%29%20%C2%B7%205). Welche Rechnung steht jeweils unten? Welche Termart ergibt sich?
2. Drücke **Nächster Rechenschritt** und beobachte, wie die Werte durch den Baum wandern. Die Zeile über dem Baum zeigt den Rechenweg.
3. Tippe in [4 · 5 + 2³](?term=4%20%C2%B7%205%20%2B%202%C2%B3) zuerst auf die Multiplikation. Die Simulation erlaubt das – warum ändert sich das Ergebnis nicht? Tippe dann auf die Addition, bevor alles darüber ausgerechnet ist.
4. [−3² oder (−3)²?](?term=-3%C2%B2%20%2B%20%28-3%29%C2%B2) Wo im Baum steht das Vorzeichen?
5. Vergleiche [2x²](?term=2x%C2%B2&x=3) und [(2x)²](?term=%282x%29%C2%B2&x=3). Verändere $x$ mit dem Regler.
6. Rechne mit [Brüchen](?term=%281%2F2%20%2B%201%2F3%29%20%C2%B7%206): Die Simulation rechnet exakt, $\frac{1}{2} + \frac{1}{3} = \frac{5}{6}$.
7. Gib eigene Terme ein. Was meldet die Simulation bei $3 + {}$, bei $5 \cdot -3$ oder bei $5 : (3 - 3)$?

## Aufgaben

### Aufgabe 1: Termart bestimmen

[Aufgabe laden](?term=%2812%20%2B%204%29%20-%203%20%C2%B7%202&names=0&_hide=1) Bestimme die Termart von $(12 + 4) - 3 \cdot 2$, benenne die beiden Glieder und berechne den Termwert. Überprüfe dann mit dem Baum.

<details>
<summary>Lösung anzeigen</summary>

Zuletzt wird subtrahiert, der Term ist also eine **Differenz**. Minuend: die Summe $12 + 4$, Subtrahend: das Produkt $3 \cdot 2$.

$$(12 + 4) - 3 \cdot 2 = 16 - 6 = 10$$

</details>

### Aufgabe 2: Rechenreihenfolge

Berechne Schritt für Schritt: $2 \cdot [3 + (4 - 1)] - 12 : (2 + 4) + 5^2$. Welche Termart liegt vor? [Aufgabe laden](?term=2%20%C2%B7%20%5B3%20%2B%20%284%20-%201%29%5D%20-%2012%20%3A%20%282%20%2B%204%29%20%2B%205%C2%B2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Innere Klammer zuerst, dann die übrigen Klammern, dann die Potenz, dann Punkt vor Strich, zuletzt von links nach rechts:

$$2 \cdot [3 + 3] - 12 : 6 + 25 = 2 \cdot 6 - 2 + 25 = 12 - 2 + 25 = 35$$

Die letzte Rechnung ist eine Addition – der Term ist eine **Summe**.

</details>

### Aufgabe 3: Vom Text zum Term

Schreibe als Term und berechne: „die Differenz aus dem Produkt aus 7 und 8 und der Summe aus 15 und 9“.

<details>
<summary>Lösung anzeigen</summary>

$7 \cdot 8 - (15 + 9) = 56 - 24 = 32$. Die Klammer ist nötig, weil der ganze Summand $15 + 9$ subtrahiert wird. [Baum zeigen](?term=7%20%C2%B7%208%20-%20%2815%20%2B%209%29)

</details>

### Aufgabe 4: Klammern setzen

Setze in $2 + 3 \cdot 4 - 1$ Klammern so, dass sich $19$, $11$ bzw. $15$ ergibt. Wie verändert sich jeweils der Baum? [Ohne Klammern](?term=2%20%2B%203%20%C2%B7%204%20-%201)

<details>
<summary>Lösung anzeigen</summary>

- [$(2 + 3) \cdot 4 - 1 = 19$](?term=%282%20%2B%203%29%20%C2%B7%204%20-%201) – eine Differenz
- [$2 + 3 \cdot (4 - 1) = 11$](?term=2%20%2B%203%20%C2%B7%20%284%20-%201%29) – eine Summe
- [$(2 + 3) \cdot (4 - 1) = 15$](?term=%282%20%2B%203%29%20%C2%B7%20%284%20-%201%29) – ein Produkt

Ohne Klammern ist der Wert $2 + 12 - 1 = 13$.

</details>

### Aufgabe 5: Termwerte

Berechne den Wert von $2x^2 - 3x + 1$ für $x = -2$ und für $x = 0{,}5$. [Aufgabe laden](?term=2x%C2%B2%20-%203x%20%2B%201&x=-2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$x = -2$: $2 \cdot (-2)^2 - 3 \cdot (-2) + 1 = 8 + 6 + 1 = 15$

$x = 0{,}5$: $2 \cdot 0{,}25 - 1{,}5 + 1 = 0$. Für $x = 0{,}5$ hat der Term also den Wert $0$. Die Wertetabelle unter dem Baum zeigt weitere Werte.

</details>

### Aufgabe 6: Fehler finden

Tim rechnet: $-3^2 = 9$ und $20 - 8 - 2 = 20 - 6 = 14$. Erkläre seine Fehler mithilfe des Termbaums.

<details>
<summary>Lösung anzeigen</summary>

- [$-3^2$](?term=-3%C2%B2): Zuerst wird quadriert, dann die Gegenzahl gebildet: $-3^2 = -9$. Nur $(-3)^2 = 9$.
- [$20 - 8 - 2$](?term=20%20-%208%20-%202): Bei gleichrangigen Rechnungen gilt „von links nach rechts“: $20 - 8 - 2 = 12 - 2 = 10$. Tim hat $20 - (8 - 2)$ gerechnet – [das ist ein anderer Baum](?term=20%20-%20%288%20-%202%29).

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 5 (LB 1.2 und 3.2: Struktur von Termen, „Punkt vor Strich“), Jahrgangsstufe 6 (LB 1.5: Termstrukturen mit rationalen Zahlen) und Jahrgangsstufe 7 (LB 1.1: Terme mit Variablen, Termwerte, Termstrukturen benennen).
- **Eingabe:** Malpunkt als `*` oder `·`, Division mit `:`, Potenzen mit `^` oder `²`, Klammern `( )` und `[ ]`. Ein Schrägstrich zwischen zwei ganzen Zahlen (`3/4`) steht für einen **Bruch** (eine Zahl), sonst für eine Division. Erlaubte Variablen: $a, b, c, n, x, y, z$. Eigene Terme lassen sich über **Teilen** als Link oder QR-Code weitergeben.
- **Darstellung:** Wie in vielen Schulbüchern stehen die Zahlen oben und das Ergebnis unten; unter „Anzeige“ lässt sich der Baum umdrehen. Die Rechenarten sind farbig unterschieden (Strich blau, Punkt grün, Potenz orange).
- **Reihenfolge und Struktur:** „Nächster Rechenschritt“ folgt der Regel. Tippt man selbst eine andere *mögliche* Rechnung an, wird sie ausgeführt und kommentiert: Unabhängige Teilterme dürfen in beliebiger Reihenfolge berechnet werden – die Regeln legen die Struktur fest, nicht die Reihenfolge innerhalb unabhängiger Teile.
- **Rechnen:** exakt mit Brüchen; Dezimalzahlen werden als Dezimalzahlen angezeigt, wenn sie im Term vorkommen. Ein Vorzeichen direkt nach einem Rechenzeichen wird (wie im Unterricht) nicht akzeptiert: $5 \cdot (-3)$ statt $5 \cdot -3$. $0^0$ und Division durch $0$ gelten als nicht definiert.
- **Typische Fehlvorstellungen:**
  - Es wird stur von links nach rechts gerechnet: $3 + 4 \cdot 5 = 35$.
  - $-3^2 = 9$ und $2x^2 = (2x)^2$.
  - Die Termart wird nach dem ersten (statt dem zuletzt ausgeführten) Rechenzeichen benannt.
- **Aufgabenmodus:** Mit `names=0` und `_hide=1` (siehe Aufgabe 1) sind Termarten und Ergebnisse zunächst verborgen.
