---
description: "Interaktive Simulation zur Reflexion am ebenen Spiegel – Reflexionsgesetz auf der optischen Scheibe messen, Spiegelbilder mit Sehstrahlen konstruieren und im Winkelspiegel Mehrfachbilder zählen."
---

## Worum geht es?

Trifft Licht auf einen Spiegel, wird es **reflektiert** (zurückgeworfen). Um die Richtungen genau zu beschreiben, zeichnet man im Auftreffpunkt das **Einfallslot** (kurz **Lot**) – die Senkrechte auf die Spiegelfläche. Gemessen werden beide Winkel **zum Lot**, nicht zur Spiegelfläche:

- **Einfallswinkel** $\alpha$: zwischen einfallendem Strahl und Lot,
- **Reflexionswinkel** $\alpha'$: zwischen Lot und reflektiertem Strahl.

**Reflexionsgesetz:** Einfallswinkel und Reflexionswinkel sind gleich groß,

$$
\alpha' = \alpha .
$$

Einfallender Strahl, Lot und reflektierter Strahl liegen in **einer Ebene**. Der Lichtweg ist **umkehrbar**: Schickt man das Licht rückwärts, läuft es denselben Weg zurück. Dreht man den Spiegel um einen Winkel $\varphi$, dreht sich das Lot mit – der reflektierte Strahl dreht sich deshalb um $2\varphi$.

**Spiegelbild.** Von jedem Punkt einer Kerze geht Licht in alle Richtungen. Das Licht, das nach der Reflexion ins Auge fällt, scheint geradlinig von einem Punkt **hinter** dem Spiegel zu kommen: dem **Bildpunkt**. Das Auge „verlängert“ die ankommenden Strahlen nach hinten (in der Simulation gestrichelt). Konstruktion: Lot vom Gegenstandspunkt auf den Spiegel fällen und genauso weit hinter dem Spiegel abtragen. Für die **Gegenstandsweite** $g$ und die **Bildweite** $b$ gilt

$$
b = g .
$$

Das Bild am ebenen Spiegel ist **virtuell** (scheinbar: dort kommt kein Licht an, man kann es nicht auf einem Schirm auffangen), **aufrecht** und **gleich groß**. Oft heißt es, das Spiegelbild sei „seitenverkehrt“. Genau genommen sind **vorne und hinten vertauscht**: Eine rechte Hand erscheint im Spiegel als linke.

**Wie groß muss ein Spiegel sein?** Nur der Teil des Spiegels zählt, an dem Licht vom Gegenstand ins Auge reflektiert wird. Für einen Ganzkörperspiegel gilt eine überraschend einfache Regel: Er muss nur **halb so groß** sein wie die Person – egal, wie weit sie entfernt steht.

**Winkelspiegel.** Zwei Spiegel stehen unter dem Winkel $\varphi$ zueinander. Licht kann nacheinander an beiden Spiegeln reflektiert werden; dabei entstehen Bilder von Bildern. Ist $360^\circ : \varphi$ eine gerade Zahl, sieht man

$$
n = \frac{360^\circ}{\varphi} - 1
$$

Bilder, z. B. 3 Bilder bei $90^\circ$ und 5 Bilder bei $60^\circ$. Ist $360^\circ : \varphi$ keine gerade Zahl, hängt die Anzahl davon ab, wo die Figur steht. Bilder nach einer **ungeraden** Zahl von Spiegelungen sind seitenverkehrt, Bilder nach einer **geraden** Zahl nicht – zwei Spiegelungen heben sich auf. So funktioniert ein **Kaleidoskop**.

## Ausprobieren

1. Ziehe den Laser um die Scheibe und nimm mit **Messwert aufnehmen** mehrere Messwerte auf. Was zeigt das Diagramm? [Reflexionsgesetz](?la=60)
2. Blende die Winkel zur Spiegelfläche ein. Wie hängen sie mit $\alpha$ zusammen? [Winkel zur Spiegelfläche](?la=30&gl=1)
3. Drehe den Spiegel am rechten Ende. Um wie viel Grad dreht sich der reflektierte Strahl? [Spiegel um 15° gedreht](?la=40&tilt=15)
4. Was passiert, wenn der Laser von hinten auf den Spiegel zeigt? [Laser hinter dem Spiegel](?la=70&tilt=-30)
5. Ziehe die Kerze näher an den Spiegel. Wo liegt jetzt ihr Spiegelbild? [Kerze vor dem Spiegel](?mode=image)
6. Schiebe Ober- und Unterkante des Spiegels zusammen. Wann sieht das Auge nur noch einen Teil der Kerze? [Zu kleiner Spiegel](?mode=image&mb=14&mt=24&fov=1&ex=42)
7. Tippe im Winkelspiegel auf die Bilder und verfolge ihre Lichtwege. Welche Bilder sind seitenverkehrt? [Winkelspiegel 90°](?mode=multi)
8. Drücke **Abspielen**: Der Winkel zwischen den Spiegeln ändert sich. Bei welchen Winkeln stimmt die Formel genau? [Winkelspiegel 120°](?mode=multi&w=120)

