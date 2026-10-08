---
description: "Interaktive Simulation zur Reihen- und Parallelschaltung – Glühlampen oder Widerstände in Reihe, parallel oder gemischt, Strom- und Spannungsmesser an wählbaren Stellen, Lampen herausdrehen, Ersatzwiderstand und Knotenregel."
---

## Worum geht es?

**Reihenschaltung:** Die Bauteile liegen hintereinander, es gibt nur einen einzigen Weg für den Strom.

- Die Stromstärke ist überall gleich: $I = I_1 = I_2$
- Die Spannung der Quelle teilt sich auf: $U = U_1 + U_2$
- Die Widerstände addieren sich zum **Ersatzwiderstand**: $R = R_1 + R_2$

Fällt ein Bauteil aus, ist der ganze Stromkreis unterbrochen. Zwei gleiche $6$-V-Lampen in Reihe an $6\,\text{V}$ erhalten je nur $3\,\text{V}$ und leuchten schwach; an $12\,\text{V}$ leuchten sie normal.

**Parallelschaltung:** Jedes Bauteil liegt in einem eigenen **Zweig** zwischen zwei **Verzweigungspunkten** (Knoten).

- An allen Zweigen liegt dieselbe Spannung: $U = U_1 = U_2$
- Die Ströme der Zweige addieren sich in der Hauptleitung (**Knotenregel**): $I = I_1 + I_2$
- Für den Ersatzwiderstand gilt

$$
\frac{1}{R} = \frac{1}{R_1} + \frac{1}{R_2}
$$

$R$ ist kleiner als jeder einzelne Widerstand. Fällt ein Zweig aus, arbeiten die anderen unverändert weiter – so sind die Geräte im Haushalt angeschlossen.

**Gemischte Schaltung:** Lampe 1 liegt in Reihe mit der Parallelschaltung aus Lampe 2 und 3:

$$
R = R_1 + \frac{R_2 \cdot R_3}{R_2 + R_3}
$$

**Messen:** Der Strommesser wird **in Reihe** in die Leitung geschaltet, der Spannungsmesser **parallel** zum Bauteil.

## Ausprobieren

1. Setze den Strommesser in der Reihenschaltung an verschiedene Stellen (nummerierte Kreise antippen). Wo ist der Strom am größten? [Reihenschaltung](?a1=1&a2=2)
2. Miss die Spannungen an beiden Lampen und dann an der Quelle. [Spannungen messen](?v1=1&v2=2)
3. Drehe eine Lampe heraus (antippen) – erst in der Reihen-, dann in der Parallelschaltung. [Drei in Reihe](?n=3) · [Drei parallel](?circ=parallel&n=3)
4. Vergleiche in der Parallelschaltung die Hauptleitung mit den Zweigen. [Knotenregel](?circ=parallel&n=3&a1=1&a2=2)
5. Welche Lampe leuchtet in der gemischten Schaltung am hellsten? Drehe dann Lampe 3 heraus. [Gemischte Schaltung](?circ=mixed)
6. Schließe zwei $6$-V-Lampen an $12\,\text{V}$ an – in Reihe und parallel. [12 V in Reihe](?U=12) · [12 V parallel](?U=12&circ=parallel)
7. Ersetze die Lampen durch Widerstände und vergleiche die Spannungen. [Widerstände in Reihe](?kind=res&n=3&v1=1&v2=3)

## Aufgaben

### Aufgabe 1: Zwei Lampen in Reihe

