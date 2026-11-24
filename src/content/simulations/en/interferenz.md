## What is it about?

In a **ripple tank**, two sources $E_1$ and $E_2$ a distance $d$ apart dip into the water in step. Each produces **circular waves** with the same wavelength $\lambda = \frac{c}{f}$. Where the waves meet, their displacements add up (**superposition**): $y = y_1 + y_2$.

Whether they reinforce or cancel each other at a point $P$ depends only on the distances $s_1$ and $s_2$ that the waves travel to $P$ – more precisely on the **path difference**

$$
\Delta s = s_1 - s_2 .
$$

For sources in phase:

- **Maximum** (constructive interference): $\Delta s = k \cdot \lambda$ – crest meets crest, trough meets trough; the amplitude is $2\hat y$.
- **Minimum** (destructive interference): $\Delta s = \left(k + \tfrac{1}{2}\right) \cdot \lambda$ – crest meets trough; the water stays at rest.

Here $k = 0, \pm 1, \pm 2, \dots$ is the **order**. In general $P$ oscillates with the amplitude

$$
A = 2\hat y \cdot \left|\cos\frac{\delta}{2}\right| \quad \text{with} \quad \delta = 2\pi \cdot \frac{\Delta s}{\lambda} + \Delta\varphi ,
$$

where $\Delta\varphi$ is the phase difference between the sources. In the **phasor diagram** you can see this directly: the two phasors of length $\hat y$ are placed tip to tail; their sum is long when they point in the same direction and zero when they point in opposite directions.

All points with the same path difference lie on a **hyperbola** with the foci $E_1$ and $E_2$. That is why you see calm **nodal lines** and strongly moving **antinodal lines** in the water, spreading out like a fan. Because $|\Delta s| \le d$ by the triangle inequality, there are only finitely many: for sources in phase, $|k| \le \frac{d}{\lambda}$. For $d = 3\lambda$ these are the $7$ antinodal lines $k = -3, \dots, 3$; the outermost lie on the line through the sources, outside them.

**Far field:** far away from the sources, the hyperbolas approach straight lines through the centre. Their direction is given by

$$
\sin \alpha_k = \frac{\Delta s_k}{d} = k \cdot \frac{\lambda}{d} .
$$

You will meet exactly this formula again with the **double slit** for light.

**About the display:** in the **snapshot**, crests are light and troughs dark. The **amplitude pattern** shows how strongly the water oscillates on average at each point: dark = node, light = antinode. In reality the waves oscillate at about $10\,\text{Hz}$; in the picture they run strongly slowed down (the top right shows by how much). Damping of the waves is neglected.

## Try it

1. Press “Restart the waves”. Where does the pattern appear first? From when on does it stop changing?
2. Drag the cork $P$ (the measuring point) onto a calm line and read off $\Delta s$. Repeat this on another calm line. What do you notice?
3. Switch to the amplitude pattern and show both kinds of line. [Load example](?view=amp&lines=both)
4. Slowly drag $E_2$ outwards. How many antinodal lines are there at $d = 2\lambda$, $3\lambda$, $4\lambda$? What happens when a new line is “born”?
5. Make $d$ smaller than $\frac{\lambda}{2}$. Why do all nodal lines disappear? [d < λ/2](?d=0.8&lam=2.4&lines=both&view=amp)
6. Set $\Delta\varphi = 180°$. What happens on the perpendicular bisector? Watch the phasor diagram as well. [Antiphase](?ph=180&lines=both&px=0&py=12)
7. Show the far field and compare the dashed directions with the hyperbolas far up. [Far field](?d=4&lam=1.2&lines=max&far=1&view=amp&px=7&py=15)

## Exercises

### Exercise 1: Maximum or minimum?

The sources are $6\,\text{cm}$ apart and oscillate in phase with $\lambda = 2\,\text{cm}$. The point $P$ lies $8\,\text{cm}$ vertically above $E_2$. Find $s_1$, $s_2$ and $\Delta s$. How does the water oscillate at $P$? [Load exercise](?px=3&py=8&val=0&lines=none&_hide=1)

<details>
<summary>Show solution</summary>

$s_2 = 8\,\text{cm}$, $s_1 = \sqrt{(6\,\text{cm})^2 + (8\,\text{cm})^2} = 10\,\text{cm}$, so $\Delta s = 2\,\text{cm} = 1 \cdot \lambda$. $P$ lies on the first-order antinodal line and oscillates with the amplitude $2\hat y$. [Show in the simulation](?px=3&py=8&lines=max)

</details>

### Exercise 2: Partial reinforcement

