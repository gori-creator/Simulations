---
description: "Interaktive Simulation für die Oberstufe: gebrochen-rationale Funktionen aus Linearfaktoren – Zähler-Perlen in Pol-Ringe ziehen und zusehen, wie sich ein Faktor kürzt und aus der Polstelle ein Loch wird; Polstellen mit und ohne Vorzeichenwechsel, waagrechte und schräge Asymptoten mit Polynomdivision Schritt für Schritt, Wertetabelle an der Polstelle, Vorzeichentabelle und Blick aus der Ferne."
---

## Worum geht es?

Eine **gebrochen-rationale Funktion** ist ein Quotient zweier ganzrationaler Funktionen. Hier ist sie in Linearfaktoren gegeben, zum Beispiel

$$f(x) = \frac{(x-1)(x+1)}{x-2}.$$

Die Nullstellen des Nenners gehören nicht zur **Definitionsmenge**, hier $D = \mathbb{R} \setminus \{2\}$. Was an einer solchen **Definitionslücke** passiert, entscheidet der Zähler:

- **Polstelle:** Der Faktor kürzt sich nicht (vollständig) weg, zum Beispiel bei $\frac{x-1}{(x-1)^2} = \frac{1}{x-1}$. Der Graph schmiegt sich an die **senkrechte Asymptote** $x = 2$, die Funktionswerte streben gegen $+\infty$ oder $-\infty$. Kommt der Nennerfaktor einfach (allgemein: ungerade oft) vor, wechselt das Vorzeichen (**mit VZW**), bei einem doppelten Faktor wie $(x-1)^2$ nicht (**ohne VZW**).
- **Behebbare Lücke:** Zähler und Nenner haben denselben Linearfaktor, und er kommt im Zähler mindestens so oft vor wie im Nenner. Nach dem Kürzen ist $f$ dort stetig fortsetzbar; im Graphen bleibt ein **Loch**. Beispiel: $\frac{(x-1)(x+1)}{x-1} = x + 1$ für $x \neq 1$, Loch bei $(1 \mid 2)$. Die Definitionsmenge ändert sich durch das Kürzen nicht.

Für $x \to \pm\infty$ vergleicht man den Zählergrad $m$ mit dem Nennergrad $n$:

| Grade | Verhalten für $x \to \pm\infty$ |
|---|---|
| $m < n$ | waagrechte Asymptote $y = 0$ |
| $m = n$ | waagrechte Asymptote $y = \frac{\text{Leitkoeffizient Zähler}}{\text{Leitkoeffizient Nenner}}$ |
| $m = n + 1$ | schräge Asymptote (Polynomdivision) |
| $m > n + 1$ | ganzrationale Näherungskurve (Polynomdivision) |

Die **Polynomdivision** zerlegt $f(x) = s(x) + \frac{r(x)}{q(x)}$ mit einem Rest $r$, dessen Grad kleiner als der des Nenners $q$ ist. Der Bruch $\frac{r(x)}{q(x)}$ geht für $x \to \pm\infty$ gegen $0$, also nähert sich der Graph $y = s(x)$. Beispiel: $(x^2 - 1) : (x - 2) = x + 2$ Rest $3$, also $f(x) = x + 2 + \frac{3}{x-2}$ und $y = x + 2$ ist schräge Asymptote. Bei $x = 40$ ist der Abstand nur noch $\frac{3}{38} \approx 0{,}079$.

## Ausprobieren

