---
description: "Interaktive Simulation für die 11. und 12. Klasse: Kurvendiskussion ganzrationaler Funktionen in sieben Schritten – Symmetrie, Verhalten im Unendlichen, Nullstellen, Monotonie, Extrem- und Wendestellen mit notwendiger und hinreichender Bedingung, Graphen von f′ und f″ darunter, wandernde Tangente und Vorzeichentabelle."
---

## Worum geht es?

Bei einer **Funktionsuntersuchung** bestimmt man mit Hilfe der Ableitungen, wo der Graph steigt oder fällt, wo er Hoch- und Tiefpunkte hat und wo er seine Krümmung ändert.

1. **Ableitungen bilden:** $f'(x)$ und $f''(x)$.
2. **Symmetrie und Verhalten im Unendlichen:** Kommen nur gerade Exponenten vor, ist der Graph **achsensymmetrisch zur y-Achse**, bei nur ungeraden Exponenten **punktsymmetrisch zum Ursprung**. Für $x \to \pm\infty$ entscheidet der Summand mit dem höchsten Exponenten (Grad und Vorzeichen des Leitkoeffizienten).
3. **Nullstellen:** $f(x) = 0$, oft durch Ausklammern oder Substitution.
4. **Notwendige Bedingung:** An einer Extremstelle ist die Tangente waagrecht, also $f'(x) = 0$. Die Lösungen sind nur **Kandidaten**.
5. **Hinreichende Bedingung:** Wechselt $f'$ an der Stelle das Vorzeichen von $+$ nach $-$, liegt ein **Hochpunkt** vor, von $-$ nach $+$ ein **Tiefpunkt**. Ohne Vorzeichenwechsel ist es ein **Terrassenpunkt** (Sattelpunkt). Alternativ: $f''(x) < 0$ ⇒ Hochpunkt, $f''(x) > 0$ ⇒ Tiefpunkt.
6. **Wendestellen:** $f''(x) = 0$ mit Vorzeichenwechsel von $f''$. Dort wechselt der Graph zwischen **Linkskurve** ($f'' > 0$) und **Rechtskurve** ($f'' < 0$).
7. **Monotonie und Krümmung:** Wo $f' > 0$, ist $f$ streng monoton steigend; wo $f' < 0$, streng monoton fallend.

Unter dem Graphen von $f$ zeigt die Simulation die Graphen von $f'$ und $f''$ – grün, wo sie positiv sind, rot, wo sie negativ sind. Die gestrichelten senkrechten Linien verbinden die Nullstellen von $f'$ mit den Extremstellen und die Nullstellen von $f''$ mit den Wendestellen. „Tangente wandern lassen“ zeigt: Die Steigung der Tangente an $f$ ist genau der Wert von $f'$.

*Beispiel:* $f(x) = x^3 - 3x$, $f'(x) = 3x^2 - 3 = 0 \Rightarrow x = \pm 1$. Vorzeichen von $f'$: $+ \,|\, - \,|\, +$, also Hochpunkt $H(-1 \mid 2)$ und Tiefpunkt $T(1 \mid -2)$; $f''(x) = 6x = 0$ ergibt den Wendepunkt $W(0 \mid 0)$.

**Vorsicht:** $f''(x) = 0$ heißt nicht automatisch „keine Extremstelle“: $f(x) = x^4$ hat bei $0$ einen Tiefpunkt, obwohl $f''(0) = 0$ – das Vorzeichenwechsel-Kriterium hilft hier weiter.

## Ausprobieren

1. [f(x) = x³ − 3x](?q=0&a=1&b=0&c=-3&d=0&st=1): Drücke „Nächster Schritt“ und verfolge die Untersuchung im Graphen. Lass dann die Tangente wandern: Wo ist $f'$ null, wo am kleinsten?
2. Verändere den Koeffizienten vor $x$. Ab welchem Wert verschwinden die Extrempunkte?
3. [Terrassenpunkt](?q=0&a=1&b=0&c=0&d=0&st=6): Warum ist $x = 0$ kein Extremum?
4. [x⁴](?q=1&a=0&b=0&c=0&d=0&st=6): Warum versagt hier das Kriterium mit $f''$? Schau auf den Graphen von $f'$ darunter.
5. [W-Form](?q=0.5&a=0&b=-2&c=0&d=0&st=7&der=1): Vergleiche die Nullstellen von $f'$ und $f''$ mit den besonderen Punkten. Welche Symmetrie hat der Graph?
6. [Symmetrie](?q=0&a=1&b=0&c=-3&d=0&st=2): Setze das Absolutglied auf $1$. Was passiert mit der Punktsymmetrie?

