---
description: "Interaktive Simulation zur gleichförmigen Kreisbewegung: Bahngeschwindigkeit, Umlaufdauer, Zentripetalbeschleunigung und Zentripetalkraft – mit Kugel an der Schnur, reißender Schnur und einem Auto, das bei zu hoher Geschwindigkeit aus der Kurve rutscht."
---

## Worum geht es?

Bei einer **gleichförmigen Kreisbewegung** bleibt der Betrag der Geschwindigkeit gleich, ihre **Richtung** ändert sich aber ständig – die Geschwindigkeit zeigt immer entlang der **Tangente**. Für einen Umlauf mit dem Radius $r$ braucht der Körper die **Umlaufdauer** $T$; die **Frequenz** ist $f = \frac{1}{T}$ (Einheit $\frac{1}{\text{s}} = \text{Hz}$). Bei Motoren und Maschinen gibt man sie oft als **Drehzahl** in Umdrehungen pro Minute an: $1200\,\tfrac{\text{U}}{\text{min}} = \frac{1200}{60\,\text{s}} = 20\,\text{Hz}$.

$$
v = \frac{2\pi r}{T} \qquad \omega = \frac{2\pi}{T} = \frac{v}{r}
$$

($v$ heißt **Bahngeschwindigkeit**, $\omega = 2\pi f$ heißt **Winkelgeschwindigkeit**; sie gibt den Winkel im Bogenmaß pro Sekunde an.) Weil sich die Richtung von $v$ ändert, ist die Kreisbewegung eine **beschleunigte** Bewegung. Die **Zentripetalbeschleunigung** zeigt zum Mittelpunkt:

$$
a_Z = \frac{v^2}{r} = \omega^2 \cdot r
$$

Nach dem zweiten Newtonschen Gesetz braucht man dafür eine Kraft zum Mittelpunkt, die **Zentripetalkraft**:

$$
F_Z = m \cdot \frac{v^2}{r} = m \cdot \omega^2 \cdot r
$$

Die Zentripetalkraft ist keine eigene Kraftart. Sie wird von etwas anderem aufgebracht: bei der Kugel von der **Schnur**, beim Auto von der **Haftreibung** zwischen Reifen und Straße, bei Planeten von der Gravitation. Fehlt sie, bewegt sich der Körper wegen seiner **Trägheit** geradlinig gleichförmig weiter – entlang der Tangente.

**Zentrifugalkraft?** Wer im Karussell sitzt, fühlt sich nach außen gedrückt. Diese „Fliehkraft“ oder **Zentrifugalkraft** ist eine **Scheinkraft**: Man braucht sie nur, wenn man im mitbewegten (rotierenden) System rechnet. Von außen betrachtet – so wie in dieser Simulation – gibt es nur die Zentripetalkraft zum Mittelpunkt.

Beim Auto ist die Haftreibung höchstens $F_{H,\max} = \mu_H \cdot m \cdot g$. Aus $m \frac{v^2}{r} \le \mu_H m g$ folgt die **Höchstgeschwindigkeit in der Kurve**

$$
v_{\max} = \sqrt{\mu_H \cdot g \cdot r}
$$

Sie hängt nicht von der Masse ab, aber stark vom Straßenzustand.

## Ausprobieren

1. Drücke **Start**. In welche Richtung zeigen der Geschwindigkeitspfeil und der Kraftpfeil?
2. Drücke **Schnur durchschneiden**. Fliegt die Kugel nach außen weg oder entlang der Tangente?
3. Halbiere die Umlaufdauer. Wie ändern sich $v$ und $F_Z$? [Beispiel laden](?T=0.6)
4. Wähle im Diagramm „Kraft über Radius“: Bei fester Umlaufdauer wächst $F_Z$ mit $r$, bei fester Geschwindigkeit nimmt sie ab. [Beispiel laden](?chart=r)
5. Schalte „Positionen in gleichen Zeitabständen“ ein: Die Kugel legt in gleichen Zeiten gleich lange Bögen zurück. [Beispiel laden](?trace=1)
6. Verkleinere $T$, bis die Schnur reißt. [Zu schnell](?T=0.4)
7. Schalte zum Auto und probiere nasse Fahrbahn, Schnee und Eis. [Nasse Fahrbahn](?mode=car&road=wet&vc=18)

