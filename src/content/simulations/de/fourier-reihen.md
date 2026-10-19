---
description: "Interaktive Simulation für das Studium: Fourier-Reihen von Rechteck, Sägezahn, Dreieck, Trapez, Pulsfolge und gleichgerichtetem Sinus – Partialsumme mit Gibbs-Phänomen, rotierende Zeiger (Epizykel), gestapelte Teilschwingungen, Amplituden- und Phasenspektrum, Energieanteil nach Parseval und Klang."
---

## Worum geht es?

Jede (hinreichend gutartige) $2\pi$-periodische Funktion lässt sich als Summe von Sinus- und Kosinusschwingungen schreiben – als **Fourier-Reihe**:

$$f(x) \approx \frac{a_0}{2} + \sum_{k=1}^{N} \bigl(a_k \cos kx + b_k \sin kx\bigr), \qquad a_k = \frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\cos kx\,dx, \quad b_k = \frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\sin kx\,dx.$$

Die Schwingung mit $k = 1$ heißt **Grundschwingung**, die übrigen sind **Oberschwingungen** (Harmonische). Die Summe der ersten $N$ Glieder ist die **Partialsumme** $S_N$. Fasst man $a_k \cos kx + b_k \sin kx = \hat A_k \sin(kx + \varphi_k)$ zusammen, erhält man das **Amplitudenspektrum** $\hat A_k = \sqrt{a_k^2 + b_k^2}$ und das **Phasenspektrum** $\varphi_k$. *Beispiel Rechteck:* $f(x) = \frac{4}{\pi}\left(\sin x + \frac{1}{3}\sin 3x + \frac{1}{5}\sin 5x + \ldots\right)$ – nur ungerade $k$, Amplituden wie $\frac{1}{k}$.

**Zeiger:** Jedes Glied ist ein Zeiger der Länge $\hat A_k$, der sich $k$-mal so schnell dreht wie die Grundschwingung. Hängt man die Zeiger aneinander, zeichnet die Höhe der Spitze genau $S_N$ – das zeigt die Ansicht „Zeiger (Epizykel)“.

**Symmetrie:** Ungerade Funktionen (Rechteck, Sägezahn) haben nur Sinusglieder, gerade (Dreieck, Pulsfolge, Zweiweg) nur Kosinusglieder. Gilt $f(x + \pi) = -f(x)$, fehlen alle geraden $k$. **Glatt oder sprunghaft?** Bei Sprüngen fallen die Amplituden nur wie $\frac{1}{k}$, bei Knicken wie $\frac{1}{k^2}$ – die Reihe konvergiert dann viel schneller.

**Gibbs-Phänomen:** An einer Sprungstelle schießt $S_N$ über – beim Rechteck auf etwa $1{,}179$ statt $1$, also um rund $9\,\%$ der Sprunghöhe $2$. Mit wachsendem $N$ wird der Überschwinger schmaler, aber nicht niedriger. Glättungsfaktoren $\sigma_k$ (Fejér: $\sigma_k = 1 - \frac{k}{N+1}$) dämpfen die hohen Glieder und beseitigen ihn.

**Parseval:** Die mittlere Leistung verteilt sich auf die Glieder:

$$P = \frac{1}{2\pi}\int_{-\pi}^{\pi} f(x)^2\,dx = \left(\frac{a_0}{2}\right)^2 + \frac{1}{2}\sum_{k=1}^{\infty}\bigl(a_k^2 + b_k^2\bigr).$$

Beim Rechteck ($P = 1$) steckt schon in der Grundschwingung der Anteil $\frac{1}{2}\left(\frac{4}{\pi}\right)^2 = \frac{8}{\pi^2} \approx 81{,}06\,\%$. **Zeit statt Winkel:** Mit der Grundfrequenz $f_0$ ist $x = \omega t = 2\pi f_0 t$; die $k$-te Teilschwingung hat die Frequenz $k \cdot f_0$. So hört man das Spektrum als **Klangfarbe** („Klang anhören“).

