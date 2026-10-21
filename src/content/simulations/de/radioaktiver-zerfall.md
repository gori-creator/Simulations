---
description: "Interaktive Simulation zum radioaktiven Zerfall – viele Kerne zerfallen zufällig, Zählrohr mit Impulsen, N-t-Diagramm mit Halbwertszeit (linear und logarithmisch), Aktivität A = λ · N, fünf echte Nuklide, C-14-Altersbestimmung und ein einzelner Kern, dessen Zerfall sich nicht vorhersagen lässt."
---

## Worum geht es?

Radioaktive Atomkerne sind instabil: Irgendwann wandeln sie sich unter Aussendung von Strahlung in einen anderen Kern um. Der ursprüngliche Kern heißt **Mutterkern**, der neue **Tochterkern**. Beim **α-Zerfall** sendet der Kern einen Heliumkern ($^4_2\text{He}$, zwei Protonen und zwei Neutronen) aus, beim **β⁻-Zerfall** wandelt sich im Kern ein Neutron in ein Proton um, und ein Elektron (dazu ein Antineutrino) verlässt den Kern. Oft folgt **γ-Strahlung**. In der Zerfallsgleichung bleiben Massenzahl und Ladungszahl erhalten, zum Beispiel

$$
^{220}_{\ 86}\text{Rn} \rightarrow\ ^{216}_{\ 84}\text{Po} + ^4_2\text{He}, \qquad ^{131}_{\ 53}\text{I} \rightarrow\ ^{131}_{\ 54}\text{Xe} + ^{\ \ 0}_{-1}\text{e} + \bar\nu
$$

**Zufall:** Wann ein bestimmter Kern zerfällt, lässt sich grundsätzlich nicht vorhersagen. Man kennt nur die Wahrscheinlichkeit: In jedem kurzen Zeitabschnitt $\Delta t$ zerfällt jeder noch vorhandene Kern mit derselben Wahrscheinlichkeit $p = 1 - e^{-\lambda \cdot \Delta t}$ – unabhängig von den anderen Kernen und davon, wie lange er schon existiert. Genau so rechnet die Simulation (200 Schritte je Halbwertszeit). Man kann sich das wie ein Würfelspiel vorstellen: Jeder Kern würfelt in jedem Schritt, und nur bei einer bestimmten Augenzahl zerfällt er.

**Zerfallsgesetz:** Bei sehr vielen Kernen gleicht sich der Zufall aus. Nach jeder **Halbwertszeit** $T_{1/2}$ ist ungefähr die Hälfte der noch vorhandenen Mutterkerne zerfallen:

$$
N(t) = N_0 \cdot \left(\tfrac{1}{2}\right)^{t/T_{1/2}} = N_0 \cdot e^{-\lambda t}, \qquad \lambda = \frac{\ln 2}{T_{1/2}}
$$

Nach $T_{1/2}$ ist noch die Hälfte da, nach $2\,T_{1/2}$ ein Viertel, nach $3\,T_{1/2}$ ein Achtel ($12{,}5\,\%$). Ganz „null“ wird $N(t)$ nie; bei einem echten Präparat mit endlich vielen Kernen ist aber irgendwann wirklich der letzte Kern zerfallen. $\lambda$ heißt **Zerfallskonstante**. Trägt man $N$ auf einer **logarithmischen Achse** auf, wird die Kurve zu einer Geraden – daran erkennt man exponentielle Abnahme (vergleiche die Simulation „Exponentielles Wachstum und Zerfall“ in der Mathematik).

**Zufällige Schwankung:** Die Messpunkte liegen nie genau auf der Kurve. Die typische Abweichung wächst nur mit der Wurzel der Anzahl: Bei $N_0$ Kernen streut $N$ nach einer Halbwertszeit um etwa $\tfrac12\sqrt{N_0}$ (Standardabweichung). Bei 100 Kernen sind das etwa 5 Kerne ($10\,\%$ von 50), bei 2500 Kernen etwa 25 Kerne (nur $2\,\%$ von 1250). Je mehr Kerne, desto genauer gilt das Zerfallsgesetz.

**Aktivität:** Die Zahl der Zerfälle pro Zeit heißt Aktivität, $A = \lambda \cdot N$, Einheit $1\,\text{Bq} = 1\,\tfrac{1}{\text{s}}$. Sie nimmt mit derselben Halbwertszeit ab wie $N$. Ein **Zählrohr** registriert nur die Teilchen, die in sein Fenster gelangen. Seine **Zählrate** ist deshalb kleiner als die Aktivität, aber proportional zu ihr. α-Teilchen haben in Luft nur wenige Zentimeter Reichweite – auch das zeigt die Simulation.

**Altersbestimmung (C-14-Methode):** Lebewesen nehmen Kohlenstoff mit einem bekannten Anteil C-14 auf. Nach ihrem Tod zerfällt das C-14 mit $T_{1/2} = 5730\,\text{a}$. Aus dem Restanteil folgt das Alter: $t = T_{1/2} \cdot \log_2 \frac{N_0}{N}$.

