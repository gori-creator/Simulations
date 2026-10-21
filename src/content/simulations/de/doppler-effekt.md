---
description: "Interaktive Simulation zum Doppler-Effekt – Krankenwagen mit Martinshorn fährt vorbei, Wellenfronten vorn dichter und hinten weiter, gehörte Frequenz f_B(t), bewegter Beobachter, Schallmauer und Machscher Kegel, auf Wunsch mit Ton."
---

## Worum geht es?

Fährt ein Krankenwagen mit Martinshorn an dir vorbei, klingt der Ton beim Heranfahren **höher** und beim Wegfahren **tiefer** als im Stand. Das ist der **Doppler-Effekt** (nach Christian Doppler, 1842).

Die Quelle sendet mit der Frequenz $f_Q$ Wellenfronten aus, die sich in der ruhenden Luft mit der **Schallgeschwindigkeit** $c \approx 340\,\tfrac{\text{m}}{\text{s}}$ (Luft bei etwa $15\,^\circ\text{C}$; bei $20\,^\circ\text{C}$ sind es $343\,\tfrac{\text{m}}{\text{s}}$) als Kreise (im Raum: Kugeln) ausbreiten. Jeder Kreis hat seinen Mittelpunkt dort, wo die Quelle beim Aussenden **war**. Fährt die Quelle mit $v_Q$, rückt sie in jeder Periodendauer $T = \frac{1}{f_Q}$ um $v_Q \cdot T$ nach vorn. Deshalb liegen die Wellenfronten **vorn dichter** und **hinten weiter auseinander**:

$$
\lambda_v = \frac{c - v_Q}{f_Q}, \qquad \lambda_h = \frac{c + v_Q}{f_Q}.
$$

Ein ruhender Beobachter hört $f_B = \frac{c}{\lambda}$, also

$$
f_B = f_Q \cdot \frac{c}{c - v_Q} \;\; \text{(Quelle nähert sich)}, \qquad f_B = f_Q \cdot \frac{c}{c + v_Q} \;\; \text{(Quelle entfernt sich)}.
$$

Bewegt sich dagegen der **Beobachter** mit $v_B$ auf eine ruhende Quelle zu, bleibt die Wellenlänge gleich; er läuft aber den Wellenfronten entgegen und trifft sie häufiger:

$$
f_B = f_Q \cdot \frac{c + v_B}{c} \;\; \text{(Beobachter nähert sich)}, \qquad f_B = f_Q \cdot \frac{c - v_B}{c} \;\; \text{(Beobachter entfernt sich)}.
$$

Beides zusammen ergibt $f_B = f_Q \cdot \frac{c + v_{B,r}}{c - v_{Q,r}}$. Dabei sind $v_{Q,r}$ und $v_{B,r}$ die **Anteile der Geschwindigkeiten auf der Verbindungslinie** (zum anderen hin positiv). Steht der Beobachter seitlich neben der Straße, ändert sich dieser Anteil beim Vorbeifahren stetig: Der Ton **gleitet** von hoch nach tief. Genau dann, wenn der Schall senkrecht zur Fahrtrichtung ausgesandt wurde, hört man $f_Q$.

Ein Zahlenbeispiel: Für $f_Q = 440\,\text{Hz}$ und $v_Q = 34\,\tfrac{\text{m}}{\text{s}}$ hört man vorn $488{,}9\,\text{Hz}$ und hinten $400\,\text{Hz}$.

**Grenzfälle:** Fährt die Quelle genau mit Schallgeschwindigkeit ($v_Q = c$, **Machzahl** $Ma = \frac{v_Q}{c} = 1$), stauen sich alle Wellenfronten vor ihr – die „**Schallmauer**“. Ist sie schneller ($Ma > 1$), überholt sie ihren eigenen Schall. Die Wellenfronten bilden dann den **Machschen Kegel** mit dem halben Öffnungswinkel

$$
\sin \alpha = \frac{c}{v_Q}.
$$

Vor dem Kegel ist es still; zieht er am Beobachter vorbei, hört man den **Überschallknall**.

**Zur Darstellung:** Die Wellenfronten liegen in Wirklichkeit nur etwa $0{,}8\,\text{m}$ auseinander. Damit man sie sehen kann, wird nur jede $n$-te Wellenfront gezeichnet (unten links im Bild steht, jede wievielte). Die Klammern messen deshalb $n \cdot \lambda$. Schnelle Vorgänge laufen automatisch in Zeitlupe.

## Ausprobieren

