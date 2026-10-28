## What is it about?

Many equations cannot be solved for $x$, for example $x^3 - 2x - 5 = 0$ or $\cos x = x$. **Newton’s method** finds a zero of $f$ approximately – and surprisingly fast:

1. Choose a **starting value** $x_0$ near the zero.
2. Go from the point $(x_0 \mid 0)$ straight up (or down) to the graph and draw the **tangent** at $(x_0 \mid f(x_0))$.
3. The tangent’s $x$-intercept is the new approximation $x_1$.
4. Repeat with $x_1$, $x_2$, … (**iteration**).

**Where does the formula come from?** The vertical line, the $x$-axis and the tangent form a **slope triangle** with the vertical leg $f(x_n)$ and the horizontal leg $x_n - x_{n+1}$. The slope of the tangent is $f'(x_n)$, so

$$f'(x_n) = \frac{f(x_n)}{x_n - x_{n+1}} \quad\Longrightarrow\quad x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}.$$

*Example:* $f(x) = x^2 - 2$, $f'(x) = 2x$, $x_0 = 1$:
$x_1 = 1 - \frac{-1}{2} = 1.5$, $\;x_2 = 1.5 - \frac{0.25}{3} = \frac{17}{12} \approx 1.416667$, $\;x_3 = \frac{577}{408} \approx 1.4142157$ – and $\sqrt 2 = 1.41421356\ldots$

**Newton = Heron:** For $f(x) = x^2 - 2$ we get $x_{n+1} = x_n - \frac{x_n^2 - 2}{2x_n} = \frac{1}{2}\left(x_n + \frac{2}{x_n}\right)$. This is exactly Heron’s method: the mean of $x_n$ and $2 : x_n$.

**How fast?** Near a simple zero $x^*$ the error $e_n = |x_n - x^*|$ is roughly **squared** in each step: $e_{n+1} \approx C \cdot e_n^2$ (for $x^2 - 2$, $C = \frac{1}{2\sqrt 2} \approx 0.354$). That is why the number of correct digits **roughly doubles** – in the table for $\sqrt 2$: $0 \to 2 \to 5 \to 11$. This is called **quadratic convergence**. The reason: seen from close up (magnifier!) the graph looks almost like its tangent.

**When do you stop?** Keep going until two consecutive approximations agree in the decimal places you need, i.e. until $|x_{n+1} - x_n|$ is small enough (**stopping criterion**). As a check, put the value into $f$: $f(x_n)$ must be close to $0$. When playing, the simulation stops as soon as nothing changes any more.

**The method can fail:**

- **Horizontal tangent** ($f'(x_n) = 0$): it does not meet the $x$-axis; the formula would divide by $0$.
- **Jump:** near a turning point the tangent is almost horizontal – the next value lands far away, often at a completely different zero.
- **Cycle:** the values jump back and forth for ever.
- **Double zero:** if the graph only touches the $x$-axis, it gets slow: the error is only halved.

## Try it

1. [√2 with x₀ = 1](?fn=sq2&x0=1&k=0): press “Next step” and follow the animation: vertical line, tangent, slope triangle, new point. Then press “Play all” and watch the digits in bold in the table.
2. From step 2 on the **magnifier** appears. How much does it have to magnify so that you can still see step 3 or 4? What does the graph look like in the magnifier?
3. Drag the starting value $x_0$ or tap the $x$-axis. What happens at $x_0 = 0$, and with negative starting values?
4. [Newton’s example](?fn=cubic&x0=2&k=3): Isaac Newton himself worked with $x^3 - 2x - 5$. After how many steps are 8 decimal places correct? And for [cos x = x](?fn=cos&x0=1&k=3), an equation that no rearranging can solve?
5. [Horizontal tangent](?fn=three&x0=1&k=1): why is there no next value here? Move $x_0$ a little.
6. [Jump to another zero](?fn=three&x0=0.95&k=5&basin=1): the starting value lies next to the right-hand zero – but the left one is found. The colours on the $x$-axis show the **basins of attraction**: where each starting value leads. The letters A, B, C at the bottom belong to the zeros from left to right; “–” means: no zero.
7. [Cycle](?fn=cycle&x0=0&k=4): the sequence jumps back and forth between $0$ and $1$. Which starting values lead to the zero? Switch on “Colour the basins of attraction”.
8. [Double zero](?fn=dbl&x0=2&k=8): compare the table with the one for $\sqrt 2$. What is different?

## Tasks

### Task 1: Two steps by hand

For $f(x) = x^2 - 2$ and $x_0 = 2$, calculate the approximations $x_1$ and $x_2$. [Load task](?fn=sq2&x0=2&k=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = 2x$. $x_1 = 2 - \frac{2}{4} = 1.5$; $x_2 = 1.5 - \frac{0.25}{3} = \frac{17}{12} \approx 1.41667$. With Heron: $\frac12\left(2 + \frac22\right) = 1.5$ and $\frac12\left(1.5 + \frac{2}{1.5}\right) = \frac{17}{12}$ – the same numbers. [Show solution](?fn=sq2&x0=2&k=2)

</details>

### Task 2: Deriving the formula

Set up the equation of the tangent to the graph of $f$ at the point $(x_n \mid f(x_n))$ and find its $x$-intercept. [Look at the slope triangle](?fn=sq2&x0=1&k=1)

<details>
<summary>Show solution</summary>

$t(x) = f(x_n) + f'(x_n)\,(x - x_n)$. From $t(x) = 0$ we get $x - x_n = -\frac{f(x_n)}{f'(x_n)}$, so $x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$ – provided $f'(x_n) \neq 0$. In the slope triangle: slope $=$ height $:$ width, so $f'(x_n) = \frac{f(x_n)}{x_n - x_{n+1}}$.

</details>

### Task 3: Newton’s own example

Find the zero of $f(x) = x^3 - 2x - 5$ to six decimal places, starting at $x_0 = 2$. [Load task](?fn=cubic&x0=2&k=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = 3x^2 - 2$. $f(2) = -1$, $f'(2) = 10$, so $x_1 = 2 + 0.1 = 2.1$. $f(2.1) = 9.261 - 4.2 - 5 = 0.061$, $f'(2.1) = 11.23$, so $x_2 = 2.1 - \frac{0.061}{11.23} \approx 2.094568$. One more step gives $x_3 \approx 2.0945515$. $x_4$ also starts with $2.094551$ – the six decimal places no longer change. The zero is $x \approx 2.094551$. [Show solution](?fn=cubic&x0=2&k=3)

</details>

### Task 4: cos x = x

Use Newton’s method to find a solution of $\cos x = x$ to four decimal places ($x_0 = 1$, radians!). [Load task](?fn=cos&x0=1&k=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f(x) = \cos x - x$, $f'(x) = -\sin x - 1$. $f(1) \approx -0.4597$, $f'(1) \approx -1.8415$, so $x_1 \approx 1 - 0.2496 = 0.7504$. Then $x_2 \approx 0.739113$ and $x_3 \approx 0.739085$. $x_2$ and $x_3$ agree in four decimal places. Result: $x \approx 0.7391$. [Show solution](?fn=cos&x0=1&k=3)

</details>

### Task 5: Why does it fail?

a) For $f(x) = x^3 - 3x + 1$ and $x_0 = 1$ there is no value $x_1$. b) For $f(x) = x^3 - 2x + 2$ and $x_0 = 0$ you get $x_1 = 1$, $x_2 = 0$, … Explain both with a sketch. [Show a)](?fn=three&x0=1&k=1) · [Show b)](?fn=cycle&x0=0&k=4)

