## What is it about?

In special relativity, space and time belong together. A **Minkowski diagram** shows both in one picture: position $x$ horizontally and time vertically – as the distance $ct$ light travels in that time. That is why light always travels at **45°**.

### Events and frames of reference

A point in the diagram is an **event**: something that happens at a certain place at a certain time. An observer moving at velocity $v = \beta c$ uses their own coordinates $x'$ and $ct'$. Their axes are **tilted** in the diagram – both towards the light line, the more so the faster they move:

- the $ct'$ axis is their own world line: $x = \beta \cdot ct$,
- the $x'$ axis contains all events that are simultaneous with $ct' = 0$ for them: $ct = \beta \cdot x$.

The light line stays at 45° for both – this is the **constancy of the speed of light**.

### The Lorentz transformation

The coordinates of an event in the moving frame are

$$x' = \gamma\,(x - \beta\,ct), \qquad ct' = \gamma\,(ct - \beta\,x), \qquad \gamma = \frac{1}{\sqrt{1-\beta^2}}.$$

In the diagram you read them off by going from the event **parallel to the tilted axes** to the other axis (dashed lines). The units on the tilted axes (dots) are stretched.

**Relativity of simultaneity:** two events on the $x$ axis are simultaneous in $S$ ($ct = 0$), but not in $S'$. What stays the same is the **spacetime interval** $s^2 = (ct)^2 - x^2$.

### Adding velocities

If a train moves at $v$ and a rocket inside it flies forward at $u'$, its speed seen from the platform is not simply $u' + v$ but

$$u = \frac{u' + v}{1 + \dfrac{u' \cdot v}{c^2}}.$$

At everyday speeds the denominator is almost 1 – the classical calculation then holds. Near the speed of light, however, $u$ **never exceeds $c$**: $0.9c + 0.9c$ gives about $0.994c$.

## Try it

- [Simultaneous?](?mode=diagramm&beta=0.5&ex=3&et=0): The event happens at time 0 in $S$. When does it happen in $S'$?
- [Light signal](?mode=diagramm&beta=0.6&ex=3&et=3): Change $\beta$. What do you notice about $x'$ and $ct'$?
- [0.6c + 0.6c](?mode=addition&v=0.6&u=0.6): Compare relativistic and classical.
- [0.9c + 0.9c](?mode=addition&v=0.9&u=0.9): How close to $c$ does the rocket get?

## Exercises

**1. Lorentz factor.** Calculate $\gamma$ for $\beta = 0.6$. [Load exercise](?mode=diagramm&beta=0.6&ex=2&et=3&_hide=1)

<details><summary>Show solution</summary>

$\gamma = \dfrac{1}{\sqrt{1 - 0.36}} = \dfrac{1}{0.8} = 1.25$.

</details>

**2. Converting coordinates.** An event has the coordinates $x = 2$, $ct = 3$ in $S$. Calculate $x'$ and $ct'$ for $\beta = 0.6$. [Load exercise](?mode=diagramm&beta=0.6&ex=2&et=3&_hide=1)

<details><summary>Show solution</summary>

$x' = 1.25 \cdot (2 - 0.6 \cdot 3) = 0.25$, $ct' = 1.25 \cdot (3 - 0.6 \cdot 2) = 2.25$. Check: $3^2 - 2^2 = 5 = 2.25^2 - 0.25^2$.

</details>

**3. Addition.** A spaceship travels at $0.5c$ and launches a probe forward at $0.8c$. How fast is the probe seen from Earth? [Load exercise](?mode=addition&v=0.5&u=0.8&_hide=1)

<details><summary>Show solution</summary>

$u = \dfrac{0.8 + 0.5}{1 + 0.4}\,c = \dfrac{1.3}{1.4}\,c \approx 0.93c$.

</details>
