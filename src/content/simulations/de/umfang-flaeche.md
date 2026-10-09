---
description: "Interaktive Simulation zu Umfang und Flächeninhalt von Rechtecken: Rechteck auf Rechenpapier aufziehen, Reihe für Reihe mit Einheitsquadraten auslegen, eine Ameise den Rand ablaufen lassen, Rechtecke mit gleichem Umfang oder gleichem Flächeninhalt vergleichen und eine L-Form zerlegen."
---

## Worum geht es?

Ein Rechteck hat die **Länge** $a$ und die **Breite** $b$. Zwei Fragen klingen ähnlich, meinen aber ganz Verschiedenes:

**Flächeninhalt $A$ – wie viel Fläche bedeckt das Rechteck?** Man misst ihn mit **Einheitsquadraten**. Ein Quadrat mit der Seitenlänge $1\,\text{cm}$ hat den Flächeninhalt $1\,\text{cm}^2$ (ein *Quadratzentimeter*). In ein Rechteck mit $a = 5\,\text{cm}$ und $b = 3\,\text{cm}$ passen $3$ Reihen mit je $5$ Einheitsquadraten, also $5 \cdot 3 = 15$ Stück:

$$
A = a \cdot b \qquad\text{z. B.}\quad A = 5\,\text{cm} \cdot 3\,\text{cm} = 15\,\text{cm}^2
$$

**Umfang $U$ – wie lang ist der Rand einmal ganz herum?** Der Umfang ist eine **Länge** und wird in $\text{cm}$ angegeben. Man läuft die vier Seiten ab: $a + b + a + b$. Je zwei gegenüberliegende Seiten sind gleich lang, deshalb

$$
U = 2 \cdot a + 2 \cdot b = 2 \cdot (a + b) \qquad\text{z. B.}\quad U = 2 \cdot (5\,\text{cm} + 3\,\text{cm}) = 16\,\text{cm}
$$

Wickelt man den Rand wie einen Faden ab, erhält man zwei gleich lange Stücke $a + b$ – daher kommt die Klammerform $2 \cdot (a + b)$.

Beim **Quadrat** sind alle Seiten gleich lang: $A = a \cdot a$ und $U = 4 \cdot a$.

**Gleicher Umfang – verschiedener Flächeninhalt.** Alle Rechtecke mit $U = 16\,\text{cm}$ haben $a + b = 8\,\text{cm}$:

| Rechteck | $1 \times 7$ | $2 \times 6$ | $3 \times 5$ | $4 \times 4$ | $5 \times 3$ | $6 \times 2$ | $7 \times 1$ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| $A$ in $\text{cm}^2$ | $7$ | $12$ | $15$ | $16$ | $15$ | $12$ | $7$ |

Je „quadratischer“ das Rechteck, desto größer der Flächeninhalt; das Quadrat hat den größten. Umgekehrt haben bei festem Flächeninhalt lange, schmale Streifen den größten Umfang: Bei $A = 12\,\text{cm}^2$ hat $1\,\text{cm} \times 12\,\text{cm}$ den Umfang $26\,\text{cm}$, $3\,\text{cm} \times 4\,\text{cm}$ nur $14\,\text{cm}$.

**Zusammengesetzte Figuren** wie eine L-Form zerlegt man in Rechtecke ($A = A_1 + A_2$) oder ergänzt sie zu einem großen Rechteck und zieht das fehlende Stück ab ($A = a \cdot b - c \cdot d$). Überraschend: Der Umfang der L-Form ist genauso groß wie der des großen Rechtecks.

## Ausprobieren

