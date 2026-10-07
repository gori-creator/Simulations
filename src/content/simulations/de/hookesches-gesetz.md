---
description: "Interaktive Simulation zum Hookeschen Gesetz – Massestücke an eine Feder hängen, Verlängerung messen, Federhärte als Steigung der Ursprungsgeraden bestimmen, Federn hintereinander und nebeneinander, Elastizitätsgrenze."
---

## Worum geht es?

Hängt man ein Massestück an eine Schraubenfeder, zieht seine **Gewichtskraft** an der Feder:

$$
F_G = m \cdot g \qquad g = 9{,}81\,\tfrac{\text{N}}{\text{kg}}
$$

Ein Massestück von $100\,\text{g}$ wiegt also knapp $1\,\text{N}$. Die Feder wird länger, bis ihre **Federkraft** genauso groß ist wie die Gewichtskraft – dann hängt sie ruhig.

**Hookesches Gesetz:** Bei einer Schraubenfeder ist die **Verlängerung** $s$ proportional zur Kraft $F$:

$$
F = D \cdot s
$$

Doppelte Kraft bedeutet doppelte Verlängerung. Im **F-s-Diagramm** liegen die Messpunkte deshalb auf einer **Ursprungsgeraden**. Ihre Steigung ist die **Federhärte** $D = \frac{F}{s}$ (Einheit $\tfrac{\text{N}}{\text{m}}$). Eine Feder mit $D = 20\,\tfrac{\text{N}}{\text{m}} = 0{,}2\,\tfrac{\text{N}}{\text{cm}}$ wird von $1\,\text{N}$ um $5\,\text{cm}$ gedehnt. Je größer $D$, desto härter die Feder. Auf diesem Gesetz beruht der **Federkraftmesser**.

**Elastizitätsgrenze:** Das Gesetz gilt nur, solange die Feder **elastisch** verformt wird, also nach dem Entlasten wieder ihre alte Länge hat. Dehnt man sie zu stark, bleibt sie **verformt**; die Messpunkte liegen dann nicht mehr auf der Geraden.

**Zwei Federn:**

- **Hintereinander** trägt jede Feder die ganze Last, die Verlängerungen addieren sich: $\frac{1}{D} = \frac{1}{D_1} + \frac{1}{D_2}$. Zwei gleiche Federn sind zusammen halb so hart.
- **Nebeneinander** teilen sich die Federn die Last: $D = D_1 + D_2$. Zwei gleiche Federn sind zusammen doppelt so hart.

## Ausprobieren

1. Tippe auf den Kasten und hänge Massestücke nacheinander an. Warte jeweils, bis die Feder ruhig hängt – dann erscheint der Messpunkt im Diagramm. Oder drücke **Messreihe automatisch**.
2. Ziehe die Massestücke nach unten und lass los. Vergleiche die Kraftpfeile, während die Feder schwingt.
3. Nimm eine weichere Feder. Wie verändert sich die Gerade? [Weiche Feder](?D1=10&mp=20)
4. Überdehne die Feder und nimm danach alle Massestücke ab. [Überdehnen](?n=10&mp=100)
5. Vergleiche zwei Federn hintereinander und nebeneinander mit einer einzelnen Feder. [Hintereinander](?setup=series&mp=20) · [Nebeneinander](?setup=parallel&mp=100)

## Aufgaben

### Aufgabe 1: Gewichtskraft

An der Feder hängen sechs Massestücke zu je $50\,\text{g}$. Wie groß ist die Gewichtskraft?

<details>
<summary>Lösung anzeigen</summary>

$m = 300\,\text{g} = 0{,}3\,\text{kg}$, also $F_G = 0{,}3\,\text{kg} \cdot 9{,}81\,\tfrac{\text{N}}{\text{kg}} \approx 2{,}94\,\text{N}$. [In der Simulation zeigen](?n=6)

</details>

### Aufgabe 2: Federhärte bestimmen

