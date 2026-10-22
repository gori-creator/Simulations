---
description: "Interactive simulation of the photoelectric effect with the retarding field method: light of selectable wavelength and intensity releases electrons from a metal cathode, the voltage is adjusted until no current flows, and the data points give Einstein’s line E_kin = h · f − W_A."
---

## What is it about?

Light falling on a metal can release electrons: the **photoelectric effect**. Below a **threshold frequency** no electrons are released, however bright the light. More **intensity** gives **more** electrons, but **not faster** ones. Einstein explained this with **photons** of energy $E_\text{Ph} = h \cdot f$. One photon gives its energy to one electron, which needs the **work function** $W_\text{A}$ to leave the metal:

$$
E_\text{kin,max} = h \cdot f - W_\text{A}.
$$

With a **retarding voltage** $U$ between anode and cathode the current vanishes at $e \cdot U_\text{G} = E_\text{kin,max}$. Plotting $e \cdot U_\text{G}$ against $f$ gives **Einstein’s line** with slope $h \approx 4.14 \cdot 10^{-15}\,\text{eV}\cdot\text{s}$ and threshold frequency $f_\text{G} = \frac{W_\text{A}}{h}$.

Work functions (rounded textbook values): caesium $1.94\,\text{eV}$, potassium $2.25\,\text{eV}$, sodium $2.28\,\text{eV}$, lithium $2.46\,\text{eV}$, zinc $4.34\,\text{eV}$, copper $4.48\,\text{eV}$.

## Try it

1. Watch the electrons at $U = 0$, then increase the retarding voltage. [Load example](?U=0.6)
2. Press “Adjust the voltage”. [No current](?U=1.16)
3. Double the intensity from $50\,\%$ to $100\,\%$: the current doubles, $U_\text{G}$ stays. [50 %](?P=50&U=0.6) · [100 %](?P=100&U=0.6)
4. Try red light. [Red light](?lam=650&P=100)
5. Record an automatic series and read off the slope.

## Tasks

### Task 1: Violet light on caesium

$\lambda = 400\,\text{nm}$, $W_\text{A} = 1.94\,\text{eV}$. Find $E_\text{Ph}$, $E_\text{kin,max}$ and $U_\text{G}$. [Load task](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

$E_\text{Ph} = \frac{1240\,\text{eV}\cdot\text{nm}}{400\,\text{nm}} \approx 3.10\,\text{eV}$, $E_\text{kin,max} = 1.16\,\text{eV}$, $U_\text{G} = 1.16\,\text{V}$. [Show in the simulation](?U=1.16)

</details>

### Task 2: Threshold frequency

Find $f_\text{G}$ for caesium. Does red light ($650\,\text{nm}$) release electrons?

<details>
<summary>Show solution</summary>

$f_\text{G} = \frac{1.94\,\text{eV}}{4.136 \cdot 10^{-15}\,\text{eV}\cdot\text{s}} \approx 4.69 \cdot 10^{14}\,\text{Hz}$ ($\lambda_\text{G} \approx 639\,\text{nm}$). At $650\,\text{nm}$, $E_\text{Ph} \approx 1.91\,\text{eV} < W_\text{A}$: no electrons. [Show in the simulation](?lam=650&P=100)

</details>

### Task 3: Zinc

Why does $400\,\text{nm}$ light release no electrons from zinc ($W_\text{A} = 4.34\,\text{eV}$)?

<details>
<summary>Show solution</summary>

$3.10\,\text{eV} < 4.34\,\text{eV}$; zinc needs $\lambda < 286\,\text{nm}$ (UV). [Show in the simulation](?metal=Zn&lam=250)

</details>

## Ideas for the classroom

- Collect the three surprising observations first, then compare with the wave model.
- **Common stumbling blocks:**
  - “Brighter light makes faster electrons.” – More light means more photons, not more energetic ones.
  - “$E_\text{kin} = h \cdot f$.” – The work function is missing.
