---
description: "Interaktive Simulation zum Funktionsbegriff: Zuordnungen als Pfeildiagramm, Wertetabelle und Graph synchron, Eindeutigkeit prüfen, Zuordnungen umkehren und der senkrechte Linientest an Kreis, liegender Parabel, Treppenfunktion und mehr."
---

## Worum geht es?

Eine **Zuordnung** ordnet Elementen einer Menge $A$ Elemente einer Menge $B$ zu, z. B. jeder Zahl ihr Quadrat oder jedem Kind seinen Geburtsmonat. Eine Zuordnung heißt **Funktion**, wenn sie **eindeutig** ist:

> Jedem Element der Definitionsmenge $D$ wird **genau ein** Element zugeordnet.

Man schreibt dann $x \mapsto f(x)$, z. B. $x \mapsto x^2$. Die Menge aller zugeordneten Werte heißt **Wertemenge** $W$.

So erkennst du eine Funktion in den drei Darstellungen:

| Darstellung | Funktion, wenn … |
| --- | --- |
| Pfeildiagramm | von **jedem** Element links **genau ein** Pfeil ausgeht |
| Wertetabelle | unter jedem $x$ **genau ein** Wert steht |
| Graph | über jeder Stelle $x$ **höchstens ein** Punkt liegt |

**Wichtig:** Dass bei einem Element rechts **mehrere Pfeile ankommen**, ist erlaubt. Bei $x \mapsto x^2$ haben $-2$ und $2$ beide das Quadrat $4$ – trotzdem ist das eine Funktion. Verboten ist nur, dass von einem Element links mehrere Pfeile **ausgehen** (oder gar keiner).

**Umkehren:** Dreht man alle Pfeile um, entsteht wieder eine Zuordnung – aber nicht immer eine Funktion. Aus „Zahl $\mapsto$ Quadrat“ wird „Quadratzahl $\mapsto$ Zahl mit diesem Quadrat“: Der $4$ wären $-2$ und $2$ zugeordnet, der $2$ (in den ganzen Zahlen) gar nichts.

**Senkrechter Linientest:** Ein Graph gehört genau dann zu einer Funktion, wenn **jede Parallele zur $y$-Achse** ihn **höchstens einmal** schneidet. Schneidet eine senkrechte Gerade $x = c$ den Graphen zweimal, wären der Stelle $c$ zwei Werte zugeordnet. Ein Kreis oder eine „liegende“ Parabel sind deshalb keine Funktionsgraphen, ein Halbkreis oder eine Treppenfunktion schon.

**Definitions- und Wertemenge am Graphen:** $D$ ist der „Schatten“ des Graphen auf der $x$-Achse, $W$ der Schatten auf der $y$-Achse. Für $f(x) = 0{,}5x^2 - 2$ gilt $D = \mathbb{R}$ und $W = \{y \mid y \geq -2\}$.

## Ausprobieren

1. Lade [Zahl ↦ Quadrat](?ex=square). Bei welchen Elementen rechts kommen zwei Pfeile an? Warum ist das trotzdem eine Funktion?
2. Drücke **Umkehren** bzw. lade [Quadrat ↦ Zahl](?ex=square&rev=1). Welche zwei verschiedenen Probleme zeigt das Pfeildiagramm – und wie sieht man sie in der Wertetabelle und im Graphen?
3. Kehre auch [x ↦ 2x + 1](?ex=lin) um. Warum ist hier die Umkehrung wieder eine Funktion?
4. In der [eigenen Zuordnung](?ex=own) stimmt etwas nicht. Repariere sie mit möglichst wenigen Änderungen: Tippe erst links, dann rechts auf ein Element (oder ziehe einen Pfeil), um Pfeile zu setzen oder zu entfernen.
5. Wechsle zu [Graph & Linientest beim Kreis](?mode=graph&cur=circle&xl=1). Ziehe die senkrechte Gerade: Wo schneidet sie zweimal, einmal, keinmal?
6. Vergleiche den [Halbkreis](?mode=graph&cur=semi&xl=1) mit dem Kreis. Lies $D$ und $W$ ab.
7. Untersuche die [Treppenfunktion](?mode=graph&cur=step&xl=2) an einer ganzen Zahl: Welcher Punkt gehört zum Graphen, der volle oder der hohle?
8. Drücke bei der [S-Kurve](?mode=graph&cur=scurve&xl=3) auf **Linientest abtasten** und beobachte die Leiste unter dem Graphen. Zwischen welchen Stellen gibt es drei Schnittpunkte?

## Aufgaben

### Aufgabe 1: Funktion oder nicht?

Entscheide und begründe: (a) Schüler $\mapsto$ Körpergröße (heute gemessen), (b) Körpergröße $\mapsto$ Schüler, (c) Zahl $\mapsto$ ihr Doppeltes, (d) Zahl $\mapsto$ ihre Teiler.

<details>
<summary>Lösung anzeigen</summary>

(a) **Funktion:** Jeder Schüler hat heute genau eine Körpergröße. (b) **Keine Funktion:** Zwei Schüler können gleich groß sein; außerdem gibt es Größen, die niemand hat. (c) **Funktion:** $x \mapsto 2x$. (d) **Keine Funktion:** $6$ hat die Teiler $1$, $2$, $3$ und $6$.

</details>

### Aufgabe 2: Pfeildiagramm reparieren

