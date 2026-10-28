---
description: "Zwei Geraden, Gerade und Ebene oder zwei Ebenen im drehbaren 3D-Bild: Ein Entscheidungsbaum führt zu identisch, parallel, schneidend oder windschief – mit Schnittpunkt, Schnittgerade, Schnittwinkel, Abständen und dem animierten Lot von einem Punkt auf eine Ebene."
---

## Worum geht es?

Geraden schreibt man in **Parameterform** $g\colon \vec x = \vec a + t \cdot \vec u$ (Stützpunkt $A$, Richtungsvektor $\vec u$), Ebenen in **Koordinatenform** $E\colon n_1x_1 + n_2x_2 + n_3x_3 = c$ mit dem **Normalenvektor** $\vec n$.

**Zwei Geraden** $g$ und $h\colon \vec x = \vec b + s \cdot \vec v$ – zwei Fragen genügen:

1. Sind die Richtungen parallel ($\vec v = k \cdot \vec u$)? Dann sind die Geraden **identisch** (wenn $A$ auf $h$ liegt) oder **echt parallel**.
2. Sonst: Hat das Gleichungssystem $\vec a + t \cdot \vec u = \vec b + s \cdot \vec v$ eine Lösung? Dann **schneiden** sie sich, sonst sind sie **windschief** – sie gehen im Raum aneinander vorbei.

Der **Schnittwinkel** zweier Geraden ist der spitze Winkel zwischen den Richtungen: $\cos \varphi = \dfrac{|\vec u \cdot \vec v|}{|\vec u| \cdot |\vec v|}$. Windschiefe Geraden haben eine **kürzeste Verbindung**, die auf beiden senkrecht steht; ihre Länge ist der Abstand

$$
d = \frac{|(\vec b - \vec a) \cdot (\vec u \times \vec v)|}{|\vec u \times \vec v|}.
$$

**Gerade und Ebene:** Man setzt die Gerade in die Ebenengleichung ein. Ist $\vec n \cdot \vec u = 0$, liegt die Gerade in $E$ oder ist parallel zu $E$; sonst gibt es genau einen **Durchstoßpunkt**. Der Schnittwinkel wird mit dem **Sinus** berechnet, weil $\vec n$ senkrecht auf der Ebene steht:

$$
\sin \varphi = \frac{|\vec n \cdot \vec u|}{|\vec n| \cdot |\vec u|}.
$$

**Zwei Ebenen** sind parallel (oder identisch), wenn ihre Normalenvektoren parallel sind; sonst schneiden sie sich in einer **Schnittgeraden** mit der Richtung $\vec n \times \vec m$. Schnittwinkel: $\cos \varphi = \dfrac{|\vec n \cdot \vec m|}{|\vec n| \cdot |\vec m|}$.

**Abstand Punkt – Ebene (Hesse-Normalform):** Man fällt das Lot von $P$ auf $E$. Der Lotfußpunkt $F$ liegt auf der Lotgeraden $\vec x = \vec p + t \cdot \vec n$; der Abstand ist

$$
d(P; E) = \frac{|n_1p_1 + n_2p_2 + n_3p_3 - c|}{|\vec n|}.
$$

Geht man von $F$ noch einmal genauso weit, erhält man den **Spiegelpunkt** $P'$.

## Ausprobieren

1. Lade die windschiefen Geraden und spiele die Animation ab: Der Pfad im Entscheidungsbaum leuchtet. Klicke dann auf „Blick entlang g“ – $g$ schrumpft zu einem Punkt, und die rote Verbindung zeigt den Abstand in wahrer Länge. [Beispiel laden](?mode=ll)
2. Ziehe die Spitze des Richtungspfeils $\vec v$ so, dass $h$ die Gerade $g$ trifft. Woran erkennst du im Bild, dass es jetzt einen Schnittpunkt gibt?
3. Bei parallelen Geraden zeigt „Blick senkrecht auf g und h“ zwei parallele Linien mit dem Abstand in wahrer Länge. [Parallele Geraden](?a1=0&a2=0&a3=0&u1=1&u2=2&u3=3&b1=1&b2=0&b3=0&v1=2&v2=4&v3=6)
4. Fast parallel, aber nicht parallel: Wo liegt hier der Schnittpunkt, und wie groß ist der Winkel? Der Schnittpunkt liegt außerhalb der gezeichneten Achsen – lies ihn in den Ergebnissen ab. [Sehr kleiner Winkel](?a1=0&a2=0&a3=0&u1=6&u2=0&u3=0&b1=0&b2=1&b3=0&v1=6&v2=0.5&v3=0)
5. Eine Gerade, die fast parallel zur $x_1x_2$-Ebene verläuft: Der Durchstoßpunkt wandert weit nach außen und liegt außerhalb der gezeichneten Achsen – lies ihn in den Ergebnissen ab. Stelle $u_3$ auf $0$ – was sagt jetzt der Entscheidungsbaum? [Gerade fast in der Ebene](?mode=lp&a1=0&a2=0&a3=1&u1=4&u2=0&u3=0.5&n1=0&n2=0&n3=1&c=0)
6. Zwei Ebenen schneiden sich: Mit „Blick entlang der Schnittgeraden“ erscheinen beide Ebenen als Linien, und der Winkel zwischen ihnen ist der wahre Schnittwinkel. [Schnittgerade](?mode=pp)
7. Fälle das Lot von $P$ auf $E$ und schalte den Spiegelpunkt ein. Ziehe $P$ dann in die Ebene hinein: Was passiert mit $d$, $F$ und $P'$? [Abstand Punkt – Ebene](?mode=pd&mir=1)

