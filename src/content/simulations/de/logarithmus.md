---
description: "Interaktive Simulation zum Logarithmus als Umkehrung des Potenzierens: Graphen von bˣ und log_b x mit animierter Spiegelung an y = x, Rechengesetze als Pfeile auf einer logarithmischen Skala und Exponentialgleichungen mit Basiswechsel lösen."
---

## Worum geht es?

Beim Potenzieren fragt man: Was ergibt $2^3$? Antwort: $8$. Der **Logarithmus** stellt die umgekehrte Frage: **„2 hoch wie viel ergibt 8?“** Antwort: $3$. Man schreibt $\log_2 8 = 3$.

$$
\log_b y = x \quad\Longleftrightarrow\quad b^x = y \qquad (b > 0,\; b \neq 1,\; y > 0)
$$

Dabei heißt $b$ die **Basis** und $y$ der **Numerus**. Zwei Logarithmen haben eigene Namen: der **Zehnerlogarithmus** $\lg y = \log_{10} y$ und der **natürliche Logarithmus** $\ln y = \log_e y$ mit der eulerschen Zahl $e \approx 2{,}718$.

- **Nicht definiert:** Für $y \le 0$ gibt es keinen Logarithmus, denn $b^x$ ist immer positiv. Die Basis $b = 1$ ist ausgeschlossen, weil $1^x = 1$ für alle $x$ gilt.
- **Besondere Werte:** $\log_b 1 = 0$ (denn $b^0 = 1$) und $\log_b b = 1$ (denn $b^1 = b$). Zahlen zwischen $0$ und $1$ haben bei $b > 1$ negative Logarithmen, z. B. $\log_2 0{,}5 = -1$.
- **Umkehrfunktion:** Die Funktion $f(x) = \log_b x$ ist die Umkehrfunktion von $g(x) = b^x$. Ihr Graph entsteht durch **Spiegelung an der Geraden $y = x$**: Aus dem Punkt $(x \mid b^x)$ wird $(b^x \mid x)$.
- **Steckbrief** von $f(x) = \log_b x$: $D = \mathbb{R}^+$, $W = \mathbb{R}$, Nullstelle $x = 1$, Punkt $(b \mid 1)$, senkrechte Asymptote $x = 0$; streng monoton steigend für $b > 1$, fallend für $0 < b < 1$.

**Rechengesetze** (für $u, v > 0$): Sie folgen direkt aus den Potenzgesetzen, z. B. $b^m \cdot b^n = b^{m+n}$.

$$
\log_b(u \cdot v) = \log_b u + \log_b v \qquad \log_b \frac{u}{v} = \log_b u - \log_b v \qquad \log_b\left(u^r\right) = r \cdot \log_b u
$$

**Exponentialgleichungen** wie $2^x = 10$ löst man durch Logarithmieren: $x = \log_2 10$. Mit dem Taschenrechner hilft der **Basiswechsel**:

$$
x = \log_b c = \frac{\lg c}{\lg b}, \qquad \text{z. B.}\quad \log_2 10 = \frac{\lg 10}{\lg 2} = \frac{1}{0{,}30103\ldots} \approx 3{,}3219
$$

Die Simulation schreibt „=“ bei exakten Werten (z. B. $\log_2 8 = 3$) und „≈“ bei gerundeten Werten (z. B. $\lg 20 \approx 1{,}3010$).

## Ausprobieren

1. Ziehe den Punkt $P$ auf dem blauen Graphen von $y = 2^x$. Sein Spiegelbild $P'$ auf dem roten Graphen von $y = \log_2 x$ hat die Koordinaten vertauscht. Lies an $P'$ ab: $\log_2 4 = 2$, $\log_2 0{,}5 = -1$.
2. Klicke auf **An y = x spiegeln**: Der Exponentialgraph klappt um die Gerade $y = x$ und wird zum Logarithmusgraphen. Die Musterpunkte wandern dabei senkrecht zu $y = x$.
3. Ziehe den Punkt $B(1 \mid b)$ nach unten unter $1$. Was passiert mit beiden Graphen? Warum springt die Basis über die $1$ hinweg? [Beispiel laden](?b=0.5&x=-2)
4. Tippe im Bild auf die Basen $2$, $e$, $10$ und $0{,}5$. Welche Punkte bleiben immer gleich? [Natürlicher Logarithmus](?e=1&x=1)
5. Wähle die Ansicht **Rechengesetze** und klicke auf **Pfeile aneinanderlegen**: Zwei Pfeile der Längen $\log_2 4 = 2$ und $\log_2 8 = 3$ ergeben zusammen $\log_2 32 = 5$ – und $4 \cdot 8 = 32$. So funktionierte früher der **Rechenschieber**. [Beispiel laden](?view=laws)
6. Ziehe die Pfeilenden und beobachte die Rechnung. Probiere auch Quotienten- und Potenzregel. [Beispiel mit lg](?view=laws&b=10&u=20&v=50)
7. Wähle **Exponentialgleichung lösen** und ziehe den Schnittpunkt $S$. Zwischen welchen ganzen Zahlen liegt die Lösung von $2^x = 10$? [Beispiel laden](?view=solve&c=10)

## Aufgaben

### Aufgabe 1: Logarithmen im Kopf

Bestimme ohne Taschenrechner: $\log_2 32$, $\log_3 \frac{1}{9}$, $\lg 0{,}001$, $\log_5 1$ und $\log_4 2$.

<details>
<summary>Lösung anzeigen</summary>

