## Worum geht es?

Bei **jedem** Kreis ist der Umfang ein festes Vielfaches des Durchmessers. Dieses Verhältnis heißt **Kreiszahl** $\pi$:

$$
\pi = \frac{U}{d} \approx 3{,}14159\ldots
$$

Daraus folgen die beiden wichtigsten Kreisformeln:

$$
U = \pi \cdot d = 2\pi \cdot r \qquad A = \pi \cdot r^2
$$

**Umfang:** Rollt man ein Rad einmal ab, ist die Strecke etwas mehr als drei Durchmesser lang.

**Fläche:** Zerschneidet man den Kreis in viele Sektoren und legt sie abwechselnd nebeneinander, entsteht fast ein Rechteck. Seine Höhe ist $r$, seine Breite der halbe Umfang $\pi r$. Also ist $A = \pi r \cdot r = \pi r^2$.

**Archimedes** (um 250 v. Chr.) schloss den Kreis zwischen ein inneres und ein äußeres Vieleck ein. Mit dem 96-Eck fand er $3\frac{10}{71} < \pi < 3\frac{1}{7}$, also $3{,}1408 < \pi < 3{,}1429$.

$\pi$ ist eine **irrationale Zahl**: Ihre Dezimalstellen enden nie und wiederholen sich nicht.

### π selbst messen

Miss bei runden Gegenständen (Knopf, Dose, Tasse, CD, Teller, Uhr) den Durchmesser mit dem Lineal und den Umfang mit einem Maßband oder einem Faden. Trägt man die Messwerte in ein Diagramm ($d$ nach rechts, $U$ nach oben) ein, liegen die Punkte fast auf einer **Ursprungsgeraden**: $U$ ist **proportional** zu $d$. Die Steigung dieser Geraden ist $\pi$. Einzelne Quotienten $U : d$ weichen wegen der Messfehler etwas ab, zum Beispiel $25{,}3 : 8 \approx 3{,}16$. Die Gerade durch alle Punkte gleicht diese Fehler zum großen Teil aus.

### Rückwärts rechnen

Ist der Umfang oder die Fläche gegeben, stellt man die Formel um:

$$
d = \frac{U}{\pi} \qquad r = \sqrt{\frac{A}{\pi}}
$$

## Ausprobieren

1. Drücke **Abrollen** und vergleiche den abgerollten Umfang mit den Durchmessern darunter.
2. Wähle **Fläche** und lege die Sektoren um. Was passiert mit mehr Sektoren? [48 Sektoren](?mode=flaeche&n=48)
3. Wähle **Archimedes** und verdopple die Eckenzahl mehrmals. Wie nah kommen die Schranken an π heran? [Sechseck](?mode=archimedes)
4. **Messen im Alltag:** Wickle das Maßband vom Knopf ab und lies den Umfang ab. Mit „Nächster Gegenstand“ kommt jeweils ein Punkt ins Diagramm. Welche Steigung hat die Gerade am Ende? [Knopf](?mode=messen&obj=knopf) · [Alle sechs](?mode=messen&obj=uhr)
5. **Üben:** Berechne Umfang, Fläche, Durchmesser oder Radius, trag dein Ergebnis ein und lass es prüfen. „Neue Aufgabe“ geht weiter. [Üben](?mode=ueben&q=1)

## Aufgaben

### Aufgabe 1: Fahrradreifen

Ein Fahrradreifen hat einen Durchmesser von $70\,\text{cm}$. Wie weit kommt man mit einer Umdrehung? Wie viele Umdrehungen braucht man für $1\,\text{km}$?

<details>
<summary>Lösung anzeigen</summary>

$U = \pi \cdot 70\,\text{cm} \approx 219{,}9\,\text{cm} \approx 2{,}2\,\text{m}$. Für $1000\,\text{m}$ braucht man $1000\,\text{m} : 2{,}199\,\text{m} \approx 454{,}7$, also etwa $455$ Umdrehungen.

</details>

### Aufgabe 2: Eine große oder zwei kleine Pizzen?

Ist eine Pizza mit $30\,\text{cm}$ Durchmesser größer als zwei Pizzen mit je $20\,\text{cm}$?

<details>
<summary>Lösung anzeigen</summary>

Große Pizza: $A = \pi \cdot 15^2 \approx 707\,\text{cm}^2$. Zwei kleine: $2 \cdot \pi \cdot 10^2 \approx 628\,\text{cm}^2$. Die große Pizza ist größer – die Fläche wächst mit dem Quadrat des Radius.

</details>

### Aufgabe 3: Sektoren umlegen

