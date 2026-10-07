---
description: Interaktive Simulation zur Kreiszahl π – Rad abrollen für den Umfang, Kreissektoren zum Rechteck umlegen für die Fläche und π eingrenzen wie Archimedes.
---

## Worum geht es?

Bei **jedem** Kreis ist der Umfang ein festes Vielfaches des Durchmessers. Dieses Verhältnis heißt **Kreiszahl** $\pi$:

$$
\pi = \frac{U}{d} \approx 3{,}14159\ldots
$$

Daraus folgen die beiden wichtigsten Kreisformeln:

$$
U = \pi \cdot d = 2\pi \cdot r \qquad A = \pi \cdot r^2
$$

**Umfang:** Rollt man ein Rad einmal ab, ist die Strecke etwas mehr als drei Durchmesser lang.

**Fläche:** Zerschneidet man den Kreis in viele Sektoren und legt sie abwechselnd nebeneinander, entsteht fast ein Rechteck. Seine Höhe ist $r$, seine Breite der halbe Umfang $\pi r$. Also ist $A = \pi r \cdot r = \pi r^2$.

**Archimedes** (um 250 v. Chr.) schloss den Kreis zwischen ein inneres und ein äußeres Vieleck ein. Mit dem 96-Eck fand er $3\frac{10}{71} < \pi < 3\frac{1}{7}$, also $3{,}1408 < \pi < 3{,}1429$.

$\pi$ ist eine **irrationale Zahl**: Ihre Dezimalstellen enden nie und wiederholen sich nicht.

## Ausprobieren

1. Drücke **Abrollen** und vergleiche den abgerollten Umfang mit den Durchmessern darunter.
2. Wähle **Fläche** und lege die Sektoren um. Was passiert mit mehr Sektoren? [48 Sektoren](?mode=flaeche&n=48)
3. Wähle **Archimedes** und verdopple die Eckenzahl mehrmals. Wie nah kommen die Schranken an π heran? [Sechseck](?mode=archimedes)

## Aufgaben

### Aufgabe 1: Fahrradreifen

Ein Fahrradreifen hat einen Durchmesser von $70\,\text{cm}$. Wie weit kommt man mit einer Umdrehung? Wie viele Umdrehungen braucht man für $1\,\text{km}$?

<details>
<summary>Lösung anzeigen</summary>

$U = \pi \cdot 70\,\text{cm} \approx 220\,\text{cm} = 2{,}2\,\text{m}$. Für $1000\,\text{m}$ braucht man $1000 : 2{,}199 \approx 455$ Umdrehungen.

</details>

### Aufgabe 2: Eine große oder zwei kleine Pizzen?

Ist eine Pizza mit $30\,\text{cm}$ Durchmesser größer als zwei Pizzen mit je $20\,\text{cm}$?

<details>
<summary>Lösung anzeigen</summary>

Große Pizza: $A = \pi \cdot 15^2 \approx 707\,\text{cm}^2$. Zwei kleine: $2 \cdot \pi \cdot 10^2 \approx 628\,\text{cm}^2$. Die große Pizza ist größer – die Fläche wächst mit dem Quadrat des Radius.

</details>

### Aufgabe 3: Sektoren umlegen

Warum wird die umgelegte Figur mit mehr Sektoren immer mehr zu einem Rechteck? Welche Seitenlängen hat dieses Rechteck? [12 Sektoren](?mode=flaeche&n=12) · [48 Sektoren](?mode=flaeche&n=48)

<details>
<summary>Lösung anzeigen</summary>

Je schmaler die Sektoren, desto gerader werden die Bögen an Ober- und Unterkante und desto senkrechter die Seiten. Die Höhe ist der Radius $r$; oben und unten liegt jeweils der halbe Umfang, also die Breite $\pi r$. Damit gilt $A = \pi r \cdot r = \pi r^2$.

</details>

### Aufgabe 4: Wie Archimedes

Beim Sechseck gilt $3 < \pi < 3{,}46$. Erkläre, warum das einbeschriebene Sechseck genau den Umfang $3d$ hat.

<details>
<summary>Lösung anzeigen</summary>

Das einbeschriebene Sechseck besteht aus sechs gleichseitigen Dreiecken mit der Seitenlänge $r$. Sein Umfang ist $6r = 3d$. Da der Kreis außen herum etwas länger ist, gilt $\pi > 3$. [Sechseck zeigen](?mode=archimedes)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 8 (Kreis und Zylinder: Kreisumfang, Kreisfläche, Näherungen für π).
- **Drei Zugänge:** Abrollen (Umfang), Umlegen (Fläche) und Archimedes (Näherung). Alle drei Animationen werden über den Knopf unter der Bühne gestartet.
- **Typische Fehlvorstellungen:**
  - Umfang und Fläche werden verwechselt; $\pi r^2$ und $2\pi r$ werden vertauscht.
  - „π ist genau 3,14.“
- **Bilder:** Rad und Pizza können durch Fotos ergänzt werden (siehe `docs/BILDER.md`).
