## Worum geht es?

Das **Pohlsche Rad** ist ein Drehpendel: Ein Kupferrad hängt an einer Spiralfeder und schwingt, einmal angestoßen, mit seiner **Eigenfrequenz** $f_0$ (hier $f_0 = 0{,}5\,\text{Hz}$, also $T_0 = 2\,\text{s}$). Eine **Wirbelstrombremse** dämpft die Bewegung: Je größer der Strom durch die Spule, desto größer die **Abklingkonstante** $\delta$.

Bei der **erzwungenen Schwingung** dreht ein Motor einen Exzenter. Er bewegt das äußere Ende der Spiralfeder (den **Erreger**) periodisch hin und her:

$$
\varphi_E(t) = \hat\varphi_E \cdot \sin(\omega_E t), \qquad \omega_E = 2\pi f_E .
$$

**Einschwingen:** Startet das Rad aus der Ruhe, überlagern sich zunächst die Eigenschwingung und die erzwungene Schwingung, die Amplitude schwankt („Schwebung“). Die Eigenschwingung klingt mit $e^{-\delta t}$ ab. Danach schwingt das Rad **mit der Erregerfrequenz** $f_E$, nicht mit seiner Eigenfrequenz:

$$
\varphi(t) = \hat\varphi \cdot \sin(\omega_E t - \Delta\varphi) .
$$

**Amplitude:** Wie stark das Rad im eingeschwungenen Zustand ausschlägt, hängt von $f_E$ ab:

$$
\hat\varphi = \hat\varphi_E \cdot \frac{\omega_0^2}{\sqrt{(\omega_0^2 - \omega_E^2)^2 + (2\delta\,\omega_E)^2}} .
$$

Trägt man $\hat\varphi$ gegen $f_E$ auf, erhält man die **Resonanzkurve**. Ihr Maximum liegt bei $f_E \approx f_0$ (genau bei $\omega_R = \sqrt{\omega_0^2 - 2\delta^2}$, also etwas darunter; die Simulation zeigt $f_R = \omega_R/(2\pi)$ unter „Eigenfrequenz“). Bei schwacher Dämpfung ist die Kurve hoch und schmal, bei starker Dämpfung flach und breit.

**Phasenverschiebung:** Das Rad läuft dem Erreger um $\Delta\varphi$ hinterher:

- $f_E \ll f_0$: Rad und Erreger schwingen **im Gleichtakt** ($\Delta\varphi \approx 0°$), $\hat\varphi \approx \hat\varphi_E$.
- $f_E = f_0$: $\Delta\varphi = 90°$, die Amplitude ist (fast) maximal.
- $f_E \gg f_0$: Rad und Erreger schwingen **gegenphasig** ($\Delta\varphi \approx 180°$), die Amplitude wird sehr klein.

**Zeigerdiagramm:** Beide Zeiger drehen sich mit $\omega_E$. Der Winkel zwischen ihnen ist $\Delta\varphi$, ihre Längen stehen im Verhältnis der Amplituden.

**Resonanzkatastrophe:** Ist die Dämpfung sehr klein, wird die Amplitude bei Resonanz riesig ($\hat\varphi \approx \hat\varphi_E \cdot \omega_0 / (2\delta)$). Überschreitet sie die **Belastungsgrenze** (hier $120°$), wird das Gerät beschädigt. Bei Brücken, Maschinen oder Gebäuden muss man deshalb Resonanz vermeiden oder stark dämpfen.

**Beispiele:**

- **Weinglas:** Reibt man mit dem nassen Finger über den Rand, klingt das Glas mit seiner Eigenfrequenz. Trifft ein sehr lauter Ton genau diese Frequenz, kann das Glas zerspringen.
- **Brücken:** Soldatengruppen marschieren nicht im Gleichschritt über Brücken, damit die Brücke nicht im Takt der Schritte angeregt wird. Die Millennium Bridge in London schwankte bei ihrer Eröffnung im Jahr 2000 seitlich, weil die Fußgänger unbewusst im Takt der Schwankung liefen. Danach wurden Dämpfer eingebaut.
- **Technik:** Waschmaschinen im Schleudergang, Autos und Lautsprecher werden so gebaut, dass ihre Resonanzen gedämpft sind.

## Ausprobieren

