---
description: "Interaktive Simulation für die 5. Klasse: Punkte im Koordinatensystem setzen und ablesen, Strecke, Halbgerade und Gerade unterscheiden, parallel und senkrecht mit dem Geodreieck prüfen, Abstände messen und die Lage von Kreis und Gerade untersuchen – mit Punkte-Spiel."
---

## Worum geht es?

Im **Koordinatensystem** legt man die Lage eines Punktes mit zwei Zahlen fest. Die waagerechte Achse heißt **x-Achse** (Rechtsachse), die senkrechte **y-Achse** (Hochachse). Sie schneiden sich im **Ursprung** $O(0 \mid 0)$.

Beim Punkt $P(3 \mid 5)$ steht die **x-Koordinate** zuerst: Vom Ursprung aus geht man **3 nach rechts** und dann **5 nach oben**. Vertauscht man die Zahlen, landet man bei einem ganz anderen Punkt, nämlich $(5 \mid 3)$.

**Linien durch zwei Punkte A und B:**

| Name | Schreibweise | Endpunkte | Länge |
| --- | --- | --- | --- |
| Strecke | $[AB]$ | A und B | messbar, z. B. $\overline{AB} = 5\,\text{cm}$ |
| Halbgerade | $[AB$ | nur A (Anfangspunkt) | unbegrenzt |
| Gerade | $AB$ | keine | unbegrenzt |

**Lage zweier Geraden:** Bilden zwei Geraden $g$ und $h$ einen rechten Winkel, so sind sie **senkrecht** zueinander: $g \perp h$. Haben sie keinen gemeinsamen Punkt, so sind sie **parallel**: $g \parallel h$. Mit dem **Geodreieck** prüft man das so: Zeichenkante auf $g$ legen. Liegt $h$ auf der **Mittellinie**, ist $h \perp g$. Verläuft $h$ entlang einer der dünnen Linien, die parallel zur Zeichenkante sind, ist $h \parallel g$.

**Abstand:** Der Abstand eines Punktes $P$ von einer Geraden $g$ ist die Länge des **Lots** von $P$ auf $g$, also der kürzesten Verbindung. Das Lot steht senkrecht auf $g$; sein Fußpunkt heißt $F$. Parallele Geraden haben überall denselben Abstand.

**Kreis:** Alle Punkte, die von einem **Mittelpunkt** $M$ dieselbe Entfernung $r$ haben, bilden einen Kreis. $r$ heißt **Radius**, der **Durchmesser** ist doppelt so lang:

$$
d = 2 \cdot r
$$

**Kreis und Gerade:** Man vergleicht den Abstand von $M$ zur Geraden mit dem Radius.

| Abstand von M zur Geraden | gemeinsame Punkte | Name der Geraden |
| --- | --- | --- |
| größer als $r$ | keiner | Passante |
| gleich $r$ | genau einer (Berührpunkt $T$) | **Tangente** |
| kleiner als $r$ | zwei ($S_1$, $S_2$) | Sekante |

Eine Tangente steht im Berührpunkt **senkrecht** auf dem Radius $[MT]$.

## Ausprobieren

1. Ziehe die Punkte A und B. Die gestrichelten Hilfslinien zeigen, wie man die Koordinaten abliest.
2. Wechsle zwischen Strecke, Halbgerade und Gerade (auch durch Antippen rechts). Was ändert sich an der Zeichnung und an der Länge? [Gerade laden](?kind=gerade&ax=1&ay=6&bx=4&by=4)
3. Lege das Lineal an eine [waagerechte Strecke](?ruler=1&ax=1&ay=3&bx=7&by=3) und an eine [schräge Strecke](?ruler=1&ax=1&ay=1&bx=7&by=5). Bei welcher kannst du die Länge auch ohne Lineal angeben?
4. Untersuche [zwei senkrechte Geraden](?mode=lage&geo=1) mit dem Geodreieck. Ziehe dann D weg: Wann erscheint das Kreuz ✗?
5. Drücke „h parallel zu g stellen“ und „h senkrecht zu g stellen“. Beobachte, wie D springt.
6. Schalte den [Abstand eines Punktes](?mode=lage&dist=1) ein und ziehe P. Wo ist der Abstand am kleinsten?
7. Verändere bei einem [Kreis](?mode=kreis&ax=1&ay=1&bx=9&by=1&mx=5&my=4&r=2) den Radius r langsam von 2 cm auf 4 cm. Wann wird g zur Tangente, wann zur Sekante?
8. Spiele das [Punkte-Spiel](?mode=spiel): Wie viele Aufgaben schaffst du am Stück?

## Aufgaben

### Aufgabe 1: Punkte ablesen und setzen

Trage $A(1 \mid 2)$, $B(6 \mid 2)$ und $C(6 \mid 7)$ in ein Koordinatensystem ein. Welcher Punkt $D$ ergänzt sie zu einem Quadrat $ABCD$? Welche Seiten des Quadrats sind parallel, welche senkrecht zueinander?

<details>
<summary>Lösung anzeigen</summary>

$D(1 \mid 7)$. Gegenüberliegende Seiten sind parallel: $[AB] \parallel [DC]$ und $[BC] \parallel [AD]$. Benachbarte Seiten sind senkrecht zueinander, z. B. $[AB] \perp [BC]$. [In der Simulation zeigen](?mode=lage&ax=1&ay=2&bx=6&by=2&cx=1&cy=7&dx=6&dy=7&geo=1)

</details>

### Aufgabe 2: Strecke, Halbgerade, Gerade

(a) Wie viele Endpunkte haben eine Strecke, eine Halbgerade und eine Gerade?
(b) Paul sagt: „Die Halbgerade $[AB$ ist länger als die Strecke $[AB]$.“ Stimmt das?

<details>
<summary>Lösung anzeigen</summary>

(a) Strecke: zwei, Halbgerade: einen (den Anfangspunkt), Gerade: keinen.
(b) Nein, eine Halbgerade ist unbegrenzt und hat deshalb **keine** Länge. Nur Strecken kann man messen.

</details>

### Aufgabe 3: Eine Senkrechte finden

Die Gerade $g$ geht durch $A(2 \mid 2)$ und $B(8 \mid 5)$. Gesucht ist eine Gerade $h$ durch $C(4 \mid 7)$ mit $h \perp g$. Gib einen passenden Gitterpunkt $D$ an. [Aufgabe laden](?mode=lage&dx=9&dy=7)

<details>
<summary>Lösung anzeigen</summary>

Auf $g$ geht es von A nach B „6 nach rechts, 3 nach oben“, also 2 nach rechts und 1 nach oben. Eine Senkrechte geht dann 1 nach rechts und 2 nach **unten**. Von C aus: $D(5 \mid 5)$, $D(6 \mid 3)$ oder $D(7 \mid 1)$. [Lösung zeigen](?mode=lage&geo=1)

</details>

### Aufgabe 4: Parallele und Abstand

Die Gerade $g$ geht durch $A(1 \mid 2)$ und $B(9 \mid 2)$. (a) Zeichne die Parallele $h$ zu $g$ durch $C(2 \mid 6)$. (b) Wie groß ist der Abstand von $g$ und $h$? (c) Wie groß ist der Abstand des Punktes $P(5 \mid 7)$ von $g$?

<details>
<summary>Lösung anzeigen</summary>

(a) $h$ verläuft waagerecht durch $C$, z. B. durch $D(8 \mid 6)$. (b) Der Abstand ist $4\,\text{cm}$ (von $y = 2$ bis $y = 6$). (c) Das Lot von $P$ auf $g$ ist senkrecht, der Fußpunkt ist $F(5 \mid 2)$, der Abstand also $5\,\text{cm}$. [Kontrollieren](?mode=lage&ax=1&ay=2&bx=9&by=2&cx=2&cy=6&dx=8&dy=6&dist=1&px=5&py=7)

</details>

### Aufgabe 5: Tangenten an einen Kreis

Ein Kreis hat den Mittelpunkt $M(5 \mid 4)$ und den Radius $r = 3\,\text{cm}$. (a) Gib zwei Tangenten an, die parallel zur x-Achse sind. (b) Ist die Gerade durch $(9 \mid 0)$ und $(9 \mid 8)$ eine Passante, Tangente oder Sekante?

<details>
<summary>Lösung anzeigen</summary>

(a) Die waagerechten Geraden durch $(0 \mid 1)$ und durch $(0 \mid 7)$: Sie haben von M jeweils den Abstand $3\,\text{cm} = r$. Berührpunkte $T(5 \mid 1)$ bzw. $T(5 \mid 7)$. [Tangente unten](?mode=kreis&ax=1&ay=1&bx=9&by=1&mx=5&my=4&r=3), [Tangente oben](?mode=kreis&ax=1&ay=7&bx=9&by=7&mx=5&my=4&r=3)

(b) Der Abstand von M ist $4\,\text{cm} > 3\,\text{cm}$: eine **Passante**. [Zeigen](?mode=kreis&ax=9&ay=0&bx=9&by=8&mx=5&my=4&r=3)

</details>

### Aufgabe 6: Knobelaufgabe

Wie viele Gitterpunkte (ganzzahlige Koordinaten) liegen auf dem Kreis um $M(5 \mid 4)$ mit $r = 5\,\text{cm}$, wenn man das ganze Koordinatensystem betrachtet?

<details>
<summary>Lösung anzeigen</summary>

Zwölf: Vier davon erreicht man mit „5 nach rechts, links, oben oder unten“, z. B. $(10 \mid 4)$. Acht weitere mit den Schritten „3 zur Seite und 4 hoch oder runter“ bzw. „4 zur Seite und 3 hoch oder runter“, z. B. $(8 \mid 8)$ oder $(9 \mid 7)$ – das zeigt die Simulation (und Nachmessen mit dem Zirkel); warum das so ist, lernst du später mit dem Satz des Pythagoras. Im Bild der Simulation sind zehn davon zu sehen; $(5 \mid 9)$ liegt zu weit oben und der zwölfte Punkt unterhalb der x-Achse. [Kreis zeigen](?mode=kreis&mx=5&my=4&r=5)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe 5, Lernbereich 2 „Geometrische Figuren und Lagebeziehungen“ (LehrplanPLUS Gymnasium Bayern): Einstieg ins Koordinatensystem, Erarbeitung der Begriffe parallel, senkrecht, Abstand und Tangente, Übung mit dem Punkte-Spiel (auch als Warm-up am Whiteboard).
- **Modell:** Alle Punkte liegen auf Gitterpunkten im 1. Quadranten; eine Längeneinheit entspricht 1 cm, also zwei Kästchen. „Senkrecht“, „parallel“ und „Tangente“ werden exakt (ganzzahlig) entschieden. Längen wie $\overline{AB}$ oder Abstände werden wie mit dem Lineal auf Millimeter gerundet angegeben ($\approx$). Das Geodreieck ist verkleinert (Zeichenkante 8 cm statt 16 cm).
- **Typische Fehlvorstellungen:**
  - x- und y-Koordinate werden vertauscht – das Spiel erkennt diesen Fehler und gibt gezielt Rückmeldung („erst nach rechts, dann nach oben“).
  - „Senkrecht“ wird mit „lotrecht/hochkant“ verwechselt. In der Mathematik ist „senkrecht“ immer eine Beziehung **zwischen zwei** Geraden; auch schräge Geraden können senkrecht zueinander sein.
  - Parallel heißt nicht „gleich lang“ oder „waagerecht“; Geraden haben keine Länge.
  - Der Abstand wird nicht senkrecht, sondern entlang irgendeiner Verbindung gemessen.
- **Schreibweise:** Punkte mit senkrechtem Strich $P(3 \mid 5)$, Strecke $[AB]$, Halbgerade $[AB$, Gerade $AB$, Streckenlänge $\overline{AB}$ – wie in bayerischen Schulbüchern üblich.
- **Punkte-Spiel:** Es funktioniert auch in gesperrten Links (`_lock=1`). Die Ergebnisse „Lage“ und „Abstand“ lassen sich mit `_hide=1` verdecken; in der Zeichnung bleiben sie sichtbar.
