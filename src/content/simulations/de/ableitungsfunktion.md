## Worum geht es?

Die **Ableitung** $f'(x)$ ist die Steigung der **Tangente** an den Graphen von $f$ an der Stelle $x$. Man erhält sie als Grenzwert der Sekantensteigungen (**Differenzenquotient**):

$$
f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}
$$

Beispiel $f(x) = x^2$ an der Stelle $1$ mit $h = 0{,}1$: rechtsseitig $\frac{1{,}21 - 1}{0{,}1} = 2{,}1$, linksseitig $\frac{1 - 0{,}81}{0{,}1} = 1{,}9$, beidseitig $\frac{1{,}21 - 0{,}81}{0{,}2} = 2$. Für $h \to 0$ nähern sich alle dem Wert $f'(1) = 2$. Stimmen der links- und der rechtsseitige Grenzwert **nicht** überein, hat der Graph einen **Knick** und $f$ ist dort nicht differenzierbar (z. B. $|x|$ bei $0$: links $-1$, rechts $1$).

Ordnet man jeder Stelle $x$ die Steigung $f'(x)$ zu, entsteht die **Ableitungsfunktion** $f'$. Ihren Graphen kann man skizzieren, ohne zu rechnen:

- Wo $f$ **steigt**, ist $f'(x) > 0$; wo $f$ **fällt**, ist $f'(x) < 0$. Je steiler $f$, desto weiter ist $f'$ von der $x$-Achse entfernt.
- Eine **waagrechte Tangente** von $f$ ist eine **Nullstelle** von $f'$. Mit Vorzeichenwechsel ($+ \to -$ Hochpunkt, $- \to +$ Tiefpunkt) liegt eine Extremstelle vor, ohne Vorzeichenwechsel ein **Terrassenpunkt** (Sattelpunkt).
- Wo $f$ am steilsten steigt oder fällt (**Wendestelle**), hat $f'$ ein **Extremum**. Dort wechselt $f''$ das Vorzeichen: $f'' > 0$ heißt linksgekrümmt, $f'' < 0$ rechtsgekrümmt.

Die **Ableitungsregeln** lassen sich am Bild begründen: Faktorregel $(a \cdot f)' = a \cdot f'$ (alle Höhen und damit alle Steigungen werden $a$-mal so groß), Summenregel $(g + h)' = g' + h'$ (die Zuwächse addieren sich), Potenzregel $(x^n)' = n \cdot x^{n-1}$, Produktregel $(u \cdot v)' = u' \cdot v + u \cdot v'$ (Zuwachs einer Rechteckfläche) und Kettenregel $(\sin(kx))' = k \cdot \cos(kx)$.

Im Alltag ist $f'$ eine **Änderungsrate**: Weg → Geschwindigkeit → Beschleunigung, Wassermenge → Zufluss, Kosten → Grenzkosten, Höhenprofil → Steigung ($100\,\tfrac{\text{m}}{\text{km}} = 10\,\%$).

## Ausprobieren

