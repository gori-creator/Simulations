---
description: "Interaktive Simulation für die 13. Klasse: das Integral als Gesamtänderung – aus der Geschwindigkeit den Weg, aus der Zuflussrate die Füllmenge rekonstruieren, mit Rechtecksummen (links, rechts, Mitte), gestapelten Streifen, Fehlerdiagramm, Extremstellen des Bestands und einer selbst gezeichneten Rate."
---

## Worum geht es?

Oft kennt man nicht eine Größe selbst, sondern wie schnell sie sich ändert: die **Geschwindigkeit** eines Autos, die **Zuflussrate** in einen Tank. Wie groß ist dann die Gesamtänderung?

Ist die Rate konstant, rechnet man einfach „Rate mal Zeit“: $20\,\tfrac{\text{m}}{\text{s}} \cdot 30\,\text{s} = 600\,\text{m}$ – das ist die Fläche eines Rechtecks unter dem Graphen. Ändert sich die Rate, zerlegt man die Zeit in $n$ Abschnitte der Länge $\Delta t$ und addiert $r(t_i) \cdot \Delta t$. Die Stelle $t_i$ kann am **linken Rand**, am **rechten Rand** oder in der **Mitte** des Streifens liegen. Im Grenzfall $n \to \infty$ wird daraus das Integral:

$$B(t) = B(0) + \int_0^t r(u)\,du.$$

Die **Fläche unter dem Graphen der Änderungsrate** ist also die **Gesamtänderung** des Bestands. Flächen unterhalb der Zeitachse (Wasser fließt ab) zählen **negativ** – der Bestand nimmt ab.

**Rechtecke stapeln:** Die Simulation trägt jeden Streifen $r(t_i) \cdot \Delta t$ nacheinander als Zuwachs in den Bestand ein. So entsteht unten eine „Treppe“, die sich mit wachsendem $n$ an den Graphen von $B$ anschmiegt. Das Fehlerdiagramm zeigt: Bei doppelt so vielen Streifen halbiert sich der Fehler der linken und rechten Summe etwa, bei der Mittelpunktsumme wird er etwa ein Viertel so groß.

**Rate und Bestand hängen zusammen:** Die Steigung von $B$ ist die Rate, $B'(t) = r(t)$ (Hauptsatz). Wo $r$ das Vorzeichen von $+$ nach $-$ wechselt, hat der Bestand ein **Maximum**; bei einem Wechsel von $-$ nach $+$ ein **Minimum**. Die Simulation zeichnet dazu die Tangente mit Steigung $r(t)$ ein.

*Beispiel Auto:* $10\,\text{s}$ gleichmäßig beschleunigen auf $20\,\tfrac{\text{m}}{\text{s}}$ (Dreieck: $100\,\text{m}$), $30\,\text{s}$ konstant ($600\,\text{m}$), $10\,\text{s}$ bremsen ($100\,\text{m}$) – zusammen $800\,\text{m}$.

## Ausprobieren

1. [Autofahrt](?sit=car&t=25): Drücke „Ablauf abspielen“ und beobachte, wie die Fläche oben und der Weg unten wachsen. Wann ist der Weg-Graph am steilsten?
2. [Rechtecke](?sit=car&t=25&n=5): Drücke „Rechtecke stapeln“. Wie wird aus jedem Rechteck oben eine Stufe unten? Drücke dann mehrmals „Streifen verdoppeln“ und beobachte das Fehlerdiagramm.
3. [Links, rechts, Mitte](?sit=tank&t=20&n=2&rule=l): Stelle die Höhe der Rechtecke auf „rechter Rand“ und „Mitte“. Warum ist die Mittelpunktsumme hier sogar exakt?
4. [Wassertank](?sit=tank&t=30&v0=30): Ab wann fließt Wasser ab? Wann ist der Tank am vollsten – und was passiert dort mit der Rate?
5. [Eigene Zuflussrate](?sit=own&t=40&v0=30): Ziehe die fünf Punkte. Erzeuge eine Rate, bei der der Tank am Ende genauso voll ist wie am Anfang. Kannst du den Tank leerlaufen lassen?
6. [Radfahrt](?sit=bike&t=90): Warum steigt der Weg immer, obwohl die Geschwindigkeit schwankt?

## Aufgaben

### Aufgabe 1: Weg berechnen

