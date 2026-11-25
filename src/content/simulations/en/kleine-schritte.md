## What is it about?

For uniformly accelerated motion there are ready-made formulas like $s = \frac{1}{2} a t^2$. But when the force keeps changing – a skydiver's air resistance grows with speed, a spring's force changes with position – those formulas no longer help.

The **method of small steps** divides time into small steps $\Delta t$ and treats the acceleration as constant within each step.

### The rule

From the current state (position $s$, velocity $v$):

1. **acceleration** from the force: $a = \frac{F}{m}$
2. **new velocity**: $v_\text{new} = v + a \cdot \Delta t$
3. **new position**: $s_\text{new} = s + v \cdot \Delta t$
4. … and start again with the new values.

That is exactly what a spreadsheet does row by row – or a computer game 60 times a second.

### Skydiver

With air resistance $F_L = k v^2$: $a = g - \frac{k}{m} v^2$. The diver accelerates less and less until weight and drag balance at the **terminal velocity** $v_E = \sqrt{\frac{m g}{k}}$.

### How accurate is it?

Large steps deviate clearly from the exact solution, small steps hardly at all. For the spring, "position first, then velocity" (Euler) makes the oscillation grow artificially; using the new velocity for the position keeps it stable. The order of the steps matters.

## Try it

- [Fall, Δt = 2 s](?modell=fall&dt=2), [Fall, Δt = 0.2 s](?modell=fall&dt=0.2)
- [Spring with Euler](?modell=feder&dt=0.2&methode=euler), [stable](?modell=feder&dt=0.2&methode=cromer)

## Exercises

**1. By hand.** A skydiver (80 kg, $k = 0.25\,\tfrac{\text{kg}}{\text{m}}$) jumps from rest. Compute the first two steps with $\Delta t = 2\,\text{s}$ (Euler). [Load exercise](?modell=fall&dt=2&m=80&k=0.25&_hide=1)

<details><summary>Show solution</summary>

$t = 2$: $v = 19.62$, $s = 0$, $a \approx 8.61$. $t = 4$: $v \approx 36.83$, $s \approx 39.2\,\text{m}$.

</details>

**2. Terminal velocity.** How fast does the diver fall in the end? [Load exercise](?modell=fall&dt=0.2&_hide=1)

<details><summary>Show solution</summary>

$v_E \approx 56\,\tfrac{\text{m}}{\text{s}} \approx 200\,\tfrac{\text{km}}{\text{h}}$; there $a = 0$, independent of $\Delta t$.

</details>

**3. Error and step size.** The exact velocity after 4 s is 33.9 m/s. Compare $\Delta t = 2\,\text{s}$ and $0.2\,\text{s}$. [Load exercise](?modell=fall&dt=0.2&_hide=1)

<details><summary>Show solution</summary>

36.8 m/s and about 34.2 m/s – ten times smaller steps, roughly ten times smaller error.

</details>

**4. Growing oscillation.** Why does the spring oscillation grow with Euler? [Load exercise](?modell=feder&dt=0.2&methode=euler&_hide=1)

<details><summary>Show solution</summary>

The position is advanced with the old velocity, which adds a little energy every period.

</details>

## Ideas for teaching

- Rebuild the calculation in a spreadsheet.
- Film falling coffee filters, analyse the video and fit $k$.
