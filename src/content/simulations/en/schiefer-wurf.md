---
description: Interactive simulation of horizontal and oblique projectile motion – trajectory, range, height and time of flight on Earth, the Moon and Mars, with and without air resistance.
---

## What is it about?

A thrown ball performs two independent motions at the same time (**superposition**): a uniform horizontal motion with $v_x = v_0 \cos\alpha$ and a vertical throw with $v_{y,0} = v_0 \sin\alpha$, slowed down by $g$.

$$
x(t) = v_0 \cos\alpha \cdot t \qquad y(t) = h_0 + v_0 \sin\alpha \cdot t - \tfrac{1}{2} g t^2
$$

The trajectory is a parabola. From the ground ($h_0 = 0$): $T = \frac{2 v_0 \sin\alpha}{g}$, $w = \frac{v_0^2 \sin(2\alpha)}{g}$, $h_{\max} = \frac{v_0^2 \sin^2\alpha}{2g}$. The range is largest at $45^\circ$; complementary angles give the same range.

## Try it

1. Drag the tip of the orange arrow to change $v_0$ and $\alpha$, then press **Throw**.
2. Which angle goes furthest? [Compare angles](?family=1&angle=45)
3. Throw on the Moon. [Moon](?planet=mond&angle=45&v0=10)
4. Switch on air resistance. [Football](?air=1&v0=28&angle=35)

## Exercises

### Exercise 1: Range

A ball is thrown from the ground at $15\,\tfrac{\text{m}}{\text{s}}$ and $45^\circ$. Find time of flight, range and height. [Load exercise](?v0=15&angle=45&_hide=1)

<details>
<summary>Show solution</summary>

$T \approx 2.16\,\text{s}$, $w \approx 22.9\,\text{m}$, $h_{\max} \approx 5.7\,\text{m}$.

</details>

### Exercise 2: Horizontal throw from a tower

A stone is thrown horizontally at $8\,\tfrac{\text{m}}{\text{s}}$ from a $20\,\text{m}$ tower. When and where does it land? [Load exercise](?v0=8&angle=0&h0=20&_hide=1)

<details>
<summary>Show solution</summary>

$T = \sqrt{2 \cdot 20 / 9.81} \approx 2.02\,\text{s}$, $w \approx 16.2\,\text{m}$, impact speed $\approx 21.4\,\tfrac{\text{m}}{\text{s}}$.

</details>

## Notes for teachers

- **Use:** Mechanics, superposition of motions (grade 10/11).
- **Misconception:** "At the highest point the speed is zero" – only $v_y$ is zero.
