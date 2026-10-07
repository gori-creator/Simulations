---
description: Interactive simulation of the general sine function f(x) = a·sin(b(x − c)) + d – amplitude, period, shifts and modelling.
---

## What is it about?

The **general sine function**

$$
f(x) = a \cdot \sin\big(b\,(x - c)\big) + d
$$

describes periodic processes such as oscillations, tides or the length of the day over a year.

| Parameter | Meaning | Effect on the graph |
| --- | --- | --- |
| $a$ | amplitude $\lvert a \rvert$ | vertical stretch; $a < 0$ reflects in the midline |
| $b$ | period $p = \frac{2\pi}{b}$ | horizontal compression ($b > 1$) or stretch ($b < 1$) |
| $c$ | horizontal shift | by $c$ to the right ($c > 0$) or left ($c < 0$) |
| $d$ | vertical shift | midline $y = d$ |

The **range** is $[\,d - |a|,\; d + |a|\,]$.

> **Notation:** some books write $f(x) = a \cdot \sin(bx + c) + d$. There the horizontal shift is $-\frac{c}{b}$, not $c$.

The **cosine** is a shifted sine: $\cos(x) = \sin\!\left(x + \frac{\pi}{2}\right)$.

## Explore

1. Change $a$ and $d$. Both act only **vertically**. [Amplitude 3](?a=3) [Midline y = 1](?d=1)
2. Change $b$. Does the period get longer or shorter for larger $b$? [b = 2](?b=2) [b = 0.5](?b=0.5)
3. Shift the graph with $c$ or drag the red point. [c = π/4](?cPi=3)
4. Show that the cosine is a shifted sine. [Sine shifted π/2 to the left](?cPi=-6) – compare with [the cosine](?base=cos).

## Exercises

### Exercise 1: Read off the parameters

[Load exercise](?a=2&b=2&cPi=3&d=1&_hide=1) Determine amplitude, period, shifts and the equation.

<details>
<summary>Show solution</summary>

Midline $y = 1$, amplitude 2, period $\pi$ (so $b = 2$), shifted $\frac{\pi}{4}$ to the right:

$$f(x) = 2 \sin\!\left(2\left(x - \tfrac{\pi}{4}\right)\right) + 1$$

</details>

### Exercise 2: Period

What is the period of $f(x) = \sin(3x)$? How many complete oscillations fit into $[0, 2\pi]$?

<details>
<summary>Show solution</summary>

$p = \frac{2\pi}{3}$, so exactly 3 oscillations. [Show in simulation](?b=3)

</details>

## Notes for teachers

- **Order:** first the "vertical" parameters $a$ and $d$, then $c$, and $b$ last – its effect is the least intuitive.
- **Common misconceptions:** "larger $b$ means a longer period" (it gets shorter); the sign of $c$; reading $c$ in $\sin(bx + c)$ directly as the shift.
- **π axis:** by default the x-axis is labelled in multiples of $\pi$ and $c$ snaps to steps of $\frac{\pi}{12}$. Turn this off under **Display** for modelling tasks with decimal values.
