---
description: "Interactive simulation of horizontal and oblique projectile motion – trajectory with stroboscope and vectors, splitting into x and y motion, angle comparison, target practice and air resistance on Earth, the Moon and Mars."
---

## What is it about?

A thrown ball performs two motions **at the same time** that do not affect each other (**principle of superposition**):

- **horizontal:** a uniform motion with the constant speed $v_x = v_0 \cdot \cos\alpha$,
- **vertical:** a vertical throw with $v_{y,0} = v_0 \cdot \sin\alpha$, slowed down by the gravitational acceleration $g$: $v_y(t) = v_0 \sin\alpha - g\,t$.

$$
x(t) = v_0 \cos\alpha \cdot t \qquad y(t) = h_0 + v_0 \sin\alpha \cdot t - \tfrac{1}{2} g t^2
$$

Eliminating $t$ gives the **trajectory** – a parabola:

$$
y = h_0 + \tan\alpha \cdot x - \frac{g}{2 v_0^2 \cos^2\alpha} \cdot x^2
$$

For a launch from the ground ($h_0 = 0$), time of flight, range and maximum height are:

$$
T = \frac{2 v_0 \sin\alpha}{g} \qquad w = \frac{v_0^2 \sin(2\alpha)}{g} \qquad h_{\max} = \frac{v_0^2 \sin^2\alpha}{2g}
$$

The range is then largest at $\alpha = 45^\circ$. Two angles that add up to $90^\circ$ (e.g. $30^\circ$ and $60^\circ$) give the same range. If you throw from a height $h_0 > 0$, the best angle is **below** $45^\circ$. In a **horizontal throw** ($\alpha = 0^\circ$) the flight lasts exactly as long as a free fall from $h_0$: $T = \sqrt{2h_0/g}$. The range is then $w = v_0 \cdot \sqrt{2h_0/g}$.

The **speed** combines both components: $v = \sqrt{v_x^2 + v_y^2}$. Without air resistance the ball lands with $v = \sqrt{v_0^2 + 2 g h_0}$ – this also follows from conservation of energy.

## Try it

1. Drag the tip of the orange arrow to change $v_0$ and $\alpha$, then press **Throw**. Drag the launch point upwards to change $h_0$.
2. Open the components view. The blue shadow on the ground moves uniformly, the red one on the vertical rail moves like a vertical throw. Drag in a graph to move through time. [Components](?mode=parts&v0=14&angle=50)
3. Which angle gives the largest range? Tap different angles in the graph. [Compare angles](?mode=angles&angle=45)
4. Throw at $v_0 = 10\,\tfrac{\text{m}}{\text{s}}$ from $h_0 = 20\,\text{m}$. Where is the maximum now? (At about $24^\circ$.) [From 20 m](?mode=angles&v0=10&h0=20&angle=24)
5. Hit the target! After the first hit the simulation shows both solution angles. [Target](?mode=target)
6. Compare a football, a table tennis ball and a shot put with and without air. [Air resistance](?mode=drag&v0=28&angle=35)
7. On the Moon ($g = 1.62\,\tfrac{\text{m}}{\text{s}^2}$) the same ball flies about 6 times as far: $19.86\,\text{m}$ become $120.3\,\text{m}$. [Moon](?planet=mond)

## Tasks

### Task 1: Calculating the range

A ball is thrown from the ground at $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$ at $45^\circ$ ($g = 9.81\,\tfrac{\text{m}}{\text{s}^2}$). Calculate the time of flight, the range and the maximum height. [Load task](?v0=15&angle=45&_hide=1)

<details>
<summary>Show solution</summary>

$$T = \frac{2 \cdot 15 \cdot \sin 45^\circ}{9.81}\,\text{s} \approx 2.16\,\text{s} \qquad w = \frac{15^2 \cdot \sin 90^\circ}{9.81}\,\text{m} \approx 22.9\,\text{m} \qquad h_{\max} = \frac{15^2 \cdot \sin^2 45^\circ}{2 \cdot 9.81}\,\text{m} \approx 5.73\,\text{m}$$

</details>

### Task 2: Same range

Show that $30^\circ$ and $60^\circ$ give the same range at $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$. Which path is higher, which one takes longer? [Show comparison](?mode=angles&angle=30)

<details>
<summary>Show solution</summary>

$\sin(2 \cdot 30^\circ) = \sin 60^\circ = \sin 120^\circ = \sin(2 \cdot 60^\circ)$, so $w \approx 19.86\,\text{m}$ for both. The $60^\circ$ throw is three times as high ($8.60\,\text{m}$ instead of $2.87\,\text{m}$, because $\sin^2 60^\circ : \sin^2 30^\circ = 3$) and takes $\sqrt{3}$ times as long ($2.65\,\text{s}$ instead of $1.53\,\text{s}$).

</details>

### Task 3: Horizontal throw from a tower

A stone is thrown horizontally at $10\,\tfrac{\text{m}}{\text{s}}$ from a $20\,\text{m}$ high tower. When and where does it land? How fast is it then? [Load task](?v0=10&angle=0&h0=20&_hide=1)

