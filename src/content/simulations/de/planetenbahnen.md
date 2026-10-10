---
description: "Interaktive Simulation zu Planetenbahnen und den drei Keplerschen Gesetzen: Startgeschwindigkeit wählen, die Bahn numerisch aus dem Gravitationsgesetz berechnen lassen und Ellipse, Flächensatz, T²/a³, Kreisbahn- und Fluchtgeschwindigkeit untersuchen."
---

## Worum geht es?

Ein Planet der Masse $m$ wird nur von der **Gravitationskraft** des Sterns (Masse $M$) angezogen:

$$
F_G = G \cdot \frac{M \cdot m}{r^2} \qquad G = 6{,}674 \cdot 10^{-11}\,\tfrac{\text{N}\,\text{m}^2}{\text{kg}^2}
$$

Die Simulation kennt keine Ellipsen: Sie berechnet in sehr kleinen Zeitschritten aus $F_G$ die Beschleunigung $a = \frac{G \cdot M}{r^2}$ (sie hängt nicht von $m$ ab), daraus die neue Geschwindigkeit und den neuen Ort. Trotzdem entstehen genau die Bahnen, die **Johannes Kepler** zwischen 1609 und 1619 aus den Beobachtungsdaten Tycho Brahes gefunden hat.

**1. Keplersches Gesetz:** Die Planeten bewegen sich auf **Ellipsen**, in deren einem **Brennpunkt** $F_1$ die Sonne steht. Für jeden Bahnpunkt ist die Summe der Abstände zu beiden Brennpunkten gleich: $r_1 + r_2 = 2a$ (Fadenkonstruktion). Dabei ist $a$ die **große Halbachse**, $b$ die kleine Halbachse, $e = \sqrt{a^2 - b^2}$ die **lineare Exzentrizität** (Abstand Mittelpunkt–Brennpunkt) und $\varepsilon = \frac{e}{a}$ die **numerische Exzentrizität**. Sonnennächster Punkt ist das **Perihel** mit $r_P = a - e$, sonnenfernster das **Aphel** mit $r_A = a + e$.

**2. Keplersches Gesetz (Flächensatz):** Die Verbindungslinie Sonne–Planet (der **Fahrstrahl**) überstreicht in gleichen Zeiten gleich große Flächen. In Sonnennähe ist der Planet deshalb schneller als in Sonnenferne: $r_P \cdot v_P = r_A \cdot v_A$. Physikalisch steckt dahinter die Erhaltung des Drehimpulses $L = m \cdot r \cdot v \cdot \sin\alpha$, denn die Gravitationskraft zeigt immer genau zum Stern.

**3. Keplersches Gesetz:** Für alle Planeten desselben Zentralkörpers ist das Verhältnis aus dem Quadrat der Umlaufdauer und der dritten Potenz der großen Halbachse gleich. Für eine Kreisbahn folgt es direkt aus $F_G = F_Z$, also $G \frac{M m}{r^2} = m \frac{4\pi^2 r}{T^2}$:

$$
\frac{T^2}{a^3} = \frac{4\pi^2}{G \cdot M} \approx 2{,}97 \cdot 10^{-19}\,\tfrac{\text{s}^2}{\text{m}^3} \quad \text{(Sonne)}
$$

**Welche Bahn entsteht?** Das hängt von der Startgeschwindigkeit $v_0$ im Abstand $r_0$ ab. Mit der **Kreisbahngeschwindigkeit** $v_K$ (senkrecht zum Fahrstrahl) entsteht ein Kreis, ab der **Fluchtgeschwindigkeit** $v_F$ kehrt der Planet nie zurück:

$$
v_K = \sqrt{\frac{G \cdot M}{r_0}} \qquad v_F = \sqrt{\frac{2\,G \cdot M}{r_0}} = \sqrt{2} \cdot v_K
$$

