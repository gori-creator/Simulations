## What is it about?

The Taylor polynomial $T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x-a)^k$ shares the value and the first $n$ derivatives with $f$ at $a$: $T_0$ is the horizontal line $y = f(a)$, $T_1$ the tangent, $T_2$ the osculating parabola. Differentiating $(x-a)^k$ $k$ times gives $k!$ – that is why $c_k = \frac{f^{(k)}(a)}{k!}$.

For sin, cos and $e^x$ the **Lagrange bound** $|R_n(x)| \le M \frac{|x-a|^{n+1}}{(n+1)!}$ estimates the error. For $\ln(1+x)$ and $\frac{1}{1-x}$ the polynomials only converge within the **interval of convergence** $|x - a| < r$; outside they blow up and the error grows with $n$.

## Try it

1. [sin x about 0](?fn=sin&n=1&a=0&x=2): press “Increase degree” several times. Why does every second step change nothing?
2. [Matching derivatives](?view=match&fn=cos&n=2&a=0.5&dk=2): which ticks are green? Tap the rows to compare $f''$ and $T_2''$.
3. [Radius of convergence](?view=conv&fn=ln&n=12&a=0&x=1.5): run through all degrees – what happens to the right of $x = 1$?
4. [Calculator](?view=calc&fn=exp&n=9&a=0&x=1): how many digits of $e$ are correct after each term?
5. [Pendulum](?view=small&phi=20): up to which angle is $\sin\varphi \approx \varphi$ good enough?

## Tasks

### Task 1: Computing e

Find $T_4(1)$ for $e^x$ about $0$, the error and the Lagrange bound. How many terms give 6 correct decimals? [Load task](?view=calc&fn=exp&n=4&a=0&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 + 1 + \frac12 + \frac16 + \frac1{24} = \frac{65}{24} \approx 2.708333$, error $\approx 0.009948$; bound $\frac{e}{5!} \approx 0.022652$. Six decimals need $|R_n(1)| < 5 \cdot 10^{-7}$: degree $n = 9$, i.e. $10$ terms, $T_9(1) \approx 2.718282$. [Show](?view=calc&fn=exp&n=9&a=0&x=1)

</details>

### Task 2: sin 0.5

Use $T_3(x) = x - \frac{x^3}{6}$ to approximate $\sin 0.5$ and bound the error. [Load task](?fn=sin&n=3&a=0&x=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$T_3(0.5) \approx 0.479167$, exact $0.479426$. Lagrange: $\frac{0.5^4}{4!} \approx 0.002604$; since $T_3 = T_4$ even $\frac{0.5^5}{5!} \approx 0.000260$. [Show](?fn=sin&n=3&a=0&x=0.5)

</details>

### Task 3: How far does “sin φ ≈ φ” go?

For which $\varphi$ is $|\sin\varphi - \varphi| < 0.01$? [Load task](?view=small&phi=20&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Estimate $\frac{\varphi^3}{6} < 0.01 \Rightarrow \varphi < 0.39$; exactly $|\varphi| < 0.392493$, about $22.5°$. A relative error below $1\,\%$ only holds up to about $14.0°$. [Show](?view=small&phi=22)

</details>

### Task 4: ln 2 from the series

Compute $T_5(1)$ for $\ln(1+x)$ about $0$ and compare with $\ln 2$. [Load task](?view=calc&fn=ln&n=5&a=0&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 - \frac12 + \frac13 - \frac14 + \frac15 \approx 0.783333$, while $\ln 2 \approx 0.693147$: at the boundary point $x = 1$ the series converges only slowly. For $x = 1.5$ it diverges. [Show](?view=conv&fn=ln&n=12&a=0&x=1.5)

</details>

## Ideas for the classroom

- Start with the question “How does a calculator compute $\sin 0.5$?”; continue from the tangent to $T_2$ with the matching-derivatives view; link to the pendulum.
- **Common stumbling blocks:** forgetting $k!$; writing $x^k$ instead of $(x-a)^k$; expecting more terms to help outside the interval of convergence; confusing the Lagrange bound with the true error.
