## What is it about?

Laser light is special: very bright, tightly focused, single-coloured and **coherent** – all waves oscillate in step. How is such light produced? The word LASER gives it away: *Light Amplification by Stimulated Emission of Radiation*.

### Three ways light and atoms interact

- **Absorption:** an atom in the lower level absorbs a photon of the right energy and becomes excited.
- **Spontaneous emission:** an excited atom drops back by itself after some time and emits a photon in a random direction. This is how a light bulb glows.
- **Stimulated emission:** a photon hits an **excited** atom and makes it emit a second photon – with the same energy, direction and phase. One photon becomes two, two become four …

### Population inversion

Normally almost all atoms are in the lower level. A photon is then absorbed far more often than multiplied. Amplification only happens when **more atoms are up than down**: **population inversion** $N_2 > N_1$.

To achieve this, the medium is **pumped** (with a flash lamp, light or current). The atoms are lifted to a high level, drop quickly into a **metastable** level where they stay for a long time, and accumulate there.

- **Three-level laser** (e.g. ruby): the lower laser level is the ground state. More than half of all atoms must be excited – this needs strong pumping.
- **Four-level laser** (e.g. Nd:YAG): the lower laser level lies a little above the ground state and empties immediately. Just a few excited atoms are enough for inversion.

### The resonator

Two mirrors send the light through the laser medium again and again, so it is amplified like an avalanche. One mirror lets a small part through – that is the laser beam. The laser only switches on when the gain balances the losses: this is the **laser threshold**. Above it the inversion stays roughly at its threshold value, and the extra pump energy goes into laser light.

When switched on, the laser often shows short **flashes of light**: the inversion builds up, the light shoots up and depletes it again – until an equilibrium is reached.

### What the simulation simplifies

It uses a simple rate model in relative units; time is measured in lifetimes $\tau$ of the metastable level.

## Try it

- [Below threshold](?stufen=3&W=0.8&R=99): Is there population inversion? Slowly increase the pump rate.
- [Ruby laser](?stufen=3&W=2&R=99): Press “reset time” and play: watch the flashes at the start.
- [Four-level laser](?stufen=4&W=0.2&R=99): Even weak pumping is enough. Why?
- [Poor mirror](?stufen=3&W=2&R=90): What changes about the threshold?

## Exercises

**1. Inversion in ruby.** What percentage of the atoms must at least be excited in a three-level laser? [Load exercise](?stufen=3&W=1.2&R=99&_hide=1)

<details><summary>Show solution</summary>

More than 50 %: only then is $N_2 > N_1 = 1 - N_2$. Because of the losses in the resonator, even a little more.

</details>

**2. Comparing thresholds.** Read off the pump threshold for the three-level and the four-level laser (mirror 99 %). By what factor do they differ? [Load exercise](?stufen=4&W=0.2&R=99)

<details><summary>Show solution</summary>

Three-level: about 1.02. Four-level: about 0.01. The four-level laser needs about a hundred times less pump power.

</details>

**3. Mirror.** Why does the pump threshold rise when the output mirror reflects less? [Load exercise](?stufen=3&W=2&R=90&_hide=1)

<details><summary>Show solution</summary>

More light leaves the resonator on every round trip. For the gain to balance these losses, a larger inversion is needed – so stronger pumping.

</details>
