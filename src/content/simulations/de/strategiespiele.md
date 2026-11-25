## Worum geht es?

Auf dem Tisch liegen 15 Streichhölzer. Zwei Spieler nehmen abwechselnd **1, 2 oder 3** Hölzer. Wer das **letzte** Holz nimmt, hat gewonnen. Das klingt nach Glück, ist es aber nicht: Mit der richtigen **Strategie** gewinnt man immer, wenn man gut startet.

### Rückwärts denken

Man überlegt vom Spielende her:

- Liegen 1, 2 oder 3 Hölzer da, nimmt man alle und gewinnt.
- Liegen **4** Hölzer da, ist man in der Klemme: Egal, ob man 1, 2 oder 3 nimmt, der andere kann den Rest nehmen. 4 ist eine **Verlustposition** für den, der am Zug ist.
- Bei 5, 6 oder 7 Hölzern nimmt man so viele, dass 4 übrig bleiben. Dann steckt der Gegner in der Klemme.
- **8** ist wieder eine Verlustposition, ebenso **12**, **16** und so weiter.

### Die Gewinnstrategie

Darf man höchstens $k$ Hölzer nehmen, sind die Vielfachen von $k + 1$ die Verlustpositionen. Die Strategie lautet deshalb: **Lass immer ein Vielfaches von $k + 1$ liegen.** Wie viele man dafür nehmen muss, verrät der **Rest** beim Teilen durch $k + 1$. Bei 15 Hölzern und $k = 3$ ist $15 : 4 = 3$ Rest $3$. Man nimmt also 3 und lässt 12 übrig.

Liegt schon ein Vielfaches von $k + 1$ vor dir, hast du gegen einen klugen Gegner keine Chance. Dann hilft nur hoffen, dass er einen Fehler macht.

### Nim mit mehreren Haufen

Beim klassischen **Nim** gibt es mehrere Haufen. Man darf aus **einem** Haufen beliebig viele Hölzer nehmen. Die Strategie ist hier überraschend: Man schreibt die Haufengrößen im **Zweiersystem** untereinander und addiert jede Stelle ohne Übertrag (1 + 1 = 0). Das Ergebnis heißt **Nim-Summe**. Wer immer eine Nim-Summe von 0 hinterlässt, gewinnt.

### Strategie- und Zufallsspiele

Bei diesen Spielen gibt es keinen Zufall. Alles hängt von den Zügen ab, und deshalb kann man sie vollständig durchschauen. Bei **Zufallsspielen** wie Würfelspielen kann man dagegen nur Wahrscheinlichkeiten ausrechnen. Der Zufall entscheidet mit.

## Ausprobieren

- [15 Hölzer, 1 bis 3](?mode=ein&n=15&k=3&first=ich): Spiel ein paar Runden gegen den Computer. Wann gewinnst du?
- [Computer beginnt bei 12](?mode=ein&n=12&k=3&first=pc): Jetzt hat der Computer ein Problem. Kannst du gewinnen?
- [Nim 3 – 4 – 5](?mode=mehr&h1=3&h2=4&h3=5&first=ich): Schalte die Strategie ein und achte auf die Nim-Summe.

## Aufgaben

**1. Verlustpositionen.** Man darf 1 bis 4 Hölzer nehmen. Welche Anzahlen sind Verlustpositionen? [Aufgabe laden](?mode=ein&n=20&k=4&hint=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

Die Vielfachen von 5, also 5, 10, 15, 20 und so weiter.

</details>

**2. Erster Zug.** Es liegen 17 Hölzer da, man darf 1 bis 3 nehmen. Wie viele nimmst du zuerst?

<details><summary>Lösung anzeigen</summary>

$17 : 4 = 4$ Rest $1$, also nimmst du 1 und lässt 16 übrig.

</details>

**3. Wer soll anfangen?** Bei 20 Hölzern und „1 bis 3“: Willst du anfangen oder lieber den anderen anfangen lassen?

<details><summary>Lösung anzeigen</summary>

20 ist ein Vielfaches von 4. Wer am Zug ist, verliert bei richtigem Spiel des Gegners. Also lässt du den anderen anfangen.

</details>

**4. Nim-Summe.** Berechne die Nim-Summe von 1, 2 und 3. [Aufgabe laden](?mode=mehr&h1=1&h2=2&h3=3&hint=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$01 \oplus 10 \oplus 11 = 00$, also 0. Wer hier am Zug ist, verliert gegen einen klugen Gegner.

</details>
