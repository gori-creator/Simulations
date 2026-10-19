---
description: "Interactive simulation for upper secondary and university: Taylor polynomials of sin x, cos x, eˣ, ln(1 + x) and 1/(1 − x) – increase the degree, drag the centre, measure the error at a test point and see the interval of convergence."
---

## What is it about?

The Taylor polynomial $T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x-a)^k$ shares value and first $n$ derivatives with $f$ at $a$. For $\sin x$, $\cos x$, $e^x$ the error tends to $0$ for every $x$; for $\ln(1+x)$ and $\frac{1}{1-x}$ only inside the interval of convergence.

## Try it

1. [sin x about 0](?fn=sin&n=1&a=0&x=2): press “Increase degree” several times.
2. [eˣ](?fn=exp&n=4&a=0&x=1): how good is $T_4(1)$ as an approximation of $e$?
3. [ln(1 + x)](?fn=ln&n=6&a=0&x=1.5): move the test point out of the green region.

## Tasks

### Task 1: Computing e

Find $T_4(1)$ for $e^x$ about $0$. [Load task](?fn=exp&n=4&a=0&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 + 1 + \frac12 + \frac16 + \frac1{24} = \frac{65}{24} \approx 2.7083$, error $\approx 0.0099$. [Show](?fn=exp&n=4&a=0&x=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Start from the tangent as $T_1$.
- **Common stumbling blocks:** forgetting $k!$; writing $x^k$ instead of $(x-a)^k$; expecting more terms to help outside the interval of convergence.
