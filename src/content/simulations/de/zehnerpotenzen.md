---
description: "Vom Sandkorn bis zur Erde zoomen, Potenzen als wiederholte Multiplikation aufbauen und große Zahlen in wissenschaftlicher Schreibweise schreiben."
---

## Worum geht es?

Eine **Potenz** ist eine Kurzschreibweise für ein Produkt aus lauter gleichen Faktoren:

$$
10^6 = \underbrace{10 \cdot 10 \cdot 10 \cdot 10 \cdot 10 \cdot 10}_{6\ \text{Faktoren}} = 1\,000\,000
$$

Die untere Zahl heißt **Grundzahl** (Basis), die kleine hochgestellte Zahl **Hochzahl** (Exponent). Die Hochzahl gibt an, wie oft die Grundzahl als Faktor vorkommt. Man liest $10^6$ als „zehn hoch sechs“. Das klappt mit jeder Grundzahl: $2^5 = 2 \cdot 2 \cdot 2 \cdot 2 \cdot 2 = 32$ und $3^4 = 3 \cdot 3 \cdot 3 \cdot 3 = 81$.

Bei **Zehnerpotenzen** ist das Ergebnis besonders leicht: $10^n$ ist eine $1$ mit $n$ Nullen. So ist $10^3 = 1\,000$ (tausend), $10^6 = 1\,000\,000$ (eine Million) und $10^9 = 1\,000\,000\,000$ (eine Milliarde). Sonderfälle: $10^1 = 10$ und $10^0 = 1$. Dass $10^0 = 1$ ist, wird so festgelegt – es passt zum Muster: Jede Stufe nach unten teilt durch $10$, also $1\,000 \to 100 \to 10 \to 1$.

**Größenordnungen:** Mit Zehnerpotenzen lassen sich sehr verschiedene Längen vergleichen. Ein Schritt in der Hochzahl bedeutet „10-mal so groß“:

| Länge | Zehnerpotenz | Beispiel |
| --- | --- | --- |
| $1\,\text{mm}$ | $10^{-3}\,\text{m}$ | Sandkorn |
| $1\,\text{m}$ | $10^{0}\,\text{m}$ | Kind (etwa $1{,}4\,\text{m}$) |
| $100\,\text{m}$ | $10^{2}\,\text{m}$ | Fußballfeld ($105\,\text{m}$) |
| $1\,\text{km} = 1\,000\,\text{m}$ | $10^{3}\,\text{m}$ | Zugspitze ($2\,962\,\text{m}$ hoch) |
| $10\,000\,\text{km}$ | $10^{7}\,\text{m}$ | Erde (Durchmesser etwa $12\,742\,\text{km}$) |

Daraus folgen die Umrechnungen $1\,\text{km} = 10^3\,\text{m}$ und $1\,\text{m} = 10^3\,\text{mm}$.

**Wissenschaftliche Schreibweise** (Vertiefung bzw. Jahrgangsstufe 6): Große Zahlen schreibt man als $a \cdot 10^n$ mit $1 \le a < 10$, zum Beispiel $35\,000 = 3{,}5 \cdot 10^4$ und $1\,270\,000 = 1{,}27 \cdot 10^6$. Man setzt das Komma hinter die erste Ziffer, die nicht $0$ ist, und zählt, um wie viele Stellen es nach links gewandert ist.

*Ausblick:* Für Zahlen kleiner als $1$ wandert das Komma nach rechts, die Hochzahl wird negativ: $10^{-1} = 0{,}1$, $10^{-3} = 0{,}001$ und $0{,}0042 = 4{,}2 \cdot 10^{-3}$. Negative Hochzahlen kommen in der Simulation bei sehr kleinen Längen vor. In der 5. Klasse sind sie ein Ausblick, in der 6. Klasse lernst du sie genauer kennen.

## Ausprobieren

1. Starte die **Reise** und beobachte die Maßstabsleiste oben links. Was passiert jedes Mal, wenn die Hochzahl um $1$ größer wird? [Beispiel laden](?e=-3)
2. Stelle $1$ Kästchen $= 1\,\text{m}$ ein. Wie viele Kästchen hoch ist das Kind? Klicke dann auf **Ausschnitt · 10**: Wie groß ist jetzt ein Kästchen, und was passiert mit dem Kind? [Kind](?e=0)
3. Ziehe in der Bühne nach links oder rechts oder tippe ein Objekt auf dem Größenstrahl an. Welche Objekte liegen nur eine Stufe auseinander, welche mehrere?
4. Wechsle zu **Potenz als Produkt** und erhöhe die Hochzahl Schritt für Schritt. Wie oft kommen neue Würfel dazu? [Potenz](?mode=pow&b=10&n=3)
5. Stelle die Grundzahl $2$ ein. Wie verändert sich der Würfelbau jetzt bei jedem Schritt? [Zweierpotenzen](?mode=pow&b=2&n=5)
6. Gib bei **Wissenschaftliche Schreibweise** den Erddurchmesser in Metern ein und lass das Komma wandern. [Erde](?mode=sci&z=12742000)

## Aufgaben

### Aufgabe 1: Potenzen ausrechnen

