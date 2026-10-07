---
description: Interaktive 3D-Simulation zum Volumen von Quadern – Einheitswürfel füllen den Quader Reihe für Reihe und Schicht für Schicht; mit cm³, dm³, Liter und m³.
---

## Worum geht es?

Das **Volumen** (der Rauminhalt) eines Körpers gibt an, wie viele **Einheitswürfel** hineinpassen. Ein Einheitswürfel mit der Kantenlänge $1\,\text{cm}$ hat das Volumen $1\,\text{cm}^3$ (ein **Kubikzentimeter**).

Beim Quader muss man die Würfel nicht einzeln zählen:

- Eine **Reihe** entlang der Länge $a$ besteht aus $a$ Würfeln.
- Eine **Schicht** auf dem Boden besteht aus $b$ solchen Reihen, also aus $a \cdot b$ Würfeln.
- Der Quader hat $c$ Schichten übereinander.

$$
V = a \cdot b \cdot c
$$

Beispiel: Ein Quader mit $a = 5\,\text{cm}$, $b = 3\,\text{cm}$ und $c = 4\,\text{cm}$ hat das Volumen $V = 5 \cdot 3 \cdot 4\,\text{cm}^3 = 60\,\text{cm}^3$. Da die Grundfläche $G = a \cdot b$ ist, gilt auch $V = G \cdot c$.

**Volumeneinheiten:** Ein Würfel mit $1\,\text{dm} = 10\,\text{cm}$ Kantenlänge enthält $10 \cdot 10 \cdot 10 = 1000$ Zentimeterwürfel. Deshalb ist die Umrechnungszahl bei Volumeneinheiten $1000$:

$$
1\,\text{m}^3 = 1000\,\text{dm}^3, \qquad 1\,\text{dm}^3 = 1000\,\text{cm}^3, \qquad 1\,\text{cm}^3 = 1000\,\text{mm}^3
$$

Für Flüssigkeiten verwendet man **Liter**: $1\,\text{l} = 1\,\text{dm}^3$ und $1\,\text{ml} = 1\,\text{cm}^3$.

## Ausprobieren

1. Drücke **Füllen** und zähle mit: Erst kommt eine Reihe Würfel für Würfel, dann ganze Reihen, dann ganze Schichten.
2. Ziehe an den markierten Ecken des Glaskastens, um Länge, Breite und Höhe zu ändern. Wie ändert sich die Zählhilfe?
3. Verdopple die Höhe $c$. Was passiert mit dem Volumen? Verdopple dann auch die Länge $a$.
4. Ein Liter: Fülle einen Würfel mit $10\,\text{cm}$ Kantenlänge. [1 Liter = 1000 cm³](?a=10&b=10&c=10&fill=voll)
5. Vergleiche einen flachen und einen hohen Quader. [Nur eine Schicht](?a=8&b=5&c=1&fill=voll) · [Hoher Turm](?a=2&b=2&c=9&fill=voll)

## Aufgaben

### Aufgabe 1: Zählen mit System

