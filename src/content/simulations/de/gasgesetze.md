## Worum geht es?

Der Zustand einer abgeschlossenen Gasmenge wird durch drei Größen beschrieben: den **Druck** $p$, das **Volumen** $V$ und die **absolute Temperatur** $T$ (in Kelvin, $T = \vartheta + 273{,}15\,\text{K}$). Hält man eine Größe fest, hängen die beiden anderen auf einfache Weise zusammen:

| Versuch | fest | Gesetz | Diagramm |
| --- | --- | --- | --- |
| **isotherm** (Wärmebad) | $T$ | Boyle-Mariotte: $p \cdot V = \text{konstant}$ | Hyperbel im p-V-Diagramm |
| **isobar** (Gewicht auf dem Kolben) | $p$ | Gay-Lussac: $\frac{V}{T} = \text{konstant}$ | Ursprungsgerade im V-T-Diagramm |
| **isochor** (Kolben arretiert) | $V$ | Amontons: $\frac{p}{T} = \text{konstant}$ | Ursprungsgerade im p-T-Diagramm |

Alle drei sind Sonderfälle der **allgemeinen Gasgleichung** für ein ideales Gas:

$$
p \cdot V = n \cdot R \cdot T, \qquad R = 8{,}314\,\tfrac{\text{J}}{\text{mol} \cdot \text{K}}
$$

Dabei ist $n$ die **Stoffmenge** in mol. Praktisch zum Rechnen: $1\,\text{kPa} \cdot 1\,\text{L} = 1\,\text{J}$. Beispiel: $1\,\text{mol}$ Gas bei $0\,°\text{C}$ und Normdruck $101{,}325\,\text{kPa}$ nimmt

$$
V = \frac{n \cdot R \cdot T}{p} = \frac{1\,\text{mol} \cdot 8{,}314\,\frac{\text{J}}{\text{mol}\cdot\text{K}} \cdot 273{,}15\,\text{K}}{101{,}325\,\text{kPa}} \approx 22{,}4\,\text{L}
$$

ein (**molares Volumen**).

**Einheiten:** Die Simulation gibt den Druck in Kilopascal an. Es gilt $1\,\text{bar} = 100\,\text{kPa} = 1000\,\text{hPa} = 10^5\,\text{Pa}$; der normale Luftdruck beträgt etwa $1013\,\text{hPa} = 101{,}3\,\text{kPa} \approx 1\,\text{bar}$. Das Volumen steht in Litern: $1\,\text{L} = 1\,\text{dm}^3 = 10^{-3}\,\text{m}^3$. Damit ist $1\,\text{kPa} \cdot 1\,\text{L} = 10^3\,\text{Pa} \cdot 10^{-3}\,\text{m}^3 = 1\,\text{N} \cdot \text{m} = 1\,\text{J}$. Bei Boyle-Mariotte und den Verhältnisgleichungen darf man jede Einheit verwenden, solange sie auf beiden Seiten gleich ist – nur die Temperatur muss immer in Kelvin stehen.

**Linearisierung:** Eine Hyperbel ist schwer als solche zu erkennen. Trägt man $p$ über $\frac{1}{V}$ auf, liegen die Messpunkte einer isothermen Messreihe auf einer **Ursprungsgeraden** mit der Steigung $p \cdot V = n \cdot R \cdot T$.

**Absoluter Nullpunkt:** Misst man bei konstantem Druck das Volumen (oder bei konstantem Volumen den Druck) für mehrere Temperaturen und verlängert die Ausgleichsgerade nach links, trifft sie die Temperaturachse bei etwa $-273\,°\text{C}$. Dort würden Volumen bzw. Druck eines idealen Gases null. Diese Temperatur, $\vartheta = -273{,}15\,°\text{C}$ bzw. $T = 0\,\text{K}$, heißt **absoluter Nullpunkt**; tiefere Temperaturen gibt es nicht. Deshalb gelten die Gasgesetze nur mit der Kelvin-Temperatur.

**Teilchenbild:** Der Druck entsteht durch die Stöße der Teilchen an Wände und Kolben (im Bild blitzen die Stöße kurz auf). Halbes Volumen bedeutet doppelt so viele Stöße je Fläche und Zeit, also doppelten Druck. Höhere Temperatur bedeutet schnellere Teilchen: Sie stoßen häufiger **und** heftiger. Doppelte Teilchenzahl bei gleichem $V$ und $T$ ergibt doppelten Druck. Die Simulation misst den Druck auch direkt aus den Stößen der letzten Sekunden und zeigt ihn zum Vergleich mit der Formel an („aus Stößen ≈ …“). Weil es im Bild nur wenige Teilchen sind, schwankt dieser Wert um einige Prozent – bei den unvorstellbar vielen Teilchen eines echten Gases ist der Druck dagegen völlig gleichmäßig.

