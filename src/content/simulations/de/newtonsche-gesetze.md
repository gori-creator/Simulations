## Worum geht es?

Isaac Newton hat die Mechanik in drei Gesetzen zusammengefasst. Die Simulation zeigt zu jedem einen Versuch. Außerdem gibt es die resultierende Kraft mit Haft- und Gleitreibung, die Waage im Aufzug als Beispiel aus dem Alltag, eine Messreihe zur Grundgleichung und Übungsaufgaben.

### 1. Trägheitsgesetz

> Ein Körper bleibt in Ruhe oder bewegt sich geradlinig mit gleichbleibender Geschwindigkeit, solange keine Kraft auf ihn wirkt.

Jeder Körper ist **träge**: Er „will“ seinen Bewegungszustand beibehalten. Bremst ein Lastwagen scharf, fährt die lose Kiste auf der Ladefläche erst einmal weiter – nur die Reibung bremst sie, und die reicht oft nicht. Darum gibt es **Sicherheitsgurte** und Ladungssicherung: Der Gurt übt die nötige Kraft aus, damit die Kiste (oder der Mensch) mit abgebremst wird.

### 2. Grundgleichung der Mechanik

> Die Beschleunigung eines Körpers ist proportional zur Kraft und umgekehrt proportional zu seiner Masse.

$$
F = m \cdot a
$$

Im Versuch zieht ein Gewicht über eine Rolle an einem Wagen. Die Zugkraft $F = m_Z \cdot g$ muss **beide** Massen beschleunigen, den Wagen und das Zuggewicht:

$$
a = \frac{m_Z \cdot g}{m_W + m_Z}
$$

Die Krafteinheit ergibt sich daraus: $1\,\text{N} = 1\,\text{kg} \cdot \frac{\text{m}}{\text{s}^2}$.

Gibt es **Reibung**, zieht man die Reibungskraft $\mu \cdot m_W \cdot g$ ab. In vielen Rechnungen lässt man sie weg und betrachtet den Wagen als **Massepunkt** – eine **Idealisierung**, die man mit der Simulation überprüfen kann.

### 3. Wechselwirkungsprinzip

> Übt ein Körper A eine Kraft auf B aus, so übt B eine gleich große, entgegengesetzte Kraft auf A aus („actio = reactio“).

Die gespannte Feder drückt beide Wagen mit **gleich großer** Kraft auseinander. Der leichtere Wagen wird dabei stärker beschleunigt. Danach gilt $m_1 \cdot v_1 = -m_2 \cdot v_2$.

### Kräfte und Bewegung: die resultierende Kraft

Wirken mehrere Kräfte auf einen Körper, zählt ihre Summe, die **resultierende Kraft** $F_\text{res}$. Ist sie null, ändert sich die Bewegung nicht (Trägheitsgesetz); sonst gilt $F_\text{res} = m \cdot a$.

Beim Schieben einer Kiste wirkt die **Reibung** gegen die Bewegung:

- **Haftreibung:** Solange die Kiste ruht, hält die Reibung genau dagegen – höchstens mit $F_\text{H} = \mu_\text{H} \cdot m \cdot g$. Ist die Schubkraft kleiner, bleibt die Kiste stehen.
- **Gleitreibung:** Rutscht die Kiste, bremst $F_\text{G} = \mu_\text{G} \cdot m \cdot g$. Meist ist $\mu_\text{G} < \mu_\text{H}$: Wenn die Kiste einmal rutscht, geht es leichter.

Schiebt man genau mit der Gleitreibungskraft, ist $F_\text{res} = 0$ – die Kiste fährt **gleichförmig**. Hört man auf zu schieben, bremst nur noch die Reibung. Ohne Reibung (auf glattem Eis) würde sie immer weiterfahren.

Gewichtskraft $F_G$ und Normalkraft $F_N$ heben sich auf dem waagerechten Boden auf. Im **Kräfteplan** zeichnet man alle Kräfte an einem Punkt.

### Alltag: die Waage im Aufzug

Eine Personenwaage misst, wie stark sie gedrückt wird: die **Normalkraft** $F_N$. In Ruhe ist $F_N = m \cdot g$, und die Waage zeigt die Masse an. Beschleunigt der Aufzug mit $a$ nach oben, muss der Boden die Person mitbeschleunigen:

$$
F_N = m \cdot (g + a)
$$

Beim Anfahren nach oben (und beim Bremsen auf der Fahrt nach unten) zeigt die Waage **mehr**, beim Bremsen nach oben (und Anfahren nach unten) **weniger**. Bei gleichförmiger Fahrt zeigt sie den normalen Wert – auch wenn der Aufzug schnell ist. Reißt das Seil, fallen Person und Waage gleich schnell ($a = -g$): Die Waage zeigt null, die Person ist **schwerelos**. So trainieren auch Astronautinnen und Astronauten im Parabelflug.

### Messreihe: a ~ F und a ~ 1/m

Mit zwei Lichtschranken misst man die Zeit $t$, die ein Wagen aus der Ruhe für die Strecke $s$ braucht, und berechnet $a = \frac{2s}{t^2}$.

