---
description: "Interactive free fall – stroboscopic picture with gaps in the ratio 1 : 3 : 5 : 7, laws of falling bodies on Earth, the Moon, Mars and Jupiter, a ball and a feather in a tube and a reaction test with a falling ruler."
---

## What is it about?

When you let go of an object, it falls faster and faster. Without air resistance, **free fall** is a **uniformly accelerated motion** with the gravitational acceleration $g$. In Central Europe $g \approx 9.81\,\tfrac{\text{m}}{\text{s}^2}$. Starting from rest, the **laws of free fall** are

$$
s = \tfrac{1}{2}\, g\, t^2 \qquad v = g \cdot t .
$$

For a drop height $h$ this gives the **fall time** and the **impact speed**

$$
t = \sqrt{\frac{2h}{g}} \qquad v = \sqrt{2\, g\, h}.
$$

**Converting to km/h:** An hour has $3600\,\text{s}$ and a kilometre $1000\,\text{m}$. So $1\,\tfrac{\text{m}}{\text{s}} = 3.6\,\tfrac{\text{km}}{\text{h}}$: multiply by $3.6$.

**Stroboscope:** If a lamp flashes at equal time intervals $\Delta t$, you see the ball at several positions. The gaps grow in the ratio $1 : 3 : 5 : 7 : \ldots$ – each gap is $g \cdot (\Delta t)^2$ larger than the one before.

**Mass does not matter:** Without air, a heavy ball and a light feather fall **equally fast**. In air, **air resistance** slows the feather down strongly: it soon reaches a small **terminal velocity** and then falls almost uniformly. On the Moon (no air), an astronaut of the Apollo 15 mission dropped a hammer and a feather in 1971 – both reached the ground at the same time.

**Other celestial bodies** have different values of $g$: Moon $1.62\,\tfrac{\text{m}}{\text{s}^2}$, Mars $3.71\,\tfrac{\text{m}}{\text{s}^2}$, Jupiter $24.79\,\tfrac{\text{m}}{\text{s}^2}$.

**Reaction time:** If you catch a falling ruler, the distance $s$ it fell gives your reaction time: $t = \sqrt{\frac{2s}{g}}$.

## Try it

1. Press **Drop** and look at the stroboscopic picture. Read the gaps on the blue bar: $1 : 3 : 5 : 7 : 9$.
2. Drag the ball in the drop tower (or the point in the distance–time graph) and watch how time and speed change. The triangle in the velocity–time graph shows the slope $g$, the area under the line shows the distance fallen.
3. Repeat the experiment on the Moon and on Jupiter. [On the Moon](?planet=mond)
4. Turn the **feather tube** over – once with air, once in a vacuum. [Tube with air](?mode=tube) · [Tube in a vacuum](?mode=tube&vac=1)
5. Measure your **reaction time**: press Start and catch the ruler (tap, click or space bar). Do at least five attempts. [Reaction test](?mode=ruler)

## Tasks

### Task 1: Drop tower

A ball falls from a height of $20\,\text{m}$ (no air resistance). How long does the fall take, and how fast is the ball at the bottom? [Load task](?_hide=1)

<details>
<summary>Show solution</summary>

$t = \sqrt{\frac{2 \cdot 20\,\text{m}}{9.81\,\text{m/s}^2}} \approx 2.02\,\text{s}$ and $v = g \cdot t \approx 19.8\,\tfrac{\text{m}}{\text{s}} \approx 71\,\tfrac{\text{km}}{\text{h}}$.

</details>

### Task 2: Analysing a stroboscopic picture

The stroboscope flashes every $0.4\,\text{s}$. Calculate the gaps between the first five images and their ratio. [Load task](?dt=0.4&_hide=1)

<details>
<summary>Show solution</summary>

Positions: $s(0.4\,\text{s}) \approx 0.78\,\text{m}$, $s(0.8\,\text{s}) \approx 3.14\,\text{m}$, $s(1.2\,\text{s}) \approx 7.06\,\text{m}$, $s(1.6\,\text{s}) \approx 12.56\,\text{m}$. Gaps: $0.78\,\text{m}$; $2.35\,\text{m}$; $3.92\,\text{m}$; $5.49\,\text{m}$ – so $1 : 3 : 5 : 7$. Each gap is $g \cdot (0.4\,\text{s})^2 \approx 1.57\,\text{m}$ larger than the one before.

</details>

### Task 3: On the Moon

How long does the ball take to fall $20\,\text{m}$ on the Moon? How many times longer is that than on Earth? [Load task](?planet=mond&_hide=1)

<details>
<summary>Show solution</summary>