Warum wird die umgelegte Figur mit mehr Sektoren immer mehr zu einem Rechteck? Welche Seitenlängen hat dieses Rechteck? [12 Sektoren](?mode=flaeche&n=12) · [48 Sektoren](?mode=flaeche&n=48)

<details>
<summary>Lösung anzeigen</summary>

Je schmaler die Sektoren, desto gerader werden die Bögen an Ober- und Unterkante und desto senkrechter die Seiten. Die Höhe ist der Radius $r$; oben und unten liegt jeweils der halbe Umfang, also die Breite $\pi r$. Damit gilt $A = \pi r \cdot r = \pi r^2$.

</details>

### Aufgabe 4: Wie Archimedes

Beim Sechseck gilt $3 < \pi < 3{,}4641$ (die Simulation zeigt diese Werte). Erkläre, warum das einbeschriebene Sechseck genau den Umfang $3d$ hat.

<details>
<summary>Lösung anzeigen</summary>

Das einbeschriebene Sechseck besteht aus sechs gleichseitigen Dreiecken mit der Seitenlänge $r$. Sein Umfang ist $6r = 3d$. Jeder Kreisbogen zwischen zwei Ecken ist länger als die Sechseckseite darunter. Also ist der Kreisumfang größer als $3d$, und es gilt $\pi > 3$. [Sechseck zeigen](?mode=archimedes)

</details>

### Aufgabe 5: Messreihe auswerten

Eine Klasse hat gemessen: Dose $d = 6{,}6\,\text{cm}$, $U = 20{,}6\,\text{cm}$; Teller $d = 26\,\text{cm}$, $U = 81{,}9\,\text{cm}$. Berechne jeweils $U : d$. Welche Messung ist vermutlich genauer, und warum? [Messreihe ansehen](?mode=messen&obj=teller)

<details>
<summary>Lösung anzeigen</summary>

Dose: $20{,}6 : 6{,}6 \approx 3{,}12$. Teller: $81{,}9 : 26 = 3{,}15$. Beide liegen nahe bei $\pi \approx 3{,}14$. Beim Teller wirkt sich ein Messfehler von einem Millimeter viel weniger aus, weil die Längen größer sind. Deshalb ist die Messung am Teller vermutlich genauer.

</details>

### Aufgabe 6: Vom Umfang zum Durchmesser

Ein Baumstamm hat einen Umfang von $1{,}5\,\text{m}$. Wie dick ist er etwa? Passt er durch ein $45\,\text{cm}$ breites Tor?

<details>
<summary>Lösung anzeigen</summary>

$d = U : \pi = 150\,\text{cm} : \pi \approx 47{,}7\,\text{cm}$. Der Stamm ist breiter als $45\,\text{cm}$ und passt nicht durch das Tor.

</details>

### Aufgabe 7: Von der Fläche zum Radius

Ein kreisrundes Beet soll $20\,\text{m}^2$ groß werden. Welchen Radius muss es haben? [Üben](?mode=ueben&q=6)

<details>
<summary>Lösung anzeigen</summary>

$r = \sqrt{A : \pi} = \sqrt{20 : \pi} \approx \sqrt{6{,}37} \approx 2{,}52\,\text{m}$.

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 8/9 (Kreis und Zylinder: Kreisumfang, Kreisfläche, Näherungen für π).
- **Drei Zugänge:** Abrollen (Umfang), Umlegen (Fläche) und Archimedes (Näherung). Alle drei Animationen werden über den Knopf unter der Bühne gestartet.
- **Selbst messen:** Erst messen die Schülerinnen und Schüler eigene Gegenstände mit Faden und Lineal, dann vergleichen sie mit der Messreihe in der Simulation. Die Ausgleichsgerade zeigt, dass $U$ proportional zu $d$ ist.
- **Üben:** Die Aufgaben sind nummeriert. Gleiche Nummer bedeutet gleiche Aufgabe – so kann die ganze Klasse dieselbe bearbeiten. Ab Aufgabe 6 ist jede zweite eine Rückwärtsaufgabe (aus $U$ den Durchmesser, aus $A$ den Radius). Gerechnet werden darf mit $\pi \approx 3{,}14$.
- **Häufige Stolpersteine:**
  - Umfang und Fläche werden verwechselt; $\pi r^2$ und $2\pi r$ werden vertauscht.
  - „π ist genau 3,14.“
  - Beim Rückwärtsrechnen wird $A : \pi$ vergessen zu radizieren, oder es wird mit dem Durchmesser statt dem Radius gerechnet.