Lies die Verlängerung am Maßstab ab und berechne die Federhärte. [Aufgabe laden](?n=4&fit=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F = 0{,}2\,\text{kg} \cdot 9{,}81\,\tfrac{\text{N}}{\text{kg}} \approx 1{,}96\,\text{N}$ und $s \approx 9{,}8\,\text{cm} = 0{,}098\,\text{m}$, also $D = \frac{F}{s} \approx \frac{1{,}96\,\text{N}}{0{,}098\,\text{m}} = 20\,\tfrac{\text{N}}{\text{m}}$. Genauer wird es mit mehreren Messpunkten und der Ursprungsgeraden.

</details>

### Aufgabe 3: Vorhersage

Eine Feder hat die Federhärte $D = 25\,\tfrac{\text{N}}{\text{m}}$. Wie weit wird sie von $300\,\text{g}$ gedehnt? Prüfe mit der Simulation.

<details>
<summary>Lösung anzeigen</summary>

$s = \frac{F}{D} = \frac{2{,}94\,\text{N}}{25\,\text{N/m}} \approx 0{,}118\,\text{m} = 11{,}8\,\text{cm}$. [Prüfen](?D1=25&n=6)

</details>

### Aufgabe 4: Kraftmesser bauen

Aus einer Feder mit $D = 50\,\tfrac{\text{N}}{\text{m}}$ soll ein Kraftmesser werden. In welchem Abstand müssen die Striche für $1\,\text{N}$, $2\,\text{N}$, $3\,\text{N}$ … stehen?

<details>
<summary>Lösung anzeigen</summary>

$s = \frac{1\,\text{N}}{50\,\text{N/m}} = 0{,}02\,\text{m}$ – alle $2\,\text{cm}$ ein Strich. Weil $F$ und $s$ proportional sind, ist die Skala gleichmäßig. [Ausprobieren](?D1=50&mp=100&n=5)

</details>

### Aufgabe 5: Zwei Federn

Zwei gleiche Federn mit je $D = 20\,\tfrac{\text{N}}{\text{m}}$ werden hintereinander gehängt und mit $200\,\text{g}$ belastet. Wie groß ist die Verlängerung? Und wenn die Federn nebeneinander hängen? [Aufgabe laden](?setup=series&n=4&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Hintereinander: $D = 10\,\tfrac{\text{N}}{\text{m}}$, also $s = \frac{1{,}96\,\text{N}}{10\,\text{N/m}} \approx 19{,}6\,\text{cm}$ – jede Feder trägt die volle Last und wird um $9{,}8\,\text{cm}$ gedehnt. Nebeneinander: $D = 40\,\tfrac{\text{N}}{\text{m}}$, also $s \approx 4{,}9\,\text{cm}$. [Nebeneinander zeigen](?setup=parallel&n=4)

</details>

### Aufgabe 6: Messbereich

Warum steht auf jedem Federkraftmesser ein höchster Messwert, den man nicht überschreiten soll?

<details>
<summary>Lösung anzeigen</summary>

Oberhalb der Elastizitätsgrenze wird die Feder bleibend verformt. Danach zeigt der Kraftmesser ohne Last nicht mehr null an, und $F$ und $s$ sind nicht mehr proportional – die Skala stimmt nicht mehr. [Überdehnen](?n=10&mp=100)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Kraft und Verformung, Gewichtskraft, Hookesches Gesetz und Federkraftmesser (Klasse 7/8). Hintereinander- und Nebeneinanderschaltung eignen sich als Vertiefung. Die Simulation nennt die Größe $D$ **Federhärte**; andere Lehrwerke sagen Federkonstante und schreiben die Verlängerung als $\Delta l$.
- **Messen wie im Experiment:** Ein Messwert wird erst eingetragen, wenn die Feder ruhig hängt. Mit `fit=0` wird die Ursprungsgerade ausgeblendet, sodass die Lernenden sie selbst einzeichnen. Die Messtabelle steht bei den Ergebnissen.
- **Modell:** Die Masse der Feder wird vernachlässigt; das Nachschwingen ist gedämpft (Dämpfung frei gewählt, nur qualitativ). Die Elastizitätsgrenze ist stark vereinfacht: Bis $25\,\text{cm}$ Verlängerung bleibt eine neue Feder elastisch, darüber gibt sie leichter nach (halbe Federhärte) und bleibt nach dem Entlasten länger. Echte Federn verhalten sich je nach Material unterschiedlich. Bei den nebeneinander hängenden Federn hängt die Last so, dass die Querstange waagerecht bleibt.
- **Typische Fehlvorstellungen:**
  - „Die **Länge** der Feder ist proportional zur Kraft.“ – proportional ist die **Verlängerung**.
  - „Masse und Gewichtskraft sind dasselbe.“ – $m$ in kg, $F_G$ in N.
  - „Zwei Federn hintereinander sind härter als eine.“ – sie sind weicher.
  - „Jeder Körper gehorcht dem Hookeschen Gesetz.“ – nur im elastischen Bereich und nicht jeder Körper (z. B. Gummiband).
