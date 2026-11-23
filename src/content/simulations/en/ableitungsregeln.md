---
description: "Differentiation workshop: sum, constant multiple, power, product, quotient and chain rule step by step – with coloured parts, a graph and a check of your own derivative."
---

## What is it about?

A few **rules** are enough to differentiate any term built from powers, $\sin$, $\cos$, $e^x$ and $\ln$. The key is to spot the **outermost operation** – it decides the rule:

| Structure | Rule |
| --- | --- |
| $u \pm v$ | $(u \pm v)' = u' \pm v'$ |
| $c \cdot u$ | $(c \cdot u)' = c \cdot u'$ |
| $x^n$ | $(x^n)' = n x^{n-1}$ |
| $u \cdot v$ | $(u v)' = u' v + u v'$ |
| $u / v$ | $(u/v)' = (u'v - uv')/v^2$ |
| $g(h(x))$ | $(g(h(x)))' = g'(h(x)) \cdot h'(x)$ |

The simulation colours the parts ($u$ and $v$, outer and inner function) and draws $f$ and $f'$. The tangent at $x_0$ has exactly the slope $f'(x_0)$.

## Try it

1. A product: which colour is $u$, which is $v$? [Product](?f=x%5E2*sin(x)&mode=rule&x0=3.15)
2. Drag the point on $f$ and watch the point on $f'$. [Example](?f=x%5E3-3x&mode=rule&x0=1)
3. Chain rule: [load](?f=e%5E(2x%2B1)&mode=rule&x0=-1). All steps: [load](?f=x%5E2*e%5E(-x)&mode=steps&x0=2)
4. **Building the graph of f′:** tap “Run the tangent”. The tangent slides along $f$ and its slope is plotted point by point below. Where $f$ has a maximum, what does $f'$ do? [x³ − 3x](?f=x%5E3%20-%203x&mode=graph&x0=-2) · [sin(x)](?f=sin(x)&mode=graph&x0=0)
5. **Practice “which rule first?”:** you see a term and choose the rule you have to start with. [Start](?mode=quiz&qn=1)
6. **Practice “match f and f′”:** the graph of $f$ is on the left, four graphs on the right. Which one is $f'$? Look at the places where $f$ is horizontal. [Start](?mode=match&qn=1)

## Tasks

### Task 1: Product rule

Find the slope of $f(x) = x^2 \sin x$ at $x = \pi$.

<details>
<summary>Show solution</summary>

$f'(x) = 2x\sin x + x^2\cos x$, so $f'(\pi) = -\pi^2 \approx -9.87$. [Show](?f=x%5E2*sin(x)&mode=rule&x0=3.15)

</details>

### Task 2: Chain rule

Differentiate $f(x) = e^{2x+1}$.

<details>
<summary>Show solution</summary>

$f'(x) = 2e^{2x+1}$. [Show](?f=e%5E(2x%2B1)&mode=rule&x0=-0.5)

</details>

### Task 3: Check yourself

Differentiate $(2x + 1)^3$, type your answer and press "Check". [Load](?f=(2x%2B1)%5E3&mode=check&show=0&x0=0)

<details>
<summary>Show solution</summary>

$6(2x+1)^2$ – the expanded form $24x^2 + 24x + 6$ counts as correct too.

</details>

### Task 4: From the graph to the derivative

Sketch the graph of $f'$ for $f(x) = x^3 - 3x$ by hand first: where is $f'$ positive, negative or zero? Then compare with the simulation. [Load](?f=x%5E3%20-%203x&mode=graph&x0=-2)

<details>
<summary>Show solution</summary>

$f$ rises for $x < -1$ and $x > 1$, so $f' > 0$ there; between $-1$ and $1$ it falls, so $f' < 0$. At the maximum $(-1 \mid 2)$ and the minimum $(1 \mid -2)$ the tangent is horizontal: $f'(-1) = f'(1) = 0$. Together this gives the upward parabola $f'(x) = 3x^2 - 3$.

</details>

## Ideas for the classroom

- **Use:** practising the rules after introducing the derivative function; the graph exposes slips (tangent and $f'$ point do not match).
- **Spot the rule:** show terms and first only name the outermost rule.
- **Common stumbling blocks:**
  - forgetting the inner derivative, e.g. $(\sin 3x)' = \cos 3x$;
  - treating a product like a sum: $(uv)' = u'v'$;
  - sign errors in the quotient rule.
