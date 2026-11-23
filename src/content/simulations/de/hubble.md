## Worum geht es?

1929 verglich **Edwin Hubble** die Entfernungen von Galaxien mit ihren Spektren. Fast alle Spektrallinien waren zum roten Ende hin verschoben, und zwar umso stärker, je weiter die Galaxie entfernt war. Gedeutet als Geschwindigkeit heißt das: **Je weiter weg, desto schneller entfernt sich eine Galaxie.**

$$
v = H_0 \cdot d \qquad \text{(Hubble-Beziehung)}
$$

Die **Hubble-Konstante** $H_0$ liegt heute bei etwa $70\,\tfrac{\text{km}}{\text{s}\cdot\text{Mpc}}$. Ein Megaparsec (Mpc) sind etwa 3,26 Millionen Lichtjahre. Eine Galaxie in $100\,\text{Mpc}$ Entfernung entfernt sich also mit etwa $7000\,\tfrac{\text{km}}{\text{s}}$.

**Rotverschiebung:** Man misst sie an bekannten Linien, zum Beispiel an der Wasserstofflinie H$\alpha$ ($\lambda_0 = 656{,}3\,\text{nm}$):

$$
z = \frac{\lambda - \lambda_0}{\lambda_0}, \qquad v \approx c \cdot z \quad (\text{nur für } z \ll 1).
$$

Für $v = 7000\,\tfrac{\text{km}}{\text{s}}$ ist $z = \tfrac{7000}{299\,792} \approx 0{,}023$, und H$\alpha$ erscheint bei etwa $671{,}6\,\text{nm}$.

**Kein Mittelpunkt:** Im Rosinenkuchen-Modell wachsen alle Abstände um denselben Faktor. Von jeder Rosine aus sieht es so aus, als flögen alle anderen weg, die fernen schneller. Unsere Milchstraße ist also nicht der Mittelpunkt. Die Galaxien selbst werden dabei nicht größer, nur die Abstände zwischen ihnen.

**Der Raum dehnt sich:** Genau genommen bewegen sich ferne Galaxien nicht durch den Raum, der Raum selbst dehnt sich. Licht, das unterwegs ist, wird mitgedehnt: $1 + z = \tfrac{a_\text{heute}}{a_\text{damals}}$. Dabei ist $a$ der **Skalenfaktor**, der angibt, wie groß Abstände damals im Vergleich zu heute waren. Deshalb darf $H_0 \cdot d$ für sehr ferne Galaxien auch größer als die Lichtgeschwindigkeit sein.

**Alter des Universums:** Rechnet man die Bewegung mit gleicher Geschwindigkeit zurück, lagen alle Galaxien vor der **Hubble-Zeit**

$$
t_H = \frac{1}{H_0} \approx 14{,}0\ \text{Milliarden Jahre}
$$

an einem Ort. Wie schnell sich das All wirklich ausgedehnt hat, hängt vom Inhalt ab (Friedmann-Gleichungen). Materie bremst, **Dunkle Energie** beschleunigt. Im heutigen Standardmodell ($\Omega_m = 0{,}3$, $\Omega_\Lambda = 0{,}7$) ist das Universum etwa **13,5 Milliarden Jahre** alt.

**Hintergrundstrahlung:** Etwa 380 000 Jahre nach dem Urknall wurde das All durchsichtig. Das Licht von damals ($T \approx 3000\,\text{K}$) ist um $z \approx 1090$ gedehnt und kommt heute als Mikrowellenstrahlung mit $T = 2{,}7\,\text{K}$ aus allen Richtungen ($\lambda_\text{max} \approx 1{,}06\,\text{mm}$).

**Entfernungen messen:** Supernovae vom Typ Ia leuchten alle etwa gleich hell ($M \approx -19{,}3$). Aus der gemessenen Helligkeit $m$ folgt die Entfernung: $d = 10^{(m - M)/5 + 1}\,\text{pc}$. Solche Objekte heißen **Standardkerzen**.

## Ausprobieren

1. Wähle eine Galaxie am Rand als Heimat. Sieht die Ausdehnung von dort anders aus? [Heimat am Rand](?mode=raisin&home=9&trail=1)
2. Ziehe die ferne Galaxie weiter weg. Wann verlässt die H$\alpha$-Linie den sichtbaren Bereich? [Spektrum](?mode=spectrum&d=100&zc=cosmo)
3. Stelle die einfache Rechnung ein und schiebe die Galaxie auf 5000 Mpc. Was ist an $v$ seltsam? [v > c?](?mode=spectrum&d=5000&zc=classic)
4. Passe in Hubbles Daten von 1929 die Gerade selbst an. Welches Weltalter ergibt sich? [Hubble 1929](?mode=diagram&set=1929&hu=300&fit=1)
5. Beobachte zehn Galaxien und bestimme $H_0$ selbst. [Selbst forschen](?mode=research&h0=70&noise=1&fit=1)
6. Vergleiche das Standardmodell mit einem Universum nur aus Materie. Welches ist älter? [Geschichte](?mode=history&om=0.3&ol=0.7&lz=0.3)

