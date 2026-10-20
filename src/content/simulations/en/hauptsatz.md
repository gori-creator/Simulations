---
description: "Interactive simulation for upper secondary and university: the integral function and the fundamental theorem of calculus – area from a to x, strips with h → 0, evaluation with F(b) − F(a), the link between the graphs of f and I, Riemann sums and eight applications from distance to rainfall."
---

## What is it about?

The **integral function** $I_a(x) = \int_a^x f(t)\,dt$ measures the signed area from $a$ to $x$ (green above, red below the $x$-axis); always $I_a(a) = 0$.

**Fundamental theorem** (for continuous $f$): $I_a'(x) = f(x)$ – the mean height $\frac{I_a(x+h) - I_a(x)}{h}$ of a strip lies between $\min f$ and $\max f$ on the strip and tends to $f(x)$ as $h \to 0$. For every antiderivative $F$: $\int_a^b f(x)\,dx = F(b) - F(a)$; a constant $C$ cancels.

Consequences: zeros of $f$ with a sign change are extrema of $I_a$, extrema of $f$ are points of inflection of $I_a$, and another lower limit only shifts the graph vertically. Integrating a **rate of change** gives the **total change**: speed → distance, power → energy, marginal cost → cost …

## Try it

1. [Parabola](?mode=area&a=-1&x=2): press “Let the area grow”.
2. [Strip h → 0](?mode=diff&x=2&h=1): press “Let h tend to 0” and watch the secant.
3. [Working](?mode=calc&fn=sin&a=0&x=3.14): change the constant $C$ – the result stays the same.
4. [Cubic](?mode=graph&k3=0.25&k2=0&k1=-1&k0=0&a=-3&x=3): find maxima, minima and inflection points of $I_{-3}$; then move $a$.
5. Applications: [car](?kind=app&app=car&a=0&x=25), [solar panels](?kind=app&app=solar&a=0&x=24), [medicine](?mode=graph&kind=app&app=drug&a=0&x=8), [thunderstorm](?mode=riem&kind=app&app=rain&a=0&x=6&n=6&rm=mid).

## Tasks

### Task 1: Evaluate

Evaluate $\int_{-1}^{2}(0.5x^2 - 1)\,dx$. [Load task](?mode=calc&a=-1&x=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$F(x) = \frac16 x^3 - x$, so $F(2) - F(-1) = -\frac23 - \frac56 = -1.5$. [Show](?mode=calc&a=-1&x=2)

</details>

### Task 2: How far does the car travel?

Speed $3t$ for 5 s, then 15 s at $15\,\tfrac{\text{m}}{\text{s}}$, then 5 s of even braking. [Load task](?kind=app&app=car&a=0&x=25&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$37.5\,\text{m} + 225\,\text{m} + 37.5\,\text{m} = 300\,\text{m}$. [Show](?kind=app&app=car&a=0&x=25)

</details>

### Task 3: Riemann sums

For $f(x) = x^2$ on $[0, 2]$ with $n = 4$: left, right, midpoint and trapezoid sums? [Load task](?mode=riem&k2=1&k0=0&a=0&x=2&n=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1.75$, $3.75$, $2.625$ and $2.75$; exact value $\frac83 \approx 2.667$. [Show](?mode=riem&k2=1&k0=0&a=0&x=2&n=4)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- The views follow a possible lesson sequence: integral function → derivative (idea of proof) → evaluation → curve sketching of $I_a$ → Riemann sums. The applications connect integrals with units (kW · h = kWh).
- **Common stumbling blocks:** confusing the integral with the area when $f$ changes sign; equating integral functions with all antiderivatives; swapping $F(b) - F(a)$; forgetting that the theorem needs continuity (at a jump $I$ has a kink).
