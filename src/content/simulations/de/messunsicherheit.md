---
description: "Vom Lineal zur Ausgleichsgeraden: Messwerte bearbeiten, Streuung und Unsicherheit vergleichen und systematische Abweichungen entdecken."
---

## Worum geht es?

Ein Messwert besteht aus einer **Zahl und einer Einheit**. Ein Lineal mit Millimeterteilung zeigt eine Länge anders genau an als eine grobe Zentimeterskala. Die Lupe vergrößert die ideale Skala; sie erzeugt keine zusätzliche Information.

Bei Wiederholungen derselben Messung streuen die Werte. Der **arithmetische Mittelwert** $\bar x$ fasst sie zusammen. Die **empirische Standardabweichung** $s$ beschreibt die Streuung der Einzelwerte. Für unabhängige Wiederholungen unter gleichen Bedingungen schätzt $u_A$ die **statistische Standardunsicherheit des Mittelwerts**:

$$
\bar x=\frac{1}{n}\sum_{i=1}^n x_i,\qquad s=\sqrt{\frac{\sum_{i=1}^n(x_i-\bar x)^2}{n-1}},\qquad u_A=\frac{s}{\sqrt n}.
$$

$s$ und $u_A$ haben dieselbe Einheit wie die Messwerte, hier cm. Mit nur einem Wert sind $s$ und $u_A$ nicht bestimmbar. Gleiche Anzeigen ergeben $s=0$, beweisen aber keine perfekte Messung: Auflösung und gemeinsame systematische Abweichungen können bleiben.

Bei Rundung auf die Teilung $d$ liegt die reine Rundungsabweichung zwischen $-d/2$ und $+d/2$. Eine angenommene Gleichverteilung ergibt $u_B=d/\sqrt{12}$. Das vereinfachte Budget $u_c=\sqrt{u_A^2+u_B^2}$ setzt unabhängige Beiträge voraus. Ist die Auflösung bereits vollständig in der Streuung enthalten, darf man sie nicht doppelt zählen. Kalibrierung und weitere Einflüsse sind hier nicht erfasst.

**Standardunsicherheit ist keine garantierte Fehlergrenze.** Bei normalverteilten Messungen ohne Versatz liegen langfristig etwa 68 % der Mittelwerte innerhalb eines Bereichs von $\pm\sigma/\sqrt n$ um den wahren Wert, wenn $\sigma$ bekannt ist. Die vierte Ansicht simuliert 40 unabhängige Versuche mit der Referenz $10\,\text{cm}$. Ein Versatz verschiebt alle Ergebnisse und verschwindet nicht durch mehr Messungen.

Die **Ausgleichsgerade** $y=a\,t+b$ beschreibt eine Bewegung. Die Zeiten $t_i=i\,\Delta t$ gelten hier als exakt; alle Ortswerte haben gleich große, unabhängige Unsicherheiten. Die Methode der kleinsten Quadrate minimiert $\sum r_i^2$ mit $r_i=y_i-(a\,t_i+b)$. Die Steigung $a$ ist die Geschwindigkeit in cm/s, $b$ der Anfangsort in cm. Zwei Punkte legen eine Gerade fest, erlauben aber keine Schätzung der Reststreuung. Bei gleichen Zeiten gibt es keine eindeutige Steigung.

## Ausprobieren

