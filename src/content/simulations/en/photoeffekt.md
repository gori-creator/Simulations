## What is it about?

When light falls on a metal surface, electrons can be released: the **photoelectric effect**. In a **photocell** these electrons reach the anode opposite, and an ammeter shows a small **photocurrent**.

What is surprising is *what* this depends on:

- Below a **threshold frequency** $f_\text{G}$, **no** electrons at all are released – not even with very bright light.
- More **intensity** means **more** electrons (larger current), but **not faster** ones.
- The largest kinetic energy of the electrons grows with the **frequency** of the light.

In 1905 Einstein explained this with **photons**: light consists of packets of energy $E_\text{Ph} = h \cdot f$. A photon gives all its energy to a single electron. To leave the metal, the electron needs the **work function** $W_\text{A}$; the rest remains as kinetic energy:

$$
E_\text{kin,max} = h \cdot f - W_\text{A}.
$$

**Retarding-field method:** if the anode is put at a negative potential relative to the cathode (retarding voltage $U$), the electrons are slowed down. The current disappears at the voltage $U_\text{G}$ at which even the fastest electrons no longer arrive:

$$
e \cdot U_\text{G} = E_\text{kin,max}.
$$

If you measure $U_\text{G}$ for different frequencies, the points $(f \mid e \cdot U_\text{G})$ lie on a straight line – the **Einstein line**. Its **slope is the Planck constant** $h \approx 4.14 \cdot 10^{-15}\,\text{eV}\cdot\text{s} = 6.63 \cdot 10^{-34}\,\text{J}\cdot\text{s}$; it crosses the $f$-axis at the threshold frequency $f_\text{G} = \frac{W_\text{A}}{h}$ and the energy axis at $-W_\text{A}$.

**Work functions** (textbook tables, rounded): caesium $1.94\,\text{eV}$, potassium $2.25\,\text{eV}$, sodium $2.28\,\text{eV}$, lithium $2.46\,\text{eV}$, zinc $4.34\,\text{eV}$, copper $4.48\,\text{eV}$. Depending on the source and the state of the surface, the values differ somewhat.

**About the display:** in the model the kinetic energies of the released electrons are spread evenly between $0$ and $E_\text{kin,max}$; that is why the current falls linearly with increasing retarding voltage. The current in nA is a model value.

## Try it

1. Watch the electrons at $U = 0$. Then set a retarding voltage: what happens to slow and fast electrons? [Load example](?U=0.6)
2. Press “Adjust the voltage (I = 0)”. At what voltage does the current become zero? [Current zero](?U=1.16)
3. Double the intensity from $50\,\%$ to $100\,\%$. What changes in the current, what in $U_\text{G}$? Compare the two curves in the $I$–$U$ graph. [50 %](?P=50&U=0.6) · [100 %](?P=100&U=0.6)
4. Choose red light. Does it help to increase the intensity? [Red light](?lam=650&P=100)
5. Record a series of measurements (“Automatic series”) and read off the slope of the line of best fit.
6. Compare caesium with zinc. Why do you need ultraviolet light for zinc? [Zinc in the UV](?metal=Zn&lam=250)

## Exercises

### Exercise 1: Violet light on caesium

