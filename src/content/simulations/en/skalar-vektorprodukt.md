---
description: "Two vectors in space: angle and projection from the dot product, rotating b with the curves of cos and sin, the cross product step by step as a normal vector with the parallelogram area, the triple product as a volume (with Cavalieri shear) – and discovery tasks that reveal the whole solution set."
---

## What is it about?

**Dot product (scalar product):** multiply component by component and add – the result is a **number**: $\vec a \cdot \vec b = a_1 b_1 + a_2 b_2 + a_3 b_3$. Geometrically, $\vec a \cdot \vec b = |\vec a| \cdot |\vec b| \cdot \cos\varphi$ with the angle $0° \le \varphi \le 180°$, so

$$
\cos\varphi = \frac{\vec a \cdot \vec b}{|\vec a| \cdot |\vec b|}, \qquad \text{e.g. } \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} \cdot \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix} = 1, \quad \cos\varphi = \frac{1}{1 \cdot \sqrt2} \;\Rightarrow\; \varphi = 45°.
$$

- $\vec a \cdot \vec b > 0$: acute angle, $< 0$: obtuse angle, $= 0$: **perpendicular** (orthogonal).
- $\frac{\vec a \cdot \vec b}{|\vec a|}$ is the (signed) length of the **projection** of $\vec b$ onto the direction of $\vec a$.
- **Special cases:** with a zero vector there is no angle. For parallel vectors, $\vec a \cdot \vec b = \pm|\vec a| \cdot |\vec b|$.

**Cross product (vector product):** the result is a **vector**. You write $\vec a$ and $\vec b$ side by side, repeat the first two rows underneath and multiply “crosswise”, starting in row 2:

$$
\vec a \times \vec b = \begin{pmatrix} a_2 b_3 - a_3 b_2 \\ a_3 b_1 - a_1 b_3 \\ a_1 b_2 - a_2 b_1 \end{pmatrix}, \qquad \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} \times \begin{pmatrix} 4 \\ 5 \\ 6 \end{pmatrix} = \begin{pmatrix} 12 - 15 \\ 12 - 6 \\ 5 - 8 \end{pmatrix} = \begin{pmatrix} -3 \\ 6 \\ -3 \end{pmatrix}.
$$

$\vec a \times \vec b$ is **perpendicular to $\vec a$ and $\vec b$** (right-hand rule), and its length is the **area of the parallelogram**: $|\vec a \times \vec b| = |\vec a| \cdot |\vec b| \cdot \sin\varphi$, here $\sqrt{9 + 36 + 9} = \sqrt{54} \approx 7.35$. The triangle has half the area. $\vec b \times \vec a = -(\vec a \times \vec b)$; for parallel vectors, $\vec a \times \vec b = \vec o$.

**Triple product:** $|(\vec a \times \vec b) \cdot \vec c|$ is the **volume of the parallelepiped**: base area $G = |\vec a \times \vec b|$ times height $h$ (projection of $\vec c$ onto $\vec a \times \vec b$). If you shear the parallelepiped upright, $G$ and $h$ stay the same – and so does the volume (Cavalieri’s principle). The triangular pyramid with the edges $\vec a$, $\vec b$, $\vec c$ has $\frac16$ of it. If the triple product is negative, $\vec a$, $\vec b$, $\vec c$ form a left-handed system; if it is $0$, they lie in one plane.

## Try it

1. Drag the tip of $\vec b$ until the angle is $90°$. What do the dot product and the bars show? [Perpendicular](?b1=-2&b2=1&b3=2)
2. In **Rotate the angle**, $\vec b$ moves on a semicircle. Start “Turn φ from 0° to 180°” and watch both curves. [Rotate the angle](?mode=angle&a1=1&a2=0&a3=0&b1=1&b2=1&b3=0&phi=45)
3. In the **Cross product**, run the calculation step by step and tap a row of the scheme. [Crosswise](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6)
4. Make $\vec b$ parallel to $\vec a$. What happens to the area and the normal vector? [Parallel](?mode=cross&a1=1&a2=2&a3=3&b1=2&b2=4&b3=6)
5. In the **Triple product**, switch on “Shear the solid upright (Cavalieri)”. What stays the same? [Cavalieri](?mode=spat&a1=2&a2=0&a3=0&b1=0&b2=3&b3=0&c1=2&c2=1&c3=2&cav=1)
6. Under **Discover** you look for three solutions – afterwards it shows where all solutions lie. [Discover](?mode=find&task=perp&b1=1&b2=1&b3=2)

## Exercises

### Exercise 1: Calculating an angle