Wie weit ist das Auto nach $25\,\text{s}$ gefahren? [Aufgabe laden](?sit=car&t=25&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Dreieck bis $10\,\text{s}$: $\frac{1}{2} \cdot 10 \cdot 20 = 100\,\text{m}$; dann $15\,\text{s}$ mit $20\,\tfrac{\text{m}}{\text{s}}$: $300\,\text{m}$. Zusammen $400\,\text{m}$. [Lösung zeigen](?sit=car&t=25)

</details>

### Aufgabe 2: Wassertank

Die Zuflussrate ist $r(t) = 4 - 0{,}2t$ (in L/min), zu Beginn sind $30\,\text{L}$ im Tank. Wie viel Wasser ist nach $30$ Minuten im Tank? Wann ist er am vollsten? [Aufgabe laden](?sit=tank&t=30&v0=30&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V(30) = 30 + \int_0^{30}(4 - 0{,}2u)\,du = 30 + [4u - 0{,}1u^2]_0^{30} = 30 + 30 = 60\,\text{L}$. Am vollsten, wo $r$ von $+$ nach $-$ wechselt: $r(t) = 0 \iff t = 20$, also $V(20) = 30 + 40 = 70\,\text{L}$. Die Fläche setzt sich aus $+40\,\text{L}$ (Zufluss bis $20$ min) und $-10\,\text{L}$ (Abfluss danach) zusammen. [Lösung zeigen](?sit=tank&t=30&v0=30)

</details>

### Aufgabe 3: Rechtecksummen vergleichen

Schätze den Weg des Autos nach $25\,\text{s}$ mit $5$ Streifen, einmal mit der Höhe am linken und einmal am rechten Rand. Wo liegt der exakte Wert? [Aufgabe laden](?sit=car&t=25&n=5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta t = 5\,\text{s}$. Links: $v(0), v(5), \ldots, v(20) = 0, 10, 20, 20, 20$, also $5 \cdot 70 = 350\,\text{m}$. Rechts: $v(5), \ldots, v(25) = 10, 20, 20, 20, 20$, also $5 \cdot 90 = 450\,\text{m}$. Der exakte Weg $400\,\text{m}$ liegt dazwischen, weil $v$ hier nie abnimmt. [Lösung zeigen](?sit=car&t=25&n=5)

</details>

### Aufgabe 4: Fehler halbieren

Für den Tank bis $t = 20$ (exakt $40\,\text{L}$ Zufluss) gilt: Die linke Summe mit $4$ Streifen ergibt $50\,\text{L}$. Wie groß ist der Fehler mit $8$ und mit $16$ Streifen? [Aufgabe laden](?sit=tank&t=20&n=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Fehler $10\,\text{L}$, dann $5\,\text{L}$, dann $2{,}5\,\text{L}$: Bei einer linearen Rate halbiert sich der Fehler genau: Jeder Streifen enthält ein Dreieck zu viel. Halbiert man $\Delta t$, haben diese Dreiecke halbe Breite und halbe Höhe, also ein Viertel der Fläche – es gibt aber doppelt so viele. [Lösung zeigen](?sit=tank&t=20&n=16)

</details>

### Aufgabe 5: Maximum und Minimum

Die Zuflussrate verläuft geradlinig durch die Punkte $(0 \mid 2)$, $(10 \mid 4)$, $(20 \mid 0)$, $(30 \mid -3)$ und $(40 \mid 1)$ (Zeit in min, Rate in L/min); am Anfang sind $30\,\text{L}$ im Tank. Wann ist der Tank am vollsten, wann (zwischendurch) am leersten? Wie viel ist am Ende drin? [Aufgabe laden](?sit=own&t=40&v0=30&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Trapez- und Dreiecksflächen: $0$–$10$: $30\,\text{L}$, $10$–$20$: $20\,\text{L}$, $20$–$30$: $-15\,\text{L}$. Zwischen $30$ und $40$ wechselt $r$ bei $t = 37{,}5$ von $-$ nach $+$: $-11{,}25\,\text{L}$ und $+1{,}25\,\text{L}$. Maximum bei $t = 20$: $V = 80\,\text{L}$; Minimum bei $t = 37{,}5$: $V = 53{,}75\,\text{L}$; am Ende $V(40) = 55\,\text{L}$. [Lösung zeigen](?sit=own&t=40&v0=30)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 13 (Integral als Rekonstruktion eines Bestands aus der Änderungsrate), LehrplanPLUS Gymnasium Bayern.
- **Vom Rechteck zum Integral:** Mit „Rechtecke stapeln“ und „Streifen verdoppeln“ den Grenzübergang $n \to \infty$ vorführen; das Fehlerdiagramm macht ihn messbar.
- **Physik-Bezug:** $s(t)$ aus $v(t)$ – wie im $t$-$v$-Diagramm der Mechanik.
- **Eigene Daten:** Geschwindigkeiten einer Fahrradfahrt (Smartphone-App) in eine Tabelle übertragen und den Weg mit Rechtecksummen schätzen.
- **Partnerarbeit mit der eigenen Rate:** Eine Person zeichnet eine Rate und nennt nur $V(0)$, die andere skizziert den Bestand – dann mit „Werte zeigen“ prüfen.
- **Häufige Stolpersteine:**
  - Der Funktionswert der Rate wird als Bestand gelesen (Geschwindigkeit ≠ Weg).
  - Negative Raten werden als positive Flächen gezählt.
  - Das Maximum des Bestands wird beim Maximum der Rate gesucht statt bei ihrem Vorzeichenwechsel.
  - Der Anfangsbestand $B(0)$ wird vergessen.
