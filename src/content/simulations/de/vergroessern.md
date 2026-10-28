## Worum geht es?

Vergrößert man eine Figur mit dem **Streckfaktor** $k$, entsteht eine **ähnliche** Figur: Alle Winkel bleiben gleich, alle Längen werden $k$-mal so lang. Wie verändern sich dabei Flächeninhalte und Volumina?

Die Simulation legt das Bild **Kopie für Kopie** mit dem Original aus:

- Eine **Strecke** der Länge $k \cdot a$ besteht aus $k$ Kopien der Strecke $a$.
- Ein **Quadrat** mit doppelter Seitenlänge besteht aus $2 \cdot 2 = 4$ Kopien, bei dreifacher Seitenlänge aus $3 \cdot 3 = 9$ Kopien. Beim Dreieck geht es genauso – einige Kopien liegen dabei auf dem Kopf.
- Ein **Würfel** mit doppelter Kantenlänge besteht aus $2 \cdot 2 \cdot 2 = 8$ Kopien, Schicht für Schicht.

Allgemein gilt für ähnliche Figuren und Körper mit dem Streckfaktor $k$:

$$
\text{Länge} \cdot k, \qquad \text{Flächeninhalt} \cdot k^2, \qquad \text{Volumen} \cdot k^3 .
$$

Das gilt für **jede** Fläche, also auch für die **Oberfläche** eines Körpers: Sie wächst ebenfalls mit $k^2$. Ist $k$ keine ganze Zahl, liegen am Rand **Bruchstücke**. Bei $k = 1{,}5$ besteht das Quadrat aus $1 + 0{,}5 + 0{,}5 + 0{,}25 = 2{,}25 = 1{,}5^2$ Kopien. Einen Kreis kann man nicht aus kleinen Kreisen legen, wohl aber aus Sektoren, die jeweils so groß sind wie der kleine Kreis.

**Verkleinern** ($0 < k < 1$): Jetzt passt das Bild mehrmals in das Original. Bei $k = 0{,}5$ ist die Fläche nur noch $0{,}5^2 = \frac14$, das Volumen nur noch $0{,}5^3 = \frac18$ so groß. Es gilt dann $k^3 < k^2 < k$.

**Rückwärts:** Ist bekannt, um welchen Faktor das Volumen gewachsen ist, zieht man die **Kubikwurzel**, beim Flächeninhalt die **Quadratwurzel**: $k^3 = 8 \Rightarrow k = \sqrt[3]{8} = 2$ und $k^2 = 2 \Rightarrow k = \sqrt{2} \approx 1{,}41$.

## Ausprobieren

1. [k = 2](?k=2): Drücke „Kopien auslegen“ und zähle mit: erst die Strecke, dann die Fläche, dann die Würfel Schicht für Schicht. Drehe den Würfel mit der Maus oder dem Finger.
2. Ziehe am Griff der Strecke, an der Ecke des Quadrats oder am Würfel. Beobachte im Diagramm „Wie schnell wächst was?“, wie $k^3$ davonläuft.
3. [Dreieck mit k = 3](?k=3&fig=d): Wie viele Kopien stehen auf dem Kopf? Und wie viele Würfel braucht man jetzt?
4. [k = 1,5 mit Quader](?k=1.5&fig=r&obj=q): Welche Bruchstücke entstehen am Rand? Warum sind es zusammen genau $2{,}25$ bzw. $3{,}375$ Kopien?
5. [k = 0,5](?k=0.5): Jetzt wird das Original mit Bildern ausgelegt. Wie viele passen hinein? Und beim [Kreis mit k = 2](?k=2&fig=k)?
6. [Rückwärts](?mode=back&dim=v&f=27): Das Volumen ist 27-mal so groß. Drücke „k suchen“. Ändere dann auf [Flächenfaktor 2](?mode=back&dim=a&f=2).
7. Anwendungen: [Pizza](?mode=pizza&d1=20&d2=30), [Modellauto](?mode=modell&m=10), [Oberfläche und Volumen](?mode=ov&a=2) – drücke jeweils den Knopf unter der Zeichenfläche.

## Aufgaben

### Aufgabe 1: Dreimal so groß

