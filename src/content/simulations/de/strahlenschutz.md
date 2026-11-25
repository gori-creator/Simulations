## Worum geht es?

Radioaktive Stoffe senden **ionisierende Strahlung** aus: Sie hat genug Energie, um Elektronen aus Atomen zu schlagen – und kann so Zellen und Erbgut schädigen. Man unterscheidet drei Arten:

| Strahlung | Was ist das? | Reichweite in Luft | Abschirmung |
| --- | --- | --- | --- |
| Alpha (α) | Heliumkerne (2 p + 2 n) | wenige Zentimeter | ein Blatt Papier, die Haut |
| Beta (β) | schnelle Elektronen | einige Meter | wenige Millimeter Aluminium oder Plexiglas |
| Gamma (γ) | energiereiche Photonen | sehr weit | Blei, Beton – nie vollständig |

### Nachweis

Ein **Zählrohr** (Geiger-Müller-Zählrohr) knackt bei jedem Teilchen, das ein Gas darin ionisiert. Auch ohne Quelle zählt es ein wenig – die **Nullrate** aus der Umgebung (Gestein, Weltall).

### Schwächung von Gammastrahlung

Gammastrahlung nimmt in einem Absorber **exponentiell** ab. Die **Halbwertsdicke** $d_{1/2}$ ist die Dicke, nach der nur noch die Hälfte durchkommt – bei Blei etwa 6,5 mm (für 662 keV):

$$
N(d) = N_0 \cdot \left(\frac{1}{2}\right)^{d / d_{1/2}}
$$

### Abstandsgesetz

Eine punktförmige Quelle strahlt in alle Richtungen. In doppeltem Abstand verteilt sich die Strahlung auf die vierfache Fläche – die Zählrate sinkt auf ein **Viertel**:

$$
N \sim \frac{1}{r^2}
$$

### Strahlenschutz: die „A-Regeln“

**A**bstand halten, **A**bschirmen, **A**ufenthaltsdauer kurz halten, **A**ufnahme in den Körper vermeiden. Die biologische Wirkung beschreibt die **Äquivalentdosis** in Sievert (Sv). Alphastrahlung ist außen harmlos, im Körper (eingeatmet, verschluckt) aber etwa 20-mal so schädlich wie Gammastrahlung gleicher Energie.

## Ausprobieren

- [Alpha und Papier](?ray=alpha&abs=paper&d=0.1): Kommt noch etwas an?
- [Beta und Aluminium](?ray=beta&abs=aluminium&d=2): Ab welcher Dicke ist Schluss?
- [Gamma und Blei](?ray=gamma&abs=lead&d=6.5): Halbiere und verdopple die Bleidicke.
- [Abstand verdoppeln](?ray=gamma&abs=none&r=20): Vergleiche mit 10 cm.

## Aufgaben

**1. Welche Strahlung?** Ein Präparat wird mit Papier abgedeckt: Die Zählrate ändert sich kaum. Mit 5 mm Aluminium sinkt sie fast auf die Nullrate. Welche Strahlung sendet es aus? [Aufgabe laden](?ray=beta&abs=aluminium&d=5&_hide=1)

<details><summary>Lösung anzeigen</summary>

**Betastrahlung**: Papier hält sie nicht auf (also nicht Alpha), Aluminium schon (also nicht Gamma).

</details>

**2. Blei.** Hinter 13 mm Blei misst man 25 Impulse pro Sekunde, ohne Blei 100. Wie groß ist die Halbwertsdicke? Wie dick muss das Blei sein, damit nur noch 1 % durchkommt? [Aufgabe laden](?ray=gamma&abs=lead&d=13&_hide=1)

<details><summary>Lösung anzeigen</summary>

Ein Viertel heißt zwei Halbwertsdicken: $d_{1/2} = 6{,}5\,\text{mm}$. Für 1 % braucht man $\left(\frac{1}{2}\right)^n = 0{,}01$, also $n \approx 6{,}6$ Halbwertsdicken, etwa 43 mm Blei.

</details>

**3. Abstand.** In 10 cm Abstand zählt man 200 Impulse pro Sekunde. Wie viele sind es in 50 cm? [Aufgabe laden](?ray=gamma&abs=none&r=50&_hide=1)

<details><summary>Lösung anzeigen</summary>

Fünffacher Abstand: $\frac{1}{25}$ der Zählrate, also etwa **8 Impulse pro Sekunde** (plus Nullrate). Abstand ist der einfachste Schutz.

</details>

**4. Radon.** Das radioaktive Edelgas Radon sendet Alphastrahlung aus. Warum ist es trotzdem gefährlich, obwohl schon die Haut Alphastrahlung abhält?

<details><summary>Lösung anzeigen</summary>

Radon wird eingeatmet. Dann zerfällt es direkt in der Lunge, wo keine schützende Hautschicht ist. Alphastrahlung gibt ihre Energie auf kurzer Strecke ab und schädigt dort Zellen besonders stark. Regelmäßiges Lüften senkt die Belastung.

</details>

## Ideen für den Unterricht

- **Versuch:** Mit Schulpräparaten und Zählrohr Absorptionskurven aufnehmen (Strahlenschutzregeln beachten!).
- **Alltag:** Natürliche Strahlenbelastung in Deutschland (etwa 2–3 mSv pro Jahr), Röntgenaufnahme, Flug, Radon im Keller.
- **Medizin:** Strahlentherapie, Tracer, Sterilisation – Nutzen und Risiko abwägen.
