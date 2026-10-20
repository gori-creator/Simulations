---
description: "Interactive simulation of horizontal and oblique projectile motion – trajectory with stroboscope and vectors, splitting into x and y motion, angle comparison, target practice and air resistance on Earth, the Moon and Mars."
---

## What is it about?

A thrown ball performs two independent motions at the same time (**superposition**): a uniform horizontal motion with $v_x = v_0 \cos\alpha$ and a vertical throw with $v_{y,0} = v_0 \sin\alpha$, slowed down by $g$.

$$
x(t) = v_0 \cos\alpha \cdot t \qquad y(t) = h_0 + v_0 \sin\alpha \cdot t - \tfrac{1}{2} g t^2
$$

The trajectory is a parabola. From the ground ($h_0 = 0$): $T = \frac{2 v_0 \sin\alpha}{g}$, $w = \frac{v_0^2 \sin(2\alpha)}{g}$, $h_{\max} = \frac{v_0^2 \sin^2\alpha}{2g}$. The range is largest at $45^\circ$; complementary angles give the same range. From a height $h_0 > 0$ or with air resistance the best angle is smaller.

## Try it

1. Drag the tip of the orange arrow to change $v_0$ and $\alpha$, then press **Throw**.
2. Watch the shadows on the axes and drag along the graphs. [Components](?mode=parts&v0=14&angle=50)
3. Which angle goes furthest? [Compare angles](?mode=angles&angle=45)
4. Hit the target – the solution angles appear after the first hit. [Target](?mode=target)
5. Compare with and without air. [Air resistance](?mode=drag&v0=28&angle=35)

## Tasks

### Task 1: Range

A ball is thrown from the ground at $15\,\tfrac{\text{m}}{\text{s}}$ and $45^\circ$. Find time of flight, range and height. [Load task](?v0=15&angle=45&_hide=1)

<details>
<summary>Show solution</summary>

$T \approx 2.16\,\text{s}$, $w \approx 22.9\,\text{m}$, $h_{\max} \approx 5.73\,\text{m}$.

</details>

### Task 2: Horizontal throw from a tower

A stone is thrown horizontally at $10\,\tfrac{\text{m}}{\text{s}}$ from a $20\,\text{m}$ tower. When and where does it land, and how fast? [Load task](?v0=10&angle=0&h0=20&_hide=1)

<details>
<summary>Show solution</summary>

$T = \sqrt{2 \cdot 20 / 9.81}\,\text{s} \approx 2.02\,\text{s}$, $w \approx 20.2\,\text{m}$, impact speed $\sqrt{10^2 + 19.8^2}\,\tfrac{\text{m}}{\text{s}} \approx 22.2\,\tfrac{\text{m}}{\text{s}}$.

</details>

### Task 3: Target

A target is $18\,\text{m}$ away and $2\,\text{m}$ high; $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$ from the ground. Which angles hit it? [Load task](?mode=target&tx=18&ty=2&_hide=1)

<details>
<summary>Show solution</summary>

$7.063\tan^2\alpha - 18\tan\alpha + 9.063 = 0$ gives $\alpha \approx 34.6^\circ$ (flat) and $\alpha \approx 61.7^\circ$ (steep). [Show](?mode=target&tx=18&ty=2&angle=35&sol=1)

</details>

## Ideas for the classroom

- **Use:** mechanics, superposition of motions (grade 10/11); the target mode works well as a group challenge.
- **Common stumbling blocks:** "At the highest point the speed is zero" – only $v_y$ is zero. "45° is always best" – only for $h_0 = 0$ without air.