1. Drücke auf „Neu starten“ und beobachte die Ringe. Wo liegen sie dichter, wo weiter auseinander? Vergleiche die Mittelpunkte der Ringe mit dem Ort des Krankenwagens.
2. Beobachte das Diagramm $f_B(t)$ während der Vorbeifahrt. Warum ist es am Anfang still? Warum gleitet der Ton und springt nicht?
3. Ziehe den Beobachter ganz nah an die Straße und wieder weg. Wie ändert sich die Form der Kurve? [Direkt an der Straße](?d=6&bx=20)
4. Schalte den Ton ein (Knopf „Ton anhören“) und starte neu – mit und ohne Zeitlupe.
5. Lass den Beobachter auf eine ruhende Quelle zulaufen. Welche Frequenz hört er? Ist das dasselbe wie bei einer bewegten Quelle mit gleicher Geschwindigkeit? [Beobachter läuft](?vq=0&vb=34&d=6&bx=110)
6. Erhöhe $v_Q$ langsam bis $340\,\tfrac{\text{m}}{\text{s}}$. Was passiert mit den Wellenfronten vor der Quelle? [Schallmauer](?vq=340&lam=0)
7. Bei Überschall: Miss den Winkel des Machschen Kegels und vergleiche mit $\sin\alpha = \frac{c}{v_Q}$. Wann hört der Beobachter etwas? [Mach 2](?vq=680&d=30&bx=0)

## Aufgaben

### Aufgabe 1: Martinshorn