## Aufgaben

### Aufgabe 1: Flach auf den Spiegel

Ein Lichtstrahl trifft so auf einen Spiegel, dass er mit der Spiegelfläche einen Winkel von $25^\circ$ einschließt. Wie groß sind Einfalls- und Reflexionswinkel? Welchen Winkel schließen einfallender und reflektierter Strahl ein?

<details>
<summary>Lösung anzeigen</summary>

Die Winkel werden zum Lot gemessen: $\alpha = 90^\circ - 25^\circ = 65^\circ$ und nach dem Reflexionsgesetz $\alpha' = 65^\circ$. Zwischen den beiden Strahlen liegen $\alpha + \alpha' = 130^\circ$. [In der Simulation zeigen](?la=65&gl=1)

</details>

### Aufgabe 2: Spiegel drehen

Ein Laser trifft unter $\alpha = 30^\circ$ auf einen Spiegel. Nun wird der Spiegel um $10^\circ$ gedreht, sodass der Einfallswinkel kleiner wird. Wie groß ist der neue Einfallswinkel? Um wie viel Grad dreht sich der reflektierte Strahl? [Aufgabe laden](?la=30&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Lot dreht sich mit dem Spiegel um $10^\circ$ auf den Laser zu, also ist $\alpha = 30^\circ - 10^\circ = 20^\circ$ und $\alpha' = 20^\circ$. Vorher lag der reflektierte Strahl $30^\circ$ rechts von der Senkrechten des Tisches, jetzt liegt er $20^\circ$ rechts vom gedrehten Lot, also nur noch $10^\circ$ rechts von der Senkrechten: Er hat sich um $20^\circ$ gedreht – doppelt so viel wie der Spiegel. [In der Simulation zeigen](?la=30&tilt=10)

</details>

### Aufgabe 3: Auf den Spiegel zugehen

Lena steht $1{,}5\,\text{m}$ vor einem großen Wandspiegel. Wie weit ist sie von ihrem Spiegelbild entfernt? Sie geht mit $1\,\tfrac{\text{m}}{\text{s}}$ auf den Spiegel zu. Wie schnell nähert sie sich ihrem Spiegelbild?

<details>
<summary>Lösung anzeigen</summary>

Das Bild liegt $b = g = 1{,}5\,\text{m}$ hinter dem Spiegel, also $3\,\text{m}$ von Lena entfernt. Geht Lena $1\,\text{m}$ auf den Spiegel zu, kommt auch ihr Bild $1\,\text{m}$ näher: Der Abstand schrumpft um $2\,\text{m}$ pro Sekunde, sie nähern sich mit $2\,\tfrac{\text{m}}{\text{s}}$. [Kerze bewegen](?mode=image&g=15)

</details>

### Aufgabe 4: Der Ganzkörperspiegel

Tom ist $1{,}70\,\text{m}$ groß, seine Augen sind $1{,}60\,\text{m}$ über dem Boden. Wie hoch muss ein Spiegel mindestens sein, damit Tom sich ganz sehen kann? In welcher Höhe muss die Unterkante hängen? Tipp: Zeichne die Sehstrahlen vom Fuß und vom Scheitel.

<details>
<summary>Lösung anzeigen</summary>

Das Licht vom Fuß trifft den Spiegel auf halber Augenhöhe, denn Einfalls- und Reflexionswinkel sind gleich: Unterkante bei $0{,}80\,\text{m}$. Das Licht vom Scheitel trifft ihn in der Mitte zwischen Augen und Scheitel, bei $1{,}65\,\text{m}$. Der Spiegel muss also nur $0{,}85\,\text{m}$ hoch sein – die halbe Körpergröße, und das bei jedem Abstand. In der Simulation steht das Auge dazu genau über der Kerze ($40\,\text{cm}$ hoch, Kerze $30\,\text{cm}$): Gebraucht wird der Spiegel von $20\,\text{cm}$ bis $35\,\text{cm}$. [Modell zeigen](?mode=image&g=30&h=30&ex=30&ey=40&mb=0&mt=50) · [Weiter weg](?mode=image&g=40&h=30&ex=40&ey=40&mb=0&mt=50)

</details>

### Aufgabe 5: Bilder im Winkelspiegel

a) Wie viele Bilder entstehen bei $45^\circ$? b) Unter welchem Winkel muss man zwei Spiegel aufstellen, damit man 5 Bilder sieht? c) Bei einem Kaleidoskop sieht man ein Muster mit sechs gleichen Teilen. Welchen Winkel haben die Spiegel?

