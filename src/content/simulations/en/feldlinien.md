---
description: "Interactive simulation of the electric field: drag and set point charges, see field lines, equipotential lines and field strength live, a test charge with force arrow and vector addition, plus the parallel-plate capacitor with E = U / d."
---

## What is it about?

A charge creates an **electric field**: any other charge feels a force there. The **field strength** is the force per test charge, $\vec E = \vec F / q_0$, measured in N/C = V/m. For a **point charge**

$$
E = k \cdot \frac{|Q|}{r^2}, \qquad k = \frac{1}{4\pi\varepsilon_0} \approx 8.99 \cdot 10^9\,\frac{\text{N}\,\text{m}^2}{\text{C}^2} .
$$

The fields of several charges add as **vectors** – the “vector addition” box shows the single fields head to tail and their sum in orange.

**Field lines** start at positive and end at negative charges; the field points along them, and dense lines mean a strong field (here 8 lines per nC). **Equipotential lines** (dashed green) join points of equal potential $\varphi = \sum k \cdot Q_i / r_i$ and are perpendicular to the field lines. Between the plates of a **capacitor** the field is uniform with $E = U / d$.

The background colour shows the field strength on a logarithmic scale; the force arrow is capped for very strong fields (≫). Edge effects of the capacitor are neglected.

## Try it

1. Drag the test charge around the dipole. [Dipole](?px=0&py=0)
2. Single charge: double the distance from 10 cm to 20 cm. [Single charge](?n=1&x1=0&y1=0&px=10&py=0)
3. Two equal charges: find the point where the field is zero. [Two equal charges](?q2=1&eq=1&px=0&py=6)
4. Unequal charges: where do the extra lines go? [+3 nC and −1 nC](?q1=3&q2=-1&px=0&py=8)
5. Capacitor: does $E$ change between the plates? [Capacitor](?mode=plates&eq=1&py=3)

## Tasks

### Task 1: Point charge

$Q = 1.0\,\text{nC}$. Find $E$ at $10\,\text{cm}$ and $20\,\text{cm}$. [Load task](?n=1&x1=0&y1=0&px=10&py=0&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$E \approx 899\,\frac{\text{N}}{\text{C}}$, at twice the distance a quarter: $\approx 225\,\frac{\text{N}}{\text{C}}$. [Show in the simulation](?n=1&x1=0&y1=0&px=10&py=0)

</details>

### Task 2: Dipole

$\pm 1\,\text{nC}$ at $x = \mp 10\,\text{cm}$. Find $E$ at the midpoint and the force on $q_0 = 1\,\text{nC}$. [Load task](?px=0&py=0&val=0&_hide=1)

<details>
<summary>Show solution</summary>

Both fields point towards the negative charge: $E \approx 2 \cdot 899 \approx 1798\,\frac{\text{N}}{\text{C}}$, $F \approx 1.80\,\mu\text{N}$. [Show in the simulation](?px=0&py=0)

</details>

### Task 3: Capacitor

$U = 1000\,\text{V}$, $d = 10\,\text{cm}$. Find $E$ and $F$ on $q_0 = 1\,\text{nC}$. [Load task](?mode=plates&py=3&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$E = U / d = 10\,000\,\frac{\text{V}}{\text{m}}$, $F = 10\,\mu\text{N}$. [Show in the simulation](?mode=plates&py=3&eq=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Compare with field patterns from semolina in oil.
- **Common stumbling blocks:**
  - “Field lines are paths of charges.” – They show the force direction.
  - “There is no field between the lines.” – The lines are only a selection.
