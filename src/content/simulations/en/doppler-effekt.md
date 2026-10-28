## What is it about?

When an ambulance drives past, its siren sounds **higher** as it approaches and **lower** as it moves away. This is the **Doppler effect**.

Each wave front is a circle centred where the source **was** when it emitted it. A source moving with $v_Q$ advances by $v_Q \cdot T$ per period, so the fronts are **closer together ahead** and **further apart behind**:

$$
\lambda_a = \frac{c - v_Q}{f_Q}, \qquad \lambda_b = \frac{c + v_Q}{f_Q}, \qquad f_B = f_Q \cdot \frac{c}{c \mp v_Q}.
$$

If instead the **observer** moves towards a source at rest, the wavelength stays the same but the fronts are met more often: $f_B = f_Q \cdot \frac{c + v_B}{c}$. In general $f_B = f_Q \cdot \frac{c + v_{B,r}}{c - v_{Q,r}}$ with the velocity components along the line joining them. Standing beside the road, this component changes smoothly – the pitch glides.

For $v_Q = c$ the fronts pile up (sound barrier). For $v_Q > c$ they form the **Mach cone** with $\sin \alpha = \frac{c}{v_Q}$; where it passes, a **sonic boom** is heard.

Only every $n$th wave front is drawn (shown in the picture), so the brackets measure $n \cdot \lambda$.

## Try it

1. Press “Restart” and watch the rings and the graph $f_B(t)$. Why is it silent at first?
2. Drag the observer close to the road and away again. How does the curve change? [Next to the road](?d=6&bx=20)
3. Press “Play sound” and restart, with and without slow motion.
4. Let the observer move towards a source at rest. [Moving observer](?vq=0&vb=34&d=6&bx=110)
5. Increase $v_Q$ to $340\,\tfrac{\text{m}}{\text{s}}$ and beyond. [Mach 2](?vq=680&d=30&bx=0)

## Tasks

### Task 1: Siren

An ambulance travels at $34\,\tfrac{\text{m}}{\text{s}}$ with a $440\,\text{Hz}$ tone. What does an observer at the road hear before and after it passes? [Load task](?d=6&bx=20&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$440\,\text{Hz} \cdot \frac{340}{306} \approx 488.9\,\text{Hz}$ and $440\,\text{Hz} \cdot \frac{340}{374} = 400\,\text{Hz}$. [Show in the simulation](?d=6&bx=20)

</details>

### Task 2: Who is moving?

A cyclist moves at $34\,\tfrac{\text{m}}{\text{s}}$ towards a $440\,\text{Hz}$ source at rest. What does he hear? Compare with task 1.

<details>
<summary>Show solution</summary>

$440\,\text{Hz} \cdot \frac{374}{340} = 484\,\text{Hz}$, slightly less than $488.9\,\text{Hz}$: a moving source compresses the waves themselves, a moving observer only meets them more often. [Show](?vq=0&vb=34&d=6&bx=110)

</details>

### Task 3: Sonic boom

A plane flies at Mach 2. Find the half-angle of the Mach cone.

<details>
<summary>Show solution</summary>

$\sin\alpha = \frac{1}{2}$, so $\alpha = 30^\circ$. [Show](?vq=680&d=30&bx=0)

</details>

## Ideas for the classroom

- **Use:** Waves and sound in year 10 or upper secondary. A nice start is the everyday experience of a siren – first with sound and without numbers (`val=0`).
- **Model:** Air at rest, uniform straight motion; the emission time of the sound arriving now is computed exactly. Vehicle and person are drawn larger than to scale. Sound is off by default and quiet.
- **Common stumbling blocks:**
  - “It gets louder, so it sounds higher.” – Loudness and pitch are different quantities.
  - “The pitch jumps when it passes.” – Only right on the road; at a distance it glides.
  - “Moving source and moving observer are the same.” – Not for sound, because the air is a preferred frame.
