## What is it about?

If you keep the lower limit $a$ fixed and let the upper limit $x$ vary, the integral becomes a function of $x$, the **integral function**

$$I_a(x) = \int_a^x f(t)\,dt.$$

It measures the **signed area** between the graph of $f$ and the $x$-axis: parts above count positive (green), parts below negative (red). Always $I_a(a) = 0$. If $x < a$, you count “backwards” and the sign flips. The **total area**, on the other hand, is $A^+ + A^-$.

**Fundamental theorem of calculus** (for continuous $f$):

1. $I_a'(x) = f(x)$. If $x$ grows by $h$, a strip is added. Its area is $I_a(x+h) - I_a(x)$, and its **mean height** lies between the smallest and the largest function value on the strip:
$$\min f \;\le\; \frac{I_a(x+h) - I_a(x)}{h} \;\le\; \max f.$$
As $h \to 0$, $\min f$ and $\max f$ both move towards $f(x)$ – the secant slope of $I_a$ becomes the tangent slope $f(x)$.
2. If $F$ is any antiderivative of $f$, then
$$\int_a^b f(x)\,dx = F(b) - F(a) = \bigl[F(x)\bigr]_a^b.$$
A constant $C$ cancels: $(F(b) + C) - (F(a) + C) = F(b) - F(a)$.

**Consequences for the graph of $I_a$:** where $f > 0$, $I_a$ increases; where $f < 0$, $I_a$ decreases. Zeros of $f$ with a change of sign are extreme points of $I_a$, extreme points of $f$ are inflection points of $I_a$. A different $a$ only shifts the graph vertically: $I_b(x) = I_a(x) - I_a(b)$.

**Riemann sums:** if you divide $[a; b]$ into $n$ strips of width $h = \frac{b-a}{n}$, the sum of the rectangle or trapezoid areas approximates the integral. As $n \to \infty$ they all tend to $\int_a^b f(x)\,dx$ – the midpoint and trapezoidal sums particularly fast.

**Applications:** integrating a **rate of change** gives the **total change of the amount**: speed → distance, inflow → amount of water, power → energy, marginal cost → cost, growth rate → increase, absorption rate → amount of drug, rain intensity → amount of rain, airflow → volume of air.

## Try it

1. [Parabola](?mode=area&a=-1&x=2): press “Let the area grow” and watch the orange graph of $I_{-1}$ grow along. Where does it increase, where does it decrease?
2. Drag $x$ to the left of $a$. Why does the sign change, even though the area looks the same?
3. [Strip h → 0](?mode=diff&x=2&h=1): press “Let h tend to 0”. What happens to the secant below, and to min and max above? Compare the table.
4. [Working](?mode=calc&fn=sin&a=0&x=3.14): run “Working step by step”. Then change the constant $C$ – why does the result stay the same?
5. [Cubic polynomial](?mode=graph&k3=0.25&k2=0&k1=-1&k0=0&a=-3&x=3): find the maxima, minima and inflection points of $I_{-3}$ in the graph of $f$. Press “Move the lower limit a”.
6. [Jump](?fn=step&a=-2&x=3): $I$ is continuous but has a kink at the jump – it is not differentiable there.
7. [Riemann sums for x²](?mode=riem&k2=1&k0=0&a=0&x=2&n=4): switch between left, right, midpoint and trapezoid, then “Refine the strips”.
8. Applications: [car](?kind=app&app=car&a=0&x=25), [solar panels](?kind=app&app=solar&a=0&x=24), [reservoir](?mode=graph&kind=app&app=lake&a=0&x=12), [medicine](?mode=graph&kind=app&app=drug&a=0&x=8), [thunderstorm](?mode=riem&kind=app&app=rain&a=0&x=6&n=6&rm=mid), [breath](?kind=app&app=breath&a=0&x=5). What does the area mean in each case, and what unit does it have?

## Exercises

### Exercise 1: Calculating with an antiderivative

