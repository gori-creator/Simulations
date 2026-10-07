---
description: Interactive simulation from secant to tangent – difference quotient, the limit h → 0 and the derivative.
---

## What is it about?

The **secant** through $P(x_0 \mid f(x_0))$ and $Q(x_0 + h \mid f(x_0 + h))$ has the slope (**difference quotient**)

$$
m_s = \frac{f(x_0 + h) - f(x_0)}{h},
$$

the **average rate of change**. As $h \to 0$ the secant turns into the **tangent** at $P$; its slope is the **derivative**

$$
f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}.
$$

Example $f(x) = x^2$: $m_s = 2x_0 + h \to 2x_0$.

## Try it

1. Drag $Q$ towards $P$ or press **h → 0** and watch the table.
2. Try a negative $h$. [Negative h](?h=-1.5)
3. Trace the derivative of $\sin x$. [Sine](?fn=sin&x0=0.5&h=1&trace=1)

## Exercises

### Exercise 1: Difference quotients

For $f(x) = x^2$ and $x_0 = 1$ compute $m_s$ for $h = 1;\ 0.5;\ 0.1$.

<details>
<summary>Show solution</summary>

$3$, $2.5$, $2.1$ – in general $m_s = 2 + h \to 2 = f'(1)$. [Show in the simulation](?x0=1&h=0.5)

</details>

### Exercise 2: Horizontal tangents

Where does $f(x) = 0.25x^3 - x$ have a horizontal tangent? Use $f'(x) = 0.75x^2 - 1$.

<details>
<summary>Show solution</summary>

$x = \pm\frac{2}{\sqrt{3}} \approx \pm 1.15$. [Show in the simulation](?fn=cubic&x0=1.15&h=0.8&tangent=1)

</details>

## Notes for teachers

- **Use:** Grade 11, introducing the derivative. The **h → 0** animation shrinks $h$ logarithmically.
- **h = 0:** the difference quotient is undefined ($\frac{0}{0}$) – a good moment to discuss "plugging in" versus "taking the limit".
