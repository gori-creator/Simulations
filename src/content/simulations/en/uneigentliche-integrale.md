## What is it about?

A definite integral $\int_a^b f(x)\,dx$ measures an area between two fixed limits. But what if the area is **infinitely long** or **infinitely high**? Then it is called an **improper integral**. You work with a moving limit and check whether a **limit value** exists.

### Type 1: Unbounded interval

$$\int_1^{\infty} f(x)\,dx = \lim_{b \to \infty} \int_1^{b} f(x)\,dx$$

Example $f(x) = \tfrac{1}{x^2}$:

$$\int_1^{b} \frac{1}{x^2}\,dx = \Big[-\frac{1}{x}\Big]_1^b = 1 - \frac{1}{b} \;\xrightarrow{\;b \to \infty\;}\; 1$$

The area stretches infinitely far to the right and still has a size of exactly $1$. The integral **converges**.

It is quite different for $f(x) = \tfrac{1}{x}$. Here $\int_1^b \tfrac{1}{x}\,dx = \ln b$, which grows without bound. The integral **diverges**, even though this curve also tends to $0$. It just does so too slowly.

In general, $\int_1^{\infty} x^{-p}\,dx$ converges exactly when $p > 1$, and its value is then $\tfrac{1}{p-1}$.

$\int_0^{\infty} e^{-x}\,dx = \lim_{b \to \infty} (1 - e^{-b}) = 1$ also converges, because the exponential function falls very quickly.

### Type 2: Unbounded function (pole)

If $f$ has a pole at one of the limits, replace that limit by $\varepsilon$ and let $\varepsilon$ approach the pole:

$$\int_0^{1} \frac{1}{\sqrt{x}}\,dx = \lim_{\varepsilon \to 0} \Big[2\sqrt{x}\Big]_\varepsilon^1 = \lim_{\varepsilon \to 0} (2 - 2\sqrt{\varepsilon}) = 2$$

The area is infinitely high and still has a size of $2$. For $\int_0^1 x^{-p}\,dx$ it is exactly the other way round from type 1: it converges when $p < 1$, and its value is then $\tfrac{1}{1-p}$.

### The lower chart

It shows the integral value as a function of the limit. The horizontal axis shows $\lg b$ or $\lg \varepsilon$, so a step of $1$ multiplies or divides the limit by ten. If the curve approaches a horizontal line, the integral converges and the line is its value.

## Try it

- [1/x²](?typ=unendlich&p=2&lb=1): Move b up to 10,000. How close does the value get to 1?
- [1/x](?typ=unendlich&p=1&lb=2): How does the value change when b becomes ten times larger?
- [1/√x at 0](?typ=polstelle&p=0.5&le=-2): Push ε towards 0. What happens for p = 1 and for p = 2?
- [e^(−x)](?typ=exp&lb=0.5): How quickly does the area get close to 1?

## Exercises

**1. Checking convergence.** Calculate $\int_1^{\infty} x^{-3}\,dx$. [Load exercise](?typ=unendlich&p=3&lb=1&_hide=1)

<details><summary>Show solution</summary>

$\int_1^b x^{-3}\,dx = \big[-\tfrac{1}{2x^2}\big]_1^b = \tfrac12 - \tfrac{1}{2b^2} \to \tfrac12$.

</details>

**2. Divergence.** Show that $\int_1^{\infty} \tfrac{1}{\sqrt{x}}\,dx$ diverges. [Load exercise](?typ=unendlich&p=0.5&lb=2&_hide=1)

<details><summary>Show solution</summary>

$\int_1^b x^{-1/2}\,dx = 2\sqrt{b} - 2$, which grows without bound as $b \to \infty$.

</details>

**3. Pole.** Calculate $\int_0^1 x^{-0.75}\,dx$. [Load exercise](?typ=polstelle&p=0.75&le=-3&_hide=1)

<details><summary>Show solution</summary>

$\big[4\,x^{0.25}\big]_\varepsilon^1 = 4 - 4\,\varepsilon^{0.25} \to 4$.

</details>

**4. Gabriel's horn.** Rotating $y = \tfrac1x$ for $x \ge 1$ about the $x$-axis gives a volume $\pi\int_1^\infty \tfrac{1}{x^2}\,dx$ that is finite. How large is it?

<details><summary>Show solution</summary>

$V = \pi \cdot 1 = \pi$. The surface area of this solid, on the other hand, is infinite. This is a famous paradox.

</details>
