## Worum geht es?

Elektrischen Strom sieht man nicht. Man erkennt ihn nur an seinen **Wirkungen**. Und genau diese Wirkungen machen ihn auch gefährlich.

### Die Wirkungen des Stroms

- **Wärmewirkung:** Jeder Draht, durch den Strom fließt, wird warm. Heizdrähte im Toaster, Wasserkocher oder Föhn nutzen das.
- **Lichtwirkung:** Wird der Draht sehr heiß, glüht er – so funktioniert die Glühlampe. LEDs erzeugen Licht auf andere Weise, fast ohne Wärme.
- **Magnetische Wirkung:** Ein Draht mit Strom wird zum Magneten. Als Spule mit Eisenkern (**Elektromagnet**) hebt er Büroklammern, in Türöffnern, Klingeln und Motoren arbeitet er im Alltag.
- **Chemische Wirkung:** Strom durch Salzwasser spaltet Stoffe auf, an den Drähten steigen Gasbläschen auf (**Elektrolyse**). So werden Metalle veredelt und Akkus geladen.

Je **größer die Stromstärke**, desto stärker die Wirkung: Die Lampe leuchtet heller, der Magnet hält mehr Klammern, es steigen mehr Bläschen auf.

### Sicherung und Kurzschluss

Berühren sich die beiden Zuleitungen direkt, fließt der Strom am Gerät vorbei durch einen Weg fast ohne Widerstand: ein **Kurzschluss**. Die Stromstärke wird riesig, die Kabel werden heiß – es kann brennen. Eine **Schmelzsicherung** enthält einen dünnen Draht, der bei zu großer Stromstärke durchschmilzt und den Stromkreis unterbricht. Im Haus übernehmen das heute **Sicherungsautomaten**.

### Gefahr für den Menschen

Unser Körper leitet Strom, weil er viel Salzwasser enthält. Fließt Strom von der Hand zu den Füßen, wirkt er auf Muskeln und Herz:

| Körperstrom | Wirkung (Richtwerte) |
|---|---|
| unter 1 mA | kaum spürbar |
| 1–10 mA | Kribbeln, Schreck |
| 10–50 mA | Muskeln verkrampfen – man kann nicht mehr loslassen |
| über 50 mA | Herzkammerflimmern – Lebensgefahr |

Wie viel Strom fließt, hängt von der **Spannung** und vom **Widerstand** des Körpers ab. Nasse Haut leitet viel besser als trockene. Deshalb sind Batterien harmlos, die **Steckdose (230 V) ist lebensgefährlich** – besonders im Bad.

Ein **FI-Schutzschalter** vergleicht den Strom, der hin- und zurückfließt. Fehlen mehr als 30 mA (weil sie durch einen Menschen zur Erde fließen), schaltet er in etwa 0,03 Sekunden ab. Das rettet meistens das Leben.

**Regeln:** Nie an Steckdosen oder Leitungen basteln, keine Elektrogeräte in der Nähe von Wasser benutzen, beschädigte Kabel nicht berühren, Abstand zu Oberleitungen der Bahn halten.

### Im Haushalt: Ströme addieren sich

Jedes Gerät braucht einen Strom $I = \frac{P}{U}$: ein Wasserkocher mit 2000 W bei 230 V etwa 8,7 A. An einer Mehrfachsteckdose addieren sich die Ströme aller Geräte in der Zuleitung. Ein Stromkreis im Haus ist meist mit **16 A** abgesichert: Kocher, Föhn und Heizlüfter zusammen (über 25 A) lösen den Leitungsschutzschalter aus. Die Kosten berechnet man über die Energie: $E = P \cdot t$, bei 0,35 € pro kWh kostet eine Stunde Wasserkocher etwa 0,70 €.

### Schutzleiter und FI-Schalter

Geräte mit Metallgehäuse (Waschmaschine, Toaster) haben einen **Schutzleiter** (grün-gelb). Berührt innen ein Draht das Gehäuse, fließt der Strom über den Schutzleiter zur Erde – sehr viel Strom, die Sicherung löst sofort aus. Ohne Schutzleiter stünde das Gehäuse unter Spannung, und wer es berührt, würde durchströmt. Der **FI-Schutzschalter** vergleicht hin- und zurückfließenden Strom; fehlen 30 mA (weil sie durch einen Menschen zur Erde fließen), schaltet er in Sekundenbruchteilen ab.

