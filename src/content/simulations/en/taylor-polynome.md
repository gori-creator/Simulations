## What is it about?

Many functions can be approximated well by **polynomials** near a point $a$. The **Taylor polynomial** of degree $n$

$$T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}\,(x-a)^k$$

has the same function value and the same first $n$ derivatives as $f$ at $x = a$. $T_0$ is the horizontal line $y = f(a)$, $T_1$ the tangent, $T_2$ the “osculating parabola” with the same curvature. The view **Matching derivatives** shows this as a list with ticks: value ✓, slope ✓, curvature ✓ …

**Where do the coefficients come from?** Differentiating $(x-a)^k$ $k$ times gives $k!$. For $T_n^{(k)}(a) = f^{(k)}(a)$ to hold, $c_k = \frac{f^{(k)}(a)}{k!}$. Examples about $a = 0$:

$\sin x \approx x - \frac{x^3}{6} + \frac{x^5}{120}$, $\cos x \approx 1 - \frac{x^2}{2} + \frac{x^4}{24}$, $e^x \approx 1 + x + \frac{x^2}{2} + \frac{x^3}{6}$, $\frac{1}{1-x} \approx 1 + x + x^2 + x^3$ (geometric series), $\ln(1+x) \approx x - \frac{x^2}{2} + \frac{x^3}{3}$. For $\sin x$ about $0$ all even derivatives are $0$. That is why $T_4 = T_3$ – a new degree brings no new term there.

**How good is the approximation?** The error $R_n(x) = f(x) - T_n(x)$ is tiny near $a$ and grows with the distance. For sin, cos and $e^x$ the **Lagrange bound** gives $|R_n(x)| \le M \cdot \frac{|x-a|^{n+1}}{(n+1)!}$, where $M$ is a bound for $|f^{(n+1)}|$ between $a$ and $x$ ($M = 1$ for sin and cos, $M = e^{\max(a,x)}$ for $e^x$). If $T_n = T_{n+1}$, you may even use $n + 1$.

**Radius of convergence:** for sin, cos and $e^x$ the approximation gets better everywhere as $n$ grows. For $\ln(1+x)$ and $\frac{1}{1-x}$ only in the **interval of convergence** $|x - a| < r$; $r$ is the distance from $a$ to the gap in the domain at $-1$ or to the pole at $1$. Outside, the polynomials “blow up”, and the error grows with $n$.

## Try it

1. [sin x about 0](?fn=sin&n=1&a=0&x=2): press “Increase degree” several times. Why does nothing change at every second step? The hint card explains it.
2. [Term by term](?view=terms&fn=sin&n=1&a=0): increase the degree up to 7 and watch the new dashed term. Which rows of the table are 0?
3. [Matching derivatives](?view=match&fn=cos&n=2&a=0.5&dk=2): which ticks are green, which is red? Tap the rows and compare $f''$ with $T_2''$. What does $T_2'''$ look like?
4. [Special case n = 0](?fn=exp&n=0&a=0.5&x=1.5): why is $T_0$ horizontal? Then drag the expansion point. In the [ε-band for eˣ](?view=band&fn=exp&n=4&a=0&eps=0.01): use “Run through all degrees”. Why is the region not symmetric about $a$?
5. [Radius of convergence for ln(1 + x)](?view=conv&fn=ln&n=12&a=0&x=1.5): press “Run through all degrees”. What happens to the right of $x = 1$? Move the test point to $x = 0.5$ and compare the error graph. How large is the radius [with a close to −1](?view=conv&fn=ln&n=8&a=-0.9&x=-0.7)?
6. [Calculator](?view=calc&fn=exp&n=9&a=0&x=1): how many digits of $e$ are correct after each term? Compare with [sin 0.5](?view=calc&fn=sin&n=7&a=0&x=0.5) and [1/(1 − x) at x = 1](?view=calc&fn=geo&n=10&a=0&x=1).
7. [Pendulum](?view=small&phi=20): drag the point. Up to what angle is the arc $l \cdot \varphi$ almost as long as the displacement $l \cdot \sin\varphi$?

## Exercises

### Exercise 1: Calculating e

Calculate $T_4(1)$ for $f(x) = e^x$ and $a = 0$. How large is the error, and what does the Lagrange bound say? How many terms do you need for 6 correct decimal places? [Load exercise](?view=calc&fn=exp&n=4&a=0&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$T_4(1) = 1 + 1 + \frac{1}{2} + \frac{1}{6} + \frac{1}{24} = \frac{65}{24} \approx 2.708333$; error $e - \frac{65}{24} \approx 0.009948$. Lagrange with $M = e^1$: $|R_4(1)| \le \frac{e}{5!} \approx 0.022652$ – the bound holds but is more than twice as large. For 6 decimal places $|R_n(1)| < 5 \cdot 10^{-7}$ is needed: for $T_8$ the error is still $\approx 3.1 \cdot 10^{-6}$, for $T_9$ only $\approx 3.0 \cdot 10^{-7}$. So degree $n = 9$, i.e. $10$ terms, with $T_9(1) \approx 2.718282$. [Show the solution](?view=calc&fn=exp&n=9&a=0&x=1)

</details>

### Exercise 2: Approximating sin 0.5

Find $T_3$ of $\sin x$ about $a = 0$, approximate $\sin 0.5$ and estimate the error with Lagrange. [Load exercise](?fn=sin&n=3&a=0&x=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f(0) = 0$, $f'(0) = 1$, $f''(0) = 0$, $f'''(0) = -1$, so $T_3(x) = x - \frac{x^3}{6}$ and $T_3(0.5) = 0.5 - \frac{0.125}{6} \approx 0.479167$; exactly, $\sin 0.5 \approx 0.479426$. Lagrange: $|R_3(0.5)| \le \frac{0.5^4}{4!} \approx 0.002604$. Because $T_3 = T_4$, even $|R_3(0.5)| \le \frac{0.5^5}{5!} \approx 0.000260$ holds – the true error is $0.000259$. [Show the solution](?fn=sin&n=3&a=0&x=0.5)