Light of wavelength $400\,\text{nm}$ falls on a caesium cathode ($W_\text{A} = 1.94\,\text{eV}$). Calculate the photon energy, the largest kinetic energy of the electrons and the retarding voltage at which the current becomes zero. [Load exercise](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

$f = \frac{c}{\lambda} = \frac{3.00 \cdot 10^8\,\text{m/s}}{400 \cdot 10^{-9}\,\text{m}} = 7.50 \cdot 10^{14}\,\text{Hz}$, $E_\text{Ph} = h \cdot f = 4.136 \cdot 10^{-15}\,\text{eV}\cdot\text{s} \cdot 7.50 \cdot 10^{14}\,\text{Hz} \approx 3.10\,\text{eV}$ (faster: $E_\text{Ph} = \frac{h \cdot c}{\lambda} = \frac{1240\,\text{eV}\cdot\text{nm}}{400\,\text{nm}} = 3.10\,\text{eV}$). The simulation uses $c = 2.998 \cdot 10^8\,\text{m/s}$ and therefore shows $7.495 \cdot 10^{14}\,\text{Hz}$.
$E_\text{kin,max} = 3.10\,\text{eV} - 1.94\,\text{eV} = 1.16\,\text{eV}$, so $U_\text{G} = 1.16\,\text{V}$. [Show in the simulation](?U=1.16)

</details>

### Exercise 2: Threshold frequency

Calculate the threshold frequency and the threshold wavelength for caesium. Does red light ($650\,\text{nm}$) release electrons? [Load exercise](?lam=650&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_\text{G} = \frac{W_\text{A}}{h} = \frac{1.94\,\text{eV}}{4.136 \cdot 10^{-15}\,\text{eV}\cdot\text{s}} \approx 4.69 \cdot 10^{14}\,\text{Hz}$, $\lambda_\text{G} = \frac{c}{f_\text{G}} \approx 639\,\text{nm}$. At $650\,\text{nm}$, $E_\text{Ph} \approx 1.91\,\text{eV} < W_\text{A}$: no electrons, however bright. [Show in the simulation](?lam=650&P=100)

</details>

### Exercise 3: Zinc

Why does the light from Exercise 1 not release electrons from zinc ($W_\text{A} = 4.34\,\text{eV}$)? What is the longest wavelength that works? [Load exercise](?metal=Zn&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$3.10\,\text{eV} < 4.34\,\text{eV}$. You need $\lambda < \frac{h \cdot c}{W_\text{A}} = \frac{1240\,\text{eV}\cdot\text{nm}}{4.34\,\text{eV}} \approx 286\,\text{nm}$, i.e. ultraviolet light. [Show in the simulation](?metal=Zn&lam=250)

</details>

### Exercise 4: Planck constant from two measurements

For caesium you measure the retarding voltage $1.16\,\text{V}$ at $400\,\text{nm}$ and $2.19\,\text{V}$ at $300\,\text{nm}$. Determine $h$ from these.

<details>
<summary>Show solution</summary>

$f_1 = \frac{c}{400\,\text{nm}} = 7.50 \cdot 10^{14}\,\text{Hz}$, $f_2 = \frac{c}{300\,\text{nm}} = 10.00 \cdot 10^{14}\,\text{Hz}$, $\Delta U = 2.19\,\text{V} - 1.16\,\text{V} = 1.03\,\text{V}$. $h = \frac{e \cdot \Delta U}{\Delta f} = \frac{1.03\,\text{eV}}{2.50 \cdot 10^{14}\,\text{Hz}} \approx 4.1 \cdot 10^{-15}\,\text{eV}\cdot\text{s} \approx 6.6 \cdot 10^{-34}\,\text{J}\cdot\text{s}$. [Check in the simulation](?lam=300&U=2.19)

</details>

### Exercise 5: Intensity

Use the photon model to explain why doubling the intensity doubles the current, while the retarding voltage $U_\text{G}$ stays the same. [50 %](?P=50&U=0.6) · [100 %](?P=100&U=0.6)

<details>
<summary>Show solution</summary>

Double the intensity means twice as many photons per second, so twice as many released electrons. But each photon still has $h \cdot f$, so $E_\text{kin,max}$ and hence $U_\text{G}$ stay the same. In the simulation: at $U = 0.6\,\text{V}$ the current rises from about $0.48\,\text{nA}$ to $0.97\,\text{nA}$, while $U_\text{G} = 1.16\,\text{V}$ stays.

</details>

## Ideas for the classroom

- **Use:** upper secondary, topic quantum objects and photons; please check the exact place in your curriculum. Good as a supplement to the experiment with a photocell and a mercury lamp with filters.
- **Possible sequence:** first collect the three surprising observations (threshold frequency, intensity, frequency), then compare with the wave model, then the retarding-field method and finally the Einstein line with the determination of $h$.
- **Model:** simplified energy distribution of the electrons, contact voltages between anode and cathode neglected. In real measurements the line is therefore usually shifted somewhat, but the slope is still $h$.
- **Common pitfalls:**
  - “Brighter light makes the electrons faster.” – More light means more photons, not more energetic ones.
  - “The retarding voltage accelerates the electrons.” – It slows them down; only electrons with $E_\text{kin} > e \cdot U$ arrive.
  - “$E_\text{kin} = h \cdot f$.” – The work function is missing: $E_\text{kin,max} = h \cdot f - W_\text{A}$.
- **Going further:** line spectra, Compton effect, photodiodes and solar cells.
