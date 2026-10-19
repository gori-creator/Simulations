---
description: "Interaktive Simulation für die 11. und 12. Klasse: Monotonie, Extrem- und Wendestellen ganzrationaler Funktionen Schritt für Schritt – notwendige und hinreichende Bedingung, Vorzeichentabelle, Terrassenpunkte und frei wählbare Koeffizienten."
---

## Worum geht es?

Bei einer **Funktionsuntersuchung** bestimmt man mit Hilfe der Ableitungen, wo der Graph steigt oder fällt, wo er Hoch- und Tiefpunkte hat und wo er seine Krümmung ändert.

1. **Ableitungen bilden:** $f'(x)$ und $f''(x)$.
2. **Notwendige Bedingung:** An einer Extremstelle ist die Tangente waagrecht, also $f'(x) = 0$. Die Lösungen sind nur **Kandidaten**.
3. **Hinreichende Bedingung:** Wechselt $f'$ an der Stelle das Vorzeichen von $+$ nach $-$, liegt ein **Hochpunkt** vor, von $-$ nach $+$ ein **Tiefpunkt**. Ohne Vorzeichenwechsel ist es ein **Terrassenpunkt** (Sattelpunkt). Alternativ: $f''(x) < 0$ ⇒ Hochpunkt, $f''(x) > 0$ ⇒ Tiefpunkt.
4. **Wendestellen:** $f''(x) = 0$ mit Vorzeichenwechsel von $f''$. Dort wechselt der Graph zwischen **Linkskurve** ($f'' > 0$) und **Rechtskurve** ($f'' < 0$).
5. **Monotonie:** Wo $f' > 0$, ist $f$ streng monoton steigend; wo $f' < 0$, streng monoton fallend.

*Beispiel:* $f(x) = x^3 - 3x$, $f'(x) = 3x^2 - 3 = 0 \Rightarrow x = \pm 1$. Vorzeichen von $f'$: $+ \,|\, - \,|\, +$, also Hochpunkt $H(-1 \mid 2)$ und Tiefpunkt $T(1 \mid -2)$; $f''(x) = 6x = 0$ ergibt den Wendepunkt $W(0 \mid 0)$.

**Vorsicht:** $f''(x) = 0$ heißt nicht automatisch „keine Extremstelle“: $f(x) = x^4$ hat bei $0$ einen Tiefpunkt, obwohl $f''(0) = 0$ – das Vorzeichenwechsel-Kriterium hilft hier weiter.

## Ausprobieren

1. [f(x) = x³ − 3x](?q=0&a=1&b=0&c=-3&d=0&st=1): Drücke „Nächster Schritt“ und verfolge die Untersuchung im Graphen.
2. Verändere den Koeffizienten vor $x$. Ab welchem Wert verschwinden die Extrempunkte?
3. [Terrassenpunkt](?q=0&a=1&b=0&c=0&d=0&st=4): Warum ist $x = 0$ kein Extremum?
4. [x⁴](?q=1&a=0&b=0&c=0&d=0&st=4): Warum versagt hier das Kriterium mit $f''$?
5. [W-Form](?q=0.5&a=0&b=-2&c=0&d=0&st=5&der=1): Vergleiche die Nullstellen von $f'$ und $f''$ mit den besonderen Punkten.

## Aufgaben

### Aufgabe 1: Vollständige Untersuchung

Untersuche $f(x) = -x^3 + 3x^2$ auf Extrem- und Wendepunkte und gib die Monotonieintervalle an. [Aufgabe laden](?q=0&a=-1&b=3&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = -3x^2 + 6x = -3x(x - 2)$, Kandidaten $0$ und $2$. Vorzeichen von $f'$: $- \,|\, + \,|\, -$, also $T(0 \mid 0)$, $H(2 \mid 4)$. $f''(x) = -6x + 6 = 0 \Rightarrow W(1 \mid 2)$. Streng monoton fallend für $x \leq 0$ und $x \geq 2$, steigend für $0 \leq x \leq 2$. [Lösung zeigen](?q=0&a=-1&b=3&c=0&d=0&st=5)

</details>

### Aufgabe 2: W-Form

Bestimme die Extrempunkte von $f(x) = 0{,}5x^4 - 2x^2$. [Aufgabe laden](?q=0.5&a=0&b=-2&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 2x^3 - 4x = 2x(x^2 - 2) = 0 \Rightarrow x = 0, \pm\sqrt{2}$. $T(\pm\sqrt{2} \mid -2)$, $H(0 \mid 0)$. [Lösung zeigen](?q=0.5&a=0&b=-2&c=0&d=0&st=5)

</details>

### Aufgabe 3: Gegenbeispiel

Zeige an einem Beispiel, dass $f'(x_0) = 0$ nicht hinreichend für eine Extremstelle ist.

<details>
<summary>Lösung anzeigen</summary>

$f(x) = x^3$: $f'(0) = 0$, aber $f'$ ist links und rechts von $0$ positiv – kein Vorzeichenwechsel, also ein Terrassenpunkt. [Zeigen](?q=0&a=1&b=0&c=0&d=0&st=4)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 11 (Monotonie, Extrem- und Wendestellen; notwendige und hinreichende Bedingungen), LehrplanPLUS Gymnasium Bayern.
- **Schrittweise:** Mit „Werte aus“ rechnen die Lernenden jeden Schritt selbst und prüfen ihn anschließend.
- **Parameter erkunden:** Wann hat $x^3 + cx$ Extrempunkte? (Nur für $c < 0$.) Das bereitet Funktionenscharen vor.
- **Häufige Stolpersteine:**
  - Die notwendige Bedingung wird schon als Nachweis eines Extremums gesehen.
  - Bei Hoch- und Tiefpunkten wird nur die $x$-Koordinate angegeben.
  - Bei $f''(x_0) = 0$ wird vorschnell „kein Extremum“ geschlossen.
