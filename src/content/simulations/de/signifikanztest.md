---
description: "Einseitiger Signifikanztest mit der Binomialverteilung: Der Ablehnungsbereich wird automatisch bestimmt, Fehler 1. und 2. Art erscheinen als farbige Flächen in zwei Histogrammen, Stichproben und die Gütefunktion zeigen, wie zuverlässig der Test ist."
---

## Worum geht es?

Ein bewährtes Medikament heilt $60\,\%$ der Patientinnen und Patienten. Ein neues soll besser sein. Man testet es an $n = 50$ Personen; $X$ ist die Anzahl der Geheilten. Ist $X$ „auffällig groß“, spricht das gegen die Annahme, das neue Medikament sei nicht besser.

- **Nullhypothese** $H_0\colon p \le 0{,}6$ (das neue Medikament ist nicht besser), **Gegenhypothese** $H_1\colon p > 0{,}6$.
- **Signifikanzniveau** $\alpha = 5\,\%$: So groß darf die Wahrscheinlichkeit höchstens sein, $H_0$ abzulehnen, obwohl $H_0$ stimmt.
- Gerechnet wird im Grenzfall $p = 0{,}6$, also mit $X \sim B(50;\,0{,}6)$.

Gesucht ist der **Ablehnungsbereich** $\overline{A} = \{k;\,\dots;\,50\}$ mit dem *kleinsten* $k$, für das $P(X \ge k) \le \alpha$ gilt:

$$
P(X \ge 37) \approx 0{,}0280 \le 0{,}05, \qquad P(X \ge 36) \approx 0{,}0540 > 0{,}05.
$$

Also $\overline{A} = \{37;\,\dots;\,50\}$, Annahmebereich $A = \{0;\,\dots;\,36\}$. **Entscheidungsregel:** Lehne $H_0$ ab, wenn $X \ge 37$.

Zwei Fehlentscheidungen sind möglich:

| | $H_0$ ist wahr | $H_1$ ist wahr |
| --- | --- | --- |
| $H_0$ wird abgelehnt | **Fehler 1. Art** | richtig |
| $H_0$ wird nicht abgelehnt | richtig | **Fehler 2. Art** |

Die Wahrscheinlichkeit für den **Fehler 1. Art** ist hier höchstens $P(X \ge 37) \approx 2{,}8\,\%$ – das ist die tatsächliche Irrtumswahrscheinlichkeit, sie ist nie größer als $\alpha$. Für den **Fehler 2. Art** muss man ein wahres $p_1$ aus $H_1$ annehmen. Für $p_1 = 0{,}75$ gilt

$$
\beta = P_{0{,}75}(X \le 36) \approx 0{,}363, \qquad 1 - \beta \approx 0{,}637.
$$

$1 - \beta$ heißt **Macht** (Güte) des Tests. Die **Gütefunktion** zeigt für jedes $p$, wie wahrscheinlich der Test $H_0$ ablehnt. Bei einem linksseitigen Test ($H_1\colon p < p_0$) liegt der Ablehnungsbereich links: größtes $k$ mit $P(X \le k) \le \alpha$.

**Wichtig:** Wird $H_0$ nicht abgelehnt, ist $H_0$ damit **nicht bewiesen** – die Daten widersprechen ihr nur nicht deutlich genug.

## Ausprobieren

1. Tippe im oberen Histogramm auf verschiedene Säulen: So stellst du den Beobachtungswert $x$ ein. Wann wird $H_0$ abgelehnt? [Beispiel laden](?x=36)
2. Stelle $\alpha$ auf $1\,\%$ und auf $10\,\%$. Wie wandert die Grenze, wie ändern sich die rote und die orange Fläche? [α = 1 %](?alpha=1)
3. Drücke „p₁ wandern lassen“ und beobachte, wie $\beta$ schrumpft und der Punkt auf der Gütefunktion nach oben läuft.
4. Setze $p_1 = p_0$. Was zeigt das untere Histogramm jetzt? [Grenzfall](?p1=0.6&x=33)
5. Stelle $p_1 = 0{,}68$ ein und vergleiche die Macht bei $n = 50$ und $n = 200$. [n = 50](?p1=0.68) · [n = 200](?n=200&x=135&p1=0.68)
6. Ziehe mit „100 Stichproben“ viele Stichproben mit $p_1 = p_0$: Wie oft wird $H_0$ (fälschlich) abgelehnt? [p₁ = p₀](?p1=0.6&x=33)

## Aufgaben

### Aufgabe 1: Münze

