---
description: "Integration workshop: antiderivatives with the power, sum and constant multiple rule, linear substitution, substitution and integration by parts – with an ansatz, a check by differentiating and the area F(b) − F(a)."
---

## What is it about?

Integrating means finding an **antiderivative** $F$: a function with $F'(x) = f(x)$. Because every constant disappears when differentiating, $F + C$ is an antiderivative too. One writes

$$
\int f(x)\,dx = F(x) + C .
$$

The integration rules are the **differentiation rules in reverse**:

| Structure of $f$ | Rule |
| --- | --- |
| $x^n$ (with $n \ne -1$) | power rule: $\int x^n\,dx = \dfrac{x^{n+1}}{n+1}$ |
| $\dfrac1x$ | $\int \dfrac1x\,dx = \ln\lvert x\rvert$ |
| $e^x$, $\sin x$, $\cos x$ | $\int e^x\,dx = e^x$, $\int \sin x\,dx = -\cos x$, $\int \cos x\,dx = \sin x$ |
| $u \pm v$, $c \cdot u$ | sum and constant multiple rule: integrate separately; the factor stays |
| $g(ax + b)$ | linear substitution: $\int g(ax+b)\,dx = \dfrac1a\, G(ax+b)$ |
| $g(u(x)) \cdot u'(x)$ | substitution: $\int g(u(x))\,u'(x)\,dx = G(u(x))$ |
| $\dfrac{u'(x)}{u(x)}$ | logarithmic integration: $\ln\lvert u(x)\rvert$ |
| $u \cdot v'$ | integration by parts: $\int u\,v'\,dx = u\,v - \int u'\,v\,dx$ |

With linear substitution you divide by the inner derivative $a$, because the chain rule multiplies by $a$ again when differentiating. Example: $\int \cos(2x)\,dx = \tfrac12 \sin(2x) + C$.

For **integration by parts** you choose $u$ so that $u'$ becomes simpler (usually the polynomial), and $v'$ so that you know $v$. Example $\int x\,e^x\,dx$: $u = x$, $v' = e^x$, so $u' = 1$, $v = e^x$ and

$$
\int x\,e^x\,dx = x\,e^x - \int 1 \cdot e^x\,dx = x\,e^x - e^x + C .
$$

With the antiderivative you calculate **definite integrals** (fundamental theorem):

$$
\int_a^b f(x)\,dx = F(b) - F(a).
$$

The simulation shows both: at the top the area under $f$ between $a$ and $b$ (green above the $x$-axis, red below), at the bottom the graph of $F + C$. The difference in height $F(b) - F(a)$ is exactly the value of the integral – however large $C$ is.

**Check:** every antiderivative can be checked by differentiating. The simulation always does this check too.

## Try it

1. Start with $\int_0^1 x\,e^x\,dx$. Which colour is $u$, which $v'$? What value comes out? [Integration by parts](?f=x*e%5Ex&mode=rule&a=0&b=1)
2. Drag the limits $a$ and $b$ in the upper graph. Watch how the difference in height below changes with them. [sin x](?f=sin(x)&mode=rule&a=0&b=3.14)
3. Move $C$ (slider or point in the lower graph). Why does the integral not change? [Family](?f=2x&mode=rule&a=0&b=2&family=1)
4. Linear substitution: change $\cos(2x)$ to $\cos(3x)$. Which factor stands in front of the sine? [cos(2x)](?f=cos(2x)&mode=rule&a=0&b=0.8)
5. Ansatz: for $(x^2+1)\,e^x$ you set up $F(x) = (\alpha x^2 + \beta x + \gamma)\,e^x$ and compare coefficients. [Ansatz](?f=(x%5E2%2B1)*e%5Ex&mode=ansatz&a=-2&b=0)

## Exercises

### Exercise 1: Power rule

Calculate $\displaystyle\int_0^3 x^2\,dx$. [Load exercise](?f=x%5E2&mode=check&show=0&a=0&b=3&_hide=1)

<details>
<summary>Show solution</summary>

$F(x) = \tfrac13 x^3$, so $F(3) - F(0) = 9 - 0 = 9$. [Show in the simulation](?f=x%5E2&mode=rule&a=0&b=3)

</details>

### Exercise 2: Linear substitution

Find an antiderivative of $f(x) = \cos(2x)$ and of $g(x) = e^{2x+1}$.

<details>
<summary>Show solution</summary>

$F(x) = \tfrac12 \sin(2x)$ and $G(x) = \tfrac12 e^{2x+1}$ – in each case divide by the inner derivative $2$. Check: $F'(x) = \tfrac12 \cos(2x) \cdot 2 = \cos(2x)$. [Show in the simulation](?f=cos(2x)&mode=rule&a=0&b=0.8)

</details>

### Exercise 3: Integration by parts

Calculate $\displaystyle\int_0^1 x\,e^x\,dx$.

<details>
<summary>Show solution</summary>

$u = x$, $v' = e^x$: $\int x\,e^x\,dx = x\,e^x - e^x$. So $F(1) - F(0) = (e - e) - (0 - 1) = 1$. [Show in the simulation](?f=x*e%5Ex&mode=rule&a=0&b=1)

</details>

### Exercise 4: Substitution

Find $\displaystyle\int \frac{x}{x^2+1}\,dx$.

<details>
<summary>Show solution</summary>

With $u(x) = x^2 + 1$, $u'(x) = 2x$, and the numerator is $\tfrac12 u'$. So $\int \frac{x}{x^2+1}\,dx = \tfrac12 \ln(x^2 + 1) + C$. [Show in the simulation](?f=x%2F(x%5E2%2B1)&mode=rule&a=0&b=2)

</details>

### Exercise 5: Check it yourself

Find an antiderivative of $(2x+1)^3$, type it in and press “Check”. [Load exercise](?f=(2x%2B1)%5E3&mode=check&show=0&a=0&b=1)

<details>
<summary>Show solution</summary>

$F(x) = \tfrac18 (2x+1)^4$. Multiplied out or with another constant it also counts as correct – the check by differentiating decides.

</details>

## Ideas for the classroom

- **Use:** after the fundamental theorem, to work out the rules as the reverse of the differentiation rules; later for practising substitution, integration by parts and the ansatz method.
- **Checking as a habit:** the workshop differentiates every antiderivative found as a check. Students should do this check on paper too.
- **Constant $C$:** with “Show family F + C” you can see that all antiderivatives are shifted parallel to each other and that the definite integral does not depend on $C$.
- **Common pitfalls:**
  - For $\int \cos(2x)\,dx$, multiplying by $2$ instead of dividing by $2$.
  - Applying the power rule to $\frac1x$ ($n = -1$).
  - In integration by parts, choosing $u$ and $v'$ badly, so that the remaining integral gets harder.
  - The sign in $\int \sin x\,dx = -\cos x$.
- **Curriculum link:** which methods (substitution, integration by parts, ansatz) are compulsory differs – please check your own curriculum.