Wie viele Einheitswürfel passen in einen Quader mit $a = 6\,\text{cm}$, $b = 4\,\text{cm}$ und $c = 3\,\text{cm}$? Beschreibe, wie du zählst. [Aufgabe laden](?a=6&b=4&c=3&fill=reihe&count=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Eine Reihe hat 6 Würfel, eine Schicht $4 \cdot 6 = 24$ Würfel, drei Schichten $3 \cdot 24 = 72$ Würfel. Also $V = 6 \cdot 4 \cdot 3\,\text{cm}^3 = 72\,\text{cm}^3$. [Lösung zeigen](?a=6&b=4&c=3&fill=voll)

</details>

### Aufgabe 2: Gleiches Volumen, andere Form

Finde möglichst viele verschiedene Quader aus genau $24$ Einheitswürfeln. Die Kantenlängen sollen ganze Zahlen bis $10$ sein; gedrehte Quader zählen nicht als neu.

<details>
<summary>Lösung anzeigen</summary>

Es gibt vier: $1 \cdot 3 \cdot 8$, $1 \cdot 4 \cdot 6$, $2 \cdot 2 \cdot 6$ und $2 \cdot 3 \cdot 4$. Mit längeren Kanten kämen noch $1 \cdot 2 \cdot 12$ und $1 \cdot 1 \cdot 24$ dazu. Alle haben dasselbe Volumen, sehen aber ganz verschieden aus. [Beispiel 4 × 3 × 2](?a=4&b=3&c=2&fill=voll) · [Beispiel 8 × 3 × 1](?a=8&b=3&c=1&fill=voll)

</details>

### Aufgabe 3: Höhe verdoppeln

Ein Quader hat das Volumen $60\,\text{cm}^3$. Wie groß ist das Volumen, wenn man (a) die Höhe verdoppelt, (b) Länge und Höhe verdoppelt, (c) alle drei Kanten verdoppelt?

<details>
<summary>Lösung anzeigen</summary>

(a) $120\,\text{cm}^3$ – doppelt so viele Schichten. (b) $240\,\text{cm}^3$ – Faktor $2 \cdot 2 = 4$. (c) $480\,\text{cm}^3$ – Faktor $2 \cdot 2 \cdot 2 = 8$. [Ausgangsquader 5 × 3 × 4](?a=5&b=3&c=4&fill=voll) · [alle Kanten verdoppelt](?a=10&b=6&c=8&fill=voll)

</details>

### Aufgabe 4: Das Aquarium

Ein Aquarium ist innen $60\,\text{cm}$ lang, $30\,\text{cm}$ breit und $40\,\text{cm}$ hoch. Wie viele Liter Wasser passen hinein? Tipp: Rechne in Dezimetern. [Aufgabe laden](?a=6&b=3&c=4&unit=dm&fill=leer&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$60\,\text{cm} = 6\,\text{dm}$, $30\,\text{cm} = 3\,\text{dm}$, $40\,\text{cm} = 4\,\text{dm}$. $V = 6 \cdot 3 \cdot 4\,\text{dm}^3 = 72\,\text{dm}^3 = 72\,\text{l}$.

</details>

### Aufgabe 5: Einheiten umrechnen

Gib in der jeweils anderen Einheit an: (a) $3\,\text{dm}^3$ in $\text{cm}^3$, (b) $2500\,\text{cm}^3$ in Liter, (c) $0{,}5\,\text{m}^3$ in Liter.

<details>
<summary>Lösung anzeigen</summary>

(a) $3000\,\text{cm}^3$ (b) $2{,}5\,\text{l}$ (c) $500\,\text{l}$ – die Umrechnungszahl ist immer $1000$, weil ein großer Würfel $10 \cdot 10 \cdot 10$ kleine enthält.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 6, Lernbereich 2.2 (Volumen): Volumen des Quaders über Einheitswürfel, Volumeneinheiten einschließlich Liter.
- **Didaktischer Kern:** Die Formel $V = a \cdot b \cdot c$ entsteht aus dem strukturierten Zählen (Reihe → Schicht → Schichten). Die Zählhilfe lässt sich ausschalten (`count=0`), damit Schülerinnen und Schüler die Struktur selbst beschreiben.
- **Typische Fehlvorstellungen:**
  - Volumen und Oberfläche werden verwechselt („außen zählen“ statt „innen füllen“).
  - Die Umrechnungszahl 1000 wird mit 100 (Flächeneinheiten) oder 10 (Längeneinheiten) verwechselt. Der Würfel mit $10\,\text{cm}$ Kante zeigt anschaulich, warum $1\,\text{dm}^3 = 1000\,\text{cm}^3$ ist.
  - Beim Verdoppeln aller Kanten wird ein doppeltes statt eines achtfachen Volumens erwartet.
- **Bedienung:** Die Kanten lassen sich auch direkt an den markierten Ecken ziehen; „Füllstand“ springt mit Animation zu leer, einer Reihe, einer Schicht oder voll.