## Ausprobieren

1. [Rechteck mit einer Teilschwingung](?sig=sq&n=1): Drücke mehrmals „Teilschwingung hinzufügen“. Warum werden gerade $k$ übersprungen? Drücke dann „Aufbau abspielen“ und beobachte Ecken und Energieanteil.
2. [Zeiger zeichnen ein Rechteck](?view=epi&sig=sq&n=7): Welcher Zeiger dreht sich am schnellsten, welcher ist am längsten?
3. [Teilschwingungen gestapelt](?view=stack&sig=saw&n=8&x=2): Ziehe die Prüfstelle. Die Werte rechts addieren sich zu $S_8(x)$.
4. [Gibbs-Phänomen](?sig=sq&n=30&x=0.1): Wird der Überschwinger mit größerem $N$ kleiner? Vergleiche mit [Fejér-Glättung](?sig=sq&n=30&x=0.1&sm=fejer).
5. [Klarinette](?view=spec&sig=sq&n=11&f0=147) und [Flöte](?view=spec&sig=tri&n=5&f0=523): Vergleiche Spektren und Energieanteile, dann „Klang anhören“.
6. [Phasenverschiebung](?view=spec&sig=saw&n=8&ph=90): Verändere $\varphi$. Was ändert sich im Amplituden-, was im Phasenspektrum?
7. [LED-Dimmer](?sig=pulse&d=25&n=20&f0=500&tax=1&x=0.5): Verändere den Tastgrad $d$. Wie hängt der Gleichanteil davon ab?
8. [Eigener Klang](?view=epi&sig=own&n=8&c1=1&c2=0.5&c3=0.35&c4=0.25&c5=0&c6=0&c7=0&c8=0): Stelle die Amplituden $c_k$ ein und höre zu.

## Aufgaben

### Aufgabe 1: Partialsumme berechnen

