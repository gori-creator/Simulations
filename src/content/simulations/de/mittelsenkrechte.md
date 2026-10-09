---
description: "Interaktive Simulation für die 7. Klasse: Mittelsenkrechte und Winkelhalbierende als Ortslinien gleicher Abstände entdecken, beide Grundkonstruktionen mit Zirkel und Lineal Schritt für Schritt verfolgen, einen Treffpunkt an einer Straße finden und als Ausblick den Umkreismittelpunkt eines Dreiecks untersuchen."
---

## Worum geht es?

Die **Mittelsenkrechte** $m$ einer Strecke $[AB]$ ist die Gerade, die durch den Mittelpunkt $M$ von $[AB]$ geht und senkrecht auf $[AB]$ steht. Sie hat eine besondere Eigenschaft:

> Jeder Punkt $P$ auf $m$ ist von $A$ und $B$ gleich weit entfernt: $\overline{PA} = \overline{PB}$. Umgekehrt liegt jeder Punkt mit $\overline{PA} = \overline{PB}$ auf $m$.

(In der Simulation steht für die Länge $\overline{PA}$ kurz $|PA|$.) Eine Linie, auf der genau die Punkte mit einer bestimmten Eigenschaft liegen, heißt **Ortslinie**. Die Mittelsenkrechte teilt die Ebene in zwei Hälften: Auf der einen Seite liegen alle Punkte, die näher an $A$ sind, auf der anderen alle, die näher an $B$ sind. Begründung: Spiegelt man an $m$, wird $A$ auf $B$ abgebildet, und jeder Punkt von $m$ bleibt, wo er ist – also sind die Strecken $[PA]$ und $[PB]$ gleich lang.

Die **Winkelhalbierende** $w$ eines Winkels $\alpha$ mit Scheitel $S$ teilt ihn in zwei gleich große Winkel $\frac{\alpha}{2}$. Auch sie ist eine Ortslinie:

> Jeder Punkt auf $w$ ist von beiden Schenkeln gleich weit entfernt – und im Inneren des Winkels nur diese Punkte.

Den **Abstand** eines Punktes von einem Schenkel misst man **senkrecht**, also mit dem Lot. (Läge der Lotfußpunkt hinter dem Scheitel, ist der nächste Punkt des Schenkels der Scheitel $S$ selbst.)

**Konstruktion mit Zirkel und Lineal:**

