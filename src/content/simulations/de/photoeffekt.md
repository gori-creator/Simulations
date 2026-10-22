---
description: "Interaktive Simulation zum Photoeffekt mit der Gegenfeldmethode: Licht wählbarer Wellenlänge und Intensität löst Elektronen aus einer Metallkathode aus, die Gegenspannung wird abgeglichen, Messpunkte ergeben die Einstein-Gerade E_kin = h · f − W_A."
---

## Worum geht es?

Fällt Licht auf eine Metallfläche, können Elektronen herausgelöst werden: der **Photoeffekt**. In einer **Fotozelle** treffen diese Elektronen auf die gegenüberliegende Anode, und ein Strommesser zeigt einen kleinen **Fotostrom** an.

Überraschend ist, *wovon* das abhängt:

- Unterhalb einer **Grenzfrequenz** $f_\text{G}$ werden **gar keine** Elektronen ausgelöst – auch nicht mit sehr hellem Licht.
- Mehr **Intensität** bedeutet **mehr** Elektronen (größerer Strom), aber **nicht schnellere**.
- Die größte Bewegungsenergie der Elektronen wächst mit der **Frequenz** des Lichts.

Einstein erklärte das 1905 mit **Photonen**: Licht besteht aus Energieportionen $E_\text{Ph} = h \cdot f$. Ein Photon gibt seine ganze Energie an ein einziges Elektron ab. Um das Metall zu verlassen, braucht das Elektron die **Austrittsarbeit** $W_\text{A}$; der Rest bleibt als Bewegungsenergie:

$$
E_\text{kin,max} = h \cdot f - W_\text{A}.
$$

**Gegenfeldmethode:** Legt man die Anode auf ein negatives Potenzial gegenüber der Kathode (Gegenspannung $U$), werden die Elektronen gebremst. Der Strom verschwindet bei der Spannung $U_\text{G}$, bei der selbst die schnellsten Elektronen nicht mehr ankommen:

$$
e \cdot U_\text{G} = E_\text{kin,max}.
$$

Misst man $U_\text{G}$ für verschiedene Frequenzen, liegen die Punkte $(f \mid e \cdot U_\text{G})$ auf einer Geraden – der **Einstein-Geraden**. Ihre **Steigung ist die Planck-Konstante** $h \approx 4{,}14 \cdot 10^{-15}\,\text{eV}\cdot\text{s} = 6{,}63 \cdot 10^{-34}\,\text{J}\cdot\text{s}$, sie schneidet die $f$-Achse bei der Grenzfrequenz $f_\text{G} = \frac{W_\text{A}}{h}$ und die Energieachse bei $-W_\text{A}$.

**Austrittsarbeiten** (Schulbuchtabellen, gerundet): Cäsium $1{,}94\,\text{eV}$, Kalium $2{,}25\,\text{eV}$, Natrium $2{,}28\,\text{eV}$, Lithium $2{,}46\,\text{eV}$, Zink $4{,}34\,\text{eV}$, Kupfer $4{,}48\,\text{eV}$. Je nach Quelle und Oberflächenzustand weichen die Werte etwas ab.

**Zur Darstellung:** Die Bewegungsenergien der ausgelösten Elektronen sind im Modell gleichmäßig zwischen $0$ und $E_\text{kin,max}$ verteilt; deshalb fällt der Strom mit wachsender Gegenspannung gerade ab. Die Stromstärke in nA ist ein Modellwert.

## Ausprobieren

1. Beobachte die Elektronen bei $U = 0$. Stelle dann eine Gegenspannung ein: Was passiert mit langsamen und schnellen Elektronen? [Beispiel laden](?U=0.6)
2. Drücke „Gegenspannung abgleichen“. Bei welcher Spannung wird der Strom null? [Strom null](?U=1.16)
3. Verdopple die Intensität von $50\,\%$ auf $100\,\%$. Was ändert sich am Strom, was an $U_\text{G}$? Vergleiche die beiden Kurven im $I$-$U$-Diagramm. [50 %](?P=50&U=0.6) · [100 %](?P=100&U=0.6)
4. Wähle rotes Licht. Hilft es, die Intensität zu erhöhen? [Rotes Licht](?lam=650&P=100)
5. Nimm eine Messreihe auf („Messreihe automatisch“) und lies die Steigung der Ausgleichsgeraden ab.
6. Vergleiche Cäsium mit Zink. Warum braucht man für Zink ultraviolettes Licht? [Zink im UV](?metal=Zn&lam=250)

## Aufgaben

### Aufgabe 1: Violettes Licht auf Cäsium

