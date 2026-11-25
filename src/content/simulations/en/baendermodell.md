## What is it about?

Why does copper conduct electricity so well, silicon only moderately and diamond hardly at all – although all three consist of atoms with electrons? The **band model** gives the answer.

### Levels become bands

A single atom has sharp **energy levels**. When two atoms come close, their electrons influence each other: each level splits in two. With $N$ atoms there are $N$ closely spaced levels. In a crystal with an unimaginable number of atoms (about $10^{23}$) they are so close together that they form a continuous **energy band**.

How wide a band becomes depends on the **distance** between the atoms: the closer they are, the wider. Between two bands a **band gap** may remain – energies that no electron in the crystal can have.

### Conductor, semiconductor, insulator

What matters is how the bands are filled with electrons:

- **Metal (conductor):** the highest occupied band is only **half filled**. Electrons find free places directly above them, and a small electric field sets them moving. The boundary between occupied and free is called the **Fermi energy** $E_F$.
- **Semiconductor:** the **valence band** is full, the **conduction band** above it empty. But the gap is small (silicon: 1.12 eV). Heat lifts some electrons across. They conduct in the conduction band – and the **holes** they leave behind in the valence band conduct too.
- **Insulator:** like a semiconductor, but the gap is large (diamond: 5.5 eV). At normal temperatures hardly any electron makes the jump.

The number of free electrons in a pure semiconductor rises steeply with temperature:

$$n \sim e^{-E_g / (2kT)}$$

That is why semiconductors conduct **better when warm**. Metals behave the other way round: the number of free electrons stays the same, but the atoms vibrate more and slow the electrons down – the resistance rises.

In the simulation the number of drawn conduction electrons grows with the **logarithm** of $n$ – otherwise silicon would show either invisibly few or uncountably many.

### Superconductivity

If some metals are cooled very strongly, their electrical resistance vanishes **completely** below a **critical temperature** $T_c$ (mercury: 4.15 K, discovered in 1911). A current in a superconducting ring then flows for years without loss. In addition, a superconductor pushes magnetic fields out of its interior (**Meissner effect**) – which is why a magnet can float above it. Only quantum physics explains this: electrons form pairs that move through the lattice without collisions. Applications include the magnets in MRI scanners and particle accelerators.

## Try it

- [One atom](?mode=abstand&N=1&d=1): Increase the number of atoms step by step.
- [Crystal](?mode=abstand&N=30&d=1): Change the distance. When does the gap disappear?
- [Silicon](?mode=stoffe&stoff=si&T=300): Heat it to 600 K. How does the conductivity change?
- [Copper](?mode=stoffe&stoff=cu&T=300): What happens here when heated?
- [Mercury](?mode=supra&sl=hg&Ts=6): Cool it down slowly.

## Exercises

**1. Counting levels.** How many levels form the lower band when 30 atoms come together? How many would there be in a crystal with $10^{23}$ atoms? [Load exercise](?mode=abstand&N=30&d=1)

<details><summary>Show solution</summary>

30 levels – one per atom. With $10^{23}$ atoms there are $10^{23}$ levels, so close together that we call it a band.

</details>

**2. Comparing gaps.** Germanium has a band gap of 0.66 eV, silicon one of 1.12 eV. Which material has more free electrons at 300 K? Estimate the ratio using $kT \approx 0.026$ eV. [Load exercise](?mode=stoffe&stoff=ge&T=300&_hide=1)

<details><summary>Show solution</summary>

Germanium. $\dfrac{n_\text{Ge}}{n_\text{Si}} \approx e^{(1.12 - 0.66)/(2 \cdot 0.026)} = e^{8.8} \approx 7000$.

</details>

**3. Warm or cold?** A temperature sensor should have a smaller resistance as the temperature rises. Is a metal wire or a semiconductor better? [Load exercise](?mode=stoffe&stoff=si&T=300)

<details><summary>Show solution</summary>

A semiconductor (thermistor, NTC): when warm it has more free electrons and holes, so its resistance falls. In a metal the resistance rises with temperature.

</details>

**4. Critical temperature.** At what temperature does lead become superconducting? What is its resistance at 5 K? [Load exercise](?mode=supra&sl=pb&Ts=5&_hide=1)

<details><summary>Show solution</summary>

$T_c = 7.2$ K. At 5 K lead is superconducting and its resistance is exactly zero.

</details>