Im Abstand der Erde ($r_0 = 1\,\text{AE} = 1{,}496 \cdot 10^{11}\,\text{m}$) sind das $v_K \approx 29{,}8\,\tfrac{\text{km}}{\text{s}}$ und $v_F \approx 42{,}1\,\tfrac{\text{km}}{\text{s}}$. Entscheidend ist die Gesamtenergie $E = \frac{1}{2} m v^2 - G \frac{M m}{r}$: Für $E < 0$ ist die Bahn gebunden (Kreis oder Ellipse), für $E = 0$ eine Parabel, für $E > 0$ eine Hyperbel.

## Ausprobieren

1. Drücke **Start**. Wo ist der Planet schnell, wo langsam? Vergleiche die Pfeile im Perihel und im Aphel und das Diagramm $v(t)$.
2. Nach einem Umlauf ist die Ellipse in 12 gefärbte Flächen zerlegt, die der Fahrstrahl in jeweils gleich langen Zeitabschnitten überstrichen hat. Vergleiche ihre Form und ihren Flächeninhalt (Balken rechts). Bei der Kreisbahn sind alle Stücke deckungsgleich: [Kreisbahn](?v0=29.78)
3. Ziehe die Pfeilspitze langsam nach außen. Der innere Ring markiert $v_K$, der äußere $v_F$. Was passiert, wenn der Pfeil über den äußeren Ring hinausreicht? [Fluchtbahn](?v0=46&panel=energy)
4. Starte langsamer als $v_K$: Jetzt ist der Startpunkt das Aphel und der Planet fällt zunächst zum Stern hin. [Start im Aphel](?v0=22&n=8)
5. Schalte die Fadenkonstruktion ein und beobachte $r_1 + r_2$ während des Umlaufs. [Fadenkonstruktion](?str=1&sec=0)
6. Wähle die Tabelle zum 3. Keplerschen Gesetz und lass mehrere verschieden große Bahnen je einmal umlaufen. Jede vollständige Runde wird gemessen. [Tabelle öffnen](?panel=k3) · [Marsbahn mit Planeten](?r0=1.38&v0=26.51&panel=k3&pl=1&sec=0)
7. Verdopple die Masse des Sterns. Wie ändert sich $\frac{T^2}{a^3}$? [Zwei Sonnenmassen](?panel=k3&M=2&v0=50)

## Aufgaben

### Aufgabe 1: Die Erde auf einer Kreisbahn

