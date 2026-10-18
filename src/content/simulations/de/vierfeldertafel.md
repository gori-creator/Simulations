---
description: "Vierfeldertafel, flächentreues Mengendiagramm und Baumdiagramm zeigen dieselben Daten – synchron hervorgehoben. Schnitt, Vereinigung und Gegenereignis leuchten überall auf, der Additionssatz rechnet mit, der Baum lässt sich umdrehen."
---

## Worum geht es?

In der Klasse 9a wurde gefragt: Hast du ein Haustier ($A$)? Hast du Geschwister ($B$)? Jede Person fällt in genau eines von vier Feldern:

| | $B$ | $\overline{B}$ | Summe |
| --- | --- | --- | --- |
| $A$ | $10$ | $4$ | $14$ |
| $\overline{A}$ | $9$ | $7$ | $16$ |
| Summe | $19$ | $11$ | $30$ |

Das ist eine **Vierfeldertafel**. Die inneren Felder sind die **Schnittmengen** $A \cap B$, $A \cap \overline{B}$, $\overline{A} \cap B$, $\overline{A} \cap \overline{B}$, am Rand stehen die **Randsummen** $|A|$, $|\overline{A}|$, $|B|$, $|\overline{B}|$ und die Gesamtzahl. Teilt man alles durch $30$, erhält man Wahrscheinlichkeiten (relative Häufigkeiten).

Dieselben Daten zeigt ein **Mengendiagramm**: Die Kreise $A$ und $B$ liegen in der Grundmenge $\Omega$; hier sind die Flächen sogar proportional zu den Anzahlen. Und ein **Baumdiagramm**: Erst wird nach $A$ unterschieden, dann nach $B$. An den Ästen der zweiten Stufe stehen Anteile wie $\frac{10}{14}$ – „von den $14$ mit Haustier haben $10$ Geschwister“.

**Ereignisse:**

- **Schnitt** $A \cap B$ („$A$ und $B$“): ein Feld.
- **Vereinigung** $A \cup B$ („$A$ oder $B$“, auch beides): drei Felder.
- **Gegenereignis** $\overline{A}$: alles außer $A$, also $P(\overline{A}) = 1 - P(A)$.

Bei der Vereinigung darf das Feld $A \cap B$ nicht doppelt gezählt werden – das ist der **Additionssatz**:

$$
P(A \cup B) = P(A) + P(B) - P(A \cap B) = \frac{14}{30} + \frac{19}{30} - \frac{10}{30} = \frac{23}{30}.
$$

Der **umgekehrte Baum** beginnt mit $B$. Seine Blätter sind dieselben vier Felder – nur in anderer Reihenfolge, mit anderen Anteilen an den Ästen: $\frac{19}{30} \cdot \frac{10}{19} = \frac{10}{30}$.

## Ausprobieren

1. Fahre mit der Maus über ein Feld der Tafel (oder tippe es an): Dieselbe Teilmenge leuchtet im Mengendiagramm und im Baum auf. [Beispiel laden](?ev=none)
2. Wähle nacheinander die Ereignisse $A \cap B$, $A \cup B$ und $\overline{A}$. Welche Felder gehören jeweils dazu? [A oder B](?ev=AuB)
3. Ändere die Anzahlen mit den Reglern. Wie verändern sich die Kreise?
4. Drehe den Baum um („Baum beginnt mit B“). Warum stehen an den Ästen andere Brüche, an den Blättern aber dieselben Zahlen? [Umgekehrter Baum](?order=BA&ev=AB&num=frac)
5. Stelle auf Prozent um und betrachte die Umfrage unter 200 Jugendlichen. [200 Jugendliche](?ctx=club&c1=46&c2=34&c3=52&c4=68&num=pct&ev=xor)

## Aufgaben

### Aufgabe 1: Tafel ergänzen

