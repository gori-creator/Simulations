## Worum geht es?

Ein **elektromagnetischer Schwingkreis** besteht aus einem Kondensator (Kapazität $C$) und einer Spule (Induktivität $L$). Lädt man den Kondensator auf und verbindet ihn dann mit der Spule, beginnt eine Schwingung:

1. Der Kondensator entlädt sich über die Spule. Der Strom wächst nur langsam, weil die Spule ihn bremst (Selbstinduktion).
2. Ist der Kondensator leer, fließt der größte Strom. Jetzt steckt die ganze Energie im **Magnetfeld der Spule**.
3. Die Spule hält den Strom aufrecht und lädt den Kondensator andersherum auf.
4. Danach geht alles rückwärts – und immer so weiter.

Die Energie pendelt zwischen dem **elektrischen Feld** des Kondensators und dem **Magnetfeld** der Spule:

$$
E_\text{el} = \frac{Q^2}{2C} \qquad E_\text{mag} = \frac{1}{2} L I^2 \qquad E_\text{el} + E_\text{mag} = \text{konstant}
$$

Die Periodendauer gibt die **Thomson-Gleichung** an:

$$
T = 2\pi \sqrt{L \cdot C} \qquad f = \frac{1}{2\pi\sqrt{L \cdot C}}
$$

Größere Kapazität oder größere Induktivität machen die Schwingung langsamer. Vierfache Kapazität bedeutet doppelte Periodendauer.

### Dämpfung

Jeder echte Schwingkreis hat einen Widerstand $R$. Dort wird bei jedem Durchgang ein Teil der Energie in **Wärme** umgewandelt, die Amplitude nimmt ab. Bei schwacher Dämpfung schwingt der Kreis weiter, nur immer kleiner (Abklingkonstante $\delta = \frac{R}{2L}$). Ist $R$ groß genug ($R = 2\sqrt{L/C}$, **aperiodischer Grenzfall**), entlädt sich der Kondensator ohne Überschwingen. Noch größere Widerstände ergeben den **Kriechfall**.

### Vergleich mit dem Federpendel

Schwingkreis und Federpendel gehorchen derselben Gleichung. Die Ladung $Q$ entspricht der Auslenkung $s$, die Stromstärke $I$ der Geschwindigkeit $v$, die Induktivität $L$ der Masse $m$ (Trägheit) und $\frac{1}{C}$ der Federhärte $D$. Die Energie im elektrischen Feld entspricht der Spannenergie, die im Magnetfeld der Bewegungsenergie.

### Selbstinduktion

Ändert sich der Strom in einer Spule, ändert sich ihr Magnetfeld, und in der Spule selbst wird eine Spannung induziert, die der Änderung entgegenwirkt (Lenzsche Regel): $u_L = -L \cdot \frac{\Delta I}{\Delta t}$. Die Einheit der Induktivität ist das **Henry**, $1\,\text{H} = 1\,\frac{\text{V}\,\text{s}}{\text{A}}$.

- **Einschalten:** Der Strom durch die Spule steigt nur allmählich an, $I(t) = I_0 \cdot (1 - e^{-t/\tau})$ mit der Zeitkonstante $\tau = \frac{L}{R}$. Eine Lampe mit Spule leuchtet später auf als eine Lampe mit gleich großem Widerstand.
- **Ausschalten:** Die Spule treibt den Strom weiter. Fließt er über einen anderen Zweig, kann dort kurz eine große Spannung entstehen (Funke am Schalter, Glimmlampe blitzt).

Im Magnetfeld einer stromdurchflossenen Spule steckt die Energie $W = \frac{1}{2} L I^2$.

### Resonanz: So wählt ein Radio den Sender

In der Antenne erzeugen alle Sender gleichzeitig winzige Wechselspannungen. Der Schwingkreis im Radio schwingt aber nur bei seiner **Eigenfrequenz** $f_0 = \frac{1}{2\pi\sqrt{LC}}$ kräftig mit – das ist **Resonanz**. Mit einem Drehkondensator verändert man $C$ und damit $f_0$: Kleineres $C$ ergibt eine höhere Frequenz. Je kleiner der Widerstand im Kreis, desto schmaler ist die Resonanzkurve und desto besser trennt das Radio benachbarte Sender (**Trennschärfe**).

### Rückkopplung: ungedämpfte Schwingungen

Jeder echte Schwingkreis verliert Energie im Widerstand, die Schwingung klingt ab. In der **Meißner-Schaltung** steuert die Schwingung selbst einen Verstärker (Transistor), der im richtigen Moment Energie aus der Batterie nachliefert. Die Schwingung schaukelt sich auf, bis Zufuhr und Verlust gleich groß sind. So erzeugen Sender, Quarzuhren und Funkchips gleichmäßige Schwingungen.

## Ausprobieren

1. Drücke **Laden und loslassen** und beobachte die Energiebalken. Wann steckt die ganze Energie in der Spule?
2. Vervierfache die Kapazität. Was passiert mit der Periodendauer? [C = 160 µF](?C=160)
3. Stelle einen Widerstand ein. Wohin verschwindet die Energie? [Schwach gedämpft](?R=400) · [Aperiodischer Grenzfall](?R=7070)
4. Vergleiche mit dem Federpendel: Welche Größe beim Pendel entspricht dem Strom? [Federpendel](?mode=pendel)
5. **Selbstinduktion:** Lege den Schalter um und beobachte die beiden Lampen, danach schalte wieder aus. [Selbstinduktion](?mode=spule)
6. **Radio:** Stelle den Drehkondensator so ein, dass du „Klassik“ hörst. Was passiert bei großem Widerstand? [Radio](?mode=radio&dc=127&rr=20) · [Schlechte Trennschärfe](?mode=radio&dc=127&rr=200)
7. **Rückkopplung:** Vergleiche die Schwingung [ohne](?mode=rueck&R=400&rk=0) und [mit](?mode=rueck&R=400&rk=1) Verstärker.
8. **Üben:** [Sechs Aufgabenarten](?mode=ueben&qn=1) mit Punktestand.

