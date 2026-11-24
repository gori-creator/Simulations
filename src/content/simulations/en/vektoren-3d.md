---
description: "Vector arrows in space with draggable tips: tip to tail and the parallelogram, opposite vector and difference, multiples, linear combinations in a plane, the connecting vector AB = B − A, finding a linear combination, vector paths in a parallelepiped, length and unit vector, centroid and dividing point, and a random walk of many unit steps – with the calculation in column form."
---

## What is it about?

A **vector** describes a displacement, e.g. $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$. All arrows of the same length and direction represent the same vector.

- **Addition (“tip to tail”):** the sum arrow is the diagonal of the parallelogram; you calculate component by component, e.g. $\begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix} + \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix} = \begin{pmatrix} 3 \\ 3 \\ 3 \end{pmatrix}$.
- **Subtraction:** $\vec a - \vec b = \vec a + (-\vec b)$ with the opposite vector $-\vec b$.
- **Multiple:** $k \cdot \vec a$ is parallel to $\vec a$ and $|k|$ times as long; for $k < 0$ the direction reverses.
- **Linear combination:** all $r \cdot \vec a + s \cdot \vec b$ lie in a plane through $O$ (if $\vec a \nparallel \vec b$).
- **Connecting vector:** $\overrightarrow{AB} = \vec b - \vec a$ (“tip minus tail”), midpoint $M = \tfrac12 (A + B)$.

**Length and unit vector:** Pythagoras twice – first $d_{12} = \sqrt{v_1^2 + v_2^2}$ in the $x_1x_2$ plane, then with the height:

$$
|\vec v| = \sqrt{v_1^2 + v_2^2 + v_3^2}, \qquad \left|\begin{pmatrix} 1 \\ 2 \\ 2 \end{pmatrix}\right| = \sqrt{9} = 3, \qquad \vec v^{\,0} = \frac{1}{|\vec v|} \cdot \vec v = \begin{pmatrix} \frac13 \\ \frac23 \\ \frac23 \end{pmatrix}.
$$

The **unit vector** has length $1$ and ends on the unit sphere. The zero vector has none.

**Centroid and dividing point:** the centroid of a triangle is $S = \tfrac13 (A + B + C)$. It divides each median in the ratio $2 : 1$ (from the vertex). A point $T = A + t \cdot \overrightarrow{AB}$ divides the segment $AB$ in the ratio $t : (1 - t)$; for $t < 0$ or $t > 1$ it lies outside.

**Random walk:** every step is one of the six unit vectors $\pm\vec e_1, \pm\vec e_2, \pm\vec e_3$. The sum $\vec s$ points from start to finish; if you sort the steps, the walk ends at the same point (the order of addition does not matter). On average $|\vec s|^2 = n$, so the typical distance only grows like $\sqrt n$.

**Special cases** are announced: zero vector, parallel vectors, flat parallelepiped, points on a line (no triangle), return to the origin.

## Try it

1. Play the **animation** and drag the tips of $\vec a$ and $\vec b$. Is $\vec a + \vec b = \vec b + \vec a$? [Addition](?op=add)
2. When multiplying, set $k = -1.5$. What happens to direction and length? [Multiplying](?op=scale&k=-1.5)
3. **Find:** drag the red tip until it points exactly at $\vec c$. [Target in the plane](?op=goal&c1=3&c2=3&c3=3&r=0.5&s=0.5) · [Target outside](?op=goal&c1=0&c2=0&c3=3&r=0.5&s=0.5)
4. **Parallelepiped:** tap corners. Which vector path leads to the corner $\vec b + \vec c$? [Parallelepiped](?op=spat&a1=3&a2=0&a3=0&b1=1&b2=3&b3=0&c1=0.5&c2=0.5&c3=2.5)
5. **Length:** find five integer vectors of length $3$. Afterwards the sphere with all solutions appears. [Length 3](?op=len&a1=1&a2=1&a3=1)
6. **Centroid:** drag $A$, $B$ or $C$ and watch the ratio $2 : 1$. Then put all three on one line. [Centroid](?op=tri&a1=3&a2=0&a3=0&b1=0&b2=3&b3=0&c1=0&c2=0&c3=3)
7. **Dividing point:** drag $T$ along the line $AB$ – also beyond $B$. [Dividing point](?op=tri&a1=3&a2=0&a3=0&b1=-1&b2=4&b3=0&c1=0&c2=0&c3=3&tp=1&t=0.25&med=0)
8. **Random walk:** take 100 steps and then sort them. [Random walk](?op=walk) · Compare 500 walks and tap a bar. [Many walks](?op=walk&many=1&wn=20)

