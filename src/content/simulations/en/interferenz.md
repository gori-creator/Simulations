---
description: "Interactive simulation of the interference of two circular waves in a ripple tank – snapshot and amplitude pattern, nodal and antinodal lines as hyperbolas, path difference and phasor diagram at a draggable point, sources in antiphase and the far field as with the double slit."
---

## What is it about?

Two sources $E_1$ and $E_2$ at a distance $d$ dip into the water of a **ripple tank** in step and send out **circular waves** of wavelength $\lambda = \frac{c}{f}$. Where they meet, the displacements add up (**superposition**). Whether they reinforce or cancel at a point $P$ depends on the **path difference** $\Delta s = s_1 - s_2$:

- **maximum** (constructive): $\Delta s = k \cdot \lambda$, amplitude $2\hat y$,
- **minimum** (destructive): $\Delta s = \left(k + \tfrac{1}{2}\right) \cdot \lambda$, the water stays at rest.

In general $A = 2\hat y \cdot \left|\cos\frac{\delta}{2}\right|$ with $\delta = 2\pi \cdot \frac{\Delta s}{\lambda} + \Delta\varphi$ ($\Delta\varphi$: phase difference of the sources). All points with the same $\Delta s$ lie on a **hyperbola** with foci $E_1$ and $E_2$. Since $|\Delta s| \le d$, for sources in phase there are only the orders $|k| \le \frac{d}{\lambda}$ – for $d = 3\lambda$ the $7$ antinodal lines $k = -3, \dots, 3$.

Far away the hyperbolas approach straight lines through the centre: $\sin\alpha_k = k \cdot \frac{\lambda}{d}$ – the same formula as for the double slit.

The **snapshot** shows crests light and troughs dark, the **amplitude pattern** shows how strongly the water oscillates on average. The waves are shown greatly slowed down; damping is neglected.

## Try it

1. Press “Restart the waves” and watch the pattern build up.
2. Drag the cork $P$ onto a calm line and read off $\Delta s$. Repeat on another calm line.
3. Switch to the amplitude pattern with all lines. [Load example](?view=amp&lines=both)
4. Drag $E_2$ outwards. How many antinodal lines are there for $d = 2\lambda$, $3\lambda$, $4\lambda$?
5. Set $\Delta\varphi = 180°$. What happens on the perpendicular bisector? [Antiphase](?ph=180&lines=both&px=0&py=12)
6. Show the far field. [Far field](?d=4&lam=1.2&lines=max&far=1&view=amp&px=7&py=15)

## Tasks

### Task 1: Maximum or minimum?

$d = 6\,\text{cm}$, $\lambda = 2\,\text{cm}$, in phase. $P$ is $8\,\text{cm}$ straight above $E_2$. Find $s_1$, $s_2$, $\Delta s$ and decide. [Load task](?px=3&py=8&val=0&lines=none&_hide=1)

<details>
<summary>Show solution</summary>

$s_2 = 8\,\text{cm}$, $s_1 = 10\,\text{cm}$, $\Delta s = 2\,\text{cm} = 1 \cdot \lambda$: antinodal line of order 1, amplitude $2\hat y$. [Show in the simulation](?px=3&py=8&lines=max)

</details>

### Task 2: Counting lines

How many antinodal and nodal lines are there for $d = 7\,\text{cm}$ and $\lambda = 2\,\text{cm}$? [Load task](?d=7&lines=none&_hide=1)

<details>
<summary>Show solution</summary>

Antinodal: $|k| \le 3.5$, so $7$ lines. Nodal: $|\Delta s| = 1, 3, 5, 7\,\text{cm}$, so $8$ lines; the two with $|\Delta s| = d$ lie on the line through the sources, outside them. [Show](?d=7&lines=both&view=amp)

</details>

### Task 3: Far field

For $d = 4\,\text{cm}$ and $\lambda = 1.2\,\text{cm}$, find the directions of the antinodal lines far away.

<details>
<summary>Show solution</summary>

$\sin\alpha_k = 0.3 \cdot k$: $\alpha_1 \approx 17.5°$, $\alpha_2 \approx 36.9°$, $\alpha_3 \approx 64.2°$; $7$ antinodal lines in total. [Show](?d=4&lam=1.2&lines=max&far=1&view=amp)

</details>

## Ideas for the classroom

- **Use:** upper secondary, interference of mechanical waves, as a bridge to the double slit; a good companion to a real ripple tank, since here everything can be paused, slowed down and measured. With `val=0` the values in the picture are hidden for measuring tasks.
- **Model:** equal amplitudes, no damping, ideal point sources.
- **Common stumbling blocks:**
  - “There are no waves on the nodal lines.” – Both waves pass through; they just cancel.
  - “The path difference is the distance between the sources.” – It is the difference of the paths to $P$; only on the axis outside the sources is $|\Delta s| = d$.
  - “A stable pattern needs any two waves.” – It needs equal frequency and a fixed phase difference (coherence).
