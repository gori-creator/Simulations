---
description: "Vom Kraftwerk bis zur Steckdose: Energieflussdiagramme mit Wirkungsgraden, Strommix über einen ganzen Tag, Pumpspeicher und Batterien sowie Hochspannung gegen Leitungsverluste."
---

## Worum geht es?

Elektrische Energie kommt nicht einfach „aus der Steckdose“. Ein **Kraftwerk** wandelt eine andere Energieform in mehreren Stufen in elektrische Energie um – zum Beispiel im Kohlekraftwerk: chemische Energie → thermische Energie (Kessel) → Rotationsenergie (Turbine) → elektrische Energie (Generator). Bei jeder Stufe geht ein Teil als Wärme an die Umgebung verloren (**Energieentwertung**). Die Energie verschwindet dabei nicht, sie ist nur nicht mehr nutzbar. Der **Wirkungsgrad** gibt an, welcher Anteil genutzt wird:

$$
\eta = \frac{P_\text{ab}}{P_\text{zu}} \qquad \eta_\text{gesamt} = \eta_1 \cdot \eta_2 \cdot \eta_3 \cdot \ldots
$$

Das **Energieflussdiagramm** (Sankey-Diagramm) zeigt das: Die Breite eines Bandes ist proportional zur Leistung, die Verluste zweigen nach unten ab. Die zugeführte Leistung ist immer gleich der Summe aus Nutzleistung und Verlusten (**Energieerhaltung**).

**Regenerative** Energien (Wind, Sonne, Wasser, Biomasse) stehen immer wieder neu zur Verfügung, **erschöpfbare** Energieträger (Kohle, Erdgas, Uran) nicht. Wind und Sonne liefern nur, wenn das Wetter es zulässt. Deshalb braucht ein Stromnetz **Speicher** und **regelbare** Kraftwerke, denn in jedem Augenblick muss genauso viel Leistung eingespeist werden, wie verbraucht wird.

Die **Energie** ergibt sich aus Leistung und Zeit, die Energie im **Pumpspeicher** aus der Lageenergie des Wassers:

$$
E = P \cdot t \qquad E = m \cdot g \cdot h \qquad 1\,\text{kWh} = 3{,}6 \cdot 10^6\,\text{J}
$$

Beim **Transport** über Leitungen mit dem Widerstand $R$ entsteht Wärme. Bei gleicher Leistung $P$ gilt:

$$
I = \frac{P}{U} \qquad P_\text{V} = I^2 \cdot R
$$

Dreifache Spannung heißt ein Drittel der Stromstärke und nur ein Neuntel der Verluste. Deshalb wird elektrische Energie mit **Hochspannung** (110 kV bis 380 kV) übertragen; **Transformatoren** setzen die Spannung herauf und wieder herab.

Alle Zahlen der Simulation sind **gerundete Beispielwerte**: Wirkungsgrade typischer moderner Anlagen, CO₂-Werte als gerundete Mediane über den ganzen Lebenszyklus nach IPCC (2014), der Tagesverlauf für ein großes Beispielland – keine Messdaten.

## Ausprobieren

1. Tippe nacheinander auf die sieben Kraftwerke. Wo entstehen die größten Verluste? Welches Kraftwerk hat den größten, welches den kleinsten Wirkungsgrad? [Kohlekraftwerk](?src=kohle) · [Windkraftanlage](?src=wind) · [Wasserkraftwerk](?src=wasser)
2. Tippe im Diagramm auf eine Stufe (z. B. die Dampfturbine) und lies die Erklärung. Warum geht gerade dort so viel Energie verloren?
3. Schalte beim Gaskraftwerk die Kraft-Wärme-Kopplung ein. Was ändert sich am Wirkungsgrad, was am Nutzungsgrad? [Gas mit Kraft-Wärme-Kopplung](?src=gas&chp=1)
4. Spiele einen sonnigen Sommertag ab. Wann reicht die Sonne, wann springen Speicher und Gaskraftwerke ein? [Sommertag](?mode=day&sea=sommer&sun=100&wind=20)
5. Vergleiche eine windstille Winternacht mit einem Sturm. Wie ändern sich der Anteil erneuerbarer Energie und das CO₂ pro kWh? [Dunkelflaute](?mode=day&sea=winter&sun=15&wind=5) · [Sturm](?mode=day&sea=winter&sun=30&wind=95)
6. Zieh das obere Becken des Pumpspeichers nach oben. Wie hängt die gespeicherte Energie von der Höhe ab? [Pumpspeicher](?mode=store)
7. Stelle die Spannung der Leitung von 20 kV auf 380 kV. Beobachte Stromstärke, Punkte auf der Leitung und Verluste. [Hochspannung](?mode=grid&u=20)