- **Masse fest, Kraft verändern:** Die Punkte im a-F-Diagramm liegen auf einer Ursprungsgeraden. Ihre Steigung ist $\frac{1}{m}$.
- **Kraft fest, Masse verändern:** Trägt man $a$ über $\frac{1}{m}$ auf, liegen die Punkte wieder auf einer Ursprungsgeraden, die Steigung ist $F$.

Zusammen ergibt das $a = \frac{F}{m}$. Kleine Abweichungen von der Geraden kommen von Messfehlern beim Stoppen der Zeit.

## Ausprobieren

- [Lose Kiste](?mode=traeg&gurt=0) und [festgeschnallt](?mode=traeg&gurt=1): Drücke „Start“. Vergleiche die Geschwindigkeiten im Diagramm.
- [F = m · a](?mode=grund&mc=0.5&mh=0.1&mu=0): Das v-t-Diagramm ist eine Gerade – die Beschleunigung ist konstant.
- [Doppelte Wagenmasse](?mode=grund&mc=1&mh=0.1&mu=0): Wird die Beschleunigung halb so groß?
- [Mit Reibung](?mode=grund&mu=0.1): Wie stark weicht das Ergebnis von der Idealisierung ab?
- [Abstoßen](?mode=wechsel&m1=1&m2=2): Welcher Wagen ist schneller?
- [Kiste schieben: zu schwach](?mode=kraft&fs=150&mk=40&muh=0.5&mug=0.3&toff=3): Drücke „Start“. Warum bewegt sich nichts? Erhöhe die Schubkraft, bis die Kiste rutscht.
- [Gleichförmig](?mode=kraft&fs=120&mk=40&muh=0.3&mug=0.3&toff=8): Schub und Reibung sind gleich groß – die Kiste fährt mit fester Geschwindigkeit.
- [Auf Eis](?mode=kraft&fs=40&mk=40&muh=0&mug=0&toff=2): Was passiert, nachdem der Schub endet?
- [Aufzug nach oben](?mode=aufzug&pm=60&ldir=up&la=1.5) und [nach unten](?mode=aufzug&pm=60&ldir=down&la=1.5): Wann zeigt die Waage mehr, wann weniger?
- [Seil reißt](?mode=aufzug&pm=60&fall=1): Was zeigt die Waage im freien Fall?
- [Messreihe a ~ F](?mode=mess&mr=F&mf=0.5&mw=0.5): Miss bei vier verschiedenen Kräften. Vergleiche die Steigung mit $\frac{1}{m}$.
- [Messreihe a ~ 1/m](?mode=mess&mr=m&mf=0.5&mw=0.5): Miss bei vier verschiedenen Massen.
- [Üben](?mode=ueben&qn=1): Neun Aufgaben zu allen drei Gesetzen.

## Aufgaben

