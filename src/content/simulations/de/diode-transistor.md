---
description: "Kennlinie einer Diode aufnehmen, den pn-Übergang im Teilchenmodell sehen, Wechselspannung gleichrichten und den Transistor als Schalter und Verstärker einsetzen."
---

## Worum geht es?

**Halbleiter** wie Silizium leiten schlecht, lassen sich aber durch **Dotierung** gezielt verändern: Wenige Fremdatome mit fünf Außenelektronen (z. B. Phosphor) liefern frei bewegliche **Elektronen** (n-Dotierung), Fremdatome mit drei Außenelektronen (z. B. Bor) erzeugen **Löcher**, die sich wie positive Ladungen bewegen (p-Dotierung). Wo beide Gebiete aneinandergrenzen, rekombinieren Elektronen und Löcher. Zurück bleibt die **Sperrschicht** mit ortsfesten, geladenen Ionen – fast ohne bewegliche Ladungsträger.

Eine **Diode** ist ein solcher pn-Übergang. In **Durchlassrichtung** (Plus am p-Gebiet) wird die Sperrschicht abgebaut, der Strom steigt exponentiell. In **Sperrrichtung** wird sie breiter, es fließt nur ein winziger Sperrstrom. Die Kennlinie beschreibt die **Shockley-Gleichung**

$$
I = I_S \cdot \left(e^{\,U/(n \cdot U_T)} - 1\right), \qquad U_T = \frac{k \cdot T}{e} \approx 25{,}85\,\text{mV} \ (\text{bei } 300\,\text{K})
$$

mit dem Sättigungsstrom $I_S$ und dem Emissionskoeffizienten $n$. Je $n \cdot U_T \cdot \ln 10 \approx 60\,\text{mV}$ mehr Spannung fließt zehnmal so viel Strom (bei $n = 1$). In Sperrrichtung gilt $I \approx -I_S$.

- **Schleusenspannung $U_S$:** Ab etwa dieser Spannung fließt merklich Strom. In der Simulation ist sie als Spannung bei $10\,\text{mA}$ festgelegt: Silizium $\approx 0{,}65\,\text{V}$, Germanium $\approx 0{,}30\,\text{V}$.
- **Leuchtdioden (LEDs)** senden beim Rekombinieren Licht aus. Die Schwellspannung hängt von der Farbe ab: $e \cdot U_S \approx h \cdot f = \frac{h \cdot c}{\lambda}$. Blaue LEDs brauchen mehr Spannung als rote.
- **Gleichrichter:** Eine Diode lässt nur eine Halbwelle durch (Einweg), vier Dioden in Brückenschaltung nutzen beide. Der Spitzenwert sinkt um die Durchlassspannung $U_F \approx 0{,}7\,\text{V}$ je leitender Diode: $\hat u_\text{aus} = \hat U - U_F$ bzw. $\hat U - 2\,U_F$. Ein **Glättungskondensator** hält die Spannung zwischen den Spitzen hoch; übrig bleibt eine kleine **Brummspannung** $\Delta U \approx \frac{I}{f_B \cdot C}$.
- **Transistor (npn):** Ein kleiner Basisstrom $I_B$ steuert einen großen Kollektorstrom $I_C = B \cdot I_B$ (Stromverstärkung $B$, typisch 100 bis 500). Mehr als $I_{C,\max} = \frac{U_B - U_{CE,\text{sat}}}{R_C}$ lässt der Lastwiderstand nicht zu: Der Transistor ist dann **gesättigt** und arbeitet als geschlossener **Schalter**. Im linearen Bereich dazwischen **verstärkt** er.

**Zur Darstellung:** Die blauen Punkte in den Leitungen sind Elektronen (gegen die technische Stromrichtung, Tempo logarithmisch zur Stromstärke). Die Bauteilwerte sind typische Modellwerte; echte Dioden haben z. B. einen größeren Sperrstrom und einen Bahnwiderstand.

## Ausprobieren

