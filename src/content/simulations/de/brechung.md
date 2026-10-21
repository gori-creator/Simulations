---
description: "Interaktive Simulation zu Brechung und Totalreflexion – Laser auf der optischen Scheibe drehen, Brechungsgesetz und Fresnel-Anteile, Snellius-Diagramme, Glasfaser, Umlenkprisma und Brillant, Brechzahl eines unbekannten Stoffs messen, Platte, Prisma mit Farbzerlegung und scheinbare Hebung."
---

## Worum geht es?

Trifft Licht schräg auf die Grenzfläche zweier durchsichtiger Stoffe, wird es teilweise **reflektiert** und teilweise **gebrochen**, also abgeknickt. Alle Winkel misst man zum **Lot**, der Senkrechten auf der Grenzfläche. Für die Reflexion gilt $\alpha' = \alpha$, für die Brechung das **Brechungsgesetz von Snellius**:

$$
n_1 \cdot \sin\alpha = n_2 \cdot \sin\beta
$$

Die **Brechzahl** $n$ sagt, wie stark das Licht im Stoff langsamer ist: $c = \frac{c_0}{n}$, in Wasser also $c = \frac{299\,792\,458\,\text{m/s}}{1{,}33} \approx 2{,}25 \cdot 10^8\,\tfrac{\text{m}}{\text{s}}$. Beim Übergang in den **optisch dichteren** Stoff (größeres $n$) wird das Licht **zum Lot hin** gebrochen, sonst **vom Lot weg**. Mit Wellenfronten (Huygens) sieht man den Grund: Im dichteren Stoff rücken die Fronten enger zusammen ($\lambda_2 = \lambda_1 \cdot \frac{n_1}{n_2}$) und knicken an der Grenzfläche ab.

Trägt man $\sin\beta$ über $\sin\alpha$ auf, ergibt sich eine **Ursprungsgerade** mit der Steigung $\frac{n_1}{n_2}$ – so lässt sich eine unbekannte Brechzahl messen.

**Totalreflexion:** Vom dichteren in den dünneren Stoff gibt es einen **Grenzwinkel** $\alpha_G$ mit $\sin\alpha_G = \frac{n_2}{n_1}$: Wasser → Luft $48{,}8^\circ$, Glas → Luft $41{,}1^\circ$, Diamant → Luft $24{,}4^\circ$. Ist $\alpha > \alpha_G$, wird alles Licht reflektiert. Das nutzen **Glasfasern**, **Umlenkprismen** und geschliffene **Diamanten**.

Wie viel Licht reflektiert wird, beschreiben die **Fresnel-Formeln**. Bei senkrechtem Einfall auf Glas sind es $\left(\frac{1{,}52 - 1}{1{,}52 + 1}\right)^2 \approx 4{,}3\,\%$. Kurz vor dem Grenzwinkel steigt der Anteil steil auf $100\,\%$.

## Ausprobieren

1. Ziehe den Laser über den Winkelmesser. Wann wird das Licht zum Lot hin gebrochen, wann vom Lot weg? Was passiert bei $\alpha = 0^\circ$? [Senkrechter Einfall](?alpha=0)
2. Schalte die Wellenfronten ein. Wo liegen sie enger beieinander? [Wellenfronten](?wave=1)
3. Lass das Licht aus dem Glas kommen und vergrößere $\alpha$ langsam. Beobachte den Punkt im Diagramm $\beta$ über $\alpha$ – wo endet die Kurve? [Snellius-Diagramm](?mode=graph&from=bottom&bottom=glas&alpha=30)
4. Biege den Lichtleiter aus Plexiglas immer enger (am blauen Griff ziehen). Ab wann geht Licht verloren? [Lichtleiter](?mode=total&mat=plexiglas&ain=40&rb=3)
5. Vergleiche den Brillanten aus Glas und aus Diamant. [Diamant](?mode=total&app=gem&mat=diamant&ain=0) · [Glas](?mode=total&app=gem&mat=glas&ain=0)
6. Schicke weißes Licht durch ein Glasprisma. Welche Farbe wird am stärksten abgelenkt? [Prisma](?mode=optics&ex=prism&alpha=50)

## Aufgaben

### Aufgabe 1: Brechungswinkel berechnen

