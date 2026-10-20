---
description: "Interaktive Simulation für die 11. und 12. Klasse: Kurvendiskussion ganzrationaler Funktionen in sieben animierten Schritten – Ableitungen, Symmetrie, Nullstellen, notwendige und hinreichende Bedingung, Vorzeichentabellen für f′ und f″, Hoch-, Tief-, Terrassen- und Wendepunkte, Monotonie und Krümmung, mit ziehbarer Tangente und den Graphen von f′ und f″ darunter."
---

## Worum geht es?

Bei einer **Funktionsuntersuchung** (Kurvendiskussion) liest man mit Hilfe der Ableitungen ab, wo der Graph von $f$ steigt oder fällt, wo er Hoch- und Tiefpunkte hat und wo er seine Krümmung ändert. Die Simulation geht in sieben Schritten vor:

1. **Ableitungen bilden:** mit der Potenzregel $(x^n)' = n \cdot x^{n-1}$ für jeden Summanden, z. B. $f(x) = x^3 - 3x$, $f'(x) = 3x^2 - 3$, $f''(x) = 6x$.
2. **Symmetrie und Verhalten für $x \to \pm\infty$:** Nur gerade Hochzahlen ⇒ achsensymmetrisch zur $y$-Achse, nur ungerade ⇒ punktsymmetrisch zum Ursprung. Für $x \to \pm\infty$ entscheidet der Summand mit der höchsten Hochzahl.
3. **Nullstellen:** $f(x) = 0$, oft durch Ausklammern oder Substitution.
4. **Notwendige Bedingung:** An einer Extremstelle ist die Tangente waagrecht, also $f'(x_0) = 0$. Die Lösungen sind nur **Kandidaten**.
5. **Hinreichende Bedingung:** Wechselt $f'$ bei $x_0$ das Vorzeichen von $+$ nach $-$, liegt ein **Hochpunkt** vor, von $-$ nach $+$ ein **Tiefpunkt**. Ohne Vorzeichenwechsel (VZW) ist es ein **Terrassenpunkt**. Gegenprobe mit dem $f''$-Kriterium: $f''(x_0) < 0$ ⇒ Hochpunkt, $f''(x_0) > 0$ ⇒ Tiefpunkt.
6. **Wendestellen:** $f''(x_0) = 0$ **mit** Vorzeichenwechsel von $f''$ (hinreichend auch: $f'''(x_0) \neq 0$). Dort wechselt der Graph zwischen **Linkskurve** ($f'' > 0$) und **Rechtskurve** ($f'' < 0$).
7. **Monotonie und Krümmung:** Wo $f' > 0$, ist $f$ streng monoton steigend, wo $f' < 0$, streng monoton fallend.

Die **Vorzeichentabelle** fasst Schritt 5 zusammen. Für $f(x) = x^3 - 3x$ mit $f'(x) = 3(x + 1)(x - 1)$:

| $x$ | $x < -1$ | $-1$ | $-1 < x < 1$ | $1$ | $x > 1$ |
| --- | --- | --- | --- | --- | --- |
| $f'(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
| $G_f$ | steigt | $H(-1 \mid 2)$ | fällt | $T(1 \mid -2)$ | steigt |

Also ist $f$ streng monoton steigend in $]-\infty; -1]$ und $[1; \infty[$, fallend in $[-1; 1]$. Aus $f''(x) = 6x = 0$ folgt der Wendepunkt $W(0 \mid 0)$.

**Vorsicht beim $f''$-Kriterium:** Ist $f''(x_0) = 0$, sagt es nichts aus. $f(x) = x^4$ hat bei $0$ trotzdem einen **Tiefpunkt** ($f'$ wechselt von $-$ nach $+$), aber keinen Wendepunkt, weil $f''(x) = 12x^2$ das Vorzeichen nicht wechselt. $f(x) = x^3$ hat bei $0$ einen Terrassenpunkt – das ist zugleich ein Wendepunkt mit waagrechter Tangente.

In der Simulation stehen die Graphen von $f'$ und $f''$ mit gemeinsamer $x$-Achse unter $f$, grün wo sie positiv, rot wo sie negativ sind. Gestrichelte Linien verbinden die Nullstellen von $f'$ mit den Extrempunkten und die von $f''$ mit den Wendepunkten. Der Punkt $P$ trägt die Tangente: Ihre Steigung ist genau der Wert von $f'$ darunter.

## Ausprobieren

1. [f(x) = x³ − 3x](?q=0&a=1&b=0&c=-3&d=0&st=1&px=-2): Drücke mehrmals „Nächster Schritt“ (oder tippe die Punkte 1–7 in der Karte an) und verfolge, wie sich die Vorzeichentabelle Zelle für Zelle füllt.
2. Ziehe $P$ langsam über den Graphen oder drücke „Tangente wandern lassen“. Wo ist der Balken im Bild von $f'$ am längsten, wo verschwindet er? An einer waagrechten Tangente rastet $P$ ein. [Tangente bei x₀ = 2](?q=0&a=1&b=0&c=-3&d=0&st=1&px=2): Prüfe $t(x) = 9x - 16$.
3. Ziehe den Punkt auf der $y$-Achse nach oben und unten. Was ändert sich an $f'$ und $f''$, was an den Extremstellen und an den Hoch- und Tiefwerten?
4. Verändere den Koeffizienten vor $x$ in [x³ + c·x](?q=0&a=1&b=0&c=-3&d=0&st=5). Ab welchem Wert von $c$ verschwinden Hoch- und Tiefpunkt?
5. [Terrassenpunkt x³](?q=0&a=1&b=0&c=0&d=0&st=6&px=-1) und [x⁴](?q=1&a=0&b=0&c=0&d=0&st=6&px=-1): Vergleiche jeweils die Vorzeichentabellen von $f'$ und $f''$. Warum ist $x = 0$ einmal ein Extremum und einmal nicht?

## Aufgaben

### Aufgabe 1: Vollständige Untersuchung

Untersuche $f(x) = -x^3 + 3x^2$ auf Extrem- und Wendepunkte und gib die Monotonieintervalle an. [Aufgabe laden](?q=0&a=-1&b=3&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = -3x^2 + 6x = -3x(x - 2)$, Kandidaten $0$ und $2$. Vorzeichen von $f'$: $- \mid + \mid -$, also $T(0 \mid 0)$ und $H(2 \mid 4)$; Gegenprobe $f''(0) = 6 > 0$, $f''(2) = -6 < 0$. $f''(x) = -6x + 6 = 0 \Rightarrow x = 1$ mit VZW: $W(1 \mid 2)$. Streng monoton fallend in $]-\infty; 0]$ und $[2; \infty[$, steigend in $[0; 2]$. [In der Simulation zeigen](?q=0&a=-1&b=3&c=0&d=0&st=7)

</details>

### Aufgabe 2: W-Form

Bestimme Extrem- und Wendepunkte von $f(x) = x^4 - 2x^2$. [Aufgabe laden](?q=1&a=0&b=-2&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 4x^3 - 4x = 4x(x - 1)(x + 1)$: Kandidaten $-1$, $0$, $1$. Vorzeichen $- \mid + \mid - \mid +$, also $T(-1 \mid -1)$, $H(0 \mid 0)$, $T(1 \mid -1)$. $f''(x) = 12x^2 - 4 = 0 \Rightarrow x = \pm\frac{1}{\sqrt{3}} \approx \pm 0{,}58$ mit VZW; $f\left(\pm\frac{1}{\sqrt{3}}\right) = \frac{1}{9} - \frac{2}{3} = -\frac{5}{9} \approx -0{,}56$. Wegen der Achsensymmetrie genügt es, $x \geq 0$ zu untersuchen. [In der Simulation zeigen](?q=1&a=0&b=-2&c=0&d=0&st=7)

</details>

### Aufgabe 3: Wenn das f″-Kriterium schweigt

Zeige, dass $f'(x_0) = 0$ nicht hinreichend für eine Extremstelle ist, und dass aus $f''(x_0) = 0$ nicht „kein Extremum“ folgt.

<details>
<summary>Lösung anzeigen</summary>

$f(x) = x^3$: $f'(0) = 0$, aber $f'(x) = 3x^2$ ist links und rechts von $0$ positiv – kein VZW, also ein Terrassenpunkt $(0 \mid 0)$. [Zeigen](?q=0&a=1&b=0&c=0&d=0&st=5&px=-1) $f(x) = x^4$: $f'(0) = 0$ und $f''(0) = 0$, doch $f'(x) = 4x^3$ wechselt von $-$ nach $+$: Tiefpunkt $(0 \mid 0)$. [Zeigen](?q=1&a=0&b=0&c=0&d=0&st=6&px=-1)

</details>

### Aufgabe 4: Kurvendiskussion in sieben Schritten

Untersuche $f(x) = -0{,}25x^4 + x^3$ vollständig: Symmetrie, Verhalten für $x \to \pm\infty$, Nullstellen, Extrem- und Wendepunkte, Monotonie und Krümmung. [Aufgabe laden](?q=-0.25&a=1&b=0&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Gerade und ungerade Hochzahlen: keine einfache Symmetrie. Leitkoeffizient $-0{,}25$ bei Grad $4$: $f(x) \to -\infty$ für $x \to \pm\infty$. Nullstellen: $x^3(1 - 0{,}25x) = 0 \Rightarrow x = 0$ (dreifach) und $x = 4$. $f'(x) = -x^3 + 3x^2 = x^2(3 - x)$: bei $0$ kein VZW (Terrassenpunkt $(0 \mid 0)$), bei $3$ von $+$ nach $-$: $H(3 \mid 6{,}75)$, Gegenprobe $f''(3) = -9 < 0$. $f''(x) = -3x^2 + 6x = -3x(x - 2)$: $W_1(0 \mid 0)$ und $W_2(2 \mid 4)$. Streng monoton steigend in $]-\infty; 3]$, fallend in $[3; \infty[$; rechtsgekrümmt in $]-\infty; 0[$ und $]2; \infty[$, linksgekrümmt in $]0; 2[$. [In der Simulation zeigen](?q=-0.25&a=1&b=0&c=0&d=0&st=7&px=1)

</details>

### Aufgabe 5: Steckbrief selbst erstellen

Erstelle den Steckbrief von $f(x) = x^3 - 3x^2 + 2$ und decke die Ergebnisse danach Schritt für Schritt auf. [Aufgabe laden](?q=0&a=1&b=-3&c=0&d=2&st=1&px=-1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 3x^2 - 6x = 3x(x - 2)$: $H(0 \mid 2)$ wegen $f''(0) = -6 < 0$ und $T(2 \mid -2)$ wegen $f''(2) = 6 > 0$. $f''(x) = 6x - 6 = 0 \Rightarrow W(1 \mid 0)$. Nullstellen: $x = 1$ und aus $x^2 - 2x - 2 = 0$ noch $x = 1 \pm \sqrt{3}$, also $x \approx -0{,}73$ und $x \approx 2{,}73$. Keine Symmetrie zum Ursprung oder zur $y$-Achse (der Graph ist aber punktsymmetrisch zum Wendepunkt). [In der Simulation zeigen](?q=0&a=1&b=-3&c=0&d=2&st=7&px=-1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Im LehrplanPLUS Gymnasium Bayern passt die Simulation zum Lernbereich „Anwendung der Differentialrechnung bei der Untersuchung ganzrationaler Funktionen“ (Jahrgangsstufe 11; Symmetrie und Nullstellen auch zu den ganzrationalen Funktionen der Jahrgangsstufe 10) – die genaue Zuordnung bitte am Lehrplan prüfen. Geeignet zur Erarbeitung, zur Übung und zum Wiederholen vor Prüfungen.
- **Erst rechnen, dann aufdecken:** Mit „Ergebnisse zeigen“ aus rechnen die Lernenden jeden Schritt auf Papier, gehen mit „Nächster Schritt“ weiter und prüfen mit „Ergebnisse aufdecken“.
- **Graphisches Ableiten:** „Graphen von f′ und f″“ ausschalten, $f'$ skizzieren lassen und dann einblenden – die Hilfslinien zeigen, ob die Nullstellen an der richtigen Stelle sitzen.
- **Parameter erkunden:** Wann hat $x^3 + cx$ Extrempunkte? (Nur für $c < 0$.) Das bereitet Funktionenscharen vor.
- **Häufige Stolpersteine:**
  - Die notwendige Bedingung $f'(x_0) = 0$ wird schon als Nachweis eines Extremums gesehen.
  - Bei $f''(x_0) = 0$ wird vorschnell „kein Extremum“ oder „Wendepunkt“ geschlossen.
  - Bei Hoch- und Tiefpunkten fehlt die $y$-Koordinate.
  - Ein Absolutglied wird bei der Symmetrie übersehen: $x^3 - 3x + 1$ ist nicht punktsymmetrisch zum Ursprung.
  - Monotonie wird aus dem Vorzeichen von $f$ statt von $f'$ abgelesen.