**1. Beschleunigung berechnen.** Ein Wagen ($0{,}5\,\text{kg}$) wird reibungsfrei von einem Zuggewicht mit $100\,\text{g}$ gezogen. Berechne die Beschleunigung und die Zeit für $1{,}6\,\text{m}$. [Aufgabe laden](?mode=grund&mc=0.5&mh=0.1&mu=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$a = \frac{0{,}1 \cdot 9{,}81}{0{,}5 + 0{,}1}\,\frac{\text{m}}{\text{s}^2} \approx 1{,}64\,\frac{\text{m}}{\text{s}^2}$. Aus $s = \frac{1}{2} a t^2$ folgt $t = \sqrt{\frac{2 \cdot 1{,}6}{1{,}64}}\,\text{s} \approx 1{,}40\,\text{s}$.

</details>

**2. Doppelte Masse, halbe Beschleunigung?** Verdopple die Wagenmasse auf $1\,\text{kg}$. Warum halbiert sich die Beschleunigung nicht genau? [Aufgabe laden](?mode=grund&mc=1&mh=0.1&mu=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$a = \frac{0{,}981}{1{,}1} \approx 0{,}89\,\frac{\text{m}}{\text{s}^2}$ statt $0{,}82$. Die Zugkraft beschleunigt auch das Zuggewicht selbst; die Gesamtmasse steigt von 0,6 kg auf 1,1 kg, nicht auf das Doppelte.

</details>

**3. Kiste auf der Ladefläche.** Der Lastwagen bremst mit $8\,\frac{\text{m}}{\text{s}^2}$. Die Reibungszahl zwischen Kiste und Ladefläche ist $0{,}3$. Mit welcher Verzögerung wird die Kiste gebremst? Was folgt daraus? [Aufgabe laden](?mode=traeg&gurt=0&mub=0.3&_hide=1)

<details><summary>Lösung anzeigen</summary>

Die Reibung kann höchstens $\mu \cdot g = 0{,}3 \cdot 9{,}81\,\frac{\text{m}}{\text{s}^2} \approx 2{,}9\,\frac{\text{m}}{\text{s}^2}$ bewirken. Die Kiste wird also langsamer gebremst als der Wagen und rutscht nach vorn, bis sie gegen die Stirnwand prallt. Ladung muss gesichert werden.

</details>

**4. Abstoßen.** Eine Feder drückt einen 1-kg- und einen 2-kg-Wagen auseinander. Der leichte Wagen fährt danach mit $2\,\frac{\text{m}}{\text{s}}$. Wie schnell ist der schwere? [Aufgabe laden](?mode=wechsel&m1=1&m2=2&F=20&_hide=1)

<details><summary>Lösung anzeigen</summary>

Beide erfahren gleich große Kräfte gleich lange, also gleich große, entgegengesetzte Impulse: $1\,\text{kg} \cdot 2\,\frac{\text{m}}{\text{s}} = 2\,\text{kg} \cdot v_2$, also $v_2 = 1\,\frac{\text{m}}{\text{s}}$ in die Gegenrichtung.

</details>

**5. Die Kiste rutscht.** Eine Kiste ($40\,\text{kg}$) wird mit $250\,\text{N}$ geschoben. Haftreibungszahl $0{,}5$, Gleitreibungszahl $0{,}3$. Bewegt sie sich? Wenn ja, mit welcher Beschleunigung? ($g = 9{,}81\,\frac{\text{m}}{\text{s}^2}$) [Aufgabe laden](?mode=kraft&fs=250&mk=40&muh=0.5&mug=0.3&toff=3&_hide=1)

<details><summary>Lösung anzeigen</summary>

Die Haftreibung hält höchstens $0{,}5 \cdot 40 \cdot 9{,}81\,\text{N} \approx 196\,\text{N}$ – die $250\,\text{N}$ sind größer, die Kiste rutscht. Dann bremst die Gleitreibung $0{,}3 \cdot 40 \cdot 9{,}81\,\text{N} \approx 118\,\text{N}$. $F_\text{res} \approx 132\,\text{N}$, also $a = \frac{132}{40}\,\frac{\text{m}}{\text{s}^2} \approx 3{,}3\,\frac{\text{m}}{\text{s}^2}$.

</details>

**6. Gleichförmig schieben.** Mit welcher Kraft muss man die rutschende Kiste aus Aufgabe 5 schieben, damit sie gleichförmig fährt? [Aufgabe laden](?mode=kraft&fs=120&mk=40&muh=0.3&mug=0.3&toff=8&_hide=1)

<details><summary>Lösung anzeigen</summary>

Genau so stark wie die Gleitreibung: $F = 0{,}3 \cdot 40 \cdot 9{,}81\,\text{N} \approx 118\,\text{N}$. Dann ist $F_\text{res} = 0$, und nach dem Trägheitsgesetz bleibt die Geschwindigkeit gleich.

</details>

**7. Waage im Aufzug.** Eine Person mit $60\,\text{kg}$ steht im Aufzug auf einer Waage. Der Aufzug fährt mit $1{,}5\,\frac{\text{m}}{\text{s}^2}$ nach oben an. Was zeigt die Waage? Was zeigt sie beim Bremsen? [Aufgabe laden](?mode=aufzug&pm=60&ldir=up&la=1.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$F_N = 60 \cdot (9{,}81 + 1{,}5)\,\text{N} \approx 679\,\text{N}$, die Waage zeigt $\frac{679}{9{,}81}\,\text{kg} \approx 69\,\text{kg}$. Beim Bremsen: $60 \cdot (9{,}81 - 1{,}5)\,\text{N} \approx 499\,\text{N}$, Anzeige etwa $51\,\text{kg}$.

</details>

**8. Messreihe auswerten.** Bei fester Masse misst man: $F = 0{,}5\,\text{N}$: $a = 1{,}0\,\frac{\text{m}}{\text{s}^2}$; $F = 1{,}0\,\text{N}$: $a = 2{,}0\,\frac{\text{m}}{\text{s}^2}$; $F = 1{,}5\,\text{N}$: $a = 3{,}0\,\frac{\text{m}}{\text{s}^2}$. Wie groß ist die Masse des Wagens? [Aufgabe laden](?mode=mess&mr=F&mf=0.5&mw=0.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

Die Punkte liegen auf einer Ursprungsgeraden mit Steigung $2\,\frac{1}{\text{kg}}$. Diese Steigung ist $\frac{1}{m}$, also $m = 0{,}5\,\text{kg}$.

</details>

## Ideen für den Unterricht

- **Alltag:** Warum kippt man in einem anfahrenden Bus nach hinten? Warum braucht ein voll beladener Lastwagen einen längeren Bremsweg?
- **Messen:** Den Fahrbahnversuch real mit Lichtschranken durchführen und die Messwerte mit der Simulation vergleichen.
- **Aufzug selbst messen:** Mit einer Personenwaage (oder der Beschleunigungs-App eines Handys) im echten Aufzug fahren und die Anzeige beim Anfahren und Bremsen notieren.
- **Häufiger Fehler:** Wer gleichförmig fährt, braucht keine resultierende Kraft – die Kraft ist nicht „für die Geschwindigkeit“ da, sondern für deren Änderung.
- **Häufiger Fehler:** Die Kräfte beim Wechselwirkungsprinzip wirken auf **verschiedene** Körper – sie heben sich deshalb nicht auf.
