---
description: "Interaktive Simulation zum Fadenpendel – Kugel auslenken und loslassen, Kräfte und Energie live, φ(t) im Vergleich zur Kleinwinkelnäherung, Messreihe zur Bestimmung von g, große Auslenkungen und Dämpfung im Phasendiagramm."
---

## Worum geht es?

Ein **Fadenpendel** besteht aus einem kleinen, schweren Körper an einem Faden der Länge $l$. Lenkt man ihn um den Winkel $\varphi_0$ aus und lässt los, zieht die **Rückstellkraft** $F_R = m \cdot g \cdot \sin\varphi$ ihn zur Ruhelage zurück. Die Zeit für eine volle Hin- und Herbewegung heißt **Periodendauer** $T$.

Für **kleine Auslenkungen** gilt $\sin\varphi \approx \varphi$ (im Bogenmaß). Dann ist die Rückstellkraft proportional zur Auslenkung, das Pendel schwingt **harmonisch**, und es gilt

$$
T_0 = 2\pi \sqrt{\frac{l}{g}}.
$$

$T_0$ hängt nur von der **Länge** und vom **Ortsfaktor** $g$ ab – **nicht** von der Masse: Eine schwerere Kugel erfährt zwar eine größere Rückstellkraft, ist aber im gleichen Maß träger. Quadriert man, erhält man $T^2 = \frac{4\pi^2}{g} \cdot l$: Trägt man $T^2$ über $l$ auf, liegen die Messpunkte auf einer **Ursprungsgeraden** mit der Steigung $k = 4\pi^2/g$. So lässt sich $g$ messen.

Bei **großen Auslenkungen** wird die Periodendauer länger, weil die Rückstellkraft $m g \sin\varphi$ dann kleiner ist als $m g \varphi$. Eine gute Näherung bis etwa $60^\circ$ ist

$$
T \approx T_0 \cdot \left(1 + \frac{\varphi_0^2}{16}\right) \quad (\varphi_0 \text{ im Bogenmaß}).
$$

Bis etwa $22{,}8^\circ$ weicht $T$ um weniger als $1\,\%$ von $T_0$ ab, bei $90^\circ$ sind es schon $18\,\%$. Die Simulation rechnet nicht mit einer Näherung: Sie löst die Bewegungsgleichung mit $\sin\varphi$ Schritt für Schritt (numerisch). Die exakte Periodendauer im Ergebnisfeld berechnet sie mit dem **arithmetisch-geometrischen Mittel** (AGM): Man bildet aus $1$ und $\cos\tfrac{\varphi_0}{2}$ immer wieder das arithmetische Mittel $\tfrac{a+b}{2}$ und das geometrische Mittel $\sqrt{a b}$, bis beide gleich sind. Dann gilt $T = T_0 / \operatorname{AGM}(1;\, \cos\tfrac{\varphi_0}{2})$. Das ist gleichwertig zum elliptischen Integral aus der Formelsammlung der Hochschule – für die Schule genügt die Näherung oben.

**Energie:** Lageenergie und Bewegungsenergie wandeln sich ineinander um:

$$
E_\text{pot} = m g l (1 - \cos\varphi) \qquad E_\text{kin} = \tfrac{1}{2} m v^2
$$

Die **Fadenkraft** ist im tiefsten Punkt am größten: $F_S = m g \cos\varphi + m v^2/l$. Ein Faden kann nur ziehen. Für $|\varphi_0| > 90^\circ$ würde er schlaff – die Simulation rechnet dann mit einer starren Stange. Mit **Dämpfung** nimmt die Amplitude ungefähr mit $e^{-\gamma t}$ ab (mit der Abklingkonstanten $\gamma = k/2$; $k$ ist die Dämpfung am Regler).

## Ausprobieren