1. Ziehe die Ecke des Rechtecks. Beobachte, wie sich Flächeninhalt und Umfang ändern. Welcher Wert wächst schneller, wenn du das Rechteck in beide Richtungen vergrößerst?
2. Drücke **Auslegen und zählen**: Zuerst wird die erste Reihe Quadrat für Quadrat gelegt, dann wird sie nach oben kopiert. Erkläre damit die Formel $A = a \cdot b$. [Rechteck 7 cm × 4 cm](?a=7&b=4)
3. Drücke **Ameise laufen lassen** und zähle mit, wie viele Zentimeter sie läuft. Danach wird der Rand als Faden abgewickelt. Warum sind die beiden Fadenstücke gleich lang?
4. Beim [Quadrat 4 cm × 4 cm](?a=4&b=4) ist $U = 16\,\text{cm}$ und $A = 16\,\text{cm}^2$. Warum darf man trotzdem nicht sagen, Umfang und Flächeninhalt seien „gleich groß“?
5. Vergleiche den [langen Streifen 10 cm × 1 cm](?a=10&b=1&faden=1) mit dem Quadrat. Welches hat den größeren Umfang, welches den größeren Flächeninhalt?
6. [Gleicher Umfang](?mode=gleichU&u=20&w=1): Ziehe die Ecke an der gestrichelten Linie entlang. Bei welchem Rechteck ist der Flächeninhalt am größten? Mit **Alle Rechtecke durchgehen** entsteht das ganze Säulendiagramm.
7. [Gleicher Flächeninhalt](?mode=gleichA&fa=24&w=1): Welches Rechteck mit $A = 24\,\text{cm}^2$ hat den kleinsten Umfang? Probiere auch [A = 13 cm²](?mode=gleichA&fa=13&w=1) aus – was ist an 13 besonders?
8. [L-Form](?mode=lform&a=6&b=5&c=3&d=2): Bestimme den Flächeninhalt durch waagerechtes und senkrechtes Zerlegen und durch Ergänzen. Schalte dann **Innere Kanten nach außen schieben** ein. [L-Form mit verschobenen Kanten](?mode=lform&a=6&b=5&c=3&d=2&kanten=1)

## Aufgaben

### Aufgabe 1: Flächeninhalt und Umfang