### Warum dem Vogel nichts passiert

Ein Vogel auf **einem** Seil überbrückt nur wenige Zentimeter Leitung. Zwischen seinen Füßen liegt praktisch keine Spannung, also fließt kein Strom durch ihn. Gefährlich wird es erst, wenn der Körper zwei Stellen mit großem Spannungsunterschied verbindet: zwei Seile oder ein Seil und die Erde, etwa über eine nasse Drachenschnur.

## Ausprobieren

- [Glühlampe](?mode=wirkungen&geraet=lampe&U=6&sich=2&kurz=0): Erhöhe die Spannung. Wie ändern sich Strom und Helligkeit?
- [Heizdraht](?mode=wirkungen&geraet=heiz&U=12&sich=5&kurz=0): Was passiert mit einer 2-A-Sicherung?
- [Kurzschluss](?mode=wirkungen&geraet=lampe&U=6&sich=2&kurz=1): Warum brennt die Sicherung durch?
- [Steckdose](?mode=gefahr&quelle=netz&nass=1&fi=0): Schalte den FI-Schutzschalter ein.
- [Frühstück](?mode=haushalt&kocher=1&toaster=1&foehn=0&heizer=0&lampe=1&laden=1) und [Überlast](?mode=haushalt&kocher=1&foehn=1&heizer=1&toaster=0&lampe=1&laden=1): Wie viele Geräte verträgt der Stromkreis?
- [Defekt mit Schutzleiter](?mode=schutz&pe=1&fi=0&fehl=1), [ohne Schutzleiter](?mode=schutz&pe=0&fi=0&fehl=1) und [mit FI](?mode=schutz&pe=0&fi=1&fehl=1): Drücke „Gehäuse berühren“.
- [Vogel auf einem Seil](?mode=vogel&kon=eins) und [Drachenschnur](?mode=vogel&kon=boden).
- [Üben](?mode=ueben&qn=1): Sechs Aufgabenarten.

## Aufgaben

**1. Elektromagnet.** Wie kannst du erreichen, dass der Elektromagnet mehr Büroklammern hält? [Aufgabe laden](?mode=wirkungen&geraet=spule&U=4&sich=5&kurz=0)

<details><summary>Lösung anzeigen</summary>

Die Spannung erhöhen: Dann fließt mehr Strom, und die magnetische Wirkung wird stärker. (Auch mehr Windungen würden helfen.)

</details>

**2. Kurzschluss.** Bei 6 V und einem Kurzschluss fließen etwa 15 A. Was würde ohne Sicherung passieren? [Aufgabe laden](?mode=wirkungen&geraet=lampe&U=6&sich=5&kurz=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

Die Leitungen würden sehr heiß, die Isolierung könnte schmelzen und einen Brand auslösen. Die Sicherung unterbricht den Strom vorher.

</details>

**3. Nasse Hände.** Berechne den Körperstrom bei 230 V für trockene (3000 Ω) und nasse Haut (1000 Ω). [Aufgabe laden](?mode=gefahr&quelle=netz&nass=1&fi=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

Trocken: $I = \dfrac{230\,\text{V}}{3000\,\Omega} \approx 77$ mA. Nass: $I = \dfrac{230\,\text{V}}{1000\,\Omega} = 230$ mA. Beides ist lebensgefährlich.

</details>

**4. Mehrfachsteckdose.** Wasserkocher (2000 W), Toaster (900 W) und Föhn (1800 W) laufen an einer Steckdosenleiste, der Stromkreis hat 16 A. Löst die Sicherung aus? [Aufgabe laden](?mode=haushalt&kocher=1&toaster=1&foehn=1&heizer=0&lampe=0&laden=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$I = \frac{4700\,\text{W}}{230\,\text{V}} \approx 20{,}4\,\text{A}$ – mehr als 16 A, die Sicherung löst aus.

</details>

## Ideen für den Unterricht

- **Typenschilder lesen:** Leistungen von Geräten zu Hause notieren und den Strom $I = P : U$ berechnen.
- **Häufiger Fehler:** Die Sicherung schützt die Leitungen vor Überhitzung – nicht den Menschen. Den Menschen schützt der FI-Schalter.