1. [Eine Polstelle](?zn=1&z1=1&pn=1&p1=-2): Ziehe die grüne Perle (Zählernullstelle, ein Punkt) und den roten Ring (Nennernullstelle, ein Kreis mit Kreuz) auf der $x$-Achse. Was passiert mit der Asymptote $y = 1$, was mit den Pfeilen an der Polstelle?
2. **Lücke statt Pol:** [Lade dieses Beispiel](?zn=2&z1=2&z2=-1&pn=1&p1=1) und ziehe die Perle bei $x = 2$ in den Ring bei $x = 1$. Beobachte den Term: Beide Faktoren werden durchgestrichen, die senkrechte Asymptote schrumpft zu einem Loch. Ziehe die Perle wieder heraus.
3. [Doppelte Polstelle](?zn=0&a=2&pn=2&p1=1&p2=1): Warum zeigen beide Äste nach oben? Vergleiche mit dem Vorzeichenstreifen an der $x$-Achse.
4. [Schräge Asymptote](?zn=2&z1=1&z2=-1&pn=1&p1=2): Drücke „Polynomdivision Schritt für Schritt“ und verfolge die Rechnung wie an der Tafel. Lass danach einen Punkt am Graphen entlanglaufen: Der Maßpfeil zeigt die Abweichung $f(x) - s(x) = \frac{3}{x-2}$.
5. [Aus der Ferne](?zn=2&z1=1&z2=-1&pn=1&p1=2&far=1): Schalte „Blick aus der Ferne“ ein und aus. Warum verschmilzt der Graph fast mit der Geraden?
6. [Zählergrad 3](?zn=3&z1=-2&z2=0&z3=2&pn=1&p1=-1&a=0.5): Welche Kurve nähert den Graphen für große $|x|$ an?
7. [Wertetabelle an der Polstelle](?zn=1&z1=1&pn=1&p1=-2&tab=1): Wie ändern sich die Werte, wenn $x$ immer näher an $-2$ rückt? Vergleiche mit der [Lücke](?zn=2&z1=1&z2=-1&pn=1&p1=1&tab=1): Dort streben die Werte gegen eine Zahl.
8. [Vorzeichentabelle](?zn=1&z1=0&pn=2&p1=-2&p2=2&a=2&vzt=1): An welchen Stellen kann das Vorzeichen von $f$ wechseln – und wo wechselt es nicht? (In der Tabelle steht „Z“ vor Zählerfaktoren und „N“ vor Nennerfaktoren.)

## Aufgaben

### Aufgabe 1: Steckbrief

