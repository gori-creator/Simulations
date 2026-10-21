---
description: "Interactive simulation for upper secondary and university: 2×2 matrices as linear maps of the plane – continuous deformation, composition and AB ≠ BA, determinant as signed area, eigenvectors with the characteristic polynomial, inverse, iteration with fixed vector and ten everyday examples."
---

## What is it about?

A $2 \times 2$ matrix maps $\vec{x}$ to $A\vec{x}$. Its **columns** are the images of $\vec{e}_1$ and $\vec{e}_2$, so the grid becomes a grid of parallelograms. Applying $B$ first and then $A$ gives the product $A \cdot B$; in general $AB \neq BA$.

$\det A = ad - bc$ is the **signed area** of the image of the unit square: areas are multiplied by $|\det A|$, a negative sign reverses orientation, and $\det A = 0$ squashes the plane onto a line (not invertible). Otherwise $A^{-1} = \frac{1}{ad - bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}$.

Eigenvectors satisfy $A\vec{v} = \lambda\vec{v}$; the eigenvalues solve $\lambda^2 - (a + d)\lambda + (ad - bc) = 0$. Rotations by $\varphi \neq 0°, 180°$ have non-real eigenvalues. For an iteration $\vec{x}_{n+1} = A\vec{x}_n$ the eigenvalue of largest absolute value decides the long-term behaviour; for a transition matrix the fixed vector with sum 1 is the stationary distribution.

## Try it

1. [General](?a=2&b=1&c=0&d=1): drag the tips of $A\vec{e}_1$ and $A\vec{e}_2$; press “Play the transformation”.
2. [Rotation](?typ=rot&phi=90), [reflection in y = x](?typ=refl&al=45), [shear](?typ=shear&k=1), [projection](?mode=det&typ=proj&al=30&fig=house).
3. [AB ≠ BA](?mode=comp&a=1&b=2&c=3&d=4), [eigenvectors](?mode=eig&a=2&b=1&c=1&d=2), [inverse](?mode=inv&a=2&b=1&c=1&d=1&fig=house).
4. Everyday: [kaleidoscope](?ex=kaleido&mode=comp&typ=refl&al=60&ba=1&bb=0&bc=0&bd=-1), [shadow](?ex=shadow&a=1&b=-1&c=0&d=0&fig=house&eig=0), [population](?ex=pop&mode=pow&a=0&b=1&c=0.5&d=0.5&x0=4&y0=0&n=8), [customers switching](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=10).

## Tasks

### Task 1: Matrix from images

$\vec{e}_1 \mapsto (2, 1)$, $\vec{e}_2 \mapsto (1, 2)$. Find $A$, the area factor and the eigenvalues. [Load task](?a=2&b=1&c=1&d=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$, $\det A = 3$; $\lambda^2 - 4\lambda + 3 = 0$ gives eigenvalues $3$ and $1$ with eigenvectors $(1, 1)$ and $(1, -1)$. [Show](?mode=eig&a=2&b=1&c=1&d=2&w=45)

</details>

### Task 2: Order matters

Compute $AB$ and $BA$ for $A = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}$, $B = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$. [Load task](?mode=comp&a=1&b=2&c=3&d=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$AB = \begin{pmatrix} 2 & 1 \\ 4 & 3 \end{pmatrix}$ (columns swapped), $BA = \begin{pmatrix} 3 & 4 \\ 1 & 2 \end{pmatrix}$ (rows swapped). [Show](?mode=comp&a=1&b=2&c=3&d=4)

</details>

### Task 3: Inverse

Find the inverse of $\begin{pmatrix} 2 & 1 \\ 1 & 1 \end{pmatrix}$. [Load task](?mode=inv&a=2&b=1&c=1&d=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\det A = 1$, so $A^{-1} = \begin{pmatrix} 1 & -1 \\ -1 & 2 \end{pmatrix}$. [Show](?mode=inv&a=2&b=1&c=1&d=1)

</details>

### Task 4: Stationary distribution

Find the stationary distribution of $\begin{pmatrix} 0.9 & 0.2 \\ 0.1 & 0.8 \end{pmatrix}$. [Load task](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$0.9p + 0.2q = p$ gives $p = 2q$; with $p + q = 1$: $p = \frac{2}{3}$, $q = \frac{1}{3}$. [Show](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=10)

</details>

## Ideas for the classroom

- Let students build rotations, reflections and shears by dragging, then write down the matrices and compare with the standard forms.
- Switch “Show values” off: compute determinant, product, inverse or eigenvalues first, then check in the picture.
- **Common stumbling blocks:** swapping rows and columns; thinking $A$ acts first in $AB$; ignoring the sign of the determinant; believing eigenvectors stay unchanged (they may be stretched or flipped).
