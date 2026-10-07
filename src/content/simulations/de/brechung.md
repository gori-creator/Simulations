---
description: Interaktive Simulation zur Lichtbrechung und Totalreflexion – Laser auf der optischen Scheibe drehen, Brechungsgesetz prüfen und Grenzwinkel finden.
---

## Worum geht es?

Trifft Licht schräg auf die Grenzfläche zweier durchsichtiger Stoffe, wird es teilweise **reflektiert** und teilweise **gebrochen**, also abgeknickt. Alle Winkel misst man zum **Lot**, der Senkrechten auf der Grenzfläche.

- **Reflexion:** Einfallswinkel = Reflexionswinkel ($\alpha' = \alpha$).
- **Brechung:** Beim Übergang in den **optisch dichteren** Stoff (größerer Brechungsindex $n$) wird das Licht **zum Lot hin** gebrochen, beim Übergang in den optisch dünneren Stoff **vom Lot weg**.

Das **Brechungsgesetz von Snellius** beschreibt das genau:

$$
n_1 \cdot \sin\alpha = n_2 \cdot \sin\beta
$$

**Totalreflexion:** Geht das Licht vom optisch dichteren in den dünneren Stoff, gibt es einen **Grenzwinkel** $\alpha_G$ mit $\sin\alpha_G = \frac{n_2}{n_1}$. Ist der Einfallswinkel größer, wird das Licht vollständig reflektiert. Beispiele: Wasser → Luft $48{,}8^\circ$, Glas → Luft $41{,}1^\circ$, Diamant → Luft $24{,}4^\circ$.

Der Brechungsindex gibt auch an, wie stark Licht im Stoff langsamer ist: $c = \frac{c_0}{n}$.

## Ausprobieren

1. Ziehe den Laser über den Winkelmesser. Wann wird das Licht zum Lot hin gebrochen, wann vom Lot weg?
2. Was passiert bei $\alpha = 0^\circ$? [Senkrechter Einfall](?alpha=0)
3. Lass das Licht von unten aus dem Wasser kommen und vergrößere den Winkel langsam. [Wasser → Luft](?from=bottom&alpha=30)
4. Drücke **Abspielen**: Der Laser schwenkt automatisch. Achte auf die Helligkeit der Strahlen.

## Aufgaben

### Aufgabe 1: Brechungswinkel berechnen

Licht fällt aus Luft unter $\alpha = 40^\circ$ auf Wasser ($n = 1{,}33$). Berechne den Brechungswinkel. [Aufgabe laden](?alpha=40&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$\sin\beta = \frac{1{,}00 \cdot \sin 40^\circ}{1{,}33} \approx 0{,}483 \quad\Rightarrow\quad \beta \approx 28{,}9^\circ$$

</details>

### Aufgabe 2: Grenzwinkel

Berechne den Grenzwinkel der Totalreflexion für den Übergang Glas → Luft und prüfe ihn in der Simulation. [Aufgabe laden](?from=bottom&bottom=glas&alpha=35&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$\sin\alpha_G = \frac{1{,}00}{1{,}52} \quad\Rightarrow\quad \alpha_G \approx 41{,}1^\circ$$

Ab diesem Winkel verschwindet der gebrochene Strahl. [Totalreflexion zeigen](?from=bottom&bottom=glas&alpha=50)

</details>

### Aufgabe 3: Warum funkelt ein Diamant?

Vergleiche die Grenzwinkel von Glas und Diamant. Erkläre damit, warum ein geschliffener Diamant so stark funkelt. [Diamant](?from=bottom&bottom=diamant&alpha=30)

<details>
<summary>Lösung anzeigen</summary>

Der Grenzwinkel von Diamant ist mit $24{,}4^\circ$ sehr klein. Licht, das in den Diamanten eintritt, trifft innen meist unter einem größeren Winkel auf die Flächen und wird deshalb mehrfach total reflektiert, bis es oben wieder austritt – der Stein wirkt besonders hell.

</details>

### Aufgabe 4: Lichtleiter

In einer Glasfaser wird Licht über viele Kilometer geleitet, ohne seitlich auszutreten. Erkläre das mit der Totalreflexion.

<details>
<summary>Lösung anzeigen</summary>

Das Licht trifft flach (unter großem Einfallswinkel) auf die Wand der Faser. Weil dieser Winkel größer als der Grenzwinkel ist, wird es an der Wand immer wieder total reflektiert und bleibt in der Faser.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Optik in der Mittelstufe (Brechung, Totalreflexion), vertiefend mit dem Brechungsgesetz.
- **Optische Scheibe:** Die Darstellung entspricht dem Schulversuch mit Winkelscheibe. Die Helligkeit der Strahlen folgt den Fresnel-Formeln für unpolarisiertes Licht; so sieht man, dass auch bei der Brechung immer ein Teil reflektiert wird und der reflektierte Anteil kurz vor dem Grenzwinkel stark ansteigt.
- **Typische Fehlvorstellungen:**
  - Winkel werden zur Grenzfläche statt zum Lot gemessen.
  - „Bei Totalreflexion wird das Licht verschluckt.“
- **Bilder:** Der Laser kann durch ein Foto ersetzt werden (siehe `docs/BILDER.md`).