1. Ziehe den roten Zeiger am Lineal an das Ende des Gegenstands. Vergleiche Zentimeter- und Millimeterteilung. [Lineal](?mode=measure&length=10.37&cursor=10.4)
2. Ändere einen Punkt der Messreihe. Vergleiche die breite violette Zone $\bar x\pm s$ mit der schmaleren grünen Zone $\bar x\pm u_A$. [Fünf Messwerte](?mode=series)
3. Schalte **Streuung Schritt für Schritt** ein. „Nächster Rechenschritt“ ergänzt jeweils ein Abweichungsquadrat. Abspielen führt die Schritte automatisch weiter. [Rechenweg](?steps=1)
4. Erzeuge weitere Beispielmessungen. **Systematische Abweichung** und **Streuung** wirken nur auf neue Daten; vorhandene Messwerte ändern sich dadurch nicht. Die Versuchsnummer macht das Beispiel reproduzierbar.
5. Lege in der dritten Ansicht eine Gerade selbst an. Versuche, die Quadratsumme zu verkleinern; vergleiche dann mit der besten Geraden. [Eigene Gerade](?mode=fit&data=1.1%3B2.8%3B5.2%3B6.9%3B9&manual=1)
6. Erhöhe in der vierten Ansicht $n$ von 1 auf 100. Vergleiche anschließend einen Versatz von 1 cm mit keinem Versatz. [40 Versuche](?mode=repeat&noise=1&repn=25)
7. Messschieber: Ziehe den Schieber und suche in der Lupe den Noniusstrich, der genau auf einen Millimeterstrich fällt. Probiere auch den 1/20-Nonius. [Messschieber](?mode=caliper&jaw=23.4&nonius=0.1) · [Üben](?mode=caliper&jaw=37.6&nonius=0.1&quiz=1)
8. Fallbeschleunigung aus dem Pendel: Welche Messung musst du verbessern – die Länge oder die Zeit? Halbiere beide Unsicherheiten nacheinander. [Pendel](?mode=propagate&formula=pendulum&x1=1&u1=0.005&x2=2.006&u2=0.01)
9. Stoppe das Pendel selbst – einmal über eine, einmal über zehn Schwingungen. Wie stark streuen deine Werte? [Stoppen](?mode=stopwatch&periods=1)

## Aufgaben

### Aufgabe 1: Fünf Längenmessungen

