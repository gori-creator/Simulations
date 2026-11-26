## Worum geht es?

Licht ist eine **elektromagnetische Welle**: Ein elektrisches Feld schwingt quer zur Laufrichtung. Zwei Versuche zeigen, was daraus folgt.

### Polarisation

Bei einer Glühlampe oder der Sonne schwingt das Feld in alle Querrichtungen durcheinander – das Licht ist **unpolarisiert**. Ein **Polarisationsfilter** lässt nur die Schwingung in einer Richtung durch (seiner Durchlassrichtung). Dahinter ist das Licht **linear polarisiert** und nur noch halb so hell.

Ein zweites Filter (der **Analysator**) lässt davon nur den Anteil durch, der in seine Richtung zeigt. Ist er um den Winkel $\Delta\theta$ gedreht, gilt das **Gesetz von Malus**:

$$I = I_1 \cdot \cos^2 \Delta\theta$$

Bei $\Delta\theta = 90°$ (**gekreuzte Filter**) wird es dunkel. Erstaunlich: Stellt man ein drittes Filter schräg **dazwischen**, wird es wieder hell – obwohl man ein Filter mehr in den Weg stellt. Das mittlere Filter dreht die Schwingungsrichtung schrittweise.

Polarisation gibt es nur bei **Transversalwellen**. Dass Licht sich polarisieren lässt, zeigt also: Licht schwingt quer. Schall in Luft (eine Längswelle) lässt sich nicht polarisieren.

**Im Alltag:** Polarisierende Sonnenbrillen schlucken Licht, das von Wasser oder Straße gespiegelt wird – es ist teilweise polarisiert. LCD-Bildschirme steuern die Helligkeit jedes Bildpunkts mit zwei Polarisationsfiltern und einer Flüssigkristallschicht dazwischen.

### Brechung im Wellenmodell

Nach dem **Huygens-Prinzip** ist jeder Punkt einer Wellenfront Ausgangspunkt einer kleinen **Elementarwelle**. Die neue Wellenfront ist die gemeinsame Tangente (Einhüllende) aller Elementarwellen.

Trifft eine Welle schräg auf eine Grenzfläche, erreicht sie die Punkte der Grenzfläche nacheinander. Im zweiten Stoff laufen die Elementarwellen langsamer ($c_2 < c_1$), ihre Kreise bleiben kleiner – die Wellenfront knickt ab. Daraus folgt das **Brechungsgesetz**:

$$\frac{\sin \alpha}{\sin \beta} = \frac{c_1}{c_2} = n$$

Die Frequenz bleibt gleich, deshalb wird die Wellenlänge im langsameren Stoff kürzer: $\lambda_2 = \lambda_1 / n$.

### Totalreflexion

Läuft die Welle in einen **schnelleren** Stoff ($n < 1$, etwa von Glas in Luft), wird $\beta$ größer als $\alpha$. Ab dem **Grenzwinkel** mit $\sin \alpha_G = n$ gibt es keine gebrochene Welle mehr: Die Elementarwellen im zweiten Stoff wären so groß, dass keine gemeinsame Tangente existiert. Das Licht wird vollständig zurückgeworfen. So bleibt Licht in einer **Glasfaser** gefangen.

### Nur Querwellen lassen sich polarisieren

Bei einer **Querwelle** (Seilwelle, Licht, Radiowellen) schwingt etwas quer zur Laufrichtung. Ein Spalt oder Filter lässt nur den Teil der Schwingung durch, der in seiner Richtung liegt – die Welle ist danach **linear polarisiert**. Bei einer **Längswelle** wie Schall schwingt die Luft in Laufrichtung. Jeder Spalt lässt sie gleich durch, sie lässt sich nicht polarisieren. Dass Licht polarisiert werden kann, zeigt deshalb: Licht ist eine Querwelle.

### Polarisation durch Spiegelung

Licht, das an Wasser oder Glas gespiegelt wird, ist teilweise polarisiert: Es schwingt bevorzugt waagerecht (parallel zur Oberfläche). Beim **Brewster-Winkel** $\tan \theta_B = n$ wird nur noch waagerecht schwingendes Licht gespiegelt – für Wasser bei etwa 53°. **Polarisations-Sonnenbrillen** lassen nur senkrecht schwingendes Licht durch und schlucken so die Blendung auf Wasser und nassen Straßen. Fotografen nutzen dafür Polfilter.

### LCD-Bildschirme

Jeder Bildpunkt eines LCD liegt zwischen zwei gekreuzten Filtern. Dazwischen dreht ein **Flüssigkristall** die Schwingungsrichtung um 90° – das Licht passt durch das zweite Filter, der Punkt ist hell. Legt man Spannung an, richten sich die Moleküle aus und drehen nicht mehr: Der Punkt wird dunkel. So entstehen die Ziffern auf Taschenrechnern und Uhren.

