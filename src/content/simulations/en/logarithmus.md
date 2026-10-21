---
description: "Interactive simulation on logarithms as the inverse of exponentiation: graphs of bˣ and log_b x with an animated reflection in y = x, the laws of logarithms as arrows on a logarithmic scale, and solving exponential equations with the change of base."
---

## What is it about?

Exponentiation asks: what is $2^3$? Answer: $8$. The **logarithm** asks the reverse question: **“2 to the power of what gives 8?”** Answer: $3$. We write $\log_2 8 = 3$.

$$
\log_b y = x \quad\Longleftrightarrow\quad b^x = y \qquad (b > 0,\; b \neq 1,\; y > 0)
$$

Here $b$ is called the **base**. Two logarithms have their own names: the **common logarithm** $\lg y = \log_{10} y$ and the **natural logarithm** $\ln y = \log_e y$ with Euler's number $e \approx 2.718$.

- **Not defined:** There is no logarithm of $y \le 0$, because $b^x$ is always positive. The base $b = 1$ is excluded, because $1^x = 1$ for every $x$.
- **Special values:** $\log_b 1 = 0$ (since $b^0 = 1$) and $\log_b b = 1$ (since $b^1 = b$). For $b > 1$, numbers between $0$ and $1$ have negative logarithms, e.g. $\log_2 0.5 = -1$.
- **Inverse function:** The function $f(x) = \log_b x$ is the inverse function of $g(x) = b^x$. Its graph is the **reflection in the line $y = x$**: the point $(x \mid b^x)$ becomes $(b^x \mid x)$.
- **Key features** of $f(x) = \log_b x$: $D = \mathbb{R}^+$, $W = \mathbb{R}$, zero at $x = 1$, point $(b \mid 1)$, vertical asymptote $x = 0$; strictly increasing for $b > 1$, strictly decreasing for $0 < b < 1$.

**Laws of logarithms** (for $u, v > 0$): They follow directly from the laws of exponents, e.g. $b^m \cdot b^n = b^{m+n}$.

$$
\log_b(u \cdot v) = \log_b u + \log_b v \qquad \log_b \frac{u}{v} = \log_b u - \log_b v \qquad \log_b\left(u^r\right) = r \cdot \log_b u
$$

**Exponential equations** such as $2^x = 10$ are solved by taking logarithms: $x = \log_2 10$. On a calculator, the **change of base** helps:

$$
x = \log_b c = \frac{\lg c}{\lg b}, \qquad \text{e.g.}\quad \log_2 10 = \frac{\lg 10}{\lg 2} = \frac{1}{0.30103\ldots} \approx 3.3219
$$

The simulation writes “=” for exact values (e.g. $\log_2 8 = 3$) and “≈” for rounded values (e.g. $\lg 20 \approx 1.3010$).

## Try it

1. Drag the point $P$ along the blue graph of $y = 2^x$. Its mirror image $P'$ on the red graph of $y = \log_2 x$ has the coordinates swapped. Read off at $P'$: $\log_2 4 = 2$, $\log_2 0.5 = -1$.
2. Click **Reflect in y = x**: the exponential graph folds over the line $y = x$ and becomes the logarithmic graph. The sample points move perpendicular to $y = x$.
3. Drag the point $B(1 \mid b)$ down below $1$. What happens to both graphs? Why does the base jump over $1$? [Load example](?b=0.5&x=-2)
4. Tap the bases $2$, $e$, $10$ and $0.5$ in the picture. Which points always stay the same? [Natural logarithm](?e=1&x=1)
5. Choose the view **Laws of logarithms** and click **Put the arrows together**: two arrows of lengths $\log_2 4 = 2$ and $\log_2 8 = 3$ together give $\log_2 32 = 5$ – and $4 \cdot 8 = 32$. This is how the **slide rule** used to work. [Load example](?view=laws)
6. Drag the ends of the arrows and watch the calculation. Also try the quotient rule and the power rule. [Example with lg](?view=laws&b=10&u=20&v=50)
7. Choose **Solving an exponential equation** and drag the intersection point $S$. Between which whole numbers does the solution of $2^x = 10$ lie? [Load example](?view=solve&c=10)

## Tasks

### Task 1: Logarithms in your head

Without a calculator, find $\log_2 32$, $\log_3 \frac{1}{9}$, $\lg 0.001$, $\log_5 1$ and $\log_4 2$.

<details>
<summary>Show solution</summary>