**Zur Darstellung:** Die Kerne sind stark vergrößert und vereinfacht gezeichnet, die Zeit läuft im Zeitraffer (Regler „eine Halbwertszeit dauert …“). Ein echtes Präparat enthält unvorstellbar viele Kerne – 1 g Uran-238 etwa $2{,}5 \cdot 10^{21}$. Die Tochterkerne von Rn-220 (Po-216) und U-238 (Th-234) sind selbst radioaktiv; betrachtet wird hier nur der erste Zerfall. Beim Cs-137 stammt die γ-Strahlung genau genommen vom angeregten Tochterkern Ba-137m.

## Ausprobieren

1. Starte mit 500 Kernen und beobachte die Messpunkte. Wie viele Kerne sind nach einer Halbwertszeit noch übrig? Starte mit „Neues Präparat“ mehrmals neu. [Radon-220](?N0=500)
2. Nimm nur 100 Kerne und vergleiche mit 2500 Kernen. Wann weichen die Messpunkte stärker von der Theoriekurve ab? [100 Kerne](?N0=100) · [2500 Kerne](?N0=2500)
3. Schalte die N-Achse auf logarithmisch. Was wird aus der Kurve? Was passiert ganz am Ende, wenn nur noch wenige Kerne übrig sind? [Logarithmisch](?N0=2500&log=1)
4. Tippe einen Kern an und warte, bis er zerfällt (mit der Tastatur: mit der Tab-Taste zur Schale, dann Enter drücken, bis ein Kern markiert ist). Probiere es mit mehreren Kernen. Zerfallen alle nach genau einer Halbwertszeit?
5. Vergleiche das Diagramm der Aktivität mit dem von $N$. Wie verhalten sich Zählrate und Aktivität? Schalte den Ton ein.
6. Wechsle zu „Ein einzelner Kern“ und werte 100 Kerne aus. Wie sieht das Histogramm aus, und wie die Kurve „noch nicht zerfallen“? [Einzelner Kern](?mode=one)
7. Wähle verschiedene Nuklide. Was ändert sich am Diagramm, wenn man die Zeit in Halbwertszeiten misst – und was nicht? [Uran-238](?nuc=u238)

## Aufgaben

### Aufgabe 1: Nach drei Halbwertszeiten