**Zur Darstellung:** Das Teilchenbild ist ein ebenes Modell mit wenigen Teilchen (24 je mol), stark verlangsamt. Die Teilchen sind punktförmig gedacht und stoßen nur mit den Wänden – genau das ist das Modell des **idealen Gases**. Echte Gase weichen davon bei hohem Druck und tiefer Temperatur ab (kurz vor dem Verflüssigen). Der Kolben gleitet reibungsfrei; Gewicht und äußerer Luftdruck zusammen legen beim isobaren Versuch den Druck fest. Der Druck ist immer der **absolute** Druck. Messwerte haben auf Wunsch eine kleine Messunsicherheit (etwa $\pm 1\,\%$).

## Ausprobieren

1. Ziehe den Kolben am Griff nach unten, bis das Volumen halb so groß ist. Was zeigt das Manometer? Was passiert mit dem Rechteck $p \cdot V$ im Diagramm? [Ausgangszustand](?V=22.4)
2. Starte „Messreihe automatisch“ im isothermen Versuch und wechsle danach zum p-1/V-Diagramm. [Linearisierung](?ch=pinv&V=15)
3. Erhöhe die Temperatur des Wärmebads. Wie liegt die neue Isotherme im Vergleich zu den alten? [Isotherme bei 100 °C](?T=100)
4. Wechsle zum isobaren Versuch und heize von $0\,°\text{C}$ auf $100\,°\text{C}$. Um welchen Faktor wächst das Volumen? Vergleiche mit $\frac{373{,}15\,\text{K}}{273{,}15\,\text{K}}$. [Gay-Lussac](?mode=isobar&ch=VT&T=100)
5. Nimm im isobaren oder isochoren Versuch eine automatische Messreihe auf. Wo schneidet die verlängerte Gerade die Temperaturachse? [Amontons](?mode=isochor&ch=pT)
6. Verdopple die Stoffmenge bei gleichem Volumen und gleicher Temperatur. Zähle die Teilchen und vergleiche den Druck. [Doppelte Teilchenzahl](?n=2)
7. Was passiert im isobaren Versuch, wenn der Kolben oben anstößt? Gilt dann noch $p = \text{konstant}$? [Anschlag](?mode=isobar&n=2&T=200&p=60&ch=pV)

## Aufgaben

### Aufgabe 1: Molares Volumen