Calculate the angle between $\vec a = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$ and $\vec b = \begin{pmatrix} -2 \\ -1 \\ 2 \end{pmatrix}$. [Load exercise](?b1=-2&b2=-1&b3=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec a \cdot \vec b = -2 - 2 + 0 = -4$, $|\vec a| = \sqrt5$, $|\vec b| = 3$. $\cos\varphi = \frac{-4}{3\sqrt5} \approx -0.596$, so $\varphi \approx 126.6°$ – obtuse, as the minus sign gives away. [Show in the simulation](?b1=-2&b2=-1&b3=2)

</details>

### Exercise 2: Equally large

For which angles $\varphi$ are $|\vec a \cdot \vec b|$ and $|\vec a \times \vec b|$ equally large? [Load exercise](?mode=angle&a1=1&a2=0&a3=0&b1=1&b2=1&b3=0&phi=20&_hide=1)

<details>
<summary>Show solution</summary>

$|\cos\varphi| = \sin\varphi$ holds for $\varphi = 45°$ and $\varphi = 135°$. Example: $\vec a = \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix}$: $\vec a \cdot \vec b = 1$ and $\vec a \times \vec b = \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}$ with length $1$. [Show in the simulation](?mode=angle&a1=1&a2=0&a3=0&b1=1&b2=1&b3=0&phi=45)

</details>

### Exercise 3: Normal vector and area

Calculate $\vec a \times \vec b$ for $\vec a = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix}$, $\vec b = \begin{pmatrix} 4 \\ 5 \\ 6 \end{pmatrix}$, check it and give the area of the parallelogram. [Load exercise](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec a \times \vec b = \begin{pmatrix} 2 \cdot 6 - 3 \cdot 5 \\ 3 \cdot 4 - 1 \cdot 6 \\ 1 \cdot 5 - 2 \cdot 4 \end{pmatrix} = \begin{pmatrix} -3 \\ 6 \\ -3 \end{pmatrix}$. Check: $-3 + 12 - 9 = 0$ and $-12 + 30 - 18 = 0$ ✓. Area $\sqrt{54} \approx 7.35$. [Show in the simulation](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6)

</details>

### Exercise 4: Volume and orientation

Calculate the triple product for $\vec a = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 0 \\ 1 \\ 2 \end{pmatrix}$ and $\vec c = \begin{pmatrix} -1 \\ 1 \\ -2 \end{pmatrix}$. What are the volumes of the parallelepiped and the pyramid? [Load exercise](?mode=spat&c1=-1&c2=1&c3=-2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec a \times \vec b = \begin{pmatrix} 4 \\ -2 \\ 1 \end{pmatrix}$, $(\vec a \times \vec b) \cdot \vec c = -4 - 2 - 2 = -8$: a left-handed system. Parallelepiped $V = 8$, pyramid $V = \frac86 = \frac43 \approx 1.33$. [Show in the simulation](?mode=spat&c1=-1&c2=1&c3=-2&pyr=1)

</details>

### Exercise 5: All solutions

Find all $\vec c$ for which the parallelepiped spanned by $\vec a = \begin{pmatrix} 2 \\ 0 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 0 \\ 3 \\ 0 \end{pmatrix}$ and $\vec c$ has volume $12$. First find three in the simulation, then describe all of them. [Load exercise](?mode=find&task=vol&c1=1&c2=1&c3=1)

<details>
<summary>Show solution</summary>

$\vec a \times \vec b = \begin{pmatrix} 0 \\ 0 \\ 6 \end{pmatrix}$, so $V = |6 c_3| = 12$ exactly for $c_3 = 2$ or $c_3 = -2$; $c_1$ and $c_2$ are arbitrary. The tips lie in two planes parallel to the $x_1x_2$ plane: base area $6$ times height $2$. [Show in the simulation](?mode=find&task=vol&c1=1&c2=1&c3=1)

</details>

## Ideas for the classroom

- **Use:** upper secondary, foundations of coordinate geometry in space.
- **Discover rather than state:** first let the class look for perpendicular vectors under “Discover” – the plane of solutions leads directly to the normal form.
- **cos and sin together:** “Rotate the angle” shows the dot product (projection) and the area (height) in the same picture.
- **Common pitfalls:**
  - The dot product is written as a vector – it is a number.
  - Signs or indices of the middle component are swapped; the check $(\vec a \times \vec b) \cdot \vec a = 0$ helps.
  - The sign of $\cos\varphi$ is ignored; the angle always lies between $0°$ and $180°$.
  - Triangle area without $\frac12$, pyramid volume without $\frac16$.