Ein Präparat enthält $1000$ Kerne Iod-131 ($T_{1/2} = 8{,}02\,\text{d}$). Wie viele Kerne sind nach $24\,\text{d}$ etwa noch vorhanden? [Aufgabe laden](?nuc=i131&N0=1000&theo=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$24\,\text{d} \approx 3 \cdot 8{,}02\,\text{d}$, also drei Halbwertszeiten: $N \approx 1000 \cdot \left(\tfrac12\right)^3 = 125$. Im Versuch liegt der Wert wegen des Zufalls meist einige Kerne darüber oder darunter. [In der Simulation zeigen](?nuc=i131&N0=1000)

</details>

### Aufgabe 2: Zerfallskonstante

Berechne die Zerfallskonstante von C-14 ($T_{1/2} = 5730\,\text{a}$) und die Aktivität von $1000$ C-14-Kernen. [Aufgabe laden](?nuc=c14&N0=1000&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\lambda = \frac{\ln 2}{5730\,\text{a}} \approx 1{,}21 \cdot 10^{-4}\,\tfrac{1}{\text{a}}$. $A = \lambda \cdot N \approx 0{,}121$ Zerfälle pro Jahr – im Mittel zerfällt also etwa alle 8 Jahre einer der 1000 Kerne. In Becquerel: $A \approx 3{,}8 \cdot 10^{-9}\,\text{Bq}$.

</details>

### Aufgabe 3: Altersbestimmung

In einem Holzstück aus einer Ausgrabung ist nur noch $25\,\%$ des ursprünglichen C-14 vorhanden. Wie alt ist das Holz? [Aufgabe laden](?nuc=c14&N0=1000&theo=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$25\,\% = \left(\tfrac12\right)^2$, also sind zwei Halbwertszeiten vergangen: $t = 2 \cdot 5730\,\text{a} = 11\,460\,\text{a}$. Allgemein $t = T_{1/2} \cdot \log_2 \frac{N_0}{N} = 5730\,\text{a} \cdot \log_2 4$. Die Simulation zeigt unter „Zeit aus dem Restanteil“, wie gut diese Schätzung bei einem Präparat aus nur 1000 Kernen ist.

</details>

### Aufgabe 4: Halbwertszeit ablesen

Lies im Diagramm ab, nach welcher Zeit nur noch ein Viertel der 2500 Rn-220-Kerne vorhanden ist (also etwa 625 Kerne). Bestimme daraus die Halbwertszeit und vergleiche mit dem Wert in der Nuklid-Auswahl. [Aufgabe laden](?N0=2500&theo=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ein Viertel ist nach etwa $111\,\text{s}$ erreicht (wegen des Zufalls je nach Präparat einige Sekunden früher oder später). Das sind zwei Halbwertszeiten, also $T_{1/2} \approx 111\,\text{s} : 2 \approx 56\,\text{s}$ (Tabellenwert $55{,}6\,\text{s}$; $2 \cdot 55{,}6\,\text{s} = 111{,}2\,\text{s}$). Mit der logarithmischen Achse lässt sich die Gerade besonders gut ablesen. [Mit Theoriekurve](?N0=2500&log=1)

</details>

### Aufgabe 5: Ein einzelner Kern

Ein Kern existiert schon seit drei Halbwertszeiten. Mit welcher Wahrscheinlichkeit zerfällt er in der nächsten Halbwertszeit? Begründe. [Aufgabe laden](?mode=one&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Mit $50\,\%$ – genau wie ein „frischer“ Kern. Kerne altern nicht; die Zerfallswahrscheinlichkeit hängt nicht davon ab, wie lange der Kern schon existiert. Deshalb ist die mittlere Lebensdauer $\tau = \frac{T_{1/2}}{\ln 2} \approx 1{,}44\,T_{1/2}$ sogar größer als die Halbwertszeit: Einige Kerne leben sehr lange. [Viele Kerne auswerten](?mode=one)

</details>

### Aufgabe 6: Wie stark streut der Zufall? (vertiefend)

Mehrere Gruppen starten ein Präparat mit $100$ Kernen und notieren $N$ nach einer Halbwertszeit. Danach wiederholen sie das mit $2500$ Kernen. Um wie viele Kerne weichen die Ergebnisse typischerweise vom Erwartungswert ab, absolut und in Prozent? [100 Kerne](?N0=100&theo=0&_hide=1) · [2500 Kerne](?N0=2500&theo=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Erwartet werden $50$ bzw. $1250$ Kerne. Die typische Abweichung (Standardabweichung) ist $\tfrac12\sqrt{N_0}$: bei $100$ Kernen $\tfrac12 \cdot 10 = 5$ Kerne, also $10\,\%$ von $50$; bei $2500$ Kernen $\tfrac12 \cdot 50 = 25$ Kerne, also nur $2\,\%$ von $1250$. Etwa zwei Drittel der Gruppen liegen innerhalb dieser Abweichung. Die absolute Schwankung wird mit mehr Kernen größer, die relative kleiner – deshalb gilt das Zerfallsgesetz für echte Präparate mit unvorstellbar vielen Kernen sehr genau.

</details>

## Ideen für den Unterricht

- **Einsatz:** Radioaktivität in der Mittelstufe (Zerfallsarten, Halbwertszeit, Zählrohr) und vertiefend in der Oberstufe (Zerfallsgesetz mit $\lambda$, Aktivität, Logarithmieren, Zufall als Basiskonzept). Die genaue Zuordnung bitte am LehrplanPLUS bzw. am Hessischen Kerncurriculum prüfen.
- **Würfelmodell als Einstieg:** Jede Schülerin und jeder Schüler würfelt mit vielen Würfeln, alle Sechsen „zerfallen“ und werden aussortiert. Danach die Simulation als „sehr viele Würfel in sehr kleinen Schritten“ vorstellen.
- **Vorhersagen lassen:** „Sind nach zwei Halbwertszeiten alle Kerne zerfallen?“ – viele erwarten das zunächst. Die Messpunkte zeigen das Viertel.
- **Zufall und Gesetz:** Mehrere Gruppen starten jeweils „Neues Präparat“ mit 100 Kernen und notieren $N$ nach einer Halbwertszeit; die Ergebnisse streuen (meist zwischen 45 und 55), ihr Mittelwert liegt nahe 50. Der Knopf „Zeit zurücksetzen“ wiederholt genau denselben Zufallsverlauf.
- **Häufige Stolpersteine:**
  - „Nach zwei Halbwertszeiten ist alles weg.“ – Es bleibt jeweils die Hälfte des Rests.
  - „Ein alter Kern zerfällt bald.“ – Die Wahrscheinlichkeit hängt nicht vom Alter ab.
  - Zählrate und Aktivität werden gleichgesetzt – das Zählrohr erfasst nur einen Teil.
  - Die Halbwertszeit wird für die Lebensdauer jedes einzelnen Kerns gehalten.
- **Aufgabenmodus:** Mit den Links „Aufgabe laden“ sind Halbwertszeit, Zerfallskonstante, Aktivität und die Auswertung im Bild und in den Ergebnissen verdeckt; mit „Aufdecken“ erscheinen sie wieder. Die Nuklid-Auswahl nennt die Halbwertszeit weiterhin – sie dient bei Aufgabe 4 zum Vergleich.
- **Bezug zum Lehrplan:** Aufbau der Kerne, α-, β- und γ-Strahlung, Zerfallsgleichungen, Halbwertszeit, Aktivität, Anwendungen (Medizin mit I-131, Altersbestimmung mit C-14, Cs-137 nach Reaktorunfällen).
