## Worum geht es?

Eine **Aussage** ist ein Satz, der entweder **wahr** (w) oder **falsch** (f) ist, zum Beispiel „Es regnet“ oder „7 ist eine Primzahl“. Fragen wie „Wie spät ist es?“ oder Befehle sind keine Aussagen. Aussagen lassen sich mit kleinen Wörtern zu neuen Aussagen **verknüpfen**. Ob das Ergebnis wahr ist, hängt nur von den Wahrheitswerten der Teile ab.

### Die Verknüpfungen

| Name | Zeichen | gelesen | wahr, wenn … |
| --- | --- | --- | --- |
| Negation | $\neg A$ | nicht A | A falsch ist |
| Konjunktion | $A \wedge B$ | A und B | beide wahr sind |
| Disjunktion | $A \vee B$ | A oder B | mindestens eine wahr ist |
| Implikation | $A \rightarrow B$ | wenn A, dann B | nicht A wahr und B falsch ist |
| Äquivalenz | $A \leftrightarrow B$ | A genau dann, wenn B | beide denselben Wert haben |
| Kontravalenz (XOR) | $A \oplus B$ | entweder A oder B | genau eine wahr ist |
| NAND | $\neg(A \wedge B)$ | nicht beide | nicht beide wahr sind |
| NOR | $\neg(A \vee B)$ | weder A noch B | beide falsch sind |

Achtung: Das mathematische „oder“ schließt „beide“ mit ein. Für „entweder … oder“ gibt es das XOR.

Die **Implikation** ist nur in einem Fall falsch: wenn A wahr und B falsch ist. Aus einer falschen Voraussetzung folgt also alles. „Wenn 2 + 2 = 5 ist, dann bin ich der Papst“ ist eine wahre Aussage.

### Wahrheitstafeln

Eine **Wahrheitstafel** listet alle Belegungen der Variablen auf. Bei zwei Variablen sind das 4 Zeilen, bei drei Variablen 8. In jeder Zeile steht der Wahrheitswert der Formel.

### Gleichwertige Formeln

Zwei Formeln sind **äquivalent**, wenn sie in **jeder** Zeile denselben Wert haben. Wichtige Beispiele:

- **De Morgan:** $\neg(A \wedge B) \equiv \neg A \vee \neg B$ und $\neg(A \vee B) \equiv \neg A \wedge \neg B$
- **Implikation:** $A \rightarrow B \equiv \neg A \vee B$
- **Kontraposition:** $A \rightarrow B \equiv \neg B \rightarrow \neg A$
- **Distributivgesetz:** $A \wedge (B \vee C) \equiv (A \wedge B) \vee (A \wedge C)$

Die **Umkehrung** $B \rightarrow A$ ist dagegen **nicht** gleichwertig zu $A \rightarrow B$. „Wenn es regnet, ist die Straße nass“ ist wahr, die Umkehrung „Wenn die Straße nass ist, regnet es“ aber nicht unbedingt.

Eine Formel, die immer wahr ist, heißt **Tautologie**, zum Beispiel $A \vee \neg A$. Eine Formel, die immer falsch ist, heißt **Kontradiktion**, zum Beispiel $A \wedge \neg A$.

### Logik in Schaltungen

Computer rechnen mit genau diesen Verknüpfungen: Strom an bedeutet wahr, Strom aus bedeutet falsch. Die Bausteine heißen **Gatter**. Aus NAND-Gattern allein lassen sich alle anderen bauen, zum Beispiel $\neg A = \neg(A \wedge A)$.

## Ausprobieren

- [Und-Schaltung](?mode=verknuepfung&op=and&a=1&b=1): Schalte A und B. Wann leuchtet die Lampe?
- [Wenn … dann](?mode=verknuepfung&op=impl&a=0&b=1): In welcher Zeile ist die Implikation falsch?
- [De Morgan](?mode=vergleich&pair=demorgan1): Vergleiche beide Spalten Zeile für Zeile.
- [Umkehrung](?mode=vergleich&pair=umkehr&a=0&b=1): In welcher Zeile unterscheiden sich A → B und B → A?

## Aufgaben

**1. Wahrheitswert.** A: „5 ist gerade“, B: „5 ist eine Primzahl“. Bestimme den Wert von $A \vee B$, $A \wedge B$ und $A \rightarrow B$. [Aufgabe laden](?mode=verknuepfung&op=or&a=0&b=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

A ist falsch und B ist wahr. Also ist $A \vee B$ wahr, $A \wedge B$ falsch und $A \rightarrow B$ wahr.

</details>

**2. NOR.** Wann ist „weder A noch B“ wahr? [Aufgabe laden](?mode=verknuepfung&op=nor&a=0&b=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

Nur wenn A und B beide falsch sind.

</details>

**3. Verneinen.** Verneine die Aussage „Ich habe Hunger und Durst“, ohne „nicht (… und …)“ zu verwenden. [Aufgabe laden](?mode=vergleich&pair=demorgan1&_hide=1)

<details><summary>Lösung anzeigen</summary>

Nach De Morgan: „Ich habe keinen Hunger oder ich habe keinen Durst.“

</details>

**4. Tautologie.** Zeige mit einer Wahrheitstafel, dass $A \vee \neg A$ immer wahr ist. [Aufgabe laden](?mode=vergleich&pair=taut&_hide=1)

<details><summary>Lösung anzeigen</summary>

Ist A wahr, so ist $A \vee \neg A$ wahr. Ist A falsch, so ist $\neg A$ wahr und damit auch die Disjunktion.

</details>