- *Mittelsenkrechte:* Zirkel weiter als $\frac{1}{2}\,\overline{AB}$ öffnen, Kreisbögen um $A$ und um $B$ mit **demselben Radius** zeichnen. Die Schnittpunkte $S_1$ und $S_2$ sind von $A$ und $B$ gleich weit entfernt, liegen also auf $m$. Die Gerade $S_1S_2$ ist die Mittelsenkrechte. ($AS_1BS_2$ ist sogar eine Raute.)
- *Winkelhalbierende:* Bogen um $S$ schneidet die Schenkel in $P_1$ und $P_2$. Bögen mit gleichem Radius um $P_1$ und $P_2$ schneiden sich in $W$. Die Halbgerade $[SW$ ist die Winkelhalbierende, denn $SP_1WP_2$ ist ein Drachenviereck mit der Symmetrieachse $SW$.

**Ausblick:** Die drei Mittelsenkrechten eines Dreiecks $ABC$ schneiden sich in einem Punkt $U$. Er ist von allen Ecken gleich weit entfernt und ist der Mittelpunkt des **Umkreises**: $\overline{UA} = \overline{UB} = \overline{UC} = r$.

## Ausprobieren

1. [Ortslinie entdecken](?line=0&zones=0): Ziehe $P$ auf Stellen, an denen $|PA| = |PB|$ ist. Jeder Fund hinterlässt einen grünen Punkt. Was fällt dir auf, wenn du fünf solche Punkte gefunden hast? Schalte danach „Ortslinie zeigen“ und die Färbung ein.
2. Ziehe $A$ und $B$. Wo liegt $m$ immer? Achte auf den rechten Winkel und die Striche an $[AM]$ und $[MB]$.
3. [Winkelhalbierende](?mode=winkel): Ziehe $P$ so, dass beide Lote gleich lang sind. Teste auch einen [stumpfen Winkel](?mode=winkel&sx=8&sy=2&th=330&al=150) und einen [gestreckten Winkel](?mode=winkel&sx=10&sy=3&th=0&al=180). Was ist die Winkelhalbierende beim gestreckten Winkel?
4. [Mittelsenkrechte konstruieren](?mode=konstr&ax=4&ay=6&bx=15&by=8): Gehe mit „Nächster Schritt“ durch die Konstruktion und beschreibe jeden Schritt mit eigenen Worten. Warum muss der Radius größer sein als die halbe Strecke?
5. [Winkelhalbierende konstruieren](?mode=konstr&what=winkel&sx=3&sy=3&th=5&al=64): Welches Viereck entsteht am Ende aus $S$, $P_1$, $W$ und $P_2$?
6. [Spielplatz an der Straße](?mode=anw&ax=4&ay=9&bx=15&by=12&gx=0&gy=3&hx=20&hy=5&line=0): Schiebe $P$ entlang der Straße, bis beide Wege gleich lang sind. Schalte danach die Ortslinie ein.
7. [Umkreis](?mode=umk&ax=3&ay=2&bx=15&by=4&cx=8&cy=12): Ziehe $C$, bis das Dreieck [rechtwinklig](?mode=umk&ax=4&ay=2&bx=16&by=2&cx=4&cy=11) oder [stumpfwinklig](?mode=umk&ax=2&ay=3&bx=18&by=3&cx=7&cy=6) ist. Wo liegt dann $U$?

## Aufgaben

### Aufgabe 1: Gleich weit entfernt?

Gegeben sind $A(4|5)$ und $B(12|9)$ (in Kästchen, ein Kästchen ist $0{,}5\,\text{cm}$ breit). Liegen $P(7|9)$ und $Q(9|6)$ auf der Mittelsenkrechten von $[AB]$? Zähle Kästchen oder miss. [Aufgabe laden](?line=0&zones=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P$: Von $A$ geht man 3 Kästchen nach rechts und 4 nach oben, von $B$ aus 5 Kästchen nach links. Beide Strecken sind 5 Kästchen lang (3-4-5-Dreieck), also $\overline{PA} = \overline{PB} = 2{,}5\,\text{cm}$: $P$ liegt auf $m$. $Q$: $\overline{QA} \approx 2{,}5\,\text{cm}$, $\overline{QB} \approx 2{,}1\,\text{cm}$ – $Q$ ist näher an $B$ und liegt nicht auf $m$. [Mit Ortslinie zeigen](?line=1)

</details>

### Aufgabe 2: Zu kleiner Zirkel

Tim will die Mittelsenkrechte einer $6\,\text{cm}$ langen Strecke konstruieren und stellt den Zirkel auf $2{,}5\,\text{cm}$ ein. Was passiert? Welche Radien sind geeignet?

<details>
<summary>Lösung anzeigen</summary>

Die Bögen um $A$ und $B$ schneiden sich nicht, denn $2{,}5\,\text{cm} + 2{,}5\,\text{cm} < 6\,\text{cm}$. Bei genau $3\,\text{cm}$ berühren sie sich nur im Mittelpunkt $M$ – das reicht nicht für eine Gerade. Geeignet ist jeder Radius über $3\,\text{cm}$, gut zeichnen lässt sich z. B. $4$ bis $5\,\text{cm}$.

</details>

### Aufgabe 3: Begründen

Begründe mit einer Achsenspiegelung, dass jeder Punkt $P$ der Mittelsenkrechten $m$ von $A$ und $B$ gleich weit entfernt ist.

<details>
<summary>Lösung anzeigen</summary>

Bei der Spiegelung an $m$ wird $A$ auf $B$ abgebildet, denn $m$ steht senkrecht auf $[AB]$ und halbiert die Strecke. Der Punkt $P$ liegt auf der Achse und bleibt fest. Die Strecke $[PA]$ wird also auf $[PB]$ abgebildet. Da eine Spiegelung Längen nicht verändert, gilt $\overline{PA} = \overline{PB}$.

</details>

### Aufgabe 4: Der Spielplatz

Die Häuser stehen bei $A(4|9)$ und $B(15|12)$, die Straße verläuft durch $G(0|3)$ und $H(20|5)$. Wo muss der Spielplatz an der Straße liegen, damit er von beiden Häusern gleich weit entfernt ist? Beschreibe die Konstruktion. [Aufgabe laden](?mode=anw&ax=4&ay=9&bx=15&by=12&gx=0&gy=3&hx=20&hy=5&line=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Mittelsenkrechte von $[AB]$ konstruieren; ihr Schnittpunkt mit der Straße ist der gesuchte Ort $T$. Er liegt etwa bei $T(11{,}2|4{,}1)$, und es gilt $\overline{TA} = \overline{TB} \approx 4{,}4\,\text{cm}$. [Lösung zeigen](?mode=anw&ax=4&ay=9&bx=15&by=12&gx=0&gy=3&hx=20&hy=5&line=1)

</details>

### Aufgabe 5: Kein Treffpunkt?

Kann es passieren, dass kein Ort an der Straße von $A$ und $B$ gleich weit entfernt ist? Kann es sein, dass jeder Ort an der Straße passt?

<details>
<summary>Lösung anzeigen</summary>

Kein Ort passt, wenn die Straße parallel zur Mittelsenkrechten verläuft, also senkrecht auf $[AB]$ steht. [Beispiel](?mode=anw&ax=4&ay=9&bx=15&by=12&gx=12&gy=0&hx=9&hy=11) Jeder Ort passt, wenn die Straße genau auf der Mittelsenkrechten liegt. [Beispiel](?mode=anw&ax=6&ay=8&bx=14&by=8&gx=10&gy=0&hx=10&hy=14)

</details>

### Aufgabe 6: Ein Funkmast für drei Dörfer

Die Dörfer liegen bei $A(3|2)$, $B(15|4)$ und $C(8|12)$. Ein Funkmast soll von allen drei Dörfern gleich weit entfernt sein. Wo muss er stehen? [Aufgabe laden](?mode=umk&ax=3&ay=2&bx=15&by=4&cx=8&cy=12&line=0&circ=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Er gehört in den Schnittpunkt $U$ der Mittelsenkrechten (zwei genügen, die dritte geht automatisch auch durch $U$). $U$ liegt etwa bei $(8{,}6|5{,}5)$, der Abstand zu jedem Dorf beträgt etwa $3{,}3\,\text{cm}$. [Lösung zeigen](?mode=umk&ax=3&ay=2&bx=15&by=4&cx=8&cy=12)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe 7, Lernbereich 2.1 „Achsen- und punktsymmetrische Figuren“ (LehrplanPLUS Gymnasium Bayern): Grundkonstruktionen Mittelsenkrechte und Winkelhalbierende, Begründung über Symmetrie, Ortslinien. Geeignet zur Erarbeitung (Ortslinie entdecken), zum Vorführen der Konstruktionen am Beamer und für Übungsphasen. Der Umkreis ist hier als Ausblick gedacht und wird bei der Behandlung von Dreiecken vertieft.
- **Bedienung:** $P$, die Punkte $A$, $B$, $C$, der Scheitel $S$, die Schenkel sowie $G$ und $H$ lassen sich ziehen. Mit „Ortslinie zeigen“ aus können die Lernenden die Gerade erst selbst entdecken; „Spur löschen“ startet neu. Die Konstruktion lässt sich schrittweise oder ganz abspielen.
- **Modell:** Karopapier mit $0{,}5\,\text{cm}$ pro Kästchen. Bei der Mittelsenkrechten springt $P$ auf Gitterpunkte und rastet in der Nähe von $m$ auf $m$ ein; bei der Winkelhalbierenden bewegt sich $P$ frei im Winkelfeld und rastet auf $w$ ein. Gerundete Längen werden mit „≈“ angezeigt.
- **Typische Fehlvorstellungen:**
  - „Jede Senkrechte zu $[AB]$ ist eine Mittelsenkrechte.“ – Sie muss durch den Mittelpunkt gehen.
  - Der Zirkel wird zwischen den beiden Bögen verstellt oder kleiner als die halbe Strecke geöffnet.
  - Der Abstand zu einem Schenkel wird schräg statt senkrecht gemessen.
  - „Die Mittelsenkrechte ist eine Strecke.“ – Sie ist eine Gerade; auch Punkte weit weg von $[AB]$ liegen darauf.
  - „Der Umkreismittelpunkt liegt immer im Dreieck.“ – Bei stumpfwinkligen Dreiecken liegt er außerhalb.