## Aufgaben

### Aufgabe 1: Fluchtgeschwindigkeit

Eine Galaxie ist 200 Mpc entfernt. Wie schnell entfernt sie sich ($H_0 = 70\,\tfrac{\text{km}}{\text{s}\cdot\text{Mpc}}$)? Wie viele Lichtjahre sind das?

<details>
<summary>Lösung anzeigen</summary>

$v = 70 \cdot 200 = 14\,000\,\tfrac{\text{km}}{\text{s}}$. $200\,\text{Mpc} \approx 200 \cdot 3{,}26 \approx 652$ Millionen Lichtjahre. [In der Simulation zeigen](?mode=spectrum&d=200&zc=classic)

</details>

### Aufgabe 2: Aus dem Spektrum zur Entfernung

Im Spektrum einer Galaxie liegt H$\alpha$ bei $721{,}9\,\text{nm}$. Bestimme $z$, $v$ und $d$.

<details>
<summary>Lösung anzeigen</summary>

$z = \tfrac{721{,}9 - 656{,}3}{656{,}3} \approx 0{,}10$, $v \approx c \cdot z \approx 30\,000\,\tfrac{\text{km}}{\text{s}}$, $d = \tfrac{v}{H_0} \approx 428\,\text{Mpc}$. Bei $z = 0{,}1$ ist $v = c \cdot z$ nur noch eine Näherung.

</details>

### Aufgabe 3: Standardkerze

Eine Supernova vom Typ Ia ($M = -19{,}3$) erscheint mit $m = 15{,}7$. Wie weit ist sie entfernt?

<details>
<summary>Lösung anzeigen</summary>

$m - M = 35$, also $d = 10^{35/5 + 1}\,\text{pc} = 10^8\,\text{pc} = 100\,\text{Mpc}$.

</details>

### Aufgabe 4: Hubbles Fehler

Hubble fand 1929 etwa $H_0 = 500\,\tfrac{\text{km}}{\text{s}\cdot\text{Mpc}}$. Welche Hubble-Zeit folgt daraus? Warum war das ein Problem?

<details>
<summary>Lösung anzeigen</summary>

$t_H = \tfrac{1}{H_0} \approx \tfrac{14{,}0 \cdot 70}{500} \approx 2{,}0$ Milliarden Jahre. Die Erde ist aber etwa 4,5 Milliarden Jahre alt. Der Fehler lag in den Entfernungen: Sie waren etwa 7-mal zu klein. [Hubble 1929](?mode=diagram&set=1929&hu=500&fit=1)

</details>

### Aufgabe 5: Hintergrundstrahlung

Die Hintergrundstrahlung hat heute $T = 2{,}73\,\text{K}$. Bei welcher Wellenlänge strahlt sie am stärksten? Wie heiß war sie bei $z = 1090$?

<details>
<summary>Lösung anzeigen</summary>

$\lambda_\text{max} = \tfrac{2{,}898 \cdot 10^{-3}\,\text{m K}}{2{,}73\,\text{K}} \approx 1{,}06\,\text{mm}$. Damals: $T = 2{,}73\,\text{K} \cdot 1091 \approx 2970\,\text{K}$. [In der Simulation zeigen](?mode=history&om=0.3&ol=0.7&lz=3.04)

</details>

## Ideen für den Unterricht

- **Einstieg:** Ein Luftballon mit aufgeklebten Punkten wird aufgeblasen. Jede Gruppe misst von „ihrem“ Punkt aus die Abstände vorher und nachher.
- **Forschen:** In der Ansicht „Selbst forschen“ kann jede Gruppe eine eigene Messreihe aufnehmen. Danach lassen sich die gefundenen Werte für $H_0$ vergleichen.
- **Geschichte:** Hubbles Daten von 1929 zeigen gut, wie stark falsch geeichte Entfernungen das Ergebnis verändern.
- **Häufige Stolpersteine:**
  - „Die Milchstraße ist der Mittelpunkt.“ Im Rosinenkuchen-Modell sieht es von jeder Galaxie aus gleich aus.
  - Rotverschiebung als gewöhnlicher Doppler-Effekt: Für ferne Galaxien dehnt sich das Licht mit dem Raum.
  - Hubble-Zeit und Weltalter sind nicht dasselbe.