1. Nimm die Kennlinie der Siliziumdiode auf: Spannung in kleinen Schritten erhöhen und jeweils „Messwert aufnehmen“ drücken – oder „Messreihe automatisch“. Ab welcher Spannung steigt der Strom steil an? [Siliziumdiode](?mode=diode&d=si)
2. Tippe die Diode im Bild an. Was zeigen die Messgeräte in Sperrrichtung? [Sperrrichtung](?mode=diode&flip=1&U=5)
3. Vergleiche Silizium und Germanium. [Germanium](?mode=diode&d=ge&U=1)
4. Blende die Arbeitsgerade ein und ändere den Vorwiderstand. Der Arbeitspunkt liegt immer im Schnittpunkt. [Arbeitsgerade](?mode=diode&line=1&U=3)
5. Sieh dir den pn-Übergang an und pole die Batterie um. Wie verändert sich die Sperrschicht? [pn-Übergang](?mode=pn&U=1.5)
6. Erhöhe die Spannung an den vier LEDs langsam. In welcher Reihenfolge leuchten sie auf? [LEDs](?mode=led&U=2.2)
7. Vergleiche Einweg- und Brückengleichrichter auf dem Oszilloskop und schalte den Kondensator zu. [Brücke mit Glättung](?mode=rect&rc=bridge&cap=1)
8. Mache es am Himmel des Dämmerungsschalters langsam dunkel. Wann geht die Lampe an? [Dämmerungsschalter](?mode=switch&bs=ldr&E=80)
9. Ziehe beim Verstärker den Arbeitspunkt nach rechts, bis das Ausgangssignal oben abgeschnitten wird. [Verstärker](?mode=amp)

## Aufgaben

### Aufgabe 1: Temperaturspannung

Berechne $U_T = \frac{k \cdot T}{e}$ für $T = 300\,\text{K}$ und für $T = 330\,\text{K}$ ($k = 1{,}381 \cdot 10^{-23}\,\text{J/K}$, $e = 1{,}602 \cdot 10^{-19}\,\text{C}$).

<details>
<summary>Lösung anzeigen</summary>

$U_T(300\,\text{K}) = \frac{1{,}381 \cdot 10^{-23} \cdot 300}{1{,}602 \cdot 10^{-19}}\,\text{V} \approx 25{,}85\,\text{mV}$, $U_T(330\,\text{K}) \approx 28{,}44\,\text{mV}$. Wärmer heißt: flachere Kennlinie, bei gleicher Spannung aber deutlich mehr Strom, weil $I_S$ stark mit der Temperatur wächst.

</details>

### Aufgabe 2: Zehnfacher Strom