## Aufgaben

### Aufgabe 1: Kugel an der Schnur

Eine Kugel ($m = 0{,}2\,\text{kg}$) kreist an einer $0{,}8\,\text{m}$ langen Schnur mit der Umlaufdauer $T = 1{,}2\,\text{s}$. Berechne $v$, $a_Z$ und $F_Z$. [Aufgabe laden](?_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$v = \frac{2\pi \cdot 0{,}8\,\text{m}}{1{,}2\,\text{s}} \approx 4{,}19\,\tfrac{\text{m}}{\text{s}} \qquad a_Z = \frac{v^2}{r} \approx 21{,}9\,\tfrac{\text{m}}{\text{s}^2} \qquad F_Z = m \cdot a_Z \approx 4{,}39\,\text{N}$$

Außerdem: $f = \frac{1}{1{,}2\,\text{s}} \approx 0{,}83\,\text{Hz}$ und $\omega = \frac{2\pi}{T} \approx 5{,}24\,\tfrac{1}{\text{s}}$. Probe: $a_Z = \omega^2 \cdot r \approx 27{,}4 \cdot 0{,}8 \approx 21{,}9\,\tfrac{\text{m}}{\text{s}^2}$.

</details>

### Aufgabe 2: Wann reißt die Schnur?

Die Schnur aus Aufgabe 1 hält höchstens $30\,\text{N}$ aus. Bei welcher Umlaufdauer reißt sie? [Aufgabe laden](?_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Aus $F_Z = m \cdot \frac{4\pi^2 r}{T^2}$ folgt $T = 2\pi \sqrt{\frac{m \cdot r}{F_Z}} = 2\pi \sqrt{\frac{0{,}2 \cdot 0{,}8}{30}}\,\text{s} \approx 0{,}46\,\text{s}$. Bei kürzerer Umlaufdauer reißt die Schnur. [In der Simulation zeigen](?T=0.4)

</details>

### Aufgabe 3: Höchstgeschwindigkeit in der Kurve

Ein Auto fährt durch eine Kurve mit $r = 50\,\text{m}$. Wie schnell darf es auf trockener Straße ($\mu_H = 0{,}8$) höchstens fahren, wie schnell bei Nässe ($\mu_H = 0{,}5$)? [Aufgabe laden](?mode=car&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Trocken: $v_{\max} = \sqrt{0{,}8 \cdot 9{,}81 \cdot 50}\,\tfrac{\text{m}}{\text{s}} \approx 19{,}8\,\tfrac{\text{m}}{\text{s}} \approx 71\,\tfrac{\text{km}}{\text{h}}$. Nass: $\sqrt{0{,}5 \cdot 9{,}81 \cdot 50}\,\tfrac{\text{m}}{\text{s}} \approx 15{,}7\,\tfrac{\text{m}}{\text{s}} \approx 56\,\tfrac{\text{km}}{\text{h}}$.

</details>

### Aufgabe 4: Schwerer Wagen

Ein Transporter ist doppelt so schwer wie ein Pkw. Darf er schneller oder langsamer durch dieselbe Kurve fahren?

<details>
<summary>Lösung anzeigen</summary>

Gleich schnell: Zentripetalkraft und Haftreibung sind beide proportional zu $m$, die Masse kürzt sich in $v_{\max} = \sqrt{\mu_H g r}$ heraus. (In der Wirklichkeit spielen Reifen, Schwerpunkt und Bremsweg zusätzlich eine Rolle.) [Mit 2400 kg zeigen](?mode=car&mc=2400)

</details>

### Aufgabe 5: Glatteis

Auf Glatteis ($\mu_H = 0{,}1$) fährt ein Auto mit $10\,\tfrac{\text{m}}{\text{s}}$ (36 km/h). Wie groß muss der Kurvenradius mindestens sein? [Aufgabe laden](?mode=car&road=ice&vc=10&chart=r&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$r_{\min} = \frac{v^2}{\mu_H \cdot g} = \frac{100}{0{,}1 \cdot 9{,}81}\,\text{m} \approx 102\,\text{m}$. In der Kurve mit $r = 50\,\text{m}$ rutscht das Auto.

</details>

### Aufgabe 6: Schleudern in der Waschmaschine

Die Trommel einer Waschmaschine ($r = 0{,}25\,\text{m}$) schleudert mit $1200\,\tfrac{\text{U}}{\text{min}}$. Berechne $f$, $\omega$, $v$ und $a_Z$. Das Wievielfache der Fallbeschleunigung $g$ ist $a_Z$?

<details>
<summary>Lösung anzeigen</summary>

$f = \frac{1200}{60\,\text{s}} = 20\,\text{Hz}$, $\omega = 2\pi f \approx 126\,\tfrac{1}{\text{s}}$, $v = \omega \cdot r \approx 31{,}4\,\tfrac{\text{m}}{\text{s}}$, $a_Z = \omega^2 \cdot r \approx 3950\,\tfrac{\text{m}}{\text{s}^2}$. Das ist etwa das 400-Fache von $g$. Die Trommel hält die Wäsche auf der Kreisbahn, das Wasser fliegt durch die Löcher tangential hinaus.

</details>

### Aufgabe 7: Looping

Eine Achterbahn fährt durch einen Looping mit $r = 6\,\text{m}$. Wie schnell muss der Wagen im höchsten Punkt mindestens sein, damit er nicht von der Schiene abhebt?

<details>
<summary>Lösung anzeigen</summary>

Im höchsten Punkt zeigt die Gewichtskraft zum Mittelpunkt. Bei der Mindestgeschwindigkeit reicht sie gerade als Zentripetalkraft: $m \cdot g = m \cdot \frac{v^2}{r}$, also $v_{\min} = \sqrt{g \cdot r} = \sqrt{9{,}81 \cdot 6}\,\tfrac{\text{m}}{\text{s}} \approx 7{,}7\,\tfrac{\text{m}}{\text{s}} \approx 28\,\tfrac{\text{km}}{\text{h}}$. Ist der Wagen schneller, drückt zusätzlich die Schiene nach unten. Auch hier kürzt sich die Masse heraus.

</details>

## Ideen für den Unterricht

- **Einsatz:** Kreisbewegung und Zentripetalkraft in der Mechanik der Mittel- oder Oberstufe (etwa Klasse 10/11). Gut als Einstieg (Schnur durchschneiden), zum Erarbeiten von $F_Z \sim v^2$ und $F_Z \sim \frac{1}{r}$ bzw. $F_Z \sim r$ (Diagramm) und als Anwendung (Kurvenfahrt, Verkehrserziehung).
- **Modell:** Die Kugel bewegt sich reibungsfrei auf einem waagerechten Tisch (Draufsicht); die Gewichtskraft wird vom Tisch ausgeglichen, die Schnurkraft ist die Zentripetalkraft. Die Kurve des Autos ist nicht maßstäblich gezeichnet. Die Haftreibungszahlen sind Richtwerte. Rutscht das Auto, wird vereinfacht angenommen, dass bei gleicher Geschwindigkeit weiter die größte Haftreibung wirkt; das Auto fährt dann auf einem Kreis mit dem größeren Radius $r' = \frac{v^2}{\mu_H g}$ (in Wirklichkeit ist die Gleitreibung noch kleiner).
- **Häufige Stolpersteine:**
  - „Eine Fliehkraft treibt die Kugel nach außen.“ – Im ruhenden Bezugssystem wirkt nur die Kraft zum Mittelpunkt; ohne sie fliegt die Kugel tangential weiter, nicht radial nach außen. Die Zentrifugalkraft ist eine Scheinkraft, die nur im mitbewegten System auftritt.
  - „Bei gleichbleibender Geschwindigkeit wirkt keine Kraft.“ – Die Richtung ändert sich, dafür ist eine Kraft nötig.
  - „Schwere Autos fliegen eher aus der Kurve.“ – Die Grenzgeschwindigkeit hängt nicht von der Masse ab.
  - „Größerer Radius bedeutet immer größere Kraft.“ – Das stimmt nur bei gleicher Umlaufdauer, bei gleicher Geschwindigkeit ist es umgekehrt.
