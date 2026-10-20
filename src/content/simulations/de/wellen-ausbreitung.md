---
description: "Interaktive Simulation zu mechanischen Wellen – Transversal- und Longitudinalwelle in einer Kette gekoppelter Teilchen, Wellenfront, Wellenlänge zwischen gleichphasigen Teilchen, c = λ·f, Momentaufnahme y(x) und Zeitverlauf y(t)."
---

## Worum geht es?

Eine **mechanische Welle** entsteht, wenn ein **Erreger** ein Teilchen einer Kette gekoppelter Teilchen (Oszillatoren) zum Schwingen bringt. Über die Kopplung (hier: Federn) wird die Bewegung an das nächste Teilchen weitergegeben, von dort an das übernächste usw. Jedes Teilchen beginnt etwas später zu schwingen als sein Vorgänger. Es breitet sich also ein **Schwingungszustand** und damit **Energie** aus – die Teilchen selbst wandern **nicht** mit, sie schwingen nur um ihre **Ruhelage**.

- **Transversalwelle (Querwelle):** Die Teilchen schwingen **senkrecht** zur Ausbreitungsrichtung. Es entstehen **Wellenberge** und **Wellentäler** (z. B. Seilwelle).
- **Longitudinalwelle (Längswelle):** Die Teilchen schwingen **in** Ausbreitungsrichtung. Es entstehen **Verdichtungen** und **Verdünnungen** (z. B. Schall in Luft).

Die **Wellenfront** läuft mit der **Ausbreitungsgeschwindigkeit** $c$; vor ihr ist alles noch in Ruhe. Bis zur Stelle $x$ braucht die Welle die Zeit $\Delta t = \frac{x}{c}$. Weil jedes Teilchen die Bewegung des Erregers $y_E(t) = \hat y \cdot \sin(\omega t)$ nur verspätet wiederholt, gilt

$$
y(x, t) = \hat y \cdot \sin\!\Big(\omega \Big(t - \frac{x}{c}\Big)\Big) = \hat y \cdot \sin\!\Big(2\pi \Big(\frac{t}{T} - \frac{x}{\lambda}\Big)\Big) \quad \text{für } t \ge \frac{x}{c}.
$$

Die **Wellenlänge** $\lambda$ ist der kleinste Abstand zweier Teilchen, die **gleichphasig** schwingen (z. B. von Wellenberg zu Wellenberg oder von Verdichtung zu Verdichtung). Während einer Periodendauer $T$ läuft die Welle genau um eine Wellenlänge weiter:

$$
c = \frac{\lambda}{T} = \lambda \cdot f .
$$

Die **Frequenz** $f$ legt der Erreger fest, die Ausbreitungsgeschwindigkeit $c$ der **Wellenträger** (Kopplung, Masse der Teilchen). Die Wellenlänge ergibt sich daraus: $\lambda = \frac{c}{f}$.

Zwei Teilchen im Abstand $\Delta x$ haben den **Phasenunterschied** $\Delta\varphi = 2\pi \cdot \frac{\Delta x}{\lambda}$. Im Abstand $\lambda$ ist er $2\pi$ (gleichphasig), im Abstand $\frac{\lambda}{2}$ ist er $\pi$ (gegenphasig).

Zwei Diagramme beschreiben die Welle: Die **Momentaufnahme** $y(x)$ zeigt die Auslenkung aller Teilchen zu **einem** Zeitpunkt (daran liest man $\lambda$ ab), der **Zeitverlauf** $y(t)$ zeigt die Bewegung **eines** Teilchens (daran liest man $T$ ab).

## Ausprobieren