<details>
<summary>Lösung anzeigen</summary>

a) $360^\circ : 45^\circ - 1 = 7$ Bilder. b) $360^\circ : \varphi = 6$, also $\varphi = 60^\circ$. c) Figur und 5 Bilder ergeben 6 Teile: wieder $60^\circ$. [45° zeigen](?mode=multi&w=45) · [60° zeigen](?mode=multi&w=60&f=0.5&r=4.5)

</details>

### Aufgabe 6: Sich selbst richtig herum sehen

Schaut man in einen Winkelspiegel mit $90^\circ$, sieht man sich im mittleren Bild so, wie andere einen sehen: Hebt man die rechte Hand, hebt das Bild – wie ein echtes Gegenüber – **seine** rechte Hand. Im gewöhnlichen Spiegel scheint das Bild dagegen die linke Hand zu heben. Erkläre, warum.

<details>
<summary>Lösung anzeigen</summary>

Das mittlere Bild entsteht durch **zwei** Spiegelungen (erst an einem, dann am anderen Spiegel). Jede Spiegelung vertauscht einmal – zwei Vertauschungen heben sich auf. Das Bild ist nur um $180^\circ$ gedreht. Tippe in der Simulation auf das Bild mit der „2“. [90° zeigen](?mode=multi)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Optik im Anfangsunterricht (Reflexion, Spiegelbild); am bayerischen Gymnasium im Physikunterricht der Jahrgangsstufe 7, Vorbereitung in Natur und Technik (Zuordnung als Entwurf, bitte mit dem LehrplanPLUS abgleichen). Teil 1 eignet sich als Ersatz oder Ergänzung zum Schülerversuch mit der optischen Scheibe, Teil 2 zum Üben der Bildkonstruktion, Teil 3 als Vertiefung.
- **Optische Scheibe:** Die Scheibe dreht sich mit dem Spiegel, die Skala zeigt also immer den Winkel zum Lot. Die Messwerte sind ideal ($\alpha' = \alpha$); im Realexperiment lohnt sich ein Vergleich mit Messabweichungen. Zeigt der Laser auf die Rückseite, wird nichts reflektiert.
- **Spiegelbild:** Kerze, Auge und Spiegel lassen sich ziehen. „Konstruktion“ zeigt Lot und Abstände sowie an den Auftreffpunkten Lot und gleiche Winkel. Der Sichtbereich wird mit dem Bild des Auges konstruiert: Alles, was in diesem Bereich steht, sieht das Auge im Spiegel.
- **Winkelspiegel:** Draufsicht; die Zahl am Bild ist die Anzahl der Spiegelungen. Die Spiegel sind endlich lang, daher sind vom Auge aus nicht immer alle Bilder zu sehen. Das Diagramm zeigt die Bildanzahl für alle Winkel bei der aktuellen Lage der Figur – mit Abweichungen von $360^\circ : \varphi - 1$, wenn $360^\circ : \varphi$ keine gerade Zahl ist.
- **Typische Fehlvorstellungen:**
  - „Der Einfallswinkel wird zur Spiegelfläche gemessen.“ – Beide Winkel werden zum Lot gemessen.
  - „Das Spiegelbild liegt auf der Spiegeloberfläche.“ – Es liegt so weit hinter dem Spiegel wie der Gegenstand davor.
  - „Geht man weiter weg, sieht man mehr von sich.“ – Der nötige Teil des Spiegels bleibt die halbe Körpergröße.
  - „Der Spiegel vertauscht links und rechts.“ – Er vertauscht vorne und hinten.