Licht der Wellenlänge $400\,\text{nm}$ fällt auf eine Cäsium-Kathode ($W_\text{A} = 1{,}94\,\text{eV}$). Berechne die Photonenenergie, die größte Bewegungsenergie der Elektronen und die Gegenspannung, bei der der Strom null wird. [Aufgabe laden](?val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f = \frac{c}{\lambda} = \frac{3{,}00 \cdot 10^8\,\text{m/s}}{400 \cdot 10^{-9}\,\text{m}} = 7{,}50 \cdot 10^{14}\,\text{Hz}$, $E_\text{Ph} = h \cdot f = 4{,}136 \cdot 10^{-15}\,\text{eV}\cdot\text{s} \cdot 7{,}50 \cdot 10^{14}\,\text{Hz} \approx 3{,}10\,\text{eV}$ (schneller: $E_\text{Ph} = \frac{h \cdot c}{\lambda} = \frac{1240\,\text{eV}\cdot\text{nm}}{400\,\text{nm}} = 3{,}10\,\text{eV}$). Die Simulation rechnet mit $c = 2{,}998 \cdot 10^8\,\text{m/s}$ und zeigt deshalb $7{,}495 \cdot 10^{14}\,\text{Hz}$.
$E_\text{kin,max} = 3{,}10\,\text{eV} - 1{,}94\,\text{eV} = 1{,}16\,\text{eV}$, also $U_\text{G} = 1{,}16\,\text{V}$. [In der Simulation zeigen](?U=1.16)

</details>

### Aufgabe 2: Grenzfrequenz

Berechne die Grenzfrequenz und die Grenzwellenlänge für Cäsium. Löst rotes Licht ($650\,\text{nm}$) Elektronen aus? [Aufgabe laden](?lam=650&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_\text{G} = \frac{W_\text{A}}{h} = \frac{1{,}94\,\text{eV}}{4{,}136 \cdot 10^{-15}\,\text{eV}\cdot\text{s}} \approx 4{,}69 \cdot 10^{14}\,\text{Hz}$, $\lambda_\text{G} = \frac{c}{f_\text{G}} \approx 639\,\text{nm}$. Bei $650\,\text{nm}$ ist $E_\text{Ph} \approx 1{,}91\,\text{eV} < W_\text{A}$: keine Elektronen, egal wie hell. [In der Simulation zeigen](?lam=650&P=100)

</details>

### Aufgabe 3: Zink

Warum löst das Licht aus Aufgabe 1 aus Zink ($W_\text{A} = 4{,}34\,\text{eV}$) keine Elektronen aus? Welche Wellenlänge braucht man mindestens? [Aufgabe laden](?metal=Zn&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$3{,}10\,\text{eV} < 4{,}34\,\text{eV}$. Nötig ist $\lambda < \frac{h \cdot c}{W_\text{A}} = \frac{1240\,\text{eV}\cdot\text{nm}}{4{,}34\,\text{eV}} \approx 286\,\text{nm}$, also ultraviolettes Licht. [In der Simulation zeigen](?metal=Zn&lam=250)

</details>

### Aufgabe 4: Planck-Konstante aus zwei Messungen

An Cäsium misst man bei $400\,\text{nm}$ die Gegenspannung $1{,}16\,\text{V}$ und bei $300\,\text{nm}$ die Gegenspannung $2{,}19\,\text{V}$. Bestimme daraus $h$.

<details>
<summary>Lösung anzeigen</summary>

$f_1 = \frac{c}{400\,\text{nm}} = 7{,}50 \cdot 10^{14}\,\text{Hz}$, $f_2 = \frac{c}{300\,\text{nm}} = 10{,}00 \cdot 10^{14}\,\text{Hz}$, $\Delta U = 2{,}19\,\text{V} - 1{,}16\,\text{V} = 1{,}03\,\text{V}$. $h = \frac{e \cdot \Delta U}{\Delta f} = \frac{1{,}03\,\text{eV}}{2{,}50 \cdot 10^{14}\,\text{Hz}} \approx 4{,}1 \cdot 10^{-15}\,\text{eV}\cdot\text{s} \approx 6{,}6 \cdot 10^{-34}\,\text{J}\cdot\text{s}$. [In der Simulation prüfen](?lam=300&U=2.19)

</details>

### Aufgabe 5: Intensität

Erkläre mit dem Photonenmodell, warum doppelte Intensität den Strom verdoppelt, die Gegenspannung $U_\text{G}$ aber gleich bleibt. [50 %](?P=50&U=0.6) · [100 %](?P=100&U=0.6)

<details>
<summary>Lösung anzeigen</summary>

Doppelte Intensität heißt doppelt so viele Photonen pro Sekunde, also doppelt so viele ausgelöste Elektronen. Jedes Photon hat aber weiterhin $h \cdot f$, also bleibt $E_\text{kin,max}$ und damit $U_\text{G}$ gleich. In der Simulation: bei $U = 0{,}6\,\text{V}$ steigt der Strom von etwa $0{,}48\,\text{nA}$ auf $0{,}97\,\text{nA}$, $U_\text{G} = 1{,}16\,\text{V}$ bleibt.

</details>

## Ideen für den Unterricht

- **Einsatz:** in der Oberstufe beim Thema Quantenobjekte und Photonen; die genaue Einordnung bitte am Lehrplan prüfen. Gut als Ergänzung zum Versuch mit der Fotozelle und der Quecksilberlampe mit Filtern.
- **Möglicher Ablauf:** zuerst die drei überraschenden Beobachtungen sammeln (Grenzfrequenz, Intensität, Frequenz), dann mit dem Wellenmodell vergleichen, danach die Gegenfeldmethode und zum Schluss die Einstein-Gerade mit der Bestimmung von $h$.
- **Modell:** Energieverteilung der Elektronen vereinfacht, Kontaktspannungen zwischen Anode und Kathode vernachlässigt. Bei echten Messungen liegt die Gerade deshalb meist etwas verschoben, die Steigung bleibt aber $h$.
- **Häufige Stolpersteine:**
  - „Helleres Licht macht die Elektronen schneller.“ – Mehr Licht bedeutet mehr Photonen, nicht energiereichere.
  - „Die Gegenspannung beschleunigt die Elektronen.“ – Sie bremst sie; nur Elektronen mit $E_\text{kin} > e \cdot U$ kommen an.
  - „$E_\text{kin} = h \cdot f$.“ – Die Austrittsarbeit fehlt: $E_\text{kin,max} = h \cdot f - W_\text{A}$.
- **Weiterführend:** Linienspektren, Compton-Effekt, Fotodioden und Solarzellen.
