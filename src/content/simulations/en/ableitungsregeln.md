---
description: "Differentiation workshop: sum, constant multiple, power, product, quotient and chain rule step by step – with coloured parts, a graph and a check of your own derivative."
---

## What is it about?

With a few **differentiation rules** you can differentiate any expression built from powers, $\sin$, $\cos$, $e^x$ and $\ln$. The key is to recognise the **outermost operation** – it determines the rule:

| Structure | Rule |
| --- | --- |
| $u(x) \pm v(x)$ | sum rule: $(u \pm v)' = u' \pm v'$ |
| $c \cdot u(x)$ | constant multiple rule: $(c \cdot u)' = c \cdot u'$ |
| $x^n$ | power rule: $(x^n)' = n \cdot x^{n-1}$ |
| $u(x) \cdot v(x)$ | product rule: $(u \cdot v)' = u' \cdot v + u \cdot v'$ |
| $\dfrac{u(x)}{v(x)}$ | quotient rule: $\left(\dfrac uv\right)' = \dfrac{u' v - u v'}{v^2}$ |
| $g(h(x))$ | chain rule: $\big(g(h(x))\big)' = g'(h(x)) \cdot h'(x)$ |

In addition there are the **basic derivatives** $(\sin x)' = \cos x$, $(\cos x)' = -\sin x$, $(e^x)' = e^x$, $(\ln x)' = \tfrac1x$.

Example: $f(x) = x^2 \cdot \sin x$ is a product with $u = x^2$, $v = \sin x$. So $u' = 2x$, $v' = \cos x$ and

$$
f'(x) = 2x \cdot \sin x + x^2 \cdot \cos x.
$$

For the chain rule you look for the **inner function** $h$ (what is “inside the brackets”) and the **outer function** $g$: for $f(x) = e^{2x+1}$, $h(x) = 2x + 1$ and $g(z) = e^z$, so $f'(x) = e^{2x+1} \cdot 2$.

In the simulation the parts are coloured: $u$ and $v$, or the outer and the inner function. The graph shows $f$ and $f'$; at the point $x_0$ you see the tangent. Its slope equals the value $f'(x_0)$ – so you can check every rule in the picture.

## Try it

1. A product: which colour is $u$, which $v$? Switch on “All steps”. [Load product](?f=x%5E2*sin(x)&mode=rule&x0=3.15)
2. Drag the point on $f$. Why is the red point on $f'$ always exactly at the height of the tangent’s slope? [Example](?f=x%5E3-3x&mode=rule&x0=1)
3. Chain rule: change the inner function from $2x + 1$ to $3x + 1$. What changes in the derivative? [Chain](?f=e%5E(2x%2B1)&mode=rule&x0=-1)
4. Shifted sine $f(x) = 2\sin(3(x-1)) + 1$: which parameters still appear in the derivative? [Sine](?f=2*sin(3*(x-1))%2B1&mode=rule&x0=1)
5. Type an expression yourself, e.g. $\ln(x^2 + 1)$ or $\sqrt{x^2 + 4}$, and have all steps shown. [All steps](?f=x%5E2*e%5E(-x)&mode=steps&x0=2)
6. **Building the graph of f′:** tap “Run the tangent”. The tangent moves along $f$, and below its slope is plotted point by point. Where $f$ has a maximum, where does $f'$ have a zero? [x³ − 3x](?f=x%5E3%20-%203x&mode=graph&x0=-2) · [sin(x)](?f=sin(x)&mode=graph&x0=0)
7. **Practice “Which rule first?”:** you see an expression and choose the rule you have to start with. “Next task” continues. [Start practising](?mode=quiz&qn=1)
8. **Practice “Match f and f′”:** on the left is the graph of $f$, on the right four graphs. Which of them is $f'$? Look at the points where $f$ is horizontal. [Start practising](?mode=match&qn=1)

## Exercises

### Exercise 1: Sum and factor

Differentiate $f(x) = 3x^4 - 2x + 7$. [Load exercise](?f=3x%5E4-2x%2B7&mode=check&show=0&x0=1&_hide=1)

<details>
<summary>Show solution</summary>

Sum, constant multiple and power rule: $f'(x) = 3 \cdot 4x^3 - 2 + 0 = 12x^3 - 2$. [Show in the simulation](?f=3x%5E4-2x%2B7&mode=rule&x0=1)