Eine Münze wird $20$-mal geworfen. Getestet wird $H_0\colon p \le 0{,}5$ gegen $H_1\colon p > 0{,}5$ ($p$: Wahrscheinlichkeit für Wappen) auf dem Niveau $5\,\%$. Bestimme den Ablehnungsbereich. [Aufgabe laden](?ctx=free&n=20&p0=0.5&x=16&p1=0.7&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P(X \ge 15) \approx 0{,}0207 \le 0{,}05$, aber $P(X \ge 14) \approx 0{,}0577 > 0{,}05$. Also $\overline{A} = \{15;\,\dots;\,20\}$; die tatsächliche Irrtumswahrscheinlichkeit beträgt etwa $2{,}1\,\%$. [In der Simulation zeigen](?ctx=free&n=20&p0=0.5&x=16&p1=0.7)

</details>

### Aufgabe 2: Fehler 2. Art

Beim Test aus Aufgabe 1 ist die Münze in Wirklichkeit gezinkt: $p = 0{,}7$. Mit welcher Wahrscheinlichkeit bemerkt der Test das nicht? [Aufgabe laden](?ctx=free&n=20&p0=0.5&x=16&p1=0.7&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\beta = P_{0{,}7}(X \le 14) \approx 0{,}584$. In mehr als der Hälfte der Fälle wird die gezinkte Münze nicht erkannt; die Macht beträgt nur $1 - \beta \approx 0{,}416$. [In der Simulation zeigen](?ctx=free&n=20&p0=0.5&x=16&p1=0.7)

</details>

### Aufgabe 3: Gezinkter Würfel

Ein Würfel wird $60$-mal geworfen; $X$ ist die Anzahl der Sechsen. Getestet wird $H_0\colon p \le \frac{1}{6}$ auf dem Niveau $5\,\%$. Es fallen $18$ Sechsen. Wie lautet die Entscheidung? [Aufgabe laden](?ctx=dice&n=60&x=18&p1=0.25&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P(X \ge 16) \approx 0{,}0338 \le 0{,}05$, $P(X \ge 15) \approx 0{,}0648 > 0{,}05$, also $\overline{A} = \{16;\,\dots;\,60\}$. Wegen $18 \in \overline{A}$ wird $H_0$ abgelehnt: Der Würfel ist auf dem $5\,\%$-Niveau signifikant „sechsenlastig“ – bewiesen ist das nicht. Wäre der Würfel in Ordnung, würde der Test nur mit höchstens etwa $3{,}4\,\%$ Wahrscheinlichkeit so entscheiden. [In der Simulation zeigen](?ctx=dice&n=60&x=18&p1=0.25)

</details>

### Aufgabe 4: Linksseitig – Saatgut

Ein Händler verspricht, dass mindestens $90\,\%$ der Samen keimen. Ein Gärtner sät $100$ Samen und testet $H_0\colon p \ge 0{,}9$ gegen $H_1\colon p < 0{,}9$ ($\alpha = 5\,\%$). Bestimme den Ablehnungsbereich. Es keimen $83$ Samen – Entscheidung? [Aufgabe laden](?ctx=seed&n=100&p0=0.9&side=left&x=83&p1=0.82&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Größtes $k$ mit $P(X \le k) \le 0{,}05$: $P(X \le 84) \approx 0{,}0399$, $P(X \le 85) \approx 0{,}0726$. Also $\overline{A} = \{0;\,\dots;\,84\}$. Wegen $83 \in \overline{A}$ wird $H_0$ abgelehnt. [In der Simulation zeigen](?ctx=seed&n=100&p0=0.9&side=left&x=83&p1=0.82)

</details>

### Aufgabe 5: Strenger oder sicherer?

Beim Medikamententest ($n = 50$, $p_0 = 0{,}6$, $p_1 = 0{,}75$) wird $\alpha$ von $5\,\%$ auf $1\,\%$ verkleinert. Wie ändern sich Ablehnungsbereich und $\beta$? Begründe, warum man nicht beide Fehler gleichzeitig klein machen kann, ohne $n$ zu vergrößern. [Aufgabe laden](?alpha=1&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Bei $\alpha = 1\,\%$: $P(X \ge 39) \approx 0{,}0057$, $P(X \ge 38) \approx 0{,}0133$, also $\overline{A} = \{39;\,\dots;\,50\}$. Der Annahmebereich wird größer, deshalb steigt $\beta = P_{0{,}75}(X \le 38) \approx 0{,}618$ (vorher $0{,}363$). Wer seltener fälschlich ablehnt, lehnt insgesamt seltener ab – auch dann, wenn $H_1$ stimmt. Nur ein größeres $n$ macht beide Verteilungen schmaler und trennt sie besser. [In der Simulation zeigen](?alpha=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 12, Lernbereich „Einseitiger Signifikanztest“ (LehrplanPLUS Bayern, Gymnasium) – Einführung des Vorgehens und Vertiefung zu Fehlern 1. und 2. Art. Die Gütefunktion kann als Ausblick dienen.
- **Schreibweise:** Die Simulation verwendet $H_0\colon p \le p_0$ bzw. $p \ge p_0$ und $\overline{A}$ für den Ablehnungsbereich; manche Bücher schreiben $H_0\colon p = p_0$ oder $K$ – die Rechnung ist dieselbe.
- **Simulation des Fehlers 1. Art:** Mit $p_1 = p_0$ und „100 Stichproben“ lässt sich erleben, dass der Test etwa in $2{,}8\,\%$ der Fälle (tatsächliche Irrtumswahrscheinlichkeit $\alpha^\ast$) fälschlich ablehnt.
- **Häufige Stolpersteine:**
  - „$H_0$ wurde nicht abgelehnt, also ist $H_0$ wahr.“ – Der Test liefert nur keinen ausreichenden Widerspruch.
  - Der kritische Wert wird über $P(X = k) \le \alpha$ statt über die Summe $P(X \ge k)$ bestimmt.
  - Beim Fehler 2. Art wird mit $p_0$ statt mit dem wahren $p_1$ gerechnet.
  - Beim linksseitigen Test wird $P(X \ge k)$ statt $P(X \le k)$ betrachtet.