Berechne die Kreisbahngeschwindigkeit im Abstand $r = 1{,}496 \cdot 10^{11}\,\text{m}$ von der Sonne ($M = 1{,}989 \cdot 10^{30}\,\text{kg}$) und daraus die Umlaufdauer. [Aufgabe laden](?v0=29.78&num=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v_K = \sqrt{\frac{G M}{r}} = \sqrt{\frac{6{,}674 \cdot 10^{-11} \cdot 1{,}989 \cdot 10^{30}}{1{,}496 \cdot 10^{11}}}\,\tfrac{\text{m}}{\text{s}} \approx 2{,}98 \cdot 10^{4}\,\tfrac{\text{m}}{\text{s}} = 29{,}8\,\tfrac{\text{km}}{\text{s}}$

$T = \frac{2\pi r}{v_K} \approx \frac{2\pi \cdot 1{,}496 \cdot 10^{11}\,\text{m}}{2{,}98 \cdot 10^{4}\,\tfrac{\text{m}}{\text{s}}} \approx 3{,}16 \cdot 10^{7}\,\text{s} \approx 365\,\text{d}$ – ein Jahr. [In der Simulation zeigen](?v0=29.78)

</details>

### Aufgabe 2: Schneller als die Fluchtgeschwindigkeit

Ein Körper startet im Abstand $1\,\text{AE}$ mit $46\,\tfrac{\text{km}}{\text{s}}$. Kehrt er zurück? Begründe mit der Fluchtgeschwindigkeit und mit der Energie. [Aufgabe laden](?v0=46&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v_F = \sqrt{2} \cdot 29{,}8\,\tfrac{\text{km}}{\text{s}} \approx 42{,}1\,\tfrac{\text{km}}{\text{s}} < 46\,\tfrac{\text{km}}{\text{s}}$. Pro Kilogramm ist $E = \frac{1}{2} v^2 - \frac{G M}{r} \approx 10{,}6 \cdot 10^{8}\,\tfrac{\text{J}}{\text{kg}} - 8{,}9 \cdot 10^{8}\,\tfrac{\text{J}}{\text{kg}} > 0$. Der Körper entkommt auf einer Hyperbelbahn – egal in welche Richtung er startet (solange er nicht die Sonne trifft). [Energie anzeigen](?v0=46&panel=energy)

</details>

### Aufgabe 3: Perihel und Aphel

Ein Planet startet im Perihel $r_P = 1{,}00\,\text{AE}$ mit $v_P = 36{,}0\,\tfrac{\text{km}}{\text{s}}$; sein Aphel liegt bei $r_A = 2{,}71\,\text{AE}$. Berechne $v_A$, die große Halbachse $a$ und die numerische Exzentrizität $\varepsilon$. [Aufgabe laden](?num=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Flächensatz: $v_A = v_P \cdot \frac{r_P}{r_A} = 36{,}0\,\tfrac{\text{km}}{\text{s}} \cdot \frac{1{,}00}{2{,}71} \approx 13{,}3\,\tfrac{\text{km}}{\text{s}}$

$a = \frac{r_P + r_A}{2} \approx 1{,}86\,\text{AE}$, $e = a - r_P \approx 0{,}86\,\text{AE}$, $\varepsilon = \frac{e}{a} = \frac{r_A - r_P}{r_A + r_P} \approx 0{,}46$. [In der Simulation zeigen](?str=1)

</details>

### Aufgabe 4: Mars und Jupiter

Mars hat die große Halbachse $a = 1{,}524\,\text{AE}$. Berechne seine Umlaufdauer mit dem 3. Keplerschen Gesetz (Erde: $a = 1\,\text{AE}$, $T = 1\,\text{a}$). Jupiter braucht für einen Umlauf $11{,}86\,\text{a}$. Wie groß ist seine große Halbachse? [Aufgabe laden](?panel=k3&r0=1.38&v0=26.51&pl=1&sec=0&num=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Mit $\frac{T^2}{a^3} = 1\,\tfrac{\text{a}^2}{\text{AE}^3}$: $T_{\text{Mars}} = \sqrt{1{,}524^3}\,\text{a} \approx 1{,}88\,\text{a}$ und $a_{\text{Jupiter}} = \sqrt[3]{11{,}86^2}\,\text{AE} \approx 5{,}20\,\text{AE}$. Vergleiche mit der Tabelle. [Messung zeigen](?panel=k3&r0=1.38&v0=26.51&pl=1&sec=0)

</details>

### Aufgabe 5: Der Halleysche Komet

Der Halleysche Komet kommt der Sonne bis auf $0{,}59\,\text{AE}$ nahe, seine große Halbachse beträgt etwa $17{,}8\,\text{AE}$. Berechne die Umlaufdauer und den größten Abstand von der Sonne. Warum sieht man ihn nur wenige Monate lang? [Aufgabe laden](?r0=0.59&v0=54.38&n=8&num=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T = \sqrt{17{,}8^3}\,\text{a} \approx 75\,\text{a}$, $r_A = 2a - r_P \approx 35{,}0\,\text{AE}$ (weiter als Neptun). Nach dem Flächensatz überstreicht der Fahrstrahl in Sonnennähe in kurzer Zeit eine große Fläche: Der Komet rast durch das innere Sonnensystem und verbringt fast die ganze Umlaufdauer weit draußen, wo er langsam und lichtschwach ist. [In der Simulation zeigen](?r0=0.59&v0=54.38&n=8)

</details>

### Aufgabe 6: Die Sonne wiegen

Bestimme aus der Erdbahn ($a = 1{,}496 \cdot 10^{11}\,\text{m}$, $T = 365{,}26\,\text{d}$) die Masse der Sonne.

<details>
<summary>Lösung anzeigen</summary>

$M = \frac{4\pi^2 a^3}{G\,T^2} = \frac{4\pi^2 \cdot (1{,}496 \cdot 10^{11}\,\text{m})^3}{6{,}674 \cdot 10^{-11}\,\tfrac{\text{N}\,\text{m}^2}{\text{kg}^2} \cdot (3{,}156 \cdot 10^{7}\,\text{s})^2} \approx 1{,}99 \cdot 10^{30}\,\text{kg}$. Auf diese Weise bestimmt man in der Astronomie die Massen von Sternen und Planeten mit Monden.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Gravitation und Keplersche Gesetze in der Oberstufe (Jahrgangsstufen 11–13; die Zuordnung zum LehrplanPLUS des bayerischen Gymnasiums ist ein Entwurf, bitte abgleichen), auch zur Wiederholung der Kreisbewegung und der Energieerhaltung. Gut geeignet für eine Erarbeitung in Partnerarbeit: Gesetz vermuten, in der Simulation prüfen, mit der Tabelle bzw. dem doppelt-logarithmischen Diagramm bestätigen.
- **Modell:** Stern und Planet sind Massenpunkte, $m \ll M$ (der Stern bleibt in Ruhe, streng genommen umlaufen beide den gemeinsamen Schwerpunkt). Es wirkt nur die Gravitation des Sterns, Störungen durch andere Planeten fehlen. Die Bahn wird mit dem Leapfrog-Verfahren (Verlet) mit fester Schrittweite berechnet; die Energie bleibt dabei relativ besser als $10^{-4}$ erhalten, der Drehimpuls bis auf Rundungsfehler exakt. Stern und Planet sind stark vergrößert gezeichnet; ein Umlauf dauert in der Simulation etwa 8 Sekunden. Die gestrichelte Linie ist die exakt berechnete Kegelschnittbahn zum Vergleich.
- **Daten:** Die Planetenwerte sind gerundete mittlere Bahnelemente (JPL, nach E. M. Standish); die Umlaufdauer folgt aus der mittleren Bewegung. Die kleinen Abweichungen von $\frac{T^2}{a^3}$ (unter 0,2 %) entstehen durch die gegenseitigen Störungen der Planeten und die Masse der Planeten selbst. In anderen Quellen weichen die letzten Stellen leicht ab.
- **Bezeichnungen:** lineare Exzentrizität $e$ (in AE), numerische Exzentrizität $\varepsilon = \frac{e}{a}$; $1\,\text{AE} = 1{,}496 \cdot 10^{11}\,\text{m}$, $1\,\text{a} = 3{,}156 \cdot 10^{7}\,\text{s}$, $1\,M_\odot \approx 1{,}99 \cdot 10^{30}\,\text{kg}$. Mit „Zahlenwerte im Bild“ aus und `_hide=1` lassen sich Rechenaufgaben stellen.
- **Typische Fehlvorstellungen:**
  - „Die Sonne steht im Mittelpunkt der Ellipse.“ – Sie steht in einem Brennpunkt; der zweite Brennpunkt ist leer.
  - „Planetenbahnen sind stark gestreckte Ellipsen.“ – Die Bahnen der Planeten sind fast Kreise (Erde: $\varepsilon \approx 0{,}017$); Schulbuchbilder übertreiben die Exzentrizität. Mit „Bahnen der Planeten zum Vergleich“ sieht man das maßstabsgetreu.
  - „Im Sommer ist die Erde der Sonne am nächsten.“ – Das Perihel durchläuft die Erde Anfang Januar; die Jahreszeiten entstehen durch die Neigung der Erdachse.
  - „Ein schwerer Planet braucht länger für einen Umlauf.“ – Die Masse $m$ kürzt sich heraus; $T$ hängt nur von $a$ und $M$ ab.
  - „Mit Fluchtgeschwindigkeit muss man genau nach außen starten.“ – Es kommt nur auf den Betrag an (Energie), nicht auf die Richtung.
