---
description: "Interaktive Simulation zur schiefen Ebene – Gewichtskraft in Hangabtriebskraft und Normalkraft zerlegen, Haft- und Gleitreibung, Grenzwinkel, Rutschen mit a = g · (sin α − μ · cos α), Kraftmesser, Messreihe und Diagramm F(α)."
---

## Worum geht es?

Auf einer **schiefen Ebene** mit dem Neigungswinkel $\alpha$ wirkt auf einen Körper die **Gewichtskraft** $F_G = m \cdot g$ senkrecht nach unten. Man zerlegt sie in zwei Komponenten:

- die **Hangabtriebskraft** $F_H$ parallel zur Ebene (hangabwärts) und
- die **Normalkraft** $F_N$ senkrecht zur Ebene, die den Körper auf die Unterlage drückt.

Das Kräftedreieck aus $F_G$, $F_H$ und $F_N$ ist ähnlich zum Dreieck aus Länge $l$, Höhe $h$ und Grundseite der Ebene. Deshalb gilt

$$
\frac{F_H}{F_G} = \frac{h}{l} \qquad F_H = F_G \cdot \sin\alpha \qquad F_N = F_G \cdot \cos\alpha
$$

Je steiler die Ebene, desto größer $F_H$ und desto kleiner $F_N$. Bei $\alpha = 30^\circ$ ist die Hangabtriebskraft genau halb so groß wie die Gewichtskraft.

**Reibung:** Ein Klotz bleibt liegen, solange die **Haftreibungskraft** die Hangabtriebskraft ausgleichen kann. Sie ist höchstens

$$
F_{R,\max} = \mu_H \cdot F_N
$$

($\mu_H$: Haftreibungszahl). Ist $F_H$ größer, rutscht der Klotz. Beim Gleiten bremst die kleinere **Gleitreibungskraft** $F_R = \mu_G \cdot F_N$. Der Klotz gleitet dann gleichmäßig beschleunigt hinab mit

$$
a = \frac{F_H - F_R}{m} = g \cdot (\sin\alpha - \mu_G \cdot \cos\alpha)
$$

**Grenzwinkel:** Ohne weitere Kraft beginnt der Klotz zu rutschen, wenn $F_H = F_{R,\max}$ ist, also bei $\tan\alpha_G = \mu_H$. Die Masse spielt dafür keine Rolle. Misst man den Grenzwinkel, kann man die Haftreibungszahl bestimmen.

**Kraftwandler:** Ein Wagen rollt fast ohne Reibung. Um ihn auf der Ebene zu halten oder gleichmäßig hinaufzuziehen, braucht man nur die Kraft $F_H$ statt $F_G$ – dafür ist der Weg $l$ länger als die Höhe $h$. Es gilt die **Goldene Regel der Mechanik**: $F_H \cdot l = F_G \cdot h$.

## Ausprobieren

1. Vergrößere den Neigungswinkel, indem du das obere Ende der Ebene ziehst. Beobachte $F_H$ und $F_N$ in der Szene und im Diagramm.
2. Drücke **Loslassen** bei $20^\circ$ und bei $35^\circ$. [Holzklotz bei 35°](?a=35)
3. Finde für jedes Materialpaar den Grenzwinkel, ab dem der Klotz rutscht. Vergleiche mit dem Schnittpunkt von $F_H$ und $F_{R,\max}$ im Diagramm. [Gummi auf Asphalt](?mat=rubber&a=38) · [Stahl auf Eis](?mat=ice&a=1)
4. Verdopple die Masse. Ändern sich der Grenzwinkel und die Beschleunigung? [Masse 2 kg](?a=35&m=2)
5. Hänge den Kraftmesser an den Wagen und stelle die Zugkraft so ein, dass er stehen bleibt. Trage für verschiedene Winkel Messwerte ein. [Wagen mit Kraftmesser](?body=cart&km=1&fz=3)
6. Ziehe den Holzklotz hinauf. Ab welcher Zugkraft setzt er sich in Bewegung? [Hochziehen](?km=1&fz=8.5)

## Aufgaben

### Aufgabe 1: Kräfte zerlegen