Die Siliziumdiode der Simulation ($I_S = 10^{-13}\,\text{A}$, $n = 1$) führt bei $0{,}60\,\text{V}$ etwa $1{,}2\,\text{mA}$. Welcher Strom fließt bei $0{,}66\,\text{V}$? Welche Spannung braucht man am Netzgerät mit $R = 100\,\Omega$? [Aufgabe laden](?mode=diode&U=1.88&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{I(0{,}66\,\text{V})}{I(0{,}60\,\text{V})} = e^{0{,}06/0{,}02585} \approx 10{,}2$, also $I \approx 12{,}2\,\text{mA}$. Am Netzgerät: $U_0 = U_D + I \cdot R = 0{,}66\,\text{V} + 12{,}2\,\text{mA} \cdot 100\,\Omega \approx 1{,}88\,\text{V}$. [In der Simulation zeigen](?mode=diode&U=1.88)

</details>

### Aufgabe 3: Gleichrichter

Ein Transformator liefert $\hat U = 12\,\text{V}$. Bestimme den Spitzenwert der Ausgangsspannung für Einweg- und Brückengleichrichter ($U_F = 0{,}7\,\text{V}$). Warum ist der Mittelwert bei der Brücke fast doppelt so groß? [Aufgabe laden](?mode=rect&Uh=12&rc=bridge&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Einweg: $12\,\text{V} - 0{,}7\,\text{V} = 11{,}3\,\text{V}$; Brücke: $12\,\text{V} - 1{,}4\,\text{V} = 10{,}6\,\text{V}$, weil der Strom immer durch zwei Dioden fließt. Die Brücke nutzt beide Halbwellen: Mittelwert $\approx 6{,}29\,\text{V}$ statt $\approx 3{,}48\,\text{V}$ (ohne Durchlassspannung wären es $\frac{2\hat U}{\pi} = 7{,}64\,\text{V}$ bzw. $\frac{\hat U}{\pi} = 3{,}82\,\text{V}$). [In der Simulation zeigen](?mode=rect&Uh=12&rc=bridge)

</details>

### Aufgabe 4: Transistor als Verstärker

Ein Transistor mit $B = 150$ erhält $I_B = 0{,}08\,\text{mA}$; $U_B = 9\,\text{V}$, $R_C = 470\,\Omega$, $U_{CE,\text{sat}} = 0{,}2\,\text{V}$. Berechne $I_C$ und $U_{CE}$. Was ändert sich bei $I_B = 0{,}2\,\text{mA}$? [Aufgabe laden](?mode=amp&B=150&IB=0.08&ac=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$I_C = 150 \cdot 0{,}08\,\text{mA} = 12\,\text{mA}$, $U_{CE} = 9\,\text{V} - 12\,\text{mA} \cdot 470\,\Omega \approx 3{,}36\,\text{V}$. Bei $0{,}2\,\text{mA}$ wäre $B \cdot I_B = 30\,\text{mA}$, aber höchstens $I_{C,\max} = \frac{8{,}8\,\text{V}}{470\,\Omega} \approx 18{,}7\,\text{mA}$ sind möglich: Der Transistor ist gesättigt. [In der Simulation zeigen](?mode=amp&B=150&IB=0.2&ac=0)

</details>

### Aufgabe 5: Plancksches Wirkungsquantum aus einer LED

Die blaue LED ($\lambda = 470\,\text{nm}$) hat in der Simulation die Schwellspannung $U_S \approx 2{,}64\,\text{V}$. Bestimme daraus $h$. [Aufgabe laden](?mode=led&d=blu&U=4&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f = \frac{c}{\lambda} = \frac{3{,}00 \cdot 10^8\,\text{m/s}}{470 \cdot 10^{-9}\,\text{m}} \approx 6{,}38 \cdot 10^{14}\,\text{Hz}$, $h \approx \frac{e \cdot U_S}{f} = \frac{1{,}602 \cdot 10^{-19}\,\text{C} \cdot 2{,}64\,\text{V}}{6{,}38 \cdot 10^{14}\,\text{Hz}} \approx 6{,}6 \cdot 10^{-34}\,\text{J·s}$. Im Modell ist $U_S$ genau so gewählt; echte LEDs liefern Werte mit einigen Prozent Abweichung. [In der Simulation zeigen](?mode=led&d=blu&U=4)

</details>

### Aufgabe 6: Dämmerungsschalter

Bei $10\,\text{lx}$ hat der Fotowiderstand etwa $15\,\text{k}\Omega$, $R_1 = 47\,\text{k}\Omega$. Berechne die Spannung am Spannungsteiler. Erkläre, warum die Lampe bei Dunkelheit leuchtet und bei Tageslicht nicht. [Aufgabe laden](?mode=switch&bs=ldr&E=50&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$U = 9\,\text{V} \cdot \frac{15\,\text{k}\Omega}{47\,\text{k}\Omega + 15\,\text{k}\Omega} \approx 2{,}18\,\text{V}$ – deutlich über der Basis-Emitter-Schwelle von etwa $0{,}6\,\text{V}$: Es fließt Basisstrom, die Lampe leuchtet. Bei Tageslicht ist der LDR niederohmig (bei $1000\,\text{lx}$ etwa $600\,\Omega$), die Spannung bleibt unter $0{,}6\,\text{V}$ und der Transistor sperrt. Mit $R_1$ stellt man die Schaltschwelle ein. [In der Simulation zeigen](?mode=switch&bs=ldr&E=50)

</details>

## Ideen für den Unterricht

- **Einsatz:** Elektronik in Klasse 9/10 (Kennlinie, Diode, Transistor als Schalter) und in der Oberstufe (Halbleiterphysik, pn-Übergang, Verstärker). Wo das Thema genau steht, ist je nach Lehrplan verschieden, bitte dort prüfen.
- **Realversuch und Simulation:** Die Kennlinie zuerst mit echter Diode, Netzgerät und zwei Multimetern aufnehmen und danach mit der automatischen Messreihe vergleichen – gut sichtbar wird, warum ein Vorwiderstand nötig ist.
- **LEDs und $h$:** Den klassischen LED-Versuch zur Bestimmung von $h$ vorbereiten oder nachbereiten; die LED-Ansicht zeigt den Zusammenhang $e \cdot U_S \approx h \cdot f$ auf einen Blick.
- **Gleichrichter:** Das Oszilloskop-Bild lädt dazu ein, den Stromweg durch die Brücke für beide Halbwellen selbst einzuzeichnen und danach mit den aufleuchtenden Dioden zu vergleichen.
- **Häufige Stolpersteine:**
  - „Die Diode hat einen festen Widerstand.“ – Ihr Widerstand $U/I$ hängt stark von der Spannung ab; die Kennlinie ist keine Gerade.
  - „Unterhalb der Schleusenspannung fließt gar kein Strom.“ – Der Strom wächst stetig exponentiell; $U_S$ ist nur eine praktische Grenze.
  - „Der Transistor erzeugt Energie.“ – Die Energie kommt aus der Betriebsspannung $U_B$; der Transistor steuert nur, wie viel davon fließt.
  - „Löcher sind Teilchen.“ – Ein Loch ist eine fehlende Elektronenbindung, die sich wie eine positive Ladung verhält.
