## What is it about?

Water in a garden hose, wind between two tall buildings, air around an aeroplane wing: liquids and gases flow everywhere. Two simple rules explain a surprising amount of it.

### Continuity: what flows in must flow out

Water can hardly be compressed. So in every second the **same amount** of water passes through every cross-section of a pipe:

$$A_1 \cdot v_1 = A_2 \cdot v_2$$

If the constriction is only a quarter as large ($A_2 = \tfrac14 A_1$), the water flows four times as fast there – just like putting your thumb over a hose.

### Bernoulli: fast means low pressure

To speed up as it enters the constriction, the water must be accelerated, and only a pressure difference can do that. So the pressure before the constriction is larger than inside it. **Bernoulli’s equation** tells us how much:

$$p_1 + \tfrac12 \rho v_1^2 = p_2 + \tfrac12 \rho v_2^2$$

The standpipes make this visible: above the constriction the water stands lower. Behind it the pipe is wide again, the water slow again – and the pressure as large as before (we ignore friction). At high speed the pressure in the constriction can even drop below air pressure: there is **suction**. Water-jet pumps and spray bottles work this way.

### Laminar or turbulent?

Slow flows in thin pipes are **laminar**: the particles glide past each other in layers, fastest in the middle. Fast flows in wide pipes become **turbulent**: eddies form and everything mixes. What matters is the **Reynolds number**

$$Re = \frac{v \cdot d}{\nu}$$

with the diameter $d$ and the viscosity $\nu$ (for water about $10^{-6}\,\text{m}^2/\text{s}$). Below about 2300 a pipe flow stays laminar, above about 4000 it becomes turbulent.

### The wing

A wing is curved and tilted slightly (**angle of attack** $\alpha$). It deflects the air downwards, and the air flows **faster above the wing** than below. By Bernoulli the pressure is lower above and higher below, so the wing is pushed up. The **lift force** is

$$F_L = \tfrac12 \cdot \rho \cdot v^2 \cdot A \cdot c_L$$

with air density $\rho \approx 1.2\,\text{kg/m}^3$, airspeed $v$, wing area $A$ and the **lift coefficient** $c_L$. The coefficient grows with the angle of attack – but only up to about 15°. Beyond that the air can no longer follow the upper surface, it **separates** and swirls: lift collapses (**stall**).

A common misconception: the air from above and below does **not** meet again at the back. Start the wing experiment and watch – the particles above arrive clearly earlier.

### What the simulation simplifies

The streamlines around the wing come from a frictionless model (Joukowski airfoil with the Kutta condition). Because real air has friction, real wings reach only about three quarters of the ideal lift, and the simulation uses that value. The stall above 15° is a simplified imitation. In the pipe, friction losses are ignored.

## Try it

- [Laminar flow](?mode=rohr&v1=0.4&d=0.5&eng=25): How fast is the water in the constriction? How low does the middle standpipe stand?
- [Turbulent flow](?mode=rohr&v1=0.8&d=2&eng=25): What changes in the particles’ motion?
- [Strong constriction](?mode=rohr&v1=0.6&d=0.5&eng=10): When does suction appear in the constriction?
- [Cruise](?mode=fluegel&v=55&alpha=3&A=16): How much mass can the wing carry?
- [Stall](?mode=fluegel&v=30&alpha=20&A=16): What happens above the wing?

## Exercises

**1. Garden hose.** A hose has a cross-section of 2 cm², the water flows at 0.5 m/s. With your thumb you narrow the opening to 0.2 cm². How fast does the water squirt out? [Load exercise](?mode=rohr&v1=0.5&d=1&eng=10&_hide=1)

<details><summary>Show solution</summary>

$v_2 = v_1 \cdot \dfrac{A_1}{A_2} = 0.5\,\tfrac{\text{m}}{\text{s}} \cdot \dfrac{2}{0.2} = 5\,\tfrac{\text{m}}{\text{s}}$.

</details>

**2. Pressure difference.** Water flows at 0.4 m/s into a constriction with a quarter of the cross-section. How large is the pressure difference, and how much lower does the water stand in the middle standpipe? [Load exercise](?mode=rohr&v1=0.4&d=0.5&eng=25&_hide=1)

<details><summary>Show solution</summary>

$v_2 = 1.6\,\tfrac{\text{m}}{\text{s}}$, $\Delta p = \tfrac12 \cdot 1000 \cdot (1.6^2 - 0.4^2)\,\text{Pa} = 1200\,\text{Pa}$.
The water column is $\Delta h = \dfrac{\Delta p}{\rho g} \approx 0.12\,\text{m}$ lower.

</details>

**3. Laminar?** Water flows at 0.8 m/s through a pipe of 2 cm diameter. Is the flow laminar? [Load exercise](?mode=rohr&v1=0.8&d=2&eng=25&_hide=1)

<details><summary>Show solution</summary>

$Re = \dfrac{0.8 \cdot 0.02}{10^{-6}} = 16\,000$ – far above 4000, so turbulent.

</details>

**4. Twice as fast.** How does the lift force change if an aeroplane flies twice as fast? [Load exercise](?mode=fluegel&v=30&alpha=6&A=16&_hide=1)

<details><summary>Show solution</summary>

$F_L \sim v^2$: it becomes four times as large. That is why a fast aeroplane flies with a small angle of attack, while during the slow landing approach it needs a larger angle (and flaps).

</details>

**5. Too steep.** Increase the angle of attack step by step up to 24°. At which angle does the wing carry most? Why don’t pilots always fly that steeply? [Load exercise](?mode=fluegel&v=30&alpha=10&A=16)

<details><summary>Show solution</summary>

Most at about 15°. Beyond that the flow separates and lift collapses – so flying just below the stall angle is dangerous. Also, drag rises strongly with the angle of attack.

</details>
