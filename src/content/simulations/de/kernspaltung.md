## Worum geht es?

Atomkerne bestehen aus Protonen und Neutronen (**Nukleonen**). Die starke Kernkraft hält sie zusammen – so fest, dass ein Kern **leichter** ist als seine Bausteine einzeln. Diese fehlende Masse heißt **Massendefekt**. Nach $E = m c^2$ entspricht sie der **Bindungsenergie** $B$: der Energie, die frei wurde, als sich der Kern bildete.

### Die Kurve der Bindungsenergie

Teilt man $B$ durch die Zahl der Nukleonen $A$, erhält man die **Bindungsenergie pro Nukleon**. Sie steigt bei leichten Kernen steil an, erreicht bei **Eisen** (etwa 8,8 MeV) ihr Maximum und fällt zu schweren Kernen langsam ab. Daraus folgt:

- **Kernspaltung:** Zerfällt ein schwerer Kern wie Uran-235 in zwei mittelschwere Kerne, sind die Bruchstücke fester gebunden. Die Differenz – etwa 200 MeV pro Spaltung – wird frei.
- **Kernfusion:** Verschmelzen sehr leichte Kerne (Deuterium und Tritium zu Helium), steigt die Bindungsenergie pro Nukleon stark an. Pro Nukleon wird sogar mehr Energie frei als bei der Spaltung. So leuchtet die Sonne.

Zum Vergleich: Bei der Verbrennung von Kohle werden pro Molekül nur wenige eV frei – millionenfach weniger.

### Kettenreaktion

Ein Uran-235-Kern, der ein langsames Neutron einfängt, spaltet sich und setzt **2 bis 3 neue Neutronen** frei. Treffen diese weitere Kerne, entsteht eine **Kettenreaktion**. Entscheidend ist der **Vermehrungsfaktor** $k$: die mittlere Zahl der Neutronen einer Generation, die eine neue Spaltung auslösen.

- $k < 1$: **unterkritisch** – die Reaktion erlischt.
- $k = 1$: **kritisch** – gleichbleibende Leistung. So arbeitet ein Kernkraftwerk.
- $k > 1$: **überkritisch** – die Zahl der Spaltungen wächst exponentiell.

Im Reaktor regeln **Steuerstäbe** (z. B. aus Bor oder Cadmium), die Neutronen absorbieren, den Wert von $k$.

## Ausprobieren

- [Uran-235](?mode=bindung&A=235), [Eisen-56](?mode=bindung&A=56), [Helium-4](?mode=bindung&A=4): Vergleiche die Bindungsenergie pro Nukleon.
- [Kritisch](?mode=kette&stab=40&leck=30): Drücke mehrmals „Nächste Generation“.
- [Unterkritisch](?mode=kette&stab=70&leck=30) und [überkritisch](?mode=kette&stab=10&leck=30).

## Aufgaben

**1. Spaltungsenergie abschätzen.** Uran-235 hat etwa 7,6 MeV, die Bruchstücke (A ≈ 92 und 141) haben etwa 8,5 MeV Bindungsenergie pro Nukleon. Schätze die frei werdende Energie ab. [Aufgabe laden](?mode=bindung&A=235&_hide=1)

<details><summary>Lösung anzeigen</summary>

Etwa $235 \cdot (8{,}5 - 7{,}6)\,\text{MeV} \approx 210\,\text{MeV}$ pro Spaltung (gemessen: etwa 200 MeV).

</details>

**2. Warum keine Energie aus Eisen?** Kann man aus Eisen-56 durch Spaltung oder Fusion Energie gewinnen? [Aufgabe laden](?mode=bindung&A=56&_hide=1)

<details><summary>Lösung anzeigen</summary>

Nein. Eisen sitzt im Maximum der Kurve. Spaltung und Fusion würden zu weniger fest gebundenen Kernen führen – man müsste Energie hineinstecken.

</details>

**3. Kritischer Reaktor.** Jede Spaltung liefert im Mittel 2,5 Neutronen, 30 % entweichen. Wie viel Prozent müssen die Steuerstäbe absorbieren, damit $k = 1$ ist? [Aufgabe laden](?mode=kette&stab=40&leck=30&_hide=1)

<details><summary>Lösung anzeigen</summary>

$k = 2{,}5 \cdot 0{,}7 \cdot (1 - x) = 1 \Rightarrow 1 - x = \frac{1}{1{,}75} \approx 0{,}57$, also müssen etwa **43 %** absorbiert werden.

</details>

**4. Lawine.** Bei $k = 2$ startet die Reaktion mit einem Neutron. Wie viele Neutronen sind es nach 10 Generationen? Eine Generation dauert in einer Bombe etwa $10^{-8}\,\text{s}$.

<details><summary>Lösung anzeigen</summary>

$2^{10} = 1024$ Neutronen nach nur $10^{-7}\,\text{s}$; nach 80 Generationen wären es $2^{80} \approx 10^{24}$ – genug, um ein Kilogramm Uran zu spalten. Darum muss $k$ im Reaktor genau geregelt werden.

</details>

## Ideen für den Unterricht

- **Bewerten:** Chancen und Risiken der Kernenergie, Endlagerung, Fusionsforschung (ITER) im Vergleich zu erneuerbaren Energien.
- **Vernetzung:** Radioaktiver Zerfall der Spaltprodukte; Kernfusion in Sternen (HR-Diagramm).
- **Rechnen:** Massendefekt aus Tabellenwerten bestimmen und mit $E = mc^2$ umrechnen.
