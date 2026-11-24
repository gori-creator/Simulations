## What is it about?

Every exponential function $f(x) = b^x$ with $b > 1$ grows – and the larger its value already is, the faster it grows. More precisely: the **derivative** is a fixed multiple of the function itself,

$$
f(x) = b^x \quad\Longrightarrow\quad f'(x) = \ln b \cdot b^x, \qquad \frac{f'(x)}{f(x)} = \ln b \;\text{ for all } x.
$$

For $b = 2$ the factor is $\ln 2 \approx 0.693$: the graph of $f'$ lies **below** that of $f$. For $b = 3$ it is $\ln 3 \approx 1.099$: $f'$ lies **above** $f$. In between there is exactly one base for which the factor is $1$ – **Euler’s number**

$$
e = 2.718281828\ldots \qquad\text{with}\qquad (e^x)' = e^x .
$$

The function $f(x) = e^x$ is called the **natural exponential function**. It is its own derivative: at every point the slope is as large as the function value. At the point $(0, 1)$ its graph has slope $1$; the tangent there is $y = x + 1$.

**Tangent and slope triangle.** The tangent at the point $P(x_0, e^{x_0})$ is

$$
t:\; y = e^{x_0} \cdot (x - x_0 + 1).
$$

It always crosses the $x$-axis at $x_0 - 1$. So the triangle formed by this intersection, the foot $(x_0, 0)$ and $P$ has **base 1** and **height $f(x_0)$** – its slope is exactly the function value.

**Where does e come from?** If you invest $1$ euro at $100\%$ annual interest and compound $n$ times a year at $\frac{100\%}{n}$ each time, after one year you have

$$
\left(1 + \frac{1}{n}\right)^{n} \text{ euros}: \quad n = 1:\ 2, \quad n = 12:\ 2.6130, \quad n = 365:\ 2.7146 .
$$

The sequence grows but stays below $e$ and gets arbitrarily close to $e$.

**Profile of $f(x) = e^x$:** $D = \mathbb{R}$, range $\mathbb{R}^+$, no zero, $y$-intercept $(0, 1)$, asymptote $y = 0$ for $x \to -\infty$, strictly increasing, concave up, $f' = f$, antiderivative $F(x) = e^x + C$. The **inverse function** is the natural logarithm $\ln x$: $\ln(e^x) = x$ and $e^{\ln x} = x$ for $x > 0$; its graph is obtained by reflection in $y = x$.

## Try it

1. Slowly drag the point $(1, b)$ upwards. Watch the red dashed derivative and the table of values: the last column $f' : f$ is the same in every row. [Load example](?b=2)
2. Set $b = 3$. Does $f'$ now lie above or below $f$? Compare with the slope of the orange tangent at $(0, 1)$. [Load example](?b=3)
3. Click **Search for base e**: the base runs from $1.5$ to $4$ and back again. At $b = e$ it snaps into place, and the graphs of $f$ and $f'$ coincide. [Load example](?b=2.72)
4. Switch to **Tangent** and drag $P$. Where does the tangent cross the $x$-axis? How tall is the slope triangle? [Load example](?view=tangent&x0=1)
5. Click **Move the point along** and watch the base of the triangle.
6. Switch on the **inverse function**: the graph of $e^x$ flips over $y = x$ onto the graph of $\ln x$, and $P(1, e)$ becomes $P'(e, 1)$. [Load example](?view=tangent&x0=1&inv=1)
7. Switch to **Where e comes from** and click **Let n grow**. How many decimal places of $e$ are correct at $n = 1000$, and how many at $n = 1\,000\,000$? [Load example](?view=limit&ns=0)

## Exercises

### Exercise 1: Derivative of 2ˣ

