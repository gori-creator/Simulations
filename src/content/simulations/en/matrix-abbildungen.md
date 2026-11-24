## What is it about?

A $2 \times 2$ matrix $A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$ describes a **linear map** of the plane: every vector $\vec{x}$ is mapped to $A \cdot \vec{x}$. The origin stays fixed, lines stay lines, parallel lines stay parallel – the coordinate grid becomes a grid of parallelograms.

**The columns are the images of the unit vectors:** $A \cdot \vec{e}_1 = \begin{pmatrix} a \\ c \end{pmatrix}$, $A \cdot \vec{e}_2 = \begin{pmatrix} b \\ d \end{pmatrix}$, and by linearity $A \cdot \begin{pmatrix} x \\ y \end{pmatrix} = x \cdot \begin{pmatrix} a \\ c \end{pmatrix} + y \cdot \begin{pmatrix} b \\ d \end{pmatrix}$.

**Well-known maps** have fixed blueprints: rotation by $\varphi$: $\begin{pmatrix} \cos\varphi & -\sin\varphi \\ \sin\varphi & \cos\varphi \end{pmatrix}$, reflection in the line through the origin at angle $\alpha$: $\begin{pmatrix} \cos 2\alpha & \sin 2\alpha \\ \sin 2\alpha & -\cos 2\alpha \end{pmatrix}$, shear $\begin{pmatrix} 1 & k \\ 0 & 1 \end{pmatrix}$, scaling $\begin{pmatrix} k_x & 0 \\ 0 & k_y \end{pmatrix}$, orthogonal projection onto the line at angle $\alpha$: $\begin{pmatrix} \cos^2\alpha & \sin\alpha\cos\alpha \\ \sin\alpha\cos\alpha & \sin^2\alpha \end{pmatrix}$.

**Composition:** applying $B$ first and then $A$ gives $A \cdot B$ (the matrix applied first stands on the right). Entry $p_{ij}$ = row $i$ of $A$ times column $j$ of $B$. In general, $A \cdot B \neq B \cdot A$.

**Determinant:** $\det A = ad - bc$ is the **signed area** of the image of the unit square. All areas are multiplied by $|\det A|$, and $\det(A \cdot B) = \det A \cdot \det B$. If $\det A < 0$, the orientation reverses; if $\det A = 0$, the plane collapses onto a line (or a point): the map is not invertible.

**Inverse:** for $\det A \neq 0$,

$$
A^{-1} = \frac{1}{ad - bc} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}, \qquad A \cdot A^{-1} = E.
$$

**Eigenvectors:** a vector $\vec{v} \neq \vec{0}$ with $A \cdot \vec{v} = \lambda \vec{v}$ is only stretched; its direction is kept. The eigenvalues are the solutions of the **characteristic polynomial**

$$
\det(A - \lambda E) = \lambda^2 - (a + d)\lambda + (ad - bc) = 0.
$$

If the discriminant is negative (e.g. for rotations by $\varphi \neq 0°, 180°$), the eigenvalues are complex and no direction is kept.

**Iteration:** $\vec{x}_{n+1} = A \cdot \vec{x}_n$ describes processes in steps (populations, customers switching). In the long run the eigenvalue with the largest absolute value determines the behaviour; an eigenvector for the eigenvalue $1$ is a **fixed vector** ($A\vec{v} = \vec{v}$). For a **transition matrix** (entries $\geq 0$, column sums $1$), the fixed vector with sum $1$ is called the **stationary distribution**.

## Try it

1. [General](?a=2&b=1&c=0&d=1): drag the tips of $A \cdot \vec{e}_1$ and $A \cdot \vec{e}_2$. Press “Play the transformation” or move the slider $t$: the identity matrix deforms continuously into $A$.
2. [Rotation by 90°](?typ=rot&phi=90), [reflection in y = x](?typ=refl&al=45), [shear](?typ=shear&k=1), [circle → ellipse](?typ=scale&kx=2&ky=0.5&fig=circle&uc=1): which lines stay fixed?
3. [AB ≠ BA](?mode=comp&a=1&b=2&c=3&d=4): press “Play one after the other” and then “Swap the order”. The red dotted figure shows the other order.
4. [Negative determinant](?mode=det&a=1&b=2&c=2&d=1&hgt=1): how can you tell from the picture that $\det A < 0$? Compare with base · height of the parallelogram. [Projection](?mode=det&typ=proj&al=30&fig=house): what is the kernel?
5. [Symmetric matrix](?mode=eig&a=2&b=1&c=1&d=2): press “Turn v once around”. When do $\vec{v}$ and $A\vec{v}$ lie on one line? The graph of $\sin\angle(\vec{v}, A\vec{v})$ has zeros there. Compare with the [rotation by 60°](?mode=eig&typ=rot&phi=60) and the [shear](?mode=eig&typ=shear&k=1).
6. [Inverse](?mode=inv&a=2&b=1&c=1&d=1&fig=house): “There with A, back with A⁻¹”. What happens with the [singular matrix](?mode=inv&a=1&b=2&c=0.5&d=1)?
7. Everyday life: [rotate a spaceship](?ex=sprite&typ=rot&phi=30&fig=rocket), [slanted letters](?ex=italic&typ=shear&k=0.25&fig=f), [shadow](?ex=shadow&a=1&b=-1&c=0&d=0&fig=house&eig=0), [reflection in a lake](?ex=mirror&typ=refl&al=0&fig=house), [kaleidoscope](?ex=kaleido&mode=comp&typ=refl&al=60&ba=1&bb=0&bc=0&bd=-1), [map app](?ex=zoom&typ=rs&phi=30&r=1.5&fig=house), [widescreen](?ex=wide&mode=det&typ=scale&kx=1.5&ky=1&fig=smile).
8. Iteration: [population stable](?ex=pop&mode=pow&a=0&b=1&c=0.5&d=0.5&x0=4&y0=0&n=8), [population growing](?ex=popg&mode=pow&a=0&b=2&c=0.5&d=0.5&x0=1&y0=1&n=8), [customers switching](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=10). Drag the starting point: does the destination change?

