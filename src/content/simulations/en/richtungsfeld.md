---
description: "Direction fields and differential equations: solution curves through a draggable start point, Euler, Heun and Runge–Kutta compared with the exact solution – for growth, decay, logistic growth and oscillations."
---

## What is it about?

A **differential equation** links a function with its derivative, e.g. $y' = 0.5\,y$. Together with a start value $y(0) = 2$ the solution is $y = 2e^{0.5x}$, so $y(2) = 2e \approx 5.437$.

The right side $f(x, y)$ gives the slope of the solution curve at every point – drawn as short strokes it forms the **direction field**. The **Euler method** walks along the tangent: $y_{n+1} = y_n + h \cdot f(x_n, y_n)$. With $h = 0.5$ it gives $2 \cdot 1.25^4 \approx 4.883$ – too small. Heun and Runge–Kutta are more accurate.

| Equation | Model |
| --- | --- |
| $y' = ky$ | exponential growth/decay |
| $y' = k(S - y)$ | bounded growth, cooling |
| $y' = ky(S - y)$ | logistic growth |
| $y'' = -\omega^2 y$ | oscillation |

## Try it

1. Drag the start point. [Growth](?order=1&f=0%2C5%C2%B7y&x0=0&y0=2&x1=2&method=euler&h=0.5)
2. Reduce $h$ and watch the Euler error.
3. Cooling: [load](?order=1&f=0%2C1%C2%B7(20%20-%20y)&x0=0&y0=90&x1=30&method=euler&h=2&family=1)
4. Damped oscillation with phase plane: [load](?order=2&f2=-4y%20-%200%2C5y'&x0=0&y0=2&v0=0&x1=8&method=rk4&h=0.2)
5. Predator and prey: why do predators always lag behind? [load](?view=sys&sk=lv&la=1&lc=0.8&lx=60&ly=5)
6. Epidemic: from which vaccinated share does the wave no longer start? Compare with $1 - 1/R_0$. [load](?view=sys&sk=sir&r0=2.5&imm=0)
7. Parachute: set $k = 0.3$. How fast do you land? [load](?view=sys&sk=fall&kd=0.004)
8. Puzzle: which field fits the equation? [load](?view=quiz&qn=1)

## Tasks

### Task 1

First two Euler steps for $y' = 0.5y$, $y(0) = 2$, $h = 0.5$?

<details>
<summary>Show solution</summary>

$2.5$ and $3.125$ – each step multiplies by $1.25$.

</details>

### Task 2

Tea at 90 °C in a 20 °C room, $y' = 0.1(20 - y)$. When is it at 55 °C?

<details>
<summary>Show solution</summary>

$y = 20 + 70e^{-0.1x}$, so $x = 10\ln 2 \approx 6.9$ minutes.

</details>

### Task 3

Measles has $R_0 \approx 15$. Which share must be immune so the disease cannot spread?

<details>
<summary>Show solution</summary>

$1 - 1/15 \approx 93\,\%$.

</details>

## Ideas for the classroom

- **Use:** introducing differential equations via the direction field; comparing growth models; numerical methods as continuing the tangent.
- **Stumbling blocks:** the solution is a function, not a number; without a start value there is a whole family of solutions.
