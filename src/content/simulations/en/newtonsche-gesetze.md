## What is it about?

Isaac Newton summed up mechanics in three laws. The simulation shows an experiment for each. It also covers the resultant force with static and sliding friction, scales in a lift as an everyday example, a measurement series for the second law and practice tasks.

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

### Forces and motion: the resultant force

When several forces act on a body, their sum counts: the **resultant force** $F_\text{res}$. If it is zero, the motion does not change (first law); otherwise $F_\text{res} = m \cdot a$.

When you push a box, **friction** acts against the motion:

- **Static friction:** while the box is at rest, friction holds exactly against the push – at most $F_\text{s} = \mu_\text{s} \cdot m \cdot g$. A smaller push leaves the box at rest.
- **Sliding friction:** once the box slides, $F_\text{k} = \mu_\text{k} \cdot m \cdot g$ slows it. Usually $\mu_\text{k} < \mu_\text{s}$: once the box slides, it gets easier.

Pushing with exactly the sliding friction force gives $F_\text{res} = 0$ – the box moves at **constant speed**. Stop pushing and only friction acts. Without friction (on smooth ice) it would keep going for ever.

Weight $F_G$ and normal force $F_N$ cancel on level ground. A **free-body diagram** shows all forces acting at one point.

### Everyday: scales in a lift

Bathroom scales measure how hard they are pressed: the **normal force** $F_N$. At rest $F_N = m \cdot g$ and the scales show the mass. If the lift accelerates upwards at $a$, the floor must accelerate the person too:

$$
F_N = m \cdot (g + a)
$$

When starting upwards (and when braking on the way down) the scales show **more**; when braking on the way up (and starting downwards) they show **less**. At constant speed they show the normal value – even if the lift is fast. If the cable snaps, person and scales fall equally fast ($a = -g$): the scales show zero and the person is **weightless**. Astronauts train this way on parabolic flights.

### Measurement series: a ∝ F and a ∝ 1/m

Two light gates measure the time $t$ a cart needs from rest for the distance $s$; then $a = \frac{2s}{t^2}$.

- **Mass fixed, force varied:** the points in the a–F graph lie on a line through the origin with slope $\frac{1}{m}$.
- **Force fixed, mass varied:** plotting $a$ against $\frac{1}{m}$ again gives a line through the origin, with slope $F$.

Together this gives $a = \frac{F}{m}$. Small deviations come from errors in timing.

## Try it

- [Loose box](?mode=traeg&gurt=0) and [strapped down](?mode=traeg&gurt=1): press "Start" and compare velocities.
- [F = m · a](?mode=grund&mc=0.5&mh=0.1&mu=0), [double cart mass](?mode=grund&mc=1&mh=0.1&mu=0), [with friction](?mode=grund&mu=0.1)
- [Push-off](?mode=wechsel&m1=1&m2=2): which cart is faster?
- [Pushing a box: too weak](?mode=kraft&fs=150&mk=40&muh=0.5&mug=0.3&toff=3): press "Start". Why does nothing move? Increase the push until the box slides.
- [Constant speed](?mode=kraft&fs=120&mk=40&muh=0.3&mug=0.3&toff=8): push and friction are equal – the box moves at a steady speed.
- [On ice](?mode=kraft&fs=40&mk=40&muh=0&mug=0&toff=2): what happens after the push ends?
- [Lift going up](?mode=aufzug&pm=60&ldir=up&la=1.5) and [going down](?mode=aufzug&pm=60&ldir=down&la=1.5): when do the scales show more, when less?
- [Cable snaps](?mode=aufzug&pm=60&fall=1): what do the scales show in free fall?
- [Series a ∝ F](?mode=mess&mr=F&mf=0.5&mw=0.5) and [series a ∝ 1/m](?mode=mess&mr=m&mf=0.5&mw=0.5): measure at four different values.
- [Practice](?mode=ueben&qn=1): nine tasks on all three laws.

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

**5. The box slides.** A box ($40\,\text{kg}$) is pushed with $250\,\text{N}$. Static friction coefficient $0.5$, sliding friction coefficient $0.3$. Does it move? If so, with what acceleration? ($g = 9.81\,\frac{\text{m}}{\text{s}^2}$) [Load task](?mode=kraft&fs=250&mk=40&muh=0.5&mug=0.3&toff=3&_hide=1)

<details><summary>Show solution</summary>

Static friction holds at most $0.5 \cdot 40 \cdot 9.81\,\text{N} \approx 196\,\text{N}$ – $250\,\text{N}$ is more, so the box slides. Sliding friction is $0.3 \cdot 40 \cdot 9.81\,\text{N} \approx 118\,\text{N}$, so $F_\text{res} \approx 132\,\text{N}$ and $a \approx 3.3\,\frac{\text{m}}{\text{s}^2}$.

</details>

**6. Scales in a lift.** A person of $60\,\text{kg}$ stands on scales in a lift that starts upwards at $1.5\,\frac{\text{m}}{\text{s}^2}$. What do the scales show? And when braking? [Load task](?mode=aufzug&pm=60&ldir=up&la=1.5&_hide=1)

<details><summary>Show solution</summary>

$F_N = 60 \cdot (9.81 + 1.5)\,\text{N} \approx 679\,\text{N}$, reading about $69\,\text{kg}$. Braking: $60 \cdot (9.81 - 1.5)\,\text{N} \approx 499\,\text{N}$, reading about $51\,\text{kg}$.

</details>

**7. Evaluating a series.** With a fixed mass: $F = 0.5\,\text{N}$ gives $a = 1.0\,\frac{\text{m}}{\text{s}^2}$, $F = 1.0\,\text{N}$ gives $2.0$, $F = 1.5\,\text{N}$ gives $3.0$. What is the mass of the cart? [Load task](?mode=mess&mr=F&mf=0.5&mw=0.5&_hide=1)

<details><summary>Show solution</summary>

The slope of the line through the origin is $2\,\frac{1}{\text{kg}} = \frac{1}{m}$, so $m = 0.5\,\text{kg}$.

</details>

## Ideas for teaching

- Why do you tip backwards in a bus that starts moving?
- Do the track experiment with light gates and compare with the simulation.
- Ride a real lift with bathroom scales (or a phone’s accelerometer app) and note the reading when starting and braking.
- Common mistake: moving at constant speed needs no resultant force – force changes velocity, it does not maintain it.
- Common mistake: action and reaction act on **different** bodies, so they do not cancel.