Von $30$ Personen haben $14$ ein Haustier und $19$ Geschwister; $10$ haben beides. Ergänze die Vierfeldertafel. [Aufgabe laden](?show=0&ev=none&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A \cap \overline{B}$: $14 - 10 = 4$, $\overline{A} \cap B$: $19 - 10 = 9$, $\overline{A}$: $30 - 14 = 16$, $\overline{A} \cap \overline{B}$: $16 - 9 = 7$. [In der Simulation zeigen](?show=1&ev=none)

</details>

### Aufgabe 2: Additionssatz

Berechne die Wahrscheinlichkeit, dass eine zufällig gewählte Person ein Haustier **oder** Geschwister hat – einmal mit dem Additionssatz, einmal über das Gegenereignis. [Aufgabe laden](?ev=AuB&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Additionssatz: $\frac{14}{30} + \frac{19}{30} - \frac{10}{30} = \frac{23}{30} \approx 76{,}7\,\%$. Gegenereignis „weder noch“: $1 - \frac{7}{30} = \frac{23}{30}$ ✓. [In der Simulation zeigen](?ev=AuB)

</details>

### Aufgabe 3: Genau eins

In der Umfrage unter $200$ Jugendlichen sind $80$ im Sportverein, $98$ spielen ein Instrument, $46$ beides. Wie viel Prozent machen **genau eines** von beidem? [Aufgabe laden](?ctx=club&c1=46&c2=34&c3=52&c4=68&num=pct&ev=xor&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Nur Sportverein: $80 - 46 = 34$, nur Instrument: $98 - 46 = 52$. Zusammen $86$ von $200$, also $43\,\%$. [In der Simulation zeigen](?ctx=club&c1=46&c2=34&c3=52&c4=68&num=pct&ev=xor)

</details>

### Aufgabe 4: Umgekehrter Baum

Zeichne den Baum, der mit $B$ (Geschwister) beginnt, und trage alle Astwahrscheinlichkeiten ein. Prüfe an einem Pfad, dass dieselbe Blattwahrscheinlichkeit herauskommt wie im ersten Baum. [Aufgabe laden](?order=BA&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Erste Stufe: $P(B) = \frac{19}{30}$, $P(\overline{B}) = \frac{11}{30}$. Zweite Stufe: $\frac{10}{19}$ und $\frac{9}{19}$ bzw. $\frac{4}{11}$ und $\frac{7}{11}$. Pfad $B \cap A$: $\frac{19}{30} \cdot \frac{10}{19} = \frac{10}{30}$ – wie $\frac{14}{30} \cdot \frac{10}{14}$ im ersten Baum. [In der Simulation zeigen](?order=BA&num=frac)

</details>

### Aufgabe 5: Unabhängig?

Bei $50$ Personen gilt: $|A \cap B| = 12$, $|A| = 30$, $|B| = 20$. Zeige, dass $P(A \cap B) = P(A) \cdot P(B)$ gilt. Was bedeutet das? [Aufgabe laden](?ctx=abc&c1=12&c2=18&c3=8&c4=12&ev=AB&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{12}{50} = 0{,}24$ und $\frac{30}{50} \cdot \frac{20}{50} = 0{,}6 \cdot 0{,}4 = 0{,}24$ ✓. Der Anteil von $B$ ist in $A$ genauso groß wie in $\overline{A}$ ($\frac{12}{30} = \frac{8}{20} = 40\,\%$): $A$ und $B$ beeinflussen sich (statistisch) nicht – sie sind **unabhängig**.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 9 (Vierfeldertafel, Mengendiagramm, Additionssatz) und Jahrgangsstufe 11 (bedingte Wahrscheinlichkeit, umgekehrter Baum) nach LehrplanPLUS Bayern, Gymnasium – die genaue Zuordnung bitte am Lehrplan prüfen.
- **Eigene Umfrage:** Zwei Ja/Nein-Fragen in der Klasse ergeben schnell eine eigene Vierfeldertafel, die sich mit den Reglern eintragen lässt.
- **Darstellungswechsel:** Das synchrone Hervorheben kann helfen, jede Zahl einer Darstellung in den anderen wiederzufinden.
- **Häufige Stolpersteine:**
  - Bei $A \cup B$ wird das Feld $A \cap B$ doppelt gezählt.
  - „$A$ oder $B$“ wird als „genau eines von beiden“ verstanden.
  - Im Baum werden an der zweiten Stufe Anteile an der Gesamtzahl statt an der Teilgruppe eingetragen ($\frac{10}{30}$ statt $\frac{10}{14}$).
  - Beim umgekehrten Baum werden die Äste der ersten Stufe einfach übernommen.