## Aufgaben

### Aufgabe 1: Schnittpunkt zweier Geraden

Untersuche die Lage von $g\colon \vec x = \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} + t \cdot \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix}$ und $h\colon \vec x = \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix} + s \cdot \begin{pmatrix} 1 \\ -1 \\ 0 \end{pmatrix}$. Berechne gegebenenfalls Schnittpunkt und Schnittwinkel. [Aufgabe laden](?a1=1&a2=0&a3=0&u1=1&u2=1&u3=0&b1=0&b2=1&b3=0&v1=1&v2=-1&v3=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Richtungen sind nicht parallel. Gleichsetzen: $1 + t = s$ und $t = 1 - s$, dritte Zeile $0 = 0$. Daraus $t = 0$, $s = 1$, also $S(1 \mid 0 \mid 0)$. Wegen $\vec u \cdot \vec v = 1 - 1 + 0 = 0$ schneiden sich die Geraden unter $90°$. [In der Simulation zeigen](?a1=1&a2=0&a3=0&u1=1&u2=1&u3=0&b1=0&b2=1&b3=0&v1=1&v2=-1&v3=0)

</details>

### Aufgabe 2: Windschief?

Zeige, dass $g\colon \vec x = t \cdot \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix}$ und $h\colon \vec x = \begin{pmatrix} 0 \\ 1 \\ 1 \end{pmatrix} + s \cdot \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix}$ windschief sind, und bestimme ihren Abstand. [Aufgabe laden](?a1=0&a2=0&a3=0&u1=1&u2=0&u3=0&b1=0&b2=1&b3=1&v1=0&v2=1&v3=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Richtungen sind nicht parallel. Gleichsetzen liefert in der dritten Zeile $0 = 1$ – ein Widerspruch, also windschief. Mit $\vec u \times \vec v = \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}$ und $\vec b - \vec a = \begin{pmatrix} 0 \\ 1 \\ 1 \end{pmatrix}$ ist $d = \dfrac{|1|}{1} = 1$. Die kürzeste Verbindung führt von $(0 \mid 0 \mid 0)$ nach $(0 \mid 0 \mid 1)$. [In der Simulation zeigen](?a1=0&a2=0&a3=0&u1=1&u2=0&u3=0&b1=0&b2=1&b3=1&v1=0&v2=1&v3=0)

</details>

### Aufgabe 3: Durchstoßpunkt

