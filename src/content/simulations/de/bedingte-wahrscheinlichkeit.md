---
description: "1000 Personen färben sich nach krank/gesund und nach dem Testergebnis. Nur die positiv Getesteten bleiben übrig – und meist ist nur ein kleiner Teil davon wirklich krank. Mit Baum, umgekehrtem Baum, Formel von Bayes und Zweittest."
---

## Worum geht es?

Ein Test auf eine Krankheit $K$ ist nie perfekt. Drei Zahlen beschreiben die Lage:

- **Prävalenz** $P(K)$: Anteil der Kranken unter den Getesteten, z. B. $1\,\%$.
- **Sensitivität** $P_K(+)$: Anteil der Kranken, bei denen der Test positiv ausfällt, z. B. $90\,\%$.
- **Spezifität** $P_{\overline{K}}(-)$: Anteil der Gesunden, bei denen der Test negativ ausfällt, z. B. $91\,\%$.

Wer ein positives Ergebnis bekommt, will aber etwas anderes wissen: Wie wahrscheinlich bin ich **krank, wenn** der Test positiv ist? Das ist der **positive Vorhersagewert** $P_+(K)$ – die „umgekehrte“ bedingte Wahrscheinlichkeit. (Andere Schreibweise: $P(K \mid +)$.)

Am besten denkt man in **natürlichen Häufigkeiten**. Von $1000$ Personen sind $10$ krank; davon testen $9$ positiv (**richtig positiv**), $1$ negativ (**falsch negativ**). Von den $990$ Gesunden testen $9\,\%$, also $89{,}1 \approx 89$, trotzdem positiv (**falsch positiv**), $901$ negativ (**richtig negativ**). Positiv getestet sind also $9 + 89 = 98$ Personen – und nur $9$ davon sind krank:

$$
P_+(K) = \frac{9}{9 + 89{,}1} \approx 9{,}2\,\%.
$$

Mit den gerundeten Anzahlen ergibt sich fast dasselbe: $\frac{9}{98} \approx 9{,}2\,\%$. Wer ganze Zahlen ohne Runden möchte, rechnet mit $10\,000$ Personen: $100$ Kranke, davon $90$ positiv; $9900$ Gesunde, davon $891$ positiv; also $\frac{90}{90 + 891} \approx 9{,}2\,\%$.

Allgemein ist das der **Satz von Bayes**:

$$
P_+(K) = \frac{P(K) \cdot P_K(+)}{P(K) \cdot P_K(+) + P(\overline{K}) \cdot P_{\overline{K}}(+)} = \frac{0{,}01 \cdot 0{,}9}{0{,}01 \cdot 0{,}9 + 0{,}99 \cdot 0{,}09} = \frac{0{,}009}{0{,}0981} \approx 9{,}2\,\%.
$$

Im **umgekehrten Baum** steht dieser Wert direkt am Ast „positiv → krank“. Der Grund für den kleinen Wert: Es gibt so viele Gesunde, dass schon ein kleiner Anteil Fehlalarme die wenigen richtig positiven weit übertrifft. Wer die Prävalenz (die „Basisrate“) übersieht, schätzt $P_+(K)$ viel zu hoch ein – man nennt das den **Basisraten-Fehler**. Der **negative Vorhersagewert** $P_-(\overline{K}) = \frac{900{,}9}{900{,}9 + 1} \approx 99{,}9\,\%$ ist dagegen sehr hoch.

Ein **Zweittest** nach positivem Ersttest beginnt mit der Gruppe der positiv Getesteten. Ihr Anteil an Kranken – die neue Prävalenz – ist der Vorhersagewert des ersten Tests, $9{,}2\,\%$. Nach zwei positiven Tests (als unabhängig angenommen) ergibt sich $\frac{100}{199} \approx 50{,}3\,\%$.

Die Zahlen in den Beispielen sind **vereinfacht** und dienen nur der Veranschaulichung; echte Tests haben je nach Gerät, Zeitpunkt und Personengruppe andere Werte.

## Ausprobieren

