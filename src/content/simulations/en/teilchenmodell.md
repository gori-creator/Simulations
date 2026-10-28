## What is it about?

All substances consist of tiny **particles** that are always moving. Between the particles there is **nothing** – no water, no air, just empty space. Particles that are close to each other attract each other.

- **solid** (ice): the particles sit at fixed places in a regular lattice and **vibrate** about these places. The attraction holds them together – in the picture it is drawn as small springs.
- **liquid** (water): the particles still stick together but are no longer bound to fixed places. They **slide past each other** – that is why a liquid takes the shape of any container.
- **gas** (steam): the particles are so fast that the attraction can no longer hold them. They **fly freely** and collide with each other and with the walls; the gas fills all the space available.

**Temperature and particle motion:** The higher the temperature, the faster the particles move on average. More precisely: the mean kinetic energy of a particle is proportional to the **absolute temperature** $T$ in kelvin,

$$
T = \vartheta + 273\,\text{K}, \qquad E_\text{kin} = \tfrac{3}{2}\, k \cdot T \quad (k \approx 1.38 \cdot 10^{-23}\,\tfrac{\text{J}}{\text{K}}).
$$

At $\vartheta = -273.15\,°\text{C}$ ($T = 0\,\text{K}$, **absolute zero**) the particle motion would stop; nothing can be colder. Exactly, $T = \vartheta + 273.15\,\text{K}$; for calculations $273\,\text{K}$ is usually enough. At $20\,°\text{C}$ water particles move at about $590\,\frac{\text{m}}{\text{s}}$ on average – but not all at the same speed: the **histogram** shows how the speeds are distributed. In the simulation the **colour** of each particle shows its speed (blue slow, red fast).

**Melting and boiling:** When ice is heated steadily, its temperature rises at first. At $0\,°\text{C}$ it stops rising until all the ice has melted – the energy supplied is needed to free the particles from the lattice, not to make them faster. The same happens at $100\,°\text{C}$ while the water boils. This gives horizontal sections (plateaus) in the **temperature–time graph**. The energies needed for $m = 0.5\,\text{kg}$ of water:

$$
Q_\text{f} = m \cdot L_\text{f} = 0.5\,\text{kg} \cdot 334\,\tfrac{\text{kJ}}{\text{kg}} = 167\,\text{kJ}, \qquad Q_\text{v} = m \cdot L_\text{v} = 0.5\,\text{kg} \cdot 2257\,\tfrac{\text{kJ}}{\text{kg}} \approx 1129\,\text{kJ}.
$$

With a power $P$ a plateau lasts $t = \frac{Q}{P}$. When the water **freezes** or the steam **condenses**, the same energy is given off again.

**Diffusion:** If you put a drop of ink into water, it spreads out by itself without stirring, because the particles keep changing places. In warm water this happens much faster.

**About the model:** The particle picture is a two-dimensional model with few particles; the particle motion is strongly slowed down, and the heating runs in time-lapse (1 s on screen = 40 s). The weighted piston keeps the pressure constant, so the steam that forms pushes it up (in reality steam takes up about 1700 times the volume of the water). Heat loss to the surroundings is ignored. For diffusion, currents in the water are left out; in a real glass, mixing by diffusion alone would take many hours to days.

## Try it

1. Watch the ice at $-20\,°\text{C}$. Do the particles move? Tap a particle and follow its path. [Ice](?T=-20)
2. Switch on “Heat”. What happens to the temperature while the ice melts? What do the particles do during this time? [From ice to steam](?heat=heat)
3. Compare the lengths of the two plateaus in the graph. Which change of state needs more energy?
4. Double the power of the plate. What changes in the graph – and what does not? [Double power](?heat=heat&pw=2000)
5. Follow a single particle in the steam. What does its path look like compared with a particle in ice or in water? [Steam with arrows](?T=120&arr=1)
6. Compare the histogram at $-20\,°\text{C}$ and at $120\,°\text{C}$. Where does the mean move? Are there fast particles in the ice, too?
7. Cool the steam down. In which order do the changes of state happen now? [Cooling steam](?T=130&heat=cool&pw=2000)
8. Switch to diffusion. In which glass is the ink spread out evenly first? Make both temperatures the same – what do you expect? [Diffusion](?mode=diff)

