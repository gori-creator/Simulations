---
description: "Two lines, a line and a plane or two planes in a rotatable 3D picture: a decision tree leads to identical, parallel, intersecting or skew – with points and lines of intersection, angles, distances and an animated perpendicular from a point to a plane."
---

## What is it about?

Lines are written in **parametric form** $g\colon \vec x = \vec a + t \cdot \vec u$ (point $A$, direction vector $\vec u$), planes in **coordinate form** $E\colon n_1x_1 + n_2x_2 + n_3x_3 = c$ with the **normal vector** $\vec n$.

**Two lines** $g$ and $h\colon \vec x = \vec b + s \cdot \vec v$ – two questions are enough:

1. Are the directions parallel ($\vec v = k \cdot \vec u$)? Then the lines are **identical** (if $A$ lies on $h$) or **strictly parallel**.
2. Otherwise: does the system of equations $\vec a + t \cdot \vec u = \vec b + s \cdot \vec v$ have a solution? Then they **intersect**; otherwise they are **skew** – they pass each other in space.

The **angle of intersection** of two lines is the acute angle between the directions: $\cos \varphi = \dfrac{|\vec u \cdot \vec v|}{|\vec u| \cdot |\vec v|}$. Skew lines have a **shortest connection** that is perpendicular to both; its length is the distance

$$
d = \frac{|(\vec b - \vec a) \cdot (\vec u \times \vec v)|}{|\vec u \times \vec v|}.
$$

**Line and plane:** substitute the line into the equation of the plane. If $\vec n \cdot \vec u = 0$, the line lies in $E$ or is parallel to $E$; otherwise there is exactly one **point of intersection**. The angle of intersection is calculated with the **sine**, because $\vec n$ is perpendicular to the plane:

$$
\sin \varphi = \frac{|\vec n \cdot \vec u|}{|\vec n| \cdot |\vec u|}.
$$

**Two planes** are parallel (or identical) if their normal vectors are parallel; otherwise they intersect in a **line of intersection** with direction $\vec n \times \vec m$. Angle of intersection: $\cos \varphi = \dfrac{|\vec n \cdot \vec m|}{|\vec n| \cdot |\vec m|}$.

**Distance point – plane (Hesse normal form):** drop the perpendicular from $P$ to $E$. The foot $F$ lies on the perpendicular line $\vec x = \vec p + t \cdot \vec n$; the distance is

$$
d(P; E) = \frac{|n_1p_1 + n_2p_2 + n_3p_3 - c|}{|\vec n|}.
$$

If you go the same distance again beyond $F$, you get the **mirror point** $P'$.

## Try it

1. Load the skew lines and play the animation: the path in the decision tree lights up. Then click “View along g” – $g$ shrinks to a point, and the red connection shows the distance at its true length. [Load example](?mode=ll)
2. Drag the tip of the direction arrow $\vec v$ so that $h$ meets the line $g$. How can you tell from the picture that there is now a point of intersection?
3. For parallel lines, “View perpendicular to g and h” shows two parallel lines with the distance at its true length. [Parallel lines](?a1=0&a2=0&a3=0&u1=1&u2=2&u3=3&b1=1&b2=0&b3=0&v1=2&v2=4&v3=6)
4. Almost parallel, but not parallel: where is the point of intersection here, and how large is the angle? The point of intersection lies outside the drawn axes – read it off in the results. [Very small angle](?a1=0&a2=0&a3=0&u1=6&u2=0&u3=0&b1=0&b2=1&b3=0&v1=6&v2=0.5&v3=0)
5. A line that runs almost parallel to the $x_1x_2$ plane: the point of intersection moves far out and lies outside the drawn axes – read it off in the results. Set $u_3$ to $0$ – what does the decision tree say now? [Line almost in the plane](?mode=lp&a1=0&a2=0&a3=1&u1=4&u2=0&u3=0.5&n1=0&n2=0&n3=1&c=0)
6. Two planes intersect: with “View along the line of intersection” both planes appear as lines, and the angle between them is the true angle of intersection. [Line of intersection](?mode=pp)
7. Drop the perpendicular from $P$ to $E$ and switch on the mirror point. Then drag $P$ into the plane: what happens to $d$, $F$ and $P'$? [Distance point – plane](?mode=pd&mir=1)

## Exercises

### Exercise 1: Point of intersection of two lines

Investigate the position of $g\colon \vec x = \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} + t \cdot \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix}$ and $h\colon \vec x = \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix} + s \cdot \begin{pmatrix} 1 \\ -1 \\ 0 \end{pmatrix}$. If there is one, calculate the point and angle of intersection. [Load exercise](?a1=1&a2=0&a3=0&u1=1&u2=1&u3=0&b1=0&b2=1&b3=0&v1=1&v2=-1&v3=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

The directions are not parallel. Setting equal: $1 + t = s$ and $t = 1 - s$, third row $0 = 0$. From this $t = 0$, $s = 1$, so $S(1, 0, 0)$. Because $\vec u \cdot \vec v = 1 - 1 + 0 = 0$, the lines intersect at $90°$. [Show in the simulation](?a1=1&a2=0&a3=0&u1=1&u2=1&u3=0&b1=0&b2=1&b3=0&v1=1&v2=-1&v3=0)

</details>

### Exercise 2: Skew?

Show that $g\colon \vec x = t \cdot \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix}$ and $h\colon \vec x = \begin{pmatrix} 0 \\ 1 \\ 1 \end{pmatrix} + s \cdot \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix}$ are skew, and find their distance. [Load exercise](?a1=0&a2=0&a3=0&u1=1&u2=0&u3=0&b1=0&b2=1&b3=1&v1=0&v2=1&v3=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

The directions are not parallel. Setting equal gives $0 = 1$ in the third row – a contradiction, so skew. With $\vec u \times \vec v = \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}$ and $\vec b - \vec a = \begin{pmatrix} 0 \\ 1 \\ 1 \end{pmatrix}$, $d = \dfrac{|1|}{1} = 1$. The shortest connection runs from $(0, 0, 0)$ to $(0, 0, 1)$. [Show in the simulation](?a1=0&a2=0&a3=0&u1=1&u2=0&u3=0&b1=0&b2=1&b3=1&v1=0&v2=1&v3=0)