1. Sieh dem Ablauf zu: Erst färben sich die Kranken rot, dann zeigt der Test sein Ergebnis. Kranke tragen außerdem einen Punkt auf dem Körper. Tippe dann auf „Nur die positiv Getesteten“. Wie viele der positiv Getesteten sind wirklich krank? [Beispiel laden](?prev=1&se=90&sp=91&pos=1)
2. Erhöhe die Prävalenz langsam bis $50\,\%$. Wie verändert sich der Vorhersagewert? Der Link zeigt den Endzustand mit Sensitivität und Spezifität von je $90\,\%$. [Häufige Krankheit](?prev=50&se=90&sp=90&pos=1)
3. Stelle die Spezifität auf $100\,\%$. Was passiert mit den falsch positiven? [Spezifität 100 %](?sp=100&pos=1)
4. Verringere die Sensitivität auf $50\,\%$. Ändert sich der Vorhersagewert stark – und was passiert mit den falsch negativen? [Sensitivität 50 %](?se=50)
5. Schalte auf den Baum und kehre ihn um. Welche Zahlen bleiben gleich, welche ändern sich? [Baum](?view=tree&dir=fwd)
6. Mache einen zweiten Test. Wie stark steigt der Vorhersagewert? [Zweittest](?n2=1)

## Aufgaben

### Aufgabe 1: Natürliche Häufigkeiten

