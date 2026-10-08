---
description: "Interaktive Simulation zum ohmschen Gesetz – Spannung am Netzgerät einstellen, Stromstärke und Spannung an Zeigerinstrumenten ablesen, Kennlinien von Widerstand, Glühlampe und Konstantandraht aufnehmen, R = U / I und R = ρ · l / A."
---

## Worum geht es?

Legt man an ein Bauteil eine **Spannung** $U$ an, fließt ein elektrischer Strom der **Stärke** $I$. Gemessen wird so:

- Das **Amperemeter** liegt **in Reihe** mit dem Bauteil – der ganze Strom muss hindurch.
- Das **Voltmeter** liegt **parallel** zum Bauteil – es vergleicht die beiden Anschlüsse.

Der **elektrische Widerstand** gibt an, wie stark ein Bauteil den Strom hemmt:

$$
R = \frac{U}{I} \qquad [R] = 1\,\Omega = 1\,\frac{\text{V}}{\text{A}}
$$

**Ohmsches Gesetz:** Bei Metalldrähten mit gleichbleibender Temperatur ist die Stromstärke proportional zur Spannung, $I \sim U$. Der Widerstand $R$ ist dann konstant und es gilt $U = R \cdot I$. Die **Kennlinie** im $I$-$U$-Diagramm ist eine **Ursprungsgerade** – je größer $R$, desto flacher verläuft sie. Im $U$-$I$-Diagramm ist die Steigung der Geraden gleich $R$.

**Glühlampe:** Die Wendel aus Wolfram wird beim Betrieb über $2000\,°\text{C}$ heiß. Mit der Temperatur steigt ihr Widerstand – von etwa $3\,\Omega$ (kalt) auf $48\,\Omega$ bei $12\,\text{V}$. Ihre Kennlinie ist deshalb gekrümmt; für die Glühlampe gilt das ohmsche Gesetz nicht.

**Widerstand eines Drahtes:** Er wächst mit der Länge $l$ und sinkt mit der Querschnittsfläche $A$:

$$
R = \rho \cdot \frac{l}{A} \qquad \rho_{\text{Konstantan}} = 0{,}49\,\frac{\Omega \cdot \text{mm}^2}{\text{m}}
$$

Der **spezifische Widerstand** $\rho$ hängt vom Material ab. Konstantan ändert seinen Widerstand beim Erwärmen kaum.

## Ausprobieren

1. Drehe am Knopf des Netzgeräts und beobachte die Zeiger. Nimm bei verschiedenen Spannungen Messwerte auf – oder starte die automatische Messreihe.
2. Miss nacheinander verschiedene Widerstände und vergleiche die Geraden im Diagramm. [47 Ω](?R=47) · [150 Ω](?R=150)
3. Nimm die Kennlinie der Glühlampe auf und beobachte dabei die Wendel. [Glühlampe](?part=lamp)
4. Wechsle zum U-I-Diagramm: Jetzt ist die Steigung der Geraden der Widerstand. [U-I-Diagramm](?axes=UI)
5. Untersuche den Konstantandraht: Verdopple die Länge, dann den Querschnitt. [1 m](?part=wire&U=2) · [2 m](?part=wire&l=2&U=2) · [doppelter Querschnitt](?part=wire&A=0.2&U=2)

## Aufgaben

### Aufgabe 1: Unbekannter Widerstand