</details>

### Exercise 3: Coefficients from the table

Set up $T_4$ of $\cos x$ about $a = 0$ by filling in the table $k$ | $f^{(k)}(0)$ | $k!$ | $c_k$ yourself. [Load exercise](?view=terms&fn=cos&n=4&a=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Derivatives $\cos, -\sin, -\cos, \sin, \cos$, so at $0$: $1, 0, -1, 0, 1$. Coefficients $1, 0, -\frac{1}{2}, 0, \frac{1}{24}$, so $T_4(x) = 1 - \frac{x^2}{2} + \frac{x^4}{24}$. [Show the solution](?view=terms&fn=cos&n=4&a=0)

</details>

### Exercise 4: Small-angle approximation

For which angles does $\sin\varphi$ differ from $\varphi$ by less than $0.01$? Estimate with the next term $\frac{\varphi^3}{6}$ and also give the result in degrees. [Load exercise](?view=small&phi=20&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Estimate: $\frac{\varphi^3}{6} < 0.01 \Rightarrow \varphi < \sqrt[3]{0.06} \approx 0.39$. Exactly, $|\sin\varphi - \varphi| < 0.01$ for $|\varphi| < 0.392493$, i.e. up to about $22.5°$. If you require a relative error below $1\,\%$, it only works up to about $14.0°$. [Show the solution](?view=small&phi=22)

</details>

### Exercise 5: ln 2 from the series

Calculate $T_5(1)$ for $\ln(1+x)$ about $0$ and compare with $\ln 2$. What happens at $x = 1.5$? [Load exercise](?view=calc&fn=ln&n=5&a=0&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$T_5(1) = 1 - \frac{1}{2} + \frac{1}{3} - \frac{1}{4} + \frac{1}{5} \approx 0.783333$, but $\ln 2 \approx 0.693147$. The partial sums $1;\ 0.5;\ 0.8333;\ 0.5833;\ 0.7833$ oscillate slowly around $\ln 2$ – $x = 1$ is the end point of the interval of convergence $(-1;\,1]$. At $x = 1.5$, $|x - a| > r = 1$: the polynomials diverge. [Show the solution](?view=conv&fn=ln&n=12&a=0&x=1.5)

</details>

### Exercise 6: Geometric series (puzzle)

Explain why all coefficients of $\frac{1}{1-x}$ about $0$ equal $1$. For which $x$ does the series converge? What happens at $x = 1$ and $x = -1$? [Show](?view=conv&fn=geo&n=12&a=0&x=-1.3)

<details>
<summary>Show solution</summary>

$f^{(k)}(x) = \frac{k!}{(1-x)^{k+1}}$, so $f^{(k)}(0) = k!$ and $c_k = 1$. The series $1 + x + x^2 + \ldots$ converges for $|x| < 1$. At $x = 1$ the partial sums $1, 2, 3, \ldots$ grow without limit; at $x = -1$ they jump $1, 0, 1, 0, \ldots$ and have no limit. [Show the solution](?view=calc&fn=geo&n=10&a=0&x=1)

</details>

## Ideas for the classroom

- **Use:** extension in upper secondary (e.g. seminar, gifted students) and first-year university analysis. The curriculum link differs by region and course – please check your curriculum.
- **Starter via the calculator:** “How does a calculator compute $\sin 0.5$ or $e$?” The digits in bold in the *Calculator* view make visible how fast the approximation improves.
- **From tangent to osculating parabola:** the *Matching derivatives* view builds on the tangent. The class can guess beforehand which ticks will turn green for $T_2$.
- **Physics link:** small-angle approximation $\sin\varphi \approx \varphi$ for the simple pendulum; the period $T = 2\pi\sqrt{l/g}$ only holds for small swings.
- **Common pitfalls:**
  - The factorial in the denominator is forgotten, or for $a \neq 0$ you see $x^k$ instead of $(x-a)^k$.
  - Expecting more terms always to help – that only holds inside the interval of convergence.
  - Confusing the Lagrange bound with the true error; it is only an upper bound.