Zwei gleiche Lampen ($R = 12\,\Omega$) liegen in Reihe an $6\,\text{V}$. Berechne den Ersatzwiderstand, die Stromstärke und die Spannung an jeder Lampe. [Aufgabe laden](?a1=0&v1=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$R = 12\,\Omega + 12\,\Omega = 24\,\Omega$, $I = \frac{6\,\text{V}}{24\,\Omega} = 0{,}25\,\text{A}$, $U_1 = U_2 = 12\,\Omega \cdot 0{,}25\,\text{A} = 3\,\text{V}$. [Nachmessen](?a1=1&v1=1&v2=2)

</details>

### Aufgabe 2: Drei Lampen parallel

Drei solche Lampen liegen parallel an $6\,\text{V}$. Wie groß ist die Stromstärke in jedem Zweig und in der Hauptleitung? Wie groß ist der Ersatzwiderstand? [Aufgabe laden](?circ=parallel&n=3&a1=0&v1=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Jede Lampe erhält $6\,\text{V}$: $I_1 = I_2 = I_3 = 0{,}5\,\text{A}$. In der Hauptleitung $I = 1{,}5\,\text{A}$, also $R = \frac{6\,\text{V}}{1{,}5\,\text{A}} = 4\,\Omega$ – ein Drittel von $12\,\Omega$. [Nachmessen](?circ=parallel&n=3&a1=1&a2=2)

</details>

### Aufgabe 3: Zwei Widerstände parallel

$R_1 = 20\,\Omega$ und $R_2 = 30\,\Omega$ liegen parallel an $6\,\text{V}$. Berechne $I_1$, $I_2$, $I$ und $R$. [Aufgabe laden](?circ=parallel&kind=res&a1=0&v1=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$I_1 = \frac{6\,\text{V}}{20\,\Omega} = 0{,}3\,\text{A}$, $I_2 = \frac{6\,\text{V}}{30\,\Omega} = 0{,}2\,\text{A}$, $I = 0{,}5\,\text{A}$ und $R = \frac{6\,\text{V}}{0{,}5\,\text{A}} = 12\,\Omega$. Probe: $\frac{1}{20} + \frac{1}{30} = \frac{1}{12}$. [Nachmessen](?circ=parallel&kind=res&a1=1&a2=2)

</details>

### Aufgabe 4: Gemischte Schaltung

Warum leuchtet Lampe 1 heller als die Lampen 2 und 3? Was passiert, wenn man Lampe 3 herausdreht? [Aufgabe laden](?circ=mixed&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Durch Lampe 1 fließt der ganze Strom, er teilt sich danach auf Lampe 2 und 3 auf. Die Parallelschaltung aus 2 und 3 hat nur $6\,\Omega$, deshalb liegen an Lampe 1 $4\,\text{V}$ und an Lampe 2 und 3 je $2\,\text{V}$. Ohne Lampe 3 liegen Lampe 1 und 2 einfach in Reihe und erhalten je $3\,\text{V}$: Lampe 1 wird dunkler, Lampe 2 heller. [Zeigen](?circ=mixed&x3=1&v1=1&v2=2)

</details>

### Aufgabe 5: Lampen an 12 V

Zwei $6$-V-Lampen sollen an einer $12$-V-Quelle normal leuchten. Wie schaltest du sie? Was passiert bei der anderen Schaltung?

<details>
<summary>Lösung anzeigen</summary>

In Reihe: Jede Lampe erhält $6\,\text{V}$ und leuchtet normal. [Reihe](?U=12) Parallel liegen an jeder Lampe $12\,\text{V}$ – die doppelte Nennspannung. Die Wendeln überhitzen und brennen durch. [Parallel](?U=12&circ=parallel)

</details>

### Aufgabe 6: Schaltungen im Haushalt

Warum sind die Elektrogeräte im Haushalt parallel geschaltet und nicht in Reihe?

<details>
<summary>Lösung anzeigen</summary>

Jedes Gerät erhält so die volle Netzspannung, lässt sich unabhängig ein- und ausschalten und arbeitet weiter, wenn ein anderes ausfällt. In Reihe müssten sich die Geräte die Spannung teilen, und ein ausgeschaltetes Gerät würde alle anderen abschalten.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Gesetzmäßigkeiten der Reihen- und Parallelschaltung, Ersatzwiderstand und Knotenregel (Klasse 8/9). Zwei Strom- und zwei Spannungsmesser lassen sich an die nummerierten Messstellen bzw. an Bauteile und Quelle setzen – wie im Schülerversuch. Mit `a1=0&v1=0` und `_hide=1` werden daraus Rechenaufgaben, mit `sym=1` erscheinen die Lampen als Schaltzeichen.
- **Modell:** ideale Spannungsquelle, ideale Messgeräte, Leitungen ohne Widerstand. Die Glühlampen werden – wie meist im Unterricht – als feste Widerstände von $12\,\Omega$ ($6\,\text{V}$; $0{,}5\,\text{A}$) behandelt. Echte Glühlampen haben kalt einen kleineren Widerstand (siehe Simulation zum ohmschen Gesetz); die Helligkeitsunterschiede wären in Wirklichkeit etwas geringer. Die Helligkeit ergibt sich aus der Leistung über die Temperatur der Wendel; ab $9\,\text{V}$ an einer Lampe brennt sie durch.
- **Strom-Animation:** Die Punkte haben überall denselben Abstand (gleiche Elektronendichte im Metall), ihre Geschwindigkeit ist proportional zur Stromstärke. An den Verzweigungen sieht man so, wie sich der Strom aufteilt und wieder vereinigt.
- **Typische Fehlvorstellungen:**
  - „Der Strom wird von Lampe zu Lampe verbraucht – die erste Lampe in Reihe leuchtet am hellsten.“
  - „Die Batterie liefert immer denselben Strom.“ – In der Parallelschaltung fließt mehr Strom als in der Reihenschaltung.
  - „Mehr Lampen bedeuten immer mehr Widerstand.“ – Das gilt nur in Reihe; parallel sinkt der Ersatzwiderstand.
  - „An einer herausgedrehten Lampe liegt keine Spannung.“ – In der Reihenschaltung liegt an der Unterbrechung die volle Spannung.