Calculate $\int_{-1}^{2} (0.5x^2 - 1)\,dx$ and the area between the graph and the $x$-axis on $[-1; 2]$. [Load exercise](?mode=calc&a=-1&x=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$F(x) = \frac{1}{6}x^3 - x$; $F(2) - F(-1) = \left(\frac{8}{6} - 2\right) - \left(-\frac{1}{6} + 1\right) = -\frac{2}{3} - \frac{5}{6} = -1.5$. Zero at $\sqrt{2}$: $A^- = |F(\sqrt 2) - F(-1)| = \frac{2\sqrt2}{3} + \frac56 \approx 1.776$, $A^+ = F(2) - F(\sqrt 2) \approx 0.276$, total area $\approx 2.052$. [Show the solution](?mode=area&a=-1&x=2)

</details>

### Exercise 2: Two famous integrals

Calculate $\int_0^{\pi} \sin x\,dx$ and $\int_1^{e} \frac{1}{x}\,dx$. [Load exercise](?mode=calc&fn=sin&a=0&x=3.14&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$[-\cos x]_0^{\pi} = -\cos\pi + \cos 0 = 1 + 1 = 2$. $[\ln x]_1^{e} = \ln e - \ln 1 = 1$. [Show sine](?mode=calc&fn=sin&a=0&x=3.14) · [Show 1/x](?mode=calc&fn=inv&a=1&x=2.72)

</details>

### Exercise 3: Investigating the integral function

Where does $I_{-1}(x) = \int_{-1}^x (0.5t^2 - 1)\,dt$ have extreme points and inflection points? [Load exercise](?mode=graph&a=-1&x=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$I_{-1}'(x) = f(x) = 0.5x^2 - 1 = 0 \Rightarrow x = \pm\sqrt{2}$. At $-\sqrt2$, $f$ changes from $+$ to $-$: maximum; at $\sqrt2$ from $-$ to $+$: minimum. $f$ has its minimum at $x = 0$, so $I_{-1}$ has an inflection point there. [Show](?mode=graph&a=-1&x=2)

</details>

### Exercise 4: How far does the car go?

A car accelerates for 5 s with $v(t) = 3t$ (in m/s), then drives for 15 s at $15\,\tfrac{\text{m}}{\text{s}}$ and brakes uniformly to a stop in 5 s. Calculate the distance. [Load exercise](?kind=app&app=car&a=0&x=25&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Triangle $\frac12 \cdot 5 \cdot 15 = 37.5\,\text{m}$, rectangle $15 \cdot 15 = 225\,\text{m}$, triangle $37.5\,\text{m}$; together $300\,\text{m}$. [Show](?kind=app&app=car&a=0&x=25)

</details>

### Exercise 5: Marginal cost and fixed cost

The marginal cost is $K'(x) = 0.3x^2 - 3x + 10$ (money units per quantity unit), the fixed cost $20$ money units. Find $K(10)$ and the point where $K$ changes from concave to convex. [Load exercise](?mode=calc&kind=app&app=cost&a=0&x=10&c=20&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$K(x) = 0.1x^3 - 1.5x^2 + 10x + 20$, so $K(10) = 100 - 150 + 100 + 20 = 70$ (of which $50$ are variable costs). $K''(x) = 0.6x - 3 = 0 \Rightarrow x = 5$: at the minimum of the marginal cost, $K$ has its inflection point. [Show](?mode=calc&kind=app&app=cost&a=0&x=10&c=20)

</details>

### Exercise 6: Riemann sums

For $f(x) = x^2$ on $[0; 2]$ with $n = 4$, calculate the left, right, midpoint and trapezoidal sums and compare with the integral. [Load exercise](?mode=riem&k2=1&k0=0&a=0&x=2&n=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$h = 0.5$. Left: $0.5 \cdot (0 + 0.25 + 1 + 2.25) = 1.75$; right: $0.5 \cdot (0.25 + 1 + 2.25 + 4) = 3.75$; midpoint: $0.5 \cdot (0.0625 + 0.5625 + 1.5625 + 3.0625) = 2.625$; trapezoid: $\frac{1.75 + 3.75}{2} = 2.75$. Exact: $\frac{8}{3} \approx 2.667$ – the midpoint sum is only half as far off as the trapezoidal sum. [Show](?mode=riem&k2=1&k0=0&a=0&x=2&n=4)

</details>

## Ideas for the classroom

- **Use:** upper secondary (integral function, fundamental theorem, signed area), plus first-year university analysis. The views can be used as a sequence: integral function → derivative (idea of proof) → evaluating → curve sketching of $I_a$ → Riemann sums as an outlook or revision.
- **Applications:** the eight examples show “integrating a rate of change gives the change in the amount”, with units (m/s · s = m, kW · h = kWh). Good for group work: each group presents one application and interprets the zeros and extrema of $f$ in context.
- **Exercises from the picture:** with “Show values” switched off (`show=0`), the pictures work as calculation tasks.
- **Common pitfalls:**
  - Integral and area are confused when $f$ changes sign.
  - Integral function and antiderivative are treated as the same: every integral function has a zero, but $F(x) = x^2 + 1$ for $f(x) = 2x$ has none.
  - In $F(b) - F(a)$ the order is swapped, or the bracket is forgotten when $F(a)$ is negative.
  - The fundamental theorem requires continuity – at a jump, $I$ has a kink.
