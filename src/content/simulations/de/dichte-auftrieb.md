---
description: "Körper schwimmen, schweben oder sinken – je nachdem, ob ihre Dichte kleiner, gleich oder größer als die der Flüssigkeit ist; mit Archimedes, Dichtemessung und Heißluftballon."
---

## Worum geht es?

Die **Dichte** gibt an, wie viel Masse in einem Kubikzentimeter eines Stoffs steckt: $\rho = \frac{m}{V}$ in $\tfrac{\text{g}}{\text{cm}^3}$ oder $\tfrac{\text{kg}}{\text{m}^3}$, dabei ist $1\,\tfrac{\text{g}}{\text{cm}^3} = 1000\,\tfrac{\text{kg}}{\text{m}^3}$.

Ein Holzwürfel mit $V = 125\,\text{cm}^3$ und $\rho = 0{,}6\,\tfrac{\text{g}}{\text{cm}^3}$ hat die Masse $m = 75\,\text{g}$. Auf ihn wirkt die **Gewichtskraft** $F_G = m \cdot g = 0{,}075\,\text{kg} \cdot 9{,}81\,\tfrac{\text{N}}{\text{kg}} \approx 0{,}74\,\text{N}$.

Taucht ein Körper in eine Flüssigkeit, drückt sie ihn nach oben: die **Auftriebskraft**. Nach dem **Prinzip des Archimedes** ist sie so groß wie die Gewichtskraft der verdrängten Flüssigkeit:

$$
F_A = \rho_{Fl} \cdot V_{\text{verdrängt}} \cdot g
$$

Ein $100\text{-cm}^3$-Körper ganz unter Wasser erfährt $F_A = 1000\,\tfrac{\text{kg}}{\text{m}^3} \cdot 0{,}0001\,\text{m}^3 \cdot 9{,}81\,\tfrac{\text{N}}{\text{kg}} \approx 0{,}98\,\text{N}$ – egal, ob er aus Holz oder aus Eisen ist.

Ob ein Körper schwimmt, entscheidet der Vergleich der Dichten:

- $\rho_K < \rho_{Fl}$: Er **schwimmt**. Er taucht nur so tief ein, bis $F_A = F_G$. Der eingetauchte Anteil ist $\frac{\rho_K}{\rho_{Fl}}$ – Holz mit $0{,}6\,\tfrac{\text{g}}{\text{cm}^3}$ zu $60\,\%$, Eis zu $91{,}7\,\%$.
- $\rho_K = \rho_{Fl}$: Er **schwebt** in jeder Tiefe.
- $\rho_K > \rho_{Fl}$: Er **sinkt**. Am Boden trägt der Boden den Rest: $F_N = F_G - F_A$.

Ein **Schiff aus Stahl** schwimmt, weil es mit seiner Form viel Wasser verdrängt: Seine **mittlere Dichte** (Masse durch Außenvolumen) ist kleiner als die von Wasser. Ein **U-Boot** ändert seine mittlere Dichte, indem es Tauchzellen flutet oder leer pumpt. Auch in **Luft** gibt es Auftrieb: Warme Luft hat nach der Gasgleichung $\rho = \frac{p \cdot M}{R \cdot T}$ eine kleinere Dichte als kalte – darauf beruht der **Heißluftballon**.

## Ausprobieren

1. Zieh den Holzwürfel ins Wasser, drück ihn unter und lass los. Beobachte die Kraftpfeile und den Wasserstand. Wie groß ist die Kraft deiner Hand?
2. Tippe auf der Dichteskala andere Stoffe und Flüssigkeiten an. Welche Stoffe liegen über der blauen Linie? [Eisen](?mat=iron) · [Eis](?mat=ice) · [PE in Spiritus](?mat=pe&liq=spirit) · [Eisen in Quecksilber](?mat=iron&liq=mercury)
3. Stell eine eigene Dichte von genau $1{,}00\,\tfrac{\text{g}}{\text{cm}^3}$ ein: Der Würfel schwebt. [Schweben](?mat=own&rk=1)
4. Belade das Stahlschiff, bis es vollläuft. Wechsle dann zu Meerwasser. [Schiff](?obj=ship&load=600)
5. Archimedes: Tauche einen Aluminiumwürfel in das volle Überlaufgefäß. Vergleiche die Abnahme am Kraftmesser mit dem Gewicht des Wassers im Becher. [Überlaufgefäß](?mode=arch&mat=alu&V=200)
6. Heize den Ballon und finde heraus, ab welcher Innentemperatur er abhebt. [Heißluftballon](?mode=ball&Ti=75)

