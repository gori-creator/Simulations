## Worum geht es?

Bei Drehbewegungen gibt es zu jeder Größe der geradlinigen Bewegung ein Gegenstück:

| geradlinig | Drehung |
| --- | --- |
| Weg $s$ | Drehwinkel $\varphi$ |
| Geschwindigkeit $v$ | Winkelgeschwindigkeit $\omega$ |
| Masse $m$ | **Trägheitsmoment** $J$ |
| Impuls $p = m \cdot v$ | **Drehimpuls** $L = J \cdot \omega$ |
| Bewegungsenergie $\frac{1}{2} m v^2$ | Rotationsenergie $\frac{1}{2} J \omega^2$ |

### Trägheitsmoment

Wie schwer sich ein Körper in Drehung versetzen lässt, hängt nicht nur von seiner Masse ab, sondern auch davon, **wie weit die Masse von der Drehachse entfernt** ist. Für eine Punktmasse im Abstand $r$ gilt $J = m \cdot r^2$ – doppelter Abstand bedeutet vierfaches Trägheitsmoment.

### Drehimpulserhaltung

Wirkt kein Drehmoment von außen, bleibt der Drehimpuls erhalten:

$$
L = J_1 \cdot \omega_1 = J_2 \cdot \omega_2
$$

Zieht eine Eiskunstläuferin die Arme an, wird $J$ kleiner – also muss $\omega$ größer werden. Die Rotationsenergie nimmt dabei zu: Die Läuferin verrichtet Arbeit, wenn sie die Arme gegen die Fliehkraft heranzieht.

### Wettrollen

Rollen verschiedene Körper gleicher Masse und gleichen Radius eine schiefe Ebene hinab, gewinnt der Körper, dessen Masse **nah an der Achse** liegt. Denn ein Teil der Lageenergie geht in die Drehung; je größer das Trägheitsmoment, desto weniger bleibt für die Geschwindigkeit:

$$
a = \frac{g \cdot \sin\alpha}{1 + \frac{J}{m r^2}}
$$

Für die Vollkugel ist $\frac{J}{m r^2} = \frac{2}{5}$, für die Scheibe $\frac{1}{2}$, für den Ring $1$. Eine reibungsfrei gleitende Kiste dreht sich gar nicht und ist am schnellsten.

## Ausprobieren

- [Arme ausgestreckt](?mode=pirouette&r=0.8) – dann den Regler langsam nach links ziehen.
- [Arme angezogen](?mode=pirouette&r=0.2): Wievielmal schneller dreht sich die Läuferin?
- [Wettrollen](?mode=rollen&alpha=15): Tippe vorher, wer gewinnt, und drücke „Loslassen“.

## Aufgaben

**1. Pirouette.** Die Läuferin dreht sich mit ausgestreckten Armen (0,8 m) einmal pro Sekunde. Ihr Trägheitsmoment sinkt beim Anziehen der Arme von $5{,}68\,\text{kg m}^2$ auf $0{,}88\,\text{kg m}^2$. Wie schnell dreht sie sich dann? [Aufgabe laden](?mode=pirouette&r=0.2&w0=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\omega_2 = \omega_1 \cdot \frac{J_1}{J_2} = 1\,\tfrac{1}{\text{s}} \cdot \frac{5{,}68}{0{,}88} \approx 6{,}4\,\tfrac{1}{\text{s}}$ – mehr als sechs Umdrehungen pro Sekunde.

</details>

**2. Woher kommt die Energie?** Berechne die Rotationsenergie vorher und nachher. Woher kommt der Unterschied? [Aufgabe laden](?mode=pirouette&r=0.2&w0=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

Vorher: $E = \frac{1}{2} \cdot 5{,}68 \cdot (2\pi)^2\,\text{J} \approx 112\,\text{J}$. Nachher: $E = \frac{1}{2} \cdot 0{,}88 \cdot (2\pi \cdot 6{,}44)^2\,\text{J} \approx 722\,\text{J}$. Die Läuferin muss die Arme mit Kraft heranziehen; diese Arbeit steckt jetzt in der Drehung.

</details>

**3. Wettrollen.** Kugel, Scheibe und Ring (gleiche Masse und gleicher Radius) rollen eine 2 m lange Rampe mit 15° Neigung hinab. In welcher Reihenfolge kommen sie an? Berechne die Zeit für die Kugel. [Aufgabe laden](?mode=rollen&alpha=15&_hide=1)

<details><summary>Lösung anzeigen</summary>

Kugel, dann Scheibe, dann Ring. Kugel: $a = \frac{9{,}81 \cdot \sin 15°}{1{,}4} \approx 1{,}81\,\tfrac{\text{m}}{\text{s}^2}$, also $t = \sqrt{\frac{2 \cdot 2\,\text{m}}{1{,}81\,\text{m/s}^2}} \approx 1{,}49\,\text{s}$ (Ring: 1,78 s).

</details>

**4. Masse egal?** Gewinnt eine schwere Kugel gegen eine leichte Kugel gleicher Größe?

<details><summary>Lösung anzeigen</summary>

Nein – beide kommen gleichzeitig an. In der Formel kommt nur das Verhältnis $\frac{J}{m r^2}$ vor, und das ist für alle Vollkugeln $\frac{2}{5}$.

</details>

## Ideen für den Unterricht

- **Versuch:** Drehstuhl mit Hanteln in den Händen – Arme ausstrecken und anziehen.
- **Wettrollen:** Dosen mit flüssigem und festem Inhalt, volle und leere Rollen um die Wette rollen lassen.
- **Alltag:** Warum sind Turmspringer im Salto zusammengekauert? Warum hat ein Fahrradkreisel eine schwere Felge?