1. Ziehe die Kugel zur Seite und lass sie los. Beobachte, wie die Energie-Säulen zwischen Lage- und Bewegungsenergie pendeln, während die Summe gleich bleibt.
2. Verändere während des Schwingens die Masse. Was passiert mit der Bewegung, was mit den Energien?
3. Schalte die Kraftpfeile ein. Wo ist die Rückstellkraft am größten, wo die Fadenkraft? [Kräfte aus 90°](?arrows=F&amp=90)
4. Vergleiche mit der Kleinwinkelnäherung (gestricheltes „Geisterpendel“): Bei $70^\circ$ läuft die Näherung im Diagramm sichtbar davon. [Diagramme](?mode=graphs&amp=70&compare=1)
5. **Messreihe:** Stoppe 10 Schwingungen bei verschiedenen Längen. Ab zwei verschiedenen Längen wertet die Simulation $T^2$ über $l$ unter den Ergebnissen aus, ab drei Längen auch im Diagramm. Welchen Wert für $g$ erhältst du? Wiederhole auf dem Mond. [Messreihe](?mode=period&amp=6)
6. Tippe im Diagramm $T/T_0$ über $\varphi_0$ verschiedene Winkel an und suche den Winkel, ab dem die Näherung mehr als $1\,\%$ daneben liegt. Bei welchem Winkel würde ein Faden schlaff? [Große Auslenkung](?mode=large&amp=120&compare=1)
7. Mit Dämpfung wird die Bahn im Phasendiagramm zur Spirale. [Gedämpft](?mode=phase&amp=40&damping=0.2)

## Aufgaben

### Aufgabe 1: Sekundenpendel

Wie lang muss ein Pendel auf der Erde sein, damit jede Halbschwingung genau $1\,\text{s}$ dauert ($T = 2\,\text{s}$)? Stelle die Länge so ein, dass $T_0 = 2{,}00\,\text{s}$ angezeigt wird. [Ausprobieren](?l=1)

<details>
<summary>Lösung anzeigen</summary>

$$l = g \cdot \left(\frac{T}{2\pi}\right)^2 = 9{,}81\,\tfrac{\text{m}}{\text{s}^2} \cdot \left(\frac{2\,\text{s}}{2\pi}\right)^2 \approx 0{,}994\,\text{m}$$

Mit dem Regler ($l = 0{,}99\,\text{m}$) ergibt sich $T_0 \approx 2{,}00\,\text{s}$. Deshalb waren Standuhren mit Sekundenpendel so groß.

</details>

### Aufgabe 2: g aus einer Messreihe

