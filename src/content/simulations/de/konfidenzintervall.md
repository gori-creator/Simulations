---
description: "Prognose- und Konfidenzintervalle: viele Stichproben ziehen und sehen, wie oft die Intervalle das wahre p treffen – mit Prognoseintervall, Konfidenzellipse und nötigem Stichprobenumfang."
---

## Worum geht es?

**Prognoseintervall (p bekannt):** Wirft man eine faire Münze $n = 100$-mal, schwankt die relative Häufigkeit $h$ der Zahl um $p = 0{,}5$. Mit der Standardabweichung $\sigma = \sqrt{p(1-p)/n} = 0{,}05$ liegt $h$ mit rund 95 % Wahrscheinlichkeit im Intervall

$$
[\,p - 1{,}96\,\sigma;\; p + 1{,}96\,\sigma\,] = [0{,}402;\; 0{,}598].
$$

**Konfidenzintervall (p unbekannt):** Meist ist es umgekehrt: Eine Umfrage liefert $h$, gesucht ist $p$. Bei $n = 100$ und $h = 0{,}4$ ergibt die Näherung

$$
h \pm 1{,}96\sqrt{\frac{h(1-h)}{n}} = 0{,}4 \pm 0{,}096 = [0{,}304;\; 0{,}496].
$$

Wichtig: Das **Intervall** ist zufällig, nicht $p$. „95 %“ bedeutet: Zieht man sehr viele Stichproben und berechnet jedes Mal so ein Intervall, dann treffen rund 95 % dieser Intervalle das wahre $p$. Genau das zeigt die Simulation – grüne Intervalle treffen, rote verfehlen.

| Sicherheit $\gamma$ | 90 % | 95 % | 99 % |
| --- | --- | --- | --- |
| $z$ | 1,64 | 1,96 | 2,58 |

**Konfidenzellipse:** Alle Paare $(p \mid h)$ mit $|h - p| \le z\sqrt{p(1-p)/n}$ bilden im $p$-$h$-Diagramm eine Ellipse. Senkrecht bei $p$ liest man das Prognoseintervall ab, waagerecht bei $h$ das Konfidenzintervall – ohne die Näherung $\sigma \approx \sqrt{h(1-h)/n}$.

**Stichprobenumfang:** Damit das Intervall höchstens $\pm\varepsilon$ breit ist, braucht man $n \ge z^2\,p(1-p)/\varepsilon^2$. Ohne Vorwissen setzt man $p = 0{,}5$: Für $\pm 3\,\%$ bei 95 % sind das $n \ge 1068$ Befragte.

## Ausprobieren

1. Ziehe 100 Stichproben. Wie viele Intervalle verfehlen $p$? Wiederhole das ein paarmal. [Laden](?mode=conf&p=0.4&n=100&level=95&method=wald)
2. Schalte auf 99 % um. Was passiert mit der Breite und mit der Trefferquote?
3. Verdecke $p$ und schätze es aus den Intervallen. [p verdeckt](?mode=conf&p=0.37&n=200&level=95&show=0)
4. Kleines $p$, kleines $n$: Warum trifft die Näherung viel seltener als 95 %? Vergleiche mit „Exakt über die Konfidenzellipse“. [Laden](?mode=conf&p=0.05&n=30&level=95&method=wald)
5. Ziehe in der Konfidenzellipse $h$ und $p$. Wann liegt der Punkt $(p \mid h)$ in der Ellipse? [Ellipse](?mode=ellipse&n=100&h=0.4&p=0.5&level=95&method=wilson)
6. Hypothesentest: Ist eine Münze gezinkt, wenn bei 100 Würfen 60-mal Kopf fällt? [Test](?mode=test&n=100&p0=0.5&side=right&alpha=5&kobs=60&p=0.6)
7. Lege den Ablehnungsbereich selbst fest. Was passiert mit α und β? [Eigene Regel](?mode=test&n=100&p0=0.5&side=right&alpha=5&kobs=60&p=0.6&own=1&kc=56)
8. Wie oft treffen 95-%-Intervalle bei n = 30 wirklich? [Trefferquote](?mode=cover&n=30&level=95&p=0.1)
9. Übe mit Rechenaufgaben zu Intervallen und Tests. [Üben](?mode=ex&q=1)

## Aufgaben

### Aufgabe 1: Prognoseintervall

Eine Münze wird 400-mal geworfen. In welchem Bereich liegt die Anzahl der Würfe mit Zahl mit etwa 95 % Wahrscheinlichkeit?

<details>
<summary>Lösung anzeigen</summary>

$\mu = 200$, $\sigma = \sqrt{400 \cdot 0{,}25} = 10$, also $200 \pm 19{,}6$: zwischen 181 und 219. [In der Simulation zeigen](?mode=prog&p=0.5&n=400&level=95)

</details>

### Aufgabe 2: Konfidenzintervall

Bei einer Umfrage unter 100 Personen sind 40 dafür. Bestimme das 95-%-Konfidenzintervall.

<details>
<summary>Lösung anzeigen</summary>

Näherung: $[0{,}304;\; 0{,}496]$. Über die Konfidenzellipse: $[0{,}309;\; 0{,}498]$. [In der Simulation zeigen](?mode=ellipse&n=100&h=0.4&p=0.4&level=95&method=wilson)

</details>

### Aufgabe 3: Stichprobenumfang

Wie viele Personen muss man befragen, damit das 95-%-Intervall höchstens $\pm 5\,\%$ breit ist?

<details>
<summary>Lösung anzeigen</summary>

$n \ge (1{,}96 / 0{,}1)^2 = 384{,}2$, also mindestens 385 Personen. [In der Simulation zeigen](?mode=size&eps=0.05&level=95)

</details>

### Aufgabe: Gezinkte Münze?

Eine Münze wird 100-mal geworfen. Man testet $H_0$: $p = 0{,}5$ gegen $H_1$: $p > 0{,}5$ mit $\alpha = 5\,\%$. Bestimme den Ablehnungsbereich. Wie groß ist der Fehler 2. Art, wenn in Wahrheit $p = 0{,}6$ gilt?

<details>
<summary>Lösung anzeigen</summary>

$P(X \ge 59) \approx 4{,}4\,\%$, aber $P(X \ge 58) \approx 6{,}7\,\%$. Also wird $H_0$ ab 59 Kopf verworfen. Bei $p = 0{,}6$ gilt $P(X \le 58) \approx 37{,}7\,\%$: So oft bleibt man irrtümlich bei $H_0$. [In der Simulation zeigen](?mode=test&n=100&p0=0.5&side=right&alpha=5&kobs=60&p=0.6)

</details>

## Ideen für den Unterricht

- **Einsatz:** Der Wechsel „von $p$ auf $h$“ (Prognose) und „von $h$ auf $p$“ (Konfidenz) wird an derselben Ellipse sichtbar.
- **Häufige Missverständnisse:**
  - „$p$ liegt mit 95 % Wahrscheinlichkeit im Intervall“ – $p$ ist fest, das Intervall schwankt.
  - Doppelte Genauigkeit braucht nicht doppelt, sondern viermal so viele Befragte.
  - Die Näherung mit $h$ statt $p$ ist bei kleinem $n$ oder $p$ nahe 0 bzw. 1 unzuverlässig (Laplace-Bedingung $\sigma > 3$).
- **Bezug zum Lehrplan:** Ob mit Näherung oder Konfidenzellipse gerechnet wird und welche $z$-Werte üblich sind, ist unterschiedlich – bitte am eigenen Lehrplan prüfen.
