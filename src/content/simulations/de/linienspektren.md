## Worum geht es?

Ein Gas aus einzelnen Atomen leuchtet nicht in allen Farben, sondern nur in ganz bestimmten. Hinter einem Prisma oder Gitter sieht man deshalb kein Farbband, sondern einzelne helle Linien: ein **Linienspektrum**. Jedes Element hat sein eigenes Linienmuster, eine Art Fingerabdruck.

Die Erklärung: Die Elektronenhülle eines Atoms kann nur bestimmte Energien haben, die **Energieniveaus**. Man zeichnet sie im **Termschema** als waagrechte Linien. Springt das Elektron von einem höheren Niveau $E_\text{o}$ auf ein tieferes Niveau $E_\text{u}$, sendet das Atom genau **ein Photon** aus. Dessen Energie ist die Differenz der Niveaus:

$$
\Delta E = E_\text{o} - E_\text{u} = h \cdot f
\qquad\text{mit}\qquad h = 6{,}626 \cdot 10^{-34}\,\text{J}\cdot\text{s}.
$$

Aus der Frequenz folgt die Wellenlänge $\lambda = \frac{c}{f} = \frac{h \cdot c}{\Delta E}$. Praktisch zum Rechnen: $h \cdot c \approx 1240\,\text{eV}\cdot\text{nm}$ und $1\,\text{eV} = 1{,}602 \cdot 10^{-19}\,\text{J}$. Großer Sprung bedeutet große Energie, hohe Frequenz und kurze Wellenlänge (blau bis UV); kleiner Sprung bedeutet rotes oder infrarotes Licht.

**Wasserstoff** hat nach dem Bohrschen Atommodell die Niveaus

$$
E_n = -\frac{13{,}6\,\text{eV}}{n^2}, \qquad n = 1, 2, 3, \dots
$$

Alle Sprünge, die auf demselben Niveau enden, bilden eine **Serie**: Lyman ($n = 1$, nur UV), **Balmer** ($n = 2$, die vier sichtbaren Linien bei $656$, $486$, $434$ und $410\,\text{nm}$), Paschen ($n = 3$, Infrarot). $E = 0$ bedeutet: Das Elektron ist gerade frei (**Ionisierung**).

**Absorption:** Schickt man weißes Licht durch ein kühles Gas, nehmen die Atome genau die Photonen auf, deren Energie für einen Sprung nach oben passt. Im Spektrum fehlen dann dieselben Farben, die das Gas beim Leuchten aussendet: dunkle **Absorptionslinien** im farbigen Band. So hat Fraunhofer die dunklen Linien im Sonnenspektrum entdeckt.

**Zur Darstellung:** Die Bahnen im Atombild sind ein Modell (wie bei Bohr) und nicht maßstäblich. Für Helium, Natrium und Quecksilber stimmt das einfache Bohr-Modell nicht mehr; die Niveaus stammen dort aus Tabellenwerten. Im Termschema stehen sie in Spalten (s, p, d bzw. Singulett und Triplett), weil nur bestimmte Sprünge vorkommen. Wellenlängen stehen im Bild auf ganze nm gerundet, in der Tabelle „Sichtbare Linien“ auf 0,1 nm. Die Simulation rechnet mit **Vakuumwellenlängen**; Tabellenwerte für Luft sind etwas kleiner, z. B. die gelbe Heliumlinie $587{,}7\,\text{nm}$ (Vakuum) statt $587{,}6\,\text{nm}$ (Luft).

## Ausprobieren