</details>

### Exercise 3: Point of intersection with a plane

Calculate the point where the line $g\colon \vec x = \begin{pmatrix} 0 \\ 0 \\ 5 \end{pmatrix} + t \cdot \begin{pmatrix} 1 \\ 1 \\ -1 \end{pmatrix}$ meets $E\colon x_1 + x_2 + x_3 = 2$, and the angle of intersection. [Load exercise](?mode=lp&a1=0&a2=0&a3=5&u1=1&u2=1&u3=-1&n1=1&n2=1&n3=1&c=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Substituting: $t + t + (5 - t) = 2$, so $5 + t = 2$ and $t = -3$. Point of intersection $D(-3, -3, 8)$. Angle: $\sin \varphi = \dfrac{|1 + 1 - 1|}{\sqrt 3 \cdot \sqrt 3} = \dfrac13$, so $\varphi \approx 19.5°$. [Show in the simulation](?mode=lp&a1=0&a2=0&a3=5&u1=1&u2=1&u3=-1&n1=1&n2=1&n3=1&c=2)

</details>

### Exercise 4: Distance, foot of the perpendicular and mirror point

Given $P(1, 2, 3)$ and $E\colon 2x_1 - x_2 + 2x_3 = 3$. Calculate $d(P; E)$, the foot of the perpendicular $F$ and the mirror point $P'$. [Load exercise](?mode=pd&mir=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$|\vec n| = \sqrt{4 + 1 + 4} = 3$ and $d(P; E) = \dfrac{|2 - 2 + 6 - 3|}{3} = 1$. Substituting the perpendicular line $\vec x = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + t \cdot \begin{pmatrix} 2 \\ -1 \\ 2 \end{pmatrix}$ into $E$: $2(1 + 2t) - (2 - t) + 2(3 + 2t) = 6 + 9t = 3$, so $9t = -3$, i.e. $t = -\tfrac13$ and $F\left(\tfrac13, \tfrac73, \tfrac73\right)$. With $t = -\tfrac23$ it follows that $P'\left(-\tfrac13, \tfrac83, \tfrac53\right)$. [Show in the simulation](?mode=pd&mir=1)

</details>

### Exercise 5: Parallel planes

Show that $E\colon x_1 + x_2 + x_3 = 1$ and $F\colon x_1 + x_2 + x_3 = 4$ are parallel, and calculate their distance. [Load exercise](?mode=pp&n1=1&n2=1&n3=1&c=1&m1=1&m2=1&m3=1&k=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Same normal vectors, different right-hand sides: strictly parallel. The point $Q(1, 0, 0)$ lies in $E$, so $d = \dfrac{|1 + 0 + 0 - 4|}{\sqrt 3} = \dfrac{3}{\sqrt 3} = \sqrt 3 \approx 1.73$. [Show in the simulation](?mode=pp&n1=1&n2=1&n3=1&c=1&m1=1&m2=1&m3=1&k=4)

</details>

### Exercise 6: Line and angle of intersection

Find an equation of the line of intersection of $E\colon 2x_1 - x_2 + 2x_3 = 3$ and $F\colon x_1 + x_2 = 1$, and the angle of intersection. [Load exercise](?mode=pp&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Direction $\vec n \times \vec m = \begin{pmatrix} 2 \\ -1 \\ 2 \end{pmatrix} \times \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix} = \begin{pmatrix} -2 \\ 2 \\ 3 \end{pmatrix}$. A common point: $x_2 = 0$ gives $x_1 = 1$ and $2 + 2x_3 = 3$, so $x_3 = 0.5$. Hence $s\colon \vec x = \begin{pmatrix} 1 \\ 0 \\ 0.5 \end{pmatrix} + t \cdot \begin{pmatrix} -2 \\ 2 \\ 3 \end{pmatrix}$ (the simulation chooses another point on the same line). Angle: $\cos \varphi = \dfrac{|2 - 1 + 0|}{3 \cdot \sqrt 2} \approx 0.236$, $\varphi \approx 76.4°$. [Show in the simulation](?mode=pp)

</details>

## Ideas for the classroom

- **Use:** upper secondary, analytic geometry: lines and planes in space. Good as an introduction to relative positions or for revision before the final exams.
- **Decision tree as a calculation plan:** the questions in the tree correspond exactly to the calculation steps (compare directions, solve the system of equations, substitute). You can let the class predict the path first and then play the animation.
- **Special viewing directions:** the edge-on view shows why distances and angles appear “at true size” when you look parallel to a plane – a bridge to descriptive geometry.
- **Exercise mode:** with “Show results” switched off and the results hidden, students first calculate themselves and then check in the picture.
- **Common pitfalls:**
  - Skew lines are taken to be “intersecting” because they seem to cross in the oblique drawing – rotating the view quickly clears this up.
  - For the angle between line and plane, the cosine is used instead of the sine (the normal vector is perpendicular to the plane).
  - The parameters $t$ and $s$ are given the same name when setting equal.
  - In the Hesse normal form, the absolute value bars or the division by $|\vec n|$ are forgotten.
