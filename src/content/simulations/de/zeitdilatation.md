---
description: "Lichtuhr im fahrenden Zug, Zug und Tunnel, ein Lichtblitz in der Zugmitte, Myonen und E = m · c²: die spezielle Relativitätstheorie zum Ausprobieren."
---

## Worum geht es?

Die **spezielle Relativitätstheorie** (Einstein, 1905) beruht auf zwei **Postulaten**: Alle Inertialsysteme (gleichförmig bewegte Bezugssysteme) sind gleichberechtigt, und **Licht hat in jedem von ihnen dieselbe Geschwindigkeit** $c \approx 3 \cdot 10^8\,\tfrac{\text{m}}{\text{s}}$. Daraus folgt, dass Zeiten und Längen vom Bezugssystem abhängen.

**Lichtuhr:** Ein Lichtpuls läuft zwischen zwei Spiegeln im Abstand $d$ hin und her. Im Zug läuft er senkrecht, ein Tick dauert $\Delta t_0 = \frac{2d}{c}$. Vom Bahnsteig aus fährt der Zug weiter, der Puls läuft **schräg** und damit einen längeren Weg – bei gleichem $c$ braucht er länger. Nach Pythagoras gilt $\left(\frac{c\,\Delta t}{2}\right)^2 = d^2 + \left(\frac{v\,\Delta t}{2}\right)^2$, also

$$
\Delta t = \gamma \cdot \Delta t_0 \qquad \text{mit dem Lorentzfaktor} \qquad \gamma = \frac{1}{\sqrt{1 - \frac{v^2}{c^2}}} \geq 1.
$$

$\Delta t_0$ ist die **Eigenzeit**, gemessen von einer Uhr, die beim Vorgang dabei ist. Bewegte Uhren gehen langsamer (**Zeitdilatation**).

**Längenkontraktion:** Ein bewegter Körper ist in Bewegungsrichtung verkürzt: $L = \frac{L_0}{\gamma}$ mit der **Ruhelänge** $L_0$. Quer zur Bewegung ändert sich nichts.

**Relativität der Gleichzeitigkeit:** Blitzt eine Lampe in der Zugmitte, erreicht das Licht im Zug beide Enden gleichzeitig. Vom Bahnsteig aus läuft das hintere Ende dem Licht entgegen und wird früher erreicht. Der Unterschied ist $\Delta t = \frac{\gamma \cdot v \cdot L_0}{c^2}$.

**Energie:** Ein Körper der Masse $m$ hat die **Ruheenergie** $E_0 = m \cdot c^2$. Bewegt er sich, ist seine Gesamtenergie $E = \gamma \cdot m \cdot c^2$, die kinetische Energie $E_{\text{kin}} = (\gamma - 1) \cdot m \cdot c^2$. Früher sprach man von einer **relativistischen Massenzunahme** $m_{\text{rel}} = \gamma \cdot m$; heute sagt man meist: Energie und Impuls $p = \gamma \cdot m \cdot v$ wachsen ohne Grenze, die Geschwindigkeit bleibt unter $c$.

Alle Effekte werden erst nahe $c$ groß: Bei $v = 0{,}6\,c$ ist $\gamma = 1{,}25$, bei $0{,}99\,c$ etwa $7{,}1$. Im Alltag ist $\gamma - 1$ winzig (GPS-Satellit: etwa $8 \cdot 10^{-11}$).

## Ausprobieren

1. Starte die Lichtuhr und vergleiche den Weg des Pulses im Zug (oben) und vom Bahnsteig aus (unten). Wie weit liegen die Uhren auseinander? [Lichtuhr bei 0,8 c](?v=0.8)
2. Zieh den Punkt im γ-Diagramm langsam nach rechts. Ab welcher Geschwindigkeit ist $\gamma$ deutlich größer als 1?
3. Bei $v = 0{,}6\,c$ bilden $d$, $v\,\Delta t/2$ und $c\,\Delta t/2$ ein Dreieck mit den Seiten 4, 3 und 5. Prüfe das am Dreieck. [Dreieck zeigen](?v=0.6&tri=1)
4. Zug und Tunnel sind gleich lang (Ruhelänge). Passt der Zug hinein? Vergleiche beide Bezugssysteme. [Zug und Tunnel](?mode=len&v=0.8)
5. Lass die Lampe in der Zugmitte blitzen. In welchem Bezugssystem kommt das Licht gleichzeitig an den Enden an? [Lichtblitz](?mode=sim&v=0.6)
6. Vergleiche, wie viele Myonen am Boden ankommen, mit und ohne Zeitdilatation. [Myonen](?mode=muon&v=0.998)
7. Gib einem Elektron immer mehr Energie. Was wächst ohne Grenze, was nicht? [Elektron bei 0,99 c](?mode=energy&v=0.99)
8. Wähle in „Alltag und Experimente“ verschiedene Beispiele. Wann muss man die Relativitätstheorie berücksichtigen? [GPS](?mode=apps&ex=gps)

