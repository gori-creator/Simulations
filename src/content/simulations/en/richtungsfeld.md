---
description: "Direction fields and differential equations: solution curves through a draggable start point, Euler, Heun and Runge–Kutta compared with the exact solution – for growth, decay, logistic growth and oscillations."
---

## What is it about?

A **differential equation** (DE) links a function with its derivative. Example: at every moment, an amount grows by 50% of its current value per unit of time:

$$
y'(x) = 0.5 \cdot y(x).
$$

What is wanted is not a number but a **function**. Together with a start value, e.g. $y(0) = 2$, it is unique: $y(x) = 2 \cdot e^{0.5x}$. So $y(2) = 2e \approx 5.437$.

**Direction field:** the right-hand side $f(x, y)$ gives the slope of the solution curve at every point $(x, y)$. If you draw short line segments with this slope at many points, you get the direction field. Every solution curve follows the segments – in the simulation, flowing particles show where the field “streams”.

**Euler’s method:** from the start point you go a step $h$ further along the tangent:

$$
y_{n+1} = y_n + h \cdot f(x_n, y_n).
$$

With $h = 0.5$ this gives $y(2) \approx 2 \cdot 1.25^4 \approx 4.883$ – clearly too small, because the curve bends upwards. Smaller steps help. More accurate are **Heun’s method** (average of two slopes) and **Runge–Kutta** (four slopes).

Important models from school:

| DE | Model | Solution |
| --- | --- | --- |
| $y' = k \cdot y$ | exponential growth/decay | $y = y_0 e^{kx}$ |
| $y' = k \cdot (S - y)$ | limited growth, cooling | $y = S - (S - y_0)e^{-kx}$ |
| $y' = k \cdot y \cdot (S - y)$ | logistic growth | S-shaped curve with limit $S$ |
| $y'' = -\omega^2 y$ | oscillation | $y = A \cos(\omega x - \varphi)$ |

For the **oscillation** (2nd order) the acceleration $y''$ depends on the displacement. Here you need two start values: $y(x_0)$ and $y'(x_0)$. The phase plane shows $y$ and $y'$ at the same time – undamped a closed ring, damped a spiral.

## Try it

1. Drag the start point. Why do the solution curves never cross each other? [Growth](?order=1&f=0%2C5%C2%B7y&x0=0&y0=2&x1=2&method=euler&h=0.5)
2. Reduce $h$ from 0.5 to 0.1. How does Euler’s error change? Does it roughly halve?
3. Cooling: where do all curves head? [Cooling](?order=1&f=0%2C1%C2%B7(20%20-%20y)&x0=0&y0=90&x1=30&method=euler&h=2&family=1)
4. Logistic: where is the curve steepest? [Logistic](?order=1&f=0%2C05%C2%B7y%C2%B7(10%20-%20y)&x0=0&y0=0.5&x1=15&method=rk4&h=1&family=1)
5. $y' = x - y$ has no formula from school. Switch on “Horizontal slopes (f = 0)”: where are the segments horizontal? [x − y](?order=1&f=x%20-%20y&x0=-2&y0=3&x1=3&method=euler&h=0.5&family=1&iso=1)
6. Oscillation with damping: change the damping and watch the spiral. [Damped](?order=2&f2=-4y%20-%200%2C5y'&x0=0&y0=2&v0=0&x1=8&method=rk4&h=0.2)
7. Predator and prey: why do the predators always lag behind the prey? [Predator and prey](?view=sys&sk=lv&la=1&lc=0.8&lx=60&ly=5)
8. Epidemic: from what share of vaccinated people does the wave no longer start? Compare with $1 - 1/R_0$. [Epidemic](?view=sys&sk=sir&r0=2.5&imm=0)
9. Parachute: set $k = 0.3$. How fast do you land with the parachute open? [Fall](?view=sys&sk=fall&kd=0.004)
10. Puzzle: which field fits the equation? [Puzzle](?view=quiz&qn=1)

## Exercises

### Exercise 1: Euler by hand

For $y' = 0.5y$, $y(0) = 2$ with $h = 0.5$, calculate the first two Euler steps.

<details>
<summary>Show solution</summary>

$y_1 = 2 + 0.5 \cdot 1 = 2.5$ and $y_2 = 2.5 + 0.5 \cdot 1.25 = 3.125$. Each step multiplies by $1.25$. [Show in the simulation](?order=1&f=0%2C5%C2%B7y&x0=0&y0=2&x1=2&method=euler&h=0.5)

</details>

### Exercise 2: Cooling

Tea is at 90 °C, the room at 20 °C, $y' = 0.1 \cdot (20 - y)$. When is the tea at 55 °C?

<details>
<summary>Show solution</summary>

$y = 20 + 70 e^{-0.1x}$; $55 = 20 + 70e^{-0.1x}$ gives $e^{-0.1x} = 0.5$, so $x = 10 \ln 2 \approx 6.9$ minutes. [Show in the simulation](?order=1&f=0%2C1%C2%B7(20%20-%20y)&x0=0&y0=90&x1=6.9&method=rk4&h=0.5)

</details>

### Exercise 3: Oscillation

For $y'' = -4y$ with $y(0) = 2$, $y'(0) = 0$: what is the period of the oscillation?

<details>
<summary>Show solution</summary>

$\omega = 2$, so $y = 2\cos(2x)$ with the period $T = \pi \approx 3.14$. [Show in the simulation](?order=2&f2=-4y&x0=0&y0=2&v0=0&x1=3.1&method=rk4&h=0.1)

</details>

### Exercise 4: Herd immunity

For measles, $R_0 \approx 15$. What share must be immune so that the disease does not spread?

<details>
<summary>Show solution</summary>

The wave only grows as long as $S/N > 1/R_0$. So you need $1 - 1/15 \approx 93\%$ immune. In the simulation $R_0$ goes up to 6: there $1 - 1/6 \approx 83\%$ is enough. [Try it](?view=sys&sk=sir&r0=6&imm=85)

</details>

## Ideas for the classroom

- **Use:** introduction to differential equations via the direction field; comparing growth models; numerical methods as a continuation of the tangent.
- **Investigating Euler’s error:** note the error for $h$, $h/2$, $h/4$ – for Euler it roughly halves, for Runge–Kutta it shrinks much faster.
- **Common pitfalls:**
  - The solution of a DE is a function, not a number.
  - Without a start value the solution is not unique (a whole family).
  - Euler with a large $h$ can even distort the behaviour (e.g. oscillations that grow).
- **Curriculum link:** differential equations are often an optional or extension topic – please check your own curriculum.
