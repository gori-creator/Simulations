## What is it about?

A **simple pendulum** consists of a small, heavy body on a string of length $l$. If you pull it aside by the angle $\varphi_0$ and let go, the **restoring force** $F_R = m \cdot g \cdot \sin\varphi$ pulls it back towards the rest position. The time for one full swing there and back is the **period** $T$.

For **small amplitudes**, $\sin\varphi \approx \varphi$ (in radians). Then the restoring force is proportional to the displacement, the pendulum oscillates **harmonically**, and

$$
T_0 = 2\pi \sqrt{\frac{l}{g}}.
$$

$T_0$ depends only on the **length** and on the **gravitational field strength** $g$ – **not** on the mass: a heavier ball does feel a larger restoring force, but it is more inert to the same extent. Squaring gives $T^2 = \frac{4\pi^2}{g} \cdot l$: if you plot $T^2$ against $l$, the measured points lie on a **line through the origin** with slope $k = 4\pi^2/g$. This lets you measure $g$.

For **large amplitudes** the period becomes longer, because the restoring force $m g \sin\varphi$ is then smaller than $m g \varphi$. A good approximation up to about $60^\circ$ is

$$
T \approx T_0 \cdot \left(1 + \frac{\varphi_0^2}{16}\right) \quad (\varphi_0 \text{ in radians}).
$$

Up to about $22.8^\circ$, $T$ differs from $T_0$ by less than $1\,\%$; at $90^\circ$ it is already $18\,\%$. The simulation does not use an approximation: it solves the equation of motion with $\sin\varphi$ step by step (numerically). It calculates the exact period in the results with the **arithmetic–geometric mean** (AGM): starting from $1$ and $\cos\tfrac{\varphi_0}{2}$, you repeatedly form the arithmetic mean $\tfrac{a+b}{2}$ and the geometric mean $\sqrt{a b}$ until both are equal. Then $T = T_0 / \operatorname{AGM}(1;\, \cos\tfrac{\varphi_0}{2})$. This is equivalent to the elliptic integral from university formula books – for school the approximation above is enough.

**Energy:** potential energy and kinetic energy turn into each other:

$$
E_\text{pot} = m g l (1 - \cos\varphi) \qquad E_\text{kin} = \tfrac{1}{2} m v^2
$$

The **tension in the string** is largest at the lowest point: $F_S = m g \cos\varphi + m v^2/l$. A string can only pull. For $|\varphi_0| > 90^\circ$ it would go slack – the simulation then calculates with a rigid rod. With **damping** the amplitude decreases roughly as $e^{-\gamma t}$ (with the decay constant $\gamma = k/2$; $k$ is the damping on the slider).

## Try it

1. Drag the ball to the side and let go. Watch the energy bars swing between potential and kinetic energy while the total stays the same.
2. Change the mass while the pendulum is swinging. What happens to the motion, and what to the energies?
3. Switch on the force arrows. Where is the restoring force largest, where the string tension? [Forces from 90°](?arrows=F&amp=90)
4. Compare with the small-angle approximation (dashed “ghost pendulum”): at $70^\circ$ the approximation visibly drifts away in the graph. [Graphs](?mode=graphs&amp=70&compare=1)
5. **Series of measurements:** time 10 oscillations at different lengths. From two different lengths on, the simulation evaluates $T^2$ against $l$ in the results, from three lengths on also in the graph. What value of $g$ do you get? Repeat on the Moon. [Measurements](?mode=period&amp=6)
6. In the graph of $T/T_0$ against $\varphi_0$, tap different angles and find the angle from which the approximation is off by more than $1\,\%$. At what angle would a string go slack? [Large amplitude](?mode=large&amp=120&compare=1)
7. With damping, the path in the phase diagram becomes a spiral. [Damped](?mode=phase&amp=40&damping=0.2)

## Exercises

### Exercise 1: Seconds pendulum

How long must a pendulum on Earth be so that every half-swing takes exactly $1\,\text{s}$ ($T = 2\,\text{s}$)? Set the length so that $T_0 = 2.00\,\text{s}$ is shown. [Try it](?l=1)

<details>
<summary>Show solution</summary>

$$l = g \cdot \left(\frac{T}{2\pi}\right)^2 = 9.81\,\tfrac{\text{m}}{\text{s}^2} \cdot \left(\frac{2\,\text{s}}{2\pi}\right)^2 \approx 0.994\,\text{m}$$

