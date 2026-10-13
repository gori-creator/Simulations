---
description: "Prinzip von Cavalieri: Münzstapel und Spielkarten schief schieben, Querschnitte in jeder Höhe vergleichen und so die Volumina schiefer Körper und das Kugelvolumen begründen."
---

## Worum geht es?

Schiebt man einen geraden Münzstapel schief oder biegt ihn, ändert sich seine Form – aber jede einzelne Münze bleibt dieselbe. Also bleibt auch das Volumen des ganzen Stapels gleich. Diese Idee hat der italienische Mathematiker **Bonaventura Cavalieri** (1598–1647) zu einem Prinzip gemacht:

> **Prinzip von Cavalieri:** Haben zwei Körper die gleiche Höhe und sind ihre Querschnitte in jeder Höhe $z$ gleich groß, dann haben die Körper das gleiche Volumen.

Der **Querschnitt** in der Höhe $z$ ist die Fläche, die eine waagerechte Ebene aus dem Körper herausschneidet. Ihr Flächeninhalt heißt $A(z)$.

### Schiefe Körper

Beim schiefen Zylinder, schiefen Prisma, bei schiefer Pyramide und schiefem Kegel wird jeder Querschnitt nur zur Seite verschoben. Deshalb gelten dieselben Formeln wie für die geraden Körper – mit der **Höhe $h$** als senkrechtem Abstand von Grundfläche und Deckfläche bzw. Spitze (nicht der schrägen Seitenlänge!):

$$
V_\text{Zylinder} = \pi r^2 h, \qquad V_\text{Prisma} = G \cdot h, \qquad V_\text{Pyramide} = \tfrac{1}{3} \cdot G \cdot h, \qquad V_\text{Kegel} = \tfrac{1}{3}\pi r^2 h .
$$

Bei Kegel und Pyramide schrumpft der Querschnitt nach oben: In der Höhe $z$ ist der Radius $\rho = r \cdot \tfrac{h - z}{h}$ bzw. die Seite $b = a \cdot \tfrac{h - z}{h}$, also $A(z) = G \cdot \left(\tfrac{h - z}{h}\right)^2$ – unabhängig davon, wo die Spitze liegt.

### Kugelvolumen

Vergleiche eine **Halbkugel** (Radius $r$) mit einem **Zylinder** (Radius $r$, Höhe $r$), aus dem ein auf der Spitze stehender **Kegel** herausgenommen ist. In der Höhe $z$ gilt:

- Halbkugel: Kreis mit Radius $\sqrt{r^2 - z^2}$ (Satz des Pythagoras), also $A_1(z) = \pi (r^2 - z^2)$.
- Restkörper: Kreisring mit Außenradius $r$ und Innenradius $z$, also $A_2(z) = \pi r^2 - \pi z^2$.

Die Querschnitte sind gleich, also auch die Volumina:

$$
V_\text{Halbkugel} = \pi r^3 - \tfrac{1}{3}\pi r^3 = \tfrac{2}{3}\pi r^3 \quad\Rightarrow\quad V_\text{Kugel} = \tfrac{4}{3}\pi r^3 .
$$

### Scheiben und Grenzwert

Die Simulation baut jeden Körper aus $n$ Scheiben der Dicke $\tfrac{h}{n}$. Beim Zylinder passt der Stapel genau. Beim Kegel ist jede Scheibe ein kleiner Zylinder, der etwas übersteht; je mehr Scheiben, desto kleiner der Fehler. Für $n \to \infty$ wird der Stapel zum Körper.

## Ausprobieren

1. Ziehe die Schnittebene am orangen Griff nach oben und unten. Vergleiche $A_1$ und $A_2$. [Münzstapel laden](?s=2&z=2)
2. Schiebe den Stapel am oberen Griff schief und biege ihn am mittleren Griff. Was ändert sich am Volumen? [Gebogener Stapel](?s=1&k=2.5&n=20)
3. Wähle „Gerade stellen“ und danach „Schief stellen“: Die Scheiben gleiten einzeln. Welche Größen bleiben gleich?
4. Verschiebe die Spitze eines Kegels. Bleibt die Höhe gleich? Bleibt das Volumen gleich? [Schiefer Kegel](?body=kegel&s=3&n=50)
5. Stelle beim Kegel nur $n = 4$ Scheiben ein und erhöhe $n$ schrittweise. Wie nähert sich das Stapelvolumen dem Kegelvolumen? [Grober Kegelstapel](?body=kegel&n=4&s=0)
6. Lass die Ebene bei der Kugel durchfahren. Wo sind beide Querschnitte am größten, wo verschwinden sie? [Kugelvolumen](?body=kugel&n=10&z=1.5)

## Aufgaben

### Aufgabe 1: Schiefer Zylinder