## Exercises

### Exercise 1: Sum, difference, length

For $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix}$, calculate the vectors $\vec a + \vec b$, $\vec a - \vec b$ and $|\vec a + \vec b|$. [Load exercise](?op=add&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec a + \vec b = \begin{pmatrix} 3 \\ 3 \\ 3 \end{pmatrix}$, $\vec a - \vec b = \begin{pmatrix} 1 \\ 5 \\ -3 \end{pmatrix}$, $|\vec a + \vec b| = \sqrt{27} \approx 5.20$. As a check: $|\vec a + \vec b| = \sqrt{27} \approx 5.20 < |\vec a| + |\vec b| = \sqrt{20} + \sqrt{11} \approx 7.79$ – lengths do not add up. [Show in the simulation](?op=add)

</details>

### Exercise 2: Connecting vector and midpoint

Given $A(3, -1, 1)$ and $B(-1, 3, 3)$. Calculate $\overrightarrow{AB}$, the length $AB$ and $M$. [Load exercise](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\overrightarrow{AB} = \begin{pmatrix} -4 \\ 4 \\ 2 \end{pmatrix}$, length $\sqrt{16 + 16 + 4} = 6$, $M(1, 1, 2)$. [Show in the simulation](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3)

</details>

### Exercise 3: Possible or not?

Can $\vec c = \begin{pmatrix} 0 \\ 0 \\ 3 \end{pmatrix}$ be written as a linear combination of $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$ and $\vec b = \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix}$? [Load exercise](?op=goal&c1=0&c2=0&c3=3&r=0.5&s=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

From $2r + s = 0$ and $4r - s = 0$ it follows that $r = s = 0$; then the third component is $0 \ne 3$. $\vec c$ does not lie in the plane – it is not possible. [Show in the simulation](?op=goal&c1=0&c2=0&c3=3&r=0&s=0)

</details>

### Exercise 4: Unit vector

Calculate the unit vector of $\vec v = \begin{pmatrix} 0 \\ 3 \\ 4 \end{pmatrix}$. How many vectors with integer components have length $3$? [Load exercise](?op=len&a1=0&a2=3&a3=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$|\vec v| = \sqrt{0 + 9 + 16} = 5$, $\vec v^{\,0} = \begin{pmatrix} 0 \\ 0.6 \\ 0.8 \end{pmatrix}$. Length $3$: $(\pm3, 0, 0)$ and its permutations ($6$ vectors) as well as all signs and permutations of $(1, 2, 2)$ ($3 \cdot 8 = 24$) – $30$ in total. [Show in the simulation](?op=len&a1=0&a2=3&a3=4)

</details>

### Exercise 5: Centroid and dividing point

Calculate the centroid of the triangle $A(3, 0, 0)$, $B(0, 3, 0)$, $C(0, 0, 3)$ and check $S = A + \tfrac23 \overrightarrow{AM_a}$. Which point $T$ divides the segment $AB$ with $B(-1, 4, 0)$ in the ratio $1 : 3$? [Load exercise](?op=tri&a1=3&a2=0&a3=0&b1=0&b2=3&b3=0&c1=0&c2=0&c3=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$S = \tfrac13 (3, 3, 3) = (1, 1, 1)$; $M_a(0, 1.5, 1.5)$, $A + \tfrac23 \begin{pmatrix} -3 \\ 1.5 \\ 1.5 \end{pmatrix} = (1, 1, 1)$ ✓. Dividing point: $t = \tfrac14$, $T = A + \tfrac14 \begin{pmatrix} -4 \\ 4 \\ 0 \end{pmatrix} = (2, 1, 0)$. [Show in the simulation](?op=tri&a1=3&a2=0&a3=0&b1=-1&b2=4&b3=0&c1=0&c2=0&c3=3&tp=1&t=0.25&med=0)

</details>

## Ideas for the classroom

- **Use:** upper secondary, foundations of coordinate geometry in space.
- **Random walk as an experiment:** first let the class estimate how far you get after $100$ steps, then simulate; the sorted picture shows the commutative law.
- **Common pitfalls:**
  - For the connecting vector, “tail minus tip” is calculated.
  - $|\vec a + \vec b|$ is calculated as $|\vec a| + |\vec b|$.
  - For the unit vector, only one component is divided by the length.
  - For the centroid, the ratio $2 : 1$ is measured from the wrong end.
