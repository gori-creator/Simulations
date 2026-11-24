## What is it about?

The area between a graph and the x-axis can be approximated with **rectangles**. You split the interval $[a; b]$ into $n$ strips of equal width $\Delta x = \frac{b - a}{n}$.

- **Lower sum** $U_n$: each rectangle is as tall as the **smallest** function value in its strip.
- **Upper sum** $O_n$: each rectangle is as tall as the **largest** function value in its strip.

The integral always lies in between: $U_n \leq \int_a^b f(x)\,\mathrm{d}x \leq O_n$ (for $f \geq 0$ this is the area). As $n$ grows, both sums move closer together; their common limit is the **integral**:

$$
\int_a^b f(x)\,\mathrm{d}x = \lim_{n \to \infty} U_n = \lim_{n \to \infty} O_n
$$

**Signed area:** areas **below** the x-axis count **negatively**. That is why the integral of $\sin x$ over $[0; 2\pi]$ is $0$, even though the area is not zero.

Other approximations: left, right and midpoint sums (height at the left edge, the right edge or in the middle) and the **trapezoidal sum**.

## Try it

1. Press **Double n** several times and watch the lower and upper sums move together.
2. Drag the limits $a$ and $b$ along the x-axis.
3. Choose $\sin x$ from $0$ to $2\pi$. Why is the sum almost zero? [Signed area](?fn=sin&a=0&b=6.3&kind=mid&n=12)
4. Compare the midpoint sum and the trapezoidal sum. Which one is more accurate for the same $n$? [Trapezoidal sum](?fn=sqrt&a=0&b=9&kind=trapez&n=6)

## Exercises

### Exercise 1: By hand

For $f(x) = x^2$ on $[0; 2]$ with $n = 4$, calculate the lower and the upper sum. [Load exercise](?_hide=1)

<details>
<summary>Show solution</summary>

$\Delta x = 0.5$. Because $f$ increases on $[0; 2]$, the minimum of each strip is on the left and the maximum on the right:

$$U_4 = 0.5 \cdot (0 + 0.25 + 1 + 2.25) = 1.75 \qquad O_4 = 0.5 \cdot (0.25 + 1 + 2.25 + 4) = 3.75$$

The exact value is $\frac{8}{3} \approx 2.67$.

</details>

### Exercise 2: How many strips?

For increasing functions $O_n - U_n = \Delta x \cdot (f(b) - f(a))$. How large must $n$ be for $f(x) = x^2$ on $[0; 2]$ so that $O_n - U_n < 0.1$?

<details>
<summary>Show solution</summary>

$O_n - U_n = \frac{2}{n} \cdot (4 - 0) = \frac{8}{n} < 0.1 \Rightarrow n > 80$, so at least $n = 81$. For example $n = 128$: $\frac{8}{128} = 0.0625$. [Show in the simulation](?n=128)

</details>

### Exercise 3: Areas below the x-axis

Calculate $\int_{-2}^{3} (0.5x^3 - 2x)\,\mathrm{d}x$ using the antiderivative $F(x) = 0.125x^4 - x^2$ and compare with the simulation. Why is this not the size of the enclosed area?

<details>
<summary>Show solution</summary>

$F(3) - F(-2) = (10.125 - 9) - (2 - 4) = 3.125$. Parts of the graph lie below the x-axis; these areas are subtracted. For the area you would have to split at the zeros and add the absolute values. [Show in the simulation](?fn=cubic&a=-2&b=3&kind=mid&n=10)

</details>

## Ideas for the classroom

- **Use:** upper secondary (area and definite integral, often at the higher level); also for introducing the idea of an integral in general.
- **Animation:** when you double or halve $n$, the new rectangles grow out of the old ones. The table shows the sums for $n = 4$ to $128$.
- **About the calculation:** the minimum and maximum of each strip are found exactly: the simulation compares the function values at the edges of the strip and at the points with $f'(x) = 0$ inside it.
- **Common stumbling blocks:**
  - Treating the integral and the area as the same, even when the graph goes below the x-axis.
  - “Lower sum = left sum” only holds for increasing functions.
