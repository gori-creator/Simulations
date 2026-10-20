---
description: "Interaktive Simulation zur elektromagnetischen Induktion: Magnet in eine Spule schieben, Leiterstab auf Schienen durch ein Magnetfeld ziehen, Generator drehen – mit Spannungsmesser, U(t)-Diagramm, Lenzscher Regel, U = B · l · v und Û = n · B · A · ω."
---

## Worum geht es?

Ändert sich das Magnetfeld, das eine Spule durchsetzt, entsteht an ihren Enden eine Spannung: **elektromagnetische Induktion**. Entscheidend ist der **magnetische Fluss**

$$
\Phi = B \cdot A \cdot \cos\varphi ,
$$

also die Flussdichte $B$ mal die Fläche $A$, die das Feld senkrecht durchsetzt ($\varphi$ ist der Winkel zwischen Feld und Flächennormale). Das **Induktionsgesetz** lautet

$$
U_\text{ind} = -n \cdot \frac{\Delta\Phi}{\Delta t}
$$

mit der Windungszahl $n$. Es kommt also nicht auf den Fluss selbst an, sondern darauf, **wie schnell er sich ändert**. Ruht alles, ist die Spannung null.

Den Fluss kann man auf drei Arten ändern – genau das zeigen die drei Versuche:

1. **Magnet und Spule:** Der Magnet wird bewegt, $B$ in der Spule ändert sich. Hineinschieben und Herausziehen geben Spannungen mit verschiedenem Vorzeichen; schneller bewegen und mehr Windungen geben mehr Spannung.
2. **Leiterschleife im Feld:** Ein Stab der Länge $l$ gleitet mit der Geschwindigkeit $v$ auf zwei Schienen durch ein homogenes Feld. Die eingeschlossene Fläche $A = l \cdot x$ wächst um $l \cdot v$ pro Sekunde, also
   $$
   U = B \cdot l \cdot v .
   $$
   Dasselbe Ergebnis folgt aus der Lorentzkraft auf die Elektronen im bewegten Stab.
3. **Generator:** Eine Spule dreht sich mit der Frequenz $f$ im Feld. Der Winkel ändert sich gleichmäßig, $\Phi = B \cdot A \cdot \cos(\omega t)$ mit $\omega = 2\pi f$, und es entsteht eine **Wechselspannung**
   $$
   U(t) = \hat U \cdot \sin(\omega t), \qquad \hat U = n \cdot B \cdot A \cdot \omega .
   $$
   Die Spannung ist am größten, wenn die Spulenfläche parallel zum Feld steht – dann ist der Fluss null, ändert sich aber am schnellsten.

**Lenzsche Regel:** Das Minuszeichen im Induktionsgesetz bedeutet, dass der Induktionsstrom seiner Ursache entgegenwirkt. Nähert sich ein Nordpol, wird das Spulenende zum Nordpol und stößt den Magneten ab; der Stab auf den Schienen wird durch die Kraft $F = B \cdot I \cdot l$ gebremst. Deshalb muss man Arbeit verrichten – sie kommt als elektrische Energie im Stromkreis an.

**Zur Darstellung:** Der Generator läuft im Bild zehnfach verlangsamt, das Diagramm zeigt aber die echte Zeit. Beim Stab auf Schienen hat der Stromkreis im Modell den Widerstand $R = 2\,\Omega$. Der Messbereich des Spannungsmessers stellt sich selbst ein.

## Ausprobieren

1. Beobachte Spannungsmesser und Diagramm, während der Magnet in die Spule fährt und wieder heraus. Wann ist die Spannung null? [Beispiel laden](?mode=magnet)
2. Schalte „automatisch“ aus und ziehe den Magneten selbst: langsam, schnell, gar nicht. [Selbst ziehen](?mode=magnet&auto=0)
3. Verdreifache die Windungszahl. Was ändert sich? [Dreifache Windungszahl](?mode=magnet&n=300)
4. Beim Stab auf Schienen: Wie hängt die Spannung von $v$, $l$ und $B$ ab? Achte auf die Pfeile für $v$ und $F$. [Stab auf Schienen](?mode=rail)
5. Beim Generator: In welcher Stellung der Spule ist die Spannung am größten? Vergleiche die Kurven von $U$ und $\Phi$. [Generator](?mode=gen&B=0.1&n=100&A=100&f=5)
6. Verdopple beim Generator die Drehfrequenz. Was passiert mit Periodendauer und Scheitelwert? [Doppelte Frequenz](?mode=gen&B=0.1&n=100&A=100&f=10)

## Aufgaben

### Aufgabe 1: Bewegter Leiter

