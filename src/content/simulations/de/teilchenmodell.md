---
description: "Interaktive Simulation zum Teilchenmodell – Eis, Wasser und Wasserdampf im Teilchenbild, Temperatur als Maß für die Teilchenbewegung, Schmelz- und Siedeplateau im live gezeichneten Temperatur-Zeit-Diagramm und Diffusion von Tinte in kaltem und warmem Wasser."
---

## Worum geht es?

Alle Stoffe bestehen aus winzigen **Teilchen**, die sich ständig bewegen. Zwischen den Teilchen ist **nichts** – kein Wasser, keine Luft, leerer Raum. Die Teilchen ziehen sich gegenseitig an, wenn sie sich nahe sind.

- **fest** (Eis): Die Teilchen sitzen auf festen Plätzen in einem regelmäßigen Gitter und **schwingen** um diese Plätze. Die Anziehung hält sie zusammen – im Bild als kleine Federn gezeichnet.
- **flüssig** (Wasser): Die Teilchen halten noch zusammen, sind aber nicht mehr an Plätze gebunden. Sie **gleiten aneinander vorbei** – deshalb passt sich eine Flüssigkeit jeder Gefäßform an.
- **gasförmig** (Wasserdampf): Die Teilchen sind so schnell, dass die Anziehung sie nicht mehr festhält. Sie **fliegen frei** und stoßen aneinander und an die Wände; das Gas füllt den ganzen verfügbaren Raum.

**Temperatur und Teilchenbewegung:** Je höher die Temperatur, desto schneller bewegen sich die Teilchen im Mittel. Genauer: Die mittlere Bewegungsenergie eines Teilchens ist proportional zur **absoluten Temperatur** $T$ in Kelvin,

$$
T = \vartheta + 273\,\text{K}, \qquad E_\text{kin} = \tfrac{3}{2}\, k \cdot T \quad (k \approx 1{,}38 \cdot 10^{-23}\,\tfrac{\text{J}}{\text{K}}).
$$

Bei $\vartheta = -273{,}15\,°\text{C}$ ($T = 0\,\text{K}$, **absoluter Nullpunkt**) würde die Teilchenbewegung aufhören; kälter geht es nicht. Wassermoleküle sind bei $20\,°\text{C}$ im Mittel etwa $590\,\frac{\text{m}}{\text{s}}$ schnell – aber nicht alle gleich schnell: Das **Histogramm** zeigt, wie sich die Geschwindigkeiten verteilen. In der Simulation zeigt die **Farbe** jedes Teilchens seine Geschwindigkeit (blau langsam, rot schnell).

**Schmelzen und Sieden:** Wird Eis gleichmäßig geheizt, steigt die Temperatur zunächst. Bei $0\,°\text{C}$ bleibt sie stehen, bis alles geschmolzen ist – die zugeführte Energie wird gebraucht, um die Teilchen aus dem Gitter zu lösen, nicht um sie schneller zu machen. Das Gleiche passiert bei $100\,°\text{C}$ beim Sieden. Im **Temperatur-Zeit-Diagramm** entstehen so waagrechte Abschnitte (Plateaus). Die nötigen Energien für $m = 0{,}5\,\text{kg}$ Wasser:

$$
Q_\text{s} = m \cdot q_\text{s} = 0{,}5\,\text{kg} \cdot 334\,\tfrac{\text{kJ}}{\text{kg}} = 167\,\text{kJ}, \qquad Q_\text{v} = m \cdot q_\text{v} = 0{,}5\,\text{kg} \cdot 2257\,\tfrac{\text{kJ}}{\text{kg}} \approx 1129\,\text{kJ}.
$$

Bei einer Leistung $P$ dauert ein Plateau $t = \frac{Q}{P}$. Beim **Erstarren** und **Kondensieren** wird dieselbe Energie wieder abgegeben.

**Diffusion:** Gibt man einen Tropfen Tinte in Wasser, verteilt er sich auch ohne Umrühren von selbst, weil die Teilchen ständig ihre Plätze wechseln. In warmem Wasser geht das deutlich schneller.