Prävalenz $1\,\%$, Sensitivität $90\,\%$, Spezifität $91\,\%$. Bestimme für $1000$ Personen die vier Gruppen und den positiven Vorhersagewert. [Aufgabe laden](?prev=1&se=90&sp=91&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Krank $10$: richtig positiv $9$, falsch negativ $1$. Gesund $990$: falsch positiv $990 \cdot 0{,}09 = 89{,}1 \approx 89$, richtig negativ $900{,}9 \approx 901$. $P_+(K) = \frac{9}{9 + 89{,}1} \approx 9{,}2\,\%$. [In der Simulation zeigen](?prev=1&se=90&sp=91&pos=1)

</details>

### Aufgabe 2: Schnelltest bei geringer Verbreitung (vereinfacht)

Ein Schnelltest hat die Sensitivität $80\,\%$ und die Spezifität $98\,\%$. Die Krankheit ist gerade selten: $0{,}5\,\%$. Wie wahrscheinlich ist eine positiv getestete Person krank? [Aufgabe laden](?prev=0.5&se=80&sp=98&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Von $1000$: $5$ krank, davon $4$ positiv. $995$ gesund, davon $995 \cdot 0{,}02 = 19{,}9 \approx 20$ positiv. $P_+(K) = \frac{0{,}005 \cdot 0{,}8}{0{,}005 \cdot 0{,}8 + 0{,}995 \cdot 0{,}02} = \frac{0{,}004}{0{,}0239} \approx 16{,}7\,\%$ – nur etwa jede sechste positiv getestete Person ist krank. [In der Simulation zeigen](?prev=0.5&se=80&sp=98&pos=1)

</details>

### Aufgabe 3: Mammographie-Screening (vereinfachtes Beispiel)

Angenommen, $0{,}8\,\%$ der untersuchten Frauen haben Brustkrebs, die Sensitivität beträgt $90\,\%$, die Spezifität $93\,\%$. Berechne $P_+(K)$ mit der Formel von Bayes. [Aufgabe laden](?prev=0.8&se=90&sp=93&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P_+(K) = \frac{0{,}008 \cdot 0{,}9}{0{,}008 \cdot 0{,}9 + 0{,}992 \cdot 0{,}07} = \frac{0{,}0072}{0{,}07664} \approx 9{,}4\,\%$. In natürlichen Häufigkeiten: $7{,}2$ richtig positive gegen $69{,}4$ falsch positive je $1000$ Frauen (in der Simulation gerundet $7$ und $69$). Bei $10\,000$ Frauen sind es $72$ richtig positive und $9920 \cdot 0{,}07 = 694{,}4 \approx 694$ falsch positive. [In der Simulation zeigen](?prev=0.8&se=90&sp=93&view=tree&dir=rev)

</details>

### Aufgabe 4: Zweittest

Wer im Beispiel aus Aufgabe 1 positiv getestet wurde, macht einen zweiten, unabhängigen Test derselben Art, der wieder positiv ist. Wie groß ist jetzt die Wahrscheinlichkeit, krank zu sein? [Aufgabe laden](?n2=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Neue Prävalenz $p_2 = P_+(K) = \frac{0{,}009}{0{,}0981} \approx 9{,}17\,\%$. Dann $\frac{p_2 \cdot 0{,}9}{p_2 \cdot 0{,}9 + (1 - p_2) \cdot 0{,}09} = \frac{100}{199} \approx 50{,}3\,\%$. Mit Häufigkeiten: Von den $98{,}1$ positiv Getesteten sind $9$ krank; davon testen $8{,}1$ wieder positiv, von den $89{,}1$ Gesunden $8{,}02$. Also $\frac{8{,}1}{8{,}1 + 8{,}02} \approx 50{,}3\,\%$. [In der Simulation zeigen](?n2=1)

</details>

### Aufgabe 5: Wie gut muss der Test sein?

Prävalenz $1\,\%$, Sensitivität $90\,\%$. Wie groß muss die Spezifität mindestens sein, damit mindestens die Hälfte der positiv Getesteten krank ist? [Aufgabe laden](?prev=1&se=90&sp=91&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Es muss gelten: falsch positive $\le$ richtig positive, also $0{,}99 \cdot (1 - s) \le 0{,}009$, d. h. $1 - s \le 0{,}00909$ und $s \ge 99{,}09\,\%$. Mit $s = 99{,}1\,\%$ ergibt sich $P_+(K) = \frac{0{,}009}{0{,}009 + 0{,}00891} \approx 50{,}3\,\%$. [In der Simulation zeigen](?prev=1&se=90&sp=99.1&pos=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 11, Lernbereich „Bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit“ (LehrplanPLUS Bayern, Gymnasium); medizinische Tests sind dort ein typischer Anwendungsfall. Ob die Formel von Bayes ausdrücklich verlangt ist, bitte am Lehrplan prüfen. Vierfeldertafel und Baumdiagramm vertieft die Simulation [Vierfeldertafel und Mengendiagramm](../vierfeldertafel-mengendiagramm/), Pfadregeln die Simulation [Mehrstufige Zufallsexperimente](../baumdiagramm-pfadregeln/).
- **Einstieg mit Schätzung:** Vor dem Aufdecken schätzen lassen, wie wahrscheinlich ein positiv Getesteter krank ist – die Schätzungen liegen erfahrungsgemäß oft weit über $9\,\%$.
- **Natürliche Häufigkeiten:** Das Symbolbild und der Baum mit Anzahlen machen die Rechnung oft leichter zugänglich als die Formel allein; die Formel von Bayes lässt sich dann aus dem Baum ablesen.
- **Für Aufgaben:** Mit „Ergebnisse anzeigen“ aus erscheinen Anzahlen und Vorhersagewerte als „?“. Prävalenz, Sensitivität und Spezifität bleiben sichtbar.
- **Modell/Vereinfachungen:** Prävalenz, Sensitivität und Spezifität als feste Zahlen; beim Zweittest werden die Tests als unabhängig angenommen. Die Anzahlen im Bild sind gerundet (Summe immer $1000$), die Prozentwerte exakt gerechnet. Es lohnt sich, mit der Klasse zu besprechen, dass ein positives Ergebnis in der Praxis ärztlich abgeklärt wird; die Simulation trifft keine Aussage über einzelne echte Tests.
- **Häufige Stolpersteine:**
  - Sensitivität $P_K(+)$ und Vorhersagewert $P_+(K)$ werden verwechselt („der Test ist zu $90\,\%$ sicher, also bin ich zu $90\,\%$ krank“).
  - Die Prävalenz (Basisrate) wird übersehen.
  - Im umgekehrten Baum werden die Äste der ersten Stufe aus dem Vorwärtsbaum übernommen.
  - Falsch positiv und falsch negativ werden vertauscht.