## Aufgaben

### Aufgabe 1: Spitze des Eisbergs

Welcher Anteil eines Eisbergs ($\rho = 0{,}917\,\tfrac{\text{g}}{\text{cm}^3}$) liegt in Süßwasser unter der Oberfläche? [Aufgabe laden](?mat=ice&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{\rho_K}{\rho_{Fl}} = \frac{0{,}917}{1{,}00} = 91{,}7\,\%$ – nur gut $8\,\%$ schauen heraus. In Meerwasser ($1{,}025\,\tfrac{\text{g}}{\text{cm}^3}$) sind es $\frac{0{,}917}{1{,}025} \approx 89{,}5\,\%$. [Im Meer zeigen](?mat=ice&liq=salt)

</details>

### Aufgabe 2: Kraftmesser im Wasser

Ein Aluminiumwürfel ($200\,\text{cm}^3$, $\rho = 2{,}7\,\tfrac{\text{g}}{\text{cm}^3}$) hängt am Kraftmesser und wird ganz in Wasser getaucht. Was zeigt der Kraftmesser an, wie viel Wasser läuft über? [Aufgabe laden](?mode=arch&mat=alu&V=200&d=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$m = 540\,\text{g}$, also $F_G = 0{,}54\,\text{kg} \cdot 9{,}81\,\tfrac{\text{N}}{\text{kg}} \approx 5{,}30\,\text{N}$. Es laufen $200\,\text{cm}^3$ Wasser über, also $200\,\text{g}$ mit $F_A \approx 1{,}96\,\text{N}$. Der Kraftmesser zeigt $5{,}30\,\text{N} - 1{,}96\,\text{N} = 3{,}34\,\text{N}$. [Eintauchen](?mode=arch&mat=alu&V=200)

</details>

### Aufgabe 3: Rätselprobe

Bestimme mit Waage und Messzylinder die Dichte von Probe A. Aus welchem Stoff ist sie? [Aufgabe laden](?mode=rho&probe=A&pos=cyl&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$m = 81{,}0\,\text{g}$, $V = 230\,\text{ml} - 200\,\text{ml} = 30\,\text{cm}^3$, also $\rho = \frac{81{,}0\,\text{g}}{30\,\text{cm}^3} = 2{,}70\,\tfrac{\text{g}}{\text{cm}^3}$ – Aluminium.

</details>

### Aufgabe 4: Schiff im Fluss und im Meer

Das Stahlschiff ($300\,\text{g}$, Grundfläche $20\,\text{cm} \times 10\,\text{cm}$, Bordwand $6\,\text{cm}$) trägt $600\,\text{g}$ Ladung. Wie tief taucht es in Süßwasser ein, wie tief im Meer? Wie viel Ladung trägt es höchstens? [Aufgabe laden](?obj=ship&load=600&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Es muss $900\,\text{g}$ Wasser verdrängen: $t = \frac{900\,\text{cm}^3}{200\,\text{cm}^2} = 4{,}5\,\text{cm}$. Im Meer: $t = \frac{900\,\text{g}}{1{,}025\,\tfrac{\text{g}}{\text{cm}^3} \cdot 200\,\text{cm}^2} \approx 4{,}39\,\text{cm}$. Höchstens verdrängt es $1200\,\text{cm}^3$, also trägt es in Süßwasser $1200\,\text{g} - 300\,\text{g} = 900\,\text{g}$ Ladung. [Im Meer zeigen](?obj=ship&load=600&liq=salt)

</details>

### Aufgabe 5: U-Boot

Das U-Boot hat $600\,\text{cm}^3$ Volumen, $450\,\text{g}$ Masse und eine Tauchzelle mit $300\,\text{cm}^3$. Wie weit muss sie in Süßwasser geflutet sein, damit es schwebt? Und im Meer?

<details>
<summary>Lösung anzeigen</summary>

Schweben bei $m = 600\,\text{g}$: Es fehlen $150\,\text{g}$ Wasser, also $50\,\%$ der Tauchzelle. [Zeigen](?obj=sub&fill=50) Im Meer: $600\,\text{cm}^3 \cdot 1{,}025\,\tfrac{\text{g}}{\text{cm}^3} = 615\,\text{g}$, es fehlen $165\,\text{g} = 161\,\text{cm}^3$ Meerwasser, also etwa $54\,\%$. [Im Meer](?obj=sub&fill=54&liq=salt)

</details>

### Aufgabe 6: Heißluftballon

Ein Ballon mit $2500\,\text{m}^3$ Hülle wiegt mit Korb und Brenner $315\,\text{kg}$. Außen sind es $15\,°\text{C}$ ($\rho = 1{,}225\,\tfrac{\text{kg}}{\text{m}^3}$), innen $90\,°\text{C}$ ($\rho \approx 0{,}972\,\tfrac{\text{kg}}{\text{m}^3}$). Wie viel Zuladung kann er höchstens tragen? [Aufgabe laden](?mode=ball&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Tragkraft $(1{,}225 - 0{,}972)\,\tfrac{\text{kg}}{\text{m}^3} \cdot 2500\,\text{m}^3 \approx 632\,\text{kg}$. Davon gehen $315\,\text{kg}$ für den Ballon ab: höchstens etwa $317\,\text{kg}$ Zuladung. [Ausprobieren](?mode=ball&ml=320)

</details>

## Ideen für den Unterricht

- **Einsatz:** Dichte als Stoffeigenschaft (Klasse 7), Druck und Auftrieb (Klasse 7–9); der Heißluftballon passt auch zur Wärmelehre und zur Gasgleichung. Ein möglicher Einstieg: Vorhersagen sammeln, welcher Würfel schwimmt, und dann mit der Dichteskala prüfen.
- **Messen wie im Labor:** Die Rätselproben eignen sich für Partnerarbeit. Spannend kann der Versuch ohne Draht sein (`push=0`): Holz liefert dann eine viel zu große Dichte, und die Lernenden suchen selbst den Fehler.
- **Modell und Vereinfachungen:** $g = 9{,}81\,\tfrac{\text{N}}{\text{kg}}$, Süßwasser mit $1{,}00\,\tfrac{\text{g}}{\text{cm}^3}$. Holz, Kork und Wachs streuen in der Wirklichkeit stark. Kippen wird nicht betrachtet; die Wellen sind nur zur Anschauung verstärkt. Beim Ballon ist die Außentemperatur in allen Höhen gleich (barometrische Höhenformel); in Wirklichkeit wird es nach oben kälter, und er steigt bei gleicher Innentemperatur noch etwas höher. Die Hüllenmasse ist ein Erfahrungswert.
- **Häufige Stolpersteine:**
  - „Schwere Körper sinken, leichte schwimmen.“ – Ein Schiff wiegt Tausende Tonnen; entscheidend ist die Dichte bzw. die mittlere Dichte.
  - „Der Auftrieb hängt vom Stoff des Körpers ab.“ – Er hängt nur vom verdrängten Volumen und von der Flüssigkeit ab.
  - „Tiefer unten ist der Auftrieb größer.“ – Ist der Körper ganz eingetaucht, bleibt $F_A$ gleich.
  - „Im Messzylinder schwimmt die Probe – das ist ihr Volumen.“ – Nur ganz untergetaucht stimmt $V = V_2 - V_1$.
