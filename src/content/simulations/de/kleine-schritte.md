## Worum geht es?

Für gleichmäßig beschleunigte Bewegungen gibt es fertige Formeln wie $s = \frac{1}{2} a t^2$. Ändert sich die Kraft aber dauernd – beim Fallschirmspringer wächst der Luftwiderstand mit der Geschwindigkeit, beim Federpendel ändert sich die Federkraft mit dem Ort –, helfen diese Formeln nicht mehr.

Die **Methode der kleinen Schritte** löst das Problem mit einem Trick: Man teilt die Zeit in kleine Schritte $\Delta t$ und tut so, als sei die Beschleunigung in jedem Schritt konstant.

### Die Rechenregel

Aus dem aktuellen Zustand (Ort $s$, Geschwindigkeit $v$) berechnet man:

1. die **Beschleunigung** aus der Kraft: $a = \frac{F}{m}$
2. die **neue Geschwindigkeit**: $v_\text{neu} = v + a \cdot \Delta t$
3. den **neuen Ort**: $s_\text{neu} = s + v \cdot \Delta t$
4. … und beginnt mit den neuen Werten von vorn.

Das ist genau, was eine Tabellenkalkulation Zeile für Zeile tut – oder ein Computerspiel 60-mal pro Sekunde.

### Fallschirmspringer

Für den Fall mit Luftwiderstand $F_L = k \cdot v^2$ gilt

$$
a = g - \frac{k}{m} \cdot v^2
$$

Anfangs fällt der Springer fast frei. Je schneller er wird, desto kleiner die Beschleunigung – bis Gewichtskraft und Luftwiderstand gleich groß sind. Dann fällt er mit der **Endgeschwindigkeit** $v_E = \sqrt{\frac{m g}{k}}$.

### Wie genau ist das?

Mit großen Schritten weicht die Rechnung deutlich von der genauen Lösung ab, mit kleinen Schritten kaum noch. Beim Federpendel zeigt sich ein weiterer Effekt: Rechnet man „erst Ort, dann Geschwindigkeit“ (Euler-Verfahren), schaukelt sich die Schwingung künstlich auf. Nimmt man für den Ort schon die neue Geschwindigkeit, bleibt sie stabil. Die Reihenfolge der Rechenschritte ist also wichtig.

## Ausprobieren

- [Fall, Δt = 2 s](?modell=fall&dt=2): Drücke mehrmals „Nächster Schritt“. Der rote Pfeil zeigt, wohin der nächste Schritt führt.
- [Fall, Δt = 0,2 s](?modell=fall&dt=0.2): Wie gut passt die Rechnung jetzt?
- [Feder mit Euler](?modell=feder&dt=0.2&methode=euler) und [stabil](?modell=feder&dt=0.2&methode=cromer): „Alle Schritte“ drücken und vergleichen.

## Aufgaben

**1. Von Hand rechnen.** Ein Fallschirmspringer (80 kg, $k = 0{,}25\,\tfrac{\text{kg}}{\text{m}}$) springt aus der Ruhe. Berechne mit $\Delta t = 2\,\text{s}$ die ersten zwei Schritte (Euler). [Aufgabe laden](?modell=fall&dt=2&m=80&k=0.25&_hide=1)

<details><summary>Lösung anzeigen</summary>

$t = 0$: $a = 9{,}81\,\tfrac{\text{m}}{\text{s}^2}$, $v = 0$, $s = 0$.
$t = 2\,\text{s}$: $v = 0 + 9{,}81 \cdot 2 = 19{,}62\,\tfrac{\text{m}}{\text{s}}$, $s = 0 + 0 \cdot 2 = 0$, $a = 9{,}81 - \frac{0{,}25}{80} \cdot 19{,}62^2 \approx 8{,}61\,\tfrac{\text{m}}{\text{s}^2}$.
$t = 4\,\text{s}$: $v = 19{,}62 + 8{,}61 \cdot 2 \approx 36{,}83\,\tfrac{\text{m}}{\text{s}}$, $s = 0 + 19{,}62 \cdot 2 \approx 39{,}2\,\text{m}$.

</details>

**2. Endgeschwindigkeit.** Wie schnell fällt der Springer am Ende? Warum hängt die Endgeschwindigkeit nicht von $\Delta t$ ab? [Aufgabe laden](?modell=fall&dt=0.2&_hide=1)

<details><summary>Lösung anzeigen</summary>

$v_E = \sqrt{\frac{80 \cdot 9{,}81}{0{,}25}}\,\tfrac{\text{m}}{\text{s}} \approx 56\,\tfrac{\text{m}}{\text{s}} \approx 200\,\tfrac{\text{km}}{\text{h}}$. Bei $v_E$ ist $a = 0$; dann ändert sich in keinem Schritt mehr etwas, egal wie groß er ist.

</details>

**3. Fehler und Schrittweite.** Nach 4 s ist die genaue Geschwindigkeit $33{,}9\,\tfrac{\text{m}}{\text{s}}$. Vergleiche mit $\Delta t = 2\,\text{s}$ und $\Delta t = 0{,}2\,\text{s}$. [Aufgabe laden](?modell=fall&dt=0.2&_hide=1)

<details><summary>Lösung anzeigen</summary>

Mit 2 s: $36{,}8\,\tfrac{\text{m}}{\text{s}}$ (fast 3 m/s zu viel), mit 0,2 s etwa $34{,}2\,\tfrac{\text{m}}{\text{s}}$. Zehnmal kleinere Schritte machen den Fehler etwa zehnmal kleiner. Die Rechnung überschätzt, weil sie in jedem Schritt mit der (zu großen) Anfangsbeschleunigung rechnet.

</details>

**4. Aufschaukeln.** Warum wird die Federschwingung beim Euler-Verfahren immer größer? [Aufgabe laden](?modell=feder&dt=0.2&methode=euler&_hide=1)

<details><summary>Lösung anzeigen</summary>

Der Ort wird mit der alten Geschwindigkeit weitergerechnet. Beim Ausschwingen ist die alte Geschwindigkeit immer etwas zu groß, beim Zurückschwingen ebenfalls – in jeder Periode kommt ein wenig Energie hinzu. Rechnet man den Ort mit der neuen Geschwindigkeit, gleichen sich die Fehler aus.

</details>

## Ideen für den Unterricht

- **Tabellenkalkulation:** Dieselbe Rechnung in einer Tabelle nachbauen (Spalten t, a, v, s) und mit der Simulation vergleichen.
- **Messen und Modellieren:** Einen Fall mit Kaffeefiltern filmen, die Messwerte per Videoanalyse auswerten und $k$ anpassen, bis Modell und Messung passen.
- **Vernetzung:** Dieselbe Idee steckt in Wettervorhersagen, Spiele-Physik und Raumfahrt-Bahnberechnungen.