1. Drücke auf „Neu starten“ und beobachte die Wellenfront. Was machen die Teilchen vor der Front?
2. Verfolge das rote, markierte Teilchen. Bewegt es sich mit der Welle nach rechts? Achte auf den roten Schwingungsbereich. [Wellenberg verfolgen](?type=trans&crest=1)
3. Tippe ein anderes Teilchen an (in der Kette oder in der Momentaufnahme). Wann beginnt es zu schwingen? Vergleiche im $y(t)$-Diagramm mit dem Erreger.
4. Lies an der grünen Klammer die Wellenlänge ab und prüfe $c = \lambda \cdot f$. Verändere $f$ bei gleichem $c$: Was passiert mit $\lambda$? [Hohe Frequenz](?f=2&c=1.2&amp=5)
5. Vergleiche Transversal- und Longitudinalwelle. Wo liegen die Verdichtungen im Vergleich zu den Wellenbergen? [Beide im Vergleich](?type=both&crest=1)
6. Schalte die Zeiger ein. Um welchen Winkel ist der Zeiger von Teilchen zu Teilchen gedreht? [Zeiger](?type=trans&ph=1&f=1&c=1.6&pm=4)
7. Löse einen Einzelpuls aus und halte die Wiedergabe an, wenn er mitten in der Kette ist. Wie lang ist der Puls? [Einzelpuls](?exc=pulse&type=trans&crest=1&pm=20)

## Aufgaben

### Aufgabe 1: Wellenlänge berechnen