Licht fällt aus Luft unter $\alpha = 40^\circ$ auf Wasser ($n = 1{,}33$). Berechne den Brechungswinkel. [Aufgabe laden](?alpha=40&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$\sin\beta = \frac{1{,}00 \cdot \sin 40^\circ}{1{,}33} \approx 0{,}483 \quad\Rightarrow\quad \beta \approx 28{,}9^\circ$$

</details>

### Aufgabe 2: Grenzwinkel

Berechne den Grenzwinkel der Totalreflexion für den Übergang Glas → Luft und prüfe ihn in der Simulation. [Aufgabe laden](?from=bottom&bottom=glas&alpha=35&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$\sin\alpha_G = \frac{1{,}00}{1{,}52} \quad\Rightarrow\quad \alpha_G \approx 41{,}1^\circ$$

Ab diesem Winkel verschwindet der gebrochene Strahl. [Totalreflexion zeigen](?from=bottom&bottom=glas&alpha=50)

</details>

### Aufgabe 3: Unbekannter Stoff

Eine Gruppe misst an Probe 3: $\alpha = 30^\circ \to \beta = 20{,}0^\circ$, $\alpha = 50^\circ \to \beta = 31{,}5^\circ$, $\alpha = 70^\circ \to \beta = 39{,}5^\circ$. Bestimme die Brechzahl aus der Steigung von $\sin\beta$ über $\sin\alpha$. [Selbst messen](?mode=measure&x=3&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Wertepaare $(\sin\alpha \mid \sin\beta)$: $(0{,}500 \mid 0{,}342)$, $(0{,}766 \mid 0{,}522)$, $(0{,}940 \mid 0{,}636)$. Die Ursprungsgerade hat die Steigung $k \approx 0{,}680$, also $n = \frac{1}{k} \approx 1{,}47$ – das passt zu Glycerin ($n = 1{,}47$).

</details>

### Aufgabe 4: Reflexion an einer Glasscheibe

Wie viel Prozent des Lichts werden bei senkrechtem Einfall an einer Glasoberfläche reflektiert? Bei welchem Winkel ist das reflektierte Licht vollständig polarisiert (Brewster-Winkel $\tan\alpha_B = \frac{n_2}{n_1}$)?

<details>
<summary>Lösung anzeigen</summary>

$R = \left(\frac{0{,}52}{2{,}52}\right)^2 \approx 0{,}0426 = 4{,}26\,\%$. $\alpha_B = \arctan 1{,}52 \approx 56{,}7^\circ$; dort ist der Anteil $R_p$ null. [Brewster-Winkel zeigen](?bottom=glas&alpha=57)

</details>

### Aufgabe 5: Glasfaser mit Mantel

Eine Faser hat einen Kern aus Glas ($n = 1{,}52$) und einen Mantel mit $n = 1{,}49$. Berechne den Grenzwinkel an der Wand und den größten Winkel $\theta_{max}$, unter dem Licht aus Luft eingekoppelt werden darf ($\sin\theta_{max} = \sqrt{n_K^2 - n_M^2}$).

<details>
<summary>Lösung anzeigen</summary>

$\alpha_G = \arcsin\frac{1{,}49}{1{,}52} \approx 78{,}6^\circ$ – das Licht muss sehr flach auf die Wand treffen. $\sin\theta_{max} = \sqrt{1{,}52^2 - 1{,}49^2} \approx 0{,}300$, also $\theta_{max} \approx 17{,}5^\circ$. Schon sanfte Biegungen lassen bei so kleinem Unterschied Licht austreten. [Faser mit Mantel](?mode=total&clad=plexiglas&ain=10&rb=15)

</details>

### Aufgabe 6: Der Fisch ist tiefer, als er aussieht

Ein Fisch schwimmt $1{,}00\,\text{m}$ tief. Wie tief scheint er, wenn man fast senkrecht von oben schaut?

<details>
<summary>Lösung anzeigen</summary>

Für kleine Winkel gilt $h' \approx h \cdot \frac{n_\text{Luft}}{n_\text{Wasser}} = \frac{1{,}00\,\text{m}}{1{,}33} \approx 0{,}75\,\text{m}$. Schaut man schräg (Licht unter $30^\circ$ im Wasser), scheint er sogar nur $0{,}65\,\text{m}$ tief. [Fisch im Wasser](?mode=optics&ex=depth&mat=wasser&alpha=30)

</details>

## Ideen für den Unterricht

- **Einsatz:** Optik in der Mittelstufe (Brechung, Totalreflexion), vertiefend mit Brechungsgesetz, Messreihe und Anwendungen; der genaue Ort im Lehrplan sollte bitte am LehrplanPLUS geprüft werden. Die Messreihe zur unbekannten Probe passt gut vor oder nach einem echten Versuch mit der optischen Scheibe.
- **Modell:** Die Helligkeit der Strahlen folgt den Fresnel-Formeln für unpolarisiertes Licht. Glasfaser, Prisma und Brillant werden als 2D-Schnitt mit Strahlverfolgung gerechnet. Die Farbzerlegung nutzt für Kronglas die Cauchy-Formel – eine Näherung; die Farben liegen auf dem Schirm so eng, dass ein vergrößerter Ausschnitt gezeigt wird.
- **Häufige Stolpersteine:**
  - Winkel werden zur Grenzfläche statt zum Lot gemessen.
  - „Bei Totalreflexion wird das Licht verschluckt.“ – Es wird vollständig reflektiert; auch sonst wird immer ein kleiner Teil reflektiert.
  - „Totalreflexion gibt es auch von Luft nach Wasser.“ – Nur beim Übergang ins optisch dünnere Medium.
  - „Licht ist im Glas schneller, weil es dichter ist.“ – Es ist langsamer: $c = c_0/n$.
