---
description: Interaktive Simulation zu Bewegungsdiagrammen – ein Auto fährt gleichförmig, beschleunigt oder nach Fahrplan, und live entstehen t-s-, t-v- und t-a-Diagramm mit Steigungsdreieck und Fläche unter dem Graphen.
---

## Worum geht es?

Eine Bewegung beschreibt man mit dem **Ort** $s$ (gemessen an einem Maßband) zu jeder **Zeit** $t$. Trägt man $s$ über $t$ auf, erhält man das **t-s-Diagramm**. Die **Geschwindigkeit** gibt an, wie schnell sich der Ort ändert:

$$
v = \frac{\Delta s}{\Delta t} \qquad 1\,\tfrac{\text{m}}{\text{s}} = 3{,}6\,\tfrac{\text{km}}{\text{h}}
$$

**Gleichförmige Bewegung:** Die Geschwindigkeit ist konstant. In gleichen Zeiten legt das Auto gleiche Strecken zurück:

$$
s(t) = s_0 + v \cdot t
$$

Im t-s-Diagramm entsteht eine **Gerade** – ihre **Steigung** ist die Geschwindigkeit. Im t-v-Diagramm ist es eine waagerechte Linie. Die **Fläche** unter dem t-v-Graphen (ein Rechteck $v \cdot t$) ist die Ortsänderung $\Delta s$.

**Gleichmäßig beschleunigte Bewegung:** Die Geschwindigkeit ändert sich in gleichen Zeiten um gleich viel. Die **Beschleunigung** ist

$$
a = \frac{\Delta v}{\Delta t}, \qquad v(t) = v_0 + a \cdot t, \qquad s(t) = s_0 + v_0 \cdot t + \tfrac{1}{2}\, a \cdot t^2 .
$$

Das t-v-Diagramm ist jetzt eine schräge Gerade mit der Steigung $a$, das t-s-Diagramm eine **Parabel**. Die momentane Geschwindigkeit ist die Steigung der **Tangente** an die Parabel. Fährt das Auto aus dem Stand los, verhalten sich die Strecken in aufeinanderfolgenden gleichen Zeitabschnitten wie $1 : 3 : 5 : 7 : \ldots$ – das zeigt das Stroboskop.

**Bremsen bis zum Stillstand:** Bei der Anfangsgeschwindigkeit $v_0$ und der Bremsverzögerung $|a|$ dauert das Bremsen $t_B = \frac{v_0}{|a|}$, der **Bremsweg** ist $s_B = \frac{v_0^2}{2\,|a|}$. Doppelte Geschwindigkeit bedeutet also **vierfachen** Bremsweg.

## Ausprobieren

1. Drücke **Losfahren** und beobachte das Stroboskop: Bei gleichförmiger Bewegung sind die Abstände gleich groß. Vergleiche mit dem Steigungsdreieck im t-s-Diagramm.
2. Lass das Auto rückwärts fahren. Wie sehen jetzt t-s- und t-v-Diagramm aus? [Rückwärts fahren](?v=-5&s0=50)
3. Fahre mit $a = 2\,\tfrac{\text{m}}{\text{s}^2}$ an. Wie wachsen die Abstände im Stroboskop? [Anfahren](?mode=acc)
4. Ziehe die **Zeitmarke** (Dreieck oben im t-s-Diagramm) hin und her. Vergleiche die Steigung der Tangente mit dem Wert im t-v-Diagramm.
5. Wähle den **Fahrplan** und ziehe die Eckpunkte des t-v-Graphen. Beobachte, wie sich das t-s-Diagramm verändert. [Fahrplan](?mode=plan)
6. Schalte „Graphen schon vor der Fahrt zeigen“ aus und **sage vorher**, wie die Diagramme aussehen werden. Starte erst dann. [Vorhersage](?mode=acc&v0=20&a=-4&T=8&pre=0)

## Aufgaben

### Aufgabe 1: Strecke bei konstanter Geschwindigkeit