1. Beobachte einen Sprung von $n = 3$ nach $n = 2$: Wo landet das Photon auf dem Schirm, welche Farbe hat es? Schalte die Zeitlupe ein. [Beispiel laden](?u=3&l=2&slow=1)
2. Tippe nacheinander die anderen Pfeile der Balmer-Serie an. Wie ändern sich $\Delta E$, $f$ und $\lambda$? [Balmer-Serie](?u=4&l=2)
3. Wähle einen Sprung, der auf $n = 1$ endet. Warum sieht man keine Farbe? [Lyman-α](?u=2&l=1)
4. Lass das Gas leuchten: Alle Übergänge kommen vor. Vergleiche die Spektren von Wasserstoff, Helium, Natrium und Quecksilber. [Alle Linien](?run=all)
5. Schalte auf Absorption. Wo entstehen die dunklen Linien? Vergleiche mit der Emission. [Natrium in Absorption](?el=Na&mode=abs&u=2&l=1)
6. Quecksilberdampflampe: Welche Linien sieht man, welche bleiben unsichtbar? [Quecksilber](?el=Hg&u=6&l=4&run=all)

## Aufgaben

### Aufgabe 1: Die blaugrüne Wasserstofflinie

Berechne Energie, Frequenz und Wellenlänge des Photons beim Sprung von $n = 4$ nach $n = 2$. [Aufgabe laden](?u=4&l=2&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$E_4 = -\frac{13{,}6\,\text{eV}}{16} = -0{,}85\,\text{eV}$, $E_2 = -3{,}40\,\text{eV}$, also $\Delta E = 2{,}55\,\text{eV} = 4{,}09 \cdot 10^{-19}\,\text{J}$.
$f = \frac{\Delta E}{h} \approx 6{,}17 \cdot 10^{14}\,\text{Hz}$, $\lambda = \frac{c}{f} \approx 486\,\text{nm}$ (blaugrün, H$_\beta$). [In der Simulation zeigen](?u=4&l=2)

</details>

### Aufgabe 2: Unsichtbares Licht

Beim Sprung von $n = 2$ nach $n = 1$ entsteht die Lyman-α-Linie. Berechne ihre Wellenlänge. Warum kann man sie mit dem Auge nicht sehen? [Aufgabe laden](?u=2&l=1&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta E = -3{,}40\,\text{eV} - (-13{,}60\,\text{eV}) = 10{,}2\,\text{eV}$, $\lambda = \frac{1240\,\text{eV}\cdot\text{nm}}{10{,}2\,\text{eV}} \approx 122\,\text{nm}$. Das ist ultraviolett; das Auge sieht nur etwa $380$ bis $780\,\text{nm}$. [In der Simulation zeigen](?u=2&l=1)

</details>

### Aufgabe 3: Die gelbe Natriumlinie

Straßenlaternen mit Natriumdampf leuchten gelb bei $\lambda = 589\,\text{nm}$. Wie groß ist der Energieunterschied der beteiligten Niveaus? Warum erscheint dieselbe Linie dunkel, wenn man weißes Licht durch eine Natriumflamme schickt? [Aufgabe laden](?el=Na&mode=abs&u=2&l=1&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta E = \frac{h \cdot c}{\lambda} = \frac{1240\,\text{eV}\cdot\text{nm}}{589\,\text{nm}} \approx 2{,}10\,\text{eV}$ (Sprung $3\text{p} \to 3\text{s}$). Die Natriumatome im Grundzustand nehmen genau die Photonen mit $2{,}10\,\text{eV}$ aus dem weißen Licht auf. Sie geben die Energie zwar wieder ab, aber in alle Richtungen; in Richtung des Spektralapparats fehlt dieses Licht. [In der Simulation zeigen](?el=Na&mode=abs&u=2&l=1)

</details>

### Aufgabe 4: Welches Niveau?

Im Quecksilberspektrum leuchtet eine grüne Linie bei $546\,\text{nm}$. Sie entsteht, wenn das Elektron vom Niveau $7^3\text{S}_1$ ($E = -2{,}71\,\text{eV}$) springt. Auf welchem Niveau landet es? Nutze das Termschema und prüfe deine Antwort, indem du den passenden Pfeil antippst. [Aufgabe laden](?el=Hg&u=6&l=2&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta E = \frac{1240\,\text{eV}\cdot\text{nm}}{546\,\text{nm}} \approx 2{,}27\,\text{eV}$, also $E_\text{u} = -2{,}71\,\text{eV} - 2{,}27\,\text{eV} = -4{,}98\,\text{eV}$. Das ist das Niveau $6^3\text{P}_2$. [In der Simulation zeigen](?el=Hg&u=6&l=4)

</details>

### Aufgabe 5: Die Seriengrenze

Die Balmer-Linien rücken zum Violetten hin immer enger zusammen. Berechne die kürzeste Wellenlänge der Balmer-Serie (Sprung von „$n = \infty$“, also $E = 0$, nach $n = 2$).

<details>
<summary>Lösung anzeigen</summary>

$\Delta E = 0 - (-3{,}40\,\text{eV}) = 3{,}40\,\text{eV}$, $\lambda = \frac{1240\,\text{eV}\cdot\text{nm}}{3{,}40\,\text{eV}} \approx 365\,\text{nm}$ (knapp im UV). Weil die Niveaus nach oben immer dichter liegen, unterscheiden sich die Sprünge von $n = 6, 7, 8, \dots$ nach $n = 2$ kaum noch. [Balmer-Serie zeigen](?run=all)

</details>

### Aufgabe 6: Ionisieren

Welche Wellenlänge darf ein Photon höchstens haben, damit es ein Wasserstoffatom im Grundzustand ionisieren kann?

<details>
<summary>Lösung anzeigen</summary>

Es braucht mindestens $13{,}6\,\text{eV}$: $\lambda \le \frac{1240\,\text{eV}\cdot\text{nm}}{13{,}6\,\text{eV}} \approx 91\,\text{nm}$ (ultraviolett). Sichtbares Licht reicht dafür nicht aus.

</details>

## Ideen für den Unterricht

- **Einsatz:** in der Oberstufe beim Thema Atomhülle und Quantenphysik (Energieniveaus, Linienspektren, Bohrsches Modell); die genaue Einordnung bitte am Lehrplan prüfen. Gut als Ergänzung zur Beobachtung von Spektralröhren mit dem Handspektroskop: Erst das reale Spektrum ansehen, dann in der Simulation den Ursprung jeder Linie suchen.
- **Möglicher Ablauf:** zuerst nur Wasserstoff und die Balmer-Linien, Rechnung $\Delta E = h \cdot f$ von Hand; danach „Gas leuchtet“ und die anderen Elemente als Fingerabdruck; zum Schluss Absorption und Fraunhofer-Linien. Mit „Werte im Bild anzeigen“ aus (`val=0`) lassen sich Rechenaufgaben stellen.
- **Modell:** Die Bahnen im Atombild sind eine Veranschaulichung der Niveaus, keine maßstäblichen Elektronenbahnen. Die Helligkeit der Linien ist ein grober Richtwert. Bei der Absorption sind in einem kalten Gas fast alle Atome im Grundzustand; Balmer-Linien sieht man in Absorption z. B. in heißen Sternatmosphären.
- **Häufige Stolpersteine:**
  - „Das Elektron sendet beim Kreisen Licht aus.“ – Licht entsteht nur beim Sprung zwischen zwei Niveaus, ein Photon pro Sprung.
  - „Hohe Niveaus geben rotes Licht.“ – Entscheidend ist der Energieunterschied, nicht die Höhe des Startniveaus.
  - „Negative Energie gibt es nicht.“ – Der Nullpunkt ist frei gewählt: $E = 0$ heißt „Elektron gerade frei“, gebundene Zustände liegen darunter.
  - „Im Absorptionsspektrum fehlt das Licht, weil es verschluckt bleibt.“ – Die Atome senden die Energie wieder aus, aber in alle Richtungen.
- **Weiterführend:** Franck-Hertz-Versuch (Quecksilber, $4{,}9\,\text{eV}$), Photoeffekt, Spektralanalyse in der Astronomie, Leuchtstofflampen und LEDs.