1. [Tangente läuft](?mode=trace&fn=cub&x=-2.5): Drücke „P durchlaufen lassen“. Vergleiche die senkrechte Seite des Steigungsdreiecks (bei $\Delta x = 1$) mit dem senkrechten Balken im Bild von $f'$: Er ist genau $f'(x)$ hoch.
2. [Mit zweiter Ableitung](?mode=trace&fn=cub&x=-2.5&d2=1): Die kleine Tangente an $f'$ hat die Steigung $f''(x)$. Wo ist $f''$ null?
3. [Parabel](?fn=par&x=-3), [Sinus](?fn=sin&x=-6), [e-Funktion](?fn=exp&x=-3.5&full=1) und [ln x](?fn=ln&x=0.5): Welche bekannte Funktion entsteht jeweils unten?
4. [Sekante → Tangente](?mode=sek&fn=par&pa=1&pb=0&pc=0&x=1&h=1): Drücke „h gegen 0 gehen lassen“. Wie verändert sich der Punkt im Diagramm des Differenzenquotienten? Stelle auch „links“ und „beidseitig“ ein.
5. [Knick bei |x|](?mode=sek&fn=abs&x=0&h=1.5&side=l): Warum treffen sich die beiden Äste im unteren Bild bei $h = 0$ nicht?
6. [Merkmale](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1): Drücke „Merkmale Schritt für Schritt“ und folge den Hilfslinien durch alle drei Bilder. [Sattelpunkt von x³](?mode=feat&k3=1&k2=0&k1=0&k0=0&d2=1): Was ist anders?
7. Regeln: [Faktorregel](?mode=rule&rule=fak&fn=sin&rk=2&x=0.5), [Summenregel](?mode=rule&rule=sum&x=1), [Potenzregel](?mode=rule&rule=pow&pn=3&x=1&dx=0.5), [Produktregel](?mode=rule&rule=prod&x=2&dx=0.5), [Kettenregel](?mode=rule&rule=chain&rk=2&x=0.5). Verkleinere $\Delta x$ bei der Produktregel: Was passiert mit dem kleinen Eckstück $\Delta u \cdot \Delta v$?
8. Alltag: [Auto](?kind=app&app=car&x=0&d2=1), [100-m-Lauf](?kind=app&app=sprint&x=0&d2=1), [Fahrstuhl](?mode=feat&kind=app&app=lift&d2=1), [Hochwurf](?mode=feat&kind=app&app=ball&d2=1), [Temperatur](?kind=app&app=temp&x=0), [Epidemie](?mode=feat&kind=app&app=pop&d2=1), [Kosten](?mode=feat&kind=app&app=cost), [Wanderung](?kind=app&app=hike&x=0), [Badewanne](?mode=sek&kind=app&app=tank&x=5&h=2). Was bedeuten Hochpunkt, Nullstelle von $f'$ und Wendepunkt jeweils?

## Aufgaben

### Aufgabe 1: Merkmale von x³ − 3x

Bestimme für $f(x) = x^3 - 3x$ zuerst grafisch, dann rechnerisch $f'(2)$, die Extrem- und die Wendestellen. [Aufgabe laden](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 3x^2 - 3$, also $f'(2) = 12 - 3 = 9$. $f'(x) = 0$ für $x = \pm 1$: bei $-1$ wechselt $f'$ von $+$ nach $-$ (Hochpunkt $(-1 \mid 2)$), bei $1$ von $-$ nach $+$ (Tiefpunkt $(1 \mid -2)$). $f''(x) = 6x$ ist bei $0$ null und wechselt das Vorzeichen: Wendepunkt $(0 \mid 0)$. [Lösung zeigen](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1)

</details>

### Aufgabe 2: Differenzenquotient

Berechne für $f(x) = x^2$ an der Stelle $x = 1$ mit $h = 0{,}1$ den rechts-, links- und beidseitigen Differenzenquotienten. Welcher liegt am nächsten an $f'(1)$? [Aufgabe laden](?mode=sek&fn=par&pa=1&pb=0&pc=0&x=1&h=0.1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Rechts $\frac{1{,}21 - 1}{0{,}1} = 2{,}1$, links $\frac{1 - 0{,}81}{0{,}1} = 1{,}9$, beidseitig $\frac{1{,}21 - 0{,}81}{0{,}2} = 2$. Der beidseitige Quotient trifft $f'(1) = 2$ hier sogar genau (bei Parabeln immer); die einseitigen weichen um genau $h$ ab. [Lösung zeigen](?mode=sek&fn=par&pa=1&pb=0&pc=0&x=1&h=0.1&side=c)

</details>

### Aufgabe 3: Skizziere f′

Skizziere den Graphen der Ableitung von $f(x) = \frac{1}{4}(x^3 - 6x)$: Zieh die sieben Punkte im unteren Bild und drücke dann „Lösung aufdecken“. [Aufgabe laden](?mode=draw&fn=cub)

<details>
<summary>Lösung anzeigen</summary>

$f$ steigt, fällt zwischen den Extremstellen $x = \pm\sqrt{2} \approx \pm 1{,}41$ und steigt wieder. Also ist $f'$ eine nach oben geöffnete Parabel mit Nullstellen bei $\pm\sqrt{2}$ und Tiefpunkt bei $x = 0$ (Wendestelle von $f$): $f'(x) = \frac{3}{4}x^2 - 1{,}5$, z. B. $f'(0{,}5) = -1{,}3125$. [Lösung zeigen](?mode=feat&fn=cub&d2=1)

</details>

### Aufgabe 4: Auto

