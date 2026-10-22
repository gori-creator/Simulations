---
description: "Interaktive Simulation zu stehenden Wellen – hinlaufende und reflektierte Welle überlagern sich am festen und losen Ende, Eigenschwingungen von Saite und Luftsäule mit Knoten und Bäuchen, Erreger mit freier Frequenz und Resonanzkurve wie beim Melde-Versuch."
---

## Worum geht es?

Läuft eine Welle auf das Ende eines Seils zu, wird sie dort **reflektiert**. Hinlaufende Welle $y_h$ und reflektierte Welle $y_r$ haben dieselbe Frequenz $f$ und Wellenlänge $\lambda = \frac{c}{f}$ und überlagern sich ($y = y_h + y_r$). Das Ergebnis ist eine **stehende Welle**: Es gibt Stellen, die sich nie bewegen (**Knoten K**), und dazwischen Stellen, die besonders stark schwingen (**Bäuche B**). Nichts läuft mehr – alle Punkte zwischen zwei Knoten schwingen gleichphasig auf und ab.

- **Festes Ende:** Die Welle wird mit einem **Phasensprung um $\pi$** reflektiert (ein Berg kommt als Tal zurück). Am Ende liegt immer ein Knoten. Im Abstand $d$ vom Ende gilt
  $$
  y(d, t) = 2\hat y \cdot \sin\!\left(2\pi \cdot \frac{d}{\lambda}\right) \cdot \cos(\omega t) .
  $$
  Knoten liegen bei $d = k \cdot \frac{\lambda}{2}$, Bäuche bei $d = \frac{\lambda}{4} + k \cdot \frac{\lambda}{2}$ $(k = 0, 1, 2, \dots)$.
- **Loses Ende:** Reflexion **ohne Phasensprung**, am Ende liegt ein Bauch. Knoten und Bäuche tauschen die Plätze.

In beiden Fällen sind **benachbarte Knoten $\frac{\lambda}{2}$ voneinander entfernt** – so lässt sich die Wellenlänge direkt messen.

**Eigenschwingungen:** Ist ein Wellenträger der Länge $L$ an beiden Enden begrenzt, passen nur bestimmte stehende Wellen hinein. Bei zwei gleichen Enden (fest–fest oder lose–lose) muss $L$ ein Vielfaches von $\frac{\lambda}{2}$ sein, bei ungleichen Enden ein ungerades Vielfaches von $\frac{\lambda}{4}$:

$$
L = n \cdot \frac{\lambda_n}{2} \;\Rightarrow\; f_n = n \cdot \frac{c}{2L}
\qquad\qquad
L = (2n - 1) \cdot \frac{\lambda_n}{4} \;\Rightarrow\; f_n = (2n - 1) \cdot \frac{c}{4L}
$$

$f_1$ heißt **Grundfrequenz** (Grundschwingung), $f_2, f_3, \dots$ gehören zu den **Oberschwingungen**. Eine Gitarrensaite ($L = 0{,}65\,\text{m}$, $c = 286\,\frac{\text{m}}{\text{s}}$) hat $f_1 = 220\,\text{Hz}$, $f_2 = 440\,\text{Hz}$, $f_3 = 660\,\text{Hz}$ … Bei einer Saite hängt $c$ von der Spannkraft $F$ und der Masse pro Länge $\mu$ ab: $c = \sqrt{F/\mu}$.

**Luftsäule im Rohr:** Hier schwingen die Luftteilchen längs. Ein **geschlossenes Ende** ist für ihre Bewegung ein Knoten (wie ein festes Ende), ein **offenes Ende** ein Bauch (wie ein loses Ende). Der **Druck** schwankt genau umgekehrt: Wo sich die Teilchen nicht bewegen, werden sie abwechselnd zusammengedrückt und auseinandergezogen (Druckbauch); an den Bewegungsbäuchen bleibt der Druck konstant (Druckknoten). Eine offene Pfeife hat alle Vielfachen $f_n = n \cdot \frac{c}{2L}$, eine **gedackte Pfeife** (ein Ende zu) nur die ungeraden: $f_n = (2n-1) \cdot \frac{c}{4L}$.

**Resonanz:** Regt ein Erreger das Seil mit einer beliebigen Frequenz an, entsteht nur bei den Eigenfrequenzen eine große stehende Welle (Melde-Versuch). Dazwischen arbeitet der Erreger mal mit, mal gegen die Bewegung, und das Seil bleibt klein und unruhig.

**Zur Darstellung:** Die Schwingungen sind im Bild stark verlangsamt (oben rechts steht, wie stark), die Auslenkungen überhöht. Bei Entstehung und Eigenschwingungen ist die Dämpfung vernachlässigt; beim Erreger ist eine schwache Dämpfung eingerechnet, damit die Amplitude in der Resonanz endlich bleibt. Beim Rohr wird die Mündungskorrektur vernachlässigt.

