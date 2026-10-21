---
description: "Interaktive Simulation für die 9. Klasse: Strahlensätze an V- und X-Figur entdecken – die Parallele gleitet von AB nach A′B′, farbige Maßstäbe zeigen den gemeinsamen Faktor k, ohne Parallelen zerfallen die Verhältnisse. Dazu unbekannte Strecken Schritt für Schritt berechnen und zwei Anwendungen: Baumhöhe über den Schatten und die Breite eines Teichs."
---

## Worum geht es?

Zwei Strahlen mit gemeinsamem Anfangspunkt $Z$ werden von zwei **parallelen** Geraden geschnitten: auf dem ersten Strahl in $A$ und $A'$, auf dem zweiten in $B$ und $B'$. Dann gelten die **Strahlensätze**.

**1. Strahlensatz:** Die Abschnitte auf dem einen Strahl verhalten sich wie die entsprechenden Abschnitte auf dem anderen Strahl:

$$
\frac{\overline{ZA'}}{\overline{ZA}} = \frac{\overline{ZB'}}{\overline{ZB}} \qquad \text{und ebenso} \qquad \frac{\overline{ZA}}{\overline{AA'}} = \frac{\overline{ZB}}{\overline{BB'}}
$$

**2. Strahlensatz:** Die Abschnitte auf den Parallelen verhalten sich wie die zugehörigen, **von $Z$ aus** gemessenen Abschnitte auf einem Strahl:

