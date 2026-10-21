---
description: "Interactive simulation of the natural exponential function: why the base e? For y = bˣ, f′(x) : f(x) = ln b, and only for b = e do f and f′ coincide. Plus the tangent to y = eˣ with slope triangle and (1 + 1/n)ⁿ as compound interest."
---

## What is it about?

For every exponential function $f(x) = b^x$ the derivative is a fixed multiple of the function itself:

$$
f'(x) = \ln b \cdot b^x, \qquad \frac{f'(x)}{f(x)} = \ln b \;\text{ for all } x.
$$

For $b = 2$ the factor is $\ln 2 \approx 0.693$ ($f'$ lies below $f$), for $b = 3$ it is $\ln 3 \approx 1.099$ ($f'$ lies above $f$). Exactly one base gives the factor $1$: **Euler's number** $e = 2.718281828\ldots$, with $(e^x)' = e^x$. At every point the slope of $y = e^x$ equals the function value; at $(0, 1)$ the tangent is $y = x + 1$.

The tangent at $P(x_0, e^{x_0})$ is $y = e^{x_0}(x - x_0 + 1)$. It always meets the $x$-axis at $x_0 - 1$, so the slope triangle has **base 1** and **height $f(x_0)$**.

Investing $€1$ at $100\,\%$ per year, compounded $n$ times a year, gives $\left(1 + \frac{1}{n}\right)^n$ after one year: $€2$ for $n = 1$, $€2.6130$ for $n = 12$, $€2.7146$ for $n = 365$ – increasing, always below $e$, and getting arbitrarily close to $e$.

Key features: domain $\mathbb{R}$, range $(0, \infty)$, asymptote $y = 0$, $y$-intercept $(0, 1)$, strictly increasing, $f' = f$, antiderivative $e^x + C$, inverse function $\ln x$ (reflection in $y = x$).

## Try it

1. Drag the point $(1, b)$. In the table the column $f' : f$ is the same in every row. [Load example](?b=2)
2. Click **Search for base e**: at $b = e$ the base snaps into place and the graphs of $f$ and $f'$ coincide. [Load example](?b=2.72)
3. Switch to the **tangent** and drag $P$. Where does the tangent meet the $x$-axis? [Load example](?view=tangent&x0=1)
4. Turn on the **inverse function**: $P(1, e)$ becomes $P'(e, 1)$. [Load example](?view=tangent&x0=1&inv=1)
5. In **Where e comes from**, click **Let n grow**. [Load example](?view=limit&ns=0)

## Tasks

### Task 1: Derivative of 2ˣ

Use the slope triangle at $(0, 1)$ to find $f'(0)$ for $f(x) = 2^x$, then compute $f'(1)$. [Load task](?b=2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(0) = \ln 2 \approx 0.693$, $f'(1) = 2 \ln 2 \approx 1.386$. [Show](?b=2)

</details>

### Task 2: Tangent at x₀ = 2

Find the tangent to $y = e^x$ at $P(2, e^2)$ and its zero. [Load task](?view=tangent&x0=2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$y = e^2 (x - 1) \approx 7.389x - 7.389$; zero at $x = 1$. [Show](?view=tangent&x0=2)

</details>

### Task 3: Compound interest

Compute $\left(1 + \frac{1}{4}\right)^4$ and the gap between daily compounding and $e$.

<details>
<summary>Show solution</summary>

$1.25^4 = 2.4414$; $e - 2.7146 \approx 0.0037$. [Show](?view=limit&ns=19)

</details>

## Ideas for the classroom

- Let students discover the constant ratio $f' : f$ in the table (difference quotient) before naming $e$; the formula $\ln b \cdot b^x$ needs the chain rule.
- The compound interest view makes the limit $\left(1 + \frac{1}{n}\right)^n \to e$ visible but does not prove it.
- **Common stumbling blocks:**
  - Confusing $e^x$ with $x^e$, or applying the power rule to $2^x$.
  - Thinking the graph of $e^x$ eventually reaches the $x$-axis.
  - Reflecting in the $x$-axis instead of the line $y = x$ when forming the inverse.
