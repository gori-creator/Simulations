## Worum geht es?

Wasser im Gartenschlauch, Wind zwischen zwei Hochhäusern, Luft am Flügel eines Flugzeugs: Überall strömen Flüssigkeiten oder Gase. Zwei einfache Regeln erklären erstaunlich viel davon.

### Kontinuität: Was hineinfließt, fließt auch hinaus

Wasser lässt sich kaum zusammendrücken. Durch jeden Querschnitt eines Rohrs fließt deshalb in jeder Sekunde **gleich viel** Wasser:

$$A_1 \cdot v_1 = A_2 \cdot v_2$$

Ist die Engstelle nur ein Viertel so groß ($A_2 = \tfrac14 A_1$), strömt das Wasser dort viermal so schnell. Das kennst du vom Daumen auf dem Gartenschlauch.

### Bernoulli: Schnell heißt wenig Druck

Damit das Wasser in die Engstelle hinein schneller wird, muss es beschleunigt werden – und das schafft nur ein Druckunterschied. Vor der Engstelle ist der Druck also größer als in ihr. Die **Bernoulli-Gleichung** sagt, wie viel:

$$p_1 + \tfrac12 \rho v_1^2 = p_2 + \tfrac12 \rho v_2^2$$

Die Steigrohre machen das sichtbar: Über der Engstelle steht das Wasser tiefer. Hinter der Engstelle ist das Rohr wieder weit, das Wasser wieder langsam – und der Druck wieder so groß wie vorher (Reibung lassen wir weg). Bei großem Tempo kann der Druck in der Engstelle sogar unter den Luftdruck fallen: Es entsteht ein **Sog**. So arbeiten Wasserstrahlpumpe und Zerstäuber.

### Laminar oder turbulent?

Langsame Strömungen in dünnen Rohren sind **laminar**: Die Teilchen gleiten in Schichten aneinander vorbei, in der Mitte am schnellsten. Schnelle Strömungen in dicken Rohren werden **turbulent**: Es bilden sich Wirbel, alles mischt sich. Entscheidend ist die **Reynolds-Zahl**

$$Re = \frac{v \cdot d}{\nu}$$

mit dem Durchmesser $d$ und der Zähigkeit $\nu$ (für Wasser etwa $10^{-6}\,\text{m}^2/\text{s}$). Unter etwa 2300 bleibt eine Rohrströmung laminar, über etwa 4000 wird sie turbulent.

### Der Tragflügel

Ein Flügel ist gewölbt und leicht schräg angestellt (**Anstellwinkel** $\alpha$). Die Luft wird dadurch nach unten umgelenkt und strömt **über dem Flügel schneller** als darunter. Nach Bernoulli ist der Druck oben kleiner, unten größer: Der Flügel wird nach oben gedrückt. Die **Auftriebskraft** ist

$$F_A = \tfrac12 \cdot \rho \cdot v^2 \cdot A \cdot c_A$$

mit der Luftdichte $\rho \approx 1{,}2\,\text{kg/m}^3$, der Fluggeschwindigkeit $v$, der Flügelfläche $A$ und dem **Auftriebsbeiwert** $c_A$. Der Beiwert wächst mit dem Anstellwinkel – aber nur bis etwa 15°. Danach kann die Luft der Oberseite nicht mehr folgen, sie **löst sich ab** und verwirbelt: Der Auftrieb bricht ein (**Strömungsabriss**).

Achtung, verbreiteter Irrtum: Die Luft oben und unten trifft sich hinten **nicht** wieder. Starte den Flügel-Versuch und schau hin – die Teilchen oben kommen deutlich früher an.

### Was die Simulation vereinfacht

Die Stromlinien am Flügel stammen aus einem reibungsfreien Modell (Joukowski-Profil mit Kutta-Bedingung). Weil echte Luft reibt, erreichen reale Flügel nur etwa drei Viertel des idealen Auftriebs; damit rechnet die Simulation. Den Strömungsabriss ab 15° haben wir vereinfacht nachgebildet. Im Rohr werden Reibungsverluste weggelassen.

