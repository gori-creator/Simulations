---
description: "Interactive simulation of charging and discharging a capacitor: RC circuit with a switch, moving electrons, U(t) and I(t) graphs with tangent, time constant τ = R · C, half-life and energy W = ½ C U²."
---

## What is it about?

A capacitor stores charge, $Q = C \cdot U$. Charging through a resistor $R$ from $U_0$:

$$
U_C(t) = U_0 \cdot \left(1 - e^{-t/\tau}\right), \qquad I(t) = \frac{U_0}{R} \cdot e^{-t/\tau}, \qquad \tau = R \cdot C .
$$

Discharging: $U_C(t) = U_0 \cdot e^{-t/\tau}$, and the current reverses (negative in the graph).

- After $\tau$ the voltage has reached 63 % (charging) or dropped to 37 % (discharging).
- The tangent at $t = 0$ meets the final value exactly at $t = \tau$.
- Half-life: $t_{1/2} = \tau \cdot \ln 2$.
- After about $5\,\tau$ the process is practically complete.
- Stored energy: $W = \tfrac12 C U^2$.

The dots are electrons, moving against the conventional current (red arrow) with a speed proportional to $I$. Very small or very large $\tau$ are shown in time lapse or slow motion; the graphs always show real time.

## Try it

1. Watch the charging process. When is the current largest? [Charge](?sw=charge)
2. Tap the switch while charging. [Charge](?sw=charge)
3. Double $R$ or $C$. [R = 20 kΩ](?R=20) · [C = 200 µF](?C=200)
4. Discharge with half-life markers. [Half-life](?sw=discharge&half=1&tan=0)

## Tasks

### Task 1: Time constant

$C = 100\,\mu\text{F}$, $R = 10\,\text{k}\Omega$, $U_0 = 10\,\text{V}$. Find $\tau$, $I_0$ and $U_C(\tau)$. [Load task](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\tau = 1.0\,\text{s}$, $I_0 = 1.0\,\text{mA}$, $U_C(\tau) \approx 6.32\,\text{V}$. [Show in the simulation](?tan=1)

</details>

### Task 2: Half-life

When has the discharging capacitor dropped to $5\,\text{V}$, and to $2.5\,\text{V}$? [Load task](?sw=discharge&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$t_{1/2} \approx 0.693\,\text{s}$, two half-lives $\approx 1.39\,\text{s}$. [Show in the simulation](?sw=discharge&half=1&tan=0)

</details>

### Task 3: Energy

Energy stored at $10\,\text{V}$? [Load task](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

$W = \tfrac12 \cdot 10^{-4}\,\text{F} \cdot (10\,\text{V})^2 = 5\,\text{mJ}$. [Show in the simulation](?sw=charge)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Compare with a real measurement using a large electrolytic capacitor.
- **Common stumbling blocks:** “Current flows through the capacitor.” – Only in the leads. “The current keeps its direction when discharging.” – It reverses.