Welches Volumen nimmt $1\,\text{mol}$ eines idealen Gases bei $100\,°\text{C}$ und $101{,}3\,\text{kPa}$ ein? [Aufgabe laden](?mode=isobar&ch=VT&T=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V = \frac{n R T}{p} = \frac{1 \cdot 8{,}314 \cdot 373{,}15}{101{,}3}\,\text{L} \approx 30{,}6\,\text{L}$. Ebenso über Gay-Lussac: $22{,}4\,\text{L} \cdot \frac{373{,}15\,\text{K}}{273{,}15\,\text{K}} \approx 30{,}6\,\text{L}$. Das Volumen wächst also nur um den Faktor $1{,}37$. Mit Celsius-Werten ($\frac{100}{0}$) ließe sich gar nicht rechnen. [In der Simulation zeigen](?mode=isobar&ch=VT&T=100)

</details>

### Aufgabe 2: Kolben hineindrücken

$1\,\text{mol}$ Gas hat bei $0\,°\text{C}$ das Volumen $30\,\text{L}$. Der Kolben wird langsam (isotherm) auf $15\,\text{L}$ gedrückt. Berechne den Druck vorher und nachher. [Aufgabe laden](?V=30&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$p_1 = \frac{n R T}{V_1} = \frac{8{,}314 \cdot 273{,}15}{30}\,\text{kPa} \approx 75{,}7\,\text{kPa}$; nach Boyle-Mariotte $p_2 = p_1 \cdot \frac{V_1}{V_2} = 2 \cdot p_1 \approx 151{,}4\,\text{kPa}$. [In der Simulation zeigen](?V=15)

</details>

### Aufgabe 3: Autoreifen

Ein Reifen hat bei $10\,°\text{C}$ einen (absoluten) Druck von $250\,\text{kPa}$. Nach einer langen Fahrt in der Sonne ist er $50\,°\text{C}$ warm. Das Volumen ändert sich kaum. Wie groß ist der Druck jetzt? [Aufgabe laden](?mode=isochor&ch=pT&T=10&n=1.2&V=11.3&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Isochor: $\frac{p_2}{T_2} = \frac{p_1}{T_1}$, also $p_2 = 250\,\text{kPa} \cdot \frac{323{,}15\,\text{K}}{283{,}15\,\text{K}} \approx 285\,\text{kPa}$ – rund $14\,\%$ mehr. Mit Celsius-Werten ($\frac{50}{10}$) käme fälschlich das Fünffache heraus. [In der Simulation zeigen](?mode=isochor&ch=pT&T=50&n=1.2&V=11.3)

</details>

### Aufgabe 4: Messreihe auswerten

Nimm im isochoren Versuch eine automatische Messreihe auf. Lies aus der Ausgleichsgeraden ab, bei welcher Temperatur der Druck null würde, und begründe, warum das Ergebnis nicht genau $-273{,}15\,°\text{C}$ ist. [Aufgabe laden](?mode=isochor&ch=pT&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Gerade schneidet die ϑ-Achse in der Nähe von $-273\,°\text{C}$ (Anzeige unter „Auswertung“). Die Messwerte streuen um etwa $1\,\%$; weil man weit über den Messbereich ($-50\,°\text{C}$ bis $250\,°\text{C}$) hinaus verlängert, wirken sich kleine Fehler in der Steigung stark aus. Ohne Messunsicherheit ergibt sich genau $-273{,}15\,°\text{C}$. [Ohne Messunsicherheit](?mode=isochor&ch=pT&noise=0)

</details>

### Aufgabe 5: Stoffmenge bestimmen

In einem Gefäß mit $20\,\text{L}$ herrschen bei $27\,°\text{C}$ $150\,\text{kPa}$. Wie viel mol Gas sind darin, und wie viele Teilchen sind das?

<details>
<summary>Lösung anzeigen</summary>

$n = \frac{p V}{R T} = \frac{150 \cdot 20}{8{,}314 \cdot 300{,}15}\,\text{mol} \approx 1{,}2\,\text{mol}$; $N = n \cdot N_\text{A} \approx 1{,}2 \cdot 6{,}02 \cdot 10^{23} \approx 7{,}2 \cdot 10^{23}$. [Prüfen](?n=1.2&T=27&V=20)

</details>

### Aufgabe 6: Spritze zuhalten

Eine Spritze enthält $60\,\text{mL}$ Luft bei $1013\,\text{hPa}$. Du hältst die Öffnung zu und drückst den Kolben langsam (isotherm) auf $20\,\text{mL}$ zusammen. Wie groß ist der Druck jetzt? Gib ihn in hPa, kPa und bar an.

<details>
<summary>Lösung anzeigen</summary>

Boyle-Mariotte: $p_2 = p_1 \cdot \frac{V_1}{V_2} = 1013\,\text{hPa} \cdot \frac{60\,\text{mL}}{20\,\text{mL}} = 3039\,\text{hPa} \approx 304\,\text{kPa} \approx 3{,}0\,\text{bar}$. Das Volumen muss dazu nicht in Liter umgerechnet werden, weil nur das Verhältnis zählt. In der Simulation kannst du dasselbe Verhältnis ausprobieren: Drücke den Kolben von $30\,\text{L}$ auf $10\,\text{L}$ – der Druck verdreifacht sich. [Bei 30 L starten](?V=30)

</details>

## Ideen für den Unterricht

- **Einsatz:** Gasgesetze in der Mittelstufe (Wärmelehre) oder wiederholend in der Oberstufe bzw. im Chemieunterricht (molares Volumen, Stoffmenge); die genaue Zuordnung unterscheidet sich je nach Lehrplan. Gut als Ergänzung zu Realversuchen mit Kolbenprober, Gasthermometer oder Spritze und Manometer.
- **Vorhersagen lassen:** „Was zeigt das Manometer, wenn wir das Volumen halbieren?“ oder „Wie groß wird das Volumen bei $100\,°\text{C}$?“ – viele erwarten bei der zweiten Frage zunächst eine Verdopplung oder mehr.
- **Messreihe wie im Praktikum:** Messwerte einzeln aufnehmen, Tabelle abschreiben, selbst ein Diagramm zeichnen und die Gerade verlängern; danach mit der Simulation vergleichen. Die Messunsicherheit lässt sich ein- und ausschalten.
- **Teilchenbild und Formel verbinden:** Die Anzeige „aus Stößen“ macht sichtbar, dass der Druck nichts anderes ist als die Wirkung vieler Teilchenstöße.
- **Häufige Stolpersteine:**
  - Rechnen mit Celsius statt Kelvin – dann ergeben „doppelte Temperatur“ und Verhältnisse keinen Sinn.
  - „Bei $-273\,°\text{C}$ verschwindet das Gas.“ – Die Gerade ist eine Extrapolation des idealen Gases; echte Gase werden vorher flüssig.
  - Überdruck (Reifenmanometer) und absoluter Druck werden verwechselt.
  - „Beim Zusammendrücken werden die Teilchen kleiner.“ – Nur der Abstand und damit die Zahl der Stöße je Fläche ändert sich.
  - Die isotherme Kurve wird für eine fallende Gerade gehalten – die Linearisierung p über 1/V klärt das.
- **Bezug zum Lehrplan:** Zusammenhang von Druck, Volumen und Temperatur bei Gasen, Kelvin-Skala und absoluter Nullpunkt, Teilchenmodell des Drucks; Auswertung von Messreihen durch Linearisierung. Die allgemeine Gasgleichung mit Stoffmenge ist eher Oberstufen- bzw. Chemiestoff.
