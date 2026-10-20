---
description: "Interaktive Simulation für die 7. Klasse: Dreiecke aus drei gegebenen Stücken mit Lineal, Geodreieck und Zirkel Schritt für Schritt konstruieren – mit Planfigur, Konstruktionsbeschreibung wie im Heft und den Kongruenzsätzen SSS, SWS, WSW und SsW. Dazu die Sonderfälle: verletzte Dreiecksungleichung, parallele Schenkel, keine, eine oder zwei Lösungen bei SSW und ähnliche Dreiecke bei WWW."
---

## Worum geht es?

Ein Dreieck hat sechs **Stücke**: drei Seiten $a$, $b$, $c$ und drei Winkel $\alpha$, $\beta$, $\gamma$. Die Seite $a = [BC]$ liegt der Ecke $A$ gegenüber, $b = [CA]$ der Ecke $B$ und $c = [AB]$ der Ecke $C$; der Winkel $\alpha$ liegt bei $A$, $\beta$ bei $B$, $\gamma$ bei $C$. Zwei Dreiecke, die man durch Verschieben, Drehen oder Spiegeln genau zur Deckung bringen kann, heißen **kongruent** (deckungsgleich).

Oft genügen schon **drei** passende Stücke, um ein Dreieck eindeutig festzulegen. Welche, sagen die **Kongruenzsätze**:

| Satz | gegeben | Bedingung |
| --- | --- | --- |
| SSS | drei Seiten | die längste Seite ist kürzer als die Summe der beiden anderen |
| SWS | zwei Seiten und der **eingeschlossene** Winkel | Winkel kleiner als $180°$ |
| WSW | eine Seite und die **beiden anliegenden** Winkel | $\alpha + \beta < 180°$ |
| SsW | zwei Seiten und der Gegenwinkel der **größeren** Seite | – |

Die Bedingung bei SSS heißt **Dreiecksungleichung**: $a + b > c$, $a + c > b$ und $b + c > a$. Ist zum Beispiel $a + b < c$, erreichen sich die Kreise um $A$ und $B$ nicht; bei $a + b = c$ berühren sie sich nur auf der Strecke $[AB]$ – dann gäbe es kein „echtes“ Dreieck.

**Vorsicht bei SSW:** Liegt der gegebene Winkel der **kleineren** Seite gegenüber (z. B. $\alpha$ mit $a < c$), entscheidet der Abstand $h$ von $B$ zum freien Schenkel von $\alpha$:

- $a < h$: Der Kreis um $B$ erreicht den Schenkel nicht – **keine** Lösung.
- $a = h$: Der Kreis **berührt** den Schenkel – **genau eine** Lösung mit rechtem Winkel bei $C$.
- $h < a < c$: Der Kreis schneidet den Schenkel **zweimal** – **zwei** verschiedene Dreiecke $ABC_1$ und $ABC_2$.

Ist dagegen $a \ge c$ (SsW), liegt der zweite Schnittpunkt hinter $A$ auf der Verlängerung des Schenkels und liefert kein Dreieck – die Lösung ist eindeutig.

**WWW** ist kein Kongruenzsatz: Drei Winkel legen nur die **Form** fest. Wegen $\alpha + \beta + \gamma = 180°$ ist der dritte Winkel sowieso schon durch die beiden anderen bestimmt. Die Dreiecke sind **ähnlich**, aber verschieden groß.

**So geht man vor:** Zuerst eine **Planfigur** skizzieren und die gegebenen Stücke farbig markieren. Dann prüfen, welcher Kongruenzsatz passt. Konstruiert wird meist von der gegebenen Seite aus: Grundseite zeichnen, Winkel mit dem Geodreieck antragen, Längen mit dem Zirkel abtragen. Die **Konstruktionsbeschreibung** hält die Schritte fest, z. B. bei SSS: „1. Zeichne $[AB]$ mit $c = 6\,\text{cm}$. 2. Zeichne einen Kreis um $A$ mit $r = b$. 3. Zeichne einen Kreis um $B$ mit $r = a$. 4. Die Kreise schneiden sich in $C$. 5. Verbinde $C$ mit $A$ und $B$.“

## Ausprobieren

