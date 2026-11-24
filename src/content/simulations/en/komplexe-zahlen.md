---
description: "Complex numbers in the complex plane: adding as shifting, multiplying as rotating and stretching, polar form, solutions of z² = −4 and zⁿ = w, and the representation as a 2×2 matrix."
---

## What is it about?

The equation $x^2 = -4$ has no real solution. With a new number $i$ for which $i^2 = -1$, this changes: $(2i)^2 = 4 \cdot i^2 = -4$, so $\pm 2i$ are the solutions.

A **complex number** $z = a + b\,i$ consists of the **real part** $a$ and the **imaginary part** $b$. In the **complex plane** (Argand diagram) it is the point $(a \mid b)$ – or the arrow from the origin to it.

**Calculating:**

- **Adding** means joining arrows end to end: $(2 + i) + (1 + 3i) = 3 + 4i$.
- **Multiplying** works like expanding brackets, with $i^2 = -1$: $(1 + i)(1 - i) = 1 - i^2 = 2$ and $(1 + i)^2 = 1 + 2i + i^2 = 2i$.
- Geometrically, multiplying is a **rotation with stretching**: the moduli are multiplied, the angles added. Multiplying by $i$ rotates by $90°$.
- **Dividing:** multiply top and bottom by the conjugate of the denominator $\bar w$; then the denominator is real.

**Polar form:** every number can be given by its distance from the origin, the **modulus** $r = |z| = \sqrt{a^2 + b^2}$, and its angle, the **argument** $\varphi$:

$$
z = r\,(\cos\varphi + i\sin\varphi) = r\,e^{i\varphi}.
$$

Example: $|3 + 4i| = 5$ and $\varphi \approx 53.13°$.

**Equations:** the quadratic formula also works with a negative discriminant, because $\sqrt{-16} = 4i$. So $z^2 - 2z + 5 = 0$ has the solutions $1 \pm 2i$. The equation $z^n = w$ has exactly $n$ solutions. They lie on a circle as the vertices of a regular $n$-gon.

**Matrices:** the number $a + bi$ acts like the matrix $\begin{pmatrix} a & -b \\ b & a \end{pmatrix}$: it rotates by $\varphi$ and stretches by $r$. The product of two such matrices belongs to the product of the numbers.

## Try it

1. Drag $w$ to $i$. What happens to $z$ with “z · w”? [Times i](?mode=ops&op=mul&z=3%20%2B%20i&w=i)
2. Calculate $(1 + i)(1 - i)$ and $(1 + i)^2$ and watch the angles. [Product](?mode=ops&op=mul&z=1%20%2B%20i&w=1%20-%20i)
3. Powers of $1.1 \cdot e^{i \cdot 30°}$ form a spiral. After how many steps are you back on the positive real axis? [Spiral](?mode=ops&op=pow&z=1%2C1%E2%88%A030%C2%B0&n=12)
4. In $z^2 + pz + q = 0$, change $q$ from $0$ to $4$. When do the solutions stop being real? [Equation](?mode=equation&eq=quad&p=0&q=4)
5. Roots of unity: drag $n$ from 3 to 12. [z⁶ = 1](?mode=equation&eq=root&w=1&n=6)
6. What does z ↦ z² do to a house? And z ↦ 1/z to a grid? [Mappings](?mode=map&fmap=sq&shape=house)
7. A polynomial of degree 4 has four zeros. Find them in the coloured picture. [Zeros](?mode=poly&coef=1%3B%200%3B%20-2%3B%200%3B%202&dc=1)
8. Which points are closer to a than to b? [Sets of points](?mode=sets&sk=bisect&sa=1%20%2B%20i&sb=-1)
9. Drag c around in the Mandelbrot set. When does the orbit escape? [Iteration](?mode=iter&ic=-0,5%20%2B%200,3i&its=40)

## Exercises

### Exercise 1: Multiplying

Calculate $(1 + i)(1 - i)$ and $(1 + i)^2$.

<details>
<summary>Show solution</summary>

$(1 + i)(1 - i) = 1 - i^2 = 2$ and $(1 + i)^2 = 1 + 2i - 1 = 2i$. Geometrically: $|1 + i| = \sqrt2$, angle $45°$. Squaring gives modulus $2$ and angle $90°$. [Show in the simulation](?mode=ops&op=mul&z=1%20%2B%20i&w=1%20%2B%20i)

</details>

### Exercise 2: Polar form

Find the modulus and argument of $3 + 4i$.

<details>
<summary>Show solution</summary>

$r = \sqrt{9 + 16} = 5$, $\tan\varphi = \tfrac43$, so $\varphi \approx 53.13°$. [Show in the simulation](?mode=polar&z=3%20%2B%204i)

</details>

### Exercise 3: Equations in ℂ

Solve $z^2 + 4 = 0$ and $z^2 - 2z + 5 = 0$.

<details>
<summary>Show solution</summary>

$z^2 = -4$ gives $z = \pm 2i$. In the second equation $D = 1 - 5 = -4$, so $z = 1 \pm 2i$. [Show in the simulation](?mode=equation&eq=quad&p=-2&q=5)

</details>

### Exercise 4: Cube roots

How many solutions does $z^3 = 8$ have, and where are they?

<details>
<summary>Show solution</summary>

Three solutions with modulus $2$ and angles $0°$, $120°$, $240°$: $2$ and $-1 \pm \sqrt3\,i$. They form an equilateral triangle. [Show in the simulation](?mode=equation&eq=root&w=8&n=3)

</details>

### Exercise 5: Zeros of a polynomial

Find all zeros of $p(z) = z^4 - 2z^2 + 2$.

<details>
<summary>Show solution</summary>

With $u = z^2$: $u^2 - 2u + 2 = 0$, so $u = 1 \pm i$. From $z^2 = 1 + i = \sqrt2 \cdot e^{i \cdot 45^\circ}$ it follows that $z = \pm \sqrt[4]{2} \cdot e^{i \cdot 22.5^\circ} \approx \pm(1.099 + 0.455i)$, and correspondingly for $1 - i$: $z \approx \pm(1.099 - 0.455i)$. Four zeros, two conjugate pairs. [Show in the simulation](?mode=poly&coef=1%3B%200%3B%20-2%3B%200%3B%202&dc=1)

</details>

## Ideas for the classroom

- **Use:** extending the number system beyond $\mathbb{R}$; revising the quadratic formula; links to trigonometry and to matrices as mappings.
- **Common pitfalls:**
  - Forgetting $i^2 = -1$ when expanding.
  - Reading the argument in the wrong quadrant ($\tan\varphi$ alone is not enough).
  - Not multiplying by the conjugate of the denominator when dividing.
- **Curriculum link:** complex numbers are usually an optional or extension topic – please check your own curriculum.
