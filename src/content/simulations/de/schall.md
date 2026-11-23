## Worum geht es?

Schall entsteht, wenn etwas **schwingt**: eine Gitarrensaite, die Membran eines Lautsprechers, die Stimmbänder. Die Schwingung stößt die Luftteilchen an. Diese geben den Stoß an ihre Nachbarn weiter. So läuft eine **Schallwelle** durch die Luft bis zum Ohr. Im **Sender-Empfänger-Modell** ist die Schallquelle der Sender, das Ohr oder ein Mikrofon der Empfänger und die Luft der Überträger.

**Tonhöhe und Frequenz:** Je schneller eine Quelle schwingt, desto höher klingt der Ton. Die Zahl der Schwingungen pro Sekunde heißt **Frequenz** $f$ (Einheit Hertz, $1\,\text{Hz} = \tfrac{1}{\text{s}}$). Die Dauer einer Schwingung ist die **Periodendauer** $T = \tfrac{1}{f}$. Der Kammerton a′ hat $f = 440\,\text{Hz}$, also $T = \tfrac{1}{440}\,\text{s} \approx 2{,}27\,\text{ms}$. Eine Oktave höher bedeutet doppelte Frequenz.

**Lautstärke und Amplitude:** Je weiter die Quelle ausschlägt, desto lauter ist der Ton. Auf dem Oszilloskop ist die Kurve dann höher. Gemessen wird der **Schallpegel** in Dezibel (dB). Doppelte Amplitude ergibt $+6\,\text{dB}$, doppelte Schallleistung $+3\,\text{dB}$. Etwa $+10\,\text{dB}$ empfinden wir als doppelt so laut.

**Klangfarbe:** Eine Geige und eine Flöte können denselben Ton spielen und klingen trotzdem verschieden. Zum Grundton kommen **Obertöne** mit den Frequenzen $2f$, $3f$, … Ihre Mischung bestimmt die Klangfarbe und die Form der Kurve.

**Ausbreitung:** Schall ist eine **Längswelle**. Die Teilchen schwingen in Ausbreitungsrichtung hin und her, dabei entstehen Verdichtungen und Verdünnungen. Für die **Wellenlänge** gilt

$$
\lambda = \frac{c}{f}.
$$

In Luft bei $20\,^\circ\text{C}$ ist $c \approx 343\,\tfrac{\text{m}}{\text{s}}$. Für $440\,\text{Hz}$ ergibt das $\lambda = \tfrac{343}{440}\,\text{m} \approx 0{,}78\,\text{m}$. In Wasser ist Schall etwa viermal, in Stahl etwa fünfzehnmal so schnell. Im **Vakuum** gibt es keine Teilchen und deshalb auch keinen Schall.

**Hörbereich:** Menschen hören etwa von $20\,\text{Hz}$ bis $20\,\text{kHz}$. Darunter liegt **Infraschall** (Elefanten), darüber **Ultraschall** (Fledermäuse, Ultraschallbilder).

**Lärm:** Mit doppelter Entfernung sinkt der Pegel um $6\,\text{dB}$. Ab etwa $85\,\text{dB}$ schadet Lärm auf Dauer dem Gehör, ab etwa $120\,\text{dB}$ schon kurzzeitig.

## Ausprobieren

1. Verändere die Frequenz. Was passiert mit der Kurve, was mit dem Ton? [Oszilloskop](?mode=osc&f=440&amp=60&tim=sine)
2. Miss mit den Messmarken die Periodendauer und berechne $f = \tfrac{1}{T}$. [Selbst messen](?mode=osc&f=262&amp=70&tim=sine&cur=1&val=0)
3. Vergleiche die Klangfarben bei gleicher Frequenz. Was bleibt gleich? [Klangfarbe](?mode=osc&f=330&amp=70&tim=violin)
4. Wechsle von Luft zu Wasser und Stahl. Wie ändert sich die Wellenlänge? [Ausbreitung](?mode=wave&f=440&med=air&temp=20)
5. Ziehe das Ohr weiter weg. Um wie viel dB sinkt der Pegel bei jeder Verdopplung? [Pegel](?mode=level&L1=90&r=2&n=1)
6. Rufe gegen die Felswand und stoppe die Zeit. Ab welcher Entfernung hört man ein getrenntes Echo? [Echo](?mode=echo&d=170&med=air&temp=20)
7. Halbiere die Länge der Saite. Wie verändert sich der Ton? [Saite](?mode=source&src=string&sl=65&ten=70&sty=e1&hn=1)

