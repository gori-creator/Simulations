---
description: "Interactive simulation of the particle model – ice, water and steam as particles, temperature as a measure of particle motion, melting and boiling plateaus in a live temperature–time graph, and diffusion of ink in cold and warm water."
---

## What is it about?

All substances consist of tiny **particles** that are always moving. Between the particles there is **nothing** – empty space. Particles close to each other attract each other.

- **solid** (ice): the particles sit at fixed places in a regular lattice and **vibrate** about them.
- **liquid** (water): the particles still stick together but **slide past each other**.
- **gas** (steam): the particles **fly freely**, collide and fill the whole space.

The higher the temperature, the faster the particles move on average. The mean kinetic energy is proportional to the **absolute temperature** $T = \vartheta + 273\,\text{K}$: $E_\text{kin} = \tfrac{3}{2} k T$. The colour of each particle shows its speed; the histogram shows the distribution of speeds.

When ice is heated steadily, the temperature stays at $0\,°\text{C}$ until all of it has melted and at $100\,°\text{C}$ while it boils: the energy is used to separate the particles, not to make them faster. For $0.5\,\text{kg}$ of water this takes $Q = m \cdot L_f = 167\,\text{kJ}$ for melting and $Q = m \cdot L_v \approx 1129\,\text{kJ}$ for vaporising; a plateau lasts $t = Q/P$.

**About the model:** two-dimensional, few particles, particle motion slowed down, heating in time-lapse (1 s on screen = 40 s). The weighted piston keeps the pressure constant. Diffusion is shown without currents in the water.

## Try it

1. Watch the ice at $-20\,°\text{C}$ and tap a particle to follow it. [Ice](?T=-20)
2. Switch on “Heat”. What happens to the temperature while the ice melts? [From ice to steam](?heat=heat)
3. Compare the lengths of the two plateaus. Which change of state needs more energy?
4. Compare the histogram at $-20\,°\text{C}$ and $120\,°\text{C}$. [Steam with arrows](?T=120&arr=1)
5. Switch to diffusion. In which glass is the ink spread out first? [Diffusion](?mode=diff)

## Tasks

### Task 1: Celsius and kelvin

Convert $20\,°\text{C}$ and $100\,°\text{C}$ into kelvin. By how much does the mean kinetic energy increase?

<details>
<summary>Show solution</summary>

$293\,\text{K}$ and $373\,\text{K}$; $\frac{373}{293} \approx 1.27$, i.e. about $27\,\%$ more. [Show in the simulation](?T=100)

</details>

### Task 2: How long does melting take?

$0.5\,\text{kg}$ of ice at $0\,°\text{C}$ is heated with $P = 500\,\text{W}$. How long does the temperature stay at $0\,°\text{C}$? [Load task](?T=0&pw=500&_hide=1)

<details>
<summary>Show solution</summary>

$Q = 0.5\,\text{kg} \cdot 334\,\frac{\text{kJ}}{\text{kg}} = 167\,\text{kJ}$, $t = \frac{Q}{P} = 334\,\text{s} \approx 5.6\,\text{min}$. [Show in the simulation](?T=0&pw=500&heat=heat)

</details>

### Task 3: Where does the energy go?

While water boils, energy is supplied all the time, but the thermometer shows $100\,°\text{C}$. Explain with the particle model.

<details>
<summary>Show solution</summary>

Temperature measures the mean kinetic energy of the particles, which does not change. The energy is used to pull particles out of the liquid against their attraction; it is released again when the steam condenses.

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Use it alongside the real experiment “melting ice and boiling water” with thermometer and stopwatch; let students predict the graph first.
- Following single particles in ice, water and steam is a good starting point for describing the three states.
- **Common stumbling blocks:**
  - “There is water (or air) between the particles.” – There is empty space.
  - “Particles in ice do not move.” – They vibrate about their places.
  - “Boiling water keeps getting hotter.” – At normal pressure it stays at $100\,°\text{C}$.
  - “All particles have the same speed.” – Speeds are distributed; temperature belongs to the average.
