## Worum geht es?

Im **Mach-Zehnder-Interferometer** teilt ein halbdurchlässiger Spiegel (**Strahlteiler**) das Licht in zwei Wege. Zwei Spiegel lenken beide Teile zu einem zweiten Strahlteiler, wo sie wieder zusammentreffen. Dahinter stehen zwei Detektoren.

### Mit Laserlicht

Mit viel Licht ist alles wie gewohnt: Die beiden Teilwellen **interferieren**. Sind beide Wege gleich lang, landet alles Licht an Detektor 1. Verzögert ein Phasenschieber einen Weg um eine halbe Wellenlänge (180°), landet alles an Detektor 2. Dazwischen teilt sich das Licht auf:

$$
P_1 = \cos^2\left(\frac{\Delta\varphi}{2}\right) \qquad P_2 = \sin^2\left(\frac{\Delta\varphi}{2}\right)
$$

### Mit einzelnen Photonen

Schickt man die Photonen **einzeln** hinein, wird jedes Photon **nur an einem** Detektor registriert – es teilt sich nicht. Welcher Detektor klickt, ist **zufällig**. Erst nach vielen Photonen ergibt sich dieselbe Verteilung wie beim Laserlicht. Bei gleich langen Wegen klickt sogar **nur** Detektor 1.

Das ist erstaunlich: Interferenz setzt zwei Wege voraus. Ein Photon „weiß“ also gewissermaßen von beiden Wegen. Die Quantenphysik beschreibt das so: Solange der Weg **grundsätzlich nicht feststellbar** ist, überlagern sich beide Möglichkeiten (**Superposition**) und interferieren.

### Welcher-Weg-Information

Markiert man die Wege – etwa mit zwei unterschiedlich gedrehten Polarisationsfiltern –, könnte man im Prinzip herausfinden, welchen Weg ein Photon genommen hat. Dann **verschwindet die Interferenz**: Beide Detektoren bekommen je die Hälfte, egal wie der Phasenschieber steht. Das ist das Prinzip der **Komplementarität**: Weginformation und Interferenz schließen sich aus.

Nimmt man den zweiten Strahlteiler heraus, gehört jeder Detektor zu genau einem Weg – auch dann gibt es keine Interferenz. Man kann den Strahlteiler sogar erst einsetzen oder herausnehmen, wenn das Photon schon unterwegs ist (**Delayed Choice**): Das Ergebnis hängt von der Anordnung zum Zeitpunkt der Messung ab.

## Ausprobieren

- [Gleiche Wege](?phase=0&bs2=1&mark=0): Welcher Detektor klickt?
- [Halbe Wellenlänge](?phase=180&bs2=1&mark=0)
- [Weg markiert](?phase=0&bs2=1&mark=1): Was passiert mit der Interferenz?
- [Ohne zweiten Strahlteiler](?phase=0&bs2=0&mark=0)
- Stelle 90° ein: Kann man vorhersagen, wo das nächste Photon landet?

## Aufgaben

**1. Vorhersage.** Der Phasenschieber steht auf 90°. Mit welcher Wahrscheinlichkeit klickt Detektor 1? Kann man für ein einzelnes Photon vorhersagen, wo es landet? [Aufgabe laden](?phase=90&bs2=1&mark=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$P_1 = \cos^2(45°) = 50\,\%$. Für ein einzelnes Photon lässt sich das Ergebnis nicht vorhersagen – nur die Wahrscheinlichkeit.

</details>

**2. Teilt sich das Photon?** Bei einzelnen Photonen klickt immer nur ein Detektor. Warum spricht trotzdem alles dafür, dass „beide Wege“ eine Rolle spielen? [Aufgabe laden](?phase=0&bs2=1&mark=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

Bei gleichen Wegen landen **alle** Photonen an Detektor 1. Ginge jedes Photon nur einen Weg, müssten am zweiten Strahlteiler wieder 50 : 50 herauskommen. Die Verteilung lässt sich nur mit Interferenz beider Möglichkeiten erklären.

</details>

**3. Polarisationsfilter.** In beiden Wegen stehen Polarisationsfilter, die das Licht senkrecht zueinander polarisieren. Was zeigen die Detektoren, egal wie der Phasenschieber steht? Warum? [Aufgabe laden](?phase=0&bs2=1&mark=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

Je 50 %. An der Polarisation könnte man ablesen, welchen Weg das Photon genommen hat. Sobald diese Information grundsätzlich vorhanden ist, verschwindet die Interferenz.

</details>

**4. Laser gegen Einzelphotonen.** Worin unterscheiden sich die Ergebnisse mit Laserlicht und mit einzelnen Photonen – und worin nicht?

<details><summary>Lösung anzeigen</summary>

Die **Verteilung** auf die Detektoren ist gleich. Beim Laser kommt sie sofort und stetig heraus, bei einzelnen Photonen entsteht sie erst nach vielen zufälligen Einzelereignissen.

</details>

## Ideen für den Unterricht

- **Weltbild:** Was bedeuten „Realität“, „Lokalität“ und „Determinismus“ in der Quantenphysik? Was kann man über den Weg eines Photons sinnvoll sagen?
- **Vergleich:** Doppelspalt mit einzelnen Elektronen – dieselbe Logik von Wahrscheinlichkeit und Weginformation.
- **Technik:** Interferometer messen winzige Längenänderungen – bis hin zu Gravitationswellen.
