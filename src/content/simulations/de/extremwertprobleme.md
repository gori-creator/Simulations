---
description: "Interaktive Simulation für die 13. Klasse: Extremwertprobleme mit Differentialrechnung – Schachtel aus Karton (mit Falten), Dose mit kleinster Oberfläche, Rechteck unter einer e-Funktion, größter Zylinder im Kegel und schnellster Weg eines Rettungsschwimmers, mit Graph der Ableitung, Randwertvergleich und vollständigem Lösungsweg."
---

## Worum geht es?

Bei einem **Extremwertproblem** sucht man den größten oder kleinsten Wert einer Größe – das größte Volumen, die kleinste Oberfläche, die größte Fläche. Das Vorgehen ist immer ähnlich:

1. **Zielfunktion:** Die Größe, die optimal werden soll, als Formel (z. B. $V = \text{Länge} \cdot \text{Breite} \cdot \text{Höhe}$).
2. **Nebenbedingung:** Zusammenhänge zwischen den Variablen nutzen, sodass nur noch **eine** Variable übrig bleibt.
3. **Definitionsbereich:** Welche Werte sind im Sachzusammenhang sinnvoll?
4. **Notwendige Bedingung:** Ableitung null setzen.
5. **Hinreichende Bedingung:** Art des Extremums mit der zweiten Ableitung oder dem Vorzeichenwechsel der ersten Ableitung prüfen. Der Streifen unter dem Graphen zeigt $Z'$: grün, wo die Zielfunktion steigt, rot, wo sie fällt.
6. **Ränder:** Die Werte am Rand des Definitionsbereichs vergleichen – ein Randwert kann besser sein als jedes lokale Extremum!
7. **Ergebnis:** Antwort im Sachzusammenhang.

*Beispiel Schachtel:* Aus einem Karton $30\,\text{cm} \times 20\,\text{cm}$ werden an den Ecken Quadrate der Seitenlänge $x$ ausgeschnitten und die Ränder hochgeklappt. $V(x) = x(30 - 2x)(20 - 2x)$ für $0 < x < 10$. Aus $V'(x) = 12x^2 - 200x + 600 = 0$ folgt $x \approx 3{,}92\,\text{cm}$ und $V \approx 1056\,\text{cm}^3$.

*Beispiel Dose:* Eine Dose soll $1\,\text{L}$ fassen und möglichst wenig Blech verbrauchen. Mit $h = \frac{V}{\pi r^2}$ wird $O(r) = 2\pi r^2 + \frac{2V}{r}$; das Minimum liegt bei $r = \sqrt[3]{\frac{V}{2\pi}} \approx 5{,}42\,\text{cm}$ – und dann ist $h = 2r$: Die ideale Dose ist so hoch wie breit.

*Beispiel Zylinder im Kegel:* In einem Kegel mit $R = 6\,\text{cm}$ und $H = 12\,\text{cm}$ steht ein Zylinder. Nach dem Strahlensatz ist seine Höhe $h = 12 - 2r$, also $V(r) = \pi r^2 (12 - 2r)$. Das Maximum liegt bei $r = 4\,\text{cm} = \frac{2}{3}R$ – unabhängig von der Kegelhöhe.

*Beispiel Rettungsschwimmer:* Ein Rettungsschwimmer steht $20\,\text{m}$ vom Wasser entfernt, die Person im Wasser ist $30\,\text{m}$ vom Ufer und seitlich $60\,\text{m}$ entfernt. Laufen geht mit $7\,\tfrac{\text{m}}{\text{s}}$, Schwimmen mit $2\,\tfrac{\text{m}}{\text{s}}$. Ist $x$ die Stelle, an der er ins Wasser geht, so braucht er

$$T(x) = \frac{\sqrt{20^2 + x^2}}{7} + \frac{\sqrt{30^2 + (60 - x)^2}}{2}, \quad 0 \le x \le 60.$$

$T'(x) = 0$ lässt sich nur numerisch lösen: $x \approx 51{,}71\,\text{m}$, $T \approx 23{,}48\,\text{s}$. Im Optimum gilt $\frac{\sin \alpha_1}{v_1} = \frac{\sin \alpha_2}{v_2}$ – genau das **Brechungsgesetz** der Optik: Licht nimmt den schnellsten Weg.

## Ausprobieren

