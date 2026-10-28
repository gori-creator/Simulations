---
description: "Interaktive Simulation für die 7. Klasse: Scheitel- und Nebenwinkel an zwei sich schneidenden Geraden, Stufen-, Wechsel- und Nachbarwinkel an einer Doppelkreuzung durch Verschieben und Drehen vergleichen und Winkelgrößen begründen."
---

## Worum geht es?

**Zwei Geraden schneiden sich** im Punkt $S$. Dabei entstehen vier Winkel $\alpha$, $\beta$, $\gamma$, $\delta$ (gegen den Uhrzeigersinn).

- **Scheitelwinkel** liegen sich am Schnittpunkt gegenüber. Sie sind **gleich groß**: $\alpha = \gamma$ und $\beta = \delta$.
- **Nebenwinkel** liegen nebeneinander an einer Geraden und bilden zusammen einen gestreckten Winkel. Sie **ergänzen sich zu $180^\circ$**: $\alpha + \beta = 180^\circ$.

Beispiel: Bei einem Schnittwinkel von $\alpha = 65^\circ$ ist $\gamma = 65^\circ$ und $\beta = \delta = 180^\circ - 65^\circ = 115^\circ$. Zusammen ergeben alle vier Winkel $360^\circ$. Stehen die Geraden senkrecht aufeinander, sind alle vier Winkel $90^\circ$ groß.

**Doppelkreuzung:** Zwei Geraden $g$ und $h$ werden von einer dritten Geraden $s$ geschnitten. An jeder Kreuzung liegen vier Winkel, hier $\alpha_1, \beta_1, \gamma_1, \delta_1$ an $g$ und $\alpha_2, \beta_2, \gamma_2, \delta_2$ an $h$.

| Winkelpaar | Lage | Figur | bei $g \parallel h$ |
| --- | --- | --- | --- |
| Stufenwinkel | an beiden Kreuzungen an der gleichen Stelle | F | gleich groß |
| Wechselwinkel | verschiedene Seiten von $s$, beide zwischen $g$ und $h$ (oder beide außen) | Z | gleich groß |
| Nachbarwinkel | gleiche Seite von $s$, beide zwischen $g$ und $h$ (oder beide außen) | E | Summe $180^\circ$ |

Warum? Verschiebt man die Kreuzung an $g$ entlang $s$, bis sie auf der Kreuzung an $h$ liegt, so deckt sich $g$ genau dann mit $h$, wenn $g \parallel h$ ist – dann decken sich auch die Stufenwinkel. Wechselwinkel sind Scheitelwinkel von Stufenwinkeln: $\gamma_2 = \alpha_2 = \alpha_1$. Umgekehrt gilt: Sind Stufenwinkel (oder Wechselwinkel) gleich groß, dann sind $g$ und $h$ parallel.

$$
g \parallel h \;\Longrightarrow\; \alpha_1 = \alpha_2, \qquad \alpha_1 = \gamma_2, \qquad \alpha_1 + \delta_2 = 180^\circ
$$

## Ausprobieren

1. Ziehe die Griffe auf $g$ und $h$. Welche Winkel bleiben immer gleich groß? Was ergeben zwei benachbarte Winkel zusammen? [Beispiel laden](?w=65&a=20)
2. Drücke „Nebenwinkel zusammenlegen“ und „Scheitelwinkel drehen“. Tippe vorher einen anderen Winkel an.
3. Stelle [senkrechte Geraden](?w=90&a=0) und [fast parallele Geraden](?w=8&a=15) ein. Was passiert mit den Nebenwinkeln?
4. Wechsle zur [Doppelkreuzung](?mode=doppel). Drücke „Entlang s verschieben“: Die Kreuzung an $g$ gleitet nach oben. Was fällt dir auf?
5. Wähle [Wechselwinkel](?mode=doppel&rel=wechsel&g=62&s=60) und drücke „Um 180° drehen“.
6. Schalte „g ∥ h“ aus ([Beispiel](?mode=doppel&par=0&g=50&h=58)) und verschiebe noch einmal. Wie groß ist der Unterschied?
7. Begründe im [Aufgabenmodus](?mode=aufgabe) jeden Winkel. Lies die Begründung in der Seitenleiste nach.

## Aufgaben

### Aufgabe 1: Vier Winkel

