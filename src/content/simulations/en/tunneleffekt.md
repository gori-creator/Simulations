## What is it about?

A ball that is too slow cannot get over a hill – it rolls back. For an electron this is not quite true: it can **tunnel** through an energy barrier even though its energy is not enough. This **tunnelling effect** exists only in quantum physics.

### The wave inside the barrier

The electron is described by a **wave function** $\psi$. A wave comes in before the barrier, and part of it is reflected. Inside the barrier $\psi$ no longer oscillates but **decays exponentially**:

$$\psi(x) \sim e^{-\kappa x} \quad\text{with}\quad \kappa = \frac{\sqrt{2m\,(V_0 - E)}}{\hbar}$$

If the barrier is thin enough, $\psi$ is not yet zero at the right edge. A small wave continues there. The square of its amplitude is the **transmission probability** $T$. For barriers that are not too thin, approximately

$$T \approx \frac{16\,E\,(V_0 - E)}{V_0^2}\, e^{-2\kappa d}.$$

The exponential factor is what matters; the fraction in front usually lies between 1 and 4.

So doubling the width does not halve the transmission but **squares** it (making it much smaller). A slightly higher barrier also lowers $T$ strongly.

If the energy lies **above** the barrier, a classical electron always gets through. In quantum physics part of it is still reflected – except at certain energies where the wave fits exactly into the barrier.

### The scanning tunnelling microscope

A fine metal tip is brought to about half a nanometre from a conducting surface. In between is vacuum – a barrier of a few electronvolts (the **work function**). With a small voltage applied, electrons tunnel through: a **tunnelling current** of about one nanoampere flows.

Because the current depends exponentially on the distance, it changes by a factor of about 9 for just 0.1 nm. Moving the tip line by line over the sample (**scanning**) turns the current into an image in which single **atoms**, vacancies and adatoms can be seen. Gerd Binnig and Heinrich Rohrer received the Nobel Prize for this in 1986.

The graph in the simulation shows the current on a **logarithmic** scale: one unit up means ten times as much current.

**More examples:** **alpha decay** is a tunnelling process out of the nucleus. **Flash memory** (USB sticks) stores data by letting electrons tunnel through a thin insulating layer.

## Try it

- [Thin barrier](?mode=barriere&E=3&V=5&d=0.3): How large is the transmission probability?
- [Thick barrier](?mode=barriere&E=3&V=5&d=1): Can you still see a wave on the right?
- [Above the barrier](?mode=barriere&E=7&V=5&d=0.5): Change the width and watch $T$.
- [Tunnelling microscope](?mode=stm&h=0.5): Start the scan. Where is the current largest?

## Exercises

**1. Decay.** An electron with 3 eV hits a 5 eV barrier. Calculate $\kappa$ (with $\tfrac{\hbar^2}{2m} \approx 0.0381\,\text{eV nm}^2$) and estimate $T$ for $d = 0.4$ nm. [Load exercise](?mode=barriere&E=3&V=5&d=0.4&_hide=1)

<details><summary>Show solution</summary>

$\kappa = \sqrt{2 / 0.0381}\,\text{nm}^{-1} \approx 7.2\,\text{nm}^{-1}$. $T \approx e^{-2 \cdot 7.2 \cdot 0.4} = e^{-5.8} \approx 3 \cdot 10^{-3}$. With the prefactor $\tfrac{16 \cdot 3 \cdot 2}{25} \approx 3.8$ this gives $T \approx 0.012$ – exactly what the simulation shows.

</details>

**2. Double width.** How does $T$ change if the barrier is widened from 0.4 nm to 0.8 nm? [Load exercise](?mode=barriere&E=3&V=5&d=0.8&_hide=1)

<details><summary>Show solution</summary>

$T$ is multiplied by about $e^{-5.8} \approx 0.003$, so it becomes roughly 300 times smaller.

</details>

**3. Sensitivity.** In the tunnelling microscope $\kappa \approx 10.9\,\text{nm}^{-1}$. By what factor does the current rise if the tip comes 0.1 nm closer? [Load exercise](?mode=stm&h=0.4&_hide=1)

<details><summary>Show solution</summary>

$e^{2 \cdot 10.9 \cdot 0.1} = e^{2.18} \approx 9$. That is why height differences of a fraction of an atom’s diameter can be measured.

</details>