$$
\frac{\overline{A'B'}}{\overline{AB}} = \frac{\overline{ZA'}}{\overline{ZA}}
$$

Die „Abschnitte“-Form ($\overline{ZA} : \overline{AA'}$) gilt nur für die Strecken auf den Strahlen, **nicht** für die Parallelen.

Der gemeinsame Wert ist der **Streckfaktor** $k$. Das Dreieck $ZA'B'$ entsteht aus $ZAB$ durch eine **zentrische Streckung** mit Zentrum $Z$: Beide Dreiecke sind **ähnlich** – gleiche Winkel, alle Seiten mal $k$. Bei $k > 1$ wird vergrößert, bei $0 < k < 1$ verkleinert, bei $k = 1$ fallen die Parallelen zusammen.

Liegen die Parallelen auf verschiedenen Seiten von $Z$, entsteht die **X-Figur**. Die Strahlensätze gelten dort genauso, man misst immer von $Z$ aus. In der Simulation wird der Streckfaktor dann negativ angezeigt ($k < 0$: „andere Seite von $Z$“); in den Verhältnissen stehen Längen, also $|k|$.

**Ohne Parallelen geht es nicht:** Sind $AB$ und $A'B'$ nicht parallel, sind die Verhältnisse verschieden. Umgekehrt gilt die **Umkehrung des 1. Strahlensatzes:** Ist $\overline{ZA'} : \overline{ZA} = \overline{ZB'} : \overline{ZB}$ (und liegen $A'$ und $B'$ entweder beide auf derselben Seite von $Z$ wie $A$ und $B$ oder beide auf der anderen), dann ist $AB \parallel A'B'$. Die **Umkehrung des 2. Strahlensatzes gilt nicht**: Es kann einen zweiten Punkt $B''$ geben, für den ebenfalls $\overline{A'B''} : \overline{AB} = k$ ist, obwohl $A'B''$ nicht parallel zu $AB$ ist.

**Rechnen mit einer Unbekannten:** Man stellt eine Verhältnisgleichung auf – am besten mit der Unbekannten $x$ im Zähler – und löst sie durch Multiplizieren, z. B. $\frac{x}{\overline{ZB}} = \frac{\overline{ZA'}}{\overline{ZA}} \Rightarrow x = \frac{\overline{ZA'} \cdot \overline{ZB}}{\overline{ZA}}$.

## Ausprobieren

1. Drücke **„Parallele verschieben“**: Die Parallele gleitet von $AB$ nach $A'B'$. Beobachte die farbigen Maßstäbe rechts – alle drei Verhältnisse zählen gemeinsam hoch. Was bedeuten die Teilstriche in den dicken Balken?
2. Ziehe $A'$ und drehe den ersten Strahl am Griff außen. Probiere [$k = 0{,}5$](?k=0.5&a=6&b=7), [$k = 1$](?k=1), [einen sehr spitzen](?th=10&k=3&a=8&b=8) und [einen stumpfen Winkel](?th=150&k=0.5&a=5&b=3). Ändern sich die Verhältnisse?
3. [X-Figur](?mode=x&a=4&b=5&k=0.75): Drücke „Parallele verschieben“ – die Parallele wandert durch $Z$ hindurch auf die andere Seite.
4. Vergleiche in der Karte „1. Strahlensatz“ die beiden Abschnitte-Balken: Wann liegen die Trennstriche genau übereinander? Lies in der Karte „2. Strahlensatz“ nach, warum man dort nicht mit $\overline{AA'}$ rechnen darf.
5. [Nicht parallel](?par=0&kb=1.4): Welche Balken passen nicht mehr? Drücke „B′ angleichen (Umkehrung)“. Was passiert mit $A'B'$? Was zeigt der gestrichelte Kreis um $A'$ mit dem Punkt $B''$?
6. [Unbekannte Strecke x](?mode=calc&ask=bb2&a=2.5&b=3&c=2&k=2.4): Wähle verschiedene gesuchte Strecken und lass dir die Lösung „Schritt für Schritt“ zeigen.
7. [Baumhöhe](?mode=baum&ht=12&st=1.5&el=36.87): Spiele die Messung durch und ziehe dann die Sonne. Was passiert bei [45° Sonnenhöhe](?mode=baum&el=45)?
8. [Teichbreite](?mode=teich&w=24&kt=4): Ziehe $A'$ näher an $Z$. Warum wird $\overline{A'B'}$ kürzer, die berechnete Breite aber nicht?

## Aufgaben

### Aufgabe 1: Fehlende Länge (1. Strahlensatz)

In einer V-Figur mit $AB \parallel A'B'$ ist $\overline{ZA} = 3\,\text{cm}$, $\overline{ZA'} = 6\,\text{cm}$ und $\overline{ZB} = 4\,\text{cm}$. Berechne $\overline{ZB'}$. [Aufgabe laden](?mode=calc&ask=zb2&a=3&b=4&c=2.6&k=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{x}{4\,\text{cm}} = \frac{6\,\text{cm}}{3\,\text{cm}} = 2$, also $x = \overline{ZB'} = 8\,\text{cm}$. [Lösung zeigen](?mode=calc&ask=zb2&a=3&b=4&c=2.6&k=2)

</details>

### Aufgabe 2: Mit Abschnitten rechnen

Gegeben sind $\overline{ZA} = 2{,}5\,\text{cm}$, $\overline{AA'} = 3{,}5\,\text{cm}$ und $\overline{ZB} = 3\,\text{cm}$ ($AB \parallel A'B'$, V-Figur). Wie lang ist $\overline{BB'}$? [Aufgabe laden](?mode=calc&ask=bb2&a=2.5&b=3&c=2&k=2.4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{x}{3\,\text{cm}} = \frac{3{,}5\,\text{cm}}{2{,}5\,\text{cm}} = 1{,}4$, also $x = \frac{3{,}5 \cdot 3}{2{,}5}\,\text{cm} = 4{,}2\,\text{cm}$. Probe: $2{,}5 : 3{,}5 = 3 : 4{,}2$ (beide $\approx 0{,}714$). [Lösung zeigen](?mode=calc&ask=bb2&a=2.5&b=3&c=2&k=2.4)

</details>

### Aufgabe 3: Der 2. Strahlensatz

Es ist $\overline{ZA} = 4\,\text{cm}$, $\overline{ZA'} = 10\,\text{cm}$ und $\overline{AB} = 3\,\text{cm}$. Berechne $\overline{A'B'}$. Warum wäre $\frac{\overline{A'B'}}{\overline{AB}} = \frac{\overline{AA'}}{\overline{ZA}}$ falsch? [Aufgabe laden](?mode=calc&ask=a2b2&a=4&b=5&c=3&k=2.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{x}{3\,\text{cm}} = \frac{10\,\text{cm}}{4\,\text{cm}} = 2{,}5$, also $\overline{A'B'} = 7{,}5\,\text{cm}$. Mit $\frac{\overline{AA'}}{\overline{ZA}} = \frac{6}{4} = 1{,}5$ käme $4{,}5\,\text{cm}$ heraus – im 2. Strahlensatz muss man von $Z$ aus messen. [Lösung zeigen](?mode=calc&ask=a2b2&a=4&b=5&c=3&k=2.5)

</details>

### Aufgabe 4: Unbekannte im Nenner

In derselben Figur ist $\overline{ZB} = 5\,\text{cm}$, $\overline{ZB'} = 12{,}5\,\text{cm}$ und $\overline{A'B'} = 7{,}5\,\text{cm}$. Bestimme $\overline{AB}$. [Aufgabe laden](?mode=calc&ask=ab&a=4&b=5&c=3&k=2.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Unbekannte in den Zähler: $\frac{x}{7{,}5\,\text{cm}} = \frac{5\,\text{cm}}{12{,}5\,\text{cm}} = 0{,}4$, also $\overline{AB} = 3\,\text{cm}$. [Zeigen](?mode=calc&ask=ab&a=4&b=5&c=3&k=2.5)

</details>

### Aufgabe 5: Wie hoch ist der Baum?

Ein Stab ist $1{,}5\,\text{m}$ lang und wird so aufgestellt, dass die Spitzen seines Schattens und des Baumschattens zusammenfallen. Der Stab steht $2\,\text{m}$, der Baum $16\,\text{m}$ von der Schattenspitze entfernt. Berechne die Höhe des Baums. [Aufgabe laden](?mode=baum&ht=12&st=1.5&el=36.87&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{h}{1{,}5\,\text{m}} = \frac{16\,\text{m}}{2\,\text{m}} = 8$, also $h = 12\,\text{m}$. Sonnenstrahlen sind (nahezu) parallel, Stab und Baum stehen senkrecht und sind deshalb parallel zueinander. [Lösung zeigen](?mode=baum&ht=12&st=1.5&el=36.87)

</details>

### Aufgabe 6: Über den Teich

Zur Breite $\overline{AB}$ eines Teichs wird eine X-Figur abgesteckt mit $\overline{ZA'} = \frac14\,\overline{ZA}$ und $\overline{ZB'} = \frac14\,\overline{ZB}$. Gemessen wird $\overline{A'B'} = 6\,\text{m}$. Wie breit ist der Teich, und warum ist $A'B'$ automatisch parallel zu $AB$? [Aufgabe laden](?mode=teich&w=24&kt=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Verhältnisse auf beiden Geraden sind gleich ($4 : 1$), nach der Umkehrung des 1. Strahlensatzes ist $A'B' \parallel AB$. Dann gilt $\overline{AB} = 4 \cdot 6\,\text{m} = 24\,\text{m}$. [Lösung zeigen](?mode=teich&w=24&kt=4)

</details>

### Aufgabe 7: Parallel oder nicht? (Knobelaufgabe)

Es ist $\overline{ZA} = 3\,\text{cm}$, $\overline{ZA'} = 6\,\text{cm}$, $\overline{ZB} = 4\,\text{cm}$ und $\overline{ZB'} = 5{,}6\,\text{cm}$. Sind $AB$ und $A'B'$ parallel? Wo müsste $B'$ liegen? Und: Reicht es, $\overline{A'B'} = 2 \cdot \overline{AB}$ nachzumessen?

<details>
<summary>Lösung anzeigen</summary>

Nein: $\frac63 = 2$, aber $\frac{5{,}6}{4} = 1{,}4$. Für eine Parallele bräuchte man $\overline{ZB'} = 8\,\text{cm}$. Das Nachmessen von $\overline{A'B'}$ reicht nicht, weil die Umkehrung des 2. Strahlensatzes nicht gilt: Der Kreis um $A'$ mit Radius $2 \cdot \overline{AB}$ kann die Gerade $ZB$ zweimal treffen – nur einer der beiden Punkte liefert die Parallele. [Zeigen](?par=0&kb=1.4)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 9, Lernbereich zu Ähnlichkeit, zentrischer Streckung und Strahlensatz (LehrplanPLUS Gymnasium Bayern; genaue Bezeichnung bitte am Lehrplan prüfen). Die Animation „Parallele verschieben“ kann eine Vermutung anregen („Alle Verhältnisse bleiben gleich – aber nur, wenn …“), die Karten sichern sie mit Zahlen.
- **Negative Streckfaktoren:** Ob die X-Figur über $k < 0$ beschrieben wird, ist im Unterricht unterschiedlich üblich – bitte am Lehrplan prüfen. Der Regler arbeitet deshalb mit dem Verhältnis der Längen.
- **Draußen messen:** Baum- und Teichaufgabe lassen sich auf dem Schulgelände nachstellen; „Messung durchspielen“ zeigt die Reihenfolge der Schritte. Mit „Ergebnis zeigen“ aus (`show=0`) werden Rechenmodus und Anwendungen zu Übungsaufgaben.
- **Häufige Stolpersteine:**
  - Im 2. Strahlensatz wird $\overline{AA'}$ statt $\overline{ZA'}$ verwendet.
  - Die Strahlensätze werden ohne Parallelen angewendet.
  - In der X-Figur werden Strecken über $Z$ hinweg addiert.
  - Zähler und Nenner werden zwischen den Seiten der Gleichung vertauscht – hier hilft „Unbekannte in den Zähler, Zugehöriges darunter“.
  - Aus $\overline{A'B'} : \overline{AB} = k$ wird auf Parallelität geschlossen (Umkehrung des 2. Strahlensatzes gilt nicht).