## Exercises

### Exercise 1: Matrix from images

The map sends $\vec{e}_1$ to $\begin{pmatrix} 2 \\ 1 \end{pmatrix}$ and $\vec{e}_2$ to $\begin{pmatrix} 1 \\ 2 \end{pmatrix}$. Give the matrix and calculate the area factor. [Load exercise](?a=2&b=1&c=1&d=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$, $\det A = 4 - 1 = 3$: areas are tripled. [Show the solution](?mode=det&a=2&b=1&c=1&d=2)

</details>

### Exercise 2: Eigenvalues

Find the eigenvalues and eigenvectors of $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$. [Load exercise](?mode=eig&a=2&b=1&c=1&d=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\det(A - \lambda E) = (2 - \lambda)^2 - 1 = \lambda^2 - 4\lambda + 3 = 0 \Rightarrow \lambda = 3$ or $\lambda = 1$; eigenvectors $\begin{pmatrix} 1 \\ 1 \end{pmatrix}$ and $\begin{pmatrix} 1 \\ -1 \end{pmatrix}$. [Show](?mode=eig&a=2&b=1&c=1&d=2&w=45)

</details>

### Exercise 3: Which map?

Which map does $\begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$ describe? Justify using the images of the unit vectors and show that there are no real eigenvalues.

<details>
<summary>Show solution</summary>

$\vec{e}_1 \mapsto \vec{e}_2$ and $\vec{e}_2 \mapsto -\vec{e}_1$: a rotation by $90°$ anticlockwise, $\det A = 1$. $\lambda^2 + 1 = 0$ has no real solution ($\lambda = \pm i$). [Show](?mode=eig&typ=rot&phi=90)

</details>

### Exercise 4: Order

For $A = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}$ and $B = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$, calculate the products $A \cdot B$ and $B \cdot A$. What does $B$ do in each case? [Load exercise](?mode=comp&a=1&b=2&c=3&d=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$A \cdot B = \begin{pmatrix} 2 & 1 \\ 4 & 3 \end{pmatrix}$ (the columns of $A$ are swapped), $B \cdot A = \begin{pmatrix} 3 & 4 \\ 1 & 2 \end{pmatrix}$ (the rows are swapped). So $A \cdot B \neq B \cdot A$, but $\det(AB) = \det(BA) = (-2) \cdot (-1) = 2$. [Show](?mode=comp&a=1&b=2&c=3&d=4)

</details>

### Exercise 5: The way back

Calculate the inverse of $A = \begin{pmatrix} 2 & 1 \\ 1 & 1 \end{pmatrix}$ and check it with the point $P(1, 1)$. [Load exercise](?mode=inv&a=2&b=1&c=1&d=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\det A = 2 - 1 = 1$, so $A^{-1} = \begin{pmatrix} 1 & -1 \\ -1 & 2 \end{pmatrix}$. Check: $A \cdot \begin{pmatrix} 1 \\ 1 \end{pmatrix} = \begin{pmatrix} 3 \\ 2 \end{pmatrix}$ and $A^{-1} \cdot \begin{pmatrix} 3 \\ 2 \end{pmatrix} = \begin{pmatrix} 3 - 2 \\ -3 + 4 \end{pmatrix} = \begin{pmatrix} 1 \\ 1 \end{pmatrix}$. [Show](?mode=inv&a=2&b=1&c=1&d=1&fig=house)

</details>

### Exercise 6: Customers switching

Every year 90% of the customers of provider P stay and 10% switch to Q; of Q’s customers, 20% switch to P. At the start all customers are with P. Calculate the shares after one and after two years, and the stationary distribution. [Load exercise](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$A = \begin{pmatrix} 0.9 & 0.2 \\ 0.1 & 0.8 \end{pmatrix}$: $\vec{x}_1 = \begin{pmatrix} 0.9 \\ 0.1 \end{pmatrix}$, $\vec{x}_2 = \begin{pmatrix} 0.81 + 0.02 \\ 0.09 + 0.08 \end{pmatrix} = \begin{pmatrix} 0.83 \\ 0.17 \end{pmatrix}$. Stationary: $0.9p + 0.2q = p$, so $0.2q = 0.1p$, $p = 2q$; with $p + q = 1$ it follows that $p = \frac{2}{3}$, $q = \frac{1}{3}$. [Show](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=10)

</details>

## Ideas for the classroom

- **Use:** linear algebra in the first year at university; in upper secondary as an extension after vectors, for example in a seminar, a specialist course or gifted programmes. Transition matrices and population models only appear directly in some curricula.
- **Collect conjectures:** first “build” maps by dragging (rotation, reflection, shear), then write down the matrices and compare them with the blueprints.
- **Combine calculating and seeing:** with “Show values” switched off, the students first calculate (determinant, product, inverse, eigenvalues) and then check in the picture.
- **Common pitfalls:**
  - Rows and columns are swapped – the images of the unit vectors are in the **columns**.
  - With $A \cdot B$, $A$ is thought to be applied first; in fact $B$ acts first.
  - The determinant is understood as an area without a sign.
  - Eigenvectors are taken to be “the vectors that do not change” – they may be stretched or reversed ($\lambda < 0$).
