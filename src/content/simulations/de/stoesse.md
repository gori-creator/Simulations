---
description: "Interaktive Simulation zu elastischen, teilelastischen und vollkommen unelastischen Stößen auf der Luftkissenbahn – mit Impuls- und Energiebilanz, Schwerpunkt sowie t-v- und t-x-Diagramm."
---

## Worum geht es?

Zwei Gleiter mit den Massen $m_1$ und $m_2$ gleiten fast reibungsfrei auf einer Luftkissenbahn und stoßen zusammen. Der **Impuls** eines Körpers ist

$$
p = m \cdot v \qquad [p] = 1\,\text{kg}\cdot\tfrac{\text{m}}{\text{s}}
$$

Er hat eine Richtung: Auf der Bahn zählt „nach rechts“ positiv, „nach links“ negativ. Für das abgeschlossene System aus beiden Gleitern gilt bei **jedem** Stoß der **Impulserhaltungssatz**:

$$
m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'
$$

Mit der Bewegungsenergie $E = \tfrac{1}{2} m v^2$ sieht es anders aus:

**Elastischer Stoß** (Federbügel): Auch die Bewegungsenergie bleibt erhalten. Daraus folgt

$$
v_1' = \frac{(m_1 - m_2)\,v_1 + 2 m_2 v_2}{m_1 + m_2} \qquad v_2' = \frac{(m_2 - m_1)\,v_2 + 2 m_1 v_1}{m_1 + m_2}
$$

**Vollkommen unelastischer Stoß** (Klettband): Die Gleiter haften aneinander und fahren gemeinsam weiter mit

$$
v' = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}
$$

Ein Teil der Bewegungsenergie wird dabei in **innere Energie** (Verformung, Erwärmung) umgewandelt.

**Teilelastischer Stoß** (Gummipuffer): Die **Stoßzahl** $k$ gibt an, wie schnell sich die Gleiter nachher im Vergleich zu vorher voneinander entfernen: $v_2' - v_1' = k \cdot (v_1 - v_2)$ mit $0 \le k \le 1$.

Der gemeinsame **Schwerpunkt** S bewegt sich mit $v_S = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$ – vor, während und nach dem Stoß gleich, denn $v_S$ ist der Gesamtimpuls geteilt durch die Gesamtmasse. Damit lassen sich alle drei Stoßarten in einer Formel zusammenfassen:

$$
v_1' = v_S - k\,(v_1 - v_S) \qquad v_2' = v_S - k\,(v_2 - v_S)
$$

## Ausprobieren

1. Drücke **Stoß starten** und beobachte die Pfeile. Vergleiche in der Bilanz die Summenpfeile (lila) vor und nach dem Stoß.
2. Ziehe an den Pfeilspitzen, um $v_1$ und $v_2$ zu ändern – auch nach links. Was passiert, wenn Gleiter 1 langsamer ist als Gleiter 2?
3. Gleiche Massen, elastisch: Was geschieht mit den Geschwindigkeiten? [Beispiel laden](?m2=0.2)
4. Schalte auf Klettband. Wie viel Prozent der Bewegungsenergie werden umgewandelt? [Beispiel laden](?type=inel&m2=0.2)
5. Ein leichter Gleiter prallt auf einen sehr schweren. Vergleiche Impuls und Energie des schweren Gleiters nach dem Stoß. [Beispiel laden](?m1=0.05&m2=2)
6. Wähle das t-x-Diagramm. Welche Form hat die Linie des Schwerpunkts? [Beispiel laden](?type=part&k=0.5&v2=-0.4&m2=0.6&chart=x)

## Aufgaben

### Aufgabe 1: Gleiter mit Klettband