Ein Rechteck ist $8\,\text{cm}$ lang und $3\,\text{cm}$ breit. Berechne Flächeninhalt und Umfang. [Aufgabe laden](?a=8&b=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A = 8\,\text{cm} \cdot 3\,\text{cm} = 24\,\text{cm}^2$ und $U = 2 \cdot (8\,\text{cm} + 3\,\text{cm}) = 2 \cdot 11\,\text{cm} = 22\,\text{cm}$. [In der Simulation zeigen](?a=8&b=3)

</details>

### Aufgabe 2: Rückwärts rechnen

(a) Ein Quadrat hat den Umfang $20\,\text{cm}$. Wie lang ist eine Seite, wie groß ist der Flächeninhalt?
(b) Ein Rechteck hat den Flächeninhalt $18\,\text{cm}^2$ und ist $6\,\text{cm}$ lang. Wie breit ist es, wie groß ist sein Umfang?

<details>
<summary>Lösung anzeigen</summary>

(a) $4 \cdot a = 20\,\text{cm}$, also $a = 5\,\text{cm}$ und $A = 5\,\text{cm} \cdot 5\,\text{cm} = 25\,\text{cm}^2$. [Zeigen](?a=5&b=5)

(b) $6\,\text{cm} \cdot b = 18\,\text{cm}^2$, also $b = 3\,\text{cm}$ und $U = 2 \cdot (6\,\text{cm} + 3\,\text{cm}) = 18\,\text{cm}$. [Zeigen](?a=6&b=3)

</details>

### Aufgabe 3: Stimmt das?

Lena behauptet: „Ein Rechteck mit größerem Umfang hat auch einen größeren Flächeninhalt.“ Hat sie recht?

<details>
<summary>Lösung anzeigen</summary>

Nein. Gegenbeispiel: Der Streifen $10\,\text{cm} \times 1\,\text{cm}$ hat $U = 22\,\text{cm}$, aber nur $A = 10\,\text{cm}^2$. Das Quadrat $4\,\text{cm} \times 4\,\text{cm}$ hat den kleineren Umfang $16\,\text{cm}$, aber den größeren Flächeninhalt $16\,\text{cm}^2$. [Streifen](?a=10&b=1) · [Quadrat](?a=4&b=4)

</details>

### Aufgabe 4: Das größte Beet

Für ein rechteckiges Beet stehen $24\,\text{m}$ Zaun zur Verfügung. Die Seitenlängen sollen ganze Meter sein. Wie lang und breit muss das Beet werden, damit es möglichst groß ist? (Rechne in der Simulation mit $1\,\text{cm}$ für $1\,\text{m}$.) [Aufgabe laden](?mode=gleichU&u=24&w=1&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Es gilt $a + b = 12\,\text{m}$. Der Flächeninhalt ist am größten beim Quadrat $6\,\text{m} \times 6\,\text{m}$: $A = 36\,\text{m}^2$. Zum Vergleich: $5\,\text{m} \times 7\,\text{m}$ ergibt nur $35\,\text{m}^2$, $1\,\text{m} \times 11\,\text{m}$ nur $11\,\text{m}^2$. [Zeigen](?mode=gleichU&u=24&w=6)

</details>

### Aufgabe 5: L-Form auf zwei Arten

Aus einem Rechteck $8\,\text{cm} \times 6\,\text{cm}$ wird rechts oben ein Rechteck $3\,\text{cm} \times 4\,\text{cm}$ herausgeschnitten. Bestimme den Flächeninhalt auf zwei verschiedene Arten und den Umfang. [Aufgabe laden](?mode=lform&a=8&b=6&c=3&d=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Waagerecht zerlegt: $8 \cdot 2 + 5 \cdot 4 = 16 + 20 = 36$, also $A = 36\,\text{cm}^2$. Ergänzt: $8 \cdot 6 - 3 \cdot 4 = 48 - 12 = 36$. [Zerlegen](?mode=lform&a=8&b=6&c=3&d=4&zerl=waag) · [Ergänzen](?mode=lform&a=8&b=6&c=3&d=4&zerl=erg)

Umfang: $8 + 2 + 3 + 4 + 5 + 6 = 28$, also $U = 28\,\text{cm} = 2 \cdot (8\,\text{cm} + 6\,\text{cm})$ – so viel wie beim ganzen Rechteck. [Kanten schieben](?mode=lform&a=8&b=6&c=3&d=4&kanten=1)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe 5, Lernbereich „Größen und ihre Einheiten“, Abschnitt Flächeninhalt (LehrplanPLUS Bayern, Gymnasium). Geeignet zur Einführung (Auslegen, Ameise), zum Üben (Aufgabenlinks mit `show=0&_hide=1`) und zur Vertiefung (Vergleiche, L-Form).
- **Modell:** Seitenlängen sind ganze Zentimeter ($a \le 10$, $b \le 6$). Das Rechenpapier zeigt ganze Zentimeter kräftig und halbe fein – wie im Heft, wo ein Kästchen $5\,\text{mm}$ breit ist. Ein Zentimeterquadrat besteht dort aus **vier** Kästchen. Auf dem Bildschirm ist „1 cm“ natürlich nicht wirklich 1 cm lang.
- **Darstellungen:** Länge $a$ (waagerecht) und Breite $b$ (senkrecht) haben in Bild, Formeln und Faden dieselbe Farbe. Der Faden zerfällt in zwei Stücke der Länge $a + b$ und begründet so $U = 2 \cdot (a + b)$.
- **Typische Fehlvorstellungen:**
  - „Umfang und Flächeninhalt kann man vergleichen“ – beim Quadrat $4 \times 4$ sind die Maßzahlen gleich, die Größen (Länge bzw. Fläche) aber nicht.
  - „Größerer Umfang bedeutet größere Fläche“ – siehe Modus *Gleicher Umfang*.
  - Formeln vertauscht ($U = a \cdot b$, $A = a + b$) oder beim Umfang nur zwei Seiten addiert ($U = a + b$).
  - Bei der L-Form werden die beiden inneren Kanten beim Umfang vergessen, oder es wird $A = a \cdot b$ gerechnet.
  - Auf Rechenpapier wird jedes Kästchen als $1\,\text{cm}^2$ gezählt.
- **Ausblick:** Umrechnen von Flächeneinheiten ($1\,\text{cm}^2 = 100\,\text{mm}^2$) und Flächeninhalt von Parallelogramm, Dreieck und Trapez durch Zerlegen und Ergänzen in Jahrgangsstufe 6.