[Aufgabe laden](?ex=own&show=0&_hide=1) Ist die Zuordnung eine Funktion? Ändere so wenige Pfeile wie möglich, damit eine Funktion entsteht.

<details>
<summary>Lösung anzeigen</summary>

Keine Funktion: Von $3$ gehen zwei Pfeile aus (zu $1$ und $5$), von $4$ keiner. Zwei Änderungen genügen, z. B. den Pfeil $3 \to 5$ entfernen und einen Pfeil $4 \to 3$ setzen. Dass danach vielleicht zwei Pfeile bei derselben Zahl ankommen, ist erlaubt. [Mit Urteil zeigen](?ex=own)

</details>

### Aufgabe 3: Wertetabellen prüfen

Gehört die Wertetabelle zu einer Funktion $x \mapsto y$?

**(a)**

| $x$ | $1$ | $2$ | $3$ | $4$ |
| --- | --- | --- | --- | --- |
| $y$ | $5$ | $7$ | $5$ | $9$ |

**(b)**

| $x$ | $2$ | $3$ | $2$ | $5$ |
| --- | --- | --- | --- | --- |
| $y$ | $1$ | $4$ | $6$ | $8$ |

<details>
<summary>Lösung anzeigen</summary>

(a) **Ja:** Jedes $x$ kommt genau einmal vor; dass der Wert $5$ zweimal auftritt, ist erlaubt (im Pfeildiagramm kommen bei $5$ zwei Pfeile an).

(b) **Nein:** Der Stelle $2$ sind die Werte $1$ und $6$ zugeordnet – im Graphen lägen $(2 \mid 1)$ und $(2 \mid 6)$ senkrecht übereinander.

</details>

### Aufgabe 4: Linientest

[Aufgabe laden](?mode=graph&cur=sideways&xl=-3&show=0&_hide=1) Ist die liegende Parabel $x = 0{,}5y^2 - 2$ der Graph einer Funktion? Gib eine Stelle an, die das zeigt.

<details>
<summary>Lösung anzeigen</summary>

Nein. Die Gerade $x = 0$ schneidet die Parabel zweimal, in $(0 \mid -2)$ und $(0 \mid 2)$: Der Stelle $0$ wären zwei Werte zugeordnet. Für $x < -2$ gibt es gar keinen Punkt. [Zeigen](?mode=graph&cur=sideways&xl=0)

</details>

### Aufgabe 5: Definitions- und Wertemenge

[Aufgabe laden](?mode=graph&cur=parab&xl=0&show=0&_hide=1) Bestimme $D$ und $W$ für $f(x) = 0{,}5x^2 - 2$.

<details>
<summary>Lösung anzeigen</summary>

Jede Zahl darf eingesetzt werden: $D = \mathbb{R}$. Der kleinste Funktionswert ist $f(0) = -2$, nach oben gibt es keine Grenze: $W = \{y \mid y \geq -2\}$. [Zeigen](?mode=graph&cur=parab&xl=0)

</details>

### Aufgabe 6: Sprungstellen

Bei einer Treppenfunktion zeichnet man an jeder Sprungstelle einen vollen und einen hohlen Punkt. Begründe, warum nicht beide Punkte voll sein dürfen.

<details>
<summary>Lösung anzeigen</summary>

Wären bei $x = 2$ beide Punkte voll, also $(2 \mid 1)$ und $(2 \mid 2)$, dann wären der Stelle $2$ zwei Werte zugeordnet – die senkrechte Gerade $x = 2$ schnitte den Graphen zweimal. [Zeigen](?mode=graph&cur=step&xl=2)

</details>

## Hinweise für Lehrkräfte

- **Einsatz (Bezug als Entwurf):** Jahrgangsstufe 8, Lernbereich 1 „Funktion und Term“: Funktion als eindeutige Zuordnung, Definitions- und Wertemenge, Graphen. Gut als Einstieg (Alltagszuordnungen im Pfeildiagramm) und zur Sicherung (Linientest, Umkehrung).
- **Darstellungen:** Pfeildiagramm, Wertetabelle und Graph sind synchron – antippen oder ziehen ändert alle drei. Rot markiert sind Elemente mit mehreren Pfeilen (Zahl) oder ohne Pfeil (?). Mit `show=0` werden Färbung und Urteil ausgeblendet; die Lernenden entscheiden selbst.
- **Linientest:** Die Leiste unter dem Graphen zeigt, wie viele Schnittpunkte die senkrechte Gerade an jeder besuchten Stelle hat. Bei Funktionsgraphen markiert die Simulation $D$ (türkis, auf der $x$-Achse) und $W$ (lila, auf der $y$-Achse). Der Halbkreis $f(x) = \sqrt{9 - x^2}$ greift der Wurzel aus Jahrgangsstufe 9 vor und kann auch nur als Graph betrachtet werden.
- **Typische Fehlvorstellungen:**
  - „Wenn zwei Pfeile beim selben Element ankommen, ist es keine Funktion.“ – Es kommt nur auf die ausgehenden Pfeile an.
  - „Eine Funktion braucht eine Formel.“ – Auch Kind $\mapsto$ Geburtsmonat ist eine Funktion.
  - „Ein Graph muss zusammenhängend sein.“ – Hyperbel und Treppenfunktion sind Funktionsgraphen.
  - Der Linientest wird waagrecht statt senkrecht ausgeführt.