$t = \sqrt{\frac{2 \cdot 20}{1.62}}\,\text{s} \approx 4.97\,\text{s}$ – about $\sqrt{9.81 / 1.62} \approx 2.5$ times as long as on Earth.

</details>

### Task 4: Depth of a well

A stone falls into a well and hits the water after $2\,\text{s}$. How deep is the well (ignore air resistance and the travel time of the sound)?

<details>
<summary>Show solution</summary>

$s = \tfrac12 \cdot 9.81\,\tfrac{\text{m}}{\text{s}^2} \cdot (2\,\text{s})^2 \approx 19.6\,\text{m}$. [Check in the simulation](?h=19.5) (nearest slider value $19.5\,\text{m}$, fall time $1.99\,\text{s}$)

</details>

### Task 5: Reaction time and reaction distance

Someone catches the ruler after $18\,\text{cm}$. What is the reaction time? How far does a car travelling at $50\,\tfrac{\text{km}}{\text{h}}$ move in this time before the driver even starts to brake?

<details>
<summary>Show solution</summary>

$t = \sqrt{\frac{2 \cdot 0.18\,\text{m}}{9.81\,\text{m/s}^2}} \approx 0.19\,\text{s}$. With $50\,\tfrac{\text{km}}{\text{h}} \approx 13.9\,\tfrac{\text{m}}{\text{s}}$ the reaction distance is about $13.9\,\tfrac{\text{m}}{\text{s}} \cdot 0.192\,\text{s} \approx 2.7\,\text{m}$. In traffic, about $1\,\text{s}$ of reaction time is assumed, because you first have to notice the danger and move your foot.

</details>

### Task 6: Feather and ball

Explain why the feather takes much longer in the tube with air, but falls just as fast as the ball in the evacuated tube. [With air](?mode=tube) · [Vacuum](?mode=tube&vac=1)

<details>
<summary>Show solution</summary>

The weight acts on both; without air, both accelerate with $g$ – regardless of their mass. In air, air resistance acts as well. It grows with the speed, and for the light feather with its large surface it equals the feather's weight at only about $0.6\,\tfrac{\text{m}}{\text{s}}$ – after that the feather does not get any faster. For the heavy, small ball it hardly matters over $1.5\,\text{m}$.

</details>

### Task 7: Apple from a tree

An apple falls from a tree at a height of $5\,\text{m}$. How fast is it when it hits the ground? Give the speed in $\tfrac{\text{m}}{\text{s}}$ and in $\tfrac{\text{km}}{\text{h}}$. [Load task](?h=5&_hide=1)

<details>
<summary>Show solution</summary>

$v = \sqrt{2 \cdot 9.81\,\tfrac{\text{m}}{\text{s}^2} \cdot 5\,\text{m}} = \sqrt{98.1}\,\tfrac{\text{m}}{\text{s}} \approx 9.9\,\tfrac{\text{m}}{\text{s}}$. Times $3.6$: $9.9 \cdot 3.6 \approx 36\,\tfrac{\text{km}}{\text{h}}$.

</details>

## Ideas for the classroom

- **Use:** Uniformly accelerated motion and the laws of free fall (grades 9/10), historical link to Galileo, application in traffic (reaction time). Each of the three experiments can be opened directly with a link containing `mode=…`.
- **Model:** The drop tower ignores air resistance. In the tube, air resistance is modelled as proportional to $v^2$, with terminal velocities of about $75\,\tfrac{\text{m}}{\text{s}}$ (steel ball, diameter $3\,\text{cm}$) and $0.6\,\tfrac{\text{m}}{\text{s}}$ (feather) – these are approximate values. The swaying of the feather is only hinted at. Jupiter has no solid surface; the value $24.79\,\tfrac{\text{m}}{\text{s}^2}$ applies at the height of the cloud tops – the drop tower there is a thought experiment.
- **Reaction test:** The ruler falls after a random waiting time (1.2 to 3.5 s). Screen and input devices add a delay of a few hundredths of a second, so the measured times are usually a little longer than with a real ruler. Comparing with a real ruler (pair work) is a good idea – with the ms scale switched on, the ruler becomes a “reaction time ruler”.
- **Common stumbling blocks:**
  - “Heavy objects fall faster.” – Only air resistance makes a difference.
  - “In equal times the object falls equal distances.” – The gaps in the stroboscopic picture keep growing, each time by the same amount $g \cdot (\Delta t)^2$.
  - “There is no gravity on the Moon.” – It is only about one sixth as strong.
  - “$g$ is a speed.” – $g$ tells you by how many $\tfrac{\text{m}}{\text{s}}$ the speed increases every second.