## Aufgaben

### Aufgabe 1: Kammerton

Berechne Periodendauer und Wellenlänge des Kammertons a′ ($440\,\text{Hz}$) in Luft ($c = 343\,\tfrac{\text{m}}{\text{s}}$).

<details>
<summary>Lösung anzeigen</summary>

$T = \tfrac{1}{440\,\text{Hz}} \approx 2{,}27\,\text{ms}$, $\lambda = \tfrac{343\,\text{m/s}}{440\,\text{Hz}} \approx 0{,}78\,\text{m}$. [In der Simulation zeigen](?mode=osc&f=440&amp=60&tim=sine)

</details>

### Aufgabe 2: Echo

Ein Ruf kommt nach $1{,}0\,\text{s}$ als Echo zurück. Wie weit ist die Felswand entfernt?

<details>
<summary>Lösung anzeigen</summary>

Der Schall läuft hin und zurück: $d = \tfrac{c \cdot t}{2} = \tfrac{343 \cdot 1{,}0}{2}\,\text{m} \approx 172\,\text{m}$. [In der Simulation zeigen](?mode=echo&d=172&med=air&temp=20)

</details>

### Aufgabe 3: Lautstärke

In $1\,\text{m}$ Abstand misst man $90\,\text{dB}$. Wie groß ist der Pegel in $4\,\text{m}$? Wie groß ist er, wenn eine zweite, gleich laute Quelle dazukommt?

<details>
<summary>Lösung anzeigen</summary>

Zweimal verdoppelt: $90 - 6 - 6 = 78\,\text{dB}$. Mit zwei Quellen kommen $3\,\text{dB}$ dazu: etwa $81\,\text{dB}$. [In der Simulation zeigen](?mode=level&L1=90&r=4&n=2)

</details>

### Aufgabe 4: Gitarrensaite

Eine Saite ($L = 65\,\text{cm}$, $\mu = 0{,}4\,\tfrac{\text{g}}{\text{m}}$) wird mit $70\,\text{N}$ gespannt. Welche Frequenz hat ihr Grundton? Was passiert, wenn man sie in der Mitte greift?

<details>
<summary>Lösung anzeigen</summary>

$f = \tfrac{1}{2L}\sqrt{\tfrac{F}{\mu}} = \tfrac{1}{1{,}3\,\text{m}} \cdot \sqrt{\tfrac{70\,\text{N}}{0{,}0004\,\text{kg/m}}} \approx 322\,\text{Hz}$. Bei halber Länge verdoppelt sich die Frequenz: Der Ton klingt eine Oktave höher. [In der Simulation zeigen](?mode=source&src=string&sl=65&ten=70&sty=e1&hn=1)

</details>

### Aufgabe 5: Schwebung

Zwei Stimmgabeln schwingen mit $440\,\text{Hz}$ und $444\,\text{Hz}$. Wie oft pro Sekunde schwillt der Ton an?

<details>
<summary>Lösung anzeigen</summary>

$f_S = |444 - 440|\,\text{Hz} = 4\,\text{Hz}$, also viermal pro Sekunde. [In der Simulation zeigen](?mode=beat&f=440&df=4)

</details>

## Ideen für den Unterricht

- **Einstieg:** Eine Stimmgabel anschlagen und in Wasser tauchen. Die Schwingung wird sichtbar. Danach auf dem Oszilloskop ansehen.
- **Messen:** Mit einem Mikrofon und einem Oszilloskop (oder einer App) die Frequenz eigener Töne bestimmen und mit der Simulation vergleichen.
- **Lärm:** Eine Pegel-App im Schulhaus nutzen und die Messwerte in die Skala der Simulation einordnen.
- **Häufige Stolpersteine:**
  - Lautstärke und Tonhöhe verwechseln: Die Frequenz bestimmt die Tonhöhe, die Amplitude die Lautstärke.
  - „Die Luft wandert zum Ohr.“ Die Teilchen schwingen nur hin und her, weiter wandert die Störung.
  - Dezibel addieren: Zwei gleich laute Quellen ergeben nicht doppelt so viele dB, sondern nur $+3\,\text{dB}$.
