---
description: "Interaktive Simulation für die 13. Klasse: Extremwertprobleme mit Differentialrechnung – Schachtel aus Karton, Dose mit kleinster Oberfläche und Rechteck unter einer e-Funktion, mit Bild, Zielfunktion und vollständigem Lösungsweg."
---

## Worum geht es?

Bei einem **Extremwertproblem** sucht man den größten oder kleinsten Wert einer Größe – das größte Volumen, die kleinste Oberfläche, die größte Fläche. Das Vorgehen ist immer ähnlich:

1. **Zielfunktion:** Die Größe, die optimal werden soll, als Formel (z. B. $V = \text{Länge} \cdot \text{Breite} \cdot \text{Höhe}$).
2. **Nebenbedingung:** Zusammenhänge zwischen den Variablen nutzen, sodass nur noch **eine** Variable übrig bleibt.
3. **Definitionsbereich:** Welche Werte sind im Sachzusammenhang sinnvoll?
4. **Notwendige Bedingung:** Ableitung null setzen.
5. **Ergebnis prüfen:** Art des Extremums (Vorzeichenwechsel oder zweite Ableitung) und **Randwerte** vergleichen; Antwort im Sachzusammenhang.

*Beispiel Schachtel:* Aus einem Karton $30\,\text{cm} \times 20\,\text{cm}$ werden an den Ecken Quadrate der Seitenlänge $x$ ausgeschnitten und die Ränder hochgeklappt. $V(x) = x(30 - 2x)(20 - 2x)$ für $0 < x < 10$. Aus $V'(x) = 12x^2 - 200x + 600 = 0$ folgt $x \approx 3{,}92\,\text{cm}$ und $V \approx 1056\,\text{cm}^3$.

*Beispiel Dose:* Eine Dose soll $1\,\text{L}$ fassen und möglichst wenig Blech verbrauchen. Mit $h = \frac{V}{\pi r^2}$ wird $O(r) = 2\pi r^2 + \frac{2V}{r}$; das Minimum liegt bei $r = \sqrt[3]{\frac{V}{2\pi}} \approx 5{,}42\,\text{cm}$ – und dann ist $h = 2r$: Die ideale Dose ist so hoch wie breit.

## Ausprobieren

1. [Schachtel](?prob=box&a=30&b=20&x=2): Ziehe den Punkt auf dem Graphen. Wie verändert sich die Schachtel?
2. Drücke „Zum Optimum“. Vergleiche die Tangente dort mit anderen Stellen.
3. [Quadratischer Karton](?prob=box&a=24&b=24&x=2): Gilt $x = \frac{a}{6}$?
4. [1-Liter-Dose](?prob=can&v=1000&x=3): Wie sieht die Dose mit der kleinsten Oberfläche aus?
5. [Getränkedose](?prob=can&v=350&x=3.3): Echte Getränkedosen sind schlanker als das Optimum. Warum könnte das so sein?
6. [Rechteck unter der e-Funktion](?prob=rect&x=0.8): Welche Breite liefert die größte Fläche?

## Aufgaben

### Aufgabe 1: Schachtel

Aus einem quadratischen Karton mit $24\,\text{cm}$ Seitenlänge soll eine oben offene Schachtel mit größtem Volumen entstehen. [Aufgabe laden](?prob=box&a=24&b=24&x=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V(x) = x(24 - 2x)^2$, $0 < x < 12$. $V'(x) = (24 - 2x)(24 - 6x) = 0 \Rightarrow x = 4$ (die Lösung $x = 12$ liegt am Rand). $V(4) = 4 \cdot 16^2 = 1024\,\text{cm}^3$. [Lösung zeigen](?prob=box&a=24&b=24&x=4)

</details>

### Aufgabe 2: Dose

Bestimme Radius und Höhe einer $1$-Liter-Dose mit kleinster Oberfläche. [Aufgabe laden](?prob=can&v=1000&x=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$O'(r) = 4\pi r - \frac{2000}{r^2} = 0 \Rightarrow r^3 = \frac{500}{\pi} \Rightarrow r \approx 5{,}42\,\text{cm}$, $h = \frac{1000}{\pi r^2} \approx 10{,}84\,\text{cm} = 2r$, $O \approx 553{,}6\,\text{cm}^2$. [Lösung zeigen](?prob=can&v=1000&x=5.4)

</details>

### Aufgabe 3: Rechteck

Ein Rechteck liegt mit zwei Seiten auf den Koordinatenachsen, eine Ecke liegt auf dem Graphen von $f(x) = 3e^{-0{,}5x}$. Für welches $u$ ist die Fläche maximal? [Aufgabe laden](?prob=rect&x=0.8&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A(u) = 3u e^{-0{,}5u}$, $A'(u) = 3e^{-0{,}5u}(1 - 0{,}5u) = 0 \Rightarrow u = 2$; $A(2) = \frac{6}{e} \approx 2{,}21$. [Lösung zeigen](?prob=rect&x=2)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 13 (Extremwertprobleme mit verknüpften Funktionen), LehrplanPLUS Gymnasium Bayern; die Schachtel auch schon in Jahrgangsstufe 11.
- **Basteln:** Schachteln aus DIN-A4-Papier mit verschiedenen $x$ falten und das Volumen messen, bevor gerechnet wird.
- **Modellkritik:** Warum sind echte Dosen nicht optimal? (Falz, Stabilität, Handhabung, Werbefläche.)
- **Häufige Stolpersteine:**
  - Die Nebenbedingung wird nicht genutzt – die Zielfunktion hat noch zwei Variablen.
  - Der Definitionsbereich wird vergessen, Lösungen außerhalb werden übernommen.
  - Die Randwerte werden nicht geprüft.