Ein schiefer Zylinder hat den Radius $r = 2\,\text{cm}$ und die Höhe $h = 6\,\text{cm}$; seine Deckfläche ist um $3\,\text{cm}$ verschoben. Berechne sein Volumen. [Aufgabe laden](?r=2&h=6&s=3&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Jeder Querschnitt ist ein Kreis mit $A = \pi \cdot (2\,\text{cm})^2 = 4\pi\,\text{cm}^2$ – wie beim geraden Zylinder. Nach Cavalieri gilt $V = \pi r^2 h = 4\pi\,\text{cm}^2 \cdot 6\,\text{cm} = 24\pi\,\text{cm}^3 \approx 75{,}40\,\text{cm}^3$. Die Verschiebung spielt keine Rolle.

[In der Simulation zeigen](?r=2&h=6&s=3)

</details>

### Aufgabe 2: Schiefe Pyramide

Eine quadratische Pyramide hat die Grundkante $a = 6\,\text{cm}$ und die Höhe $h = 5\,\text{cm}$, ihre Spitze liegt nicht über der Mitte. (a) Berechne den Querschnitt in der Höhe $z = 2\,\text{cm}$. (b) Berechne das Volumen. [Aufgabe laden](?body=pyr&a=6&h=5&s=3&z=2&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

(a) $b = 6\,\text{cm} \cdot \tfrac{5 - 2}{5} = 3{,}6\,\text{cm}$, also $A = (3{,}6\,\text{cm})^2 = 12{,}96\,\text{cm}^2$.

(b) $V = \tfrac{1}{3} \cdot 36\,\text{cm}^2 \cdot 5\,\text{cm} = 60\,\text{cm}^3$ – genauso viel wie bei der geraden Pyramide.

[In der Simulation zeigen](?body=pyr&a=6&h=5&s=3&z=2)

</details>

### Aufgabe 3: Münzturm

Ein Turm aus 20 Münzen (Durchmesser $2{,}5\,\text{cm}$, Dicke $2\,\text{mm}$) wird schief umgestapelt. Welches Volumen hat er? Warum braucht man dafür keine schiefe Länge?

<details>
<summary>Lösung anzeigen</summary>

Höhe $h = 20 \cdot 0{,}2\,\text{cm} = 4\,\text{cm}$, Radius $r = 1{,}25\,\text{cm}$. $V = \pi \cdot (1{,}25\,\text{cm})^2 \cdot 4\,\text{cm} = 6{,}25\pi\,\text{cm}^3 \approx 19{,}63\,\text{cm}^3$. Jede Münze behält ihr Volumen; nur die senkrechte Höhe zählt.

</details>

### Aufgabe 4: Kugel nach Cavalieri

Eine Halbkugel und der Restkörper haben $r = 3\,\text{cm}$. (a) Berechne beide Querschnitte in der Höhe $z = 2\,\text{cm}$. (b) Berechne das Volumen der ganzen Kugel. [Aufgabe laden](?body=kugel&r=3&z=2&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

(a) Halbkugel: $A_1 = \pi(9 - 4)\,\text{cm}^2 = 5\pi\,\text{cm}^2 \approx 15{,}71\,\text{cm}^2$. Restkörper: $A_2 = \pi \cdot 9\,\text{cm}^2 - \pi \cdot 4\,\text{cm}^2 = 5\pi\,\text{cm}^2$ – gleich groß.

(b) $V = \tfrac{4}{3}\pi \cdot (3\,\text{cm})^3 = 36\pi\,\text{cm}^3 \approx 113{,}10\,\text{cm}^3$.

[In der Simulation zeigen](?body=kugel&r=3&z=2)

</details>

### Aufgabe 5: Grob und fein

Ein Kegel mit $r = 3\,\text{cm}$ und $h = 5\,\text{cm}$ wird durch 4 Scheiben (Zylinder) ersetzt, deren Radien $3\,\text{cm}$, $2{,}25\,\text{cm}$, $1{,}5\,\text{cm}$ und $0{,}75\,\text{cm}$ sind. Berechne das Stapelvolumen und vergleiche mit dem Kegelvolumen. [Aufgabe laden](?body=kegel&n=4&s=0&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V_\text{Stapel} = \pi \cdot 1{,}25\,\text{cm} \cdot (9 + 5{,}0625 + 2{,}25 + 0{,}5625)\,\text{cm}^2 = 21{,}09375\pi\,\text{cm}^3 \approx 66{,}27\,\text{cm}^3$. Der Kegel hat $V = 15\pi\,\text{cm}^3 \approx 47{,}12\,\text{cm}^3$; der Stapel ist um etwa $41\,\%$ zu groß. Mit mehr Scheiben wird der Fehler kleiner.

[In der Simulation zeigen](?body=kegel&n=4&s=0)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe 10, Lernbereich Körperberechnung (Pyramide, Kegel, Kugel; Prinzip von Cavalieri) im LehrplanPLUS Bayern, Gymnasium – Zuordnung als Entwurf, bitte gegen den aktuellen Lehrplan prüfen. Geeignet als Einstieg (Münzstapel, Kartenstapel), zur Begründung der Formeln für schiefe Körper und als Höhepunkt zur Herleitung des Kugelvolumens.
- **Modell:** Die Scheiben umschließen den Körper (Radius am unteren Scheibenrand); der Mittelpunkt jeder Scheibe liegt auf der verschobenen bzw. gebogenen Achse. Die orange Fläche ist der exakte Querschnitt des Körpers. Das Diagramm $A(z)$ zeigt die Scheiben als Balken – ein Ausblick auf den Integralgedanken („Fläche unter der Kurve = Volumen“).
- **Typische Fehlvorstellungen:**
  - „Ein schiefer Zylinder hat mehr Volumen, weil er länger ist.“ – Entscheidend ist die senkrechte Höhe, nicht die schräge Mantellinie.
  - „Gleiche Grundfläche und gleiche Höhe genügen.“ – Kegel und Zylinder zeigen: Es kommt auf die Querschnitte **in jeder Höhe** an.
  - „Bei der Kugel ist der Querschnitt in halber Höhe die halbe Grundfläche.“ – Er ist $\pi\left(r^2 - \tfrac{r^2}{4}\right) = \tfrac{3}{4}\pi r^2$.