Ein Klotz mit $m = 2\,\text{kg}$ liegt auf einer Ebene mit $\alpha = 30^\circ$. Berechne $F_G$, $F_H$ und $F_N$. [Aufgabe laden](?a=30&m=2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F_G = 2\,\text{kg} \cdot 9{,}81\,\tfrac{\text{N}}{\text{kg}} = 19{,}62\,\text{N}$, $F_H = F_G \cdot \sin 30^\circ = 9{,}81\,\text{N}$, $F_N = F_G \cdot \cos 30^\circ \approx 16{,}99\,\text{N}$.

</details>

### Aufgabe 2: Höhe und Länge

Eine Rampe ist $l = 1\,\text{m}$ lang und $h = 34\,\text{cm}$ hoch. Welche Kraft braucht man mindestens, um einen Wagen mit $1\,\text{kg}$ darauf zu halten (Reibung vernachlässigt)? [Aufgabe laden](?body=cart&a=20&km=1&fz=1&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F_H = F_G \cdot \frac{h}{l} = 9{,}81\,\text{N} \cdot 0{,}34 \approx 3{,}3\,\text{N}$ – etwa ein Drittel der Gewichtskraft. (Die Simulation zeigt mit $\alpha = 20^\circ$ genauer $3{,}36\,\text{N}$.) [Prüfen](?body=cart&a=20&km=1&fz=3.4)

</details>

### Aufgabe 3: Rutscht der Klotz?

Ein Holzklotz ($\mu_H = 0{,}5$) liegt auf einer Ebene mit $\alpha = 25^\circ$. Rutscht er von allein los? [Aufgabe laden](?a=25&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\tan 25^\circ \approx 0{,}47 < 0{,}5$ – der Klotz haftet. Er rutscht erst ab $\alpha_G = \arctan 0{,}5 \approx 26{,}6^\circ$. [Bei 27° prüfen](?a=27)

</details>

### Aufgabe 4: Beschleunigung

Wie stark beschleunigt der Holzklotz ($\mu_G = 0{,}3$) bei $\alpha = 35^\circ$? Wie lange braucht er für $40\,\text{cm}$? [Aufgabe laden](?a=35&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$a = 9{,}81\,\tfrac{\text{m}}{\text{s}^2} \cdot (\sin 35^\circ - 0{,}3 \cdot \cos 35^\circ) \approx 3{,}22\,\tfrac{\text{m}}{\text{s}^2}$. Aus $s = \frac12 a t^2$ folgt $t = \sqrt{\frac{2 \cdot 0{,}4\,\text{m}}{3{,}22\,\text{m/s}^2}} \approx 0{,}50\,\text{s}$.

</details>

### Aufgabe 5: Reibungszahl messen

Ein Klotz aus unbekanntem Material beginnt bei $\alpha = 31^\circ$ zu rutschen. Wie groß ist die Haftreibungszahl? Prüfe mit eigenen Werten. [Prüfen](?mat=custom&mh=0.6&mg=0.45&a=31)

<details>
<summary>Lösung anzeigen</summary>

$\mu_H = \tan 31^\circ \approx 0{,}60$. Bei $30^\circ$ haftet der Klotz noch, bei $31^\circ$ rutscht er.

</details>

### Aufgabe 6: Hinaufziehen

Mit welcher Kraft muss man den Holzklotz ($m = 1\,\text{kg}$, $\mu_G = 0{,}3$) bei $\alpha = 20^\circ$ ziehen, damit er gleichmäßig hinaufgleitet? Warum braucht man zum Anfahren mehr?

<details>
<summary>Lösung anzeigen</summary>

$F_Z = F_H + \mu_G \cdot F_N = 3{,}36\,\text{N} + 0{,}3 \cdot 9{,}22\,\text{N} \approx 6{,}1\,\text{N}$. Zum Anfahren muss erst die größere Haftreibung überwunden werden: $F_H + \mu_H \cdot F_N \approx 8{,}0\,\text{N}$. [Ausprobieren](?km=1&fz=8.1)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Kraftzerlegung an der schiefen Ebene (zeichnerisch über das Kräftedreieck, mit $h/l$ oder trigonometrisch), Reibung und Grenzwinkel, schiefe Ebene als Kraftwandler (Klasse 8–10); die Bewegungsgleichung $a = g(\sin\alpha - \mu_G\cos\alpha)$ eher ab Klasse 10.
- **Bezeichnungen:** Die Komponente der Gewichtskraft senkrecht zur Ebene heißt hier Normalkraft $F_N$. Manche Lehrwerke unterscheiden davon die gleich große Kraft der Unterlage auf den Körper.
- **Modell:** Ebene $1\,\text{m}$ lang, $g = 9{,}81\,\tfrac{\text{N}}{\text{kg}}$. Die Reibungszahlen der Materialpaare sind **Richtwerte**; reale Werte hängen stark von Oberfläche, Feuchtigkeit und Sauberkeit ab. Der Wagen hat eine sehr kleine Rollreibung ($0{,}005$). Vor dem Loslassen hält die Hand den Körper; deshalb ist die angezeigte Haftreibung höchstens $F_{R,\max}$. Am unteren Ende hält ein Anschlag den Körper.
- **Messreihe:** Mit eingehängtem Kraftmesser lässt sich ein Messwert nur eintragen, wenn der Körper mit dieser Zugkraft liegen bleibt. Beim Wagen liegen die Messpunkte auf der Kurve $F_H(\alpha)$; beim Klotz gibt es wegen der Haftreibung einen ganzen Bereich von Haltekräften – ein guter Anlass zum Diskutieren.
- **Typische Fehlvorstellungen:**
  - „Die Normalkraft ist immer gleich der Gewichtskraft.“ – Auf der schiefen Ebene ist sie kleiner: $F_N = F_G \cdot \cos\alpha$.
  - „Schwere Körper rutschen früher.“ – Der Grenzwinkel hängt nur von $\mu_H$ ab, nicht von der Masse.
  - „Die Reibungskraft ist immer $\mu \cdot F_N$.“ – Die Haftreibung ist nur so groß wie nötig, höchstens $\mu_H \cdot F_N$.
  - „Mit der schiefen Ebene spart man Arbeit.“ – Man spart Kraft, muss aber einen längeren Weg zurücklegen.