Eine Gruppe misst $T = 1{,}42\,\text{s}$ bei $0{,}5\,\text{m}$, $T = 2{,}01\,\text{s}$ bei $1{,}0\,\text{m}$ und $T = 2{,}46\,\text{s}$ bei $1{,}5\,\text{m}$. Bestimme $g$ aus der Steigung von $T^2$ über $l$. [Selbst messen](?mode=period&amp=6&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T^2 \approx 2{,}016\,\text{s}^2$; $4{,}040\,\text{s}^2$; $6{,}052\,\text{s}^2$. Die Ursprungsgerade hat die Steigung $k = \frac{\sum l\,T^2}{\sum l^2} = \frac{14{,}126}{3{,}5} \approx 4{,}036\,\tfrac{\text{s}^2}{\text{m}}$, also $g = \frac{4\pi^2}{k} \approx 9{,}78\,\tfrac{\text{m}}{\text{s}^2}$ – nah am Tabellenwert $9{,}81\,\tfrac{\text{m}}{\text{s}^2}$.

</details>

### Aufgabe 3: Pendel auf dem Mond

Wie groß ist $T_0$ eines $1\,\text{m}$ langen Pendels auf dem Mond ($g = 1{,}62\,\tfrac{\text{m}}{\text{s}^2}$)? [Aufgabe laden](?planet=mond&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T_0 = 2\pi \sqrt{1 / 1{,}62}\,\text{s} \approx 4{,}94\,\text{s}$ – das $\sqrt{9{,}81/1{,}62} \approx 2{,}46$-Fache des Erdwerts. [In der Simulation zeigen](?planet=mond)

</details>

### Aufgabe 4: Energie und Fadenkraft

Die Kugel ($m = 0{,}5\,\text{kg}$, $l = 1\,\text{m}$) wird um $20^\circ$ ausgelenkt. Wie schnell ist sie im tiefsten Punkt? Wie groß ist dort die Fadenkraft, wenn man stattdessen aus $90^\circ$ loslässt?

<details>
<summary>Lösung anzeigen</summary>

$h = l(1 - \cos 20^\circ) \approx 0{,}0603\,\text{m}$, $E_\text{pot} \approx 0{,}296\,\text{J}$. Aus $m g h = \tfrac12 m v^2$ folgt $v = \sqrt{2 g h} \approx 1{,}09\,\tfrac{\text{m}}{\text{s}}$ – unabhängig von der Masse.

Aus $90^\circ$: $v^2 = 2 g l$, also $F_S = m g + m v^2 / l = 3 \cdot m g \approx 14{,}7\,\text{N}$ – dreimal die Gewichtskraft. [Kräfte zeigen](?arrows=F&amp=90)

</details>

### Aufgabe 5: Große Auslenkung

Um wie viel Prozent ist die Periodendauer bei $\varphi_0 = 90^\circ$ länger als $T_0$? Warum wird ein Faden bei $\varphi_0 = 120^\circ$ schlaff?

<details>
<summary>Lösung anzeigen</summary>

$T/T_0 = 1/\operatorname{AGM}(1;\, \cos 45^\circ) \approx 1{,}180$, also rund $18\,\%$ länger ($T \approx 2{,}37\,\text{s}$ bei $l = 1\,\text{m}$). Bei $120^\circ$ liegt die Kugel über dem Aufhängepunkt; dort gilt $F_S = m g (3\cos\varphi - 2\cos\varphi_0)$, und schon beim Loslassen ist $F_S = m g \cos 120^\circ < 0$. Ein Faden kann nicht drücken – die Kugel fiele zunächst frei. [Große Auslenkung](?mode=large&amp=120)

</details>

## Ideen für den Unterricht

- **Einsatz:** Mechanische Schwingungen und Energieerhaltung, je nach Lehrplan Jahrgangsstufe 10 bis 12 (bitte am LehrplanPLUS prüfen). Die Messreihe eignet sich als Ergänzung oder Vorbereitung eines echten Schülerversuchs mit Stoppuhr.
- **Messen:** Die Simulation stoppt 10 Schwingungen mit zufälliger Reaktionszeit (abschaltbar). So lässt sich besprechen, warum man viele Perioden misst und warum eine kleine Auslenkung gewählt wird (bei $20^\circ$ ist $T$ schon $0{,}8\,\%$ zu lang).
- **Modell:** Massepunkt an masselosem Faden, exakte Bewegungsgleichung $\ddot\varphi = -\tfrac{g}{l}\sin\varphi - 2\gamma\dot\varphi$ numerisch gelöst; die Kleinwinkelnäherung läuft als gestricheltes Vergleichspendel mit. Für $|\varphi_0| > 90^\circ$ starre Stange statt Faden.
- **Häufige Stolpersteine:**
  - „Ein schwereres Pendel schwingt schneller.“ – Die Masse kürzt sich heraus.
  - „Bei größerer Auslenkung ist die Kugel schneller, also ist $T$ kleiner.“ – Bei kleinen Winkeln gleicht sich das genau aus, bei großen wird $T$ sogar länger.
  - „Die Fadenkraft ist immer gleich der Gewichtskraft.“ – Im tiefsten Punkt ist sie größer, weil zusätzlich die Zentripetalkraft $m v^2 / l$ aufgebracht werden muss.
