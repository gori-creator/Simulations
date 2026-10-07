---
description: Interactive simulation of lower and upper sums – the integral as the limit of rectangle sums and as signed area.
---

## What is it about?

Split $[a; b]$ into $n$ strips of width $\Delta x = \frac{b-a}{n}$. The **lower sum** uses the smallest, the **upper sum** the largest function value in each strip; the area lies in between. As $n \to \infty$ both converge to the integral:

$$
\int_a^b f(x)\,\mathrm{d}x = \lim_{n \to \infty} U_n = \lim_{n \to \infty} O_n
$$

Areas below the x-axis count negatively (**signed area**).

## Try it

1. Press **Double n** several times.
2. Drag the limits $a$ and $b$.
3. Sine from $0$ to $2\pi$. [Signed area](?fn=sin&a=0&b=6.3&kind=mid&n=12)

## Exercises

### Exercise 1: By hand

Compute lower and upper sum of $x^2$ on $[0; 2]$ with $n = 4$. [Load exercise](?_hide=1)

<details>
<summary>Show solution</summary>

$U_4 = 1.75$, $O_4 = 3.75$; exact value $\frac{8}{3}$.

</details>

## Notes for teachers

- **Use:** Grade 12/13 (definite integral).
- **Misconception:** integral and area are the same even when the graph goes below the x-axis.