Ein Auto fährt gleichförmig mit $54\,\tfrac{\text{km}}{\text{h}}$. Welche Strecke legt es in $8\,\text{s}$ zurück? [Aufgabe laden](?v=15&T=8&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$54\,\tfrac{\text{km}}{\text{h}} = 54 : 3{,}6\,\tfrac{\text{m}}{\text{s}} = 15\,\tfrac{\text{m}}{\text{s}}$, also $\Delta s = v \cdot \Delta t = 15\,\tfrac{\text{m}}{\text{s}} \cdot 8\,\text{s} = 120\,\text{m}$. Das ist die Rechteckfläche unter dem t-v-Graphen.

</details>

### Aufgabe 2: Diagramm ablesen

Lade die Aufgabe und lies im t-s-Diagramm ab: Wo startet das Auto, wie schnell fährt es und wann kommt es an der Stelle $s = 0$ vorbei? [Aufgabe laden](?v=12.5&s0=-50&T=12&slope=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Startort $s_0 = -50\,\text{m}$. Nach $12\,\text{s}$ ist das Auto bei $100\,\text{m}$, also $v = \frac{150\,\text{m}}{12\,\text{s}} = 12{,}5\,\tfrac{\text{m}}{\text{s}}$. Bei $s = 0$ ist es nach $t = \frac{50\,\text{m}}{12{,}5\,\text{m/s}} = 4\,\text{s}$ (Schnittpunkt mit der t-Achse).

</details>

### Aufgabe 3: Anfahren

Ein Auto beschleunigt aus dem Stand gleichmäßig mit $a = 2{,}5\,\tfrac{\text{m}}{\text{s}^2}$. Wie schnell ist es nach $6\,\text{s}$, welche Strecke hat es dann zurückgelegt? Wie lange braucht es auf $100\,\tfrac{\text{km}}{\text{h}}$? [Aufgabe laden](?mode=acc&a=2.5&T=12&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v = a \cdot t = 2{,}5 \cdot 6\,\tfrac{\text{m}}{\text{s}} = 15\,\tfrac{\text{m}}{\text{s}}$ und $s = \tfrac12 \cdot 2{,}5 \cdot 6^2\,\text{m} = 45\,\text{m}$ (Dreiecksfläche unter dem t-v-Graphen). $100\,\tfrac{\text{km}}{\text{h}} \approx 27{,}8\,\tfrac{\text{m}}{\text{s}}$, also $t = \frac{27{,}8}{2{,}5}\,\text{s} \approx 11{,}1\,\text{s}$.

</details>

### Aufgabe 4: Bremsweg

Ein Auto fährt mit $20\,\tfrac{\text{m}}{\text{s}}$ ($72\,\tfrac{\text{km}}{\text{h}}$) und bremst mit $a = -5\,\tfrac{\text{m}}{\text{s}^2}$. Wie lang ist der Bremsweg? Wie lang wäre er bei doppelter Geschwindigkeit? [Aufgabe laden](?mode=acc&v0=20&a=-5&T=6&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$s_B = \frac{v_0^2}{2\,|a|} = \frac{(20\,\text{m/s})^2}{2 \cdot 5\,\text{m/s}^2} = 40\,\text{m}$ nach $t_B = 4\,\text{s}$. Bei $40\,\tfrac{\text{m}}{\text{s}}$ sind es $160\,\text{m}$ – der **vierfache** Bremsweg. [Doppelte Geschwindigkeit](?mode=acc&v0=40&a=-5&T=10&_hide=1)

</details>

### Aufgabe 5: Fahrplan auswerten

Ein Auto fährt in $5\,\text{s}$ aus dem Stand auf $15\,\tfrac{\text{m}}{\text{s}}$, fährt dann $10\,\text{s}$ gleichförmig und bremst in $5\,\text{s}$ bis zum Stillstand. Berechne die Beschleunigungen, die Teilstrecken, die Gesamtstrecke und die Durchschnittsgeschwindigkeit. [Aufgabe laden](?mode=plan&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$a_1 = 3\,\tfrac{\text{m}}{\text{s}^2}$, $a_2 = 0$, $a_3 = -3\,\tfrac{\text{m}}{\text{s}^2}$. Flächen unter dem t-v-Graphen: $37{,}5\,\text{m} + 150\,\text{m} + 37{,}5\,\text{m} = 225\,\text{m}$. Durchschnittsgeschwindigkeit $\bar v = \frac{225\,\text{m}}{20\,\text{s}} = 11{,}25\,\tfrac{\text{m}}{\text{s}}$.

</details>

### Aufgabe 6: Weg oder Ortsänderung?

Im Beispiel „Hin und zurück“ steht das Auto am Ende wieder am Start. Wie groß sind Ortsänderung und zurückgelegter Weg? Welche Beschleunigung hat das Auto im Umkehrpunkt bei $t = 8\,\text{s}$? [Aufgabe laden](?mode=plan&v1=8&t1=4&v2=-8&t2=8&v3=0&t3=4&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ortsänderung $\Delta s = 0$ (die Flächen über und unter der t-Achse heben sich auf), zurückgelegter Weg $4 \cdot 16\,\text{m} = 64\,\text{m}$. Im Umkehrpunkt ist $v = 0$, aber $a = -2\,\tfrac{\text{m}}{\text{s}^2}$ – das Auto steht nur einen Augenblick.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Gleichförmige Bewegung, Geschwindigkeit und t-s-Diagramm im Anfangsunterricht Mechanik (etwa Klasse 7/8); gleichmäßig beschleunigte Bewegung, t-v-Diagramm und Bremsweg in Klasse 9/10. Die Diagramme lassen sich einzeln ausblenden, das t-a-Diagramm z. B. für jüngere Klassen.
- **Bezeichnungen:** Die Simulation nennt den Ort $s$; viele Lehrwerke schreiben $x$ und sprechen vom **Zeit-Ort-Diagramm**. Ortsänderung $\Delta s$ (mit Vorzeichen) und zurückgelegter Weg (immer positiv) werden unterschieden.
- **Modell:** Das Auto wird als Massepunkt behandelt (weißer Messpunkt, Lot auf das Maßband); gezeichnet ist es größer als maßstäblich. Beim Bremsen hält es bei $v = 0$ an und fährt nicht von selbst rückwärts. Im Fahrplan ändert sich die Geschwindigkeit in jedem Abschnitt gleichmäßig; die Sprünge im t-a-Diagramm sind idealisiert.
- **Vorhersagen:** Mit „Graphen schon vor der Fahrt zeigen“ aus und `_hide=1` können Lernende die Diagramme erst skizzieren und dann überprüfen.
- **Typische Fehlvorstellungen:**
  - Das t-s-Diagramm wird als Bild der Bahn gelesen („das Auto fährt bergauf“).
  - „Hoch im t-v-Diagramm heißt weit weg“ – tatsächlich zählt die **Fläche** unter dem Graphen.
  - „Bei $v = 0$ ist auch $a = 0$“ – im Umkehrpunkt (Aufgabe 6) stimmt das nicht.
  - Steigung und Wert werden verwechselt: Ein flacher, aber hoher t-s-Graph bedeutet langsam, nicht schnell.
