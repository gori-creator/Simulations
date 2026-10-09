---
description: "Interaktive Simulation für die 7. Klasse: Figuren an einer Achse oder an einem Punkt spiegeln, die Konstruktion mit Lot und gleichen Abständen sehen, Umklappen und Drehen um 180° animiert verfolgen, Umlaufsinn, Fixpunkte und Fixgeraden untersuchen und Symmetrieachsen selbst einzeichnen."
---

## Worum geht es?

Bei einer **Achsenspiegelung** an der Achse $s$ wird jeder Punkt $P$ auf einen Bildpunkt $P'$ abgebildet. Es gilt:

- $P$ und $P'$ liegen auf einer **Senkrechten** zu $s$ (dem Lot von $P$ auf $s$),
- $P$ und $P'$ sind **gleich weit** von $s$ entfernt – die Achse halbiert die Strecke $[PP']$.

Bei einer **Punktspiegelung** am Zentrum $Z$ ist $Z$ der **Mittelpunkt** jeder Strecke $[PP']$:

$$
\overline{PZ} = \overline{ZP'}
$$

Eine Punktspiegelung ist dasselbe wie eine **Drehung um $180^\circ$** um $Z$.

Beide Spiegelungen sind **Kongruenzabbildungen**: Bild und Original sind deckungsgleich, Längen und Winkelgrößen bleiben erhalten. Unterschiede:

| | Achsenspiegelung | Punktspiegelung |
| --- | --- | --- |
| Umlaufsinn | wird umgekehrt | bleibt erhalten |
| Fixpunkte | alle Punkte auf $s$ | nur $Z$ |
| Fixgeraden | $s$ und jede Senkrechte zu $s$ | jede Gerade durch $Z$ |
| Bildstrecken | im Allgemeinen nicht parallel | parallel zum Original |

Der **Umlaufsinn** beschreibt, in welcher Richtung man die Ecken $A \to B \to C$ durchläuft: gegen den Uhrzeigersinn oder im Uhrzeigersinn. Eine **Fixgerade** wird auf sich selbst abgebildet (ihre Punkte dürfen dabei wandern).

Eine Figur heißt **achsensymmetrisch**, wenn sie bei einer Achsenspiegelung auf sich selbst fällt, und **punktsymmetrisch**, wenn sie bei einer Punktspiegelung (halben Drehung) auf sich selbst fällt.

## Ausprobieren

1. Ziehe die Ecken des Dreiecks und die Punkte der Achse $s$. Woran erkennst du, dass $A$ und $A'$ gleich weit von $s$ entfernt sind? Was passiert, wenn eine Ecke genau auf $s$ liegt?
2. Drücke „Umklappen“: Das Dreieck wird wie ein Blatt Papier an der Achse umgeklappt. Vergleiche die Kreispfeile in Original und Bild.
3. Spiegle das [Fähnchen an einer schrägen Achse](?shape=fahne&ax=3&ay=3&bx=3&by=12&cx=7&cy=10&px=6&py=1&qx=10&qy=13). In welche Richtung zeigt das gespiegelte Fähnchen?
4. Wechsle zur [Punktspiegelung](?mode=punkt) und drücke „Um 180° drehen“. Bleibt der Umlaufsinn gleich? Vergleiche die Lage von $[AB]$ und $[A'B']$.
5. Schalte [Fixpunkte und Fixgeraden](?fix=1&ax=10&ay=3&bx=14&by=5&cx=12&cy=10&px=9&py=1&qx=11&qy=13) ein. Welche Geraden werden auf sich selbst abgebildet?
6. Ziehe am **Bildpunkt** $A'$: Wo muss $A$ dann liegen?
7. Finde im Modus [Symmetrie erkennen](?mode=symmetrie) alle Symmetrieachsen und Symmetriezentren der Figuren.

## Aufgaben

### Aufgabe 1: Bildpunkt konstruieren

[Aufgabe laden](?show=0&ax=3&ay=6&bx=7&by=4&cx=5&cy=11&px=8&py=1&qx=12&qy=13) Konstruiere im Heft das Bild des Dreiecks bei der Spiegelung an $s$. Beschreibe die Schritte. Prüfe danach mit „Umklappen“.

<details>
<summary>Lösung anzeigen</summary>

Für jede Ecke: Lot von der Ecke auf $s$ zeichnen (Geodreieck mit der Mittellinie auf $s$), den Abstand zu $s$ messen und auf der anderen Seite gleich weit abtragen. [Lösung zeigen](?ax=3&ay=6&bx=7&by=4&cx=5&cy=11&px=8&py=1&qx=12&qy=13)

</details>

### Aufgabe 2: Punktspiegelung im Kopf

[Aufgabe laden](?mode=punkt&show=0&ax=4&ay=3&bx=8&by=3&cx=6&cy=6&zx=10&zy=7) $Z$ liegt 6 Kästchen rechts von $A$ und 4 Kästchen über $A$. Wo liegt $A'$?

<details>
<summary>Lösung anzeigen</summary>

Von $Z$ aus geht man noch einmal genauso weit: 6 Kästchen nach rechts und 4 nach oben. $A'$ liegt also 12 Kästchen rechts von $A$ und 8 Kästchen über $A$. [Lösung zeigen](?mode=punkt&ax=4&ay=3&bx=8&by=3&cx=6&cy=6&zx=10&zy=7)

</details>

### Aufgabe 3: Achse gesucht

Ein Dreieck und sein Bild bei einer Achsenspiegelung sind gegeben, die Achse fehlt. Wie findest du sie?

<details>
<summary>Lösung anzeigen</summary>

Die Achse ist die **Mittelsenkrechte** der Strecke $[AA']$ (ebenso von $[BB']$ und $[CC']$): Sie steht senkrecht auf $[AA']$ und geht durch deren Mittelpunkt.

</details>

### Aufgabe 4: Symmetrie bei Buchstaben

Welche der Buchstaben H, T, E, N, F sind achsensymmetrisch, welche punktsymmetrisch? Prüfe im Modus [Symmetrie erkennen](?mode=symmetrie&fig=N).

<details>
<summary>Lösung anzeigen</summary>

H: zwei Achsen und punktsymmetrisch. T und E: je eine Achse (beim E waagerecht). N: keine Achse, aber punktsymmetrisch. F: keine Symmetrie.

</details>

### Aufgabe 5: Das Parallelogramm

Lena behauptet: „Die Diagonalen eines Parallelogramms sind Symmetrieachsen.“ Prüfe ihre Aussage. [Figur laden](?mode=symmetrie&fig=parallelogramm&rot=15)

<details>
<summary>Lösung anzeigen</summary>

Falsch: Spiegelt man an einer Diagonalen, passt das Bild nicht auf das Parallelogramm (Ausnahme: Raute). Ein Parallelogramm ist aber **punktsymmetrisch** – das Zentrum ist der Schnittpunkt der Diagonalen.

</details>

### Aufgabe 6: Zweimal spiegeln

Spiegle ein Dreieck zweimal an derselben Achse. Was kommt heraus? Und was passiert mit dem Umlaufsinn, wenn man an zwei verschiedenen Achsen nacheinander spiegelt?

<details>
<summary>Lösung anzeigen</summary>

Zweimal an derselben Achse: wieder das Original. Bei zwei Achsenspiegelungen wird der Umlaufsinn zweimal umgekehrt – am Ende ist er wieder wie im Original.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe 7, Lernbereich 2.1 „Achsen- und punktsymmetrische Figuren“ (LehrplanPLUS Gymnasium Bayern): Eigenschaften von Achsen- und Punktspiegelung, Konstruktion von Bildpunkten mit dem Geodreieck, Symmetrie erkennen. Geeignet für die Erarbeitung (Umklappen als Handlungsvorstellung) und für Übungsphasen.
- **Bedienung:** Ecken, Achsenpunkte, die Achse selbst, das Zentrum und die ganze Figur lassen sich ziehen; auch an Bildpunkten. „Bildfigur zeigen“ aus eignet sich für Konstruktionsaufgaben im Heft. Im Modus „Symmetrie erkennen“ zeichnet man Achsen durch Ziehen und tippt auf ein vermutetes Zentrum; falsche Versuche zeigen das nicht passende Bild in Rot.
- **Modell:** Alle Punkte liegen auf Gitterpunkten des Karopapiers (ein Kästchen $= 0{,}5\,\text{cm}$); Bildpunkte bei schräger Achse liegen im Allgemeinen nicht auf Gitterpunkten.
- **Typische Fehlvorstellungen:**
  - Gespiegelt wird „waagerecht“ statt senkrecht zur (schrägen) Achse.
  - Bei der Punktspiegelung wird nur „umgedreht“, ohne über $Z$ hinaus gleich weit abzutragen.
  - „Die Diagonale des Parallelogramms ist eine Symmetrieachse.“
  - „Punktspiegelung kehrt den Umlaufsinn um.“ – Sie ist eine Drehung um $180^\circ$ und erhält ihn.