1. Beim Laden läuft die Konstruktion einmal zügig durch. Drücke **„Neu konstruieren“** und gehe dann mit **„Nächster Schritt“** Zeile für Zeile durch: Lineal, Zirkel und Geodreieck arbeiten, die passende Zeile erscheint in der Konstruktionsbeschreibung. Wo würde der zweite Schnittpunkt der Kreise liegen – und warum liefert er kein neues Dreieck?
2. [3–4–5-Dreieck](?c=5&b=4&a=3): Welcher Winkel ist hier besonders?
3. Ziehe am fertigen Dreieck den Punkt $C$ oder $B$. Welche Stücke ändern sich mit? Verkleinere dann $a$ und $b$, bis sich die Kreise nicht mehr schneiden – die rote Maßlinie zeigt die **Lücke**. [Beispiel](?c=6&b=3&a=2)
4. [SWS](?cs=sws&c=6&b=4.5&al=50): Drehe den Schenkel von $\alpha$ am runden Griff. Gibt es eine Einstellung, bei der kein Dreieck entsteht?
5. [WSW](?cs=wsw&c=6&al=50&be=60): Stelle $\alpha + \beta$ auf genau [$180°$](?cs=wsw&c=6&al=100&be=80) und dann [mehr](?cs=wsw&c=6&al=110&be=85). Was passiert mit den Schenkeln?
6. [SSW mit zwei Lösungen](?cs=ssw&c=6&a=4&al=30): Vergleiche $\gamma_1$ und $\gamma_2$ in der Ergebniskarte. Verkleinere $a$ auf [$3\,\text{cm}$](?cs=ssw&c=6&a=3&al=30) und [$2\,\text{cm}$](?cs=ssw&c=6&a=2&al=30), vergrößere es dann über $6\,\text{cm}$ hinaus ([SsW](?cs=ssw&c=5&a=6&al=50)). Wie viele Lösungen gibt es jeweils?
7. [WWW](?cs=www&c=4&al=50&be=60): Drei Dreiecke mit denselben Winkeln. Sind sie kongruent?

## Aufgaben

### Aufgabe 1: Konstruierbar?

