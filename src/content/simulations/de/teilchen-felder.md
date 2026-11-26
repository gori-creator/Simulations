## Worum geht es?

Elektrische und magnetische Felder üben Kräfte auf geladene Teilchen aus. Damit kann man Teilchen beschleunigen, ablenken, wiegen und sogar ihre Ladung bestimmen.

### Beschleunigung im Längsfeld

In einer **Elektronenkanone** treten Elektronen aus einer Glühkathode aus und werden zur Anode hin beschleunigt. Die elektrische Energie wird zu Bewegungsenergie:

$$
e \cdot U_B = \frac{1}{2} m v^2 \qquad\Rightarrow\qquad v = \sqrt{\frac{2 e U_B}{m}}
$$

Schon 1000 V machen Elektronen etwa 19 000 km pro Sekunde schnell.

### Ablenkung im Querfeld

Fliegt der Strahl zwischen zwei geladenen Platten hindurch, wirkt eine konstante Kraft quer zur Flugrichtung. Die Bahn ist – wie beim waagrechten Wurf – eine **Parabel**:

$$
y = \frac{U_y}{4 \, d \, U_B} \cdot x^2
$$

Nach den Platten fliegt das Elektron geradeaus weiter zum Schirm. So funktionierte die Braun’sche Röhre in alten Fernsehern und Oszilloskopen.

### Millikan-Versuch

Ein winziges geladenes Öltröpfchen schwebt im Kondensator, wenn die elektrische Kraft genau die Gewichtskraft ausgleicht: $q \cdot \frac{U}{d} = m \cdot g$. Robert Millikan fand 1910 heraus, dass die Ladung immer ein **ganzzahliges Vielfaches** der **Elementarladung** $e = 1{,}602 \cdot 10^{-19}\,\text{C}$ ist.

### Zyklotron

Im Magnetfeld bewegen sich geladene Teilchen auf Kreisbahnen, denn die Lorentzkraft wirkt senkrecht zur Bewegung: $r = \frac{m v}{q B}$. Im **Zyklotron** werden Protonen bei jedem Durchgang durch den Spalt zwischen den beiden „Duanten“ beschleunigt, ihre Bahn wird größer. Die Umlauffrequenz $f = \frac{q B}{2\pi m}$ hängt nicht von der Geschwindigkeit ab – darum kann man mit einer festen Wechselspannung beschleunigen.

### Hall-Effekt

Fließt Strom durch ein Plättchen im Magnetfeld, werden die Ladungsträger zur Seite gedrückt. Dort sammeln sie sich, und es entsteht quer zum Strom die **Hall-Spannung**

$$
U_H = \frac{B \cdot I}{n \cdot e \cdot d}
$$

In Metallen gibt es sehr viele freie Elektronen ($n$ groß), die Spannung ist winzig. In Halbleitern ist sie viel größer – deshalb bestehen **Hall-Sonden** zur Messung von Magnetfeldern aus Halbleitern.

### Massenspektrometer

Ein Massenspektrometer sortiert Atome nach ihrer Masse. Zuerst lässt ein **Geschwindigkeitsfilter** (gekreuzte elektrische und magnetische Felder) nur Ionen mit $v = \frac{E}{B}$ durch. Danach fliegen sie im Magnetfeld auf einem Halbkreis mit $r = \frac{m \cdot v}{q \cdot B}$ – schwere Ionen auf einem größeren. So trennt man Isotope, etwa Chlor-35 und Chlor-37, misst das Alter von Fundstücken oder weist Doping nach. Bei Uran unterscheiden sich die Massen von U-235 und U-238 nur um gut 1 % – das macht die Anreicherung so aufwendig.

### Schraubenbahn und Polarlicht

Fliegt ein geladenes Teilchen schräg zum Magnetfeld, wirkt die Lorentzkraft nur auf den Teil der Geschwindigkeit quer zum Feld. Das Teilchen kreist und bewegt sich zugleich längs der Feldlinien weiter: eine **Schraubenbahn**. So führt das Erdmagnetfeld Elektronen und Protonen von der Sonne zu den Polen. Dort stoßen sie mit Luftmolekülen zusammen und bringen sie zum Leuchten – das **Polarlicht**.

## Ausprobieren