Ein Krankenwagen fährt mit $34\,\tfrac{\text{m}}{\text{s}}$ (gut $120\,\tfrac{\text{km}}{\text{h}}$), sein Ton hat $440\,\text{Hz}$. Welche Frequenz hört ein Beobachter direkt an der Straße beim Heranfahren und beim Wegfahren? [Aufgabe laden](?d=6&bx=20&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Heranfahren: $f_B = 440\,\text{Hz} \cdot \frac{340}{340 - 34} \approx 488{,}9\,\text{Hz}$. Wegfahren: $f_B = 440\,\text{Hz} \cdot \frac{340}{340 + 34} = 400\,\text{Hz}$. In der Simulation steht der Beobachter $6\,\text{m}$ neben der Fahrbahn. Der Anteil von $v_Q$ auf der Verbindungslinie ist deshalb etwas kleiner als $34\,\tfrac{\text{m}}{\text{s}}$, und du liest knapp weniger ab (zum Beispiel $488{,}6\,\text{Hz}$). [In der Simulation zeigen](?d=6&bx=20)

</details>

### Aufgabe 2: Wellenlängen

Berechne für Aufgabe 1 die Wellenlänge vor und hinter dem Krankenwagen und im Stand.

<details>
<summary>Lösung anzeigen</summary>

$\lambda_v = \frac{306\,\text{m/s}}{440\,\text{Hz}} \approx 0{,}695\,\text{m}$, $\lambda_h = \frac{374\,\text{m/s}}{440\,\text{Hz}} = 0{,}85\,\text{m}$, im Stand $\lambda = \frac{340\,\text{m/s}}{440\,\text{Hz}} \approx 0{,}773\,\text{m}$. Probe: $\frac{c}{\lambda_v} \approx 488{,}9\,\text{Hz}$.

</details>

### Aufgabe 3: Wer bewegt sich?

Ein Radfahrer fährt mit $34\,\tfrac{\text{m}}{\text{s}}$ (sehr sportlich!) auf eine ruhende $440\text{-Hz}$-Quelle zu. Welche Frequenz hört er? Vergleiche mit Aufgabe 1 und erkläre den Unterschied. [Aufgabe laden](?vq=0&vb=34&d=6&bx=110&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_B = 440\,\text{Hz} \cdot \frac{340 + 34}{340} = 484\,\text{Hz}$ – etwas weniger als $488{,}9\,\text{Hz}$. Bewegt sich die Quelle, werden die Wellen selbst gestaucht (kleinere Wellenlänge). Bewegt sich der Beobachter, bleibt die Wellenlänge gleich, er trifft nur häufiger auf Wellenfronten. Weil sich der Schall in der Luft ausbreitet, ist es nicht egal, wer sich gegenüber der Luft bewegt. [In der Simulation zeigen](?vq=0&vb=34&d=6&bx=110)

</details>

### Aufgabe 4: Beide bewegen sich

Krankenwagen ($34\,\tfrac{\text{m}}{\text{s}}$) und Radfahrer ($34\,\tfrac{\text{m}}{\text{s}}$) bewegen sich aufeinander zu. Welche Frequenz hört der Radfahrer, welche nach der Begegnung? [Aufgabe laden](?vb=34&d=6&bx=100&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Vorher: $f_B = 440\,\text{Hz} \cdot \frac{340 + 34}{340 - 34} \approx 537{,}8\,\text{Hz}$. Nachher entfernen sich beide: $f_B = 440\,\text{Hz} \cdot \frac{340 - 34}{340 + 34} = 360\,\text{Hz}$. Wegen der $6\,\text{m}$ Abstand zur Fahrbahn zeigt die Simulation etwas weniger (zum Beispiel $536{,}4\,\text{Hz}$). [In der Simulation zeigen](?vb=34&d=6&bx=100)

</details>

### Aufgabe 5: Geschwindigkeit aus dem Tonsprung

Beim Vorbeifahren fällt der Ton eines Autos im Verhältnis $\frac{f_v}{f_h} = \frac{6}{5}$ (eine kleine Terz). Wie schnell fährt das Auto?

<details>
<summary>Lösung anzeigen</summary>

$\frac{f_v}{f_h} = \frac{c + v_Q}{c - v_Q} = 1{,}2 \;\Rightarrow\; v_Q = c \cdot \frac{1{,}2 - 1}{1{,}2 + 1} \approx 30{,}9\,\tfrac{\text{m}}{\text{s}} \approx 111\,\tfrac{\text{km}}{\text{h}}$. Die Frequenz der Quelle muss man dafür nicht kennen. [Prüfen](?vq=31&d=6&bx=20)

</details>

### Aufgabe 6: Überschallknall

Ein Flugzeug fliegt mit Mach 2 in $3\,\text{km}$ Höhe genau über dich hinweg. Wie groß ist der halbe Öffnungswinkel des Machschen Kegels? Wie lange nach dem Überflug hörst du den Knall?

<details>
<summary>Lösung anzeigen</summary>

$\sin\alpha = \frac{1}{2}$, also $\alpha = 30^\circ$. Der Kegel erreicht dich, wenn das Flugzeug schon $\frac{3\,\text{km}}{\tan 30^\circ} \approx 5{,}2\,\text{km}$ weiter ist; bei $680\,\tfrac{\text{m}}{\text{s}}$ dauert das etwa $7{,}6\,\text{s}$. [Mach 2 ansehen](?vq=680&d=30&bx=0)

</details>

## Ideen für den Unterricht

- **Einsatz:** Zur Wellenlehre (Schall als Welle, $c = \lambda \cdot f$) in Jahrgangsstufe 10 oder in der Oberstufe, je nach Lehrplanstand. Als Einstieg eignet sich die Alltagserfahrung mit dem Martinshorn, gern zuerst mit Ton und ohne Zahlen (`val=0`), dann die Erklärung über die gestauchten Wellenfronten.
- **Modell:** Die Luft ruht, die Quelle fährt gleichförmig geradeaus und sendet von Anfang an. Für jeden Zeitpunkt wird exakt berechnet, wann der gerade ankommende Schall ausgesandt wurde ($|B(t) - S(\tau)| = c \cdot (t - \tau)$); daraus folgen Frequenz, Lautstärke und die Radialkomponenten. Die Wellenfronten sind in der Draufsicht Kreise; gezeichnet wird nur jede $n$-te. Fahrzeug und Person sind zur besseren Sichtbarkeit größer als maßstäblich gezeichnet.
- **Ton:** Der Ton ist standardmäßig aus und startet nur auf Knopfdruck, leise. In Zeitlupe bleibt die Tonhöhe die physikalisch richtige, nur der Ablauf ist langsamer. Bei Überschall sind nach dem Knall zwei Töne gleichzeitig zu hören; der früher ausgesandte kommt zeitlich rückwärts an (gestrichelt im Diagramm) – eine schöne Zusatzfrage für Interessierte.
- **Häufige Stolpersteine:**
  - „Der Ton wird lauter, deshalb klingt er höher.“ – Lautstärke und Tonhöhe sind verschiedene Größen; die Tonhöhe hängt nur von der Frequenz ab.
  - „Beim Vorbeifahren springt der Ton.“ – Nur direkt auf der Fahrbahn; mit seitlichem Abstand gleitet er über die Radialkomponente.
  - „Die Quelle ändert ihre Frequenz.“ – $f_Q$ bleibt gleich; verändert ist nur der Abstand der ankommenden Wellenfronten.
  - „Bewegte Quelle und bewegter Beobachter sind dasselbe.“ – Bei Schall nicht (Aufgabe 3), weil die Luft ein Bezugssystem auszeichnet.
  - „Der Überschallknall entsteht nur beim Durchbrechen der Schallmauer.“ – Der Kegel wird mitgeschleppt; jeder Ort, über den er hinwegzieht, hört den Knall.
- **Weiterführend:** Doppler-Ultraschall in der Medizin, Radarmessung, Rotverschiebung beim Licht (dort gilt eine andere Formel, weil es kein Trägermedium gibt).
