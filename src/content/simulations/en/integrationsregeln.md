---
description: "Integration workshop: antiderivatives with the power, sum and constant multiple rule, linear substitution, substitution and integration by parts – with an ansatz, a check by differentiating and the area F(b) − F(a)."
---

## What is it about?

Integrating means finding an **antiderivative** $F$ with $F'(x) = f(x)$. Since constants vanish when differentiating, $F + C$ is an antiderivative too: $\int f(x)\,dx = F(x) + C$. The integration rules are the **differentiation rules in reverse**:

| Structure of $f$ | Rule |
| --- | --- |
| $x^n$ ($n \ne -1$) | $\int x^n\,dx = \dfrac{x^{n+1}}{n+1}$ |
| $\dfrac1x$ | $\int \dfrac1x\,dx = \ln\lvert x\rvert$ |
| $g(ax + b)$ | linear substitution: $\dfrac1a\, G(ax+b)$ |
| $g(u(x)) \cdot u'(x)$ | substitution: $G(u(x))$ |
| $\dfrac{u'}{u}$ | $\ln\lvert u\rvert$ |
| $u \cdot v'$ | by parts: $u\,v - \int u'\,v\,dx$ |

The definite integral follows from the fundamental theorem: $\int_a^b f(x)\,dx = F(b) - F(a)$. The top graph shows the area under $f$ between $a$ and $b$, the bottom graph shows $F + C$ – the height difference $F(b) - F(a)$ is the value of the integral, whatever $C$ is. Every antiderivative is checked by differentiating.

## Try it

1. $\int_0^1 x\,e^x\,dx$ by parts: which colour is $u$, which is $v'$? [Load](?f=x*e%5Ex&mode=rule&a=0&b=1)
2. Drag $a$ and $b$ and watch the height difference below. [sin x](?f=sin(x)&mode=rule&a=0&b=3.14)
3. Move $C$: why does the integral not change? [Family](?f=2x&mode=rule&a=0&b=2&family=1)
4. Ansatz with comparing coefficients: [load](?f=(x%5E2%2B1)*e%5Ex&mode=ansatz&a=-2&b=0)

## Tasks

### Task 1: Linear substitution

Find antiderivatives of $\cos(2x)$ and $e^{2x+1}$.

<details>
<summary>Show solution</summary>

$\tfrac12 \sin(2x)$ and $\tfrac12 e^{2x+1}$ – divide by the inner derivative $2$. [Show](?f=cos(2x)&mode=rule&a=0&b=0.8)

</details>

### Task 2: By parts

Compute $\int_0^1 x\,e^x\,dx$.

<details>
<summary>Show solution</summary>

$x\,e^x - e^x$, so $F(1) - F(0) = 0 - (-1) = 1$. [Show](?f=x*e%5Ex&mode=rule&a=0&b=1)

</details>

### Task 3: Check yourself

Integrate $(2x+1)^3$, type your answer and press "Check". [Load](?f=(2x%2B1)%5E3&mode=check&show=0&a=0&b=1)

<details>
<summary>Show solution</summary>

$\tfrac18 (2x+1)^4$ – any other constant counts as correct too.

</details>

## Ideas for the classroom

- **Use:** after the fundamental theorem, to develop the rules as reversed differentiation rules; later to practise substitution, integration by parts and the ansatz.
- **Common stumbling blocks:** multiplying by the inner derivative instead of dividing; using the power rule for $\frac1x$; the sign in $\int \sin x\,dx = -\cos x$.