1. Starte bei der voreingestellten Erregerfrequenz $f_E = 0{,}3\,\text{Hz}$ „aus der Ruhe“ und beobachte das obere Diagramm: Wie entwickelt sich der Ausschlag, bis „eingeschwungen“ erscheint? Mit welcher Frequenz schwingt das Rad danach?
2. Stelle [Resonanz ein](?fE=0.5) und starte erneut. Vergleiche den Ausschlag von Rad und Erreger und lies im Zeigerdiagramm die Phasenverschiebung ab.
3. [Schnelle Erregung](?fE=1): Wohin zeigt der Rad-Zeiger im Vergleich zum Erreger? Achte auch auf das Rad selbst: Bewegt es sich mit dem Erregerhebel oder gegen ihn?
4. Nimm mit „Resonanzkurve aufnehmen“ eine Messreihe auf. Wiederhole sie mit [starker Dämpfung](?damp=1) und mit [schwacher Dämpfung](?damp=0.08&speed=fast). Wie ändern sich Höhe, Breite und Lage des Maximums?
5. Schalte die [theoretischen Kurven aus](?theory=0) und sage voraus, wo die Messpunkte liegen werden.
6. Wage die [Resonanzkatastrophe](?fE=0.5&damp=0.03&amp=10). Mit welcher Einstellung kann man das Rad bei $f_E = f_0$ retten?

## Aufgaben

**Aufgabe 1:** Ein Schüler sagt: „Nach dem Einschwingen schwingt das Rad mit seiner Eigenfrequenz.“ Nimm Stellung.

<details>
<summary>Lösung anzeigen</summary>

Falsch. Im eingeschwungenen Zustand schwingt das Rad mit der **Erregerfrequenz** $f_E$. Die Eigenschwingung ist während des Einschwingens noch beteiligt, klingt aber mit $e^{-\delta t}$ ab. Die Eigenfrequenz bestimmt nur, **wie stark** und mit welcher Phasenverschiebung das Rad mitschwingt.

</details>

**Aufgabe 2:** Ordne zu: $f_E = 0{,}1\,\text{Hz}$, $f_E = 0{,}5\,\text{Hz}$, $f_E = 1{,}5\,\text{Hz}$ (bei $f_0 = 0{,}5\,\text{Hz}$) und $\Delta\varphi \approx 0°$, $\Delta\varphi \approx 90°$, $\Delta\varphi \approx 180°$. Bei welcher Frequenz ist die Amplitude am kleinsten?

<details>
<summary>Lösung anzeigen</summary>

$0{,}1\,\text{Hz} \to \Delta\varphi \approx 0°$ (Gleichtakt), $0{,}5\,\text{Hz} \to \Delta\varphi = 90°$ (Resonanz), $1{,}5\,\text{Hz} \to \Delta\varphi \approx 180°$ (Gegentakt). Am kleinsten ist die Amplitude bei $1{,}5\,\text{Hz}$: Weit oberhalb der Eigenfrequenz kann das träge Rad der schnellen Erregung kaum folgen (Simulation: etwa $0{,}6°$ bei $\hat\varphi_E = 5°$). Bei $0{,}1\,\text{Hz}$ ist sie etwa so groß wie die Erregeramplitude.

[Prüfen](?fE=1.5)

</details>

**Aufgabe 3:** Berechne für $\hat\varphi_E = 5°$, $\delta = 0{,}25\,\tfrac{1}{\text{s}}$ und $f_0 = 0{,}5\,\text{Hz}$ die Amplitude bei $f_E = f_0$.

<details>
<summary>Lösung anzeigen</summary>

Bei $\omega_E = \omega_0$ wird $\omega_0^2 - \omega_E^2 = 0$, also

$$
\hat\varphi = \hat\varphi_E \cdot \frac{\omega_0^2}{2\delta\,\omega_0} = \hat\varphi_E \cdot \frac{\omega_0}{2\delta} = 5° \cdot \frac{\pi\,\tfrac{1}{\text{s}}}{0{,}5\,\tfrac{1}{\text{s}}} \approx 31° .
$$

[Prüfen](?fE=0.5&damp=0.25&amp=5)

</details>

**Aufgabe 4:** Wie klein darf die Dämpfung höchstens werden, damit das Rad bei Resonanz mit $\hat\varphi_E = 10°$ die Belastungsgrenze von $120°$ nicht erreicht?

<details>
<summary>Lösung anzeigen</summary>

Aus $\hat\varphi = \hat\varphi_E \cdot \frac{\omega_0}{2\delta} < 120°$ folgt

$$
\delta > \frac{\hat\varphi_E \cdot \omega_0}{2 \cdot 120°} = \frac{10° \cdot \pi\,\tfrac{1}{\text{s}}}{240°} \approx 0{,}13\,\tfrac{1}{\text{s}} .
$$

Die Dämpfung muss also größer als etwa $0{,}13\,\tfrac{1}{\text{s}}$ sein (bei $\delta = 0{,}16\,\tfrac{1}{\text{s}}$ etwa $98°$).

[Prüfen: knapp darüber](?fE=0.5&amp=10&damp=0.16)

</details>

**Aufgabe 5:** Warum liegt das Maximum der Resonanzkurve bei starker Dämpfung sichtbar links von $f_0$, die Phasenverschiebung von $90°$ aber genau bei $f_0$?

