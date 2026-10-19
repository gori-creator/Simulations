---
description: "Interactive simulation for upper secondary and university: 2×2 matrices as linear maps of the plane – drag the images of the unit vectors, the determinant as area factor, eigendirections, rotation, reflection, shear and projection."
---

## What is it about?

A $2 \times 2$ matrix maps $\vec{x}$ to $A\vec{x}$. Its **columns** are the images of $\vec{e}_1$ and $\vec{e}_2$. $\det A = ad - bc$ is the signed area of the image of the unit square: areas are multiplied by $|\det A|$, a negative sign reverses orientation, and $\det A = 0$ squashes the plane onto a line. Eigenvectors satisfy $A\vec{v} = \lambda\vec{v}$.

## Try it

1. [General](?a=2&b=1&c=0&d=1): drag the tips of $A\vec{e}_1$ and $A\vec{e}_2$; press “Play the transformation”.
2. [Rotation](?a=0&b=-1&c=1&d=0), [reflection](?a=1&b=0&c=0&d=-1), [shear](?a=1&b=1&c=0&d=1), [projection](?a=1&b=0&c=0&d=0).

## Tasks

### Task 1

$\vec{e}_1 \mapsto (2, 1)$, $\vec{e}_2 \mapsto (1, 2)$. Find $A$ and the area factor. [Load task](?a=2&b=1&c=1&d=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$, $\det A = 3$; eigenvalues $3$ and $1$. [Show](?a=2&b=1&c=1&d=2)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Let students build rotations, reflections and shears by dragging, then write down the matrices.
- **Common stumbling blocks:** swapping rows and columns; ignoring the sign of the determinant.