Die Messwerte sind $9{,}8;10{,}1;9{,}9;10{,}2;10{,}0\,\text{cm}$. Berechne Mittelwert, $s$ und $u_A$. [Aufgabe laden](?mode=series&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Summe beträgt 50 cm, also $\bar x=10{,}0\,\text{cm}$. Die Abweichungsquadrate ergeben $0{,}04+0{,}01+0{,}01+0{,}04+0=0{,}10\,\text{cm}^2$. Somit $s=\sqrt{0{,}10/4}\approx0{,}1581\,\text{cm}$ und $u_A=s/\sqrt5\approx0{,}07071\,\text{cm}$. [Nachrechnen](?steps=1&step=5)

</details>

### Aufgabe 2: Was bringt häufigeres Messen?

Die bekannte Streuung einer Einzelmessung ist $\sigma=1\,\text{cm}$. Vergleiche die Standardunsicherheit der Mittelwerte aus 25 und 100 unabhängigen Messungen. [Aufgabe laden](?mode=repeat&noise=1&repn=25&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$1/\sqrt{25}=0{,}2\,\text{cm}$ und $1/\sqrt{100}=0{,}1\,\text{cm}$. Viermal so viele Messungen halbieren die statistische Unsicherheit. Ein konstanter Versatz von 1 cm bleibt in beiden Fällen 1 cm. [Vergleichen](?mode=repeat&noise=1&repn=100&offset=1)

</details>

### Aufgabe 3: Millimeterteilung

Ein idealisiertes Lineal hat die Teilung $d=0{,}1\,\text{cm}$. Wie groß sind Rundungsspanne und Standardunsicherheit der Auflösung?

<details>
<summary>Lösung anzeigen</summary>

Die reine Rundungsspanne ist $\pm0{,}05\,\text{cm}$. Bei Gleichverteilung ist $u_B=0{,}1/\sqrt{12}\approx0{,}02887\,\text{cm}$. Zusammen mit $u_A\approx0{,}07071\,\text{cm}$ aus Aufgabe 1 ergäbe das vereinfachte unabhängige Budget $u_c\approx0{,}07638\,\text{cm}$. [Zeigen](?res=0.1)

</details>

### Aufgabe 4: Eine Bewegung auswerten

Zu $t=0;1;2\,\text{s}$ gehören $y=1;2;4\,\text{cm}$. Bestimme die Ausgleichsgerade. [Aufgabe laden](?mode=fit&data=1%3B2%3B4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\bar t=1\,\text{s}$, $\bar y=7/3\,\text{cm}$, $\sum(t_i-\bar t)^2=2\,\text{s}^2$ und $\sum(t_i-\bar t)(y_i-\bar y)=3\,\text{cm}\,\text{s}$. Daher $a=1{,}5\,\text{cm/s}$, $b=5/6\,\text{cm}$. Die Residuen sind $1/6;-1/3;1/6\,\text{cm}$; ihre Quadratsumme ist $1/6\,\text{cm}^2$. [Zeigen](?mode=fit&data=1%3B2%3B4)

</details>

### Aufgabe 5: Messschieber ablesen

Der Nullstrich des 1/10-Nonius steht zwischen 23 mm und 24 mm, und der Noniusstrich 4 fällt genau auf einen Strich der Hauptskala. Wie lang ist der Gegenstand?

<details>
<summary>Lösung anzeigen</summary>

$23\,\text{mm} + 4 \cdot 0{,}1\,\text{mm} = 23{,}4\,\text{mm}$. Der Noniusstrich 4 liegt bei $23{,}4\,\text{mm} + 4 \cdot 0{,}9\,\text{mm} = 27{,}0\,\text{mm}$, also genau auf einem Millimeterstrich. [In der Simulation zeigen](?mode=caliper&jaw=23.4&nonius=0.1)

</details>

### Aufgabe 6: Fallbeschleunigung mit Unsicherheit

Ein Fadenpendel ist $l = (1{,}000 \pm 0{,}005)\,\text{m}$ lang und hat die Periodendauer $T = (2{,}006 \pm 0{,}010)\,\text{s}$. Berechne $g = 4\pi^2 l / T^2$ mit Unsicherheit.

<details>
<summary>Lösung anzeigen</summary>

$g = 4\pi^2 \cdot 1{,}000 / 2{,}006^2 \approx 9{,}811\,\text{m/s}^2$. Relative Unsicherheiten: $0{,}005/1{,}000 = 0{,}5\,\%$ für $l$ und $2 \cdot 0{,}010/2{,}006 \approx 1{,}0\,\%$ für $T$ (das Quadrat zählt doppelt). Nach Gauß: $\sqrt{0{,}5^2 + 1{,}0^2}\,\% \approx 1{,}12\,\%$, also $u(g) \approx 0{,}11\,\text{m/s}^2$ und $g = (9{,}81 \pm 0{,}11)\,\text{m/s}^2$. Die Zeitmessung verbessern bringt am meisten. [In der Simulation zeigen](?mode=propagate&formula=pendulum&x1=1&u1=0.005&x2=2.006&u2=0.01)

</details>

## Ideen für den Unterricht

- **Einsatz:** Ab Klasse 5/6 bieten sich Zahl, Einheit und Ablesen an; Mittelwert und Streuung passen zur Mittelstufe, Standardunsicherheit und Regression zur Oberstufe und zu Praktika. Die genaue Einordnung hängt vom Landeslehrplan ab.
- **Modell:** Einheiten sind cm und s ($1\,\text{cm}=0{,}01\,\text{m}$). Die Datenliste nimmt höchstens 20 Werte von −100 bis 100 cm auf; negative Orte sind möglich. Generierte Listen sind simulierte, auf 0,001 cm gerundete Normalwerte, an den Eingabegrenzen abgeschnitten. Die vierte Ansicht verwendet ungerundete, unbeschnittene Normalwerte mit bekannter Streuung. Keine der Ansichten ersetzt die Prüfung eines echten Messverfahrens.
- **Regression:** Die einstellbaren Fehlerbalken zeigen $\pm u(y)$; bei gleicher Unsicherheit beeinflusst ihre gemeinsame Größe die ungewichtete Gerade nicht. Das grüne Band zeigt eine Standardunsicherheit der geschätzten Geraden aus der Reststreuung, kein Vorhersageintervall und kein 95%-Konfidenzband. Die Unsicherheiten der Steigung und des Achsenabschnitts stammen ebenfalls aus der Reststreuung. $R^2$ ist bei konstanten Ortswerten nicht definiert.
- **Häufige Stolpersteine:** $s$ beschreibt Einzelwerte, $s/\sqrt n$ deren Mittelwert. Systematische Abweichungen werden durch Wiederholung nicht kleiner. Ein auffälliger Messwert darf nicht ohne fachlichen Grund gelöscht werden; die Simulation macht seinen Einfluss sichtbar. Für kleine Stichproben ist auch die geschätzte Unsicherheit unsicher.