## Tasks

### Task 1: Celsius and kelvin

Convert $20\,°\text{C}$, $-20\,°\text{C}$ and $100\,°\text{C}$ into kelvin. By what percentage is the mean kinetic energy of the particles at $100\,°\text{C}$ greater than at $20\,°\text{C}$? [Load task](?T=20&_hide=1)

<details>
<summary>Show solution</summary>

$293\,\text{K}$, $253\,\text{K}$ and $373\,\text{K}$. The kinetic energy is proportional to $T$: $\frac{373}{293} \approx 1.27$, so about $27\,\%$ more – not “five times as much”, as the ratio $100 : 20$ might suggest. [Show in the simulation](?T=100)

</details>

### Task 2: How long does melting take?

$0.5\,\text{kg}$ of ice at $0\,°\text{C}$ is heated with $P = 500\,\text{W}$. How long does the temperature stay at $0\,°\text{C}$? [Load task](?T=0&pw=500&_hide=1)

<details>
<summary>Show solution</summary>

$Q = m \cdot L_\text{f} = 0.5\,\text{kg} \cdot 334\,\frac{\text{kJ}}{\text{kg}} = 167\,\text{kJ}$, $t = \frac{Q}{P} = \frac{167\,000\,\text{J}}{500\,\text{W}} = 334\,\text{s} \approx 5.6\,\text{min}$. [Show in the simulation](?T=0&pw=500&heat=heat)

</details>

### Task 3: Reading the graph

A student heats ice with constant power and gets a graph in which the second plateau is almost seven times as long as the first one. Explain why.

<details>
<summary>Show solution</summary>

The first plateau belongs to melting, the second to boiling. With the same power, the time is proportional to the energy needed: $\frac{2257}{334} \approx 6.8$. When water vaporises, the particles have to be separated completely; when ice melts, they only leave the lattice and still stick together. [Show in the simulation](?heat=heat&pw=2000)

</details>

### Task 4: Why does the temperature not rise?

While water boils, energy is supplied all the time, but the thermometer shows $100\,°\text{C}$. Where does the energy go? Describe it with the particle model.

<details>
<summary>Show solution</summary>

Temperature is a measure of the mean kinetic energy of the particles – and that does not change. The energy is needed to pull particles out of the liquid against their attraction. Afterwards it is stored in the distance between the particles (potential energy) and is released again when the steam condenses.

</details>

### Task 5: Tea and sugar

Why does a sugar cube dissolve and spread faster in hot tea than in cold tea? [Load task](?mode=diff&tc=10&tw=80&_hide=1)

<details>
<summary>Show solution</summary>

In hot water the particles move faster and change places much more often. So the sugar particles leave the cube faster and spread through the whole tea faster (diffusion). Stirring speeds this up even more. [Show in the simulation](?mode=diff&tc=10&tw=80)

</details>

## Ideas for the classroom

- **Use:** Years 7/8, heat (particle model, temperature, states of matter); works well alongside the real experiment “melting ice and boiling water” with thermometer and stopwatch. The class can first sketch its own measured graph and then compare it with the simulation.
- **Let students predict:** Before heating, ask what the temperature–time graph will look like. Many expect a straight line – the plateau then comes as a real surprise.
- **Follow one particle:** The paths in ice (jiggling about a place), in water (wandering) and in steam (straight pieces with sharp turns) are good for describing and drawing.
- **Diffusion:** At the same time, do a real experiment with ink or food colouring in cold and warm water; the simulation shows what cannot be seen in the glass.
- **Common stumbling blocks:**
  - “There is water (or air) between the particles.” – There is empty space between the particles.
  - “Particles in ice do not move.” – They vibrate about their places; the motion would only stop at absolute zero.
  - “The particles themselves get bigger or warmer when heated.” – A single particle has no temperature; it only gets faster, and the distance between the particles grows.
  - “Boiling water keeps getting hotter.” – At normal pressure it stays at $100\,°\text{C}$ as long as there is still water.
  - “At a given temperature all particles are equally fast.” – The speeds are distributed; the temperature belongs to the mean.
- **Link to the curriculum:** particle model, temperature and internal energy, changes between the states of matter; Celsius and kelvin scales. The formula $E_\text{kin} = \frac{3}{2} k T$ is meant as an outlook.