Berechne den Durchstoßpunkt der Geraden $g\colon \vec x = \begin{pmatrix} 0 \\ 0 \\ 5 \end{pmatrix} + t \cdot \begin{pmatrix} 1 \\ 1 \\ -1 \end{pmatrix}$ durch $E\colon x_1 + x_2 + x_3 = 2$ und den Schnittwinkel. [Aufgabe laden](?mode=lp&a1=0&a2=0&a3=5&u1=1&u2=1&u3=-1&n1=1&n2=1&n3=1&c=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Einsetzen: $t + t + (5 - t) = 2$, also $5 + t = 2$ und $t = -3$. Durchstoßpunkt $D(-3 \mid -3 \mid 8)$. Winkel: $\sin \varphi = \dfrac{|1 + 1 - 1|}{\sqrt 3 \cdot \sqrt 3} = \dfrac13$, also $\varphi \approx 19{,}5°$. [In der Simulation zeigen](?mode=lp&a1=0&a2=0&a3=5&u1=1&u2=1&u3=-1&n1=1&n2=1&n3=1&c=2)

</details>

### Aufgabe 4: Abstand, Lotfußpunkt und Spiegelpunkt

Gegeben sind $P(1 \mid 2 \mid 3)$ und $E\colon 2x_1 - x_2 + 2x_3 = 3$. Berechne $d(P; E)$, den Lotfußpunkt $F$ und den Spiegelpunkt $P'$. [Aufgabe laden](?mode=pd&mir=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$|\vec n| = \sqrt{4 + 1 + 4} = 3$ und $d(P; E) = \dfrac{|2 - 2 + 6 - 3|}{3} = 1$. Lotgerade $\vec x = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + t \cdot \begin{pmatrix} 2 \\ -1 \\ 2 \end{pmatrix}$ in $E$ eingesetzt: $2(1 + 2t) - (2 - t) + 2(3 + 2t) = 6 + 9t = 3$, also $9t = -3$, also $t = -\tfrac13$ und $F\left(\tfrac13 \mid \tfrac73 \mid \tfrac73\right)$. Mit $t = -\tfrac23$ folgt $P'\left(-\tfrac13 \mid \tfrac83 \mid \tfrac53\right)$. [In der Simulation zeigen](?mode=pd&mir=1)

</details>

### Aufgabe 5: Parallele Ebenen

Zeige, dass $E\colon x_1 + x_2 + x_3 = 1$ und $F\colon x_1 + x_2 + x_3 = 4$ parallel sind, und berechne ihren Abstand. [Aufgabe laden](?mode=pp&n1=1&n2=1&n3=1&c=1&m1=1&m2=1&m3=1&k=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Gleiche Normalenvektoren, verschiedene rechte Seiten: echt parallel. Der Punkt $Q(1 \mid 0 \mid 0)$ liegt in $E$, also $d = \dfrac{|1 + 0 + 0 - 4|}{\sqrt 3} = \dfrac{3}{\sqrt 3} = \sqrt 3 \approx 1{,}73$. [In der Simulation zeigen](?mode=pp&n1=1&n2=1&n3=1&c=1&m1=1&m2=1&m3=1&k=4)

</details>

### Aufgabe 6: Schnittgerade und Schnittwinkel

Bestimme eine Gleichung der Schnittgeraden von $E\colon 2x_1 - x_2 + 2x_3 = 3$ und $F\colon x_1 + x_2 = 1$ sowie den Schnittwinkel. [Aufgabe laden](?mode=pp&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Richtung $\vec n \times \vec m = \begin{pmatrix} 2 \\ -1 \\ 2 \end{pmatrix} \times \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix} = \begin{pmatrix} -2 \\ 2 \\ 3 \end{pmatrix}$. Ein gemeinsamer Punkt: $x_2 = 0$ ergibt $x_1 = 1$ und $2 + 2x_3 = 3$, also $x_3 = 0{,}5$. Damit $s\colon \vec x = \begin{pmatrix} 1 \\ 0 \\ 0{,}5 \end{pmatrix} + t \cdot \begin{pmatrix} -2 \\ 2 \\ 3 \end{pmatrix}$ (die Simulation wählt einen anderen Stützpunkt derselben Geraden). Winkel: $\cos \varphi = \dfrac{|2 - 1 + 0|}{3 \cdot \sqrt 2} \approx 0{,}236$, $\varphi \approx 76{,}4°$. [In der Simulation zeigen](?mode=pp)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe, analytische Geometrie: Geraden und Ebenen im Raum. Gut als Einstieg in die Lagebeziehungen oder zur Wiederholung vor dem Abitur.
- **Entscheidungsbaum als Rechenplan:** Die Fragen im Baum entsprechen genau den Rechenschritten (Richtungen vergleichen, Gleichungssystem lösen, Einsetzen). Man kann die Klasse den Pfad zuerst vorhersagen lassen und dann die Animation abspielen.
- **Besondere Blickrichtungen:** Die Kantenansicht macht sichtbar, warum Abstände und Winkel „in wahrer Größe“ erscheinen, wenn man parallel zu einer Ebene schaut – eine Brücke zur darstellenden Geometrie.
- **Aufgabenmodus:** Mit „Ergebnisse anzeigen“ aus und verdeckten Ergebnissen rechnen die Lernenden zuerst selbst und kontrollieren dann im Bild.
- **Häufige Stolpersteine:**
  - Windschiefe Geraden werden für „schneidend“ gehalten, weil sie sich im Schrägbild zu kreuzen scheinen – das Drehen der Ansicht klärt das schnell.
  - Beim Winkel Gerade – Ebene wird der Kosinus statt des Sinus verwendet (der Normalenvektor steht senkrecht auf der Ebene).
  - Die Parameter $t$ und $s$ werden beim Gleichsetzen gleich benannt.
  - In der Hesse-Normalform werden die Betragsstriche oder die Division durch $|\vec n|$ vergessen.