As in exercise 1, but with $\lambda = 1.6\,\text{cm}$. Calculate the amplitude at $P$. [Load exercise](?px=3&py=8&lam=1.6&val=0&lines=none&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{\Delta s}{\lambda} = \frac{2\,\text{cm}}{1.6\,\text{cm}} = 1.25$, so $\delta = 2.5\pi$ and $A = 2\hat y \cdot |\cos(1.25\pi)| \approx 1.41\,\hat y$. The phasors are perpendicular to each other. [Show in the simulation](?px=3&py=8&lam=1.6)

</details>

### Exercise 3: Counting lines

How many antinodal and nodal lines are there for $d = 7\,\text{cm}$ and $\lambda = 2\,\text{cm}$ (in phase)? [Load exercise](?d=7&lines=none&_hide=1)

<details>
<summary>Show solution</summary>

Antinodal lines: $|k| \le \frac{7}{2} = 3.5$, so $k = -3, \dots, 3$: $7$ lines. Nodal lines: $|\Delta s| = 1, 3, 5, 7\,\text{cm} \le d$, so $8$ lines – the two with $|\Delta s| = 7\,\text{cm} = d$ lie on the line through the sources, outside them. [Show in the simulation](?d=7&lines=both&view=amp)

</details>

### Exercise 4: Sources in antiphase

What changes in exercise 1 if $E_2$ oscillates in antiphase ($\Delta\varphi = 180°$)? Which line now lies on the perpendicular bisector?

<details>
<summary>Show solution</summary>

The additional phase difference $\pi$ swaps maxima and minima: at $P$, $\delta = 2\pi + \pi$, so $A = 0$. On the perpendicular bisector ($\Delta s = 0$) there is now a nodal line. Antinodal lines exist for $\Delta s = \pm 1, \pm 3, \pm 5\,\text{cm}$, so there are $6$. [Show in the simulation](?ph=180&px=3&py=8&lines=both)

</details>

### Exercise 5: Far field

For $d = 4\,\text{cm}$ and $\lambda = 1.2\,\text{cm}$: at what angles to the perpendicular bisector do the antinodal lines lie far away? How many are there in total? [Load exercise](?d=4&lam=1.2&lines=none&_hide=1)

<details>
<summary>Show solution</summary>

$\sin\alpha_k = k \cdot \frac{1.2}{4} = 0.3 \cdot k$: $\alpha_1 \approx 17.5°$, $\alpha_2 \approx 36.9°$, $\alpha_3 \approx 64.2°$. For $k = 4$, $\sin\alpha$ would be greater than 1. In total $7$ antinodal lines ($k = -3, \dots, 3$). [Show in the simulation](?d=4&lam=1.2&lines=max&far=1&view=amp)

</details>

### Exercise 6: Measuring the wavelength

In a ripple tank with $d = 5\,\text{cm}$, the first maximum is measured far away at $\alpha_1 = 23.6°$. Find $\lambda$ and, with $c = 20\,\frac{\text{cm}}{\text{s}}$, the frequency of the sources.

<details>
<summary>Show solution</summary>

$\lambda = d \cdot \sin\alpha_1 = 5\,\text{cm} \cdot 0.400 \approx 2.0\,\text{cm}$, $f = \frac{c}{\lambda} = 10\,\text{Hz}$. This is how you will later determine the wavelength of light with a double slit. [Check](?d=5&lam=2&lines=max&far=1&view=amp)

</details>

### Exercise 7: A phase shift moves the pattern

As in exercise 1, $d = 6\,\text{cm}$ and $\lambda = 2\,\text{cm}$. But now $E_2$ leads the source $E_1$ by $\Delta\varphi = 90°$. At what path difference is the antinodal line that previously lay on the perpendicular bisector? Is it now closer to $E_1$ or to $E_2$? How many antinodal lines are there? [Load exercise](?ph=90&lines=none&_hide=1)

<details>
<summary>Show solution</summary>

A maximum means $\delta = 2\pi \cdot \frac{\Delta s}{\lambda} + \frac{\pi}{2} = k \cdot 2\pi$, so $\Delta s = \left(k - \tfrac{1}{4}\right) \cdot \lambda$. For $k = 0$, $\Delta s = -0.5\,\text{cm}$: there $s_1$ is $0.5\,\text{cm}$ shorter than $s_2$. So the line has moved towards $E_1$, the source that lags behind. Its wave has a shorter path and so makes up the quarter period. Antinodal lines exist for $\Delta s = -4.5;\ -2.5;\ -0.5;\ 1.5;\ 3.5;\ 5.5\,\text{cm}$, so there are $6$. The pattern is no longer symmetric. [Show in the simulation](?ph=90&lines=max&view=amp)

</details>

## Ideas for the classroom

- **Use:** in upper secondary in the topic of interference of mechanical waves, as preparation for the double slit and the grating. Good as a complement to the real experiment in the ripple tank: what is fast and fleeting there can be paused, slowed down and measured here. Which grade it fits depends on the curriculum.
- **Suggested sequence:** first watch the snapshot and let the class find the calm lines, then use the measuring point to discover the condition $\Delta s = (k + \frac{1}{2}) \cdot \lambda$ themselves, and only then show the amplitude pattern and the hyperbolas. With “Show values in the picture” switched off (`val=0`), measuring tasks can be set.
- **Model:** equal amplitudes, no damping, ideal point sources. In a real ripple tank the amplitude decreases with distance; the nodal lines are then not completely at rest.
- **Common pitfalls:**
  - “There are no waves on the nodal lines.” – Both waves pass through there; they just cancel each other out.
  - “The path difference is the distance between the sources.” – $\Delta s$ is the difference of the paths to the point $P$; only on the line through the sources, outside them, is $|\Delta s| = d$.
  - “More distance, same lines, just further apart.” – With a larger $d$, additional lines appear; their number depends on $\frac{d}{\lambda}$.
  - “Interference works with any waves.” – A stable pattern only exists with the same frequency and a fixed phase difference (coherence).
- **Further topics:** double slit and grating with light, interference of sound (two loudspeakers), active noise cancelling in headphones.