$\log_2 32 = 5$, denn $2^5 = 32$. $\log_3 \frac{1}{9} = -2$, denn $3^{-2} = \frac{1}{9}$. $\lg 0{,}001 = -3$, denn $10^{-3} = 0{,}001$. $\log_5 1 = 0$, denn $5^0 = 1$. $\log_4 2 = 0{,}5$, denn $4^{0{,}5} = \sqrt{4} = 2$. [In der Simulation zeigen](?view=solve&c=32)

</details>

### Aufgabe 2: Eine Exponentialgleichung lösen

Löse $2^x = 10$. Grenze die Lösung zuerst zwischen zwei ganzen Zahlen ein und berechne sie dann mit dem Basiswechsel auf zwei Nachkommastellen. [Aufgabe laden](?view=solve&c=10&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Wegen $2^3 = 8 < 10 < 16 = 2^4$ gilt $3 < x < 4$. Genau: $x = \log_2 10 = \frac{\lg 10}{\lg 2} = \frac{1}{0{,}30103} \approx 3{,}32$. Probe: $2^{3{,}32} \approx 9{,}99$. [In der Simulation zeigen](?view=solve&c=10)

</details>

### Aufgabe 3: Noch eine Gleichung

Löse $3^x = 50$ und mache die Probe. [Aufgabe laden](?view=solve&b=3&c=50&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$3^3 = 27 < 50 < 81 = 3^4$, also $3 < x < 4$. $x = \frac{\lg 50}{\lg 3} = \frac{1{,}69897}{0{,}47712} \approx 3{,}561$. Probe: $3^{3{,}561} \approx 50{,}0$. [In der Simulation zeigen](?view=solve&b=3&c=50)

</details>

### Aufgabe 4: Rechengesetze anwenden

Berechne ohne Taschenrechner: a) $\lg 20 + \lg 50$, b) $\log_2 48 - \log_2 3$, c) $\log_3\left(9^4\right)$.

<details>
<summary>Lösung anzeigen</summary>

a) $\lg 20 + \lg 50 = \lg(20 \cdot 50) = \lg 1000 = 3$. [Zeigen](?view=laws&b=10&u=20&v=50)

b) $\log_2 48 - \log_2 3 = \log_2 \frac{48}{3} = \log_2 16 = 4$. [Zeigen](?view=laws&law=quot&u=48&v=3)

c) $\log_3\left(9^4\right) = 4 \cdot \log_3 9 = 4 \cdot 2 = 8$. [Zeigen](?view=laws&law=pow&b=3&u=9&r=4)

</details>

### Aufgabe 5: Basis kleiner als 1

Für welches $x$ gilt $0{,}5^x = 8$? Begründe am Graphen, warum die Lösung negativ ist.

<details>
<summary>Lösung anzeigen</summary>

$0{,}5^{-3} = 2^3 = 8$, also $x = \log_{0{,}5} 8 = -3$. Der Graph von $y = 0{,}5^x$ ist fallend und hat bei $x = 0$ den Wert $1$; Werte größer als $1$ werden also nur für $x < 0$ angenommen. [In der Simulation zeigen](?view=solve&b=0.5&c=8)

</details>

### Aufgabe 6: Wann verdoppelt sich das Kapital?

Ein Guthaben wächst jedes Jahr um $5\,\%$, also mit dem Faktor $1{,}05$. Nach wie vielen Jahren hat es sich verdoppelt?

<details>
<summary>Lösung anzeigen</summary>

$1{,}05^x = 2 \Rightarrow x = \frac{\lg 2}{\lg 1{,}05} = \frac{0{,}30103}{0{,}02119} \approx 14{,}2$. Nach rund $14{,}2$ Jahren, also im 15. Jahr, hat sich das Guthaben verdoppelt. [In der Simulation zeigen](?view=solve&b=1.05&c=2)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 10, Lernbereich „Exponentielles Wachstum und Logarithmus“ (LehrplanPLUS Bayern, Gymnasium): Einführung des Logarithmus über die Frage „$b$ hoch wie viel?“, Exponentialgleichungen, Rechengesetze. Die Logarithmus*funktion* und der natürliche Logarithmus $\ln$ als Umkehrfunktion der $e$-Funktion gehören nach unserem Verständnis in die Oberstufe (Jahrgangsstufe 12) – bitte am Lehrplan prüfen, welche Teile in Ihrer Jahrgangsstufe vorgesehen sind.
- **Einstieg ohne Formel:** Die Wertetabelle von $2^x$ „rückwärts lesen“ lassen und dann mit der Spiegelung an $y = x$ zum Graphen übergehen.
- **Rechenschieber:** Die Ansicht „Rechengesetze“ eignet sich, um zu zeigen, warum man vor dem Taschenrechner mit Logarithmentafeln und Rechenschiebern multiplizierte: Aus einer Multiplikation wird eine Addition von Strecken.
- **Häufige Stolpersteine:**
  - „$\log_b(u + v) = \log_b u + \log_b v$“ – falsch; das Produktgesetz gilt für das **Produkt**, z. B. $\lg(20 + 50) \neq \lg 20 + \lg 50 = 3$.
  - „$\log_2 0{,}5$ gibt es nicht“ – doch: $-1$. Nur für Zahlen $\le 0$ ist der Logarithmus nicht definiert.
  - Beim Basiswechsel werden Zähler und Nenner vertauscht: richtig ist $\log_b c = \frac{\lg c}{\lg b}$ – die Probe $b^x \approx c$ deckt den Fehler sofort auf.
  - Die Basis $b = 1$ wird versucht: $1^x = 1$ liefert für $c \neq 1$ keine und für $c = 1$ unendlich viele Lösungen.
- **Aufgabenmodus:** Mit `info=0` und **Teilen → Ergebnisse verdecken** werden Logarithmen und Lösungen im Bild durch „?“ ersetzt; mit **Lösung zeigen** lässt sich die Lösung animiert aufdecken.