## Ausprobieren

1. Drücke „Welle neu losschicken“. Wo entsteht der erste Knoten? Wann „rastet“ das Muster ein und ändert sich nicht mehr?
2. Ziehe den Punkt $P$ auf einen Knoten. Was zeigen die beiden Zeiger dort – und was an einem Bauch?
3. Vergleiche mit dem losen Ende. Was ist jetzt direkt am Ende? [Loses Ende](?end=free&pd=0.22)
4. Blende die Überlagerung aus und beobachte nur blaue und rote Welle. Laufen sie? Und ihre Summe? [Nur die Einzelwellen](?sum=0&env=0)
5. Wechsle zu den Eigenschwingungen und erhöhe $n$ schrittweise. Wie viele Knoten und Bäuche gibt es jeweils? [Saite, n = 4](?mode=eig&n=4)
6. Mache das rechte Ende lose und tippe unten die Eigenfrequenzen an. Welche Vielfachen von $f_1$ fehlen? [Fest–lose](?mode=eig&bc=fl&n=2)
7. Untersuche die Luftsäule: Wo bewegen sich die Teilchen am stärksten, wo schwankt der Druck am stärksten? [Offene Pfeife](?mode=eig&med=air&pipe=open&L=0.5&c=340&n=2)
8. Ziehe beim Erreger die Frequenz langsam durch die Resonanzkurve und schalte den Ton ein. Was passiert genau bei $f_1, f_2, f_3$? [Erreger](?mode=res&f=200)

## Aufgaben

### Aufgabe 1: Gitarrensaite

