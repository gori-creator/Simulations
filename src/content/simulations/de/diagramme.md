---
description: "Ein kleiner Datensatz als Strichliste, Säulen-, Balken-, Linien-, Streifen- und Kreisdiagramm oder Piktogramm – die Formen verwandeln sich ineinander. Dazu typische Täuschungen zum Aufdecken und ein Detektiv-Modus mit sechs Fällen."
---

## Worum geht es?

Daten – etwa die Lieblingssportarten einer Klasse oder Linas Handyzeit in einer Woche – kann man auf viele Arten darstellen. Jede **Darstellung** hat ihre Stärken:

- **Strichliste und Tabelle:** Beim Zählen macht man Striche und bündelt je fünf. In der Tabelle stehen alle Werte genau – Unterschiede sieht man aber erst beim Vergleichen der Zahlen.
- **Säulen- und Balkendiagramm:** Die **Höhe** der Säule (bzw. die Länge des Balkens) zeigt den Wert. Abgelesen wird an der Achse, die bei $0$ beginnen sollte.
- **Liniendiagramm:** Es zeigt, wie sich ein Wert **im Lauf der Zeit** verändert, z. B. die Temperatur von Montag bis Sonntag. Zwischen Sportarten gibt es dagegen kein „Dazwischen“ – dort täuscht eine Linie einen Verlauf vor.
- **Piktogramm:** Jedes Bildchen steht für **gleich viel**, z. B. ein Handy für $20$ Minuten. $90$ Minuten sind dann $4{,}5$ Handys.
- **Streifen- und Kreisdiagramm:** Sie zeigen **Anteile an einem Ganzen**. Der ganze Streifen bzw. der ganze Kreis ist $100\,\%$.

Für den **Anteil** teilt man den Wert durch die Summe aller Werte. Mögen $6$ von $24$ Kindern am liebsten Tanzen, ist das

$$
\frac{6}{24} = \frac{1}{4} = 25\,\%.
$$

Im **Kreisdiagramm** bekommt jede Kategorie einen Sektor. Sein **Mittelpunktswinkel** ist der Anteil von $360°$:

$$
\text{Winkel} = \text{Anteil} \cdot 360° = \frac{6}{24} \cdot 360° = 90°.
$$

Weil der ganze Kreis $360°$ hat, müssen die Winkel zusammen genau $360°$ ergeben – und die Prozentangaben zusammen $100\,\%$. Beim Runden kann eine Summe von $99\,\%$ oder $101\,\%$ entstehen; die Simulation rundet in der Ergebnistabelle so, dass $360°$ bleibt.

**Diagramme können täuschen** – manchmal aus Versehen, manchmal mit Absicht:

- **Abgeschnittene Achse:** Beginnt die Hochachse bei $90$ statt bei $0$, sind die Säulen für $95$ und $100$ Stimmen $5$ und $10$ Einheiten hoch. Sie wirken wie $1 : 2$, obwohl $95 : 100 = 0{,}95 : 1$ ist.
- **Ungleiche Achsenabstände:** Stehen $0,\ 10,\ 20,\ 50,\ 100,\ 200$ in gleichen Abständen, werden große Werte zusammengestaucht.
- **Flächen-Piktogramm:** Wird ein Bildchen in Höhe **und** Breite verdoppelt, ist seine Fläche viermal so groß: $2 \cdot 2 = 4$. Das Auge vergleicht Flächen.
- **Fehlende Einheit:** „23 Grad“ – Celsius oder Fahrenheit? Ohne Überschrift und Einheit lassen sich Zahlen nicht deuten.
- **Kreis mit Summe ≠ 100 %:** Wurde durch den falschen Grundwert geteilt, ergeben die Prozentangaben zusammen z. B. $120\,\%$.

## Ausprobieren

1. Tippe im Säulendiagramm auf eine Säule: Eine Hilfslinie führt zur Achse, rechts stehen Wert und Anteil. Ziehe die Säule nach oben – wie ändern sich die Anteile **aller** Sportarten? [Säulendiagramm](?chart=col)
2. Schalte auf **Streifendiagramm** und dann auf **Kreisdiagramm** um. Die Säulen legen sich zu einem Streifen und der Streifen biegt sich zum Kreis. Warum ist das Stück für Tanzen genau ein Viertel? [Kreisdiagramm](?chart=pie)
3. Wähle die Temperaturen und das Kreisdiagramm. Warum erscheint der Hinweis „passt nicht“? [Temperaturen als Kreis](?data=temp&chart=pie)
4. Zeige den Lieblingssport als Liniendiagramm. Was soll die Linie zwischen Reiten und Tennis bedeuten? [Sport als Linie](?chart=line)
5. Stelle beim Piktogramm die Handyzeit ein. Wie liest man einen angeschnittenen Handy-Umriss ab? [Piktogramm](?data=handy&chart=pict)
6. Wechsle zu den **Täuschungen** und probiere die abgeschnittene Achse. Verschiebe mit dem Regler den Achsenbeginn und beobachte das Meter „im Bild“ gegen „echt“. Dann: **Täuschung aufdecken**. [Abgeschnittene Achse](?mode=trick&trick=cut&data=wahl&cut=90)
7. Werde **Detektiv**: In sechs Fällen steckt jeweils eine Täuschung. Tippe auf die Stelle im Diagramm, die täuscht. [Detektiv-Modus](?mode=detect&fall=1)

## Aufgaben

### Aufgabe 1: Ablesen

