---
description: "Solids of revolution: the region under a graph turns about the x-axis, is cut into cylindrical discs, and the sum of discs becomes the volume integral V = π∫f(x)² dx."
---

## What is it about?

If the region between the graph of $f$ and the $x$-axis on $[a, b]$ turns once about the $x$-axis, a **solid of revolution** appears: a rectangle gives a cylinder, a triangle a cone, a semicircle a sphere.

The cross-section at $x$ is a circle with radius $|f(x)|$ and area $A(x) = \pi \big(f(x)\big)^2$. Cutting $[a, b]$ into $n$ strips of width $\Delta x$ gives $n$ cylindrical discs with total volume $V_n = \sum \pi r_i^2 \, \Delta x$. With inner discs the sum is too small, with outer discs too large; for $n \to \infty$ both tend to

$$
V = \pi \int_a^b \big(f(x)\big)^2 \, dx .
$$

Checks: $f(x) = \sqrt{r^2 - x^2}$ on $[-r, r]$ gives $\tfrac{4}{3}\pi r^3$, $f(x) = \tfrac{r}{h}x$ on $[0, h]$ gives $\tfrac{1}{3}\pi r^2 h$, $f(x) = \sqrt{x}$ on $[0, 4]$ gives $8\pi$.

## Try it

1. Press “Rotate” and watch the green region sweep out the solid. [Quarter turn](?phi=90)
2. Move the orange cross-section. Where is $A(x)$ largest? [Sphere](?xs=1.5)
3. Cut the cone into 4 inner discs, then outer discs, and double $n$. [Cone, 4 discs](?fn=kegel&m=1&a=0&b=4&n=4&pt=lower&sep=1)
4. Gabriel’s horn: move $b$ further and further to the right. [Horn](?fn=horn&k=1&a=1&b=10)

## Tasks

### Task 1: Cone

$f(x) = 0.5x$ turns about the $x$-axis on $[0, 4]$. Find the volume and check it with the cone formula. [Load task](?fn=kegel&m=0.5&a=0&b=4&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \pi \int_0^4 0.25x^2 \, dx = \tfrac{16}{3}\pi \approx 16.76$; cone: $\tfrac{1}{3}\pi \cdot 2^2 \cdot 4 = \tfrac{16}{3}\pi$.

</details>

### Task 2: Sphere

Use $f(x) = \sqrt{9 - x^2}$ to find the volume of a sphere with $r = 3$. [Load task](?r=3&a=-3&b=3&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \pi \int_{-3}^{3} (9 - x^2) \, dx = 36\pi \approx 113.10 = \tfrac{4}{3}\pi \cdot 3^3$.

</details>

### Task 3: Gabriel’s horn

Find the volume for $f(x) = \tfrac{1}{x}$ on $[1, b]$ and let $b \to \infty$. [Load task](?fn=horn&k=1&a=1&b=10&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$V(b) = \pi\left(1 - \tfrac{1}{b}\right)$, so $V(10) = 0.9\pi \approx 2.83$ and $V \to \pi$: an infinitely long solid with finite volume.

</details>

## Notes for teachers

- Year 13, applications of the integral; links to the volume formulas from year 10. Disc radius: midpoint value, smallest or largest value in each strip.
- Typical mistakes: forgetting to square $f$ (doubling $f$ multiplies the volume by 4), squaring the integral instead of the integrand, expecting negative volumes for graphs below the axis.