Eine Gitarrensaite ist $L = 0{,}65\,\text{m}$ lang und an beiden Enden fest. Die Wellen laufen auf ihr mit $c = 286\,\frac{\text{m}}{\text{s}}$. Berechne Wellenlänge und Frequenz der Grundschwingung und der ersten beiden Oberschwingungen. [Aufgabe laden](?mode=eig&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Grundschwingung: $L = \frac{\lambda_1}{2}$, also $\lambda_1 = 2 \cdot 0{,}65\,\text{m} = 1{,}3\,\text{m}$ und $f_1 = \frac{c}{\lambda_1} = \frac{286}{1{,}3}\,\text{Hz} = 220\,\text{Hz}$. Oberschwingungen: $\lambda_2 = 0{,}65\,\text{m}$, $f_2 = 440\,\text{Hz}$; $\lambda_3 = \frac{1{,}3}{3}\,\text{m} \approx 0{,}433\,\text{m}$, $f_3 = 660\,\text{Hz}$. Umgekehrt gilt: Wer $L$ und den Grundton $f_1$ kennt, erhält $c = 2L \cdot f_1$. [In der Simulation zeigen](?mode=eig&n=3)

</details>

### Aufgabe 2: Knoten vor dem festen Ende

Eine Welle mit $f = 660\,\text{Hz}$ und $c = 286\,\frac{\text{m}}{\text{s}}$ wird an einem festen Ende reflektiert. In welchen Abständen vom Ende liegen die Knoten, in welchen die Bäuche (bis $0{,}65\,\text{m}$)? [Aufgabe laden](?kb=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\lambda = \frac{c}{f} = \frac{286}{660}\,\text{m} \approx 0{,}433\,\text{m}$. Knoten bei $d = k \cdot \frac{\lambda}{2}$: $0$; $0{,}217$; $0{,}433$; $0{,}65\,\text{m}$. Bäuche dazwischen: $0{,}108$; $0{,}325$; $0{,}542\,\text{m}$. [In der Simulation zeigen](?kb=1)

</details>

### Aufgabe 3: Offen oder gedackt?

Zwei Orgelpfeifen sind je $0{,}5\,\text{m}$ lang ($c = 340\,\frac{\text{m}}{\text{s}}$), die eine offen, die andere gedackt. Berechne jeweils die ersten drei Eigenfrequenzen. [Aufgabe laden](?mode=eig&med=air&pipe=closed&L=0.5&c=340&n=1&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Offen: $f_n = n \cdot \frac{340}{2 \cdot 0{,}5}\,\text{Hz} = n \cdot 340\,\text{Hz}$, also $340$, $680$, $1020\,\text{Hz}$. Gedackt: $f_n = (2n - 1) \cdot \frac{340}{4 \cdot 0{,}5}\,\text{Hz}$, also $170$, $510$, $850\,\text{Hz}$ – nur ungerade Vielfache, und der Grundton liegt eine Oktave tiefer. [In der Simulation zeigen](?mode=eig&med=air&pipe=closed&L=0.5&c=340&n=2)

</details>

### Aufgabe 4: Melde-Versuch

Ein Seil der Länge $1{,}2\,\text{m}$ ($c = 240\,\frac{\text{m}}{\text{s}}$) wird von einem Erreger angetrieben. Bei welchen Frequenzen entstehen große stehende Wellen? Wie viele Bäuche sieht man bei $f = 300\,\text{Hz}$? [Aufgabe laden](?mode=res&L=1.2&c=240&f=150&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_n = n \cdot \frac{240}{2 \cdot 1{,}2}\,\text{Hz} = n \cdot 100\,\text{Hz}$: Resonanz bei $100$, $200$, $300\,\text{Hz}$ … Bei $300\,\text{Hz}$ ist $n = 3$: drei Bäuche, Knotenabstand $0{,}4\,\text{m}$. [In der Simulation zeigen](?mode=res&L=1.2&c=240&f=300)

</details>

### Aufgabe 5: Saite stimmen

Eine Saite klingt zu tief. Wie muss man die Spannkraft ändern, damit der Grundton um eine Oktave (doppelte Frequenz) steigt?

<details>
<summary>Lösung anzeigen</summary>

$f_1 = \frac{c}{2L}$ mit $c = \sqrt{F/\mu}$. Für die doppelte Frequenz braucht man das doppelte $c$, also die **vierfache** Spannkraft. Bequemer: die schwingende Länge halbieren (12. Bund bei der Gitarre).

</details>

### Aufgabe 6: Kundtsches Rohr

In einem beidseitig geschlossenen Rohr erzeugt ein Lautsprecher einen Ton mit $f = 2000\,\text{Hz}$. Feiner Korkstaub sammelt sich in Häufchen, die $8{,}5\,\text{cm}$ voneinander entfernt sind. Wo bilden sich die Häufchen, und wie groß ist die Schallgeschwindigkeit? [Aufgabe laden](?mode=eig&med=air&pipe=shut&L=0.51&c=340&n=6&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Der Staub bleibt dort liegen, wo sich die Luftteilchen nicht bewegen, also an den Bewegungsknoten (dort schwankt der Druck am stärksten). Benachbarte Knoten sind $\frac{\lambda}{2}$ voneinander entfernt: $\lambda = 2 \cdot 0{,}085\,\text{m} = 0{,}17\,\text{m}$, also $c = \lambda \cdot f = 0{,}17\,\text{m} \cdot 2000\,\text{Hz} = 340\,\frac{\text{m}}{\text{s}}$. In der Simulation: Rohr mit $L = 0{,}51\,\text{m}$ und $n = 6$, also $f_6 = 6 \cdot \frac{340}{2 \cdot 0{,}51}\,\text{Hz} = 2000\,\text{Hz}$. [In der Simulation zeigen](?mode=eig&med=air&pipe=shut&L=0.51&c=340&n=6)

</details>

## Ideen für den Unterricht

- **Einsatz:** in der Oberstufe beim Thema mechanische Wellen, nach Reflexion und Interferenz; die genaue Einordnung hängt vom Lehrplanstand ab. Die drei Themen bauen aufeinander auf und passen gut zu Seilwelle, Melde-Versuch und Kundtschem Rohr im Realexperiment.
- **Vorschlag für den Ablauf:** zuerst die Entstehung mehrmals ablaufen lassen und vorhersagen lassen, wo die Knoten liegen werden; dann mit $P$ und dem Zeigerdiagramm begründen, warum dort Ruhe herrscht. Mit „Knoten und Bäuche markieren“ aus (`kb=0`) eignen sich die Bilder als Messaufgaben.
- **Anwendungen:** Gitarre, Geige und Klavier (Saiten), Flöte und Orgelpfeife (Luftsäulen); mit „Ton anhören“ lassen sich die Eigenfrequenzen einer Saite direkt hören.
- **Häufige Stolpersteine:**
  - „In den Knoten gibt es keine Welle.“ – Beide Wellen laufen hindurch, sie löschen sich dort nur zu jedem Zeitpunkt aus.
  - „Der Abstand zwischen zwei Knoten ist $\lambda$.“ – Benachbarte Knoten sind $\frac{\lambda}{2}$ auseinander.
  - „Die stehende Welle bewegt sich nach rechts.“ – Das Muster steht; nur die Einzelwellen laufen.
  - „Am Knoten der Luftsäule ist der Druck null.“ – An einem Bewegungsknoten schwankt der Druck am stärksten.
  - „Schließt man eine offene Pfeife, wird der Ton höher.“ – Der Grundton sinkt um eine Oktave.
- **Weiterführend:** Klangfarbe und Obertöne, Kundtsches Rohr zur Messung der Schallgeschwindigkeit, stehende Wellen in der Mikrowelle oder bei Elektronen im Atommodell.