Lässt sich ein Dreieck mit $a = 2\,\text{cm}$, $b = 3\,\text{cm}$ und $c = 6\,\text{cm}$ konstruieren? Begründe ohne zu zeichnen. Und mit $a = 3\,\text{cm}$, $b = 4\,\text{cm}$, $c = 7\,\text{cm}$? [Aufgabe laden](?c=6&b=3&a=2&meas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Nein: $a + b = 5\,\text{cm} < 6\,\text{cm} = c$. Die Kreise um $A$ (Radius $3\,\text{cm}$) und um $B$ (Radius $2\,\text{cm}$) lassen auf $[AB]$ eine Lücke von $1\,\text{cm}$. [Zeigen](?c=6&b=3&a=2)

Auch das zweite Dreieck gibt es nicht: $3\,\text{cm} + 4\,\text{cm} = 7\,\text{cm}$. Die Kreise berühren sich genau auf $[AB]$, $C$ läge auf der Strecke. [Zeigen](?c=7&b=4&a=3)

</details>

### Aufgabe 2: Welcher Kongruenzsatz?

Gegeben sind $c = 6\,\text{cm}$, $b = 4{,}5\,\text{cm}$ und $\alpha = 50°$. Welcher Kongruenzsatz passt? Konstruiere das Dreieck, schreibe eine Konstruktionsbeschreibung und miss $a$, $\beta$ und $\gamma$. [Aufgabe laden](?cs=sws&c=6&b=4.5&al=50&meas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\alpha$ liegt zwischen $b$ und $c$: SWS, das Dreieck ist eindeutig. 1. Zeichne $[AB]$ mit $c = 6\,\text{cm}$. 2. Trage in $A$ den Winkel $\alpha = 50°$ an. 3. Zeichne den freien Schenkel. 4. Der Kreis um $A$ mit $r = 4{,}5\,\text{cm}$ schneidet ihn in $C$. 5. Verbinde $C$ mit $B$. Man misst $a \approx 4{,}6\,\text{cm}$, $\beta \approx 48°$, $\gamma \approx 82°$; Probe: $50° + 48° + 82° = 180°$. [Lösung zeigen](?cs=sws&c=6&b=4.5&al=50)

</details>

### Aufgabe 3: Seite und zwei Winkel

Konstruiere das Dreieck mit $c = 6\,\text{cm}$, $\alpha = 50°$ und $\beta = 60°$. Berechne zuerst $\gamma$, miss dann $a$ und $b$. [Aufgabe laden](?cs=wsw&c=6&al=50&be=60&meas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\gamma = 180° - 50° - 60° = 70°$. Die freien Schenkel von $\alpha$ und $\beta$ schneiden sich in $C$ (WSW). Man misst $a \approx 4{,}9\,\text{cm}$ und $b \approx 5{,}5\,\text{cm}$. [Lösung zeigen](?cs=wsw&c=6&al=50&be=60)

</details>

### Aufgabe 4: Zwei Dreiecke

Gegeben sind $c = 6\,\text{cm}$, $\alpha = 30°$ und $a = 4\,\text{cm}$. Konstruiere. Warum gibt es zwei Dreiecke? [Aufgabe laden](?cs=ssw&c=6&a=4&al=30&meas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Der Kreis um $B$ mit Radius $4\,\text{cm}$ schneidet den freien Schenkel von $\alpha$ zweimal, in $C_1$ und $C_2$. Beide Dreiecke haben die gegebenen Stücke: $b_1 \approx 7{,}8\,\text{cm}$, $\gamma_1 \approx 48{,}6°$ und $b_2 \approx 2{,}6\,\text{cm}$, $\gamma_2 \approx 131{,}4°$. Die Winkel bei $C$ ergänzen sich zu $180°$, weil das Dreieck $BC_1C_2$ gleichschenklig ist. Der Grund für zwei Lösungen: $\alpha$ liegt der **kleineren** Seite gegenüber ($a < c$) – das ist SSW, kein Kongruenzsatz. [Lösung zeigen](?cs=ssw&c=6&a=4&al=30)

</details>

### Aufgabe 5: Genau eine Lösung

Bleibe bei $c = 6\,\text{cm}$ und $\alpha = 30°$. Für welche Längen $a$ gibt es kein, genau ein oder zwei Dreiecke? Tipp: Wie weit ist $B$ vom freien Schenkel entfernt?

<details>
<summary>Lösung anzeigen</summary>

Das Lot von $B$ auf den Schenkel bildet mit $[AB]$ ein rechtwinkliges Dreieck mit $30°$ bei $A$ – ein halbes gleichseitiges Dreieck mit Seite $6\,\text{cm}$. Also ist der Abstand $h = 3\,\text{cm}$. Für $a < 3\,\text{cm}$ gibt es keine Lösung, für $a = 3\,\text{cm}$ genau eine (rechter Winkel bei $C$, $b \approx 5{,}2\,\text{cm}$), für $3\,\text{cm} < a < 6\,\text{cm}$ zwei und für $a \ge 6\,\text{cm}$ wieder genau eine. [Berührung zeigen](?cs=ssw&c=6&a=3&al=30)

</details>

### Aufgabe 6: Gleiche Winkel – gleiches Dreieck? (Knobelaufgabe)

Paul behauptet: „Wenn zwei Dreiecke in allen drei Winkeln übereinstimmen, sind sie kongruent.“ Widerlege ihn mit $\alpha = 50°$ und $\beta = 60°$. [Zeigen](?cs=www&c=4&al=50&be=60)

<details>
<summary>Lösung anzeigen</summary>

Mit $c = 4\,\text{cm}$ und mit $c = 6{,}4\,\text{cm}$ entstehen zwei Dreiecke mit $\alpha = 50°$, $\beta = 60°$ und $\gamma = 70°$. Das zweite ist $1{,}6$-mal so groß – die Dreiecke sind ähnlich, aber nicht deckungsgleich. Zu einem Kongruenzsatz gehört immer mindestens eine Seite.

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 7, Lernbereich zu Kongruenz und Dreieckskonstruktionen (LehrplanPLUS Gymnasium Bayern; genaue Bezeichnung bitte am Lehrplan prüfen). Am Beamer kann die Simulation Schritt für Schritt vorkonstruieren, während die Klasse im Heft mitzeichnet; die Zeilen der Konstruktionsbeschreibung lassen sich anschließend gemeinsam vergleichen.
- **Aufgabenmodus:** Mit „Fehlende Stücke messen“ aus (`meas=0`) beginnt die Konstruktion auf leerem Blatt, Messwerte und Urteil bleiben verdeckt. So konstruieren die Lernenden zuerst selbst und vergleichen dann mit „Nächster Schritt“.
- **Modell:** Konstruiert wird immer von der Grundseite $[AB]$ aus, $C$ liegt oberhalb; der Schnittpunkt unterhalb liefert ein gespiegeltes, also kongruentes Dreieck. Längen werden auf $0{,}1\,\text{cm}$, Winkel auf $1°$ eingestellt, gemessene Stücke erscheinen mit „≈“.
- **Häufige Stolpersteine:**
  - Die Planfigur wird weggelassen oder die Stücke werden falsch zugeordnet (z. B. $a$ an die falsche Seite).
  - Bei SWS wird ein Winkel genommen, der **nicht** zwischen den beiden Seiten liegt – das ist dann SSW.
  - Bei SSW wird nur eine der beiden Lösungen gezeichnet.
  - „Drei Winkel legen ein Dreieck fest.“ – Sie legen nur die Form fest, nicht die Größe.
  - Beim Antragen von $\beta$ wird das Geodreieck an der falschen Seite angelegt oder die falsche Skala abgelesen.
