---
description: "Interaktive Simulation zu Licht und Schatten – Kern- und Halbschatten mit Randstrahlen auf der optischen Bank, farbige Schatten sowie Sonnen- und Mondfinsternis im Modell."
---

## Worum geht es?

Licht breitet sich **geradlinig** aus. Im Modell zeichnet man das mit **Lichtstrahlen**. Trifft Licht auf einen undurchsichtigen Gegenstand, bleibt der Raum dahinter dunkel: Es entsteht ein **Schattenraum** und auf einem Schirm ein **Schattenbild**.

Die Grenzen des Schattens findet man mit **Randstrahlen**: Strahlen, die vom Rand der Lichtquelle gerade am Rand des Gegenstands vorbeigehen.

- **Punktförmige Lichtquelle:** Der Schatten ist scharf begrenzt. Dorthin kommt überhaupt kein Licht – das ist **Kernschatten**.
- **Ausgedehnte Lichtquelle:** Jeder Punkt der Lampe wirft seinen eigenen Schatten. Wo von **keiner** Stelle der Lampe Licht ankommt, ist Kernschatten. Ringsum liegt der **Halbschatten**: Von dort sieht man noch einen Teil der Lampe, der Schattenrand wird unscharf.
- **Zwei Lampen:** Jede Lampe erzeugt einen eigenen Schatten. Wo nur eine Lampe verdeckt ist, ist Halbschatten, wo sich beide Schatten überlappen, Kernschatten.
- **Farbige Lampen:** Eine rote und eine grüne Lampe beleuchten den Schirm zusammen **gelb** (additive Farbmischung). Im Schatten der roten Lampe kommt nur grünes Licht an – der Schatten ist grün, und umgekehrt.

**Schattengröße.** Bei einer punktförmigen Lampe ist der Schatten eine vergrößerte Zentralprojektion des Gegenstands. Mit dem Abstand $a$ von der Lampe zum Gegenstand und dem Abstand $b$ von der Lampe zum Schirm gilt

$$
\frac{S}{G} = \frac{b}{a} \qquad\text{also}\qquad S = G \cdot \frac{b}{a}.
$$

Je näher der Gegenstand an der Lampe steht, desto größer wird sein Schatten.

**Finsternisse.** Sonne, Erde und Mond werfen ebenfalls Schatten, nur sehr lange. Bei **Neumond** kann der Mond zwischen Sonne und Erde stehen: Wo sein Kernschatten die Erde trifft, ist eine **totale Sonnenfinsternis**, im Halbschatten eine **partielle**. Reicht der Kernschatten nicht ganz bis zur Erde, sieht man eine **ringförmige** Sonnenfinsternis. Bei **Vollmond** kann der Mond in den Schatten der Erde geraten: **Mondfinsternis**. Im Kernschatten wird der Mond nicht schwarz, sondern dunkel kupferrot, weil die Lufthülle der Erde etwas rotes Sonnenlicht in den Schatten lenkt.

## Ausprobieren

1. Ziehe die Scheibe (Gegenstand) näher an die Lampe und wieder weg. Wie ändert sich der Schatten? [Scheibe nah an der Lampe](?ox=20)
2. Schalte auf die ausgedehnte Lampe um und schiebe den Schirm dicht an die Scheibe. Was passiert mit dem Halbschatten? [Ausgedehnte Lampe, Schirm nah](?src=wide&sx=55)
3. Eine große Lampe und eine kleine Scheibe: Wo bleibt der Kernschatten? Verfolge die Randstrahlen. [Großer Leuchtkörper](?src=wide&ld=16&od=4)
4. Zwei Lampen: Verschiebe eine Lampe nach oben oder unten, bis die beiden Schatten nicht mehr überlappen. [Zwei Lampen](?src=two&ly=-5&my=5)
5. Farbige Schatten: Welche Farbe hat der Schatten jeder Lampe? [Rote und grüne Lampe](?src=two&col=1&ly=-5&my=5)
6. Sonnenfinsternis: Ziehe den Beobachter über die Tagseite der Erde. Wo ist die Finsternis total, wo partiell? [Totale Sonnenfinsternis](?mode=space) · [Ringförmige Sonnenfinsternis](?mode=space&pos=13&ob=64)
7. Drücke **Abspielen**: Der Mond läuft um die Erde. Achte auf die Mondphasen und darauf, wann der Mond in den Erdschatten gerät. [Mondfinsternis](?mode=space&pos=170&slow=1)

## Aufgaben

### Aufgabe 1: Wie groß wird der Schatten?

