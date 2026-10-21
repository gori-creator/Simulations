---
description: "Interaktive Simulation zum Laden und Entladen eines Kondensators: RC-Kreis mit Umschalter, fließende Elektronen, U(t)- und I(t)-Diagramm mit Tangente, Zeitkonstante τ = R · C, Halbwertszeit und Energie W = ½ C U²."
---

## Worum geht es?

Ein **Kondensator** speichert elektrische Ladung: Auf der einen Platte sammeln sich Elektronen, auf der anderen fehlen sie. Die Ladung $Q$ ist proportional zur Spannung, $Q = C \cdot U$, mit der **Kapazität** $C$ (Einheit Farad, $1\,\text{F} = 1\,\frac{\text{C}}{\text{V}}$). Ein Farad ist sehr viel; übliche Kondensatoren haben Kapazitäten in µF ($10^{-6}\,\text{F}$), nF ($10^{-9}\,\text{F}$) oder pF ($10^{-12}\,\text{F}$). Wie groß $C$ ist, hängt vom Bau ab, beim Plattenkondensator zum Beispiel $C = \varepsilon_0 \cdot \varepsilon_r \cdot \frac{A}{d}$.

**Laden (Schalterstellung 1):** Der leere Kondensator wird über einen Widerstand $R$ an die Spannung $U_0$ gelegt. Zu Beginn liegt die ganze Spannung am Widerstand, es fließt der größte Strom

$$
I_0 = \frac{U_0}{R} .
$$

Je voller der Kondensator wird, desto größer seine Gegenspannung $U_C$ und desto kleiner der Strom. Die Spannung nähert sich $U_0$ immer langsamer:

$$
U_C(t) = U_0 \cdot \left(1 - e^{-t/\tau}\right), \qquad I(t) = I_0 \cdot e^{-t/\tau} .
$$

**Entladen (Schalterstellung 2):** Der Kondensator wird über den Widerstand kurzgeschlossen. Spannung und Strom fallen exponentiell ab, der Strom fließt jetzt in die Gegenrichtung (im Diagramm negativ):

$$
U_C(t) = U_0 \cdot e^{-t/\tau}, \qquad I(t) = -I_0 \cdot e^{-t/\tau} .
$$

Wie schnell das geht, bestimmt die **Zeitkonstante**

$$
\tau = R \cdot C .
$$

Was sie bedeutet:

- **Nach $t = \tau$:** Beim Laden hat die Spannung 63 % ihres Endwerts erreicht. Beim Entladen ist sie auf 37 % gefallen ($e^{-1} \approx 0{,}37$).
- **Tangente bei $t = 0$:** Sie trifft den Endwert genau bei $t = \tau$. So lässt sich $\tau$ aus einer Messkurve ablesen.
- **Halbwertszeit $t_{1/2} = \tau \cdot \ln 2 \approx 0{,}69\,\tau$:** Nach dieser Zeit ist der Abstand zum Endwert halbiert, nach $2\,t_{1/2}$ geviertelt.
- **Nach etwa $5\,\tau$:** Der Vorgang gilt als abgeschlossen (über 99 %).

Der volle Kondensator speichert die **Energie**

$$
W = \tfrac12 \cdot C \cdot U^2 .
$$

**Zur Darstellung:**

- Die Punkte im Stromkreis sind Elektronen. Sie laufen entgegen der technischen Stromrichtung (roter Pfeil), ihr Tempo ist proportional zur Stromstärke.
- Die Zahl der Plus- und Minuszeichen auf den Platten wächst mit $U_C$.
- Der Widerstand leuchtet, solange Strom fließt, denn dort wird Energie in Wärme umgewandelt.
- Ist $\tau$ sehr klein oder sehr groß, läuft das Bild im Zeitraffer bzw. in Zeitlupe (Anzeige oben rechts). Die Diagramme zeigen immer die echte Zeit.

## Ausprobieren

1. Beobachte Elektronen, Platten und Diagramme beim Laden. Wann fließt der größte Strom? [Laden](?sw=charge)
2. Tippe den Schalter im Bild an, solange der Kondensator noch lädt. Von welcher Spannung aus beginnt das Entladen? [Laden](?sw=charge)
3. Lies an der Tangente die Zeitkonstante ab und vergleiche mit $R \cdot C$. [Mit Tangente](?tan=1)
4. Verdopple den Widerstand bzw. die Kapazität. Wie ändern sich $\tau$ und $I_0$? [R = 20 kΩ](?R=20) · [C = 200 µF](?C=200)
5. Entladen mit Halbwertszeit: Nach wie vielen Halbwertszeiten ist nur noch ein Achtel der Spannung übrig? [Halbwertszeit](?sw=discharge&half=1&tan=0)

