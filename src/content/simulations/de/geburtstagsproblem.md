---
description: "Geburtstagsproblem in vier Ansichten: eine Klasse im Jahreskalender, 1000 simulierte Klassen mit Häufigkeitskurve, die Rechnung mit dem Gegenereignis Schritt für Schritt und alle Paare als Linien – dazu gleicher Monat, gleicher Wochentag und das Schubfachprinzip."
---

## Worum geht es?

Wie groß ist die Wahrscheinlichkeit, dass in einer Klasse mit $n$ Personen **mindestens zwei am selben Tag Geburtstag** haben? Viele schätzen bei $25$ Personen nur wenige Prozent – tatsächlich sind es fast $57\,\%$.

**Modell:** Jeder der $365$ Tage ist gleich wahrscheinlich (keine Schalttage, keine Zwillinge), die Geburtstage sind unabhängig voneinander.

**Rechnung mit dem Gegenereignis** (Ansicht „Rechnung“): Statt „mindestens zwei gleich“ berechnet man „alle verschieden“. Die Personen kommen nacheinander: Die erste darf jeden Tag haben, die zweite muss einen der $364$ freien Tage treffen, die dritte einen der $363$ übrigen … Nach der Pfadregel wird multipliziert:

$$
P(\text{alle verschieden}) = \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \cdot \ldots \cdot \frac{365 - n + 1}{365},
\qquad
P(\text{mind. zwei gleich}) = 1 - P(\text{alle verschieden}).
$$

| $n$ | $10$ | $23$ | $30$ | $50$ |
| --- | --- | --- | --- | --- |
| $P(\text{mind. zwei gleich})$ | $11{,}7\,\%$ | $50{,}7\,\%$ | $70{,}6\,\%$ | $97{,}0\,\%$ |

**Warum so hoch? – Paare zählen** (Ansicht „Paare“): Es kommt nicht auf einen bestimmten Tag an, sondern auf **irgendein Paar**. $n$ Personen bilden $\frac{n \cdot (n-1)}{2}$ Paare, bei $23$ Personen schon $253$. Jedes Paar hat mit Wahrscheinlichkeit $\frac{1}{365}$ denselben Geburtstag. Tut man so, als wären die Paare unabhängig, erhält man die gute Näherung

$$
P \approx 1 - \left(\frac{364}{365}\right)^{\frac{n(n-1)}{2}}, \qquad n = 23: \; 1 - \left(\tfrac{364}{365}\right)^{253} \approx 50{,}0\,\%.
$$

**Im Vergleich: „an meinem Geburtstag“.** Hier zählen nur die $n$ Paare „ich – andere Person“:

$$
P(\text{jemand an meinem Tag}) = 1 - \left(\frac{364}{365}\right)^{n}, \qquad n = 25: \approx 6{,}6\,\%.
$$

Erst ab $253$ anderen Personen liegt dieser Wert über $50\,\%$.

**Simulation** (Ansicht „Viele Klassen“): Jede Kachel ist eine ausgeloste Klasse: gefüllt mit, hell mit Rand ohne gemeinsamen Geburtstag. Die relative Häufigkeit $h = \frac{\text{Treffer}}{\text{Klassen}}$ schwankt anfangs stark und nähert sich dann der Wahrscheinlichkeit $P$ (empirisches Gesetz der großen Zahlen). Der helle Trichter zeigt, wo $h$ nach $N$ Klassen in etwa $95\,\%$ aller Fälle liegt: $P \pm 1{,}96 \cdot \sqrt{\frac{P(1-P)}{N}}$.

**Gleicher Monat, gleicher Wochentag:** Dieselbe Rechnung funktioniert mit $12$ Monaten oder $7$ Wochentagen. Schon bei $5$ Personen haben mit $61{,}8\,\%$ zwei denselben Geburtsmonat. Ab $13$ Personen ist es **sicher**: Es gibt nur $12$ Monate, also müssen sich zwei einen Monat teilen (**Schubfachprinzip**). Im Produkt taucht dann der Faktor $\frac{0}{12}$ auf.

## Ausprobieren

1. Klicke mehrmals auf **Neue Klasse**. Wie oft findest du einen gemeinsamen Tag? [Eine Klasse](?mode=class&n=25)
2. Tippe im Kalender auf deinen Geburtstag und vergleiche die beiden Fragen. [Mein Geburtstag](?q=mine&both=1)
3. Starte **1000 Klassen** und beobachte, wie sich die Kurve der relativen Häufigkeit in den Trichter legt. [Simulation](?mode=sim&n=23)
4. Sieh zu, wie die freien Tage schrumpfen. Ab welcher Person wird $P(\text{alle verschieden})$ kleiner als $0{,}5$? [Rechnung](?mode=calc&n=30)
5. Tippe in der Paar-Ansicht auf eine Person: Wie viele Paare bildet sie? Wie viele Paare gibt es insgesamt? [Paare](?mode=pairs&n=12)
6. Schalte in der Paar-Ansicht auf „an meinem Geburtstag“ um. Warum sind es plötzlich viel weniger Linien? [Nur meine Paare](?mode=pairs&q=mine&n=25)
7. Stelle „gleicher Monat“ ein und erhöhe $n$ von $5$ bis $13$. Was passiert bei $13$? [Gleicher Monat](?d=12&n=5) · [13 Personen](?d=12&n=13&mode=calc)

