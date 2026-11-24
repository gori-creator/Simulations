## What is it about?

The **general sine function**

$$
f(x) = a \cdot \sin\big(b\,(x - c)\big) + d
$$

describes periodic processes such as oscillations, tides or the length of the day over a year. Each parameter has a clear meaning:

| Parameter | Meaning | Effect on the graph |
| --- | --- | --- |
| $a$ | amplitude $\lvert a \rvert$ | vertical stretch; $a < 0$ reflects in the midline |
| $b$ | period $p = \frac{2\pi}{b}$ | horizontal compression ($b > 1$) or stretch ($b < 1$) |
| $c$ | horizontal shift | by $c$ to the right ($c > 0$) or left ($c < 0$) |
| $d$ | vertical shift | midline $y = d$ |

The **range** is $W = [\,d - |a|,\; d + |a|\,]$.

The x-values are in **radians**: $\pi$ corresponds to $180^\circ$, and a full period of the sine, $2\pi$, corresponds to $360^\circ$.

> **Notation:** some books write $f(x) = a \cdot \sin(bx + c) + d$. There the horizontal shift is $-\frac{c}{b}$, not $c$.

The **cosine** is a shifted sine: $\cos(x) = \sin\!\left(x + \frac{\pi}{2}\right)$. That is why the simulation can treat both base functions the same way.

## Explore

1. Change $a$ and $d$. Both act only **vertically**. [Amplitude 3](?a=3) [Midline y = 1](?d=1)
2. Change $b$. Does the period get longer or shorter for larger $b$? [b = 2](?b=2) [b = 0.5](?b=0.5)
3. Shift the graph with $c$ or drag the point $(c, d)$ on the midline where the period starts. [c = π/4](?cPi=3)
4. Drag the maximum (amplitude) and the hollow point at the end of the period directly in the coordinate system.
5. Show that the cosine is a shifted sine. [Sine shifted π/2 to the left](?cPi=-6) – compare with [the cosine](?base=cos).
6. **Step by step:** build $f(x) = 2 \cdot \sin(2(x - \frac{\pi}{4})) + 1$ from $\sin x$. Press “Next step” several times. What does each step do to the graph? [Step by step](?mode=build&step=0&a=2&b=2&cPi=3&d=1)
7. Imagine swapping the order: what happens if you shift first and then compress with $b$? Compare with the simulation.
8. **Game: match the curve.** Read the midline, amplitude, period and shift off the orange curve and set the sliders so that your curve lies exactly on it. [Start the game](?mode=match&q=1)

## Exercises

### Exercise 1: Read off the parameters

[Load exercise](?a=2&b=2&cPi=3&d=1&info=0&_hide=1) Determine the amplitude, period, shifts, range and the equation. The dashed curve is $y = \sin x$.

<details>
<summary>Show solution</summary>

Midline $y = 1$, so $d = 1$. Amplitude 2, so $a = 2$. A full period is $\pi$ long, so $b = \frac{2\pi}{\pi} = 2$. The graph starts shifted $\frac{\pi}{4}$ to the right:

$$f(x) = 2 \sin\!\left(2\left(x - \tfrac{\pi}{4}\right)\right) + 1, \qquad W = [-1,\, 3]$$

Any shift that differs by whole periods also works, e.g. $c = \frac{5\pi}{4}$. In the notation $a \cdot \sin(b(x + c)) + d$, $c = -\frac{\pi}{4}$. Check your result under **Display → Show values and guides**.

</details>

### Exercise 2: Period

What is the period of $f(x) = \sin(3x)$? How many complete oscillations fit into $[0, 2\pi]$?

<details>
<summary>Show solution</summary>

$p = \frac{2\pi}{3}$. The interval $[0, 2\pi]$ contains exactly 3 oscillations. [Show in simulation](?b=3)

</details>

### Exercise 3: Length of the day (modelling)

In Munich the longest day (around 21 June) is about 16 hours long, the shortest (around 21 December) about 8 hours 20 minutes. Describe the **difference between the length of the day and 12 hours** with a sine function ($t$: time in months from 1 January).

<details>
<summary>Show solution</summary>

- Mean: $\frac{16 + 8.33}{2} \approx 12.2$, so midline $d \approx 0.2$ (difference from 12 h).
- Amplitude: $a \approx \frac{16 - 8.33}{2} \approx 3.8$.
- Period 12 months: $b = \frac{2\pi}{12} \approx 0.52$.
- Maximum at the end of June ($t \approx 5.7$). For the sine, the maximum lies a quarter period (3 months) after $c$, so $c \approx 2.7$.

$$f(t) \approx 3.8 \cdot \sin\big(0.52\,(t - 2.7)\big) + 0.2$$

[Show the model in the simulation](?piAxis=0&a=3.8&b=0.52&c=2.7&d=0.2&compare=0)

</details>

### Exercise 4: Order of the steps

$f(x) = 2 \cdot \sin\left(2\left(x - \frac{\pi}{4}\right)\right) + 1$ arises from $\sin x$. Give the four steps in the right order and find the first maximum to the right of $x = 0$. [Load exercise](?mode=build&step=0&a=2&b=2&cPi=3&d=1&info=0&_hide=1)

<details>
<summary>Show solution</summary>

1. vertical stretch by the factor 2 (amplitude 2),
2. horizontal stretch: period $\frac{2\pi}{2} = \pi$,
3. shift by $\frac{\pi}{4}$ to the right,
4. shift by 1 up.

The maximum of $2\sin(2x)$ is at $x = \frac{\pi}{4}$, so after the shift it is at $x = \frac{\pi}{2}$ with $y = 2 + 1 = 3$: $H\left(\frac{\pi}{2}, 3\right)$. [Show the steps](?mode=build&step=4&a=2&b=2&cPi=3&d=1)

</details>

## Ideas for the classroom

- **Order:** first the "vertical" parameters $a$ and $d$, then $c$, and $b$ last – many students find its effect the least intuitive.
- **Game as a starter or for revision:** in the game “Match the curve” the curves are numbered; the same number means the same curve. The first two curves only need $a$ and $d$. Any solution in another form also counts, for example $-\sin x$ instead of $\sin(x - \pi)$.
- **Common stumbling blocks:**
  - "Larger $b$ means a longer period": in fact the period gets shorter.
  - The sign of $c$ is misread, just as with parabolas.
  - In $\sin(bx + c)$, $c$ is read directly as the shift.
- **π axis:** by default the x-axis is labelled in multiples of $\pi$ and $c$ snaps to steps of $\frac{\pi}{12}$. Turn this off under **Display** for modelling tasks; $c$ can then be set as a decimal.
- **Exercise mode:** switch off **Show values and guides**. Sliders, guides and results are then hidden, and the class reads the parameters off the graph. You can pass such a state on as a link via **Share**.
- **Introduction:** the simulation "Unit circle" shows how the sine curve arises from motion on a circle.
- **Notation:** some curricula and textbooks write $a \cdot \sin(b \cdot (x + c)) + d$. You can switch the simulation to this form under **Display → Notation**; a positive $c$ then shifts to the left.