## Aufgaben

### Aufgabe 1: Zeitkonstante und Anfangsstrom

Ein Kondensator mit $C = 100\,\mu\text{F}$ wird über $R = 10\,\text{k}\Omega$ an $U_0 = 10\,\text{V}$ geladen. Berechne $\tau$, $I_0$ und die Spannung nach $t = \tau$. [Aufgabe laden](?tan=0&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\tau = R \cdot C = 10^4\,\Omega \cdot 10^{-4}\,\text{F} = 1{,}0\,\text{s}$, $I_0 = \frac{10\,\text{V}}{10\,\text{k}\Omega} = 1{,}0\,\text{mA}$,
$U_C(\tau) = 10\,\text{V} \cdot (1 - e^{-1}) \approx 6{,}32\,\text{V}$. [In der Simulation zeigen](?tan=1)

</details>

### Aufgabe 2: Halbwertszeit

Wie lange dauert es, bis derselbe Kondensator beim Entladen nur noch $5\,\text{V}$ hat? Und bis $2{,}5\,\text{V}$? [Aufgabe laden](?sw=discharge&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$t_{1/2} = \tau \cdot \ln 2 \approx 0{,}693\,\text{s}$; bis $2{,}5\,\text{V}$ dauert es zwei Halbwertszeiten, also etwa $1{,}39\,\text{s}$. [In der Simulation zeigen](?sw=discharge&half=1&tan=0)

</details>

### Aufgabe 3: Energie

Wie viel Energie speichert der Kondensator ($100\,\mu\text{F}$) bei $10\,\text{V}$? Wie viel ist es bei halber Spannung? [Aufgabe laden](?val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$W = \tfrac12 \cdot 10^{-4}\,\text{F} \cdot (10\,\text{V})^2 = 5\,\text{mJ}$. Bei halber Spannung nur ein Viertel: $1{,}25\,\text{mJ}$. [In der Simulation zeigen](?sw=charge)

</details>

### Aufgabe 4: Wann ist der Kondensator voll?

Derselbe Kondensator ($100\,\mu\text{F}$, $10\,\text{k}\Omega$, $10\,\text{V}$) wird geladen. Welche Spannung hat er nach $2\,\tau$ und nach $5\,\tau$? Wie viel Ladung trägt er, wenn er voll ist? [Aufgabe laden](?val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Nach $2\,\tau$: $U_C = 10\,\text{V} \cdot (1 - e^{-2}) \approx 8{,}65\,\text{V}$, also etwa 86 %. Nach $5\,\tau$: $U_C = 10\,\text{V} \cdot (1 - e^{-5}) \approx 9{,}93\,\text{V}$, also über 99 %. Voll geladen: $Q = C \cdot U_0 = 10^{-4}\,\text{F} \cdot 10\,\text{V} = 10^{-3}\,\text{C} = 1\,\text{mC}$. Am Ende des Vorgangs ($t = 5\,\text{s}$) zeigt die Simulation $U_C = 9{,}93\,\text{V}$. [In der Simulation zeigen](?sw=charge)

</details>

## Ideen für den Unterricht

- Den Realversuch mit großem Elko (z. B. 1000 µF, 10 kΩ, Messwerterfassung) aufnehmen und Kurven sowie $\tau$ mit der Simulation vergleichen.
- Die Tangentenmethode und die Halbwertszeitmethode zur Bestimmung von $\tau$ gegenüberstellen.
- **Typische Stolpersteine:**
  - „Durch den Kondensator fließt Strom.“ – Die Ladungen fließen nur in den Zuleitungen; zwischen den Platten ist eine Isolierschicht.
  - „Nach $2\,\tau$ ist der Kondensator voll.“ – Erst nach etwa $5\,\tau$ ist er praktisch voll; theoretisch nie ganz.
  - „Beim Entladen fließt der Strom in dieselbe Richtung.“ – Er kehrt sich um, deshalb ist $I$ im Diagramm negativ.