## Ausprobieren

- [Laminare Strömung](?mode=rohr&v1=0.4&d=0.5&eng=25): Wie schnell ist das Wasser in der Engstelle? Wie tief steht das mittlere Steigrohr?
- [Turbulente Strömung](?mode=rohr&v1=0.8&d=2&eng=25): Was ändert sich an der Bewegung der Teilchen?
- [Starke Verengung](?mode=rohr&v1=0.6&d=0.5&eng=10): Wann entsteht in der Engstelle ein Sog?
- [Reiseflug](?mode=fluegel&v=55&alpha=3&A=16): Wie viel Masse kann der Flügel tragen?
- [Strömungsabriss](?mode=fluegel&v=30&alpha=20&A=16): Was passiert über dem Flügel?

## Aufgaben

**1. Gartenschlauch.** Ein Schlauch hat 2 cm² Querschnitt, das Wasser fließt mit 0,5 m/s. Mit dem Daumen verengst du die Öffnung auf 0,2 cm². Wie schnell spritzt das Wasser heraus? [Aufgabe laden](?mode=rohr&v1=0.5&d=1&eng=10&_hide=1)

<details><summary>Lösung anzeigen</summary>

$v_2 = v_1 \cdot \dfrac{A_1}{A_2} = 0{,}5\,\tfrac{\text{m}}{\text{s}} \cdot \dfrac{2}{0{,}2} = 5\,\tfrac{\text{m}}{\text{s}}$.

</details>

**2. Druckunterschied.** Wasser strömt mit 0,4 m/s in eine Engstelle mit einem Viertel des Querschnitts. Wie groß ist der Druckunterschied, und wie viel tiefer steht das Wasser im mittleren Steigrohr? [Aufgabe laden](?mode=rohr&v1=0.4&d=0.5&eng=25&_hide=1)

<details><summary>Lösung anzeigen</summary>

$v_2 = 1{,}6\,\tfrac{\text{m}}{\text{s}}$, $\Delta p = \tfrac12 \cdot 1000 \cdot (1{,}6^2 - 0{,}4^2)\,\text{Pa} = 1200\,\text{Pa}$.
Die Wassersäule ist $\Delta h = \dfrac{\Delta p}{\rho g} \approx 0{,}12\,\text{m}$ niedriger.

</details>

**3. Laminar?** Wasser fließt mit 0,8 m/s durch ein Rohr mit 2 cm Durchmesser. Ist die Strömung laminar? [Aufgabe laden](?mode=rohr&v1=0.8&d=2&eng=25&_hide=1)

<details><summary>Lösung anzeigen</summary>

$Re = \dfrac{0{,}8 \cdot 0{,}02}{10^{-6}} = 16\,000$ – weit über 4000, also turbulent.

</details>

**4. Doppelt so schnell.** Wie ändert sich die Auftriebskraft, wenn ein Flugzeug doppelt so schnell fliegt? [Aufgabe laden](?mode=fluegel&v=30&alpha=6&A=16&_hide=1)

<details><summary>Lösung anzeigen</summary>

$F_A \sim v^2$: Sie wird viermal so groß. Darum kann ein schnelles Flugzeug mit kleinem Anstellwinkel fliegen, beim langsamen Landeanflug braucht es einen größeren Anstellwinkel (und Landeklappen).

</details>

**5. Zu steil.** Erhöhe den Anstellwinkel schrittweise bis 24°. Bei welchem Winkel trägt der Flügel am meisten? Warum fliegen Piloten nicht immer so steil? [Aufgabe laden](?mode=fluegel&v=30&alpha=10&A=16)

<details><summary>Lösung anzeigen</summary>

Am meisten bei etwa 15°. Darüber reißt die Strömung ab, der Auftrieb bricht ein – kurz vor dem Abriss ist es also gefährlich. Außerdem steigt mit dem Anstellwinkel der Luftwiderstand stark an.

</details>