Eine punktförmige Lampe steht bei $10\,\text{cm}$, eine Scheibe mit $G = 8\,\text{cm}$ Durchmesser bei $30\,\text{cm}$ und der Schirm bei $90\,\text{cm}$. Berechne die Größe des Schattens. [Aufgabe laden](?lx=10&ox=30&od=8&sx=90&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$a = 30\,\text{cm} - 10\,\text{cm} = 20\,\text{cm}$, $b = 90\,\text{cm} - 10\,\text{cm} = 80\,\text{cm}$.

$S = G \cdot \frac{b}{a} = 8\,\text{cm} \cdot \frac{80}{20} = 32\,\text{cm}$. Der Schatten ist viermal so groß wie die Scheibe. [In der Simulation zeigen](?lx=10&ox=30&od=8&sx=90)

</details>

### Aufgabe 2: Doppelt so groß

Die Lampe steht bei $0\,\text{cm}$, der Schirm bei $80\,\text{cm}$. Wohin muss die Scheibe, damit ihr Schatten genau doppelt so groß ist wie sie selbst? [Aufgabe laden](?lx=0&sx=80&ox=20&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Aus $\frac{S}{G} = \frac{b}{a} = 2$ folgt $a = \frac{b}{2} = 40\,\text{cm}$: genau in die Mitte zwischen Lampe und Schirm. [In der Simulation zeigen](?lx=0&sx=80&ox=40)

</details>

### Aufgabe 3: Kern- und Halbschatten

Eine Milchglaslampe mit $d = 8\,\text{cm}$ steht bei $10\,\text{cm}$, eine Scheibe mit $G = 10\,\text{cm}$ bei $40\,\text{cm}$, der Schirm bei $100\,\text{cm}$. Wie groß sind Kernschatten und gesamter Schatten? Tipp: Zeichne die vier Randstrahlen. [Aufgabe laden](?src=wide&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Mit $a = 30\,\text{cm}$ und $b = 90\,\text{cm}$: Die Randstrahlen „oben → oben“ und „unten → unten“ begrenzen den Kernschatten, die gekreuzten Randstrahlen den Halbschatten.

$S_\text{Kern} = \frac{G \cdot b - d \cdot (b-a)}{a} = \frac{900 - 480}{30}\,\text{cm} = 14\,\text{cm}$, $\quad S_\text{außen} = \frac{900 + 480}{30}\,\text{cm} = 46\,\text{cm}$.

Der Halbschatten ist also ein Ring, der $16\,\text{cm}$ breit ist.

</details>

### Aufgabe 4: Farbige Schatten

Eine rote und eine grüne Lampe beleuchten eine Scheibe. Erkläre, warum der Schirm gelb ist, warum es einen grünen und einen roten Schatten gibt und warum die Mitte schwarz ist. [Aufgabe laden](?src=two&col=1&ly=-5&my=5)

<details>
<summary>Lösung anzeigen</summary>

Wo beide Lampen hinscheinen, mischt sich rotes und grünes Licht zu Gelb. Im Schatten der roten Lampe kommt nur das Licht der grünen Lampe an, er ist also grün – und umgekehrt. In der Mitte sind beide Lampen verdeckt: Kernschatten, dort ist es dunkel.

</details>

### Aufgabe 5: Wer sieht die Finsternis?

Warum kann man eine totale Sonnenfinsternis nur in einem schmalen Gebiet der Erde sehen, eine Mondfinsternis aber von der ganzen Nachtseite der Erde aus? [Aufgabe laden](?mode=space)

<details>
<summary>Lösung anzeigen</summary>

Der Kernschatten des Mondes reicht gerade eben bis zur Erde und trifft dort nur ein kleines Gebiet; nur dort ist die Sonne ganz verdeckt. Bei der Mondfinsternis wird der Mond selbst verdunkelt – das sieht jeder, für den der Mond gerade über dem Horizont steht. [Mondfinsternis zeigen](?mode=space&pos=180)

</details>

### Aufgabe 6: Warum nicht jeden Monat?

In der Simulation gibt es bei jedem Neumond eine Sonnenfinsternis. In Wirklichkeit gibt es nur wenige Finsternisse im Jahr. Woran liegt das?

<details>
<summary>Lösung anzeigen</summary>

Die Bahn des Mondes ist um etwa $5^\circ$ gegen die Bahn der Erde um die Sonne geneigt. Meist läuft der Mond bei Neumond knapp über oder unter der Linie Sonne–Erde vorbei, und sein Schatten verfehlt die Erde. Nur wenn Neumond (bzw. Vollmond) in die Nähe der Schnittpunkte der beiden Bahnen fällt, gibt es eine Finsternis. Die Simulation zeigt die Bahnen von oben und lässt die Neigung weg.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Optik im Anfangsunterricht (Lichtausbreitung, Schatten, Finsternisse); am bayerischen Gymnasium im Physikunterricht der Jahrgangsstufe 7 (Zuordnung als Entwurf, bitte mit dem LehrplanPLUS abgleichen). Geeignet als Einstieg, zum Üben der Randstrahlen-Konstruktion und als Vertiefung mit Finsternissen und Mondphasen.
- **Modell:** Lampe und Gegenstand sind runde Scheiben parallel zum Schirm (die Milchglaslampe wird als leuchtende Scheibe mit Durchmesser $d$ gerechnet). Die Halter werfen keinen Schatten. Die Helligkeit auf dem Schirm berücksichtigt Abstand und Schräglage; das Lichtbündel ist sichtbar gezeichnet, als stünde etwas Dunst im Raum.
- **Finsternisse:** Das Modell ist schematisch und nicht maßstäblich. Sonne und Mond erscheinen von der Erde aus (wie in Wirklichkeit) etwa gleich groß, Abstände und Größen sind aber stark verändert, und die Bahnneigung fehlt. Man blickt von Norden auf die Bahnebene; der Ort des Beobachters auf dem Erdumfang entspricht der Tageszeit.
- **Typische Fehlvorstellungen:**
  - „Der Schatten ist ein dunkles Abbild, das vom Gegenstand ausgeht.“ – Schatten ist der Bereich, in den kein (oder weniger) Licht gelangt.
  - „Rückt der Gegenstand näher an die Lampe, wird der Schatten kleiner.“ – Er wird größer, siehe $S = G \cdot \frac{b}{a}$.
  - „Halbschatten heißt: halb so groß.“ – Im Halbschatten fehlt ein Teil des Lichts.
  - „Die Mondphasen entstehen durch den Erdschatten.“ – Die Phasen zeigen, welchen Teil der beleuchteten Mondhälfte wir sehen; in den Erdschatten gerät der Mond nur bei einer Mondfinsternis.
- **Bilder:** Sonne, Erde und Mond können durch Fotos ersetzt werden (siehe `docs/BILDER.md`); ohne Fotos zeichnet die Simulation eigene Oberflächen.