Bestimme den Widerstand B aus einer Messreihe. Zeichne die Ausgleichsgerade selbst. [Aufgabe laden](?part=mys&X=B&fit=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Zum Beispiel bei $U = 8\,\text{V}$: $I \approx 0{,}098\,\text{A}$, also $R = \frac{8\,\text{V}}{0{,}098\,\text{A}} \approx 82\,\Omega$. Alle Messpunkte liegen auf einer Ursprungsgeraden mit diesem Wert. [Lösung zeigen](?part=mys&X=B)

</details>

### Aufgabe 2: Stromstärke vorhersagen

An einem Widerstand von $100\,\Omega$ liegt eine Spannung von $6\,\text{V}$. Wie groß ist die Stromstärke?

<details>
<summary>Lösung anzeigen</summary>

$I = \frac{U}{R} = \frac{6\,\text{V}}{100\,\Omega} = 0{,}06\,\text{A} = 60\,\text{mA}$. [Prüfen](?R=100&U=6)

</details>

### Aufgabe 3: Spannung einstellen

Welche Spannung braucht man, damit durch einen Widerstand von $47\,\Omega$ genau $0{,}2\,\text{A}$ fließen?

<details>
<summary>Lösung anzeigen</summary>

$U = R \cdot I = 47\,\Omega \cdot 0{,}2\,\text{A} = 9{,}4\,\text{V}$. [Prüfen](?R=47&U=9.4)

</details>

### Aufgabe 4: Widerstand der Glühlampe

Berechne den Widerstand der Glühlampe bei $2\,\text{V}$ und bei $12\,\text{V}$. Warum unterscheiden sich die Werte? [Aufgabe laden](?part=lamp&U=2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Bei $2\,\text{V}$ fließen etwa $0{,}110\,\text{A}$, also $R \approx 18\,\Omega$. Bei $12\,\text{V}$ sind es $0{,}25\,\text{A}$, also $R = 48\,\Omega$. Bei höherer Spannung ist die Wendel heißer, und der Widerstand von Metallen steigt mit der Temperatur.

</details>

### Aufgabe 5: Längerer und dickerer Draht

Ein Konstantandraht mit $l = 1\,\text{m}$ und $A = 0{,}1\,\text{mm}^2$ hat $4{,}9\,\Omega$. Welchen Widerstand hat ein Draht mit $2\,\text{m}$ Länge und $0{,}2\,\text{mm}^2$ Querschnitt?

<details>
<summary>Lösung anzeigen</summary>

Doppelte Länge verdoppelt $R$, doppelter Querschnitt halbiert ihn: wieder $4{,}9\,\Omega$. [Prüfen](?part=wire&l=2&A=0.2&U=4)

</details>

### Aufgabe 6: Strombegrenzung

Beim Draht ($1\,\text{m}$, $0{,}1\,\text{mm}^2$) ist am Netzgerät $12\,\text{V}$ eingestellt, das Voltmeter zeigt aber nur etwa $9{,}8\,\text{V}$. Erkläre. [Aufgabe laden](?part=wire&U=12)

<details>
<summary>Lösung anzeigen</summary>

Bei $12\,\text{V}$ würden $\frac{12\,\text{V}}{4{,}9\,\Omega} \approx 2{,}4\,\text{A}$ fließen. Das Netzgerät liefert aber höchstens $2\,\text{A}$ und senkt deshalb die Spannung auf $U = 4{,}9\,\Omega \cdot 2\,\text{A} = 9{,}8\,\text{V}$. Darum misst man die Spannung immer direkt am Bauteil.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Widerstand, ohmsches Gesetz und Kennlinien (Klasse 8/9), der Drahtwiderstand $R = \rho \cdot \frac{l}{A}$ als Vertiefung. Die Messwerte entstehen wie im Versuch durch Ablesen; mit `fit=0` zeichnen die Lernenden die Ausgleichsgerade selbst. Weil Schulbücher beide Darstellungen verwenden, lässt sich zwischen $I$-$U$-Kennlinie und $U$-$I$-Diagramm umschalten. Mehrere Messreihen bleiben zum Vergleich im Diagramm.
- **Messgeräte:** Die Zeigerinstrumente wählen ihren Messbereich selbst (er steht unter der Skala, kleine Stromstärken in mA). Bei echten Geräten stellt man ihn von Hand ein – und beginnt mit dem größten Bereich.
- **Modell:** Netzgerät $0$ bis $12\,\text{V}$ mit Strombegrenzung $2\,\text{A}$; ideale Messgeräte. Glühlampe $12\,\text{V}\,/\,0{,}25\,\text{A}$: Gleichgewicht aus zugeführter Leistung und Abgabe durch Strahlung und Wärmeleitung, Widerstand von Wolfram $R \sim T^{1{,}2}$. Erwärmung des Konstantandrahtes vernachlässigt. Die Wendeltemperatur ist eine Modellangabe.
- **Typische Fehlvorstellungen:**
  - „$R = U / I$ ist das ohmsche Gesetz.“ – Das ist die Definition des Widerstands und gilt für jedes Bauteil. Das ohmsche Gesetz sagt, dass $R$ konstant ist ($I \sim U$).
  - „Ein großer Widerstand lässt viel Strom durch.“ – Umgekehrt.
  - „Das Amperemeter misst auch parallel.“ – Parallel geschaltet entsteht fast ein Kurzschluss.
