## Worum geht es?

Laserlicht ist besonders: sehr hell, eng gebündelt, einfarbig und **kohärent** – alle Wellen schwingen im Gleichtakt. Wie entsteht so ein Licht? Das Wort LASER verrät es: *Light Amplification by Stimulated Emission of Radiation*, Lichtverstärkung durch stimulierte Emission.

### Drei Arten, wie Licht und Atome zusammenwirken

- **Absorption:** Ein Atom im unteren Niveau schluckt ein Photon passender Energie und wird angeregt.
- **Spontane Emission:** Ein angeregtes Atom fällt nach einiger Zeit von selbst zurück und sendet ein Photon in eine zufällige Richtung aus. So leuchtet eine Glühlampe.
- **Stimulierte Emission:** Ein Photon trifft ein **angeregtes** Atom und bringt es dazu, ein zweites Photon auszusenden – mit gleicher Energie, Richtung und Phase. Aus einem Photon werden zwei, aus zwei vier …

### Besetzungsinversion

Normalerweise sind fast alle Atome im unteren Niveau. Ein Photon wird dann viel öfter absorbiert als vervielfacht. Verstärkung gibt es nur, wenn **mehr Atome oben als unten** sind: **Besetzungsinversion** $N_2 > N_1$.

Dafür wird **gepumpt** (mit Blitzlampe, Licht oder Strom). Die Atome werden in ein hohes Niveau gehoben, fallen schnell in ein **metastabiles** Niveau, in dem sie lange bleiben, und sammeln sich dort an.

- **Dreiniveau-Laser** (z. B. Rubin): Das untere Laserniveau ist der Grundzustand. Man muss mehr als die Hälfte aller Atome anregen – das braucht starkes Pumpen.
- **Vierniveau-Laser** (z. B. Nd:YAG): Das untere Laserniveau liegt etwas über dem Grundzustand und leert sich sofort. Schon wenige angeregte Atome reichen für Inversion.

### Der Resonator

Zwei Spiegel werfen das Licht immer wieder durch das Lasermedium, sodass es lawinenartig verstärkt wird. Ein Spiegel lässt einen kleinen Teil durch – das ist der Laserstrahl. Der Laser springt erst an, wenn die Verstärkung die Verluste ausgleicht: Das ist die **Laserschwelle**. Darüber bleibt die Inversion ungefähr bei ihrem Schwellenwert, die zusätzliche Pumpenergie geht ins Laserlicht.

Beim Einschalten zeigt der Laser oft kurze **Lichtblitze**: Die Inversion baut sich auf, das Licht schießt hoch und baut sie wieder ab – bis sich ein Gleichgewicht einstellt.

### Was die Simulation vereinfacht

Gerechnet wird mit einem einfachen Ratenmodell in relativen Einheiten; die Zeit wird in Lebensdauern $\tau$ des metastabilen Niveaus gemessen.

## Ausprobieren

- [Unter der Schwelle](?stufen=3&W=0.8&R=99): Gibt es Besetzungsinversion? Erhöhe die Pumpstärke langsam.
- [Rubinlaser](?stufen=3&W=2&R=99): Drücke „Zeit zurücksetzen“ und Start: Beobachte die Lichtblitze am Anfang.
- [Vierniveau-Laser](?stufen=4&W=0.2&R=99): Schon schwaches Pumpen reicht. Warum?
- [Schlechter Spiegel](?stufen=3&W=2&R=90): Was ändert sich an der Schwelle?

## Aufgaben

**1. Inversion beim Rubin.** Wie viel Prozent der Atome müssen beim Dreiniveau-Laser mindestens angeregt sein? [Aufgabe laden](?stufen=3&W=1.2&R=99&_hide=1)

<details><summary>Lösung anzeigen</summary>

Mehr als 50 %: Nur dann ist $N_2 > N_1 = 1 - N_2$. Wegen der Verluste im Resonator sogar etwas mehr.

</details>

**2. Schwellen vergleichen.** Lies die Pumpschwelle für den Drei- und den Vierniveau-Laser ab (Spiegel 99 %). Um welchen Faktor unterscheiden sie sich? [Aufgabe laden](?stufen=4&W=0.2&R=99)

<details><summary>Lösung anzeigen</summary>

Dreiniveau: etwa 1,02. Vierniveau: etwa 0,01. Der Vierniveau-Laser braucht rund hundertmal weniger Pumpleistung.

</details>

**3. Spiegel.** Warum steigt die Pumpschwelle, wenn der Auskoppelspiegel weniger reflektiert? [Aufgabe laden](?stufen=3&W=2&R=90&_hide=1)

<details><summary>Lösung anzeigen</summary>

Mehr Licht verlässt den Resonator bei jedem Umlauf. Damit die Verstärkung diese Verluste ausgleicht, braucht man eine größere Inversion – also stärkeres Pumpen.

</details>