Lies im Säulendiagramm ab: Wie viele Kinder mögen Reiten am liebsten? Welcher Anteil der Klasse ist das in Prozent? [Aufgabe laden](?chart=col&lab=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$4$ Kinder von $24$: $\frac{4}{24} = \frac{1}{6} \approx 16{,}7\,\%$. [In der Simulation zeigen](?chart=col&lab=1)

</details>

### Aufgabe 2: Mittelpunktswinkel

Wie groß sind im Kreisdiagramm die Winkel für Fußball ($8$ Kinder) und für Tennis ($3$ Kinder)? Prüfe, ob alle fünf Winkel zusammen $360°$ ergeben. [Aufgabe laden](?chart=pie&lab=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Fußball: $\frac{8}{24} \cdot 360° = 120°$, Tennis: $\frac{3}{24} \cdot 360° = 45°$. Zusammen: $120° + 90° + 60° + 45° + 45° = 360°$. [In der Simulation zeigen](?chart=pie)

</details>

### Aufgabe 3: Verlauf ablesen

Lies im Liniendiagramm ab: An welchem Tag war Lina am längsten am Handy? Um wie viele Minuten ist die Handyzeit von Donnerstag bis Samstag gestiegen? [Aufgabe laden](?data=handy&chart=line&lab=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Am Samstag ($120$ min). Von $60$ min auf $120$ min: Sie ist um $60$ Minuten gestiegen, hat sich also verdoppelt. [In der Simulation zeigen](?data=handy&chart=line)

</details>

### Aufgabe 4: Haushoch gewonnen?

Jonas hat $100$, Mia $95$ Stimmen. Im Diagramm beginnt die Hochachse bei $90$. Wie viel Prozent der Höhe von Jonas' Säule hat Mias Säule? Wie viel Prozent von Jonas' Stimmen hat Mia wirklich? [Aufgabe laden](?mode=trick&trick=cut&data=wahl&cut=90&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Höhen: $95 - 90 = 5$ und $100 - 90 = 10$, also $\frac{5}{10} = 50\,\%$. Wirklich: $\frac{95}{100} = 95\,\%$. Das Diagramm übertreibt den Abstand stark. [Ehrlich darstellen](?mode=trick&trick=cut&data=wahl&cut=90&honest=1)

</details>

### Aufgabe 5: Doppelt so groß?

Im Flächen-Piktogramm ist die Fußball-Figur doppelt so hoch und doppelt so breit wie die Reiten-Figur. Wie viel mal so groß ist ihre Fläche? Wie viel mal so viele Kinder mögen Fußball wirklich? [Aufgabe laden](?mode=trick&trick=area&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Fläche: $2 \cdot 2 = 4$-mal so groß. Wirklich sind es $8 : 4 = 2$-mal so viele Kinder. Ein ehrliches Piktogramm zeigt einfach doppelt so viele gleich große Figuren. [Ehrlich darstellen](?mode=trick&trick=area&honest=1)

</details>

### Aufgabe 6: Fehler im Plakat

Auf einem Plakat stehen: Fußball $40\,\%$, Tanzen $30\,\%$, Reiten $20\,\%$, Tennis $15\,\%$, Turnen $15\,\%$. Was ist falsch? Berechne die richtigen Prozentangaben, wenn $8, 6, 4, 3, 3$ von $24$ Kindern gemeint sind. [Aufgabe laden](?mode=trick&trick=sum&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Zusammen sind es $120\,\%$ – ein Ganzes sind aber $100\,\%$. Es wurde durch $20$ statt durch $24$ geteilt. Richtig: $33{,}3\,\%$, $25\,\%$, $16{,}7\,\%$, $12{,}5\,\%$, $12{,}5\,\%$. [Ehrlich darstellen](?mode=trick&trick=sum&honest=1)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 6, Lernbereich „Prozentrechnung, Daten und Diagramme“ (LehrplanPLUS Bayern, Gymnasium): Diagramme erstellen, lesen und kritisch beurteilen; Anteile in Prozent und als Kreiswinkel. Auch in Jahrgangsstufe 5 zum Ablesen von Säulendiagrammen denkbar.
- **Eigene Daten:** Die Klasse könnte ihren eigenen Lieblingssport erheben und die Werte mit den Reglern eintragen; die Strichliste entsteht dabei gleich mit.
- **Darstellungswechsel:** Die Verwandlung von Säulen über den Streifen zum Kreis kann zeigen, dass alle drei Diagramme dieselben Daten enthalten – nur Streifen und Kreis zeigen den Anteil am Ganzen direkt.
- **Detektiv-Modus:** Eignet sich vielleicht für Partnerarbeit; die Fälle lassen sich auch einzeln verlinken (z. B. Fall 3). Eine Anschlussidee ist, selbst ein „geschöntes“ Diagramm zu entwerfen und tauschen zu lassen.
- **Häufige Stolpersteine:**
  - Die Säulenhöhe wird mit dem Wert gleichgesetzt, obwohl die Achse nicht bei $0$ beginnt.
  - Beim Kreisdiagramm wird der Prozentsatz direkt als Winkel genommen ($25\,\%$ → $25°$) statt $25\,\% \cdot 360° = 90°$.
  - Beim Piktogramm werden angeschnittene Bildchen übersehen oder als ganze gezählt.
  - Liniendiagramme werden auch für Kategorien ohne Reihenfolge verwendet.
  - Bei Temperaturen ist eine Achse, die nicht bei $0$ beginnt, übrigens oft sinnvoll – der Nullpunkt der Celsius-Skala ist willkürlich. Ob eine Achse täuscht, hängt also davon ab, ob man Höhen als Verhältnisse liest.
