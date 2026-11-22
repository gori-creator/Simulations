---
description: "Complex numbers in the complex plane: adding as shifting, multiplying as rotating and scaling, polar form, solutions of z² = −4 and zⁿ = w, and the 2×2 matrix representation."
---

## What is it about?

With a new number $i$ satisfying $i^2 = -1$, the equation $x^2 = -4$ has the solutions $\pm 2i$. A **complex number** $z = a + bi$ is the point $(a \mid b)$ in the complex plane.

- **Adding** chains arrows.
- **Multiplying** multiplies moduli and adds angles: $(1 + i)(1 - i) = 2$, $(1 + i)^2 = 2i$. Multiplying by $i$ rotates by $90°$.
- **Polar form:** $z = r(\cos\varphi + i\sin\varphi) = re^{i\varphi}$ with $r = |z|$, e.g. $|3 + 4i| = 5$, $\varphi \approx 53.13°$.
- $z^n = w$ has exactly $n$ solutions forming a regular $n$-gon.
- $a + bi$ acts like the matrix $\begin{pmatrix} a & -b \\ b & a \end{pmatrix}$.

## Try it

1. Multiply by $i$: [load](?mode=ops&op=mul&z=3%20%2B%20i&w=i)
2. Spiral of powers: [load](?mode=ops&op=pow&z=1%2C1%E2%88%A030%C2%B0&n=12)
3. Roots of unity: [load](?mode=equation&eq=root&w=1&n=6)

## Tasks

### Task 1

Compute $(1 + i)(1 - i)$ and $(1 + i)^2$.

<details>
<summary>Show solution</summary>

$2$ and $2i$. [Show](?mode=ops&op=mul&z=1%20%2B%20i&w=1%20%2B%20i)

</details>

### Task 2

Solve $z^2 - 2z + 5 = 0$.

<details>
<summary>Show solution</summary>

$D = -4$, so $z = 1 \pm 2i$. [Show](?mode=equation&eq=quad&p=-2&q=5)

</details>

## Ideas for the classroom

- **Stumbling blocks:** forgetting $i^2 = -1$; reading the argument in the wrong quadrant; not multiplying by the conjugate when dividing.
