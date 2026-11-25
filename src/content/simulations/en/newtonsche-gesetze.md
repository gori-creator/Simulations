## What is it about?

Isaac Newton summed up mechanics in three laws. The simulation shows an experiment for each.

### 1. Law of inertia

> A body stays at rest or moves in a straight line at constant speed as long as no force acts on it.

Every body is **inert**: it "wants" to keep its state of motion. When a truck brakes hard, a loose box on the platform keeps going – only friction slows it, and that is often not enough. That is why there are **seat belts** and load securing: the strap provides the force needed to brake the box (or the person).

### 2. Second law

$$
F = m \cdot a
$$

A weight pulls a cart over a pulley. The pulling force $F = m_h \cdot g$ has to accelerate **both** masses: $a = \frac{m_h \cdot g}{m_c + m_h}$. With **friction**, subtract $\mu \cdot m_c \cdot g$. Ignoring friction and treating the cart as a **point mass** is an **idealisation** you can test here.

### 3. Action and reaction

> If body A exerts a force on B, then B exerts an equal and opposite force on A.

The compressed spring pushes both carts apart with **equal** force. The lighter cart is accelerated more. Afterwards $m_1 \cdot v_1 = -m_2 \cdot v_2$.

## Try it

- [Loose box](?mode=traeg&gurt=0) and [strapped down](?mode=traeg&gurt=1): press "Start" and compare velocities.
- [F = m · a](?mode=grund&mc=0.5&mh=0.1&mu=0), [double cart mass](?mode=grund&mc=1&mh=0.1&mu=0), [with friction](?mode=grund&mu=0.1)
- [Push-off](?mode=wechsel&m1=1&m2=2): which cart is faster?

## Exercises

**1. Acceleration.** A 0.5 kg cart is pulled without friction by a 100 g weight. Find the acceleration and the time for 1.6 m. [Load exercise](?mode=grund&mc=0.5&mh=0.1&mu=0&_hide=1)

<details><summary>Show solution</summary>

$a = \frac{0.981}{0.6} \approx 1.64\,\frac{\text{m}}{\text{s}^2}$, $t = \sqrt{2 \cdot 1.6 / 1.64}\,\text{s} \approx 1.40\,\text{s}$.

</details>

**2. Double mass, half acceleration?** Double the cart mass to 1 kg. Why doesn't the acceleration halve exactly? [Load exercise](?mode=grund&mc=1&mh=0.1&mu=0&_hide=1)

<details><summary>Show solution</summary>

$a = 0.981 / 1.1 \approx 0.89\,\frac{\text{m}}{\text{s}^2}$: the total mass goes from 0.6 to 1.1 kg, not double.

</details>

**3. Box on the platform.** The truck brakes at 8 m/s², the friction coefficient is 0.3. How strongly is the box braked? [Load exercise](?mode=traeg&gurt=0&mub=0.3&_hide=1)

<details><summary>Show solution</summary>

At most $\mu g \approx 2.9\,\frac{\text{m}}{\text{s}^2}$ – the box slides forward and hits the front wall.

</details>

**4. Push-off.** A spring pushes a 1 kg and a 2 kg cart apart. The light cart moves at 2 m/s. How fast is the heavy one? [Load exercise](?mode=wechsel&m1=1&m2=2&F=20&_hide=1)

<details><summary>Show solution</summary>

Equal and opposite momenta: $v_2 = 1\,\frac{\text{m}}{\text{s}}$ in the opposite direction.

</details>

## Ideas for teaching

- Why do you tip backwards in a bus that starts moving?
- Do the track experiment with light gates and compare with the simulation.
- Common mistake: action and reaction act on **different** bodies, so they do not cancel.
