## Worum geht es?

Die Binomialverteilung passt, wenn ein Versuch $n$-mal unter gleichen Bedingungen wiederholt wird. Oft ist die Lage aber anders: Man zählt seltene Ereignisse in einem Zeitraum, man zieht ohne Zurücklegen oder man misst eine Wartezeit. Dafür gibt es eigene Verteilungen.

### Poisson-Verteilung: seltene Ereignisse

Wie viele Anrufe kommen in einer Minute an, wie viele Tippfehler stehen auf einer Seite, wie viele Kerne zerfallen in einer Sekunde? Wenn Ereignisse unabhängig und im Mittel $\lambda$-mal auftreten, gilt

$$P(X = k) = \frac{\lambda^k}{k!}\, e^{-\lambda}.$$

Erwartungswert und Varianz sind beide $\lambda$.

**Näherung der Binomialverteilung:** Ist $n$ groß und $p$ klein, mit festem Erwartungswert $\lambda = n \cdot p$, so wird $B(n;\,p)$ der Poisson-Verteilung immer ähnlicher. Im Vergleich sieht man: Bei $n = 20$ gibt es noch Abweichungen, bei $n = 200$ liegen die Umrisse fast genau auf den Säulen.

### Hypergeometrische Verteilung: ohne Zurücklegen

In einer Urne liegen $N$ Kugeln, davon $M$ Treffer. Man zieht $n$ Kugeln **ohne Zurücklegen**. Die Wahrscheinlichkeit für genau $k$ Treffer ist

$$P(X = k) = \frac{\binom{M}{k} \binom{N-M}{n-k}}{\binom{N}{n}}.$$

Beispiel Lotto 6 aus 49: $P(\text{3 Richtige}) = \tfrac{\binom{6}{3}\binom{43}{3}}{\binom{49}{6}} \approx 1{,}77\,\%$. Ist die Urne sehr groß im Vergleich zu $n$, ändert das Ziehen fast nichts – dann ist die Binomialverteilung mit $p = M/N$ eine gute Näherung.

### Exponentialverteilung: Wartezeiten

Treten Ereignisse im Mittel mit der Rate $\lambda$ auf, so ist die Wartezeit bis zum nächsten Ereignis exponentialverteilt. Sie ist eine **stetige** Zufallsgröße mit der Dichte $f(t) = \lambda e^{-\lambda t}$:

$$P(T \le t) = 1 - e^{-\lambda t}, \qquad E(T) = \frac{1}{\lambda}.$$

Die Wahrscheinlichkeit ist die **Fläche** unter der Dichte. Besonders ist die **Gedächtnislosigkeit**: Wer schon eine Stunde gewartet hat, muss im Mittel immer noch $1/\lambda$ warten.

## Ausprobieren

- [3 Anrufe pro Minute](?mode=poisson&lam=3&k=5&vgl=0): Wie wahrscheinlich sind höchstens 5 Anrufe?
- [Poisson ≈ Binomial](?mode=poisson&lam=3&n=200&vgl=1&k=3): Verkleinere $n$. Wann werden die Unterschiede deutlich?
- [Lotto](?mode=hyper&N=49&M=6&z=6&k=3&vgl=1): Vergleiche mit der Binomialverteilung.
- [Wartezeit](?mode=exp&rate=0.5&t=2): Wie lange muss man warten, damit die Wahrscheinlichkeit über 90 % liegt?

## Aufgaben

**1. Callcenter.** Im Mittel kommen 3 Anrufe pro Minute. Wie groß ist die Wahrscheinlichkeit, dass in einer Minute kein Anruf kommt? [Aufgabe laden](?mode=poisson&lam=3&k=0&vgl=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$P(X = 0) = e^{-3} \approx 0{,}050$, also etwa 5 %.

</details>

**2. Qualitätskontrolle.** In einer Lieferung von 20 Teilen sind 4 defekt. Es werden 5 Teile ohne Zurücklegen geprüft. Wie wahrscheinlich ist es, dass kein defektes Teil dabei ist? [Aufgabe laden](?mode=hyper&N=20&M=4&z=5&k=0&vgl=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$P(X = 0) = \dfrac{\binom{4}{0}\binom{16}{5}}{\binom{20}{5}} = \dfrac{4368}{15504} \approx 0{,}282$.

</details>

**3. Wartezeit.** Ein Bauteil fällt im Mittel einmal in 2 Stunden aus ($\lambda = 0{,}5$ pro Stunde). Wie wahrscheinlich hält es höchstens 2 Stunden? [Aufgabe laden](?mode=exp&rate=0.5&t=2&_hide=1)

<details><summary>Lösung anzeigen</summary>

$P(T \le 2) = 1 - e^{-1} \approx 0{,}632$.

</details>
