---
description: "Interactive Hooke’s law – hang weights on a spring, measure the extension, find the spring constant as the slope of the line through the origin, springs in series and in parallel, elastic limit."
---

## What is it about?

If you hang a weight on a coil spring, its **weight** (the force of gravity on it) pulls on the spring:

$$
F_G = m \cdot g \qquad g = 9.81\,\tfrac{\text{N}}{\text{kg}}
$$

So a weight of $100\,\text{g}$ is pulled down with a force of just under $1\,\text{N}$. The spring gets longer until its **spring force** is as large as the weight – then it hangs at rest.

**Hooke’s law:** For a coil spring the **extension** $s$ is proportional to the force $F$:

$$
F = D \cdot s
$$

Twice the force means twice the extension. In the **F–s graph** the data points therefore lie on a **straight line through the origin**. Its slope is the **spring constant** $D = \frac{F}{s}$ (unit $\tfrac{\text{N}}{\text{m}}$). A spring with $D = 20\,\tfrac{\text{N}}{\text{m}} = 0.2\,\tfrac{\text{N}}{\text{cm}}$ is stretched by $5\,\text{cm}$ by a force of $1\,\text{N}$. The larger $D$, the stiffer the spring. The **spring balance** (force meter) is based on this law.

**Elastic limit:** The law only holds as long as the spring is deformed **elastically**, i.e. it returns to its old length when the load is removed. If you stretch it too far, it stays **deformed**; the data points then no longer lie on the line.

**Two springs:**

- **In series** each spring carries the whole load, and the extensions add up: $\frac{1}{D} = \frac{1}{D_1} + \frac{1}{D_2}$. Two equal springs together are half as stiff.
- **In parallel** the springs share the load: $D = D_1 + D_2$. Two equal springs together are twice as stiff.

## Try it

1. Tap the box and hang the weights on one after another. Each time, wait until the spring is at rest – then the data point appears in the graph. Or press **Automatic series**.
2. Pull the weights down and let go. Compare the force arrows while the spring oscillates.
3. Use a softer spring. How does the line change? [Soft spring](?D1=10&mp=20)
4. Overstretch the spring and then remove all weights. [Overstretch](?n=10&mp=100)
5. Compare two springs in series and in parallel with a single spring. [In series](?setup=series&mp=20) · [In parallel](?setup=parallel&mp=100)

## Tasks

### Task 1: Weight

Six weights of $50\,\text{g}$ each hang on the spring. How large is the weight (the force of gravity)?

<details>
<summary>Show solution</summary>

$m = 300\,\text{g} = 0.3\,\text{kg}$, so $F_G = 0.3\,\text{kg} \cdot 9.81\,\tfrac{\text{N}}{\text{kg}} \approx 2.94\,\text{N}$. [Show in the simulation](?n=6)

</details>

### Task 2: Finding the spring constant

Read the extension from the scale and calculate the spring constant. [Load task](?n=4&fit=0&_hide=1)

<details>
<summary>Show solution</summary>

$F = 0.2\,\text{kg} \cdot 9.81\,\tfrac{\text{N}}{\text{kg}} \approx 1.96\,\text{N}$ and $s \approx 9.8\,\text{cm} = 0.098\,\text{m}$, so $D = \frac{F}{s} \approx \frac{1.96\,\text{N}}{0.098\,\text{m}} = 20\,\tfrac{\text{N}}{\text{m}}$. Several data points and the line through the origin give a more accurate value.

</details>

### Task 3: Prediction

A spring has the spring constant $D = 25\,\tfrac{\text{N}}{\text{m}}$. How far is it stretched by $300\,\text{g}$? Check with the simulation.

<details>
<summary>Show solution</summary>

$s = \frac{F}{D} = \frac{2.94\,\text{N}}{25\,\text{N/m}} \approx 0.118\,\text{m} = 11.8\,\text{cm}$. [Check](?D1=25&n=6)

</details>

### Task 4: Building a spring balance

A spring with $D = 50\,\tfrac{\text{N}}{\text{m}}$ is to become a spring balance. How far apart must the marks for $1\,\text{N}$, $2\,\text{N}$, $3\,\text{N}$ … be?

<details>
<summary>Show solution</summary>

$s = \frac{1\,\text{N}}{50\,\text{N/m}} = 0.02\,\text{m}$ – one mark every $2\,\text{cm}$. Because $F$ and $s$ are proportional, the scale is evenly spaced. [Try it](?D1=50&mp=100&n=5)

</details>

### Task 5: Two springs

Two equal springs with $D = 20\,\tfrac{\text{N}}{\text{m}}$ each are hung in series and loaded with $200\,\text{g}$. How large is the extension? And if the springs hang in parallel? [Load task](?setup=series&n=4&_hide=1)

<details>
<summary>Show solution</summary>

In series: $D = 10\,\tfrac{\text{N}}{\text{m}}$, so $s = \frac{1.96\,\text{N}}{10\,\text{N/m}} \approx 19.6\,\text{cm}$ – each spring carries the full load and is stretched by $9.8\,\text{cm}$. In parallel: $D = 40\,\tfrac{\text{N}}{\text{m}}$, so $s \approx 4.9\,\text{cm}$. [Show in parallel](?setup=parallel&n=4)

</details>

### Task 6: Measuring range

Why does every spring balance show a maximum value that you should not exceed?

<details>
<summary>Show solution</summary>

Beyond the elastic limit the spring is permanently deformed. Afterwards the spring balance no longer shows zero without a load, and $F$ and $s$ are no longer proportional – the scale is no longer correct. [Overstretch](?n=10&mp=100)

</details>

## Ideas for the classroom

- **Use:** force and deformation, weight, Hooke’s law and the spring balance (years 7/8). Springs in series and in parallel are suitable for going deeper. The simulation calls the quantity $D$ the **spring constant** (German: Federhärte); some textbooks use $k$ for it and write the extension as $\Delta l$ or $x$.
- **Measuring as in the experiment:** A data point is only recorded once the spring is at rest. With `fit=0` the line through the origin is hidden so that the students can draw it themselves. The table of measurements is shown with the results.
- **Model:** The mass of the spring is neglected; the oscillation is damped (damping chosen freely, only qualitative). The elastic limit is greatly simplified: a new spring stays elastic up to $25\,\text{cm}$ extension; beyond that it gives way more easily (half the spring constant) and stays longer after unloading. Real springs behave differently depending on the material. With the springs in parallel, the load hangs so that the crossbar stays horizontal. The simulation uses $g = 9.81\,\tfrac{\text{N}}{\text{kg}}$. If your class uses $g \approx 10\,\tfrac{\text{N}}{\text{kg}}$, the forces come out about $2\,\%$ larger, and so does the spring constant.
- **Common stumbling blocks:**
  - “The **length** of the spring is proportional to the force.” – it is the **extension** that is proportional.
  - “Mass and weight are the same.” – $m$ in kg, $F_G$ in N.
  - “Two springs in series are stiffer than one.” – they are softer.
  - “Every object obeys Hooke’s law.” – only in the elastic range, and not every object (e.g. a rubber band).