<details>
<summary>Show solution</summary>

a) $f'(x) = 3x^2 - 3$, so $f'(1) = 0$: at $x = 1$ the graph has a minimum, the tangent is horizontal and does not meet the $x$-axis.

b) $f'(x) = 3x^2 - 2$. $x_1 = 0 - \frac{2}{-2} = 1$ and $x_2 = 1 - \frac{1}{1} = 0$. The tangent at $0$ meets the axis at $1$, the tangent at $1$ meets it at $0$ again – a cycle. A starting value to the left of the zero, e.g. $x_0 = -2$, works: $x_1 = -1.8$, … $\to -1.769$. [Show](?fn=cycle&x0=-2&k=4)

</details>

### Task 6: How fast is fast?

For $f(x) = x^2 - 2$ and $x_0 = 1$, $e_2 = \frac{17}{12} - \sqrt 2 \approx 0.00245$. Estimate $e_3$ using $e_{n+1} \approx \frac{e_n^2}{2\sqrt 2}$ and compare with the table. How does the error behave at the double zero of $x^3 - 3x + 2$? [Load task](?fn=sq2&x0=1&k=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$e_3 \approx \frac{0.00245^2}{2.828} \approx 2.1 \cdot 10^{-6}$; in fact $\frac{577}{408} - \sqrt2 \approx 2.12 \cdot 10^{-6}$. The next error is already about $1.6 \cdot 10^{-12}$. For $x^3 - 3x + 2 = (x-1)^2(x+2)$, however, $f'(1) = 0$: from $x_0 = 2$ ($x_1 = \frac{14}{9}$) the error is only halved – $1 \to 0.56 \to 0.30 \to 0.16 \to \ldots$ [Show √2](?fn=sq2&x0=1&k=4) · [Show double zero](?fn=dbl&x0=2&k=8)

</details>

## Ideas for the classroom

- **Use:** upper secondary, applications of differential calculus to polynomial functions (Newton’s method). The tangent equation from the previous unit is needed. $\cos x = x$ works well as an outlook.
- **Discovering the derivation:** first show “Next step” with values hidden (`show=0`), let the students label the slope triangle and derive the formula from it.
- **Heron and spreadsheets:** for $x^2 - 2$ you get exactly Heron’s method from year 9. Rebuild the method in a spreadsheet, compare it with the simulation and then race it against bisection.
- **Basins of attraction:** with “Colour the basins of attraction” students can investigate why starting values near the turning points become unpredictable – good as a project or for those who are interested.
- **Common stumbling blocks:**
  - Sign errors: it is $x_n \mathbin{-} \frac{f(x_n)}{f'(x_n)}$; brackets help when $f(x_n)$ or $f'(x_n)$ is negative.
  - The calculator is in degree mode instead of radians for $\cos x$.
  - Stopping too early: only when two approximations agree in the required digits is the result reliable. At a double zero even this can be misleading, because the values close in only slowly.
  - “The method always works” – horizontal tangent, jump and cycle show how important the starting value is.