## Ausprobieren

- [Zwei Filter](?mode=pol&th1=0&th2=60&mitte=0): Drehe den Analysator von 0° bis 180°. Wann ist es am hellsten, wann dunkel?
- [Gekreuzte Filter](?mode=pol&th1=0&th2=90&mitte=0): Kein Licht. Schalte jetzt das dritte Filter ein.
- [Drei Filter](?mode=pol&th1=0&th2=90&mitte=1&th3=45): Bei welchem Winkel des mittleren Filters kommt am meisten Licht durch?
- [Luft → Glas](?mode=huygens&alpha=40&n=1.5): Vergleiche die Abstände der Wellenfronten oben und unten.
- [Glas → Luft](?mode=huygens&alpha=50&n=0.65): Verkleinere den Einfallswinkel, bis wieder eine gebrochene Welle entsteht.
- [Seilwelle](?mode=welle&wt=quer&wpol=0&wf=30) und [Schall](?mode=welle&wt=laengs&wf=0): Drehe den Spalt. Bei welcher Welle ändert sich etwas?
- [Spiegelung auf dem See](?mode=spiegel&ra=53&stoff=wasser&brille=0): Setz die Sonnenbrille auf. Was bleibt von der Spiegelung?
- [LCD ohne Spannung](?mode=lcd&u=0&ziffer=4): Erhöhe die Spannung langsam. Wann wird die Ziffer sichtbar?
- [Üben](?mode=ueben&qn=1): Sechs Aufgabenarten mit Punktestand.

## Aufgaben

**1. Malus.** Der Analysator ist um 60° gegen den Polarisator gedreht. Welcher Anteil des ursprünglichen, unpolarisierten Lichts kommt am Schirm an? [Aufgabe laden](?mode=pol&th1=0&th2=60&mitte=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

Erstes Filter: $\tfrac12 I_0$. Zweites: $\cos^2 60° = \tfrac14$. Zusammen $I = \tfrac18 I_0 = 12{,}5\,\%$.

</details>

**2. Das dritte Filter.** Zwischen gekreuzte Filter (0° und 90°) wird ein drittes Filter mit 45° gestellt. Wie viel Licht kommt jetzt an? [Aufgabe laden](?mode=pol&th1=0&th2=90&mitte=1&th3=45&_hide=1)

<details><summary>Lösung anzeigen</summary>

$I = \tfrac12 I_0 \cdot \cos^2 45° \cdot \cos^2 45° = \tfrac12 \cdot \tfrac12 \cdot \tfrac12\, I_0 = 12{,}5\,\%$ – vorher war es 0.

</details>

**3. Brechungswinkel.** Licht fällt unter 40° aus Luft auf Glas ($n = 1{,}5$). Berechne den Brechungswinkel und die Wellenlänge im Glas, wenn sie in Luft 600 nm beträgt. [Aufgabe laden](?mode=huygens&alpha=40&n=1.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\sin \beta = \dfrac{\sin 40°}{1{,}5} \approx 0{,}43$, also $\beta \approx 25{,}4°$. $\lambda_2 = \dfrac{600\,\text{nm}}{1{,}5} = 400\,\text{nm}$.

</details>

**4. Grenzwinkel.** Licht läuft von Glas in Luft, $n = c_\text{Glas}/c_\text{Luft} \approx 0{,}65$. Ab welchem Einfallswinkel tritt Totalreflexion auf? [Aufgabe laden](?mode=huygens&alpha=50&n=0.65&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\sin \alpha_G = 0{,}65$, also $\alpha_G \approx 40{,}5°$.

</details>

**4. Sonnenbrille.** Unter welchem Einfallswinkel ist das am Wasser ($n = 1{,}33$) gespiegelte Licht vollständig polarisiert? [Aufgabe laden](?mode=spiegel&ra=30&stoff=wasser&brille=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\theta_B = \arctan 1{,}33 \approx 53^\circ$. Dort schluckt eine Polarisations-Sonnenbrille die Spiegelung vollständig.

</details>

## Ideen für den Unterricht

- **Handy und Sonnenbrille:** Durch eine Polarisations-Sonnenbrille auf einen Handybildschirm schauen und den Kopf drehen – der Bildschirm wird dunkel. Auch LCDs senden polarisiertes Licht aus.
- **Häufiger Fehler:** „Das Filter färbt das Licht dunkler.“ Es wählt eine Schwingungsrichtung aus; deshalb macht ein drittes Filter gekreuzte Filter wieder hell.
- **Querwelle mit Seil:** Ein Seil durch einen Lattenzaun schwingen lassen – die Seilwelle zeigt Polarisation ganz direkt.
