---
description: Interaktive Simulation zum Fadenpendel – Periodendauer messen, mit T = 2π√(l/g) vergleichen, Energieumwandlung, Dämpfung und große Auslenkungen untersuchen.
---

## Worum geht es?

Ein **Fadenpendel** besteht aus einem kleinen, schweren Körper an einem Faden der Länge $l$. Lenkt man es aus und lässt es los, schwingt es hin und her. Die Zeit für eine volle Hin- und Herbewegung heißt **Periodendauer** $T$.

Für **kleine Auslenkungen** (bis etwa $10^\circ$) gilt in sehr guter Näherung

$$
T_0 = 2\pi \sqrt{\frac{l}{g}}.
$$

Die Periodendauer hängt also nur von der **Länge** und vom **Ortsfaktor** $g$ ab – **nicht** von der Masse und (bei kleinen Winkeln) nicht von der Auslenkung. Ein viermal so langes Pendel schwingt doppelt so langsam.

Bei **großen Auslenkungen** wird die Periodendauer länger: bei $90^\circ$ etwa $18\,\%$, bei $120^\circ$ schon rund $37\,\%$.

**Energie:** Beim Schwingen wandelt sich Lageenergie in Bewegungsenergie um und zurück:

$$
E_\text{pot} = m g l (1 - \cos\varphi) \qquad E_\text{kin} = \tfrac{1}{2} m v^2
$$

Ohne Reibung bleibt die Summe gleich. Mit **Dämpfung** wird Energie in innere Energie umgewandelt, die Amplitude nimmt ab.

## Ausprobieren

1. Ziehe die Pendelkugel zur Seite und drücke **Loslassen**. Vergleiche die gemessene Periodendauer mit der Formel.
2. Verändere die Masse. Was passiert mit der Periodendauer?
3. Vervierfache die Länge, z. B. von $0{,}5\,\text{m}$ auf $2\,\text{m}$. [Langes Pendel](?l=2)
4. Lass das Pendel aus $120^\circ$ los und vergleiche mit der Kleinwinkelnäherung. [Große Auslenkung](?amp=120&compare=1)
5. Schalte die Dämpfung ein und beobachte die Energiebalken. [Gedämpft](?amp=40&damping=0.25)

## Aufgaben

### Aufgabe 1: Sekundenpendel

Wie lang muss ein Pendel sein, damit eine Periode genau $2\,\text{s}$ dauert (also jede Halbschwingung eine Sekunde)? [Ausprobieren](?l=1)

<details>
<summary>Lösung anzeigen</summary>

$$l = g \cdot \left(\frac{T}{2\pi}\right)^2 = 9{,}81 \cdot \left(\frac{2}{2\pi}\right)^2 \approx 0{,}994\,\text{m}$$

Ein Pendel von knapp einem Meter Länge – deshalb waren Pendeluhren oft so groß.

</details>

### Aufgabe 2: Länge und Periodendauer

Berechne die Periodendauern für $l = 0{,}5\,\text{m}$ und $l = 2\,\text{m}$. Welcher Zusammenhang besteht?

<details>
<summary>Lösung anzeigen</summary>

$T(0{,}5\,\text{m}) \approx 1{,}42\,\text{s}$ und $T(2\,\text{m}) \approx 2{,}84\,\text{s}$. Vierfache Länge ergibt doppelte Periodendauer, denn $T \sim \sqrt{l}$. [2 m zeigen](?l=2)

</details>

### Aufgabe 3: Pendel auf dem Mond

Wie groß ist die Periodendauer eines $1\,\text{m}$ langen Pendels auf dem Mond ($g = 1{,}62\,\tfrac{\text{m}}{\text{s}^2}$)?

<details>
<summary>Lösung anzeigen</summary>

$T = 2\pi \sqrt{1 / 1{,}62} \approx 4{,}94\,\text{s}$ – fast zweieinhalbmal so lang wie auf der Erde. [In der Simulation zeigen](?planet=mond)

</details>

### Aufgabe 4: Energie am tiefsten Punkt

Ein Pendel mit $l = 1\,\text{m}$ wird um $20^\circ$ ausgelenkt. Wie schnell ist die Kugel im tiefsten Punkt (ohne Reibung)?

<details>
<summary>Lösung anzeigen</summary>

Höhenunterschied $h = l(1 - \cos 20^\circ) \approx 0{,}060\,\text{m}$. Aus $m g h = \tfrac12 m v^2$ folgt $v = \sqrt{2 g h} \approx 1{,}09\,\tfrac{\text{m}}{\text{s}}$ – unabhängig von der Masse.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Mechanische Schwingungen (Oberstufe) sowie Energieerhaltung. Die Simulation rechnet die exakte Bewegungsgleichung $\ddot\varphi = -\tfrac{g}{l}\sin\varphi - \gamma\dot\varphi$ numerisch; die Kleinwinkelnäherung ($\sin\varphi \approx \varphi$) kann als zweites, durchscheinendes Pendel eingeblendet werden.
- **Messung:** Die gemessene Periodendauer ergibt sich aus aufeinanderfolgenden Nulldurchgängen in gleicher Richtung (gestrichelte Linien im Diagramm).
- **Typische Fehlvorstellungen:**
  - „Ein schwereres Pendel schwingt schneller.“
  - „Größere Auslenkung bedeutet kürzere Periodendauer, weil die Kugel schneller ist.“ – Bei kleinen Winkeln gleicht sich das genau aus, bei großen wird $T$ sogar länger.
- **Bilder:** Die Pendelkugel kann durch ein Foto ersetzt werden (siehe `docs/BILDER.md`).
