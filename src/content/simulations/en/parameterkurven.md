## What is it about?

So far we have mostly described curves as the graph of a function $y = f(x)$. But many curves cannot be written that way, for example a circle or a loop. A **parameter** $t$ helps here: for every value of $t$ you give **both** coordinates.

$$P(t) = \big(x(t) \mid y(t)\big)$$

As $t$ runs, the point moves and traces the curve. Often $t$ is **time**, and then the parametric form describes not just the path but also **when** the point is where.

### The projectile path

A ball is thrown at speed $v_0$ and angle $\alpha$ from height $h$. Horizontally it moves on at a steady speed, while vertically the gravitational acceleration $g \approx 9.81\,\tfrac{\text{m}}{\text{s}^2}$ slows it down:

$$x(t) = v_0 \cos\alpha \cdot t, \qquad y(t) = h + v_0 \sin\alpha \cdot t - \tfrac{g}{2}\, t^2$$

Solve the first equation for $t$ and substitute it into the second (**eliminating the parameter**). This gives the equation of the path, which is a parabola:

$$y = h + \tan\alpha \cdot x - \frac{g}{2 v_0^2 \cos^2\alpha}\, x^2$$

Without air resistance, a ball thrown from the ground goes furthest at $45°$, reaching $\tfrac{v_0^2}{g}$.

### More parametric curves

- **Circle** about the origin: $x = r\cos t$, $y = r\sin t$. Eliminating $t$ gives $x^2 + y^2 = r^2$.
- **Ellipse:** $x = a\cos t$, $y = b\sin t$, so $\tfrac{x^2}{a^2} + \tfrac{y^2}{b^2} = 1$.
- **Lissajous figure:** $x = \sin(m t + \varphi)$, $y = \sin(n t)$ combines two oscillations. You can see them on an oscilloscope, for example.
- **Cycloid:** This is the path of a point on a rolling wheel, $x = a(t - \sin t)$ and $y = a(1 - \cos t)$.

### Polar coordinates

Instead of $(x \mid y)$, a point is described by its **distance** $r$ from the origin and the **angle** $\varphi$ to the positive $x$-axis. You convert like this:

$$x = r\cos\varphi, \quad y = r\sin\varphi \qquad\text{and}\qquad r = \sqrt{x^2 + y^2}$$

A curve in polar coordinates gives $r$ as a function of $\varphi$, so the angle is the parameter:

- A **circle** is $r = a$.
- The **Archimedean spiral** is $r = c\,\varphi$. The distance grows steadily with the angle.
- The **rose curve** is $r = a\cos(k\varphi)$. For odd $k$ it has $k$ petals, for even $k$ it has $2k$.
- The **cardioid** is $r = \tfrac{a}{2}(1 + \cos\varphi)$.
- The **lemniscate** is $r^2 = a^2 \cos(2\varphi)$. Wherever $\cos(2\varphi) < 0$, there is no point.

## Try it

- [Throwing a ball](?mode=wurf&v0=12&al=40&h=1.5&u=0.4): Change the parameter. What does the velocity arrow do at the top?
- [45° from the ground](?mode=wurf&v0=15&al=45&h=0&u=0.5): At which angle does the ball go furthest? Is that still true from a height of 10 m?
- [Lissajous 3 : 2](?mode=kurve&kt=lissajous&fa=3&fb=2&ph=90&u=1): Change the frequencies and the phase.
- [Cycloid](?mode=kurve&kt=zykloide&a=1.5&u=0.6): Follow the point on the rolling wheel.
- [Rose with k = 3](?mode=polar&pk=rose&ra=4&k=3&u=0.7): How many petals appear for k = 2 and for k = 4?

## Exercises

**1. Throwing from the ground.** A ball is thrown from the ground at $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$ and $45°$. How far does it fly? [Load exercise](?mode=wurf&v0=15&al=45&h=0&u=1&_hide=1)

<details><summary>Show solution</summary>

$y(t) = 0$ gives $t = \tfrac{2 v_0 \sin 45°}{g} \approx 2.16\,\text{s}$. The range is then $x = v_0 \cos 45° \cdot t = \tfrac{v_0^2}{g} \approx 22.9\,\text{m}$.

</details>

**2. Eliminating the parameter.** Show that $x = 4\cos t$, $y = 2\sin t$ describes an ellipse. [Load exercise](?mode=kurve&kt=ellipse&a=4&b=2&u=1&_hide=1)

<details><summary>Show solution</summary>

$\cos t = \tfrac{x}{4}$ and $\sin t = \tfrac{y}{2}$. Since $\cos^2 t + \sin^2 t = 1$, it follows that $\tfrac{x^2}{16} + \tfrac{y^2}{4} = 1$.

</details>

**3. Polar coordinates.** Give the point with $r = 2$ and $\varphi = 120°$ in Cartesian coordinates.

<details><summary>Show solution</summary>

$x = 2\cos 120° = -1$ and $y = 2\sin 120° = \sqrt{3} \approx 1.73$.

</details>

**4. Rose curve.** How many petals does $r = 4\cos(2\varphi)$ have? [Load exercise](?mode=polar&pk=rose&ra=4&k=2&u=1&_hide=1)

<details><summary>Show solution</summary>

Four petals, because for even $k$ there are $2k$ petals.

</details>