Ein Erreger schwingt mit $f = 0{,}8\,\text{Hz}$, die Welle läuft mit $c = 1{,}2\,\tfrac{\text{m}}{\text{s}}$. Berechne Periodendauer und Wellenlänge und miss $\lambda$ in der Simulation nach. [Aufgabe laden](?lam=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T = \frac{1}{f} = 1{,}25\,\text{s}$ und $\lambda = \frac{c}{f} = \frac{1{,}2\,\text{m/s}}{0{,}8\,\text{Hz}} = 1{,}5\,\text{m}$. Am Maßband liegen zwischen zwei gleichphasigen Teilchen 15 Teilchenabstände von je $10\,\text{cm}$. [In der Simulation zeigen](?lam=1)

</details>

### Aufgabe 2: Ausbreitungsgeschwindigkeit aus einer Messung

In einer Momentaufnahme sind zwei benachbarte Wellenberge $0{,}8\,\text{m}$ voneinander entfernt. Ein Teilchen führt 10 Schwingungen in $8\,\text{s}$ aus. Wie schnell läuft die Welle?

<details>
<summary>Lösung anzeigen</summary>

$\lambda = 0{,}8\,\text{m}$, $T = 0{,}8\,\text{s}$, also $f = 1{,}25\,\text{Hz}$ und $c = \lambda \cdot f = 1{,}0\,\tfrac{\text{m}}{\text{s}}$. [Prüfen](?f=1.25&c=1&type=trans)

</details>

### Aufgabe 3: Wann geht es los?

Bei $f = 0{,}8\,\text{Hz}$ und $c = 1{,}2\,\tfrac{\text{m}}{\text{s}}$: Wann beginnt Teilchen Nr. 30 ($x = 3\,\text{m}$) zu schwingen? Wie groß ist sein Phasenunterschied zum Erreger? [Aufgabe laden](?pm=30&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta t = \frac{x}{c} = \frac{3\,\text{m}}{1{,}2\,\text{m/s}} = 2{,}5\,\text{s}$. $\Delta\varphi = 2\pi \cdot \frac{3\,\text{m}}{1{,}5\,\text{m}} = 4\pi$, also genau zwei volle Perioden: Das Teilchen schwingt (nach dem Einsetzen) **gleichphasig** mit dem Erreger.

</details>

### Aufgabe 4: Frequenz verdoppeln

Die Frequenz des Erregers wird verdoppelt, der Wellenträger bleibt gleich. Wie ändern sich $c$, $\lambda$ und $T$?

<details>
<summary>Lösung anzeigen</summary>

$c$ bleibt gleich (Eigenschaft des Wellenträgers), $T$ und $\lambda = \frac{c}{f}$ werden halbiert. [Vergleich: f = 0,8 Hz](?f=0.8&c=1.2&type=trans) und [f = 1,6 Hz](?f=1.6&c=1.2&type=trans)

</details>

### Aufgabe 5: Verdichtung und Wellenberg

In der Longitudinalwelle liegen die Verdichtungen nicht dort, wo die Teilchen am weitesten nach rechts ausgelenkt sind. Begründe mit der Momentaufnahme, wo sie liegen. [Beispiel laden](?type=both&crest=1)

<details>
<summary>Lösung anzeigen</summary>

Eine Verdichtung entsteht, wo die Teilchen links davon nach rechts und die rechts davon nach links ausgelenkt sind – also an einer Nullstelle von $y(x)$, an der $y$ mit wachsendem $x$ von positiven zu negativen Werten wechselt. Sie liegt eine Viertelwellenlänge vor bzw. hinter einem „Wellenberg“ der Auslenkung. Dort bewegen sich die Teilchen gerade am schnellsten in Ausbreitungsrichtung.

</details>

### Aufgabe 6: Schall

Schall breitet sich in Luft mit etwa $340\,\tfrac{\text{m}}{\text{s}}$ als Longitudinalwelle aus. Welche Wellenlänge hat der Kammerton $a'$ ($440\,\text{Hz}$)? Und ein tiefer Ton mit $50\,\text{Hz}$?

<details>
<summary>Lösung anzeigen</summary>

$\lambda = \frac{340\,\text{m/s}}{440\,\text{Hz}} \approx 0{,}77\,\text{m}$ und $\lambda = \frac{340\,\text{m/s}}{50\,\text{Hz}} = 6{,}8\,\text{m}$.

</details>

## Ideen für den Unterricht

- **Einsatz:** Einstieg in mechanische Wellen (Jahrgangsstufe 10 bzw. Oberstufe, je nach Lehrplanstand): Entstehung durch Kopplung, Unterscheidung transversal/longitudinal, Grundgleichung $c = \lambda \cdot f$, Momentaufnahme und Zeitverlauf. Gut für Erarbeitung an der Tafel (Wiedergabe anhalten, Zeitmarke setzen) und für Schülerarbeit mit den Aufträgen.
- **Modell:** Die Bewegung wird analytisch berechnet: Jedes Teilchen wiederholt die Bewegung des Erregers mit der Verspätung $x/c$ (ideale, verlustfreie Kette ohne Reflexion am Ende, keine Dispersion). Die Kette ist $4\,\text{m}$ lang, die Teilchen haben $10\,\text{cm}$ Abstand. Quer zur Kette wird die Transversalwelle zur besseren Sichtbarkeit überhöht gezeichnet (der Faktor steht im Bild); die Longitudinalwelle ist maßstäblich.
- **Darstellung:** Die Färbung des Bandes zeigt die Teilchendichte. Ist $2\pi\hat y/\lambda \ge 1$, würden sich benachbarte Teilchen der Longitudinalwelle überholen – die Simulation weist darauf hin.
- **Häufige Stolpersteine:**
  - „Die Teilchen wandern mit der Welle mit.“ – Sie schwingen nur um ihre Ruhelage; transportiert wird Energie bzw. der Schwingungszustand (roter Schwingungsbereich, „Wellenberg verfolgen“).
  - „Eine höhere Frequenz macht die Welle schneller.“ – $c$ hängt vom Träger ab; bei höherem $f$ wird $\lambda$ kleiner.
  - „Die Momentaufnahme $y(x)$ und das Diagramm $y(t)$ sind dasselbe.“ – Gleiche Form, aber andere Achse: Abstand der Hochpunkte ist $\lambda$ bzw. $T$; außerdem sind sie gespiegelt (die Welle läuft nach rechts, das zuerst angeregte Teilchen ist links).
  - „Bei der Longitudinalwelle sind die Verdichtungen dort, wo die Teilchen am weitesten ausgelenkt sind.“ – Siehe Aufgabe 5.
