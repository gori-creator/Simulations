---
description: "Interactive simulation for upper secondary and university: Taylor polynomials of sin x, cos x, eˣ, ln(1 + x) and 1/(1 − x) – build them term by term, drag the centre, compare the error with the Lagrange bound, see the ε-band and the interval of convergence."
---

## What is it about?

The Taylor polynomial $T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x-a)^k$ shares value and first $n$ derivatives with $f$ at $a$. Differentiating $(x-a)^k$ $k$ times gives $k!$ – that is why the coefficient is $c_k = \frac{f^{(k)}(a)}{k!}$ (see the **Terms** view).

For sin, cos and $e^x$ the **Lagrange bound** $|R_n(x)| \le M \frac{|x-a|^{n+1}}{(n+1)!}$ estimates the error, and the range where $|f - T_n| < \varepsilon$ (**ε-band** view) grows with $n$. For $\ln(1+x)$ and $\frac{1}{1-x}$ it stays inside the interval of convergence.

## Try it

1. [sin x about 0](?fn=sin&n=1&a=0&x=2): press “Increase degree” several times. Why does every second step change nothing?
2. [Term by term](?view=terms&fn=sin&n=1&a=0): go up to degree 7 and watch the new term.
3. [eˣ](?fn=exp&n=4&a=0&x=1): compare the true error of $T_4(1)$ with the Lagrange bound.
4. [ε-band for ln(1 + x)](?view=band&fn=ln&n=3&a=0&eps=0.1): increase the degree – when does the range stop growing?

## Tasks

### Task 1: Computing e

Find $T_4(1)$ for $e^x$ about $0$ and the Lagrange bound. [Load task](?fn=exp&n=4&a=0&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 + 1 + \frac12 + \frac16 + \frac1{24} = \frac{65}{24} \approx 2.7083$, error $\approx 0.0099$; bound $\frac{e}{120} \approx 0.0227$. [Show](?fn=exp&n=4&a=0&x=1)

</details>

### Task 2: How far does “sin x ≈ x” go?

For which $x$ is $|\sin x - x| < 0.01$? [Load task](?fn=sin&n=1&a=0&x=0.4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Estimate $\frac{|x|^3}{6} < 0.01 \Rightarrow |x| < 0.39$; the simulation shows $|x| < 0.3925$ (about $22.5°$). [Show](?view=band&fn=sin&n=1&a=0&eps=0.01)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Start from the tangent as $T_1$; link to the small-angle approximation of the pendulum.
- **Common stumbling blocks:** forgetting $k!$; writing $x^k$ instead of $(x-a)^k$; expecting more terms to help outside the interval of convergence; confusing the Lagrange bound with the true error.
