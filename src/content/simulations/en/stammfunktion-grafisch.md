---
description: "Interactive simulation for years 12 and 13: integrating graphically – from the graph of f to the graph of an antiderivative F and back, with slope field, family F + C, initial value problem, features, area pieces, your own sketch and eight everyday examples."
---

## What is it about?

$F$ is an antiderivative of $f$ if $F'(x) = f(x)$: the height of the graph of $f$ is the slope of the graph of $F$. So without calculating:

- where $f > 0$, $F$ increases; where $f < 0$, $F$ decreases;
- a zero of $f$ with a sign change is an extremum of $F$ ($+ \to -$: maximum, $- \to +$: minimum), without a sign change a saddle point;
- an extremum of $f$ is an inflection point of $F$;
- the area between $f$ and the $x$-axis between two zeros is the change in height of $F$.

All antiderivatives $F_0 + C$ are vertical shifts of each other (a family of curves; in the slope field the strokes are the same in every column). An initial value $F(x_0) = y_0$ picks one: $C = y_0 - F_0(x_0)$. Example: $f(x) = 3x^2 - 2$, $F(1) = 4$ gives $F(x) = x^3 - 2x + 5$.

## Try it

1. [Transfer the slope](?mode=trace&fn=par&x=-3): press “Let P run along”.
2. [Slope field](?mode=feld&fn=par): drag the initial point, then “Try different C”.
3. [Features](?mode=feat&fn=par) step by step, and a [zero without sign change](?mode=feat&fn=par&pa=1&pb=0&pc=0).
4. [Area pieces of sin](?mode=area&fn=sin) and [reverse: F → f](?mode=back&fn=cub&x=-3.2).
5. Everyday life: [savings account](?mode=feld&kind=app&app=konto), [lift](?mode=area&kind=app&app=lift), [CO₂ in the classroom](?mode=area&kind=app&app=co2).

## Tasks

### Task 1: Sketch it yourself

Sketch the antiderivative of $x^2 - 1$ with $F(0) = 0$, then reveal the solution. [Load task](?mode=draw&fn=par)

<details>
<summary>Show solution</summary>

Maximum at $-1$, minimum at $1$, inflection at $0$: $F(x) = \frac13 x^3 - x$. [Show](?mode=feat&fn=par)

</details>

### Task 2: Initial value problem

Find the antiderivative of $3x^2 - 2$ with $F(1) = 4$ and compute $F(2)$. [Load task](?mode=feld&pa=3&pb=0&pc=-2&x0=1&c=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$F(x) = x^3 - 2x + C$, $1 - 2 + C = 4$, so $C = 5$ and $F(2) = 9$. [Show](?mode=feld&pa=3&pb=0&pc=-2&x0=1&c=4)

</details>

### Task 3: Exponential function

Which antiderivative of $e^x$ passes through $(0 \mid 3)$? [Load task](?mode=feld&fn=exp&x0=0&c=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$e^0 + C = 3$, so $C = 2$ and $F(x) = e^x + 2$ – not $C = 3$, because $F_0(0) = 1$. [Show](?mode=feld&fn=exp&x0=0&c=3)

</details>

### Task 4: Storage basin

Net inflow $q(t) = -0.5t^2 + 4t - 3.5$ m³/h, $V(0) = 20$ m³. When is the basin fullest? [Load task](?mode=feat&kind=app&app=pool&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$q$ changes sign from $+$ to $-$ at $t = 7$: $V(7) = \frac{109}{3} \approx 36.33$ m³. Minimum at $t = 1$ ($\approx 18.33$ m³), fastest increase at $t = 4$. [Show](?mode=feat&kind=app&app=pool)

</details>

## Ideas for the classroom

- Use the views as a sequence: transfer the slope → slope field → features → area pieces → reverse → own sketch. In the task view the card only gives hints until the solution is revealed.
- Combine with the derivative and fundamental theorem simulations.
- **Common stumbling blocks:** confusing maxima of $f$ and $F$; forgetting the constant of integration; reading a zero without sign change as an extremum; setting $C = y_0$ although $F_0(x_0) \neq 0$.