Berechne $10^4$, $2^5$ und $3^4$. Schreibe jeweils zuerst das Produkt auf. [Aufgabe laden](?mode=pow&b=2&n=5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$10^4 = 10 \cdot 10 \cdot 10 \cdot 10 = 10\,000$; $2^5 = 2 \cdot 2 \cdot 2 \cdot 2 \cdot 2 = 32$; $3^4 = 3 \cdot 3 \cdot 3 \cdot 3 = 81$. [In der Simulation zeigen](?mode=pow&b=3&n=4)

</details>

### Aufgabe 2: Million und Milliarde

Schreibe eine Million und eine Milliarde als Zehnerpotenz. Wie viele Nullen haben die Zahlen? Wie oft passt eine Million in eine Milliarde? [Aufgabe laden](?mode=pow&b=10&n=6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$1\,000\,000 = 10^6$ (6 Nullen), $1\,000\,000\,000 = 10^9$ (9 Nullen). $10^9 = 10^6 \cdot 10^3$, also passt eine Million $1\,000$-mal in eine Milliarde. [In der Simulation zeigen](?mode=pow&b=10&n=9)

</details>

### Aufgabe 3: Größen schätzen

Stelle $1$ Kästchen $= 10\,\text{m}$ ein. Schätze mithilfe der Kästchen, wie hoch das Haus ist. Wie viele Kinder übereinander wären so hoch? [Aufgabe laden](?e=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Haus ist etwa $10\,\text{m} = 10^1\,\text{m}$ hoch. Das Kind ist etwa $1{,}4\,\text{m}$ groß; $10 : 1{,}4 \approx 7$, also wären etwa sieben Kinder übereinander so hoch wie das Haus. [In der Simulation zeigen](?e=1)

</details>

### Aufgabe 4: Einheiten umrechnen

Schreibe als Zehnerpotenz von Metern: $1\,\text{km}$, $1\,\text{cm}$ und $1\,\text{mm}$. Wie viele Millimeter sind $1\,\text{km}$?

<details>
<summary>Lösung anzeigen</summary>

$1\,\text{km} = 1\,000\,\text{m} = 10^3\,\text{m}$, $1\,\text{cm} = 0{,}01\,\text{m} = 10^{-2}\,\text{m}$, $1\,\text{mm} = 0{,}001\,\text{m} = 10^{-3}\,\text{m}$ (negative Hochzahlen als Ausblick). $1\,\text{km} = 10^3 \cdot 10^3\,\text{mm} = 10^6\,\text{mm} = 1\,000\,000\,\text{mm}$. [In der Simulation zeigen](?e=3)

</details>

### Aufgabe 5: Wissenschaftliche Schreibweise

Schreibe $35\,000$ und $1\,270\,000$ in der Form $a \cdot 10^n$ mit $1 \le a < 10$. [Aufgabe laden](?mode=sci&z=1270000&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$35\,000 = 3{,}5 \cdot 10^4$ (Komma 4 Stellen nach links), $1\,270\,000 = 1{,}27 \cdot 10^6$ (6 Stellen nach links). Probe: $1{,}27 \cdot 1\,000\,000 = 1\,270\,000$. [In der Simulation zeigen](?mode=sci&z=1270000)

</details>

### Aufgabe 6: Ausblick – sehr kleine Zahlen

Schreibe $0{,}0042$ als $a \cdot 10^n$. In welche Richtung wandert das Komma? [Aufgabe laden](?mode=sci&z=0%2C0042&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Komma wandert 3 Stellen nach rechts, die Hochzahl ist negativ: $0{,}0042 = 4{,}2 \cdot 10^{-3}$. Probe: $4{,}2 \cdot 0{,}001 = 0{,}0042$. [In der Simulation zeigen](?mode=sci&z=0%2C0042)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 5 (Potenzen und Zehnerpotenzen bei großen Zahlen), Jahrgangsstufe 6 als Wiederholung und für die wissenschaftliche Schreibweise sowie für negative Hochzahlen wie $10^{-3} = 0{,}001$ (LehrplanPLUS Bayern, Gymnasium – bitte am Lehrplan prüfen). Die Reise eignet sich als Einstieg am Beamer, die Würfelbauten für das Verständnis von „Hochzahl + 1 heißt mal Grundzahl“.
- **Schätzen:** Bei ausgeschalteten Ergebnissen schätzen die Schülerinnen und Schüler die Größen mithilfe der Kästchen und vergleichen danach.
- **Modell:** Die Objekte sind maßstäblich gezeichnet, nur Flugzeug und Raumstation sind als Symbole vergrößert. Die Größen sind typische, gerundete Werte.
- **Häufige Stolpersteine:**
  - $10^3$ wird als $10 \cdot 3 = 30$ gerechnet – richtig ist $10 \cdot 10 \cdot 10 = 1\,000$.
  - $2^5$ wird mit $5^2$ verwechselt ($32 \ne 25$).
  - $10^0$ wird für $0$ gehalten; das Muster der Zehnerpotenzen zeigt, warum $10^0 = 1$ ist.
  - In der wissenschaftlichen Schreibweise steht vor dem Komma eine Zahl größer als $9$ (z. B. $35 \cdot 10^3$) – das ist richtig gerechnet, aber nicht die vereinbarte Form.