Gleiter 1 ($m_1 = 0{,}2\,\text{kg}$, $v_1 = 0{,}5\,\tfrac{\text{m}}{\text{s}}$) stößt auf den ruhenden Gleiter 2 ($m_2 = 0{,}2\,\text{kg}$). Beide haften aneinander. Berechne die gemeinsame Geschwindigkeit und den Anteil der Bewegungsenergie, der umgewandelt wird. [Aufgabe laden](?type=inel&m2=0.2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v' = \frac{0{,}2 \cdot 0{,}5}{0{,}4}\,\tfrac{\text{m}}{\text{s}} = 0{,}25\,\tfrac{\text{m}}{\text{s}}$. Vorher: $E = \tfrac{1}{2} \cdot 0{,}2 \cdot 0{,}5^2\,\text{J} = 25\,\text{mJ}$, nachher: $E' = \tfrac{1}{2} \cdot 0{,}4 \cdot 0{,}25^2\,\text{J} = 12{,}5\,\text{mJ}$. Die Hälfte der Bewegungsenergie (50 %) wird zu innerer Energie. [In der Simulation zeigen](?type=inel&m2=0.2)

</details>

### Aufgabe 2: Leicht trifft schwer

Elastischer Stoß mit $m_1 = 0{,}2\,\text{kg}$, $v_1 = 0{,}5\,\tfrac{\text{m}}{\text{s}}$ und dem ruhenden Gleiter 2 mit $m_2 = 0{,}4\,\text{kg}$. Berechne $v_1'$ und $v_2'$ und prüfe die Energieerhaltung. [Aufgabe laden](?_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$v_1' = \frac{(0{,}2 - 0{,}4) \cdot 0{,}5}{0{,}6}\,\tfrac{\text{m}}{\text{s}} \approx -0{,}167\,\tfrac{\text{m}}{\text{s}} \qquad v_2' = \frac{2 \cdot 0{,}2 \cdot 0{,}5}{0{,}6}\,\tfrac{\text{m}}{\text{s}} \approx 0{,}333\,\tfrac{\text{m}}{\text{s}}$$

Gleiter 1 prallt zurück. Energie: $\tfrac{1}{2} \cdot 0{,}2 \cdot 0{,}167^2 + \tfrac{1}{2} \cdot 0{,}4 \cdot 0{,}333^2 \approx 2{,}8\,\text{mJ} + 22{,}2\,\text{mJ} = 25\,\text{mJ}$ wie vorher.

</details>

### Aufgabe 3: Stillstand nach dem Stoß

Gleiter 1 ($m_1 = 0{,}2\,\text{kg}$) fährt mit $0{,}5\,\tfrac{\text{m}}{\text{s}}$ nach rechts, Gleiter 2 ($m_2 = 0{,}4\,\text{kg}$) kommt ihm entgegen. Beide haben Klettband. Wie schnell muss Gleiter 2 sein, damit beide nach dem Stoß stillstehen? Wohin geht die Energie?

<details>
<summary>Lösung anzeigen</summary>

Der Gesamtimpuls muss null sein: $0{,}2 \cdot 0{,}5 + 0{,}4 \cdot v_2 = 0$, also $v_2 = -0{,}25\,\tfrac{\text{m}}{\text{s}}$. Die gesamte Bewegungsenergie $25\,\text{mJ} + 12{,}5\,\text{mJ} = 37{,}5\,\text{mJ}$ wird in innere Energie umgewandelt. [In der Simulation zeigen](?type=inel&v2=-0.25)

</details>

### Aufgabe 4: Wie gegen eine Wand

Ein leichter Gleiter ($m_1 = 0{,}05\,\text{kg}$, $v_1 = 0{,}5\,\tfrac{\text{m}}{\text{s}}$) stößt elastisch auf einen ruhenden, 40-mal schwereren ($m_2 = 2\,\text{kg}$). Berechne die Geschwindigkeiten nach dem Stoß. Welcher Gleiter hat danach mehr Impuls, welcher mehr Energie? [Aufgabe laden](?m1=0.05&m2=2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v_1' = \frac{(0{,}05 - 2) \cdot 0{,}5}{2{,}05}\,\tfrac{\text{m}}{\text{s}} \approx -0{,}476\,\tfrac{\text{m}}{\text{s}}$, $v_2' = \frac{2 \cdot 0{,}05 \cdot 0{,}5}{2{,}05}\,\tfrac{\text{m}}{\text{s}} \approx 0{,}024\,\tfrac{\text{m}}{\text{s}}$. Der schwere Gleiter übernimmt mit $p_2' \approx 0{,}049\,\text{kg}\cdot\tfrac{\text{m}}{\text{s}}$ fast den **doppelten** Anfangsimpuls ($0{,}025\,\text{kg}\cdot\tfrac{\text{m}}{\text{s}}$), aber nur $0{,}6\,\text{mJ}$ von $6{,}25\,\text{mJ}$ Energie. Für $m_2 \to \infty$ prallt Gleiter 1 mit $-v_1$ zurück wie von einer Wand.

</details>

### Aufgabe 5: Teilelastischer Stoß

Zwei Gleiter mit je $0{,}2\,\text{kg}$ stoßen teilelastisch mit $k = 0{,}5$; Gleiter 1 hat $0{,}5\,\tfrac{\text{m}}{\text{s}}$, Gleiter 2 ruht. Berechne $v_1'$, $v_2'$ und den Energieanteil, der umgewandelt wird. [Aufgabe laden](?type=part&k=0.5&m2=0.2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v_S = 0{,}25\,\tfrac{\text{m}}{\text{s}}$, also $v_1' = 0{,}25 - 0{,}5 \cdot (0{,}5 - 0{,}25) = 0{,}125\,\tfrac{\text{m}}{\text{s}}$ und $v_2' = 0{,}25 + 0{,}5 \cdot 0{,}25 = 0{,}375\,\tfrac{\text{m}}{\text{s}}$. Nachher: $E' = \tfrac{1}{2} \cdot 0{,}2 \cdot (0{,}125^2 + 0{,}375^2)\,\text{J} \approx 15{,}6\,\text{mJ}$ von $25\,\text{mJ}$ – es werden $37{,}5\,\%$ umgewandelt.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Impuls und Impulserhaltung in der Mechanik der Jahrgangsstufen 10/11 (am bayerischen Gymnasium im Rahmen der Newton’schen Mechanik; Zuordnung als Entwurf, bitte mit dem LehrplanPLUS abgleichen). Geeignet als Ersatz oder Vorbereitung für den Versuch an der Luftkissenbahn, zum Üben der Stoßformeln und zum Vergleich von Impuls- und Energieerhaltung.
- **Vorhersagen lassen:** Die Bilanz „nachher“ erscheint erst im Moment des Stoßes. Mit `_hide=1` (Aufgabenlinks) sind die berechneten Ergebnisse verdeckt.
- **Modell:** gerader, zentraler Stoß ohne Reibung; die Stoßdauer wird vernachlässigt (Geschwindigkeiten springen). Die Startorte wählt die Simulation so, dass die Bewegung gut auf die $1{,}6\,\text{m}$ lange Bahn passt. Massen bis $2\,\text{kg}$ werden als Massestücke auf dem Gleiter dargestellt.
- **Darstellung:** Im t-x-Diagramm zeigen die Bänder die Länge der Gleiter ($0{,}2\,\text{m}$); sie berühren sich genau beim Stoß. Die Linie des Schwerpunkts ist eine Gerade.
- **Typische Fehlvorstellungen:**
  - „Beim unelastischen Stoß geht Impuls verloren.“ – Der Impuls bleibt bei jedem Stoß erhalten; nur Bewegungsenergie wird umgewandelt.
  - „Energie geht verloren.“ – Sie wird zu innerer Energie (Verformung, Erwärmung) und ist nicht verschwunden.
  - „Impuls und Bewegungsenergie sind dasselbe.“ – Der Impuls hat eine Richtung und ist proportional zu $v$, die Energie ist richtungslos und proportional zu $v^2$ (siehe Aufgabe 4).