With the slider ($l = 0.99\,\text{m}$) you get $T_0 \approx 2.00\,\text{s}$. That is why grandfather clocks with a seconds pendulum were so tall.

</details>

### Exercise 2: g from a series of measurements

A group measures $T = 1.42\,\text{s}$ at $0.5\,\text{m}$, $T = 2.01\,\text{s}$ at $1.0\,\text{m}$ and $T = 2.46\,\text{s}$ at $1.5\,\text{m}$. Find $g$ from the slope of $T^2$ against $l$. [Measure it yourself](?mode=period&amp=6&_hide=1)

<details>
<summary>Show solution</summary>

$T^2 \approx 2.016\,\text{s}^2$; $4.040\,\text{s}^2$; $6.052\,\text{s}^2$. The line through the origin has the slope $k = \frac{\sum l\,T^2}{\sum l^2} = \frac{14.126}{3.5} \approx 4.036\,\tfrac{\text{s}^2}{\text{m}}$, so $g = \frac{4\pi^2}{k} \approx 9.78\,\tfrac{\text{m}}{\text{s}^2}$ – close to the table value $9.81\,\tfrac{\text{m}}{\text{s}^2}$.

</details>

### Exercise 3: Pendulum on the Moon

What is $T_0$ of a $1\,\text{m}$ long pendulum on the Moon ($g = 1.62\,\tfrac{\text{m}}{\text{s}^2}$)? [Load exercise](?planet=mond&_hide=1)

<details>
<summary>Show solution</summary>

$T_0 = 2\pi \sqrt{1 / 1.62}\,\text{s} \approx 4.94\,\text{s}$ – $\sqrt{9.81/1.62} \approx 2.46$ times the value on Earth. [Show in the simulation](?planet=mond)

</details>

### Exercise 4: Energy and string tension

The ball ($m = 0.5\,\text{kg}$, $l = 1\,\text{m}$) is pulled aside by $20^\circ$. How fast is it at the lowest point? How large is the string tension there if you release it from $90^\circ$ instead?

<details>
<summary>Show solution</summary>

$h = l(1 - \cos 20^\circ) \approx 0.0603\,\text{m}$, $E_\text{pot} \approx 0.296\,\text{J}$. From $m g h = \tfrac12 m v^2$ it follows that $v = \sqrt{2 g h} \approx 1.09\,\tfrac{\text{m}}{\text{s}}$ – independent of the mass.

From $90^\circ$: $v^2 = 2 g l$, so $F_S = m g + m v^2 / l = 3 \cdot m g \approx 14.7\,\text{N}$ – three times the weight. [Show forces](?arrows=F&amp=90)

</details>

### Exercise 5: Large amplitude

By what percentage is the period at $\varphi_0 = 90^\circ$ longer than $T_0$? Why does a string go slack at $\varphi_0 = 120^\circ$?

<details>
<summary>Show solution</summary>

$T/T_0 = 1/\operatorname{AGM}(1;\, \cos 45^\circ) \approx 1.180$, so about $18\,\%$ longer ($T \approx 2.37\,\text{s}$ for $l = 1\,\text{m}$). At $120^\circ$ the ball is above the pivot; there $F_S = m g (3\cos\varphi - 2\cos\varphi_0)$, and already at release $F_S = m g \cos 120^\circ < 0$. A string cannot push – the ball would first fall freely. [Large amplitude](?mode=large&amp=120)

</details>

## Ideas for the classroom

- **Use:** mechanical oscillations and conservation of energy, grades 10 to 12 depending on the curriculum. The series of measurements works as a supplement to or preparation for a real student experiment with a stopwatch.
- **Measuring:** the simulation times 10 oscillations with a random reaction time (can be switched off). This lets you discuss why you measure many periods and why a small amplitude is chosen (at $20^\circ$, $T$ is already $0.8\,\%$ too long).
- **Model:** point mass on a massless string, exact equation of motion $\ddot\varphi = -\tfrac{g}{l}\sin\varphi - 2\gamma\dot\varphi$ solved numerically; the small-angle approximation runs alongside as a dashed comparison pendulum. For $|\varphi_0| > 90^\circ$ a rigid rod instead of a string.
- **Common pitfalls:**
  - “A heavier pendulum swings faster.” – The mass cancels out.
  - “With a larger amplitude the ball is faster, so $T$ is shorter.” – For small angles this balances exactly; for large angles $T$ even gets longer.
  - “The string tension always equals the weight.” – At the lowest point it is larger, because the centripetal force $m v^2 / l$ must also be provided.
