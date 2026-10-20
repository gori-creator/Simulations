---
description: "Interaktive Simulation für die 6. und 7. Klasse: Grundwert, Prozentsatz und Prozentwert am Prozentstreifen – mit Dreisatz Schritt für Schritt, Hunderterfeld und Kreis, Rabatt, Preiserhöhung, Mehrwertsteuer, Zinsen, Umfragen und dem Stolperstein beim Zurückrechnen."
---

## Worum geht es?

Prozent heißt **Hundertstel**: $1\,\% = \frac{1}{100}$, also $25\,\% = \frac{25}{100} = \frac{1}{4} = 0{,}25$. In jeder Prozentaufgabe kommen drei Größen vor:

- der **Grundwert** $G$ – das Ganze, er entspricht $100\,\%$ (im Bild violett),
- der **Prozentsatz** $p\,\%$ – der Anteil in Prozent (orange),
- der **Prozentwert** $W$ – der Anteil als Größe, z. B. in Euro (blau).

Am **Prozentstreifen** stehen oben die Prozente und unten die passenden Werte. Der ganze Streifen bis $100\,\%$ ist der Grundwert, der gefärbte Teil der Prozentwert.

**Dreisatz am Streifen** (Beispiel: $25\,\%$ von $80\,€$): Man teilt den Streifen in $100$ gleiche Teile. Ein Teil ist $1\,\%$.

$$
100\,\% \;\hat{=}\; 80\,€ \quad\xrightarrow{:\,100}\quad 1\,\% \;\hat{=}\; 0{,}80\,€ \quad\xrightarrow{\cdot\,25}\quad 25\,\% \;\hat{=}\; 20\,€
$$

Ist der **Grundwert gesucht**, rechnet man rückwärts: vom Prozentwert auf $1\,\%$ und dann auf $100\,\%$. Ist der **Prozentsatz gesucht**, fragt man: Wie oft passt der Wert von $1\,\%$ in den Prozentwert?

**Mit der Formel:**

$$
W = G \cdot \frac{p}{100}, \qquad p\,\% = \frac{W}{G}, \qquad G = W \cdot \frac{100}{p}
$$

**Vermehrter und verminderter Grundwert:** Bei $20\,\%$ **Rabatt** zahlt man noch $80\,\%$ des alten Preises, also $G \cdot 0{,}8$. Nach einer **Preiserhöhung** um $20\,\%$ kostet es $120\,\%$, also $G \cdot 1{,}2$ – der Streifen wird länger als $100\,\%$. Auf den Nettopreis kommen in Deutschland meist $19\,\%$ **Mehrwertsteuer** (ermäßigt $7\,\%$): Der Bruttopreis ist $119\,\%$ des Nettopreises. **Zinsen** für ein Jahr sind $p\,\%$ des Kapitals.

**Stolperstein beim Zurückrechnen:** Kostet ein Fahrrad nach $+20\,\%$ nun $84\,€$, dann sind $84\,€ \;\hat{=}\; 120\,\%$ – nicht $100\,\%$. Also $84\,€ : 1{,}2 = 70\,€$. Wer $20\,\%$ von $84\,€$ abzieht, erhält $67{,}20\,€$ und rechnet mit dem falschen Grundwert.

## Ausprobieren

1. [Start](?G=80&p=25): Drücke „Dreisatz am Streifen“. Der Streifen zerfällt in $100$ Teile, dann werden $25$ Teile gezählt. Beobachte dabei das Hunderterfeld.
2. Ziehe den orangen Griff, tippe auf den Streifen oder auf Kästchen im Hunderterfeld: Stelle $10\,\%$, $25\,\%$, $50\,\%$ und $75\,\%$ ein. Welche Brüche gehören dazu? [Drei Viertel im Kreis](?p=75&rep=pie)
3. [1 % von 250](?G=250&p=1): Warum ist $1\,\%$ von $250$ gleich $2{,}5$? Was sind dann $10\,\%$?
4. [Grundwert gesucht](?find=G&G=240&p=15): Starte die Animation – jetzt wird rückwärts gezählt, von $15\,\%$ über $1\,\%$ bis $100\,\%$.
5. [Über 100 %](?G=80&p=150): Der Prozentwert ist größer als der Grundwert. Wo liegt dann der Griff?
6. Alltag: [Rabatt](?sit=rabatt&G=60&p=20), [Preiserhöhung](?sit=erh&G=70&p=20), [Kassenbon](?sit=mwst&G=50&p=19), [Sparbuch](?sit=zins&G=1200&p=2.5), [Umfrage](?sit=klasse&find=p&G=48&p=25). Welcher Teil des Streifens ist jeweils der neue Preis?
7. [Stolperstein](?sit=erh&find=G&G=70&p=20): Vergleiche die beiden Streifen. Warum endet der rote Streifen vor der violetten Linie?

## Aufgaben

### Aufgabe 1: Prozentwert

