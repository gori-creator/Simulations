---
description: "Wachstumsmodelle im Vergleich: linear, exponentiell, beschränkt und logistisch – explizit und rekursiv, mit Änderungsrate, Wendepunkt, Kennzeichen in der Wertetabelle und Messdaten zum Anpassen."
---

## Worum geht es?

Wie ein Bestand $B(t)$ wächst, hängt davon ab, **wovon die Zunahme abhängt**:

| Modell | Zunahme pro Zeit | Funktion | Kennzeichen in der Tabelle |
| --- | --- | --- | --- |
| linear | immer gleich: $B' = d$ | $B(t) = B_0 + d\,t$ | gleiche Differenzen |
| exponentiell | proportional zum Bestand: $B' = k\,B$ | $B(t) = B_0\,e^{kt}$ | gleiche Quotienten |
| beschränkt | proportional zum Abstand zur Grenze: $B' = k\,(S - B)$ | $B(t) = S - (S - B_0)\,e^{-kt}$ | Differenzen ∝ $S - B$ |
| logistisch | proportional zu Bestand **und** Abstand: $B' = k\,B\,(1 - B/S)$ | $B(t) = \dfrac{S}{1 + \frac{S - B_0}{B_0} e^{-kt}}$ | Differenzen erst steigend, dann fallend |

Jedes Modell lässt sich auch **rekursiv** schreiben, also Schritt für Schritt: linear $B(n+1) = B(n) + d$, exponentiell $B(n+1) = a \cdot B(n)$ mit dem Wachstumsfaktor $a = e^k$.

**Logistisches Wachstum** beginnt fast exponentiell und endet fast beschränkt. Beispiel: $S = 100$, $B(0) = 10$, $k = 0{,}5$ ergibt

$$
B(t) = \frac{100}{1 + 9\,e^{-0{,}5t}}.
$$

Am **Wendepunkt** ist die Hälfte der Grenze erreicht, $B = 50$, und dort wächst der Bestand am schnellsten. Aus $9\,e^{-0{,}5t} = 1$ folgt $t = 2 \ln 9 \approx 4{,}39$.

Die **Änderungsrate über dem Bestand** (unteres Bild) zeigt die Modelle besonders deutlich: eine waagerechte Linie (linear), eine Ursprungsgerade (exponentiell), eine fallende Gerade bis $S$ (beschränkt) und eine nach unten offene Parabel (logistisch).

## Ausprobieren

1. Vergleiche alle vier Modelle. Welches ist am Anfang am schnellsten, welches am Ende? [Vergleich](?mode=compare&B0=10&d=8&k=0.5&S=100&tmax=14)
2. Logistisch: Wo liegt der Wendepunkt? Verändere $B_0$ und beobachte, wie er wandert. [Logistisch](?mode=single&model=logistic&B0=10&k=0.5&S=100&tmax=14)
3. Rekursiv mit großem $k$: Warum springt der Bestand über die Grenze hinaus? [Schwingen](?mode=single&model=logistic&B0=10&k=2.3&S=100&tmax=40&rec=1)
4. Welches Modell passt zur Sonnenblume? Probiere alle und drücke „Automatisch anpassen“. [Sonnenblume](?mode=data&ds=sunflower&model=logistic&B0=18&k=0.4&S=220)
5. Abkühlung: Welche Raumtemperatur steckt in den Daten? [Tee](?mode=data&ds=tea&model=bounded&B0=90&k=0.15&S=25)
6. Zinseszins gegen einfache Zinsen: Wie groß ist der Unterschied nach 20 Jahren? [Sparen](?mode=apps&sc=interest&K0=1000&pz=5&yrs=20)
7. Medikament: Wie hoch steigt die Menge im Körper, wenn man alle 8 Stunden 400 mg nimmt? [Medikament](?mode=apps&sc=drug&dose=400&hl=8&tau=8)
8. Spinnwebdiagramm: Verändere k von 0,5 bis 2,8. Wann pendelt die Folge, wann wird sie chaotisch? [Spinnweb](?mode=cobweb&model=logistic&B0=10&k=2.3&S=100&tmax=40)
9. Übe: Stelle zu einem Text das passende Modell auf. [Üben](?mode=exam&q=1)

## Aufgaben

### Aufgabe 1: Welches Modell?

Ein Bestand wächst so: 10; 15; 22,5; 33,75. Welches Modell passt?

<details>
<summary>Lösung anzeigen</summary>

Die Quotienten sind immer 1,5 – exponentielles Wachstum mit $B(t) = 10 \cdot 1{,}5^t$.

</details>

### Aufgabe 2: Wendepunkt

Bestimme für $B(t) = \dfrac{100}{1 + 9e^{-0{,}5t}}$ den Wendepunkt und die größte Zunahme.

<details>
<summary>Lösung anzeigen</summary>

$B = 50$ bei $t = 2\ln 9 \approx 4{,}39$. Die größte Zunahme ist $k \cdot S/4 = 0{,}5 \cdot 100/4 = 12{,}5$ pro Zeiteinheit. [In der Simulation zeigen](?mode=single&model=logistic&B0=10&k=0.5&S=100&tmax=14)

</details>

### Aufgabe 3: Verdopplungszeit

Bakterien vermehren sich mit $k = 0{,}35$ pro Stunde. Nach welcher Zeit hat sich die Zahl verdoppelt?

<details>
<summary>Lösung anzeigen</summary>

$T = \ln 2 / 0{,}35 \approx 1{,}98$ Stunden. [In der Simulation zeigen](?mode=single&model=exp&B0=2&k=0.35&tmax=8)

</details>

### Aufgabe 4: Medikament

Ein Patient nimmt alle 8 Stunden 400 mg eines Medikaments mit einer Halbwertszeit von 8 Stunden. Wie viel ist nach der dritten Einnahme im Körper? Auf welchen Höchstwert läuft es hinaus?

<details>
<summary>Lösung anzeigen</summary>

Nach 8 Stunden ist noch die Hälfte übrig: $B_{n+1} = 0{,}5 \cdot B_n + 400$. Nach der dritten Einnahme: $400 + 200 + 100 = 700\,\text{mg}$. Im Gleichgewicht gilt $B = 0{,}5 \cdot B + 400$, also $B = 800\,\text{mg}$ (direkt nach der Einnahme) und $400\,\text{mg}$ (direkt davor). [In der Simulation zeigen](?mode=apps&sc=drug&dose=400&hl=8&tau=8)

</details>

## Ideen für den Unterricht

- **Einsatz:** Modelle vergleichen, aus Tabellen erkennen (Differenzen, Quotienten) und an Messdaten anpassen.
- **Die Messreihen sind ausgedacht**, aber typisch (Sonnenblume, Abkühlung, Bakterien, Sparschwein) – gut geeignet, um eigene Daten dagegenzuhalten.
- **Häufige Stolpersteine:**
  - Exponentiell mit „schnell“ verwechseln – am Anfang ist linear oft schneller.
  - Beim beschränkten Wachstum $S$ und $B_0$ vertauschen (Abkühlung: $S$ ist die Raumtemperatur).
  - Rekursive und explizite Darstellung stimmen beim logistischen Modell nur ungefähr überein.