Untersuche $f(x) = \frac{x-1}{x+2}$: Definitionsmenge, Nullstelle, Polstelle (mit oder ohne VZW), Asymptoten und $f(0)$. [Aufgabe laden](?zn=1&z1=1&pn=1&p1=-2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$D = \mathbb{R} \setminus \{-2\}$; Nullstelle $x = 1$; Polstelle $x = -2$ mit VZW (links $f(x) \to +\infty$, rechts $f(x) \to -\infty$); $m = n = 1$, also waagrechte Asymptote $y = \frac{1}{1} = 1$, denn $f(x) = 1 - \frac{3}{x+2}$. $f(0) = \frac{-1}{2} = -0{,}5$. [Lösung zeigen](?zn=1&z1=1&pn=1&p1=-2)

</details>

### Aufgabe 2: Loch oder Pol?

Untersuche $f(x) = \frac{x^2-1}{x-1}$ an der Stelle $x = 1$. [Aufgabe laden](?zn=2&z1=1&z2=-1&pn=1&p1=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{x^2-1}{x-1} = \frac{(x-1)(x+1)}{x-1} = x + 1$ für $x \neq 1$. Bei $x = 1$ liegt eine behebbare Lücke, der Graph ist die Gerade $y = x + 1$ mit einem Loch bei $(1 \mid 2)$; $D = \mathbb{R} \setminus \{1\}$. [Lösung zeigen](?zn=2&z1=1&z2=-1&pn=1&p1=1)

</details>

### Aufgabe 3: Polynomdivision

Bestimme die Asymptote von $f(x) = \frac{x^2-1}{x-2}$. [Aufgabe laden](?zn=2&z1=1&z2=-1&pn=1&p1=2&asy=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$(x^2 + 0x - 1) : (x - 2) = x + 2$: Erst $x \cdot (x - 2) = x^2 - 2x$ abziehen, Rest $2x - 1$; dann $2 \cdot (x - 2) = 2x - 4$ abziehen, Rest $3$. Also $f(x) = x + 2 + \frac{3}{x-2}$, schräge Asymptote $y = x + 2$. [Lösung zeigen](?zn=2&z1=1&z2=-1&pn=1&p1=2)

</details>

### Aufgabe 4: Wertetabelle an der Polstelle

Berechne für $f(x) = \frac{x - 1}{x + 2}$ die Werte $f(-2{,}01)$ und $f(-1{,}99)$. Was folgt für das Verhalten an der Polstelle? [Aufgabe laden](?zn=1&z1=1&pn=1&p1=-2&tab=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f(-2{,}01) = \frac{-3{,}01}{-0{,}01} = 301$ und $f(-1{,}99) = \frac{-2{,}99}{0{,}01} = -299$. Je näher $x$ an $-2$ rückt, desto größer werden die Beträge: $f(x) \to +\infty$ von links, $f(x) \to -\infty$ von rechts – eine Polstelle mit Vorzeichenwechsel. [Lösung zeigen](?zn=1&z1=1&pn=1&p1=-2&tab=1)

</details>

### Aufgabe 5: Näherungsparabel

Zeige: $f(x) = \frac{0{,}5\,(x + 2)\,x\,(x - 2)}{x + 1} = 0{,}5x^2 - 0{,}5x - 1{,}5 + \frac{1{,}5}{x+1}$. [Aufgabe laden](?zn=3&z1=-2&z2=0&z3=2&pn=1&p1=-1&a=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ausmultipliziert ist der Zähler $0{,}5x^3 - 2x$. Division durch $(x + 1)$: $0{,}5x^2$, Rest $-0{,}5x^2 - 2x$; dann $-0{,}5x$, Rest $-1{,}5x$; dann $-1{,}5$, Rest $1{,}5$. Probe: $(0{,}5x^2 - 0{,}5x - 1{,}5)(x + 1) + 1{,}5 = 0{,}5x^3 - 2x$. Näherungskurve: die Parabel $y = 0{,}5x^2 - 0{,}5x - 1{,}5$. [Lösung zeigen](?zn=3&z1=-2&z2=0&z3=2&pn=1&p1=-1&a=0.5)

</details>

### Aufgabe 6: Darf der Graph die Asymptote schneiden?

Untersuche, ob der Graph von $f(x) = \frac{(x+1)(x-3)}{(x+3)(x-1)}$ seine waagrechte Asymptote schneidet. [Aufgabe laden](?zn=2&z1=-1&z2=3&pn=2&p1=-3&p2=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Gleiche Grade, Leitkoeffizienten $1$ und $1$: Asymptote $y = 1$. $f(x) = 1 \iff x^2 - 2x - 3 = x^2 + 2x - 3 \iff x = 0$. Tatsächlich ist $f(0) = \frac{1 \cdot (-3)}{3 \cdot (-1)} = 1$: Der Graph schneidet die Asymptote in $(0 \mid 1)$. Das ist erlaubt – die Annäherung gilt erst für große $|x|$. [Lösung zeigen](?zn=2&z1=-1&z2=3&pn=2&p1=-3&p2=1)

</details>

### Aufgabe 7: Funktion gesucht

Gib eine gebrochen-rationale Funktion an mit einer Polstelle ohne VZW bei $x = 1$ und der waagrechten Asymptote $y = 2$.

<details>
<summary>Lösung anzeigen</summary>

Zum Beispiel $f(x) = \frac{2x^2}{(x-1)^2}$: Nennerfaktor doppelt → ohne VZW; gleiche Grade, Leitkoeffizienten $2$ und $1$ → $y = 2$. [Zeigen](?zn=2&z1=0&z2=0&a=2&pn=2&p1=1&p2=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** LehrplanPLUS Gymnasium Bayern, Jahrgangsstufe 11, Lernbereich 2 (gebrochen-rationale Funktionen – Grenzwerte und Asymptoten) und Jahrgangsstufe 12, Lernbereich 4.1 (Untersuchung gebrochen-rationaler Funktionen). Ob Näherungskurven (Zählergrad größer als Nennergrad + 1) dort verbindlich sind, bitte am Lehrplan prüfen.
- **Entdeckend:** Die Lernenden ziehen eine Zähler-Perle in einen Pol-Ring und beschreiben, was mit Term und Graph passiert – daraus kann der Begriff der behebbaren Lücke entstehen.
- **Steckbriefe:** Mit „Eigenschaften zeigen“ aus bleiben Steckbrief, Polstellen, Lücken, Asymptoten, gekürzter Term und Wertetabelle verdeckt; der Graph bleibt als Kontrolle sichtbar. Nach dem Rechnen deckt „Eigenschaften aufdecken“ alles auf. Aufgabe 7 eignet sich als Partnerarbeit: Eine Person gibt Eigenschaften vor, die andere baut die Funktion nach.
- **Vorzeichen ohne Rechnung:** Das Vorzeichen kann nur an Nullstellen und Polstellen wechseln, und nur bei ungerader Vielfachheit. Vorzeichenstreifen und Vorzeichentabelle machen das sichtbar.
- **Modell:** Zähler und Nenner zerfallen vollständig in Linearfaktoren mit Nullstellen auf halben Einheiten; Nenner wie $x^2 + 1$ kommen nicht vor.
- **Häufige Stolpersteine:**
  - Jede Nennernullstelle wird automatisch als Polstelle bezeichnet (Kürzen vergessen).
  - Die Lücke wird nach dem Kürzen „vergessen“ – die Definitionsmenge ändert sich durch Kürzen nicht.
  - Bei gleichem Grad wird $y = 1$ statt des Quotienten der Leitkoeffizienten angegeben.
  - „Der Graph darf seine Asymptote nicht schneiden.“ – Er darf, siehe Aufgabe 6.
  - Bei der Polynomdivision fehlen Platzhalter wie $0x$, dann verrutschen die Spalten.
