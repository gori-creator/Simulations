---
description: "Interaktive Simulation für die 7. Klasse: Dreiecke aus drei gegebenen Stücken mit Lineal, Geodreieck und Zirkel Schritt für Schritt konstruieren, die Kongruenzsätze SSS, SWS, WSW und SsW kennenlernen und Sonderfälle wie die Dreiecksungleichung, zwei Lösungen bei SSW und ähnliche Dreiecke bei WWW untersuchen."
---

## Worum geht es?

Ein Dreieck hat sechs **Stücke**: drei Seiten $a$, $b$, $c$ und drei Winkel $\alpha$, $\beta$, $\gamma$. Die Seite $a$ liegt der Ecke $A$ gegenüber, $b$ der Ecke $B$ und $c$ der Ecke $C$; der Winkel $\alpha$ liegt bei $A$ usw. Oft genügen schon **drei** passende Stücke, um ein Dreieck eindeutig festzulegen. Zwei Dreiecke, die man durch Verschieben, Drehen oder Spiegeln genau zur Deckung bringen kann, heißen **kongruent** (deckungsgleich).

Die **Kongruenzsätze** sagen, welche drei Stücke ausreichen:

| Satz | gegeben | Bedingung |
| --- | --- | --- |
| SSS | drei Seiten | jede Seite ist kürzer als die Summe der beiden anderen |
| SWS | zwei Seiten und der **eingeschlossene** Winkel | Winkel kleiner als $180°$ |
| WSW | eine Seite und die **beiden anliegenden** Winkel | $\alpha + \beta < 180°$ |
| SsW | zwei Seiten und der Gegenwinkel der **größeren** Seite | – |

Die Bedingung bei SSS heißt **Dreiecksungleichung**: $a + b > c$, $a + c > b$ und $b + c > a$. Ist zum Beispiel $a + b \le c$, erreichen sich die beiden Kreisbögen nicht.

**Vorsicht bei SSW:** Liegt der gegebene Winkel der **kleineren** Seite gegenüber, kann es zwei verschiedene Dreiecke geben, eines oder keines. **WWW** ist gar kein Kongruenzsatz: Drei Winkel legen nur die Form fest. Die Dreiecke sind dann **ähnlich**, aber verschieden groß.

**So geht man vor:** Zuerst eine **Planfigur** skizzieren und die gegebenen Stücke farbig markieren. Dann die Grundseite zeichnen, Winkel mit dem Geodreieck antragen und Längen mit dem Zirkel abtragen. Eine **Konstruktionsbeschreibung** hält die Schritte fest.

## Ausprobieren

1. [SSS](?cs=sss&c=6&b=4.5&a=5): Gehe mit „Nächster Schritt“ durch die Konstruktion. Warum braucht man zwei Kreisbögen? Wo würde der zweite Schnittpunkt der Kreise liegen, und warum liefert er kein „neues“ Dreieck?
2. Verkleinere $a$ und $b$, bis die Bögen sich nicht mehr schneiden. Bei welcher Summe $a + b$ passiert das? [Beispiel](?c=7&b=3&a=2.5)
3. [SWS](?cs=sws&c=7&b=4&al=40): Ziehe am Ende $C$ oder $B$. Welche Stücke ändern sich mit?
4. [WSW](?cs=wsw&c=6&al=45&be=70): Stelle $\alpha + \beta$ auf $180°$ oder mehr ein. Was passiert mit den Schenkeln?
5. [SSW mit zwei Lösungen](?cs=ssw&c=7&a=4.5&al=35): Vergleiche die Winkel $\gamma_1$ und $\gamma_2$. Vergrößere dann $a$ über $7\,\text{cm}$ hinaus – wie viele Lösungen gibt es jetzt?
6. [WWW](?cs=www&c=4&al=50&be=60): Drei Dreiecke mit denselben Winkeln. Sind sie kongruent?

## Aufgaben

### Aufgabe 1: Konstruierbar?

