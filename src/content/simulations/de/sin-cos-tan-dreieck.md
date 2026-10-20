---
description: "Interaktive Simulation für die 9. und 10. Klasse: Sinus, Kosinus und Tangens als Seitenverhältnisse im rechtwinkligen Dreieck – Gegenkathete, Ankathete und Hypotenuse wandern mit dem Bezugswinkel, ähnliche Dreiecke wachsen aus der Ecke, der Einheitskreis zeigt sin, cos und tan als Strecken. Dazu Winkel aus zwei Seiten berechnen und drei Anwendungen: Rampe mit Steigung in Prozent, Leiter an der Wand, Höhe eines Turms."
---

## Worum geht es?

In einem rechtwinkligen Dreieck heißt die Seite gegenüber dem rechten Winkel **Hypotenuse**, die beiden anderen Seiten sind die **Katheten**. Von einem spitzen Winkel aus gesehen liegt eine Kathete am Winkel an (**Ankathete**), die andere liegt ihm gegenüber (**Gegenkathete**). Für den Winkel $\alpha$ gilt:

$$
\sin \alpha = \frac{\text{Gegenkathete}}{\text{Hypotenuse}}, \qquad \cos \alpha = \frac{\text{Ankathete}}{\text{Hypotenuse}}, \qquad \tan \alpha = \frac{\text{Gegenkathete}}{\text{Ankathete}}
$$

Im Dreieck $ABC$ mit rechtem Winkel bei $C$ ist für $\alpha$ (bei $A$) also $\sin \alpha = \frac{a}{c}$, $\cos \alpha = \frac{b}{c}$ und $\tan \alpha = \frac{a}{b}$.

**Warum hängen die Verhältnisse nur vom Winkel ab?** Alle rechtwinkligen Dreiecke mit demselben Winkel $\alpha$ sind **ähnlich**: Man erhält sie durch zentrische Streckung mit Zentrum im Scheitel von $\alpha$. Dabei werden alle Seiten mit demselben Faktor $k$ multipliziert, und $k$ kürzt sich im Bruch heraus: $\frac{k \cdot a}{k \cdot c} = \frac{a}{c}$.

**Die Rollen hängen vom Winkel ab.** Für $\beta$ (bei $B$) tauschen die Katheten ihre Rollen: $a$ wird zur Ankathete, $b$ zur Gegenkathete. Weil $\beta = 90° - \alpha$ ist, folgt

$$
\sin \alpha = \cos(90° - \alpha), \qquad \cos \alpha = \sin(90° - \alpha).
$$

**Am Einheitskreis** ist die Hypotenuse $1$. Dann ist die Gegenkathete selbst $\sin \alpha$ und die Ankathete $\cos \alpha$; der Punkt $P$ hat die Koordinaten $(\cos \alpha \,|\, \sin \alpha)$. Der Satz des Pythagoras wird zu $(\sin \alpha)^2 + (\cos \alpha)^2 = 1$, und es gilt $\tan \alpha = \frac{\sin \alpha}{\cos \alpha}$. An der Tangente $x = 1$ ist die Ankathete $1$, dort lässt sich $\tan \alpha$ als Strecke ablesen.

**Besondere Werte** (exakt): $\sin 30° = \frac12$, $\sin 45° = \frac{\sqrt2}{2} \approx 0{,}7071$, $\sin 60° = \frac{\sqrt3}{2} \approx 0{,}8660$; $\tan 30° = \frac{\sqrt3}{3} \approx 0{,}5774$, $\tan 45° = 1$, $\tan 60° = \sqrt3 \approx 1{,}732$.

**Rückwärts:** Kennt man zwei Seiten, bildet man das passende Verhältnis und bestimmt den Winkel mit der Umkehrtaste, z. B. $\alpha = \sin^{-1}(0{,}6) \approx 36{,}87°$. Für $\sin$ und $\cos$ muss das Verhältnis kleiner als $1$ sein – die Hypotenuse ist die längste Seite.

## Ausprobieren

