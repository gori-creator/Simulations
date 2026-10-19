---
description: "Interaktive Simulation für die 13. Klasse: das Integral als Gesamtänderung – aus der Geschwindigkeit den Weg, aus der Zuflussrate die Füllmenge rekonstruieren, mit Rechteckstreifen, Animation und negativen Änderungsraten."
---

## Worum geht es?

Oft kennt man nicht eine Größe selbst, sondern wie schnell sie sich ändert: die **Geschwindigkeit** eines Autos, die **Zuflussrate** in einen Tank. Wie groß ist dann die Gesamtänderung?

Ist die Rate konstant, rechnet man einfach „Rate mal Zeit“: $20\,\tfrac{\text{m}}{\text{s}} \cdot 30\,\text{s} = 600\,\text{m}$ – das ist die Fläche eines Rechtecks unter dem Graphen. Ändert sich die Rate, zerlegt man die Zeit in kleine Abschnitte $\Delta t$ und addiert $r(t_i) \cdot \Delta t$. Im Grenzfall wird daraus das Integral:

$$B(t) = B(0) + \int_0^t r(u)\,du.$$

Die **Fläche unter dem Graphen der Änderungsrate** ist also die **Gesamtänderung** des Bestands. Negative Raten (Wasser fließt ab) liefern negative Flächenanteile – der Bestand nimmt ab.

*Beispiel Auto:* $10\,\text{s}$ gleichmäßig beschleunigen auf $20\,\tfrac{\text{m}}{\text{s}}$ (Dreieck: $100\,\text{m}$), $30\,\text{s}$ konstant ($600\,\text{m}$), $10\,\text{s}$ bremsen ($100\,\text{m}$) – zusammen $800\,\text{m}$.

## Ausprobieren

1. [Autofahrt](?sit=car&t=25): Drücke „Ablauf abspielen“ und beobachte, wie die Fläche oben und der Weg unten wachsen.
2. [Rechtecke](?sit=car&t=60&n=6): Wie gut nähert die Rechtecksumme den Weg? Erhöhe die Anzahl der Streifen.
3. [Wassertank](?sit=tank&t=30&v0=30): Ab wann fließt Wasser ab? Wann ist der Tank am vollsten?
4. [Radfahrt](?sit=bike&t=90): Warum steigt der Weg immer, obwohl die Geschwindigkeit schwankt?

## Aufgaben

### Aufgabe 1: Weg berechnen

Wie weit ist das Auto nach $25\,\text{s}$ gefahren? [Aufgabe laden](?sit=car&t=25&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Dreieck bis $10\,\text{s}$: $\frac{1}{2} \cdot 10 \cdot 20 = 100\,\text{m}$; dann $15\,\text{s}$ mit $20\,\tfrac{\text{m}}{\text{s}}$: $300\,\text{m}$. Zusammen $400\,\text{m}$. [Lösung zeigen](?sit=car&t=25)

</details>

### Aufgabe 2: Wassertank

Die Zuflussrate ist $r(t) = 4 - 0{,}2t$ (in L/min), zu Beginn sind $30\,\text{L}$ im Tank. Wie viel Wasser ist nach $30$ Minuten im Tank? Wann ist er am vollsten? [Aufgabe laden](?sit=tank&t=30&v0=30&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V(30) = 30 + \int_0^{30}(4 - 0{,}2u)\,du = 30 + [4u - 0{,}1u^2]_0^{30} = 30 + 30 = 60\,\text{L}$. Am vollsten bei $r(t) = 0$, also nach $20$ Minuten: $V(20) = 70\,\text{L}$. [Lösung zeigen](?sit=tank&t=30&v0=30)

</details>

### Aufgabe 3: Rechtecke

Schätze den Gesamtweg der Autofahrt mit 6 Rechtecken (Höhe jeweils am linken Rand) und vergleiche mit dem exakten Weg. [Zeigen](?sit=car&t=60&n=6)

<details>
<summary>Lösung anzeigen</summary>

$\Delta t = 10\,\text{s}$; Höhen $v(0), v(10), \ldots, v(50) = 0, 20, 20, 20, 20, 0$: $10 \cdot 80 = 800\,\text{m}$. Hier stimmt es zufällig genau, weil sich die Fehler beim Beschleunigen und Bremsen ausgleichen – bei anderen Streifenzahlen sieht man Abweichungen.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 13 (Integral als Rekonstruktion eines Bestands aus der Änderungsrate), LehrplanPLUS Gymnasium Bayern.
- **Physik-Bezug:** $s(t)$ aus $v(t)$ – wie im $t$-$v$-Diagramm der Mechanik.
- **Eigene Daten:** Geschwindigkeiten einer Fahrradfahrt (Smartphone-App) in eine Tabelle übertragen und den Weg mit Rechtecksummen schätzen.
- **Häufige Stolpersteine:**
  - Der Funktionswert der Rate wird als Bestand gelesen (Geschwindigkeit ≠ Weg).
  - Negative Raten werden als positive Flächen gezählt.
  - Der Anfangsbestand $B(0)$ wird vergessen.
