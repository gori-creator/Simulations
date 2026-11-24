---
description: "Solids of revolution: the area under a graph rotates about the x-axis, is cut into cylindrical discs, and the sum of the discs becomes the volume integral V = π∫f(x)² dx."
---

## What is it about?

If the area between the graph of a function $f$ and the $x$-axis on the interval $[a; b]$ rotates once completely about the $x$-axis, a **solid of revolution** is formed. A rectangle becomes a cylinder, a triangle a cone, a semicircle a sphere.

### Cross-section at x

If you cut the solid perpendicular to the axis at the point $x$, you see a **circle** with radius $|f(x)|$. Its area is

$$
A(x) = \pi \cdot \big(f(x)\big)^2 .
$$

### Disc method

If you divide $[a; b]$ into $n$ strips of equal width $\Delta x = \tfrac{b - a}{n}$, each strip becomes a thin **cylindrical disc** with radius $r_i$ and volume $\pi r_i^2 \cdot \Delta x$ when it rotates. The sum

$$
V_n = \sum_{i=1}^{n} \pi \, r_i^2 \cdot \Delta x
$$

approximates the volume. If you take as the radius the smallest value of $|f(x)|$ in the strip (inner discs), the sum lies below the volume; with the largest value of $|f(x)|$ (outer discs), above it – just like lower and upper sums. As $n \to \infty$ both tend to the same limit, the integral:

$$
V = \pi \int_a^b \big(f(x)\big)^2 \, dx .
$$

### Checking with known volume formulas

- $f(x) = r$ on $[0; h]$: $V = \pi \int_0^h r^2 \, dx = \pi r^2 h$ (cylinder).
- $f(x) = \tfrac{r}{h}x$ on $[0; h]$: $V = \pi \int_0^h \tfrac{r^2}{h^2}x^2 \, dx = \tfrac{1}{3}\pi r^2 h$ (cone).
- $f(x) = \sqrt{r^2 - x^2}$ on $[-r; r]$: $V = \pi \int_{-r}^{r} (r^2 - x^2) \, dx = \pi\left[r^2x - \tfrac{x^3}{3}\right]_{-r}^{r} = \tfrac{4}{3}\pi r^3$ (sphere).
- $f(x) = \sqrt{x}$ on $[0; 4]$: $V = \pi \int_0^4 x \, dx = 8\pi$ – exactly half of the surrounding cylinder $\pi \cdot 2^2 \cdot 4 = 16\pi$.

For the sine arch or the “horn” of $f(x) = \tfrac{1}{x}$ there is no formula from lower secondary – only the integral helps here.

## Try it

1. Choose “Rotate” and watch the green area sweep out the solid. Set the angle of rotation $\varphi$ to $90°$ and to $270°$: which parts of the sphere can you see? [Quarter turn](?phi=90)
2. Move the orange cross-section at the point $x$. Where is $A(x)$ largest, where is $A(x) = 0$? [Sphere with cross-section](?xs=1.5)
3. Cut the cone into 4 discs and compare “smallest radius (inside)” with “largest radius (outside)”. Double $n$ several times. [Cone in 4 discs](?fn=kegel&m=1&a=0&b=4&n=4&pt=lower&sep=1)
4. Pull the discs of the paraboloid apart and back together. Why is the midpoint sum with only 8 discs already exact here? [Paraboloid](?fn=para&k=1&a=0&b=4&n=8&sep=1)
5. Drag the green handle in the side view until $m$ is twice as large ($m = 1$): then $f$ is doubled too. How does the volume change? [Cone](?fn=kegel&m=0.5&a=0&b=4)
6. Gabriel's horn: push $b$ further and further to the right. Does the volume grow without limit? [Horn](?fn=horn&k=1&a=1&b=10)

## Exercises

### Exercise 1: Cone