Ein Stab der Länge $0{,}20\,\text{m}$ bewegt sich mit $2{,}0\,\frac{\text{m}}{\text{s}}$ senkrecht durch ein Magnetfeld mit $B = 0{,}50\,\text{T}$. Berechne die induzierte Spannung. [Aufgabe laden](?mode=rail&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$U = B \cdot l \cdot v = 0{,}50\,\text{T} \cdot 0{,}20\,\text{m} \cdot 2{,}0\,\frac{\text{m}}{\text{s}} = 0{,}20\,\text{V}$. [In der Simulation zeigen](?mode=rail)

</details>

### Aufgabe 2: Strom und bremsende Kraft

Der Stab aus Aufgabe 1 ist über einen Widerstand von $2{,}0\,\Omega$ geschlossen. Berechne Stromstärke, bremsende Kraft und die nötige mechanische Leistung. Vergleiche mit der elektrischen Leistung.

<details>
<summary>Lösung anzeigen</summary>

$I = \frac{U}{R} = 0{,}10\,\text{A}$, $F = B \cdot I \cdot l = 0{,}50\,\text{T} \cdot 0{,}10\,\text{A} \cdot 0{,}20\,\text{m} = 0{,}010\,\text{N}$. Mechanische Leistung $P = F \cdot v = 0{,}020\,\text{W}$, elektrische Leistung $P = U \cdot I = 0{,}020\,\text{W}$ – die Energie bleibt erhalten.

</details>

### Aufgabe 3: Generator

Eine Spule mit $100$ Windungen und $A = 100\,\text{cm}^2$ dreht sich mit $f = 5\,\text{Hz}$ in einem Feld mit $B = 0{,}10\,\text{T}$. Berechne Scheitelwert, Effektivwert und Periodendauer der Spannung. [Aufgabe laden](?mode=gen&B=0.1&n=100&A=100&f=5&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\omega = 2\pi \cdot 5\,\text{Hz} \approx 31{,}4\,\frac{1}{\text{s}}$, $\hat U = n \cdot B \cdot A \cdot \omega = 100 \cdot 0{,}10\,\text{T} \cdot 0{,}010\,\text{m}^2 \cdot 31{,}4\,\frac{1}{\text{s}} \approx 3{,}14\,\text{V}$, $U_\text{eff} = \frac{\hat U}{\sqrt 2} \approx 2{,}22\,\text{V}$, $T = \frac{1}{f} = 0{,}2\,\text{s}$. [In der Simulation zeigen](?mode=gen&B=0.1&n=100&A=100&f=5)

</details>

### Aufgabe 4: Doppelte Frequenz

Wie ändern sich Scheitelwert und Periodendauer, wenn sich der Generator aus Aufgabe 3 doppelt so schnell dreht?

<details>
<summary>Lösung anzeigen</summary>

$\hat U \sim \omega$: Der Scheitelwert verdoppelt sich auf etwa $6{,}28\,\text{V}$, die Periodendauer halbiert sich auf $0{,}1\,\text{s}$. [In der Simulation zeigen](?mode=gen&B=0.1&n=100&A=100&f=10)

</details>

### Aufgabe 5: Lenzsche Regel

Ein Magnet wird mit dem Nordpol voran in eine Spule geschoben. Welcher Pol entsteht am Spulenende, das dem Magneten zugewandt ist? Was passiert, wenn man ihn wieder herauszieht? [Magnet und Spule](?mode=magnet)

<details>
<summary>Lösung anzeigen</summary>

Beim Hineinschieben entsteht dort ein Nordpol: Die Spule stößt den Magneten ab. Beim Herausziehen entsteht ein Südpol, der den Magneten anzieht. In beiden Fällen wird die Bewegung gebremst; die Spannung hat entgegengesetzte Vorzeichen.

</details>

### Aufgabe 6: Feld einschalten

Eine Spule mit $500$ Windungen und $A = 20\,\text{cm}^2$ steht senkrecht zu einem Magnetfeld, das in $0{,}10\,\text{s}$ gleichmäßig von $0$ auf $0{,}20\,\text{T}$ ansteigt. Welche Spannung wird induziert?

<details>
<summary>Lösung anzeigen</summary>

$\Delta\Phi = 0{,}20\,\text{T} \cdot 20 \cdot 10^{-4}\,\text{m}^2 = 4{,}0 \cdot 10^{-4}\,\text{Wb}$, $|U| = n \cdot \frac{\Delta\Phi}{\Delta t} = 500 \cdot \frac{4{,}0 \cdot 10^{-4}\,\text{Wb}}{0{,}10\,\text{s}} = 2{,}0\,\text{V}$.

</details>

## Ideen für den Unterricht

- **Einsatz:** in der Oberstufe beim Thema Induktion; die genaue Einordnung bitte am Lehrplan prüfen. Die drei Versuche passen zu den üblichen Freihandversuchen mit Stabmagnet, Leiterschaukel und Handgenerator.
- **Möglicher Ablauf:** mit dem Magneten qualitativ beginnen (wann gibt es Spannung?), dann mit dem Stab auf Schienen $U = B \cdot l \cdot v$ quantitativ herleiten und zum allgemeinen Induktionsgesetz verallgemeinern, zum Schluss der Generator als Anwendung.
- **Modell:** Feld des Stabmagneten auf der Spulenachse, dünne Spule; beim Generator homogenes Feld; Selbstinduktion und Rückwirkung auf die Bewegung werden nicht berechnet.
- **Häufige Stolpersteine:**
  - „Ein starker Magnet in der Spule erzeugt eine Spannung.“ – Nur die Änderung des Flusses zählt; ruht der Magnet, ist $U = 0$.
  - „Beim Generator ist die Spannung am größten, wenn die Spule senkrecht zum Feld steht.“ – Dann ist der Fluss maximal, ändert sich aber gerade nicht.
  - Das Minuszeichen wird oft weggelassen; es steckt die Lenzsche Regel und damit die Energieerhaltung darin.
- **Weiterführend:** Transformator, Wirbelströme (Wirbelstrombremse), Selbstinduktion, Wechselstromnetz.
