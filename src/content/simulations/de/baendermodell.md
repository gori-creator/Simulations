## Worum geht es?

Warum leitet Kupfer den Strom so gut, Silizium nur mäßig und Diamant fast gar nicht – obwohl alle drei aus Atomen mit Elektronen bestehen? Die Antwort liefert das **Bändermodell**.

### Aus Niveaus werden Bänder

Ein einzelnes Atom hat scharfe **Energieniveaus**. Rücken zwei Atome zusammen, beeinflussen sich ihre Elektronen: Jedes Niveau spaltet in zwei auf. Bei $N$ Atomen entstehen $N$ dicht benachbarte Niveaus. In einem Kristall mit unvorstellbar vielen Atomen (etwa $10^{23}$) liegen sie so dicht, dass sie ein zusammenhängendes **Energieband** bilden.

Wie breit ein Band wird, hängt vom **Abstand** der Atome ab: Je näher sie sich kommen, desto breiter. Zwischen zwei Bändern kann eine **Bandlücke** bleiben – Energien, die kein Elektron im Kristall haben kann.

### Leiter, Halbleiter, Isolator

Entscheidend ist, wie die Bänder mit Elektronen gefüllt sind:

- **Metall (Leiter):** Das oberste besetzte Band ist nur **halb gefüllt**. Elektronen finden direkt über sich freie Plätze, ein kleines elektrisches Feld setzt sie in Bewegung. Die Grenze zwischen besetzt und frei heißt **Fermi-Energie** $E_F$.
- **Halbleiter:** Das **Valenzband** ist voll, das **Leitungsband** darüber leer. Die Lücke ist aber klein (Silizium: 1,12 eV). Durch Wärme springen einige Elektronen hinüber. Sie leiten im Leitungsband – und die **Löcher**, die sie im Valenzband zurücklassen, leiten ebenfalls.
- **Isolator:** Wie beim Halbleiter, aber die Lücke ist groß (Diamant: 5,5 eV). Bei normalen Temperaturen schafft kaum ein Elektron den Sprung.

Die Zahl der freien Elektronen in einem reinen Halbleiter wächst mit der Temperatur stark an:

$$n \sim e^{-E_g / (2kT)}$$

Darum leiten Halbleiter **warm besser**. Bei Metallen ist es umgekehrt: Die Zahl der freien Elektronen bleibt gleich, aber die Atome schwingen stärker und bremsen die Elektronen – der Widerstand steigt.

In der Simulation wächst die Zahl der gezeichneten Leitungselektronen mit dem **Logarithmus** von $n$ – sonst wären es bei Silizium entweder unsichtbar wenige oder unzählbar viele.

### Supraleitung

Kühlt man manche Metalle sehr stark ab, verschwindet ihr elektrischer Widerstand unterhalb einer **Sprungtemperatur** $T_c$ **vollständig** (Quecksilber: 4,15 K, entdeckt 1911). Ein Strom in einem supraleitenden Ring fließt dann jahrelang ohne Verlust. Außerdem drängt ein Supraleiter Magnetfelder aus seinem Inneren hinaus (**Meißner-Ochsenfeld-Effekt**) – deshalb kann ein Magnet über ihm schweben. Erklären lässt sich das erst mit der Quantenphysik: Elektronen bilden Paare, die sich ohne Stöße durch das Gitter bewegen. Anwendungen sind die Magnete im Kernspintomographen und in Teilchenbeschleunigern.

## Ausprobieren

- [Ein Atom](?mode=abstand&N=1&d=1): Erhöhe die Zahl der Atome Schritt für Schritt.
- [Kristall](?mode=abstand&N=30&d=1): Verändere den Abstand. Wann verschwindet die Lücke?
- [Silizium](?mode=stoffe&stoff=si&T=300): Erwärme auf 600 K. Wie ändert sich die Leitfähigkeit?
- [Kupfer](?mode=stoffe&stoff=cu&T=300): Was passiert hier beim Erwärmen?
- [Quecksilber](?mode=supra&sl=hg&Ts=6): Kühle langsam ab.

## Aufgaben

**1. Niveaus zählen.** Wie viele Niveaus bilden das untere Band, wenn 30 Atome zusammenkommen? Wie viele wären es in einem Kristall mit $10^{23}$ Atomen? [Aufgabe laden](?mode=abstand&N=30&d=1)

<details><summary>Lösung anzeigen</summary>

30 Niveaus – je Atom eines. Bei $10^{23}$ Atomen sind es $10^{23}$ Niveaus, so dicht, dass man von einem Band spricht.

</details>

**2. Doppelte Lücke.** Germanium hat eine Bandlücke von 0,66 eV, Silizium von 1,12 eV. Welcher Stoff hat bei 300 K mehr freie Elektronen? Schätze das Verhältnis mit $kT \approx 0{,}026$ eV ab. [Aufgabe laden](?mode=stoffe&stoff=ge&T=300&_hide=1)

<details><summary>Lösung anzeigen</summary>

Germanium. $\dfrac{n_\text{Ge}}{n_\text{Si}} \approx e^{(1{,}12 - 0{,}66)/(2 \cdot 0{,}026)} = e^{8{,}8} \approx 7000$.

</details>

**3. Warm oder kalt?** Ein Temperaturfühler soll mit steigender Temperatur einen kleineren Widerstand haben. Nimmt man besser einen Metalldraht oder einen Halbleiter? [Aufgabe laden](?mode=stoffe&stoff=si&T=300)

<details><summary>Lösung anzeigen</summary>

Einen Halbleiter (Heißleiter, NTC): Er hat warm mehr freie Elektronen und Löcher, sein Widerstand sinkt. Beim Metall steigt der Widerstand mit der Temperatur.

</details>

**4. Sprungtemperatur.** Bei welcher Temperatur wird Blei supraleitend? Wie groß ist sein Widerstand bei 5 K? [Aufgabe laden](?mode=supra&sl=pb&Ts=5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$T_c = 7{,}2$ K. Bei 5 K ist Blei supraleitend, der Widerstand ist genau null.

</details>