Berechne die Partialsumme $S_3$ des Rechtecksignals an der Stelle $x = 1{,}2$. [Aufgabe laden](?sig=sq&n=3&x=1.2&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$S_3(1{,}2) = \frac{4}{\pi}\left(\sin 1{,}2 + \frac{1}{3}\sin 3{,}6\right) \approx 1{,}2732 \cdot (0{,}9320 - 0{,}1475) \approx 0{,}999$ – schon sehr nahe am Zielwert $1$. [Zeigen](?view=stack&sig=sq&n=3&x=1.2)

</details>

### Aufgabe 2: Symmetrie

Warum enthält die Reihe des Rechtecks nur Sinus-, die des Dreiecks nur Kosinusglieder? Was passiert, wenn man das Rechteck um $90°$ verschiebt?

<details>
<summary>Lösung anzeigen</summary>

Das Rechteck ist punktsymmetrisch (ungerade): alle $a_k = 0$. Das Dreieck ist achsensymmetrisch (gerade): alle $b_k = 0$. Um $\frac{\pi}{2}$ verschoben wird das Rechteck achsensymmetrisch, also nur Kosinusglieder – die Amplituden bleiben gleich. [Zeigen](?view=spec&sig=sq&n=9&ph=90)

</details>

### Aufgabe 3: Energie nach Parseval

Welcher Anteil der Leistung des Rechtecks steckt in $S_1$, welcher in $S_3$? Ab welchem $N$ sind es mindestens $95\,\%$? [Aufgabe laden](?view=spec&sig=sq&n=1&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P = 1$, $\frac{1}{2}b_k^2 = \frac{8}{\pi^2 k^2}$. $S_1$: $\frac{8}{\pi^2} \approx 81{,}06\,\%$; $S_3$: $\frac{8}{\pi^2}\left(1 + \frac{1}{9}\right) \approx 90{,}06\,\%$; $S_5$: $93{,}31\,\%$; $S_7$: $94{,}96\,\%$; $S_9$: $95{,}96\,\%$. Also ab $N = 9$. [Zeigen](?view=spec&sig=sq&n=9)

</details>

### Aufgabe 4: Warum klingt die Flöte so rein?

Ein Flötenton ist fast sinusförmig; als einfaches Modell dient ein Dreieck. Berechne den Energieanteil der Grundschwingung ($P = \frac{1}{3}$, $a_1 = \frac{8}{\pi^2}$).

<details>
<summary>Lösung anzeigen</summary>

$\frac{\frac{1}{2}a_1^2}{P} = \frac{3}{2}\cdot\frac{64}{\pi^4} = \frac{96}{\pi^4} \approx 98{,}55\,\%$ – fast die ganze Leistung steckt in der Grundschwingung, der Ton klingt beinahe wie ein reiner Sinus. Die Klarinette (im tiefen Register vereinfacht ≈ Rechteck) hat nur $81\,\%$ in der Grundschwingung und klingt deshalb „hohler“, voller Obertöne. [Zeigen](?view=spec&sig=tri&n=5&f0=523)

</details>

### Aufgabe 5: LED-Dimmer

Eine LED wird mit einer Pulsfolge (Höhe $1$, Tastgrad $d = 25\,\%$) angesteuert. Bestimme den Gleichanteil und die Amplituden der ersten vier Harmonischen. Welche fehlt? [Aufgabe laden](?sig=pulse&d=25&n=8&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Gleichanteil $\frac{a_0}{2} = d = 0{,}25$ (die LED leuchtet im Mittel mit $25\,\%$). $\hat A_k = \frac{2\,|\sin(\pi k d)|}{\pi k}$: $\hat A_1 \approx 0{,}450$, $\hat A_2 \approx 0{,}318$, $\hat A_3 \approx 0{,}150$, $\hat A_4 = 0$, weil $\sin \pi = 0$ (jede vierte fehlt). [Zeigen](?view=spec&sig=pulse&d=25&n=8)

</details>

### Aufgabe 6: Netzteil mit Zweiweggleichrichter

Das Netz liefert $f_0 = 50\,\text{Hz}$. Nach dem Zweiweggleichrichter liegt $|\sin x|$ an. Bestimme Mittelwert und erste Oberschwingung. Mit welcher Frequenz „brummt“ das Netzteil?

<details>
<summary>Lösung anzeigen</summary>

$\frac{a_0}{2} = \frac{2}{\pi} \approx 0{,}637$; da $|\sin x|$ die Periode $\pi$ hat, gibt es nur gerade $k$: $a_2 = -\frac{4}{3\pi} \approx -0{,}424$ bei $2 \cdot 50\,\text{Hz} = 100\,\text{Hz}$. Der Kondensator muss vor allem diesen $100\text{-Hz}$-Anteil glätten. Schon der Gleichanteil trägt $\frac{8}{\pi^2} \approx 81\,\%$ der Leistung. [Zeigen](?view=spec&sig=full&n=8&f0=50&tax=1)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Analysis bzw. Mathematik für Ingenieure im Studium; als Ausblick auch in einem Seminar der Oberstufe (Akustik, Signalverarbeitung). Die Zeiger-Ansicht knüpft an die Zeigerdarstellung harmonischer Schwingungen aus der Physik an.
- **Ablauf-Vorschlag:** Mit „Aufbau abspielen“ einsteigen, dann in der gestapelten Ansicht an einer Stelle von Hand addieren; mit „Werte im Bild“ aus (`info=0`) eignen sich die Bilder als Rechenaufgaben. Klangfarben (Klarinette, Geige, Flöte), Netzteil und Pulsweitenmodulation verbinden Mathematik mit Physik, Elektrotechnik und Informatik (Kompression, MP3).
- **Häufige Stolpersteine:**
  - Der konstante Anteil ist $\frac{a_0}{2}$, nicht $a_0$.
  - Man erwartet, dass das Gibbs-Überschwingen mit $N$ verschwindet – es wird nur schmaler.
  - An der Sprungstelle liefert die Reihe den Mittelwert der einseitigen Grenzwerte.
  - Eine Verschiebung ändert nur die Phasen, nicht die Amplituden.
