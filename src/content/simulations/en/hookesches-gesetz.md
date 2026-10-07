---
description: "Interactive Hooke’s law – hang weights on a spring, measure the extension, find the spring constant as the slope of the line through the origin, springs in series and in parallel, elastic limit."
---

## What is it about?

A weight of mass $m$ pulls on the spring with the force $F_G = m \cdot g$ ($g = 9.81\,\tfrac{\text{N}}{\text{kg}}$). Within the elastic range the **extension** $s$ of a coil spring is proportional to the force:

$$
F = D \cdot s
$$

In the force–extension graph the data lie on a straight line through the origin; its slope is the spring constant $D$ (in $\tfrac{\text{N}}{\text{m}}$). Beyond the **elastic limit** the spring stays deformed. Two springs **in series**: $\frac1D = \frac1{D_1} + \frac1{D_2}$; **in parallel**: $D = D_1 + D_2$.

## Try it

1. Tap the box to add weights one by one, or press **Automatic series**.
2. Pull the weights down and release them.
3. Overstretch the spring, then remove all weights. [Overstretch](?n=10&mp=100)
4. Compare springs in series and in parallel. [Series](?setup=series&mp=20) · [Parallel](?setup=parallel&mp=100)

## Tasks

### Task 1: Spring constant

Read the extension and calculate $D$. [Load task](?n=4&fit=0&_hide=1)

<details>
<summary>Show solution</summary>

$F \approx 1.96\,\text{N}$, $s \approx 0.098\,\text{m}$, so $D = F/s \approx 20\,\tfrac{\text{N}}{\text{m}}$.

</details>

### Task 2: Two springs

Two springs with $D = 20\,\tfrac{\text{N}}{\text{m}}$ each carry $200\,\text{g}$ in series. Find the extension. [Load task](?setup=series&n=4&_hide=1)

<details>
<summary>Show solution</summary>

$D = 10\,\tfrac{\text{N}}{\text{m}}$, so $s \approx 19.6\,\text{cm}$. In parallel: $D = 40\,\tfrac{\text{N}}{\text{m}}$ and $s \approx 4.9\,\text{cm}$.

</details>

## Notes for teachers

- A data point is recorded once the spring is at rest. Use `fit=0` to hide the fitted line.
- The mass of the spring is neglected; damping is qualitative. The elastic limit is a simple model (elastic up to $25\,\text{cm}$ extension).
- **Misconception:** “The length of the spring is proportional to the force” – it is the extension.