1. [Start](?al=35&c=6): Ziehe die Ecke $B$. Welche Seite ist die Gegenkathete von $\alpha$? Was passiert mit $\sin \alpha$, wenn du nur $c$ änderst?
2. Drücke **„Ähnliche Dreiecke wachsen lassen“**: Das Dreieck wächst aus der Ecke $A$, die Kopien mit $k = 0{,}25;\ 0{,}5;\ 0{,}75$ bleiben stehen. Welche Zahlen in der Tabelle ändern sich, welche nicht?
3. Tippe auf den Winkelbogen bei $B$ oder drücke „Bezugswinkel wechseln“. Beobachte, wohin die Namen „Gegenkathete“ und „Ankathete“ wandern. [Bezugswinkel β](?ref=b&al=35&c=8)
4. Stelle [Tangens](?f=tan&al=45&c=7) ein. Warum ist $\tan 45° = 1$? Was passiert mit $\tan \alpha$ bei [85°](?f=tan&al=85&c=10)?
5. [Einheitskreis](?mode=unit&al=30): Drücke „Winkel durchlaufen“ und beobachte die Tabelle der besonderen Werte. Wann ist $\sin \alpha = \cos \alpha$?
6. [Winkel berechnen](?mode=inv&f=sin&go=3&hy=5): Lass dir die Lösung Schritt für Schritt zeigen. Was passiert, wenn die [Gegenkathete länger als die Hypotenuse](?mode=inv&f=sin&go=6&hy=5) ist?
7. Anwendungen: [Rampe](?mode=app&app=ramp&pc=6&rh=0.5), [Leiter](?mode=app&app=ladder&ll=4&al=70), [Turm](?mode=app&app=tower&d=50&al=32). Drücke „Rechnung durchspielen“ und ziehe die Punkte im Bild.

## Aufgaben

### Aufgabe 1: Seiten berechnen