$\log_2 32 = 5$, since $2^5 = 32$. $\log_3 \frac{1}{9} = -2$, since $3^{-2} = \frac{1}{9}$. $\lg 0.001 = -3$, since $10^{-3} = 0.001$. $\log_5 1 = 0$, since $5^0 = 1$. $\log_4 2 = 0.5$, since $4^{0.5} = \sqrt{4} = 2$. [Show in the simulation](?view=solve&c=32)

</details>

### Task 2: Solve an exponential equation

Solve $2^x = 10$. First narrow the solution down between two whole numbers, then calculate it to two decimal places with the change of base. [Load task](?view=solve&c=10&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Since $2^3 = 8 < 10 < 16 = 2^4$, we have $3 < x < 4$. Exactly: $x = \log_2 10 = \frac{\lg 10}{\lg 2} = \frac{1}{0.30103} \approx 3.32$. Check: $2^{3.32} \approx 9.99$. [Show in the simulation](?view=solve&c=10)

</details>

### Task 3: One more equation

Solve $3^x = 50$ and check your answer. [Load task](?view=solve&b=3&c=50&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$3^3 = 27 < 50 < 81 = 3^4$, so $3 < x < 4$. $x = \frac{\lg 50}{\lg 3} = \frac{1.69897}{0.47712} \approx 3.561$. Check: $3^{3.561} \approx 50.0$. [Show in the simulation](?view=solve&b=3&c=50)

</details>

### Task 4: Using the laws of logarithms

Work out without a calculator: a) $\lg 20 + \lg 50$, b) $\log_2 48 - \log_2 3$, c) $\log_3\left(9^4\right)$.

<details>
<summary>Show solution</summary>

a) $\lg 20 + \lg 50 = \lg(20 \cdot 50) = \lg 1000 = 3$. [Show](?view=laws&b=10&u=20&v=50)

b) $\log_2 48 - \log_2 3 = \log_2 \frac{48}{3} = \log_2 16 = 4$. [Show](?view=laws&law=quot&u=48&v=3)

c) $\log_3\left(9^4\right) = 4 \cdot \log_3 9 = 4 \cdot 2 = 8$. [Show](?view=laws&law=pow&b=3&u=9&r=4)

</details>

### Task 5: Base less than 1

For which $x$ is $0.5^x = 8$? Use the graph to explain why the solution is negative.

<details>
<summary>Show solution</summary>

$0.5^{-3} = 2^3 = 8$, so $x = \log_{0.5} 8 = -3$. The graph of $y = 0.5^x$ is decreasing and has the value $1$ at $x = 0$; values greater than $1$ therefore only occur for $x < 0$. [Show in the simulation](?view=solve&b=0.5&c=8)

</details>

### Task 6: When does the money double?

Savings grow by $5\,\%$ every year, i.e. by the factor $1.05$. After how many years have they doubled?

<details>
<summary>Show solution</summary>

$1.05^x = 2 \Rightarrow x = \frac{\lg 2}{\lg 1.05} = \frac{0.30103}{0.02119} \approx 14.2$. After about $14.2$ years, i.e. in the 15th year, the savings have doubled. [Show in the simulation](?view=solve&b=1.05&c=2)

</details>

## Ideas for the classroom

- **Use:** Grade 10, unit “Exponential growth and logarithms” (LehrplanPLUS Bavaria, Gymnasium): introducing the logarithm through the question “$b$ to the power of what?”, exponential equations, laws of logarithms. The logarithmic *function* and the natural logarithm $\ln$ as the inverse of the exponential function $e^x$ belong, as we understand it, to the upper grades – please check your curriculum to see which parts are planned for your grade.
- **Starting without a formula:** Let students read the table of values of $2^x$ “backwards”, then move on to the graph with the reflection in $y = x$.
- **Slide rule:** The view “Laws of logarithms” shows why people multiplied with log tables and slide rules before calculators existed: a multiplication becomes an addition of lengths.
- **Common stumbling blocks:**
  - “$\log_b(u + v) = \log_b u + \log_b v$” – wrong; the law is about the **product**, e.g. $\lg(20 + 50) \neq \lg 20 + \lg 50 = 3$.
  - “$\log_2 0.5$ does not exist” – it does: $-1$. Only numbers $\le 0$ have no logarithm.
  - Numerator and denominator are swapped in the change of base: correct is $\log_b c = \frac{\lg c}{\lg b}$ – the check $b^x \approx c$ reveals the mistake at once.
  - Students try the base $b = 1$: $1^x = 1$ gives no solution for $c \neq 1$ and infinitely many for $c = 1$.
- **Task mode:** With `info=0` and **Share → Hide results**, logarithms and solutions in the picture are replaced by “?”; **Show solution** reveals the solution with an animation.