1. [Schachtel](?prob=box&a=30&b=20&x=2): Ziehe den Punkt auf dem Graphen. Wie verändert sich die Schachtel?
2. Drücke „Zum Optimum“. Vergleiche die Tangente dort mit anderen Stellen.
3. [Quadratischer Karton](?prob=box&a=24&b=24&x=2): Gilt $x = \frac{a}{6}$?
4. [1-Liter-Dose](?prob=can&v=1000&x=3): Wie sieht die Dose mit der kleinsten Oberfläche aus?
5. [Getränkedose](?prob=can&v=350&x=3.3): Echte Getränkedosen sind schlanker als das Optimum. Warum könnte das so sein?
6. [Rechteck unter der e-Funktion](?prob=rect&x=0.8): Drücke „Abtasten“: Der Graph der Zielfunktion entsteht durch Probieren. Welche Breite liefert die größte Fläche?
7. [Schachtel falten](?prob=box&a=30&b=20&x=4): Drücke „Falten“ und beobachte, wie aus dem Karton die Schachtel wird.
8. [Zylinder im Kegel](?prob=cone&ch=12&x=2): Verändere die Höhe des Kegels. Warum bleibt der beste Radius bei $4\,\text{cm}$?
9. [Rettungsschwimmer](?prob=life&x=24): Die gerade Linie ist der kürzeste, aber nicht der schnellste Weg. Starte das „Wettrennen“ und vergleiche mit dem schnellsten Weg.
10. [Gleich schnell](?prob=life&v1=4&v2=4&x=40): Wo liegt das Optimum, wenn Laufen und Schwimmen gleich schnell gehen?

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

### Aufgabe 4: Zylinder im Kegel

In einen Kegel mit Radius $6\,\text{cm}$ und Höhe $12\,\text{cm}$ wird ein Zylinder gestellt. Welcher Zylinder hat das größte Volumen? Welcher Anteil des Kegels ist das? [Aufgabe laden](?prob=cone&ch=12&x=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Strahlensatz: $\frac{h}{12} = \frac{6 - r}{6}$, also $h = 12 - 2r$ und $V(r) = \pi(12r^2 - 2r^3)$, $0 < r < 6$. $V'(r) = \pi(24r - 6r^2) = 6\pi r(4 - r) = 0 \Rightarrow r = 4$; $V''(4) = \pi(24 - 48) < 0$. $h = 4\,\text{cm}$, $V = 64\pi \approx 201{,}1\,\text{cm}^3$. Der Kegel hat $\frac{1}{3}\pi \cdot 36 \cdot 12 = 144\pi$, der Zylinder füllt also $\frac{4}{9}$ davon. [Lösung zeigen](?prob=cone&ch=12&x=4)

</details>

### Aufgabe 5: Rettungsschwimmer

Stelle $T(x)$ auf (Daten siehe oben) und vergleiche drei Wege: die gerade Linie ($x = 24$, warum?), „bis gegenüber laufen, dann schwimmen“ ($x = 60$) und das Optimum. [Aufgabe laden](?prob=life&x=24&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Gerade Linie: Sie schneidet das Ufer nach dem Strahlensatz bei $x = 60 \cdot \frac{20}{50} = 24$; $T(24) \approx 27{,}89\,\text{s}$. Bis gegenüber: $T(60) = \frac{\sqrt{4000}}{7} + 15 \approx 24{,}04\,\text{s}$. Optimum (numerisch, z. B. mit dem Newton-Verfahren): $x \approx 51{,}71\,\text{m}$, $T \approx 23{,}48\,\text{s}$. Randwerte: $T(0) \approx 36{,}40\,\text{s}$ und $T(60) \approx 24{,}04\,\text{s}$ sind größer – das Minimum ist global. [Lösung zeigen](?prob=life&x=51.7)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 13 (Extremwertprobleme mit verknüpften Funktionen), LehrplanPLUS Gymnasium Bayern; die Schachtel auch schon in Jahrgangsstufe 11.
- **Basteln:** Schachteln aus DIN-A4-Papier mit verschiedenen $x$ falten und das Volumen messen, bevor gerechnet wird.
- **Modellkritik:** Warum sind echte Dosen nicht optimal? (Falz, Stabilität, Handhabung, Werbefläche.)
- **Fächerverbindend:** Der Rettungsschwimmer führt direkt zum Brechungsgesetz (Fermat-Prinzip) – ein schöner Anlass für eine gemeinsame Stunde mit Physik.
- **Ableitung lesen:** Mit dem Streifen der Ableitung lässt sich das Vorzeichenwechsel-Kriterium ohne Rechnung sehen; danach mit $Z''$ bestätigen.
- **Häufige Stolpersteine:**
  - Die Nebenbedingung wird nicht genutzt – die Zielfunktion hat noch zwei Variablen.
  - Der Definitionsbereich wird vergessen, Lösungen außerhalb werden übernommen.
  - Die Randwerte werden nicht geprüft – beim Rettungsschwimmer ist $T(60)$ nur knapp schlechter als das Optimum.
  - Die zweite Ableitung wird an der falschen Stelle ausgewertet.
