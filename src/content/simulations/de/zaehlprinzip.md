---
description: "Zählprinzip und Baumdiagramm zum Ausprobieren: Outfits, Eistüten, Zahlenschloss, Menü und Siegerpodest – der Baum wächst Stufe für Stufe, und die Anzahl ist das Produkt der Möglichkeiten je Stufe."
---

## Worum geht es?

Viele Fragen beginnen mit „Wie viele Möglichkeiten gibt es …?“: Wie viele Outfits aus 3 Hosen, 4 T-Shirts und 2 Mützen? Wie viele vierstellige PINs? Wie viele Siegerpodeste bei 8 Läuferinnen und Läufern? Man wählt **in Stufen** – erst die Hose, dann das T-Shirt, dann die Mütze.

Ein **Baumdiagramm** macht das sichtbar: Vom Start aus verzweigt sich jede Stufe in so viele Äste, wie es dort Möglichkeiten gibt. Jeder **Pfad** vom Start bis ganz rechts ist genau **ein Ergebnis** – deshalb erscheint zu jedem Pfad ein Kärtchen.

**Zählprinzip (Produktregel):** Hat die 1. Stufe $n_1$ Möglichkeiten, die 2. Stufe (zu jeder Wahl davor) $n_2$ Möglichkeiten usw., dann gibt es insgesamt

$$
n_1 \cdot n_2 \cdot \ldots \cdot n_k
$$

Ergebnisse. Für die Outfits: $3 \cdot 4 \cdot 2 = 24$. Im Baum sieht man, warum: An jeder der 3 Hosen hängen 4 T-Shirt-Äste, das sind $3 \cdot 4 = 12$ Äste, und an jedem davon 2 Mützen.

**Mit Wiederholung:** Wählt man in jeder Stufe wieder aus denselben $n$ Dingen (Ziffern einer PIN, Eissorten, die sich wiederholen dürfen), gibt es bei $k$ Stufen

$$
n \cdot n \cdot \ldots \cdot n = n^k
$$

Möglichkeiten, z. B. $10^4 = 10\,000$ vierstellige PINs aus den Ziffern 0 bis 9.

**Ohne Wiederholung:** Darf jedes Ding nur einmal vorkommen (eine Person kann nicht Erste *und* Zweite werden), hat jede Stufe eine Möglichkeit weniger: Für das Podest aus 8 Läufern gibt es $8 \cdot 7 \cdot 6 = 336$ Möglichkeiten.

**Reihenfolgen:** Sollen alle $n$ Dinge in eine Reihenfolge gebracht werden, ergibt sich das Produkt aller Zahlen von $n$ bis 1. Man schreibt es kurz als **Fakultät** $n!$ (gelesen „n Fakultät“):

$$
5! = 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1 = 120
$$

**Systematisch abzählen** geht auch ohne Baum: In der Tabelle steht jede Wahl der 1. Stufe in einer eigenen Zeile, dahinter der Reihe nach alle Fortsetzungen. Jede Zeile ist gleich lang – auch das ist wieder ein Produkt: Zeilen mal Länge einer Zeile.

## Ausprobieren

1. Schau zu, wie der Baum für die Outfits wächst. Tippe auf eine Hose: Wie viele Outfits beginnen mit ihr? Warum ist das $4 \cdot 2$? [Outfits](?sit=outfit&a=3&b=4&c=2)
2. Nimm eine dritte Mütze hinzu. Wie viele neue Äste entstehen, wie viele neue Outfits? [Eine Mütze mehr](?sit=outfit&c=3)
3. Lass mit **Alle Pfade ablaufen** jeden Pfad nacheinander aufleuchten. Wird ein Outfit doppelt gezählt? Fehlt eins?
4. Schalte bei der Eistüte **mit Wiederholung** aus und wieder ein. Welche Äste verschwinden, und warum hat jede Stufe danach eine Möglichkeit weniger? [Eistüte](?sit=eis&n=4&k=3&rep=1)
5. Beim Zahlenschloss wird der Baum riesig. Wie viele Pfade stehen hinter einem zugeklappten Ast? Prüfe mit dem Zählprinzip. [Zahlenschloss](?sit=pin&z=10&s=4)
6. Stelle beim Siegerpodest genauso viele Plätze wie Läufer ein. Vergleiche $3!$, $4!$ und $5!$ – wie schnell wachsen die Zahlen? [5 Läufer, alle Plätze](?sit=podest&l=5&p=5)
7. Wechsle zur **Tabelle**. Wo findest du im Bild die Rechnung „Zeilen mal Länge einer Zeile“? [Menü als Tabelle](?sit=menu&view=liste)

## Aufgaben

### Aufgabe 1: Kleiderschrank