Ein Auto legt in $t$ Sekunden den Weg $s(t) = -0{,}05t^3 + 1{,}5t^2$ (in m) zurück ($0 \le t \le 20$). Wie schnell ist es nach $4$ s? Wann fährt es am schnellsten, und wie groß ist die Beschleunigung beim Start? [Aufgabe laden](?kind=app&app=car&x=4&d2=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v(t) = s'(t) = -0{,}15t^2 + 3t$, also $v(4) = -2{,}4 + 12 = 9{,}6\,\tfrac{\text{m}}{\text{s}} \approx 34{,}6\,\tfrac{\text{km}}{\text{h}}$. $a(t) = v'(t) = -0{,}3t + 3$ ist bei $t = 10$ null: Dort ist $v$ maximal, $v(10) = 15\,\tfrac{\text{m}}{\text{s}} = 54\,\tfrac{\text{km}}{\text{h}}$, und $s$ hat einen Wendepunkt. Beim Start gilt $a(0) = 3\,\tfrac{\text{m}}{\text{s}^2}$. [Lösung zeigen](?kind=app&app=car&x=4&d2=1)

</details>

### Aufgabe 5: Regeln anwenden

a) Leite $f(x) = 2\sin x + x^3$ ab und berechne $f'(0)$. b) Berechne mit der Produktregel $(u \cdot v)'(2)$ für $u(x) = 1 + 0{,}5x$ und $v(x) = 1 + 0{,}25x^2$. [Aufgabe laden](?mode=rule&rule=prod&x=2&dx=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

a) Faktor-, Summen- und Potenzregel: $f'(x) = 2\cos x + 3x^2$, $f'(0) = 2$. b) $u(2) = 2$, $u' = 0{,}5$, $v(2) = 2$, $v'(x) = 0{,}5x$, also $v'(2) = 1$: $(u \cdot v)'(2) = 0{,}5 \cdot 2 + 2 \cdot 1 = 3$. [Zeigen](?mode=rule&rule=prod&x=2&dx=0.5)

</details>

### Aufgabe 6: Wahr oder falsch?

„Hat $f'$ an der Stelle $x_0$ einen Hochpunkt, so hat auch $f$ dort einen Hochpunkt.“

<details>
<summary>Lösung anzeigen</summary>

Falsch. Ein Hochpunkt von $f'$ bedeutet: $f$ steigt dort am stärksten – $f$ hat bei $x_0$ eine **Wendestelle**. Beispiel Epidemie: Die meisten neuen Fälle pro Tag ($N'$ maximal, nach etwa $13{,}2$ Tagen) liegen am Wendepunkt der Fallzahl $N$. [Beispiel](?mode=feat&kind=app&app=pop&d2=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe, Einführung der Differentialrechnung: Sekanten- und Tangentensteigung, Ableitungsfunktion, Monotonie, Extrem- und Wendestellen; später Ableitung von Sinus und Kosinus grafisch plausibel machen sowie Produkt- und Kettenregel. Wann Faktor-, Summen- und Potenzregel eingeführt werden, unterscheidet sich je nach Lehrplan. Die Ansichten passen als Abfolge: Sekante → Tangente, Tangente läuft, Merkmale, eigene Skizze, Regeln.
- **Vorhersagen:** Mit „Terme und Werte zeigen“ aus skizzieren die Lernenden $f'$ zuerst auf Papier, dann prüfen sie mit der Spur oder im Aufgabenmodus „f′ skizzieren“, der für jeden Punkt rückmeldet, ob er passt.
- **Differenzierbarkeit:** Das Diagramm „Differenzenquotient über h“ zeigt Grenzwerte als Bild: Bei glatten Funktionen laufen linker und rechter Ast auf denselben Punkt zu, bei $|x|$ nicht.
- **Alltagsbezug:** Neun Beispiele mit Einheiten (m/s, m/s², L/min, GE/ME, m/km und Prozent) – gut für die Deutung von Hochpunkten, Nullstellen von $f'$ und Wendepunkten im Sachzusammenhang.
- **Häufige Stolpersteine:**
  - Hochpunkt von $f$ und Hochpunkt von $f'$ werden verwechselt.
  - Der Funktionswert $f(x)$ wird mit der Steigung $f'(x)$ verwechselt („$f$ ist negativ, also fällt $f$“).
  - Eine Nullstelle von $f'$ ohne Vorzeichenwechsel wird als Extremstelle gedeutet.
  - Wendestellen werden übersehen, weil dort am Graphen „nichts Besonderes“ zu sehen ist.
