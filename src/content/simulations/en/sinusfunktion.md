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

## Ideas for the classroom

- **Order:** first the "vertical" parameters $a$ and $d$, then $c$, and $b$ last – many students find its effect the least intuitive.
- **Common stumbling blocks:**
  - "Larger $b$ means a longer period": in fact the period gets shorter.
  - The sign of $c$ is misread, just as with parabolas.
  - In $\sin(bx + c)$, $c$ is read directly as the shift.
- **π axis:** by default the x-axis is labelled in multiples of $\pi$ and $c$ snaps to steps of $\frac{\pi}{12}$. Turn this off under **Display** for modelling tasks; $c$ can then be set as a decimal.
- **Exercise mode:** switch off **Show values and guides**. Sliders, guides and results are then hidden, and the class reads the parameters off the graph. You can pass such a state on as a link via **Share**.
- **Introduction:** the simulation "Unit circle" shows how the sine curve arises from motion on a circle.
- **Notation:** some curricula and textbooks write $a \cdot \sin(b \cdot (x + c)) + d$. You can switch the simulation to this form under **Display → Notation**; a positive $c$ then shifts to the left.