Lea hat 2 Hosen, 5 T-Shirts und 3 Mützen. Wie viele verschiedene Outfits kann sie anziehen? [Aufgabe laden](?sit=outfit&a=2&b=5&c=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Nach dem Zählprinzip: $2 \cdot 5 \cdot 3 = 30$ Outfits. [In der Simulation zeigen](?sit=outfit&a=2&b=5&c=3)

</details>

### Aufgabe 2: Fahrradschloss

Ein Fahrradschloss hat 3 Räder mit den Ziffern 0 bis 9. Wie viele Einstellungen gibt es? Wie lange bräuchte man höchstens, um alle auszuprobieren, wenn man für eine Einstellung 2 Sekunden braucht?

<details>
<summary>Lösung anzeigen</summary>

$10 \cdot 10 \cdot 10 = 10^3 = 1000$ Einstellungen. $1000 \cdot 2\,\text{s} = 2000\,\text{s}$, das sind gut 33 Minuten. [In der Simulation zeigen](?sit=pin&z=10&s=3&rep=1)

</details>

### Aufgabe 3: Verschiedene Sorten

In der Eisdiele gibt es 6 Sorten. Tim möchte 3 Kugeln übereinander, alle verschieden; die Reihenfolge von unten nach oben zählt. Wie viele Eistüten sind möglich? Wie viele wären es, wenn Sorten mehrfach vorkommen dürften? [Aufgabe laden](?sit=eis&n=6&k=3&rep=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ohne Wiederholung: $6 \cdot 5 \cdot 4 = 120$. Mit Wiederholung: $6^3 = 216$. Die $216 - 120 = 96$ zusätzlichen Eistüten sind genau die, in denen mindestens eine Sorte mehrfach vorkommt. [In der Simulation zeigen](?sit=eis&n=6&k=3&rep=0)

</details>

### Aufgabe 4: Siegerehrung

Beim Sportfest laufen 8 Kinder um die Wette. Wie viele Möglichkeiten gibt es für die ersten drei Plätze? Wie viele für die komplette Einlaufreihenfolge? [Aufgabe laden](?sit=podest&l=8&p=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Podest: $8 \cdot 7 \cdot 6 = 336$. Komplette Reihenfolge: $8! = 40\,320$. [In der Simulation zeigen](?sit=podest&l=8&p=8)

</details>

### Aufgabe 5: Rückwärts gedacht

Ein Restaurant bietet 2 Vorspeisen und 3 Nachtische an und wirbt mit „24 verschiedene Menüs“. Wie viele Hauptgerichte stehen auf der Karte?

<details>
<summary>Lösung anzeigen</summary>

$2 \cdot h \cdot 3 = 24$, also $6h = 24$ und $h = 4$ Hauptgerichte. [In der Simulation zeigen](?sit=menu&v=2&h=4&d=3)

</details>

### Aufgabe 6: Wann wird es unmöglich?

Ein Code soll aus 4 verschiedenen Ziffern bestehen. Wie viele Codes gibt es mit den Ziffern 0 bis 9? Warum gibt es keinen solchen Code, wenn nur 3 Ziffern zur Auswahl stehen?

<details>
<summary>Lösung anzeigen</summary>

$10 \cdot 9 \cdot 8 \cdot 7 = 5040$ Codes. [In der Simulation zeigen](?sit=pin&z=10&s=4&rep=0)

Mit nur 3 Ziffern ist nach drei Stellen keine Ziffer mehr übrig: $3 \cdot 2 \cdot 1 \cdot 0 = 0$. [Sackgassen zeigen](?sit=pin&z=3&s=4&rep=0)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 5 (Lernbereich „Multiplikation und Division“: Zählprinzip mit Baumdiagrammen) als Einstieg, etwa mit den Outfits; in Jahrgangsstufe 8 (Laplace-Experimente) zur Wiederholung, wenn Anzahlen günstiger und möglicher Ergebnisse gezählt werden.
- **Einstieg ohne Formel:** Die Klasse könnte zuerst selbst Outfits aufschreiben und dabei Doppelte oder Lücken entdecken; das Ablaufen aller Pfade und die Tabelle zeigen dann zwei Wege, systematisch zu zählen.
- **Darstellung:** Bei vielen Pfaden wird nur der Anfang des Baums ganz gezeichnet; zugeklappte Äste tragen die Zahl der Pfade dahinter. Das kann ein Anlass sein zu besprechen, warum man ab einer gewissen Größe rechnet statt zeichnet.
- **Häufige Stolpersteine:**
  - Anzahlen werden addiert statt multipliziert ($3 + 4 + 2$) – im Baum lässt sich zeigen, dass zu *jeder* Hose alle T-Shirts gehören.
  - „Mit“ und „ohne Wiederholung“ werden verwechselt; hilfreich ist die Frage, ob dasselbe Ding in einer späteren Stufe noch einmal gewählt werden kann.
  - Bei der Eistüte hängt die Anzahl davon ab, ob die Reihenfolge zählt. Hier zählt sie (unten, Mitte, oben); ohne Reihenfolge wären es weniger Möglichkeiten.
  - $0! = 1$ wirkt zunächst seltsam; es passt aber dazu, dass es genau eine Möglichkeit gibt, nichts anzuordnen.