## Aufgaben

### Aufgabe 1: Vollständige Untersuchung

Untersuche $f(x) = -x^3 + 3x^2$ auf Extrem- und Wendepunkte und gib die Monotonieintervalle an. [Aufgabe laden](?q=0&a=-1&b=3&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = -3x^2 + 6x = -3x(x - 2)$, Kandidaten $0$ und $2$. Vorzeichen von $f'$: $- \,|\, + \,|\, -$, also $T(0 \mid 0)$, $H(2 \mid 4)$. $f''(x) = -6x + 6 = 0 \Rightarrow W(1 \mid 2)$. Streng monoton fallend für $x \leq 0$ und $x \geq 2$, steigend für $0 \leq x \leq 2$. [Lösung zeigen](?q=0&a=-1&b=3&c=0&d=0&st=7)

</details>

### Aufgabe 2: W-Form

Bestimme die Extrempunkte von $f(x) = 0{,}5x^4 - 2x^2$. [Aufgabe laden](?q=0.5&a=0&b=-2&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 2x^3 - 4x = 2x(x^2 - 2) = 0 \Rightarrow x = 0, \pm\sqrt{2}$. $T(\pm\sqrt{2} \mid -2)$, $H(0 \mid 0)$. Wegen der Achsensymmetrie genügt es, $x \geq 0$ zu untersuchen. [Lösung zeigen](?q=0.5&a=0&b=-2&c=0&d=0&st=7)

</details>

### Aufgabe 3: Gegenbeispiel

Zeige an einem Beispiel, dass $f'(x_0) = 0$ nicht hinreichend für eine Extremstelle ist.

<details>
<summary>Lösung anzeigen</summary>

$f(x) = x^3$: $f'(0) = 0$, aber $f'$ ist links und rechts von $0$ positiv – kein Vorzeichenwechsel, also ein Terrassenpunkt. [Zeigen](?q=0&a=1&b=0&c=0&d=0&st=6)

</details>

### Aufgabe 4: Kurvendiskussion in sieben Schritten

Untersuche $f(x) = -0{,}25x^4 + x^3$ vollständig: Symmetrie, Verhalten für $x \to \pm\infty$, Nullstellen, Extrem- und Wendepunkte, Monotonie. [Aufgabe laden](?q=-0.25&a=1&b=0&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Gerade und ungerade Exponenten: keine einfache Symmetrie. Leitkoeffizient $-0{,}25$ bei Grad $4$: $f(x) \to -\infty$ für $x \to \pm\infty$. Nullstellen: $x^3(-0{,}25x + 1) = 0 \Rightarrow x = 0$ (dreifach) und $x = 4$. $f'(x) = -x^3 + 3x^2 = x^2(3 - x)$: Kandidaten $0$ und $3$. Bei $0$ wechselt $f'$ das Vorzeichen nicht (positiv auf beiden Seiten) – Terrassenpunkt $(0 \mid 0)$; bei $3$ von $+$ nach $-$: $H(3 \mid 6{,}75)$, auch $f''(3) = -9 < 0$. $f''(x) = -3x^2 + 6x = -3x(x - 2)$: $W_1(0 \mid 0)$, $W_2(2 \mid 4)$. Streng monoton steigend für $x \leq 3$, fallend für $x \geq 3$. [Lösung zeigen](?q=-0.25&a=1&b=0&c=0&d=0&st=7)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 11 (Monotonie, Extrem- und Wendestellen; notwendige und hinreichende Bedingungen), LehrplanPLUS Gymnasium Bayern.
- **Schrittweise:** Mit „Ergebnisse zeigen“ aus rechnen die Lernenden jeden Schritt selbst und prüfen ihn anschließend.
- **Graphisches Ableiten:** Die Graphen von $f'$ und $f''$ abdecken, skizzieren lassen und dann einblenden.
- **Parameter erkunden:** Wann hat $x^3 + cx$ Extrempunkte? (Nur für $c < 0$.) Das bereitet Funktionenscharen vor.
- **Häufige Stolpersteine:**
  - Die notwendige Bedingung wird schon als Nachweis eines Extremums gesehen.
  - Bei Hoch- und Tiefpunkten wird nur die $x$-Koordinate angegeben.
  - Bei $f''(x_0) = 0$ wird vorschnell „kein Extremum“ geschlossen.
  - Ein Absolutglied wird bei der Symmetrie übersehen: $x^3 - 3x + 1$ ist nicht punktsymmetrisch zum Ursprung.
