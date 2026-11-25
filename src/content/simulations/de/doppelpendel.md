## Worum geht es?

Ein einfaches Fadenpendel ist der Inbegriff von Regelmäßigkeit. Hängt man aber an das Pendel ein zweites, entsteht ein **Doppelpendel** – und das verhält sich völlig anders: wild, unvorhersehbar, nie zweimal gleich.

### Deterministisch und doch unvorhersagbar

Das Doppelpendel gehorcht festen physikalischen Gesetzen. Kennt man Anfangswinkel und -geschwindigkeiten **genau**, ist die ganze Bewegung festgelegt – das System ist **deterministisch**. Trotzdem lässt sie sich praktisch nicht vorhersagen. Der Grund:

> Winzige Unterschiede in den Anfangsbedingungen wachsen **exponentiell** an.

Starten zwei Pendel mit einem Unterschied von einem tausendstel Grad, verdoppelt sich der Unterschied etwa alle Sekunde. Nach rund 15 Sekunden ist er so groß wie die Bewegung selbst – die Pendel schwingen völlig verschieden. Weil man Anfangswerte nie unendlich genau messen kann, ist die Bewegung auf lange Sicht nicht vorhersagbar. Das nennt man **deterministisches Chaos** oder den **Schmetterlingseffekt**.

### Im Diagramm

Das Diagramm zeigt den Logarithmus des Winkelunterschieds. Eine ansteigende **Gerade** bedeutet exponentielles Wachstum. Ihre Steigung (der **Lyapunov-Exponent**) sagt, wie schnell die Vorhersagbarkeit verloren geht. Bei kleinen Auslenkungen bleibt der Unterschied dagegen klein – dann verhält sich das Doppelpendel regelmäßig.

### Energie bleibt erhalten

Chaos heißt nicht „alles ist erlaubt“: Ohne Reibung bleibt die Gesamtenergie gleich, und die Bewegung bleibt in dem Bereich, den die Energie zulässt.

## Ausprobieren

- [Chaotisch](?a1=120&a2=120&delta=0.001): Starte und beobachte, wann sich die Pendel trennen.
- [Kleine Auslenkung](?a1=10&a2=10&delta=0.1): Wie entwickelt sich der Unterschied jetzt?
- [Winziger Unterschied](?a1=120&a2=120&delta=0.00001): Wie viel später trennen sie sich?

## Aufgaben

**1. Verdopplung.** Der Unterschied wächst etwa auf das Doppelte pro Sekunde. Wie lange dauert es, bis aus 0,001° ein Unterschied von etwa 60° geworden ist? [Aufgabe laden](?a1=120&a2=120&delta=0.001&_hide=1)

<details><summary>Lösung anzeigen</summary>

$0{,}001° \cdot 2^n = 60°$ ergibt $2^n = 60\,000$, also $n \approx 16$ Verdopplungen, rund 16 Sekunden.

</details>

**2. Hundertmal genauer.** Wie viel länger kann man vorhersagen, wenn man den Anfangswert hundertmal genauer kennt (0,00001° statt 0,001°)? [Aufgabe laden](?a1=120&a2=120&delta=0.00001&_hide=1)

<details><summary>Lösung anzeigen</summary>

$100 \approx 2^{6{,}6}$: nur etwa 7 Sekunden länger. Bei exponentiellem Wachstum bringt viel bessere Messgenauigkeit nur wenig mehr Vorhersagezeit.

</details>

**3. Regelmäßig oder chaotisch?** Vergleiche das Diagramm für 10° und für 120° Startwinkel. [Aufgabe laden](?a1=10&a2=10&delta=0.1&_hide=1)

<details><summary>Lösung anzeigen</summary>

Bei 10° bleibt der Unterschied etwa gleich groß (er schwankt nur), die Bewegung ist regelmäßig. Bei 120° steigt die Kurve geradlinig an – exponentielles Wachstum, Chaos.

</details>

**4. Wetter.** Warum gibt es keine zuverlässigen Wettervorhersagen für mehr als etwa zwei Wochen, obwohl die Gesetze der Atmosphäre bekannt sind?

<details><summary>Lösung anzeigen</summary>

Die Atmosphäre ist ebenfalls ein chaotisches System. Messfehler in den Anfangsdaten wachsen exponentiell an, bis die Vorhersage nichts mehr taugt.

</details>

## Ideen für den Unterricht

- **Versuch:** Ein echtes Doppelpendel (z. B. aus Lineal und Schraube) zweimal aus „derselben“ Lage starten und filmen.
- **Mathematik:** Logarithmische Darstellung und exponentielles Wachstum, Halbwerts- und Verdopplungszeit.
- **Vernetzung:** Methode der kleinen Schritte – so rechnet auch diese Simulation (mit einem genaueren Verfahren).