- [Elektronenkanone](?mode=laengs&Ua=1000): Wie hängt die Geschwindigkeit von der Spannung ab?
- [Ablenkung](?mode=quer&Ua=1000&Ud=100): Verdopple $U_y$, dann $U_B$.
- [Millikan](?mode=millikan&n=3): Finde die Schwebespannung.
- [Zyklotron](?mode=zyklotron&B=1&Uz=20) und [Hall-Sonde](?mode=hall&stoff=hl&B=0.5&I=1).
- [Chlor-Isotope](?mode=spektro&probe=chlor&B2=0.5) und [Uran](?mode=spektro&probe=uran&B2=1.5): Wie weit liegen die Auftreffpunkte auseinander?
- [Schraubenbahn](?mode=spirale&al=60&B=1): Verändere den Winkel von 0° bis 90°.
- [Üben](?mode=ueben&qn=1): Sechs Aufgabenarten mit Punktestand.

## Aufgaben

**1. Elektronengeschwindigkeit.** Wie schnell ist ein Elektron nach 1000 V ($m_e = 9{,}11 \cdot 10^{-31}\,\text{kg}$)? [Aufgabe laden](?mode=laengs&Ua=1000&_hide=1)

<details><summary>Lösung anzeigen</summary>

$v = \sqrt{\frac{2 \cdot 1{,}6 \cdot 10^{-19} \cdot 1000}{9{,}11 \cdot 10^{-31}}}\,\tfrac{\text{m}}{\text{s}} \approx 1{,}9 \cdot 10^7\,\tfrac{\text{m}}{\text{s}}$ – etwa 6 % der Lichtgeschwindigkeit.

</details>

**2. Ablenkung.** Plattenlänge 5 cm, Abstand 2 cm, $U_B = 1000\,\text{V}$, $U_y = 100\,\text{V}$. Wie weit wird der Strahl am Ende der Platten abgelenkt? [Aufgabe laden](?mode=quer&Ua=1000&Ud=100&_hide=1)

<details><summary>Lösung anzeigen</summary>

$y = \frac{100 \cdot 0{,}05^2}{4 \cdot 0{,}02 \cdot 1000}\,\text{m} \approx 3{,}1\,\text{mm}$. Die Ablenkung hängt nicht von Masse und Ladung ab – nur von den Spannungen.

</details>

**3. Millikan.** Ein Tröpfchen mit $m = 1{,}88 \cdot 10^{-15}\,\text{kg}$ schwebt bei 192 V zwischen Platten im Abstand 5 mm. Wie viele Elementarladungen trägt es? [Aufgabe laden](?mode=millikan&n=3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$q = \frac{m g d}{U} = \frac{1{,}88 \cdot 10^{-15} \cdot 9{,}81 \cdot 0{,}005}{192}\,\text{C} \approx 4{,}8 \cdot 10^{-19}\,\text{C} = 3e$.

</details>

**4. Hall-Sonde.** Warum ist die Hall-Spannung in Kupfer viel kleiner als in einem Halbleiter? [Aufgabe laden](?mode=hall&stoff=cu&_hide=1)

<details><summary>Lösung anzeigen</summary>

Kupfer hat etwa $10^{29}$ freie Elektronen pro m³, der Halbleiter nur etwa $10^{22}$. Bei gleichem Strom müssen sich die wenigen Ladungsträger im Halbleiter viel schneller bewegen; die Lorentzkraft und damit $U_H$ sind entsprechend größer.

</details>

**Isotope trennen.** Chlor-35- und Chlor-37-Ionen (einfach geladen) fliegen mit $v = 10^5\,\text{m/s}$ in ein Magnetfeld mit $B = 0{,}5\,\text{T}$. Wie weit liegen ihre Auftreffpunkte auseinander? [Aufgabe laden](?mode=spektro&probe=chlor&B2=0.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$r = \frac{m v}{e B}$ mit $m = A \cdot 1{,}66 \cdot 10^{-27}\,\text{kg}$: $r_{35} \approx 7{,}26\,\text{cm}$, $r_{37} \approx 7{,}67\,\text{cm}$. Die Auftreffpunkte liegen bei $2r$, also etwa $0{,}8\,\text{cm}$ auseinander.

</details>

## Ideen für den Unterricht

- **Versuch:** Elektronenstrahl im Fadenstrahlrohr oder in der Ablenkröhre beobachten; mit einer Hall-Sonde das Feld einer Spule ausmessen.
- **Geschichte:** Millikans Messung der Elementarladung und die Kontroversen um seine Daten.
- **Vernetzung:** Lorentzkraft und Kreisbahn in der Simulation „Lorentzkraft und Fadenstrahlrohr“.
