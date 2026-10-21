---
description: Interaktive Simulation zu exponentiellem Wachstum und Zerfall – Seerosen, Zinseszins und radioaktiver Zerfall mit Verdopplungs- und Halbwertszeit.
---

## Worum geht es?

Beim **exponentiellen Wachstum** ändert sich eine Größe in gleichen Zeitabständen immer um **denselben Faktor** $b$:

$$
f(t) = a \cdot b^t \qquad b = 1 + \frac{p}{100}
$$

- $a$ ist der **Anfangswert**, $b$ der **Wachstumsfaktor**, $p$ die prozentuale Änderung pro Zeitschritt.
- Für $b > 1$ wächst $f$, für $0 < b < 1$ nimmt $f$ ab (**exponentielle Abnahme**, z. B. radioaktiver Zerfall).
- Bei einer Abnahme ist $p$ negativ: Eine Abnahme um $8\,\%$ heißt $p = -8$ und $b = 1 - 0{,}08 = 0{,}92$. Der Wachstumsfaktor ist also nicht $0{,}08$.

Beim **linearen Wachstum** kommt dagegen in jedem Zeitschritt **derselbe Summand** dazu. Am Anfang sehen beide ähnlich aus – auf lange Sicht wächst die Exponentialfunktion aber viel schneller.

Die **Verdopplungszeit** (bzw. **Halbwertszeit**) ist bei exponentiellem Wachstum immer gleich. Aus $b^{T_d} = 2$ bzw. $b^{T_{1/2}} = 0{,}5$ folgt mit dem Logarithmus:

$$
T_d = \log_b 2 = \frac{\lg 2}{\lg b} \qquad T_{1/2} = \log_b 0{,}5 = \frac{\lg 0{,}5}{\lg b}
$$

Statt $\lg$ darf man jeden Logarithmus nehmen, z. B. auch $\ln$. Die Simulation zeigt den Wert auf zwei Stellen gerundet („≈“). Nur wenn er exakt ist, steht „=“ (z. B. $T_d = 1$ Tag bei $p = 100$).

## Ausprobieren

1. Starte die Seerosen mit „Abspielen“. Der Teich ist nach 10 Tagen voll. Wann war er halb voll?
2. Vergleiche beim Zinseszins mit dem linearen Wachstum (einfache Zinsen). [5 % Zinsen](?scenario=zinsen&a=1000&p=5&span=40&linear=1)
3. Beobachte beim radioaktiven Zerfall die einzelnen Kerne. Zerfallen sie gleichmäßig? [Iod-131](?scenario=zerfall&a=1000&p=-8&span=40) Mit $p = -8$ ergibt sich $T_{1/2} \approx 8{,}31$ Tage – nahe an den echten gut 8 Tagen.
4. Schalte die logarithmische y-Achse ein. Was wird aus dem Graphen? [Logarithmisch](?scenario=zinsen&a=1000&p=5&span=60&log=1)

## Aufgaben

### Aufgabe 1: Das Seerosen-Rätsel

Die Seerosen verdoppeln ihre Fläche jeden Tag. Nach 10 Tagen ist der Teich ganz bedeckt. Nach wie vielen Tagen war er halb bedeckt?

<details>
<summary>Lösung anzeigen</summary>

Nach **9 Tagen** – am letzten Tag verdoppelt sich die Fläche von halb auf ganz. Viele schätzen spontan 5 Tage; genau das macht exponentielles Wachstum so schwer vorstellbar. [In der Simulation zeigen](?scenario=seerosen)

</details>

### Aufgabe 2: Zinseszins

$1000\,€$ werden zu $5\,\%$ Zinsen angelegt, die Zinsen jährlich mitverzinst. Wie hoch ist das Guthaben nach 10 Jahren? Wann hat es sich verdoppelt?

<details>
<summary>Lösung anzeigen</summary>

$f(10) = 1000 \cdot 1{,}05^{10} \approx 1628{,}89\,€$. Verdopplungszeit: $T_d = \frac{\ln 2}{\ln 1{,}05} \approx 14{,}2$ Jahre. Ohne Zinseszins wären es nach 10 Jahren nur $1500\,€$. [In der Simulation zeigen](?scenario=zinsen&a=1000&p=5&span=40&linear=1)

</details>

### Aufgabe 3: Halbwertszeit

Iod-131 hat eine Halbwertszeit von etwa 8 Tagen. Welcher Anteil ist nach 24 Tagen noch vorhanden? Wie groß ist die tägliche Abnahme in Prozent?

<details>
<summary>Lösung anzeigen</summary>

24 Tage sind 3 Halbwertszeiten: $\left(\frac{1}{2}\right)^3 = \frac{1}{8} = 12{,}5\,\%$. Täglicher Faktor: $b = 0{,}5^{1/8} \approx 0{,}917$, also etwa $8{,}3\,\%$ Abnahme pro Tag.

</details>

### Aufgabe 4: Faustregel

Für kleine Prozentsätze gilt die Faustregel: Verdopplungszeit $\approx \frac{70}{p}$. Prüfe sie für $p = 2$, $p = 5$ und $p = 10$.

<details>
<summary>Lösung anzeigen</summary>

Exakt: $\frac{\ln 2}{\ln 1{,}02} \approx 35{,}0$, $\frac{\ln 2}{\ln 1{,}05} \approx 14{,}2$, $\frac{\ln 2}{\ln 1{,}1} \approx 7{,}3$. Die Faustregel liefert $35$, $14$ und $7$ – sehr gut für kleine $p$.

</details>

## Ideen für den Unterricht

- **Einsatz:** Bayern Jahrgangsstufe 10 (Exponentialfunktionen, exponentielles Wachstum, Logarithmus).
- **Zerfall:** Jeder der 400 Kerne zerfällt zu einem zufälligen Zeitpunkt; im Mittel folgt die Anzahl der Exponentialfunktion. So wird sichtbar, dass Zerfall ein Zufallsprozess ist.
- **Logarithmische Achse:** Exponentielle Funktionen erscheinen als Geraden – eine gute Vorbereitung auf den Logarithmus.
- **Häufige Stolpersteine:**
  - Exponentielles Wachstum wird wie lineares extrapoliert (Seerosen-Rätsel).
  - „Nach zwei Halbwertszeiten ist alles zerfallen.“ Tatsächlich ist dann noch ein Viertel übrig.
  - Prozentsatz und Wachstumsfaktor werden verwechselt: Bei $8\,\%$ Abnahme ist $b = 0{,}92$, nicht $0{,}08$ oder $1{,}08$. Die Anzeige „Wachstumsfaktor“ zeigt beides nebeneinander.
- **Wertetabelle:** Im Beispiel „Frei“ steht statt des Bildes eine Wertetabelle. Lassen Sie die Faktoren „· b“ zwischen den Zeilen mit den Differenzen beim linearen Wachstum vergleichen.