In einem rechtwinkligen Dreieck ($\gamma = 90°$) ist $c = 6\,\text{cm}$ und $\alpha = 30°$. Berechne $a$ und $b$. [Aufgabe laden](?al=30&c=6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$a = c \cdot \sin \alpha = 6\,\text{cm} \cdot \frac12 = 3\,\text{cm}$; $b = c \cdot \cos \alpha = 6\,\text{cm} \cdot \frac{\sqrt3}{2} = 3\sqrt3\,\text{cm} \approx 5{,}20\,\text{cm}$. [Lösung zeigen](?al=30&c=6)

</details>

### Aufgabe 2: Der andere Winkel

Im Dreieck mit $\alpha = 35°$ und $c = 6\,\text{cm}$ ist $a \approx 3{,}44\,\text{cm}$ und $b \approx 4{,}91\,\text{cm}$. Gib $\sin \beta$ und $\cos \beta$ als Seitenverhältnis an und berechne sie. Was fällt dir auf? [Aufgabe laden](?ref=b&al=35&c=6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Für $\beta$ ist $b$ die Gegenkathete und $a$ die Ankathete: $\sin \beta = \frac{b}{c} \approx \frac{4{,}91}{6} \approx 0{,}819$, $\cos \beta = \frac{a}{c} \approx \frac{3{,}44}{6} \approx 0{,}574$. Es ist $\sin 55° = \cos 35°$ und $\cos 55° = \sin 35°$, denn $\beta = 90° - \alpha$. [Lösung zeigen](?ref=b&al=35&c=6)

</details>

### Aufgabe 3: Winkel aus zwei Seiten

Gegenkathete $3\,\text{cm}$, Hypotenuse $5\,\text{cm}$. Wie groß ist $\alpha$? Wie lang ist die Ankathete? [Aufgabe laden](?mode=inv&f=sin&go=3&hy=5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\sin \alpha = \frac{3}{5} = 0{,}6$, also $\alpha = \sin^{-1}(0{,}6) \approx 36{,}87°$. Ankathete $= \sqrt{5^2 - 3^2}\,\text{cm} = 4\,\text{cm}$; Probe: $\cos \alpha = 0{,}8$, $\tan \alpha = 0{,}75$. [Lösung zeigen](?mode=inv&f=sin&go=3&hy=5)

</details>

### Aufgabe 4: Rollstuhlrampe

Eine Eingangsstufe ist $0{,}5\,\text{m}$ hoch. Eine Rampe soll die Steigung $6\,\%$ haben. Wie groß ist der Steigungswinkel, wie lang die waagrechte Strecke? [Aufgabe laden](?mode=app&app=ramp&pc=6&rh=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\tan \alpha = \frac{6}{100} = 0{,}06$, also $\alpha = \tan^{-1}(0{,}06) \approx 3{,}43°$ (nicht $6°$!). Waagrecht: $l = \frac{0{,}5\,\text{m}}{0{,}06} \approx 8{,}33\,\text{m}$; die schräge Rampe ist $\sqrt{8{,}33^2 + 0{,}5^2}\,\text{m} \approx 8{,}35\,\text{m}$ lang. [Lösung zeigen](?mode=app&app=ramp&pc=6&rh=0.5)

</details>

### Aufgabe 5: Leiter an der Wand

Eine $4\,\text{m}$ lange Leiter steht im Winkel $70°$ zum Boden. Wie hoch reicht sie, wie weit steht der Fuß von der Wand weg? Steht sie sicher? [Aufgabe laden](?mode=app&app=ladder&ll=4&al=70&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$h = 4\,\text{m} \cdot \sin 70° \approx 3{,}76\,\text{m}$, $e = 4\,\text{m} \cdot \cos 70° \approx 1{,}37\,\text{m}$. $70°$ liegt im Bereich der Faustregel ($65°$ bis $75°$). [Lösung zeigen](?mode=app&app=ladder&ll=4&al=70)

</details>

### Aufgabe 6: Wie hoch ist der Turm?

Aus $50\,\text{m}$ Entfernung sieht man die Turmspitze unter dem Höhenwinkel $32°$. Das Messgerät steht $1{,}5\,\text{m}$ über dem Boden. [Aufgabe laden](?mode=app&app=tower&d=50&al=32&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\tan 32° = \frac{x}{50\,\text{m}}$, also $x = 50\,\text{m} \cdot \tan 32° \approx 31{,}24\,\text{m}$. Turmhöhe $h \approx 31{,}24\,\text{m} + 1{,}5\,\text{m} = 32{,}74\,\text{m}$. [Lösung zeigen](?mode=app&app=tower&d=50&al=32)

</details>

### Aufgabe 7: Stimmt das? (Knobelaufgabe)

a) „$\sin \alpha$ kann nie größer als $1$ sein, $\tan \alpha$ aber schon.“ b) „Für jeden spitzen Winkel gilt $(\sin \alpha)^2 + (\cos \alpha)^2 = 1$.“ Begründe beide Aussagen.

<details>
<summary>Lösung anzeigen</summary>

a) Die Hypotenuse ist die längste Seite, also ist $\frac{\text{Gegenkathete}}{\text{Hypotenuse}} < 1$. Beim Tangens steht die Ankathete im Nenner; ab $45°$ ist die Gegenkathete länger, dann ist $\tan \alpha > 1$. [Sonderfall zeigen](?mode=inv&f=sin&go=6&hy=5)

b) Nach Pythagoras ist $a^2 + b^2 = c^2$. Teilt man durch $c^2$, folgt $\left(\frac{a}{c}\right)^2 + \left(\frac{b}{c}\right)^2 = 1$. [Am Einheitskreis zeigen](?mode=unit&al=35)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 9, Trigonometrie am rechtwinkligen Dreieck (LehrplanPLUS Gymnasium Bayern); der Einheitskreis leitet zu den Sinus- und Kosinusfunktionen der Jahrgangsstufe 10 über – genaue Zuordnung bitte am Lehrplan prüfen.
- **Entdecken vor Benennen:** Die Animation „Ähnliche Dreiecke wachsen lassen“ kann vor der Definition stehen: Was bleibt gleich, wenn das Dreieck wächst? Anschließend messen die Lernenden selbst gezeichnete Dreiecke mit $\alpha = 35°$ nach.
- **Aufgabenmodus:** Mit „Ergebnisse zeigen“ aus (`show=0`) erscheinen gesuchte Größen im Bild als „?“. So lassen sich alle Themen als Übungsaufgaben verwenden.
- **Taschenrechner:** Gradmodus (DEG) prüfen; die Umkehrtasten $\sin^{-1}$, $\cos^{-1}$, $\tan^{-1}$ liefern den Winkel.
- **Häufige Stolpersteine:**
  - Gegen- und Ankathete werden festgelegt, ohne auf den Bezugswinkel zu schauen – hier hilft das Umschalten auf $\beta$.
  - Die Hypotenuse wird mit der „schrägen“ Seite verwechselt, auch wenn das Dreieck anders liegt.
  - Steigung in Prozent wird als Winkel in Grad gelesen ($6\,\% \approx 3{,}43°$, aber $6° \approx 10{,}5\,\%$).
  - Bei der Turmhöhe wird die Augenhöhe vergessen.
  - Der Taschenrechner steht im Bogenmaß.
