---
description: Interaktive Achterbahn zur Energieerhaltung – Lage-, Bewegungs- und innere Energie beim Fahren durch Tal, Hügel und Looping.
---

## Worum geht es?

Ein Achterbahnwagen hat oben am Start **Lageenergie** (Höhenenergie). Rollt er hinunter, wird sie in **Bewegungsenergie** umgewandelt – und beim Hochfahren wieder zurück:

$$
E_\text{pot} = m \cdot g \cdot h \qquad E_\text{kin} = \tfrac{1}{2} m v^2
$$

Ohne Reibung gilt der **Energieerhaltungssatz**: Die Summe bleibt immer gleich. Daraus folgt die Geschwindigkeit in jeder Höhe:

$$
m g h_0 = m g h + \tfrac{1}{2} m v^2 \quad\Rightarrow\quad v = \sqrt{2 g (h_0 - h)}
$$

Die Masse kürzt sich heraus: Ein schwerer und ein leichter Wagen sind an jeder Stelle gleich schnell.

Mit **Reibung** wird ein Teil der Energie in **innere Energie** (Wärme) umgewandelt. Die Gesamtenergie bleibt erhalten, aber der Wagen erreicht seine Starthöhe nicht mehr.

**Looping:** Damit der Wagen oben (Höhe $2r$) nicht abhebt, muss dort $v^2 \geq g \cdot r$ gelten. Ohne Reibung braucht man dafür eine Starthöhe von mindestens $2{,}5 \cdot r$.

## Ausprobieren

1. Drücke **Losfahren** und beobachte die Energie-Säulen. Was bleibt immer gleich?
2. Ziehe den Wagen vor der Fahrt auf eine andere Starthöhe.
3. Schalte Reibung ein. Wohin verschwindet die Energie? [Mit Reibung](?mu=0.03)
4. Starte den Looping aus $20\,\text{m}$ und aus $13\,\text{m}$ Höhe. [Looping](?track=looping&h0=20) · [Zu niedrig](?track=looping&h0=13)

## Aufgaben

### Aufgabe 1: Geschwindigkeit im Tal

Der Wagen startet im Tal aus $15\,\text{m}$ Höhe. Wie schnell ist er am tiefsten Punkt (ohne Reibung)? [Aufgabe laden](?track=tal&h0=15&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$v = \sqrt{2 \cdot 9{,}81\,\tfrac{\text{m}}{\text{s}^2} \cdot 15\,\text{m}} \approx 17{,}2\,\tfrac{\text{m}}{\text{s}} \approx 62\,\tfrac{\text{km}}{\text{h}}$$

</details>

### Aufgabe 2: Doppelte Masse

Was ändert sich, wenn der Wagen doppelt so schwer ist: die Geschwindigkeit, die Energien oder beides? [Ausprobieren](?track=tal&h0=15&m=800)

<details>
<summary>Lösung anzeigen</summary>

Alle Energien verdoppeln sich, die Geschwindigkeit bleibt gleich – in $v = \sqrt{2g(h_0 - h)}$ kommt die Masse nicht vor.

</details>

### Aufgabe 3: Mindesthöhe für den Looping

Begründe, dass der Wagen ohne Reibung mindestens aus der Höhe $2{,}5 \cdot r$ starten muss, um den Looping (Radius $r = 6\,\text{m}$) sicher zu durchfahren. Prüfe in der Simulation mit $14\,\text{m}$ und $16\,\text{m}$.

<details>
<summary>Lösung anzeigen</summary>

Oben im Looping muss die Gewichtskraft allein ausreichen, den Wagen auf der Kreisbahn zu halten: $m g \leq m \frac{v^2}{r}$, also $v^2 \geq g r$. Energieerhaltung zwischen Start und höchstem Punkt ($h = 2r$):

$$m g h_0 = m g \cdot 2r + \tfrac{1}{2} m v^2 \geq m g \cdot 2r + \tfrac{1}{2} m g r \quad\Rightarrow\quad h_0 \geq 2{,}5\,r = 15\,\text{m}.$$

[14 m](?track=looping&h0=14) · [16 m](?track=looping&h0=16)

</details>

### Aufgabe 4: Reibung

Starte im Tal aus $15\,\text{m}$ mit der Reibungszahl $\mu = 0{,}02$. Wie hoch kommt der Wagen auf der anderen Seite? Wo ist die fehlende Energie? [Ausprobieren](?track=tal&h0=15&mu=0.02)

<details>
<summary>Lösung anzeigen</summary>

Der Wagen kommt nicht mehr ganz auf $15\,\text{m}$, und mit jeder Fahrt durch das Tal wird es weniger. Die fehlende Energie steckt in der Säule „innere“: Sie wurde durch Reibung in innere Energie (Wärme von Rädern und Schienen) umgewandelt. Die Summe aller Energien bleibt gleich.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Energieerhaltung in der Mittelstufe (Jahrgangsstufe 9/10); der Looping eignet sich als Vertiefung zur Kreisbewegung in der Oberstufe.
- **Modell:** Der Wagen wird als Massenpunkt auf der Schiene behandelt. Die Reibung ist proportional zur Normalkraft (auch im Looping). Am Ende der Bahn stehen Prellböcke.
- **Typische Fehlvorstellungen:**
  - „Schwere Wagen sind schneller.“
  - „Mit Reibung geht Energie verloren.“ – Sie wird umgewandelt, nicht vernichtet.
- **Bilder:** Wagen und Himmel können durch Bilder ergänzt werden (siehe `docs/BILDER.md`).