**Zur Darstellung:** Das Teilchenbild ist ein ebenes Modell mit wenigen Teilchen; die Teilchenbewegung ist stark verlangsamt, das Heizen läuft im Zeitraffer (1 s im Bild entspricht 40 s). Der Kolben mit Gewicht hält den Druck konstant, deshalb schiebt der entstehende Dampf ihn nach oben (in Wirklichkeit nimmt Dampf etwa das 1700-Fache des Wasservolumens ein). Die Wärmeabgabe an die Umgebung ist vernachlässigt. Bei der Diffusion sind Strömungen im Wasser ausgeschlossen; in einem echten Glas würde die Durchmischung allein durch Diffusion viele Stunden bis Tage dauern.

## Ausprobieren

1. Beobachte das Eis bei $-20\,°\text{C}$. Bewegen sich die Teilchen? Tippe ein Teilchen an und verfolge seinen Weg. [Eis](?T=-20)
2. Schalte „Heizen“ ein. Was passiert mit der Temperatur, während das Eis schmilzt? Was machen die Teilchen in dieser Zeit? [Vom Eis zum Dampf](?heat=heat)
3. Vergleiche die Längen der beiden Plateaus im Diagramm. Welcher Übergang braucht mehr Energie?
4. Verdopple die Leistung der Platte. Was ändert sich am Diagramm – und was nicht? [Doppelte Leistung](?heat=heat&pw=2000)
5. Verfolge im Dampf ein einzelnes Teilchen. Wie sieht sein Weg aus, verglichen mit einem Teilchen im Eis oder im Wasser? [Dampf mit Pfeilen](?T=120&arr=1)
6. Vergleiche das Histogramm bei $-20\,°\text{C}$ und bei $120\,°\text{C}$. Wohin wandert der Mittelwert? Gibt es auch im Eis schnelle Teilchen?
7. Kühle den Dampf ab. In welcher Reihenfolge laufen die Übergänge jetzt ab? [Dampf abkühlen](?T=130&heat=cool&pw=2000)
8. Wechsle zur Diffusion. In welchem Glas ist die Tinte zuerst gleichmäßig verteilt? Mache die Temperaturen gleich – was erwartest du? [Diffusion](?mode=diff)

## Aufgaben

### Aufgabe 1: Celsius und Kelvin

