## Worum geht es?

Eine Solarzelle wandelt Licht direkt in elektrische Energie um. Wie viel Leistung sie liefert, hängt vom Licht ab – aber auch davon, was man anschließt und wie man mehrere Zellen zusammenschaltet.

### Die Kennlinie

Die **U-I-Kennlinie** zeigt, welcher Strom bei welcher Spannung fließt:

- Ohne Verbraucher (Leerlauf) liegt die **Leerlaufspannung** $U_0$ an, es fließt kein Strom.
- Bei Kurzschluss fließt der **Kurzschlussstrom** $I_K$, die Spannung ist null.
- Dazwischen bleibt der Strom lange fast gleich und fällt kurz vor $U_0$ steil ab.

Der **Kurzschlussstrom** ist proportional zur Bestrahlungsstärke. Die Leerlaufspannung hängt dagegen nur wenig vom Licht ab.

### Arbeitspunkt und Leistungsmaximum

Mit einem Verbraucher (Lastwiderstand $R$) stellt sich der **Arbeitspunkt** ein: Dort schneidet die Kennlinie die Gerade $I = U/R$. Die Leistung ist $P = U \cdot I$. Sie ist bei einem bestimmten Widerstand am größten: dem **Punkt maximaler Leistung** (MPP). Wechselrichter von Photovoltaikanlagen suchen diesen Punkt ständig neu.

### Reihe und parallel

- **In Reihe** addieren sich die Spannungen, der Strom bleibt gleich.
- **Parallel** addieren sich die Ströme, die Spannung bleibt gleich.

**Schatten** auf nur einem Modul eines Strangs ist tückisch: Der Strom ist überall im Strang gleich, also bestimmt das schwächste Modul den Strom aller. Ein kleiner Schatten kann so die Leistung des ganzen Strangs stark senken. Echte Module enthalten deshalb Bypass-Dioden, die verschattete Bereiche überbrücken; in dieser Simulation fehlen sie.

### Neigung

Fällt das Licht schräg ein, trifft weniger Licht auf die Fläche: Der Strom sinkt etwa mit dem Kosinus des Einfallswinkels. Am meisten Energie liefert ein Modul, wenn das Licht senkrecht auftrifft.

## Ausprobieren

- [Ein Modul](?E=1000&w=0&ns=1&np=1&sch=0&R=4): Suche den Widerstand mit der größten Leistung.
- [Drei in Reihe](?E=1000&w=0&ns=3&np=1&sch=0&R=12): Vergleiche Leerlaufspannung und Kurzschlussstrom mit einem Modul.
- [Drei parallel](?E=1000&w=0&ns=1&np=3&sch=0&R=1.5): Was ändert sich jetzt?
- [Schatten](?E=1000&w=0&ns=3&np=1&sch=50&R=12): Wie stark sinkt die Leistung?

## Aufgaben

**1. Halbes Licht.** Wie ändern sich Kurzschlussstrom und Leerlaufspannung, wenn die Bestrahlungsstärke von 1000 auf 500 W/m² sinkt? [Aufgabe laden](?E=500&w=0&ns=1&np=1&sch=0&R=4&_hide=1)

<details><summary>Lösung anzeigen</summary>

Der Kurzschlussstrom halbiert sich (0,5 A → 0,25 A). Die Leerlaufspannung sinkt nur wenig.

</details>

**2. Schräg.** Um wie viel Prozent sinkt der Kurzschlussstrom bei einem Einfallswinkel von 60°? [Aufgabe laden](?E=1000&w=60&ns=1&np=1&sch=0&R=4&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\cos 60° = 0{,}5$: Er sinkt um 50 %.

</details>

**3. Schatten.** Warum verliert ein Strang aus drei Modulen mehr als ein Drittel seiner Leistung, wenn eines halb verschattet ist? [Aufgabe laden](?E=1000&w=0&ns=3&np=1&sch=50&R=12&_hide=1)

<details><summary>Lösung anzeigen</summary>

Durch alle Module in Reihe fließt derselbe Strom. Das verschattete Modul liefert nur noch den halben Strom – damit sinkt der Strom des ganzen Strangs auf etwa die Hälfte, obwohl zwei Module voll beleuchtet sind.

</details>
