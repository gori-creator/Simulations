## Worum geht es?

Fast alle Stoffe **dehnen sich beim Erwärmen aus** und ziehen sich beim Abkühlen zusammen. Im Teilchenmodell ist das leicht zu verstehen: Wärmere Teilchen bewegen sich heftiger und brauchen mehr Platz.

### Feste Körper

Ein Stab der Länge $L_0$ wird um

$$
\Delta L = \alpha \cdot L_0 \cdot \Delta T
$$

länger. Der **Ausdehnungskoeffizient** $\alpha$ hängt vom Material ab: Aluminium dehnt sich etwa doppelt so stark wie Stahl, die Speziallegierung Invar fast gar nicht. Die Änderungen sind winzig – in der Simulation sind sie stark vergrößert gezeichnet. Bei langen Bauwerken summieren sie sich aber: Eine 100 m lange Stahlbrücke ist im Sommer mehrere Zentimeter länger als im Winter. Darum gibt es **Dehnungsfugen**.

Ein **Bimetall** besteht aus zwei fest verbundenen Streifen verschiedener Metalle. Beim Erwärmen dehnt sich einer stärker aus, der Streifen biegt sich. So schalten Bügeleisen, Wasserkocher und alte Thermostate.

### Flüssigkeiten und Gase

Flüssigkeiten dehnen sich stärker aus als feste Stoffe – das nutzt das Flüssigkeitsthermometer. **Gase** dehnen sich noch viel stärker aus, und zwar alle etwa gleich: bei gleichem Druck um rund $\frac{1}{273}$ ihres Volumens bei 0 °C pro Kelvin. Verlängert man die Gerade im Diagramm, erreicht sie bei **−273 °C** das Volumen null – den **absoluten Nullpunkt**. Darauf beruht die Kelvin-Skala:

$$
V = V_0 \cdot \frac{T}{T_0} \qquad (T \text{ in Kelvin})
$$

### Die Anomalie des Wassers

Wasser verhält sich anders: Kühlt man es ab, wird es bis **4 °C** dichter, darunter aber wieder leichter. Eis ist noch leichter (917 kg/m³) und schwimmt.

Im Herbst kühlt das Oberflächenwasser eines Sees ab, wird schwerer und sinkt, bis überall 4 °C herrschen. Kühlt es weiter ab, bleibt das kältere Wasser oben, und der See friert **von oben** zu. Am Grund bleibt 4 °C warmes Wasser – Fische und Pflanzen überleben den Winter.

## Ausprobieren

- [Aluminium gegen Stahl](?mode=fest&mat=aluminium&t=80): In welche Richtung biegt sich das Bimetall? Probiere auch −20 °C.
- [Stahlbrücke](?mode=fest&mat=steel&L0=100&t=60): Wie breit muss die Dehnungsfuge sein?
- [Gas erwärmen](?mode=gas&t=80) und [abkühlen](?mode=gas&t=-20).
- [See im Herbst](?mode=wasser&luft=8) und [im Winter](?mode=wasser&luft=-6).

## Aufgaben

**1. Brücke im Sommer.** Eine Stahlbrücke ist bei 20 °C genau 100 m lang ($\alpha = 12 \cdot 10^{-6}\,\tfrac{1}{\text{K}}$). Wie viel länger ist sie bei 60 °C? [Aufgabe laden](?mode=fest&mat=steel&L0=100&t=60&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\Delta L = 12 \cdot 10^{-6}\,\tfrac{1}{\text{K}} \cdot 100\,\text{m} \cdot 40\,\text{K} = 0{,}048\,\text{m} = 4{,}8\,\text{cm}$.

</details>

**2. Bimetall.** Ein Bimetall aus Aluminium (oben) und Stahl (unten) wird erwärmt. In welche Richtung biegt es sich? [Aufgabe laden](?mode=fest&mat=aluminium&t=80&_hide=1)

<details><summary>Lösung anzeigen</summary>

Aluminium dehnt sich stärker aus. Die obere Seite wird länger, der Streifen biegt sich **nach unten** (zur Stahlseite hin). Beim Abkühlen biegt er sich nach oben.

</details>

**3. Gas im Zylinder.** 1 L Luft wird bei gleichem Druck von 20 °C auf 80 °C erwärmt. Wie groß ist das Volumen? [Aufgabe laden](?mode=gas&t=80&_hide=1)

<details><summary>Lösung anzeigen</summary>

$V = 1\,\text{L} \cdot \frac{353\,\text{K}}{293\,\text{K}} \approx 1{,}20\,\text{L}$ – 20 % mehr. Ein Stahlstab wäre nur um 0,07 % länger geworden.

</details>

**4. Fische im Winter.** Erkläre, warum ein tiefer See im Winter nicht bis zum Grund gefriert.

<details><summary>Lösung anzeigen</summary>

Wasser ist bei 4 °C am dichtesten. Dieses Wasser sinkt nach unten und bleibt dort. Kälteres Wasser ist leichter und bleibt oben; dort gefriert es zu Eis, das schwimmt und den See wie ein Deckel isoliert. Am Grund bleibt es bei etwa 4 °C.

</details>

## Ideen für den Unterricht

- **Versuche:** Kugel-Ring-Versuch, Bimetallstreifen über der Kerzenflamme, Luftballon auf einer Flasche in warmem Wasser.
- **Alltag:** Warum hängen Stromleitungen im Sommer tiefer? Warum platzen volle Wasserflaschen im Gefrierfach?
- **Vernetzung:** Gay-Lussac und Kelvin-Skala in der Simulation „Gasgesetze“.