## Aufgaben

### Aufgabe 1: Thomson-Gleichung

Ein Schwingkreis besteht aus einer Spule mit $L = 500\,\text{H}$ (mit Eisenkern) und einem Kondensator mit $C = 40\,\mu\text{F}$. Berechne Periodendauer und Frequenz. [Nachprüfen](?C=40&Lh=500)

<details>
<summary>Lösung anzeigen</summary>

$T = 2\pi\sqrt{500\,\text{H} \cdot 40 \cdot 10^{-6}\,\text{F}} = 2\pi\sqrt{0{,}02\,\text{s}^2} \approx 0{,}889\,\text{s}$, $f = \frac{1}{T} \approx 1{,}13\,\text{Hz}$.

</details>

### Aufgabe 2: Energie im Schwingkreis

Der Kondensator aus Aufgabe 1 wird auf $U_0 = 10\,\text{V}$ geladen. Wie viel Energie enthält der Schwingkreis? Wie groß ist die größte Stromstärke?

<details>
<summary>Lösung anzeigen</summary>

$E = \frac{1}{2} C U_0^2 = \frac{1}{2} \cdot 40 \cdot 10^{-6}\,\text{F} \cdot (10\,\text{V})^2 = 0{,}002\,\text{J}$. Wenn der Kondensator leer ist, steckt alles in der Spule: $\frac{1}{2} L I_\text{max}^2 = E$, also $I_\text{max} = \sqrt{\frac{2E}{L}} = \sqrt{\frac{0{,}004}{500}}\,\text{A} \approx 2{,}83\,\text{mA}$.

</details>

### Aufgabe 3: Radiofrequenz

Ein Schwingkreis in einem Radio hat $L = 10\,\text{mH}$ und $C = 1\,\text{nF}$. Welche Frequenz hat er? Warum kann man das nicht mehr mit bloßem Auge verfolgen?

<details>
<summary>Lösung anzeigen</summary>

$f = \frac{1}{2\pi\sqrt{10^{-2} \cdot 10^{-9}}}\,\text{Hz} \approx 50\,\text{kHz}$. Der Kreis schwingt 50 000-mal pro Sekunde – viel zu schnell zum Zusehen. Deshalb arbeitet die Simulation mit sehr großen Werten für $L$ und $C$, wie bei Schulversuchen mit Eisenkernspule.

</details>

### Aufgabe 4: Einschalten einer Spule

Eine Spule ($L = 500\,\text{H}$) und eine Lampe bilden zusammen den Widerstand $R = 100\,\Omega$; die Spannung ist $10\,\text{V}$. Nach welcher Zeit hat der Strom etwa 63 % seines Endwerts erreicht? Wie groß ist der Endwert? [Selbstinduktion](?mode=spule&Lh=500&Rz=100&U0=10)

<details>
<summary>Lösung anzeigen</summary>

$\tau = \frac{L}{R} = \frac{500\,\text{H}}{100\,\Omega} = 5\,\text{s}$; nach $\tau$ ist $I = I_0(1 - e^{-1}) \approx 0{,}63 \cdot I_0$. Endwert $I_0 = \frac{U}{R} = 0{,}1\,\text{A}$. Im Magnetfeld stecken dann $W = \frac{1}{2} \cdot 500 \cdot 0{,}1^2\,\text{J} = 2{,}5\,\text{J}$.

</details>

### Aufgabe 5: Sender einstellen

Die Spule im Radio hat $L = 200\,\mu\text{H}$. Welche Kapazität braucht man für den Sender bei $800\,\text{kHz}$? [Radio](?mode=radio&dc=160&rr=20&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$C = \frac{1}{4\pi^2 f^2 L} = \frac{1}{4\pi^2 \cdot (8 \cdot 10^5)^2 \cdot 2 \cdot 10^{-4}}\,\text{F} \approx 198\,\text{pF}$.

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe (Induktion und elektromagnetische Schwingungen, oft Leistungskurs). Gut vorbereitet durch die Simulationen zum Kondensator und zur Induktion.
- **Analogie nutzen:** Erst das Federpendel wiederholen, dann die Größen paarweise zuordnen. Die Tabelle erscheint unter „Ergebnisse“ im Teil „Vergleich mit dem Federpendel“.
- **Zeitlupe:** Die Werte sind so gewählt, dass der Kreis etwa eine Schwingung pro Sekunde macht (wie mit Eisenkernspule im Schulversuch). Mit „Zeitlupe ¼“ lassen sich die vier Phasen gut besprechen.
- **Häufige Stolpersteine:**
  - „Wenn der Kondensator leer ist, fließt kein Strom.“ – Genau dann ist der Strom am größten.
  - Die Energie geht im ungedämpften Kreis nicht verloren, sie wechselt nur den Ort.
  - Beim Ausschalten erwarten viele, dass der Strom sofort null ist. Die Spule treibt ihn weiter, der Strom in der zweiten Lampe kehrt dabei seine Richtung um.
