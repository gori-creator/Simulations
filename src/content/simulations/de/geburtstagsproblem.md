---
description: "Eine Klasse auslosen und die Geburtstage im Jahreskalender sehen – gemeinsame Tage leuchten auf. Hundert Klassen ergeben eine Häufigkeit nahe der Kurve P(n); schon ab 23 Personen ist ein gemeinsamer Geburtstag wahrscheinlicher als keiner."
---

## Worum geht es?

Wie groß ist die Wahrscheinlichkeit, dass in einer Klasse mit $n$ Personen **mindestens zwei am selben Tag Geburtstag** haben? Viele schätzen bei $25$ Personen nur wenige Prozent – tatsächlich sind es über $56\,\%$.

**Modell:** Jeder der $365$ Tage ist gleich wahrscheinlich (Schalttage und Zwillinge werden nicht berücksichtigt), die Geburtstage sind unabhängig voneinander.

Am einfachsten rechnet man mit dem **Gegenereignis** „alle Geburtstage verschieden“. Die erste Person darf jeden Tag haben, die zweite muss einen der $364$ anderen treffen, die dritte einen der $363$ übrigen usw. Nach der Pfadregel ist

$$
P(\text{alle verschieden}) = \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \cdot \ldots \cdot \frac{365 - n + 1}{365}
$$

und damit

$$
P(\text{mindestens zwei gleich}) = 1 - P(\text{alle verschieden}).
$$

Für $n = 23$ ergibt das etwa $50{,}7\,\%$, für $n = 25$ etwa $56{,}9\,\%$, für $n = 50$ schon $97{,}0\,\%$.

**Warum so hoch?** Es kommt nicht auf einen bestimmten Tag an, sondern auf irgendein Paar. $23$ Personen bilden $\frac{23 \cdot 22}{2} = 253$ Paare – und jedes Paar kann den gemeinsamen Geburtstag liefern.

**Zum Vergleich:** Dass jemand an **meinem** Geburtstag Geburtstag hat, ist viel unwahrscheinlicher:

$$
P(\text{jemand an meinem Tag}) = 1 - \left(\frac{364}{365}\right)^n, \qquad n = 25: \approx 6{,}6\,\%.
$$

Hier braucht man $253$ andere Personen, um über $50\,\%$ zu kommen.

## Ausprobieren

1. Klicke mehrmals auf **Neue Klasse**. Wie oft findest du einen gemeinsamen Tag? [Beispiel laden](?n=25)
2. Klicke auf **100 Klassen** – mehrmals. Wo liegt der Kreis (relative Häufigkeit) im Vergleich zur Kurve?
3. Ziehe den Griff auf der Kurve oder den Regler: Ab welcher Klassengröße liegt die Wahrscheinlichkeit über $50\,\%$? [Grenze bei 23](?n=23)
4. Schätze zuerst, dann prüfe: Wie wahrscheinlich ist ein gemeinsamer Geburtstag bei $10$ Personen, wie bei $50$? [10 Personen](?n=10) · [50 Personen](?n=50)
5. Wechsle zur Frage **„an meinem Geburtstag“** und vergleiche die beiden Kurven. [Vergleich](?q=mine&both=1)

## Aufgaben

### Aufgabe 1: Drei Personen

Berechne die Wahrscheinlichkeit, dass von drei Personen mindestens zwei am selben Tag Geburtstag haben. [Aufgabe laden](?n=3&curve=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P = 1 - \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \approx 1 - 0{,}9918 = 0{,}0082$, also etwa $0{,}82\,\%$. [In der Simulation zeigen](?n=3)

</details>

### Aufgabe 2: Eure Klasse

Bestimme die Wahrscheinlichkeit für eure eigene Klassengröße (z. B. $28$). Wie viele Klassen dieser Größe würden etwa unter $100$ einen gemeinsamen Geburtstag haben? [Aufgabe laden](?n=28&curve=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Für $n = 28$: $P \approx 65{,}4\,\%$ – also etwa $65$ von $100$ Klassen. Die Simulation mit **100 Klassen** zeigt Werte in dieser Gegend, die von Durchgang zu Durchgang schwanken. [In der Simulation zeigen](?n=28)

</details>

### Aufgabe 3: Mein Geburtstag

Mit welcher Wahrscheinlichkeit hat in einer Klasse mit $25$ anderen Personen jemand genau an deinem Geburtstag Geburtstag? Warum ist das so viel weniger als $56{,}9\,\%$? [Aufgabe laden](?q=mine&curve=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$1 - \left(\frac{364}{365}\right)^{25} \approx 6{,}6\,\%$. Hier muss jemand einen **bestimmten** Tag treffen; beim Geburtstagsproblem genügt **irgendein** Paar – und davon gibt es $300$. [In der Simulation zeigen](?q=mine&both=1)

</details>

### Aufgabe 4: Modellkritik

In Wirklichkeit sind Geburtstage nicht ganz gleichmäßig über das Jahr verteilt. Wird die Wahrscheinlichkeit für einen gemeinsamen Geburtstag dadurch eher größer oder kleiner?

<details>
<summary>Lösung anzeigen</summary>

Eher **größer**: Wenn manche Tage häufiger sind, ballen sich die Geburtstage dort, und Übereinstimmungen werden wahrscheinlicher. Die gleichmäßige Verteilung ist der „ungünstigste“ Fall für gemeinsame Geburtstage.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 10, Lernbereich „Zusammengesetzte Zufallsexperimente und stochastische Simulationen“ (LehrplanPLUS Bayern, Gymnasium). Ein Einstieg könnte eine Schätzung vor der Rechnung sein – und vielleicht ein Blick auf die Geburtstage in der eigenen Klasse.
- **Simulation und Rechnung:** Die Simulation macht die überraschende Größe plausibel; die Rechnung über das Gegenereignis erklärt sie. Beides nebeneinander zeigt, wie stark relative Häufigkeiten bei $100$ Durchgängen noch schwanken.
- **Häufige Stolpersteine:**
  - Das Geburtstagsproblem wird mit „jemand an meinem Geburtstag“ verwechselt.
  - Es wird $\frac{n}{365}$ gerechnet – das ist für große $n$ sogar größer als $1$.
  - Die Faktoren $\frac{364}{365}, \frac{363}{365}, \ldots$ werden addiert statt multipliziert.