</details>

### Exercise 2: Product rule

Find the slope of $f(x) = x^2 \sin x$ at $x = \pi$. [Load exercise](?f=x%5E2*sin(x)&mode=check&show=0&x0=3.15&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = 2x\sin x + x^2\cos x$, so $f'(\pi) = 2\pi \cdot 0 + \pi^2 \cdot (-1) = -\pi^2 \approx -9.87$. [Show in the simulation](?f=x%5E2*sin(x)&mode=rule&x0=3.15)

</details>

### Exercise 3: Chain rule with e

Differentiate $f(x) = e^{2x+1}$ and calculate $f'(-0.5)$.

<details>
<summary>Show solution</summary>

Inner function $h(x) = 2x + 1$, $h'(x) = 2$; outer $g(z) = e^z$. So $f'(x) = 2e^{2x+1}$ and $f'(-0.5) = 2e^0 = 2$. [Show in the simulation](?f=e%5E(2x%2B1)&mode=rule&x0=-0.5)

</details>

### Exercise 4: Shifted sine

$f(x) = 2\sin(3(x-1)) + 1$. Where is the slope largest, and how large is it?

<details>
<summary>Show solution</summary>

$f'(x) = 2 \cdot \cos(3(x-1)) \cdot 3 = 6\cos(3(x-1))$. The cosine is at most 1, so the largest slope is $6$, for example at $x = 1$. The shift $+1$ in the $y$-direction disappears when differentiating. [Show in the simulation](?f=2*sin(3*(x-1))%2B1&mode=rule&x0=1)

</details>

### Exercise 5: Quotient rule

Differentiate $f(x) = \dfrac{x+1}{x^2+1}$. What is the slope of the graph at $x = 0$?

<details>
<summary>Show solution</summary>

$u = x + 1$, $u' = 1$, $v = x^2 + 1$, $v' = 2x$: $f'(x) = \dfrac{(x^2+1) - (x+1)\cdot 2x}{(x^2+1)^2} = \dfrac{-x^2 - 2x + 1}{(x^2+1)^2}$. At $x = 0$: $f'(0) = 1$. [Show in the simulation](?f=(x%2B1)%2F(x%5E2%2B1)&mode=rule&x0=0)

</details>

### Exercise 6: Check it yourself

Differentiate $f(x) = (2x + 1)^3$, type your result into the simulation and press “Check”. [Load exercise](?f=(2x%2B1)%5E3&mode=check&show=0&x0=0)

<details>
<summary>Show solution</summary>

Chain rule: $f'(x) = 3(2x+1)^2 \cdot 2 = 6(2x+1)^2$. The simulation also accepts it multiplied out ($24x^2 + 24x + 6$).

</details>

### Exercise 7: From the graph to the derivative

First sketch the graph of $f'$ for $f(x) = x^3 - 3x$ by hand: where is $f'$ positive, where negative, where zero? Then compare with the simulation. [Load exercise](?f=x%5E3%20-%203x&mode=graph&x0=-2)

<details>
<summary>Show solution</summary>

$f$ increases for $x < -1$ and for $x > 1$; there $f' > 0$. Between $-1$ and $1$, $f$ decreases; there $f' < 0$. At the maximum $(-1, 2)$ and the minimum $(1, -2)$ the tangent is horizontal, so $f'(-1) = f'(1) = 0$. Together this gives the upward-opening parabola $f'(x) = 3x^2 - 3$.

</details>

## Ideas for the classroom

- **Use:** after introducing the derivative function, for working out or practising the rules (upper secondary). The graph helps to spot calculation errors: if the tangent does not match the red point, something is wrong.
- **Recognising the rule:** make a game of it – show expressions and first ask only for the *outermost* rule before calculating.
- **Practice mode:** the simulation compares your own derivative with the correct one at many points. Other, equivalent ways of writing it also count as correct.
- **Common pitfalls:**
  - The inner derivative is forgotten, e.g. $(\sin 3x)' = \cos 3x$ instead of $3\cos 3x$.
  - The product rule is treated like the sum rule: $(u v)' = u' v'$.
  - In the quotient rule, the order in the numerator is swapped (sign error).
  - Additive constants such as the $+1$ with the sine are differentiated as well.
- **Curriculum link:** which rules (e.g. the quotient rule) are compulsory differs – please check your own curriculum.