## Aufgaben

### Aufgabe 1: Drei Personen

Berechne die Wahrscheinlichkeit, dass von drei Personen mindestens zwei am selben Tag Geburtstag haben. [Aufgabe laden](?mode=calc&n=3&curve=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P = 1 - \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \approx 1 - 0{,}9918 = 0{,}0082$, also etwa $0{,}82\,\%$. [In der Simulation zeigen](?mode=calc&n=3)

</details>

### Aufgabe 2: Eure Klasse

Bestimme die Wahrscheinlichkeit für die Klassengröße $28$. Wie viele von $1000$ Klassen dieser Größe haben ungefähr einen gemeinsamen Geburtstag? Prüfe mit der Simulation. [Aufgabe laden](?mode=sim&n=28&curve=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Für $n = 28$ ist $P \approx 65{,}4\,\%$, also etwa $654$ von $1000$ Klassen. Die Simulation liefert Werte in dieser Gegend; nach $1000$ Klassen liegt $h$ fast immer zwischen etwa $0{,}62$ und $0{,}68$. [In der Simulation zeigen](?mode=sim&n=28)

</details>

### Aufgabe 3: Paare und Näherung

Wie viele Paare bilden $30$ Personen? Berechne damit die Näherung und vergleiche mit dem exakten Wert $70{,}6\,\%$. [Aufgabe laden](?mode=pairs&n=30&curve=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{30 \cdot 29}{2} = 435$ Paare. Näherung: $1 - \left(\frac{364}{365}\right)^{435} \approx 69{,}7\,\%$ – knapp unter dem exakten Wert $70{,}6\,\%$. [In der Simulation zeigen](?mode=pairs&n=30)

</details>

### Aufgabe 4: Mein Geburtstag

Mit welcher Wahrscheinlichkeit hat von $25$ anderen Personen jemand genau an deinem Geburtstag Geburtstag? Warum ist das so viel weniger als $56{,}9\,\%$? [Aufgabe laden](?q=mine&n=25&curve=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$1 - \left(\frac{364}{365}\right)^{25} \approx 6{,}6\,\%$. Hier muss jemand einen **bestimmten** Tag treffen, es gibt nur $25$ Paare „ich – andere“. Beim Geburtstagsproblem genügt **irgendeines** von $300$ Paaren. [In der Simulation zeigen](?mode=pairs&q=mine&n=25)

</details>

### Aufgabe 5: Gleicher Wochentag

Wie wahrscheinlich ist es, dass von $4$ Personen mindestens zwei am selben Wochentag geboren sind? Ab wie vielen Personen ist es sicher? [Aufgabe laden](?d=7&n=4&mode=calc&curve=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P = 1 - \frac{7 \cdot 6 \cdot 5 \cdot 4}{7^4} = 1 - \frac{840}{2401} \approx 65{,}0\,\%$. Ab $8$ Personen ist es sicher (Schubfachprinzip: nur $7$ Wochentage). [In der Simulation zeigen](?d=7&n=4&mode=calc)

</details>

### Aufgabe 6: Modellkritik

In Wirklichkeit sind Geburtstage nicht ganz gleichmäßig über das Jahr verteilt. Wird die Wahrscheinlichkeit für einen gemeinsamen Geburtstag dadurch eher größer oder kleiner?

<details>
<summary>Lösung anzeigen</summary>

Eher **größer**: Wenn manche Tage häufiger sind, ballen sich die Geburtstage dort, und Übereinstimmungen werden wahrscheinlicher. Die gleichmäßige Verteilung ist der „ungünstigste“ Fall für gemeinsame Geburtstage.

</details>

## Ideen für den Unterricht

- **Einsatz:** Mittelstufe, zusammengesetzte Zufallsexperimente und stochastische Simulationen. Lassen Sie vor der Rechnung schätzen – und werfen Sie vielleicht einen Blick auf die Geburtstage in der eigenen Klasse.
- **Simulation und Rechnung:** Die Ansicht „Viele Klassen“ macht die überraschende Größe plausibel, die Ansicht „Rechnung“ erklärt sie. Der Trichter zeigt, wie stark relative Häufigkeiten bei $100$ Klassen noch schwanken.
- **Gleicher Monat** eignet sich zum Nachspielen in der Klasse: Schon bei kleinen Gruppen kommt fast immer ein gemeinsamer Monat heraus.
- **Gruppen vergleichen:** Jedes Gerät lost eigene Klassen aus. Sammeln Sie die Trefferzahlen nach je $100$ Klassen an der Tafel – die Streuung der Gruppen passt gut zum Trichter.
- **Häufige Stolpersteine:**
  - Das Geburtstagsproblem wird mit „jemand an meinem Geburtstag“ verwechselt.
  - Es wird $\frac{n}{365}$ gerechnet – das ist für große $n$ sogar größer als $1$.
  - Die Faktoren $\frac{364}{365}, \frac{363}{365}, \ldots$ werden addiert statt multipliziert.