Use the slope triangle on the tangent at $(0, 1)$ to find the slope of the graph of $f(x) = 2^x$ at $0$. Use it to calculate $f'(1)$ and $f'(3)$. [Load exercise](?b=2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

The triangle has base $1$ and height $\ln 2 \approx 0.69$, so $f'(0) = \ln 2 \approx 0.693$. Because $f'(x) = \ln 2 \cdot 2^x$, $f'(1) = 2 \ln 2 \approx 1.386$ and $f'(3) = 8 \ln 2 \approx 5.545$. [Show in the simulation](?b=2)

</details>

### Exercise 2: Larger or smaller?

Without a calculator: does the graph of the derivative of $f(x) = 3^x$ lie above or below that of $f$? Explain using the position of $3$ and $e$.

<details>
<summary>Show solution</summary>

$3 > e$, so $\ln 3 > \ln e = 1$. Hence $f'(x) = \ln 3 \cdot 3^x > 3^x = f(x)$ for all $x$: the graph of $f'$ lies **above** that of $f$ everywhere (factor $\ln 3 \approx 1.099$). [Show in the simulation](?b=3)

</details>

### Exercise 3: Tangent at 2

Set up the equation of the tangent to $y = e^x$ at the point $P(2, e^2)$ and find its zero. [Load exercise](?view=tangent&x0=2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$m = f'(2) = e^2 \approx 7.389$. $t: y = e^2 \cdot (x - 2 + 1) = e^2 \cdot (x - 1) \approx 7.389x - 7.389$. Zero: $x = 1 = x_0 - 1$. [Show in the simulation](?view=tangent&x0=2)

</details>

### Exercise 4: Tangent through the origin

At which point $P$ does the tangent to $y = e^x$ pass through the origin? Give its equation.

<details>
<summary>Show solution</summary>

The tangent crosses the $x$-axis at $x_0 - 1$. This is $0$ for $x_0 = 1$, so $P(1, e)$ and $t: y = e \cdot x \approx 2.718x$. [Show in the simulation](?view=tangent&x0=1)

</details>

### Exercise 5: Compound interest

a) Calculate $\left(1 + \frac{1}{4}\right)^4$ (quarterly compounding) and compare with $n = 12$.
b) By how much is daily compounding ($n = 365$) still below $e$?
c) More realistic: $5\%$ annual interest, compounded monthly. Compare $\left(1 + \frac{0.05}{12}\right)^{12}$ with $e^{0.05}$.

<details>
<summary>Show solution</summary>

a) $1.25^4 = 2.4414$; for $n = 12$ it is $2.6130$. [Show](?view=limit&ns=3)

b) $e - 2.7146 \approx 0.0037$. [Show](?view=limit&ns=19)

c) $\left(1 + \frac{0.05}{12}\right)^{12} \approx 1.05116$ and $e^{0.05} \approx 1.05127$: $1000$ euros become $1051.16$ euros, or $1051.27$ euros with “continuous” compounding – the difference is very small. (This part is done by hand; the simulation only shows $100\%$.)

</details>

### Exercise 6: Reflecting

The point $P(2, e^2)$ lies on the graph of $e^x$. Which point then lies on the graph of $\ln x$? Use it to approximate $\ln(7.389)$. [Load exercise](?view=tangent&x0=2&inv=1&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Reflecting in $y = x$ swaps the coordinates: $P'(e^2, 2) \approx (7.389, 2)$, so $\ln(7.389) \approx 2$ (exactly: $\ln(e^2) = 2$). [Show in the simulation](?view=tangent&x0=2&inv=1)

</details>

## Ideas for the classroom

- **Use:** upper secondary, natural exponential function. The view “The special base” works well as an introduction: the question “Is there an exponential function that equals its derivative?” can be explored by dragging the point $(1, b)$ before $e$ is named.
- **Derivative of $b^x$:** the formula $f'(x) = \ln b \cdot b^x$ requires the chain rule ($b^x = e^{x \ln b}$). Without it, the constant factor can also be discovered purely numerically: the table of values calculates $f'$ with the difference quotient.
- **Compound interest:** the view “Where e comes from” shows a concrete meaning of $e$ (continuous compounding). That the sequence $\left(1 + \frac{1}{n}\right)^n$ really converges to $e$ is only made visible here, not proved.
- **Common pitfalls:**
  - “$e^x$ and $x^e$ are the same.” – In $e^x$ the variable is in the exponent; $(x^e)' = e \cdot x^{e-1}$.
  - “The derivative of $2^x$ is $x \cdot 2^{x-1}$.” – The power rule only holds for $x^n$, not for exponential functions.
  - “The graph of $e^x$ crosses the $x$-axis at some point.” – $e^x > 0$ for all $x$; the $x$-axis is an asymptote.
  - When reflecting in $y = x$, students often reflect in the $x$-axis instead; the inverse function swaps $x$ and $y$.
- **Exercise mode:** with `info=0` and **Share → Hide results (for exercises)**, values in the picture and in the results are hidden; graphs, tangent and triangle stay visible for reading off.