## Aufgaben

### Aufgabe 1: Langsame Zuguhr

Ein Vorgang dauert im Zug $3\,\text{s}$. Der Zug fährt mit $0{,}8\,c$. Wie lange dauert der Vorgang, vom Bahnsteig aus gemessen? [Aufgabe laden](?v=0.8&t0=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\gamma = \frac{1}{\sqrt{1 - 0{,}64}} = \frac{1}{0{,}6} = \frac{5}{3}$, also $\Delta t = \frac{5}{3} \cdot 3\,\text{s} = 5\,\text{s}$. [In der Simulation zeigen](?v=0.8&t0=3)

</details>

### Aufgabe 2: Herleitung mit Pythagoras

Leite aus $\left(\frac{c\,\Delta t}{2}\right)^2 = d^2 + \left(\frac{v\,\Delta t}{2}\right)^2$ und $d = \frac{c\,\Delta t_0}{2}$ die Formel $\Delta t = \gamma \cdot \Delta t_0$ her.

<details>
<summary>Lösung anzeigen</summary>

Einsetzen: $c^2 \Delta t^2 = c^2 \Delta t_0^2 + v^2 \Delta t^2$, also $\Delta t^2 (c^2 - v^2) = c^2 \Delta t_0^2$ und $\Delta t = \frac{\Delta t_0}{\sqrt{1 - v^2/c^2}} = \gamma \cdot \Delta t_0$. Bei $0{,}6\,c$: Hypotenuse $1{,}25\,d$, Kathete $0{,}75\,d$ – das 3-4-5-Dreieck. [Dreieck zeigen](?v=0.6&tri=1)

</details>

### Aufgabe 3: Zug im Tunnel

Ein Zug und ein Tunnel haben beide die Ruhelänge $200\,\text{m}$. Der Zug fährt mit $0{,}6\,c$. Wie lang sind Zug und Tunnel vom Bahnsteig aus, wie lang vom Zug aus? [Aufgabe laden](?mode=len&v=0.6&L0=200&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\gamma = 1{,}25$. Vom Bahnsteig: Zug $\frac{200\,\text{m}}{1{,}25} = 160\,\text{m}$, Tunnel $200\,\text{m}$ – der Zug passt hinein. Vom Zug: Zug $200\,\text{m}$, Tunnel $160\,\text{m}$ – er ragt heraus. Beides stimmt, weil „beide Enden gleichzeitig im Tunnel“ in den beiden Systemen verschiedene Ereignisse meint. [In der Simulation zeigen](?mode=len&v=0.6&L0=200)

</details>

### Aufgabe 4: Gleichzeitig oder nicht?

Ein Zug ($L_0 = 100\,\text{m}$) fährt mit $0{,}6\,c$, in seiner Mitte blitzt eine Lampe. Wann erreicht das Licht die Enden, im Zug und vom Bahnsteig aus? [Aufgabe laden](?mode=sim&v=0.6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Im Zug: $t' = \frac{50\,\text{m}}{c} \approx 167\,\text{ns}$ für beide Enden. Vom Bahnsteig ist der Zug $80\,\text{m}$ lang: hinten $t_h = \frac{40\,\text{m}}{1{,}6\,c} \approx 83{,}4\,\text{ns}$, vorn $t_v = \frac{40\,\text{m}}{0{,}4\,c} \approx 333{,}6\,\text{ns}$. Unterschied $\Delta t = \frac{\gamma v L_0}{c^2} = \frac{1{,}25 \cdot 0{,}6 \cdot 100\,\text{m}}{c} \approx 250{,}2\,\text{ns}$. [In der Simulation zeigen](?mode=sim&v=0.6)

</details>

### Aufgabe 5: Myonen

Myonen entstehen in etwa $10\,\text{km}$ Höhe und fliegen mit $0{,}998\,c$. Ihre mittlere Lebensdauer in Ruhe ist $\tau = 2{,}2\,\mu\text{s}$. Wie weit kommen sie im Mittel ohne und mit Zeitdilatation? Welcher Anteil erreicht den Boden? [Aufgabe laden](?mode=muon&v=0.998&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ohne: $0{,}998 \cdot c \cdot 2{,}2\,\mu\text{s} \approx 658\,\text{m}$. Mit $\gamma \approx 15{,}8$: $\approx 10{,}4\,\text{km}$. Flugzeit $\frac{10\,\text{km}}{0{,}998\,c} \approx 33{,}4\,\mu\text{s}$, also kommen $e^{-33{,}4/(15{,}8 \cdot 2{,}2)} \approx 38\,\%$ an (klassisch nur etwa $2{,}5 \cdot 10^{-7}$). Aus Sicht des Myons ist die Atmosphäre nur $\frac{10\,\text{km}}{15{,}8} \approx 632\,\text{m}$ dick. [In der Simulation zeigen](?mode=muon&v=0.998)

</details>

### Aufgabe 6: Schnelles Elektron

Ein Elektron ($E_0 = 0{,}511\,\text{MeV}$) fliegt mit $0{,}99\,c$. Berechne $E$, $E_{\text{kin}}$ und vergleiche mit $\frac{1}{2} m v^2$. [Aufgabe laden](?mode=energy&v=0.99&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\gamma \approx 7{,}09$: $E \approx 7{,}09 \cdot 0{,}511\,\text{MeV} \approx 3{,}62\,\text{MeV}$, $E_{\text{kin}} \approx 3{,}11\,\text{MeV}$. Klassisch wäre $\frac{1}{2} m v^2 = \frac{1}{2} \cdot 0{,}99^2 \cdot 0{,}511\,\text{MeV} \approx 0{,}25\,\text{MeV}$ – mit $3{,}11\,\text{MeV}$ müsste das Elektron nach Newton schneller als das Licht sein. [In der Simulation zeigen](?mode=energy&v=0.99)

</details>

## Ideen für den Unterricht

- **Einsatz:** Einblick in die spezielle Relativitätstheorie in der Oberstufe (je nach Lehrplan Pflicht- oder Wahlthema – bitte am jeweiligen Lehrplan prüfen). Die Lichtuhr eignet sich als Einstieg: erst ohne Zahlen (`show=0`) beobachten, dann mit Pythagoras herleiten.
- **Modell:** Die Animationen sind stark verlangsamt; die Lichtuhr hat den Spiegelabstand $d \approx 1{,}5\,\text{m}$ (ein Tick $10\,\text{ns}$). Zug und Tunnel bewegen sich in der Animation nicht mit der eingestellten Geschwindigkeit, nur die Längen stimmen. Beim Lichtblitz läuft das Bild vom Bahnsteig bei hohen Geschwindigkeiten im Zeitraffer.
- **Massenzunahme:** Wo der Lehrplan die „relativistische Massenzunahme“ nennt, zeigt die Ansicht „Energie und Impuls“ die Größe $m_{\text{rel}} = \gamma m$. Die heute übliche Sicht mit $E = \gamma m c^2$ und $p = \gamma m v$ steht daneben, ein Vergleich beider Sprechweisen kann sich lohnen.
- **Alltag:** GPS-Uhren gehen wegen der Bewegung etwa $7\,\mu\text{s}$ pro Tag nach, wegen der schwächeren Gravitation (allgemeine Relativitätstheorie) etwa $45\,\mu\text{s}$ vor; ohne Korrektur würde die Ortung pro Tag um Kilometer abweichen.
- **Häufige Stolpersteine:**
  - „Die Uhr geht nur scheinbar langsamer.“ – Die Zeitdilatation ist messbar (Myonen, Atomuhren in Flugzeugen, Teilchenbeschleuniger).
  - „Wer sich bewegt, ist eindeutig.“ – Jede Seite sieht die Uhren der anderen langsamer gehen; das ist symmetrisch.
  - „Der Zug passt in den Tunnel oder nicht.“ – Die Antwort hängt davon ab, was gleichzeitig ist.
  - „Mit genug Energie wird man schneller als das Licht.“ – $E$ und $p$ wachsen ohne Grenze, $v$ bleibt unter $c$.