Lässt sich ein Dreieck mit $a = 3\,\text{cm}$, $b = 4\,\text{cm}$ und $c = 8\,\text{cm}$ konstruieren? Begründe ohne zu zeichnen. [Aufgabe laden](?c=8&b=4&a=3&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Nein. Es ist $a + b = 7\,\text{cm} < 8\,\text{cm} = c$. Die Kreisbögen um $A$ (Radius $4\,\text{cm}$) und um $B$ (Radius $3\,\text{cm}$) reichen nicht bis zueinander – die Dreiecksungleichung ist verletzt. [In der Simulation zeigen](?c=8&b=4&a=3)

</details>

### Aufgabe 2: Welcher Kongruenzsatz?

Gegeben sind $c = 7\,\text{cm}$, $\alpha = 40°$ und $b = 4\,\text{cm}$. Welcher Kongruenzsatz passt? Konstruiere das Dreieck und miss $a$. [Aufgabe laden](?cs=sws&c=7&b=4&al=40&meas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Der Winkel $\alpha$ liegt zwischen den Seiten $b$ und $c$: Das ist SWS, das Dreieck ist eindeutig. Man misst $a \approx 4{,}7\,\text{cm}$. [Lösung zeigen](?cs=sws&c=7&b=4&al=40)

</details>

### Aufgabe 3: Winkel zu groß

Kann man ein Dreieck mit $c = 5\,\text{cm}$, $\alpha = 110°$ und $\beta = 75°$ konstruieren?

<details>
<summary>Lösung anzeigen</summary>

Nein. Die Winkelsumme im Dreieck beträgt $180°$, hier ist aber schon $\alpha + \beta = 185°$. Die freien Schenkel laufen auseinander und schneiden sich nicht. [Zeigen](?cs=wsw&c=5&al=110&be=75)

</details>

### Aufgabe 4: Zwei Dreiecke

Gegeben sind $c = 7\,\text{cm}$, $\alpha = 35°$ und $a = 4{,}5\,\text{cm}$. Konstruiere. Warum gibt es zwei Dreiecke? [Aufgabe laden](?cs=ssw&c=7&a=4.5&al=35&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Der Kreisbogen um $B$ mit Radius $4{,}5\,\text{cm}$ schneidet den freien Schenkel von $\alpha$ zweimal, in $C_1$ und $C_2$. Beide Dreiecke $ABC_1$ ($b_1 \approx 7{,}8\,\text{cm}$) und $ABC_2$ ($b_2 \approx 3{,}7\,\text{cm}$) haben die gegebenen Stücke. Der Grund: $\alpha$ liegt der **kleineren** Seite gegenüber ($a < c$), also ist das kein Kongruenzsatz. [Lösung zeigen](?cs=ssw&c=7&a=4.5&al=35)

</details>

### Aufgabe 5: Genau eine Lösung

Bei $c = 8\,\text{cm}$ und $\alpha = 30°$: Für welche Länge $a < c$ gibt es genau ein Dreieck? Tipp: Wie weit ist $B$ vom freien Schenkel entfernt?

<details>
<summary>Lösung anzeigen</summary>

Der Abstand von $B$ zum Schenkel ist die Höhe $h = 4\,\text{cm}$ (halbes gleichseitiges Dreieck mit Seite $8\,\text{cm}$). Bei $a = 4\,\text{cm}$ berührt der Bogen den Schenkel genau einmal, das Dreieck ist dann rechtwinklig bei $C$. Für $a < 4\,\text{cm}$ gibt es keine Lösung, für $4\,\text{cm} < a < 8\,\text{cm}$ zwei. [Zeigen](?cs=ssw&c=8&a=4&al=30)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 7, Lernbereich „Kongruenz, besondere Dreiecke und Dreieckskonstruktionen“ (LehrplanPLUS Gymnasium Bayern). Die Simulation kann eine Konstruktion am Beamer vorführen, während die Klasse im Heft mitkonstruiert; anschließend formulieren die Lernenden die Konstruktionsbeschreibung selbst.
- **Entdecken statt vorgeben:** Mit verschiedenen Kombinationen aus drei Stücken lässt sich erforschen, wann ein Dreieck eindeutig ist. Die Fälle SSW mit zwei Lösungen und WWW zeigen, warum die Bedingungen der Kongruenzsätze nötig sind.
- **Modell:** Längen werden auf $0{,}1\,\text{cm}$, Winkel auf $1°$ gerundet; gemessene Stücke erscheinen mit „≈“. Konstruiert wird immer von der Grundseite $[AB]$ aus, $C$ liegt oberhalb. Der zweite Kreisschnittpunkt unterhalb liefert ein gespiegeltes, also kongruentes Dreieck.
- **Häufige Stolpersteine:**
  - Die Planfigur wird weggelassen oder die Stücke werden falsch zugeordnet (z. B. $a$ an die falsche Seite).
  - Bei SWS wird ein Winkel genommen, der **nicht** zwischen den beiden Seiten liegt – das ist dann SSW.
  - „Drei Winkel legen ein Dreieck fest.“ – Sie legen nur die Form fest, nicht die Größe.
  - Beim Antragen von $\beta$ wird das Geodreieck an der falschen Seite der Grundlinie angelegt.