Wie viel sind $25\,\%$ von $80\,€$? [Aufgabe laden](?G=80&p=25&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$100\,\% \;\hat{=}\; 80\,€$, $1\,\% \;\hat{=}\; 0{,}80\,€$, $25\,\% \;\hat{=}\; 25 \cdot 0{,}80\,€ = 20\,€$. Kürzer: $25\,\% = \frac14$, und ein Viertel von $80\,€$ sind $20\,€$. [Lösung zeigen](?G=80&p=25)

</details>

### Aufgabe 2: Im Schlussverkauf

Ein Pullover kostet $60\,€$. Es gibt $20\,\%$ Rabatt. Wie viel kostet er jetzt? [Aufgabe laden](?sit=rabatt&G=60&p=20&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Rabatt: $60\,€ \cdot 0{,}2 = 12\,€$, neuer Preis $60\,€ - 12\,€ = 48\,€$. Kürzer: Man zahlt $80\,\%$, also $60\,€ \cdot 0{,}8 = 48\,€$. [Lösung zeigen](?sit=rabatt&G=60&p=20)

</details>

### Aufgabe 3: Der Kassenbon

a) Kopfhörer kosten netto $50\,€$. Was kosten sie mit $19\,\%$ Mehrwertsteuer? [Aufgabe laden](?sit=mwst&G=50&p=19&show=0&_hide=1)

b) Auf einem Kassenbon stehen $119\,€$ einschließlich $19\,\%$ Mehrwertsteuer. Wie hoch ist der Nettopreis? [Aufgabe laden](?sit=mwst&find=G&G=100&p=19&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

a) $19\,\%$ von $50\,€$ sind $9{,}50\,€$, zusammen $59{,}50\,€$; kürzer $50\,€ \cdot 1{,}19 = 59{,}50\,€$. [Zeigen](?sit=mwst&G=50&p=19)

b) $119\,€ \;\hat{=}\; 119\,\%$, also $1\,\% \;\hat{=}\; 1\,€$ und $100\,\% \;\hat{=}\; 100\,€$. [Zeigen](?sit=mwst&find=G&G=100&p=19)

</details>

### Aufgabe 4: Das Sparbuch

Auf einem Sparbuch liegen $1200\,€$, der Zinssatz beträgt $2{,}5\,\%$ im Jahr. Wie viele Zinsen gibt es nach einem Jahr, und wie hoch ist dann der Kontostand? [Aufgabe laden](?sit=zins&G=1200&p=2.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$1\,\% \;\hat{=}\; 12\,€$, also $2{,}5\,\% \;\hat{=}\; 2{,}5 \cdot 12\,€ = 30\,€$ Zinsen. Kontostand: $1200\,€ + 30\,€ = 1230\,€$. [Lösung zeigen](?sit=zins&G=1200&p=2.5)

</details>

### Aufgabe 5: Der Stolperstein

a) Nach einer Preiserhöhung um $20\,\%$ kostet ein Fahrrad $84\,€$. Wie teuer war es vorher? [Aufgabe laden](?sit=erh&find=G&G=70&p=20&show=0&_hide=1)

b) Ein Preis wird erst um $20\,\%$ erhöht und danach um $20\,\%$ gesenkt. Ist er dann wieder so hoch wie am Anfang?

<details>
<summary>Lösung anzeigen</summary>

a) $84\,€ \;\hat{=}\; 120\,\%$, $1\,\% \;\hat{=}\; 0{,}70\,€$, $100\,\% \;\hat{=}\; 70\,€$. Probe: $70\,€ \cdot 1{,}2 = 84\,€$. Falsch wäre $84\,€ - 20\,\%$ von $84\,€ = 67{,}20\,€$, denn die $20\,\%$ beziehen sich auf den alten Preis. [Zeigen](?sit=erh&find=G&G=70&p=20)

b) Nein: $1{,}2 \cdot 0{,}8 = 0{,}96$. Aus $100\,€$ werden $120\,€$ und dann $96\,€$ – am Ende $4\,\%$ weniger als am Anfang, weil sich die Senkung auf den größeren Grundwert $120\,€$ bezieht.

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 6 (Prozent als Bruchteil, einfache Prozentaufgaben wie Rabatt und Zins) und Jahrgangsstufe 7 (Vertiefung der Prozentrechnung, vermehrter und verminderter Grundwert) im LehrplanPLUS Gymnasium Bayern – die genaue Zuordnung bitte am Lehrplan prüfen.
- **Schätzen vor dem Rechnen:** Mit „Lösung zeigen“ aus (`show=0`) erscheint die gesuchte Größe als „?“. Die Lernenden schätzen am Streifen, rechnen und prüfen mit der Animation. „Neue Aufgabe“ liefert dazu glatte Zahlen – vielleicht für eine Übungsphase in Partnerarbeit.
- **Drei Darstellungen verbinden:** Streifen, Hunderterfeld und Kreis zeigen denselben Anteil – eine Brücke vom Bruch ($\frac34$) über die Dezimalzahl ($0{,}75$) zum Prozent ($75\,\%$).
- **Modell:** Geldbeträge werden auf Cent gerundet, nicht exakte Werte erscheinen mit „≈“. Zinsen nur für ein Jahr, ohne Zinseszins.
- **Häufige Stolpersteine:**
  - Grundwert und Prozentwert werden vertauscht („Wovon sind es Prozent?“).
  - Bei Rabatt und Mehrwertsteuer wird der Betrag der Änderung mit dem neuen Preis verwechselt.
  - Beim Zurückrechnen wird der Prozentsatz vom neuen Wert abgezogen ($84\,€ - 20\,\% \ne 70\,€$).
  - $+20\,\%$ und $-20\,\%$ heben sich scheinbar auf.
  - Prozentsätze über $100\,\%$ werden für unmöglich gehalten.
  - Bei Personen ergeben sich Prozentwerte wie $9{,}24$ Kinder – ein guter Anlass, über sinnvolle Ergebnisse zu sprechen.
