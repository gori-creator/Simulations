---
description: "Interactive simulation for years 11 and 12: graphical differentiation – tangent and slope triangle draw the graph of f′ (and f″), the secant becomes the tangent as h → 0, features with a sign chart, your own sketch of f′, the rules of differentiation visualised and nine everyday examples."
---

## What is it about?

The derivative $f'(x)$ is the slope of the tangent at $x$, the limit of the difference quotient $\frac{f(x+h) - f(x)}{h}$ as $h \to 0$. For $x^2$ at $1$ with $h = 0.1$: right $2.1$, left $1.9$, symmetric $2$. If left and right limits differ, the graph has a kink (e.g. $|x|$ at $0$).

Plotting all slopes gives the derivative function: where $f$ increases, $f' > 0$; horizontal tangents are zeros of $f'$ (with a sign change: maximum or minimum, without: saddle point); inflection points of $f$ are extrema of $f'$ and zeros of $f''$ with a sign change. The rules of differentiation (constant multiple, sum, power, product, chain rule) are shown as pictures.

## Try it

1. [Running tangent](?mode=trace&fn=cub&x=-2.5&d2=1): press “Let P run along”.
2. [Secant → tangent](?mode=sek&fn=par&pa=1&pb=0&pc=0&x=1&h=1) and the [kink of |x|](?mode=sek&fn=abs&x=0&h=1.5&side=l).
3. [Features of x³ − 3x](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1), [product rule](?mode=rule&rule=prod&x=2&dx=0.5), [car](?kind=app&app=car&x=0&d2=1), [epidemic](?mode=feat&kind=app&app=pop&d2=1).

## Tasks

### Task 1: Features of x³ − 3x

Find $f'(2)$, the extrema and the inflection point. [Load task](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = 3x^2 - 3$, $f'(2) = 9$; maximum $(-1 \mid 2)$, minimum $(1 \mid -2)$; $f''(x) = 6x$, inflection point $(0 \mid 0)$. [Show](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1)

</details>

### Task 2: Sketch f′

Sketch the derivative of $f(x) = \frac14(x^3 - 6x)$ with the seven points, then reveal. [Load task](?mode=draw&fn=cub)

<details>
<summary>Show solution</summary>

An upward parabola with zeros at $\pm\sqrt2$ and minimum at $0$: $f'(x) = \frac34 x^2 - 1.5$. [Show](?mode=feat&fn=cub&d2=1)

</details>

### Task 3: Car

$s(t) = -0.05t^3 + 1.5t^2$ (m). Find $v(4)$ and when the car is fastest. [Load task](?kind=app&app=car&x=4&d2=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$v(t) = -0.15t^2 + 3t$, $v(4) = 9.6$ m/s; $a(t) = -0.3t + 3 = 0$ at $t = 10$ s, $v(10) = 15$ m/s. [Show](?kind=app&app=car&x=4&d2=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Let students predict $f'$ on paper with values hidden, then check with the trace or the sketch task.
- **Common stumbling blocks:** confusing a maximum of $f$ with a maximum of $f'$; confusing $f(x)$ with $f'(x)$; treating a zero of $f'$ without sign change as an extremum.