The line $f(x) = 0.5x$ rotates about the $x$-axis on $[0; 4]$. Calculate the volume with the integral and check with the cone formula. [Load exercise](?fn=kegel&m=0.5&a=0&b=4&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \pi \int_0^4 0.25x^2 \, dx = \pi \left[\tfrac{x^3}{12}\right]_0^4 = \tfrac{16}{3}\pi \approx 16.76$. Check: $r = f(4) = 2$, $h = 4$, $V = \tfrac{1}{3}\pi \cdot 2^2 \cdot 4 = \tfrac{16}{3}\pi$.

[Show in the simulation](?fn=kegel&m=0.5&a=0&b=4)

</details>

### Exercise 2: Volume of a sphere

Use $f(x) = \sqrt{9 - x^2}$ to derive the volume of a sphere with $r = 3$. [Load exercise](?r=3&a=-3&b=3&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \pi \int_{-3}^{3} (9 - x^2) \, dx = \pi \left[9x - \tfrac{x^3}{3}\right]_{-3}^{3} = \pi\,(18 - (-18)) = 36\pi \approx 113.10$, matching $\tfrac{4}{3}\pi \cdot 3^3 = 36\pi$.

[Show in the simulation](?r=3&a=-3&b=3)

</details>

### Exercise 3: Inner and outer discs

Replace the cone of $f(x) = x$ on $[0; 4]$ by 4 inner and by 4 outer cylindrical discs. Calculate both sums and the exact volume. [Load exercise](?fn=kegel&m=1&a=0&b=4&n=4&pt=lower&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta x = 1$. Inside: $\pi(0^2 + 1^2 + 2^2 + 3^2) = 14\pi \approx 43.98$. Outside: $\pi(1^2 + 2^2 + 3^2 + 4^2) = 30\pi \approx 94.25$. Exact: $\pi \int_0^4 x^2 \, dx = \tfrac{64}{3}\pi \approx 67.02$ – it lies between the two sums.

[Show in the simulation](?fn=kegel&m=1&a=0&b=4&n=4&pt=upper)

</details>

### Exercise 4: Spindle

The sine arch $f(x) = \sin x$ on $[0; \pi]$ rotates about the $x$-axis. Calculate the volume. Hint: $\sin^2 x = \tfrac{1}{2}(1 - \cos 2x)$. [Load exercise](?fn=sin&k=1&a=0&b=3.15&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \pi \int_0^\pi \sin^2 x \, dx = \pi \left[\tfrac{x}{2} - \tfrac{\sin 2x}{4}\right]_0^\pi = \tfrac{\pi^2}{2} \approx 4.93$.

[Show in the simulation](?fn=sin&k=1&a=0&b=3.15)

</details>

### Exercise 5: Spherical cap

A sphere with $r = 2$ is cut off at $x = 1$. Calculate the volume of the smaller part with the integral and with the formula $V = \tfrac{1}{3}\pi h^2 (3r - h)$. [Load exercise](?r=2&a=1&b=2&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \pi \int_1^2 (4 - x^2) \, dx = \pi\left[4x - \tfrac{x^3}{3}\right]_1^2 = \pi\left(\tfrac{16}{3} - \tfrac{11}{3}\right) = \tfrac{5}{3}\pi \approx 5.24$. Formula with $h = 1$: $\tfrac{1}{3}\pi \cdot 1 \cdot 5 = \tfrac{5}{3}\pi$.

[Show in the simulation](?r=2&a=1&b=2)

</details>

### Exercise 6: Gabriel's horn

Calculate the volume for $f(x) = \tfrac{1}{x}$ on $[1; b]$ and investigate $b \to \infty$. [Load exercise](?fn=horn&k=1&a=1&b=10&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$V(b) = \pi \int_1^b \tfrac{1}{x^2} \, dx = \pi\left(1 - \tfrac{1}{b}\right)$, so for $b = 10$ it is $0.9\pi \approx 2.83$. As $b \to \infty$, $V \to \pi$: the infinitely long solid has a finite volume.

[Show in the simulation](?fn=horn&k=1&a=1&b=10)

</details>

## Ideas for the classroom

- **Use:** upper secondary, integral calculus (applications of the integral); depending on the curriculum, solids of revolution are an extension or an outlook. Suitable as a starter (rotating the area), for deriving the formula via the sum of discs and for checking known volume formulas from lower secondary.
- **Model:** the discs are cylinders of thickness $\Delta x$; the radius is either the function value in the middle of the strip, or the smallest or largest value in the strip. The side view shows the graph with the corresponding rectangles and their mirror image (longitudinal section). Limits outside the domain are adjusted (e.g. at most $\pi$ for the sine).
- **Common pitfalls:**
  - “$V = \pi \int_a^b f(x) \, dx$” – the radius is squared because the cross-section is the circle area $\pi f(x)^2$; doubling $f$ multiplies the volume by 4.
  - “$V = \left(\pi \int_a^b f(x)\,dx\right)^2$” – it is the integrand that is squared, not the integral.
  - “If the graph lies below the $x$-axis, the volume becomes negative.” – $f(x)^2 \geq 0$, so the volume is always positive.
  - Gabriel's horn: the volume is finite ($\pi$), but the surface area is infinite – a nice reason to talk about limits.