Rechne um: $20\,°\text{C}$, $-20\,°\text{C}$ und $100\,°\text{C}$ in Kelvin. Um wie viel Prozent ist die mittlere Bewegungsenergie der Teilchen bei $100\,°\text{C}$ größer als bei $20\,°\text{C}$? [Aufgabe laden](?T=20&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$293\,\text{K}$, $253\,\text{K}$ und $373\,\text{K}$. Die Bewegungsenergie ist proportional zu $T$: $\frac{373}{293} \approx 1{,}27$, also etwa $27\,\%$ mehr – nicht „fünfmal so viel“, wie man vom Verhältnis $100 : 20$ vermuten könnte. [In der Simulation zeigen](?T=100)

</details>

### Aufgabe 2: Wie lange dauert das Schmelzen?

$0{,}5\,\text{kg}$ Eis von $0\,°\text{C}$ wird mit $P = 500\,\text{W}$ geheizt. Wie lange bleibt die Temperatur bei $0\,°\text{C}$? [Aufgabe laden](?T=0&pw=500&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$Q = m \cdot q_\text{s} = 0{,}5\,\text{kg} \cdot 334\,\frac{\text{kJ}}{\text{kg}} = 167\,\text{kJ}$, $t = \frac{Q}{P} = \frac{167\,000\,\text{J}}{500\,\text{W}} = 334\,\text{s} \approx 5{,}6\,\text{min}$. [In der Simulation zeigen](?T=0&pw=500&heat=heat)

</details>

### Aufgabe 3: Diagramm lesen

Ein Schüler heizt Eis mit konstanter Leistung und erhält ein Diagramm, in dem das zweite Plateau fast siebenmal so lang ist wie das erste. Erkläre, woran das liegt.

<details>
<summary>Lösung anzeigen</summary>

Das erste Plateau gehört zum Schmelzen, das zweite zum Sieden. Bei gleicher Leistung ist die Dauer proportional zur nötigen Energie: $\frac{2257}{334} \approx 6{,}8$. Beim Verdampfen müssen die Teilchen ganz voneinander getrennt werden, beim Schmelzen lösen sie sich nur aus dem Gitter und halten noch zusammen. [In der Simulation zeigen](?heat=heat&pw=2000)

</details>

### Aufgabe 4: Warum steigt die Temperatur nicht?

Während des Siedens wird ständig Energie zugeführt, das Thermometer zeigt aber $100\,°\text{C}$. Wo bleibt die Energie? Beschreibe mit dem Teilchenmodell.

<details>
<summary>Lösung anzeigen</summary>

Die Temperatur ist ein Maß für die mittlere Bewegungsenergie der Teilchen – die ändert sich nicht. Die Energie wird gebraucht, um Teilchen gegen die Anziehung aus der Flüssigkeit zu lösen. Sie steckt danach im Abstand der Teilchen (Lageenergie) und wird beim Kondensieren wieder frei.

</details>

### Aufgabe 5: Tee und Zucker

Warum löst sich ein Stück Zucker in heißem Tee schneller auf und verteilt sich schneller als in kaltem? [Aufgabe laden](?mode=diff&tc=10&tw=80&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

In heißem Wasser bewegen sich die Teilchen schneller und wechseln viel häufiger ihre Plätze. Dadurch lösen sich die Zuckerteilchen schneller vom Stück und werden schneller im ganzen Tee verteilt (Diffusion). Umrühren beschleunigt das zusätzlich. [In der Simulation zeigen](?mode=diff&tc=10&tw=80)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 7/8, Wärmelehre (Teilchenmodell, Temperatur, Aggregatzustände); gut als Begleitung zum Realexperiment „Eis schmelzen und Wasser sieden“ mit Thermometer und Stoppuhr. Die Klasse kann zuerst ihr eigenes Messdiagramm skizzieren und dann mit der Simulation vergleichen.
- **Vorhersagen lassen:** Vor dem Heizen fragen, wie das Temperatur-Zeit-Diagramm aussehen wird. Viele erwarten eine gerade Linie – das Plateau ist dann ein echter Überraschungsmoment.
- **Ein Teilchen verfolgen:** Die Spuren im Eis (Zittern um einen Platz), im Wasser (Wandern) und im Dampf (gerade Stücke mit Knicken) eignen sich gut zum Beschreiben und Zeichnen.
- **Diffusion:** Parallel ein Realversuch mit Tinte oder Lebensmittelfarbe in kaltem und warmem Wasser; die Simulation macht sichtbar, was im Glas nicht zu sehen ist.
- **Häufige Stolpersteine:**
  - „Zwischen den Teilchen ist Wasser (bzw. Luft).“ – Zwischen den Teilchen ist leerer Raum.
  - „Im Eis bewegen sich die Teilchen nicht.“ – Sie schwingen um ihre Plätze; erst am absoluten Nullpunkt käme die Bewegung zum Stillstand.
  - „Die Teilchen selbst werden beim Erwärmen größer oder wärmer.“ – Ein einzelnes Teilchen hat keine Temperatur; es wird nur schneller, der Abstand der Teilchen wächst.
  - „Beim Sieden wird das Wasser immer heißer.“ – Bei Normaldruck bleibt es bei $100\,°\text{C}$, solange noch Wasser da ist.
  - „Alle Teilchen sind bei einer Temperatur gleich schnell.“ – Die Geschwindigkeiten sind verteilt; die Temperatur gehört zum Mittelwert.
- **Bezug zum Lehrplan:** Teilchenmodell, Temperatur und innere Energie, Übergänge zwischen den Aggregatzuständen; Celsius- und Kelvin-Skala. Die Formel $E_\text{kin} = \frac{3}{2} k T$ ist als Ausblick gedacht.