Zwei Geraden schneiden sich unter $\alpha = 38^\circ$. Bestimme $\beta$, $\gamma$ und $\delta$ und begründe. [Aufgabe laden](?w=38&a=10&vals=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\gamma = 38^\circ$ (Scheitelwinkel zu $\alpha$), $\beta = 180^\circ - 38^\circ = 142^\circ$ (Nebenwinkel zu $\alpha$), $\delta = 142^\circ$ (Scheitelwinkel zu $\beta$). Probe: $38^\circ + 142^\circ + 38^\circ + 142^\circ = 360^\circ$. [In der Simulation zeigen](?w=38&a=10)

</details>

### Aufgabe 2: Dreimal so groß

Ein Winkel ist dreimal so groß wie sein Nebenwinkel. Wie groß sind die beiden Winkel?

<details>
<summary>Lösung anzeigen</summary>

Nebenwinkel $x$, Winkel $3x$: $x + 3x = 180^\circ$, also $4x = 180^\circ$ und $x = 45^\circ$. Die Winkel sind $45^\circ$ und $135^\circ$. [In der Simulation zeigen](?w=45&a=0)

</details>

### Aufgabe 3: Acht Winkel an Parallelen

$g \parallel h$, die Querlinie $s$ schneidet $g$ unter $\alpha_1 = 62^\circ$. Bestimme alle acht Winkel. [Aufgabe laden](?mode=doppel&g=62&vals=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\gamma_1 = 62^\circ$ (Scheitelwinkel), $\beta_1 = \delta_1 = 180^\circ - 62^\circ = 118^\circ$ (Nebenwinkel). Wegen $g \parallel h$ sind die Stufenwinkel gleich: $\alpha_2 = \gamma_2 = 62^\circ$, $\beta_2 = \delta_2 = 118^\circ$. Alle Winkel sind also $62^\circ$ oder $118^\circ$ groß. [In der Simulation zeigen](?mode=doppel&g=62)

</details>

### Aufgabe 4: Eine Begründungskette

$g \parallel h$ und $\beta_2 = 70^\circ$. Bestimme $\alpha_1$ und begründe jeden Schritt. [Aufgabe laden](?mode=aufgabe&gi=b2&gv=70&tg=5)

<details>
<summary>Lösung anzeigen</summary>

$\alpha_2 = 180^\circ - 70^\circ = 110^\circ$ (Nebenwinkel zu $\beta_2$), dann $\alpha_1 = \alpha_2 = 110^\circ$ (Stufenwinkel, $g \parallel h$). Andere Wege sind ebenso richtig, z. B. $\beta_1 = \beta_2 = 70^\circ$ (Stufenwinkel) und $\alpha_1 = 180^\circ - 70^\circ = 110^\circ$ (Nebenwinkel).

</details>

### Aufgabe 5: Parallel oder nicht?

Die Querlinie $s$ schneidet $g$ unter $\alpha_1 = 50^\circ$ und $h$ unter $\alpha_2 = 58^\circ$. Sind $g$ und $h$ parallel? Begründe mit einem Winkelpaar. [Aufgabe laden](?mode=doppel&par=0&g=50&h=58&vals=0)

<details>
<summary>Lösung anzeigen</summary>

Nein. $\alpha_1$ und $\alpha_2$ sind Stufenwinkel. Wären $g$ und $h$ parallel, müssten sie gleich groß sein; sie unterscheiden sich aber um $58^\circ - 50^\circ = 8^\circ$. Die Geraden schneiden sich also irgendwo (hier außerhalb des Bildes). [Verschieben zeigt den Unterschied](?mode=doppel&par=0&g=50&h=58)

</details>

### Aufgabe 6: Umkehrung (Vertiefung)

An einer Doppelkreuzung ist $\alpha_1 = 75^\circ$ und $\delta_2 = 105^\circ$. Begründe, dass $g \parallel h$ gilt.

<details>
<summary>Lösung anzeigen</summary>

$\alpha_2 = 180^\circ - \delta_2 = 75^\circ$ (Nebenwinkel). Damit sind die Stufenwinkel $\alpha_1$ und $\alpha_2$ gleich groß, also ist $g \parallel h$. Kürzer: Die Nachbarwinkel $\alpha_1$ und $\delta_2$ ergänzen sich zu $75^\circ + 105^\circ = 180^\circ$. [In der Simulation zeigen](?mode=doppel&rel=nachbar&g=75)

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 7, Winkel an Figuren: Scheitel-, Neben-, Stufen- und Wechselwinkel als Grundlage für den Beweis der Innenwinkelsumme. Die Animationen eignen sich als gemeinsamer Einstieg am Whiteboard, der Aufgabenmodus für Einzel- oder Partnerarbeit mit mündlichen Begründungen.
- **Argumentieren:** Der Aufgabenmodus zeigt zu jedem angetippten Winkel eine kurze Begründungskette. Es kann reizvoll sein, die Lernenden zuerst selbst begründen zu lassen und die angezeigte Kette als Vergleich zu nutzen – oft gibt es mehrere richtige Wege.
- **Begriffe:** Für die E-Figur sind verschiedene Namen üblich (Nachbarwinkel, entgegengesetzte Winkel, E- oder U-Winkel). Manche Schulbücher schreiben $\alpha'$, $\beta'$, … statt $\alpha_2$, $\beta_2$, … Bitte am eingeführten Schulbuch prüfen, welche Begriffe in Ihrer Klasse verwendet werden.
- **Modell:** Winkel werden auf ganze Grad gerundet; $g \parallel h$ bedeutet hier, dass $s$ beide Geraden unter demselben Winkel schneidet.
- **Häufige Stolpersteine:**
  - „Stufenwinkel sind immer gleich groß“ – nur, wenn $g$ und $h$ parallel sind. Das Verschieben bei nicht parallelen Geraden macht den Unterschied sichtbar.
  - Scheitel- und Nebenwinkel werden verwechselt: Scheitelwinkel liegen gegenüber und haben nur den Scheitel gemeinsam, Nebenwinkel haben einen gemeinsamen Schenkel.
  - Wechselwinkel werden auf derselben Seite von $s$ gesucht – die Z-Figur hilft.
  - In Begründungen fehlt die Voraussetzung „weil $g \parallel h$“.