Ein Würfel mit der Kantenlänge $1\,\text{cm}$ wird mit $k = 3$ vergrößert. Berechne Kantenlänge, Oberfläche und Volumen des Bildes. [Aufgabe laden](?k=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Kante $3\,\text{cm}$. Oberfläche $6\,\text{cm}^2 \cdot 3^2 = 54\,\text{cm}^2$. Volumen $1\,\text{cm}^3 \cdot 3^3 = 27\,\text{cm}^3$ – es passen also 27 Originalwürfel hinein. [Lösung zeigen](?k=3)

</details>

### Aufgabe 2: Halbe Kante

Ein Würfel mit $1\,\text{cm}$ Kantenlänge wird mit $k = 0{,}5$ verkleinert. Welcher Bruchteil von Oberfläche und Volumen bleibt? Gib beide Werte an. [Aufgabe laden](?k=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Oberfläche: $0{,}5^2 = \frac14$, also $6\,\text{cm}^2 : 4 = 1{,}5\,\text{cm}^2$. Volumen: $0{,}5^3 = \frac18$, also $0{,}125\,\text{cm}^3$. Acht kleine Würfel füllen den Originalwürfel. [Lösung zeigen](?k=0.5)

</details>

### Aufgabe 3: Quader mit Bruchstücken

Ein Quader mit den Maßen $2\,\text{cm} \times 1\,\text{cm} \times 1\,\text{cm}$ wird mit $k = 1{,}5$ vergrößert. Bestimme die neuen Maße, das Volumen und die Oberfläche. [Aufgabe laden](?k=1.5&fig=r&obj=q&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Maße $3\,\text{cm} \times 1{,}5\,\text{cm} \times 1{,}5\,\text{cm}$. Volumen $3 \cdot 1{,}5 \cdot 1{,}5 = 6{,}75\,\text{cm}^3$; zur Kontrolle: $2\,\text{cm}^3 \cdot 1{,}5^3 = 2 \cdot 3{,}375 = 6{,}75\,\text{cm}^3$. Oberfläche vorher $2 \cdot (2 + 1 + 2) = 10\,\text{cm}^2$, nachher $10\,\text{cm}^2 \cdot 2{,}25 = 22{,}5\,\text{cm}^2$. [Lösung zeigen](?k=1.5&fig=r&obj=q)

</details>

### Aufgabe 4: Rückwärts denken

a) Ein Würfel hat nach dem Vergrößern das 27-fache Volumen. Mit welchem Faktor wurde er gestreckt, und wie hat sich seine Oberfläche verändert? [Aufgabe laden](?mode=back&dim=v&f=27&show=0&_hide=1)

b) Eine Figur soll den doppelten Flächeninhalt bekommen. Mit welchem $k$ muss man strecken? [Aufgabe laden](?mode=back&dim=a&f=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

a) $k^3 = 27 \Rightarrow k = \sqrt[3]{27} = 3$; die Oberfläche wird $3^2 = 9$-mal so groß. [Zeigen](?mode=back&dim=v&f=27)

b) $k^2 = 2 \Rightarrow k = \sqrt{2} \approx 1{,}41$ – also **nicht** $k = 2$, das ergäbe die vierfache Fläche. [Zeigen](?mode=back&dim=a&f=2)

</details>

### Aufgabe 5: Welche Pizza lohnt sich?

Eine Pizza mit $20\,\text{cm}$ Durchmesser kostet $8$ €, eine mit $30\,\text{cm}$ kostet $15$ €. Welche ist im Verhältnis zur Fläche günstiger? [Aufgabe laden](?mode=pizza&d1=20&d2=30&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$k = 30 : 20 = 1{,}5$, die Fläche ist $1{,}5^2 = 2{,}25$-mal so groß ($\approx 707\,\text{cm}^2$ statt $\approx 314\,\text{cm}^2$). Für $2{,}25$ kleine Pizzen würde man $2{,}25 \cdot 8\,€ = 18\,€$ bezahlen – die große Pizza für $15\,€$ ist günstiger (etwa $2{,}1$ ct statt $2{,}5$ ct pro $\text{cm}^2$). [Lösung zeigen](?mode=pizza&d1=20&d2=30)

</details>

### Aufgabe 6: Kleine Würfel kühlen schneller aus

Berechne für Würfel mit $a = 1\,\text{cm}$, $2\,\text{cm}$ und $3\,\text{cm}$ jeweils das Verhältnis $O : V$. Was passiert mit der Oberfläche, wenn man den Würfel mit $a = 3\,\text{cm}$ in Würfel mit $1\,\text{cm}$ Kante zerteilt? [Aufgabe laden](?mode=ov&a=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$O : V = \frac{6a^2}{a^3} = \frac{6}{a}$, also $6$, $3$ und $2$. Zerteilt man den Würfel mit $a = 3\,\text{cm}$ in $27$ kleine Würfel, bleibt das Volumen $27\,\text{cm}^3$, die Oberfläche wächst von $54\,\text{cm}^2$ auf $27 \cdot 6\,\text{cm}^2 = 162\,\text{cm}^2$ (dreifach). Kleine Körper haben im Verhältnis viel Oberfläche – deshalb kühlen kleine Tiere schneller aus. [Lösung zeigen](?mode=ov&a=3)

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 9, Ähnlichkeit und zentrische Streckung. Die Animation „Kopien auslegen“ eignet sich als Einstieg, bevor die Regel $k$, $k^2$, $k^3$ formuliert wird – etwa mit einer Schätzung vorab: „Wie viele kleine Würfel brauche ich?“ Steckwürfel helfen beim Nachbauen.
- **Aufgaben aus dem Bild:** Mit „Ergebnisse zeigen“ aus (`show=0`) erscheinen die gesuchten Werte als „?“, bis die Animation gelaufen ist.
- **Anwendungen:** Pizza (Preis pro Fläche), Modellbau (Lack $\cdot \frac{1}{100}$, Masse bei gleichem Material $\cdot \frac{1}{1000}$ im Maßstab $1 : 10$) und das Verhältnis von Oberfläche zu Volumen (Wärmeverlust bei Tieren, Puderzucker, Holzspäne) bieten Anlässe zum Modellieren.
- **Häufige Stolpersteine:**
  - „Doppelte Seitenlänge – doppelte Fläche“: Die Kopien im Bild machen sichtbar, dass es vier sind.
  - Beim Verkleinern wird $k^2$ als größer als $k$ erwartet; bei $0 < k < 1$ gilt aber $k^3 < k^2 < k$.
  - Rückwärts wird der Faktor direkt als $k$ genommen („doppelte Fläche, also $k = 2$“), statt die Wurzel zu ziehen.
  - Maßstab und Flächenmaßstab werden verwechselt: $1 : 10$ bei Längen bedeutet $1 : 100$ bei Flächen.