<details>
<summary>Lösung anzeigen</summary>

Für die Phase gilt $\tan \Delta\varphi = \frac{2\delta\,\omega_E}{\omega_0^2 - \omega_E^2}$; der Nenner wird genau bei $\omega_E = \omega_0$ null, dort ist $\Delta\varphi = 90°$ – unabhängig von $\delta$. Die Amplitude dagegen ist maximal, wo der Wurzelausdruck im Nenner am kleinsten ist. Das ergibt $\omega_R = \sqrt{\omega_0^2 - 2\delta^2}$, also eine etwas kleinere Frequenz. Bei $\delta = 1\,\tfrac{1}{\text{s}}$: $f_R = \frac{1}{2\pi}\sqrt{\pi^2 - 2}\,\tfrac{1}{\text{s}} = \frac{2{,}805}{2\pi}\,\text{Hz} \approx 0{,}45\,\text{Hz}$ statt $0{,}50\,\text{Hz}$.

[Prüfen](?fE=0.45&damp=1)

</details>

**Aufgabe 6:** Erkläre mit den Begriffen Erregerfrequenz, Eigenfrequenz und Dämpfung, warum eine Gruppe Soldaten eine Brücke nicht im Gleichschritt überqueren soll.

<details>
<summary>Lösung anzeigen</summary>

Im Gleichschritt erregen die Schritte die Brücke periodisch mit der Schrittfrequenz (Erregerfrequenz). Liegt sie nahe an einer Eigenfrequenz der Brücke und ist die Brücke nur schwach gedämpft, schaukelt sich die Schwingung mit jedem Schritt weiter auf (Resonanz). Im schlimmsten Fall wird die Belastungsgrenze überschritten. Ohne Gleichschritt kommen die Stöße zu verschiedenen Zeiten und heben sich großteils auf.

</details>

## Ideen für den Unterricht

- **Einsatz:** Erzwungene Schwingungen und Resonanz in der Oberstufe, vor allem als Ergänzung oder Ersatz für den Versuch mit dem echten Pohlschen Rad: Einschwingen beobachten, eine Messreihe der Resonanzkurve in kurzer Zeit aufnehmen, Einfluss der Dämpfung untersuchen, Phasenverschiebung im Zeigerdiagramm sichtbar machen.
- **Modell:** Bewegungsgleichung $\ddot\varphi = -\omega_0^2\,(\varphi - \varphi_E(t)) - 2\delta\,\dot\varphi$ mit geschwindigkeitsproportionaler Dämpfung (Wirbelstrombremse), gelöst mit dem Runge-Kutta-Verfahren. Eigenfrequenz fest $f_0 = 0{,}5\,\text{Hz}$. Die Amplitude kann bei sehr kleinem $\delta$ unrealistisch groß werden, deshalb gibt es die Belastungsgrenze $120°$. Die Dämpfung lässt sich nicht ganz auf null stellen (kleinster Wert $0{,}03\,\tfrac{1}{\text{s}}$): Ohne Dämpfung gäbe es bei $f_E = f_0$ keinen eingeschwungenen Zustand.
- **Messreihe:** „Resonanzkurve aufnehmen“ springt bei jeder Frequenz über das Einschwingen hinweg (Hinweis „Zeitsprung“) und misst dann Amplitude und Phasenverschiebung. Messpunkte und theoretische Kurve lassen sich vergleichen. Schaltet man die Theorie aus, sind auch die berechneten Werte unter „Ergebnisse“ verdeckt (Vorhersage aus den Messpunkten).
- **Halbwertsbreite:** Bei schwacher Dämpfung ist die Breite der Resonanzkurve auf Höhe $\hat\varphi_{\max}/\sqrt2$ etwa $\Delta f \approx \delta/\pi$ – je kleiner die Dämpfung, desto schmaler und höher die Kurve.
- **Häufige Stolpersteine:**
  - „Das Rad schwingt mit seiner Eigenfrequenz.“ – Nur beim Einschwingen; danach mit $f_E$.
  - „Bei Resonanz sind Rad und Erreger im Gleichtakt.“ – Bei Resonanz ist $\Delta\varphi = 90°$; Gleichtakt herrscht bei kleiner Erregerfrequenz.
  - „Je schneller der Motor, desto stärker schwingt das Rad.“ – Oberhalb der Resonanz wird die Amplitude wieder kleiner.
  - „Ohne Dämpfung wäre die Amplitude bei Resonanz unendlich groß, sofort.“ – Sie wächst mit der Zeit an; im Modell ohne Dämpfung linear, bis etwas bricht.
- **Bezug zum Lehrplan:** Physik, Mechanische Schwingungen (erzwungene Schwingung, Resonanz, Dämpfung; Bezüge zu Alltag und Technik, z. B. Brücken, Lautsprecher, Schwingkreis).