## Aufgaben

### Aufgabe 1: Energie und Leistung

a) Ein Heizlüfter mit $1\,\text{kW}$ läuft $3\,\text{h}$. Wie viel Energie wird umgesetzt?
b) Das Kohlekraftwerk der Simulation liefert $398\,\text{MW}$. Wie viel elektrische Energie liefert es in $8\,\text{h}$? [Aufgabe laden](?src=kohle&dur=8&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

a) $E = P \cdot t = 1\,\text{kW} \cdot 3\,\text{h} = 3\,\text{kWh}$.

b) $E = 398\,\text{MW} \cdot 8\,\text{h} = 3184\,\text{MWh}$. Das ist ungefähr der Jahresbedarf von $3\,184\,000\,\text{kWh} : 3500\,\text{kWh} \approx 910$ Haushalten. [In der Simulation zeigen](?src=kohle&dur=8)

</details>

### Aufgabe 2: Wirkungsgrad

Ein Kraftwerk erhält $100\,\text{MW}$ Wärmeleistung und hat den Wirkungsgrad $40\,\%$. Wie groß sind die elektrische Leistung und die Abwärme? Prüfe dann in der Simulation, wie sich der Gesamtwirkungsgrad des Kohlekraftwerks aus den Stufen ergibt. [Aufgabe laden](?src=kohle&pin=100&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P_\text{el} = 0{,}40 \cdot 100\,\text{MW} = 40\,\text{MW}$, Abwärme $100\,\text{MW} - 40\,\text{MW} = 60\,\text{MW}$. Im Kohlekraftwerk der Simulation: $\eta = 0{,}90 \cdot 0{,}47 \cdot 0{,}98 \cdot 0{,}96 \approx 0{,}398$, also aus $100\,\text{MW}$ etwa $39{,}8\,\text{MW}$ elektrisch. Die größte Lücke ist die Dampfturbine (47 %): Der Dampf muss abgekühlt werden, diese Wärme geht über den Kühlturm verloren. [In der Simulation zeigen](?src=kohle&pin=100)

</details>

### Aufgabe 3: Pumpspeicher

Ein Oberbecken enthält $1$ Million $\text{m}^3$ Wasser, $300\,\text{m}$ über dem Unterbecken. Berechne die gespeicherte Lageenergie in MWh. Wie lange kann eine Turbine mit $300\,\text{MW}$ damit laufen, wenn sie 87 % der Lageenergie in elektrische Energie umwandelt? [Aufgabe laden](?mode=store&sto=pump&hp=300&vol=1&pp=300&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$m = 1000\,\tfrac{\text{kg}}{\text{m}^3} \cdot 10^6\,\text{m}^3 = 10^9\,\text{kg}$, $E = m \cdot g \cdot h = 10^9\,\text{kg} \cdot 9{,}81\,\tfrac{\text{m}}{\text{s}^2} \cdot 300\,\text{m} = 2{,}943 \cdot 10^{12}\,\text{J}$. Mit $1\,\text{MWh} = 3{,}6 \cdot 10^9\,\text{J}$: $E \approx 817{,}5\,\text{MWh}$. Elektrisch: $0{,}87 \cdot 817{,}5\,\text{MWh} \approx 711\,\text{MWh}$, also $t = 711\,\text{MWh} : 300\,\text{MW} \approx 2{,}4\,\text{h}$. Doppelte Wassermenge bei halber Höhe speichert genauso viel. [In der Simulation zeigen](?mode=store&sto=pump&hp=150&vol=2&pp=300)

</details>

### Aufgabe 4: Warum Hochspannung?

Über eine Leitung mit $R = 10\,\Omega$ werden $100\,\text{MW}$ übertragen. Berechne Stromstärke und Verlustleistung bei $110\,\text{kV}$ und bei $380\,\text{kV}$. [Aufgabe laden](?mode=grid&pt=100&len=100&u=110&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$110\,\text{kV}$: $I = 100\,\text{MW} : 110\,\text{kV} \approx 909\,\text{A}$, $P_\text{V} = (909\,\text{A})^2 \cdot 10\,\Omega \approx 8{,}26\,\text{MW}$ (8,3 %).
$380\,\text{kV}$: $I \approx 263\,\text{A}$, $P_\text{V} \approx 0{,}69\,\text{MW}$ (0,7 %). Die Verluste sinken um den Faktor $(380 : 110)^2 \approx 11{,}9$. [In der Simulation zeigen](?mode=grid&pt=100&len=100&u=380)

</details>

### Aufgabe 5: Ein Tag ohne Kohle

Stelle den sonnigen Sommertag ein und schalte dann die Kohlekraftwerke ab. Wie ändern sich die Gasmenge, der Überschuss und das CO₂ pro kWh? Erkläre, warum ein Kraftwerk, das immer gleichmäßig läuft, gut zur Sonne mittags passt – oder eben nicht. [Aufgabe laden](?mode=day&sea=sommer&sun=100&wind=20&base=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Mit $8\,\text{GW}$ Kohle (Beispielwerte): etwa 191 GWh Gas, 84 GWh Überschuss, rund 227 g CO₂/kWh. Ohne Kohle: etwa 316 GWh Gas, nur noch 17 GWh Überschuss, rund 163 g CO₂/kWh. Die Kohle läuft auch mittags weiter, wenn die Sonne schon fast alles liefert – dann muss Strom exportiert oder abgeregelt werden. Gaskraftwerke lassen sich schnell regeln und füllen genau die Lücken, verursachen aber weniger CO₂ als Kohle. [In der Simulation zeigen](?mode=day&sea=sommer&sun=100&wind=20&base=0)

</details>

## Ideen für den Unterricht

- **Einsatz:** Energieumwandlung und Wirkungsgrad (Sek. I), regenerative und erschöpfbare Energieträger, Energieversorgung als Bewertungsthema bis in die Oberstufe (bitte am jeweiligen Lehrplan prüfen). Die vier Ansichten eignen sich auch für ein Gruppenpuzzle: Kraftwerke, Tagesverlauf, Speicher, Netz.
- **Bewerten:** Mit dem Tagesverlauf lassen sich Fragen der Energiewende diskutieren – etwa wie viel Speicher nötig wäre, um eine Dunkelflaute zu überbrücken, oder was Netzausbau und Export leisten können.
- **Modell und Vereinfachungen:** Alle Werte sind gerundete Beispielwerte. Die Leitung wird wie im Unterricht mit $I = P/U$ gerechnet (ohne Drehstrom, Blindleistung und Spannungsabfall). Im Tagesmodell gibt es keinen Stromaustausch mit Nachbarländern außer „Überschuss“; Gaskraftwerke decken jede Lücke. Bei Kraft-Wärme-Kopplung bleibt der elektrische Wirkungsgrad hier unverändert, in echten Anlagen sinkt er etwas.
- **Häufige Stolpersteine:**
  - „Energie geht verloren.“ – Sie wird entwertet: Sie liegt danach als Wärme bei niedriger Temperatur vor.
  - „Kilowatt und Kilowattstunde sind dasselbe.“ – kW ist eine Leistung, kWh eine Energie ($E = P \cdot t$).
  - „Hohe Spannung bedeutet hohe Verluste.“ – Bei gleicher Leistung ist es umgekehrt: Entscheidend ist die Stromstärke.
  - „Ein Speicher erzeugt Energie.“ – Er gibt weniger zurück, als hineingesteckt wurde.