<details>
<summary>Show solution</summary>

$T = \sqrt{2 \cdot 20 / 9.81}\,\text{s} \approx 2.02\,\text{s}$, $w = 10 \cdot 2.02\,\text{m} \approx 20.2\,\text{m}$. On impact $v_y = 9.81 \cdot 2.02\,\tfrac{\text{m}}{\text{s}} \approx 19.8\,\tfrac{\text{m}}{\text{s}}$, so

$$v = \sqrt{10^2 + 19.8^2}\,\tfrac{\text{m}}{\text{s}} \approx 22.2\,\tfrac{\text{m}}{\text{s}}.$$

</details>

### Task 4: Hitting the target

A target hangs $18\,\text{m}$ away at a height of $2\,\text{m}$. The ball starts on the ground at $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$. At which angles does it hit? Put $x = 18\,\text{m}$, $y = 2\,\text{m}$ into the trajectory equation and solve for $\tan\alpha$ (using $\tfrac{1}{\cos^2\alpha} = 1 + \tan^2\alpha$). [Load task](?mode=target&tx=18&ty=2&_hide=1)

<details>
<summary>Show solution</summary>

$2 = 18\tan\alpha - \frac{9.81 \cdot 18^2}{2 \cdot 15^2}(1 + \tan^2\alpha)$ leads to $7.063\tan^2\alpha - 18\tan\alpha + 9.063 = 0$. Solutions: $\tan\alpha \approx 0.691$ or $1.858$, so $\alpha \approx 34.6^\circ$ (flat path) and $\alpha \approx 61.7^\circ$ (steep path). With less than about $14.05\,\tfrac{\text{m}}{\text{s}}$ the target would be out of reach. [Show solution](?mode=target&tx=18&ty=2&angle=35&sol=1)

</details>

### Task 5: Air resistance

Compare the path of a football ($v_0 = 28\,\tfrac{\text{m}}{\text{s}}$, $\alpha = 35^\circ$) with and without air. Name three differences and explain the energy graph. [Air resistance](?mode=drag&v0=28&angle=35&_hide=1)

<details>
<summary>Show solution</summary>

Without air: $w = \frac{28^2 \cdot \sin 70^\circ}{9.81}\,\text{m} \approx 75.1\,\text{m}$. With air the ball only flies about $45.7\,\text{m}$ and not as high; the path is no longer a parabola, the apex lies further along, and the ball comes down more steeply. The best angle is about $41^\circ$, i.e. below $45^\circ$. The energy per kilogram $\tfrac12 v^2 + g\,y$ stays constant without air; with air it decreases – it is converted into internal energy of the air and the ball.

</details>

### Task 6: Horizontal throw on the Moon

The same stone as in Task 3 is thrown horizontally on the Moon ($g = 1.62\,\tfrac{\text{m}}{\text{s}^2}$) at $10\,\tfrac{\text{m}}{\text{s}}$ from a height of $20\,\text{m}$. Calculate the time of flight, the range and the impact speed. By what factor is the range larger than on Earth? [Load task](?planet=mond&v0=10&angle=0&h0=20&_hide=1)

<details>
<summary>Show solution</summary>

$T = \sqrt{2 \cdot 20 / 1.62}\,\text{s} \approx 4.97\,\text{s}$, $w = 10 \cdot 4.97\,\text{m} \approx 49.7\,\text{m}$. On impact $v_y = 1.62 \cdot 4.97\,\tfrac{\text{m}}{\text{s}} \approx 8.05\,\tfrac{\text{m}}{\text{s}}$, so $v = \sqrt{10^2 + 8.05^2}\,\tfrac{\text{m}}{\text{s}} \approx 12.8\,\tfrac{\text{m}}{\text{s}}$. The range is larger by the factor $\sqrt{9.81/1.62} \approx 2.46$ than on Earth ($20.2\,\text{m}$).

</details>

## Ideas for the classroom

- **Use:** mechanics, superposition of motions, grade 10 or 11 depending on the curriculum. The components view works well as an introduction, the target mode as practice or as a group challenge.
- **Representation:** stroboscope dots and shadows show that the horizontal spacing stays the same while the vertical spacing does not. With **slow motion** and dragging in the graphs you can discuss individual moments.
- **Model:** point mass, constant $g$; air resistance quadratic in $v$ with approximate values (football $m = 0.43\,\text{kg}$, $d = 22\,\text{cm}$, $c_w \approx 0.25$; table tennis ball $2.7\,\text{g}$; shot put $7.26\,\text{kg}$). There is no air on the Moon, and on Mars it is about 60 times thinner.
- **Common stumbling blocks:**
  - "At the highest point the speed is zero." – Only $v_y$ is zero, $v_x$ stays the same.
  - "A fast ball thrown horizontally falls more slowly." – The time of fall depends only on $h_0$.
  - "$45^\circ$ is always best." – Only for $h_0 = 0$ and without air resistance.
