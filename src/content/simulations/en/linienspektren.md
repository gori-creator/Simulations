## What is it about?

A gas of single atoms does not glow in all colours but only in very specific ones. Behind a prism or grating you therefore see not a band of colours but separate bright lines: a **line spectrum**. Every element has its own pattern of lines, a kind of fingerprint.

The explanation: the electron shell of an atom can only have certain energies, the **energy levels**. In the **energy level diagram** they are drawn as horizontal lines. If the electron jumps from a higher level $E_\text{o}$ to a lower level $E_\text{u}$, the atom emits exactly **one photon**. Its energy is the difference between the levels:

$$
\Delta E = E_\text{o} - E_\text{u} = h \cdot f
\qquad\text{with}\qquad h = 6.626 \cdot 10^{-34}\,\text{J}\cdot\text{s}.
$$

The wavelength follows from the frequency: $\lambda = \frac{c}{f} = \frac{h \cdot c}{\Delta E}$. Handy for calculating: $h \cdot c \approx 1240\,\text{eV}\cdot\text{nm}$ and $1\,\text{eV} = 1.602 \cdot 10^{-19}\,\text{J}$. A large jump means large energy, high frequency and short wavelength (blue to UV); a small jump means red or infrared light.

According to Bohr’s model, **hydrogen** has the levels

$$
E_n = -\frac{13.6\,\text{eV}}{n^2}, \qquad n = 1, 2, 3, \dots
$$

All jumps that end on the same level form a **series**: Lyman ($n = 1$, UV only), **Balmer** ($n = 2$, the four visible lines at $656$, $486$, $434$ and $410\,\text{nm}$), Paschen ($n = 3$, infrared). $E = 0$ means the electron has just become free (**ionisation**).

**Absorption:** if you send white light through a cool gas, the atoms take up exactly the photons whose energy fits a jump upwards. The spectrum is then missing the same colours that the gas emits when it glows: dark **absorption lines** in the coloured band. This is how Fraunhofer discovered the dark lines in the solar spectrum.

**About the display:** the orbits in the atom picture are a model (as with Bohr) and not to scale. For helium, sodium and mercury the simple Bohr model no longer works; the levels there come from tables. In the energy level diagram they are arranged in columns (s, p, d or singlet and triplet), because only certain jumps occur. Wavelengths are rounded to whole nm in the picture and to 0.1 nm in the table “Visible lines”. The simulation uses **vacuum wavelengths**; table values for air are slightly smaller, e.g. the yellow helium line $587.7\,\text{nm}$ (vacuum) instead of $587.6\,\text{nm}$ (air).

## Try it

1. Watch a jump from $n = 3$ to $n = 2$: where does the photon land on the screen, and what colour is it? Switch on slow motion. [Load example](?u=3&l=2&slow=1)
2. Tap the other arrows of the Balmer series one after the other. How do $\Delta E$, $f$ and $\lambda$ change? [Balmer series](?u=4&l=2)
3. Choose a jump that ends at $n = 1$. Why can you not see a colour? [Lyman-α](?u=2&l=1)
4. Let the gas glow: all transitions occur. Compare the spectra of hydrogen, helium, sodium and mercury. [All lines](?run=all)
5. Switch to absorption. Where do the dark lines appear? Compare with emission. [Sodium in absorption](?el=Na&mode=abs&u=2&l=1)
6. Mercury vapour lamp: which lines can you see, which remain invisible? [Mercury](?el=Hg&u=6&l=4&run=all)

## Exercises

### Exercise 1: The blue-green hydrogen line

Calculate the energy, frequency and wavelength of the photon for the jump from $n = 4$ to $n = 2$. [Load exercise](?u=4&l=2&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$E_4 = -\frac{13.6\,\text{eV}}{16} = -0.85\,\text{eV}$, $E_2 = -3.40\,\text{eV}$, so $\Delta E = 2.55\,\text{eV} = 4.09 \cdot 10^{-19}\,\text{J}$.
$f = \frac{\Delta E}{h} \approx 6.17 \cdot 10^{14}\,\text{Hz}$, $\lambda = \frac{c}{f} \approx 486\,\text{nm}$ (blue-green, H$_\beta$). [Show in the simulation](?u=4&l=2)

</details>

### Exercise 2: Invisible light

The jump from $n = 2$ to $n = 1$ produces the Lyman-α line. Calculate its wavelength. Why can you not see it with your eyes? [Load exercise](?u=2&l=1&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta E = -3.40\,\text{eV} - (-13.60\,\text{eV}) = 10.2\,\text{eV}$, $\lambda = \frac{1240\,\text{eV}\cdot\text{nm}}{10.2\,\text{eV}} \approx 122\,\text{nm}$. That is ultraviolet; the eye only sees about $380$ to $780\,\text{nm}$. [Show in the simulation](?u=2&l=1)

</details>

### Exercise 3: The yellow sodium line

Sodium vapour street lamps glow yellow at $\lambda = 589\,\text{nm}$. How large is the energy difference between the levels involved? Why does the same line appear dark if you send white light through a sodium flame? [Load exercise](?el=Na&mode=abs&u=2&l=1&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta E = \frac{h \cdot c}{\lambda} = \frac{1240\,\text{eV}\cdot\text{nm}}{589\,\text{nm}} \approx 2.10\,\text{eV}$ (jump $3\text{p} \to 3\text{s}$). The sodium atoms in the ground state take up exactly the photons with $2.10\,\text{eV}$ from the white light. They do give the energy off again, but in all directions; in the direction of the spectrometer this light is missing. [Show in the simulation](?el=Na&mode=abs&u=2&l=1)

</details>

### Exercise 4: Which level?

In the mercury spectrum a green line glows at $546\,\text{nm}$. It is produced when the electron jumps from the level $7^3\text{S}_1$ ($E = -2.71\,\text{eV}$). On which level does it land? Use the energy level diagram and check your answer by tapping the matching arrow. [Load exercise](?el=Hg&u=6&l=2&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta E = \frac{1240\,\text{eV}\cdot\text{nm}}{546\,\text{nm}} \approx 2.27\,\text{eV}$, so $E_\text{u} = -2.71\,\text{eV} - 2.27\,\text{eV} = -4.98\,\text{eV}$. That is the level $6^3\text{P}_2$. [Show in the simulation](?el=Hg&u=6&l=4)

</details>

### Exercise 5: The series limit

Towards violet the Balmer lines get closer and closer together. Calculate the shortest wavelength of the Balmer series (jump from “$n = \infty$”, i.e. $E = 0$, to $n = 2$).

<details>
<summary>Show solution</summary>

$\Delta E = 0 - (-3.40\,\text{eV}) = 3.40\,\text{eV}$, $\lambda = \frac{1240\,\text{eV}\cdot\text{nm}}{3.40\,\text{eV}} \approx 365\,\text{nm}$ (just in the UV). Because the levels get closer and closer together towards the top, the jumps from $n = 6, 7, 8, \dots$ to $n = 2$ hardly differ any more. [Show the Balmer series](?run=all)

</details>

### Exercise 6: Ionising

What is the longest wavelength a photon may have so that it can ionise a hydrogen atom in the ground state?

<details>
<summary>Show solution</summary>

It needs at least $13.6\,\text{eV}$: $\lambda \le \frac{1240\,\text{eV}\cdot\text{nm}}{13.6\,\text{eV}} \approx 91\,\text{nm}$ (ultraviolet). Visible light is not enough for this.

</details>

## Ideas for the classroom

- **Use:** in upper secondary in the topic of the atomic shell and quantum physics (energy levels, line spectra, Bohr’s model); please check your curriculum for where exactly it fits. A good complement to observing spectral tubes with a hand spectroscope: first look at the real spectrum, then look for the origin of each line in the simulation.
- **Possible sequence:** first only hydrogen and the Balmer lines, calculating $\Delta E = h \cdot f$ by hand; then “all transitions (glowing gas)” and the other elements as fingerprints; finally absorption and Fraunhofer lines. With “Show values in the picture” switched off (`val=0`), calculation tasks can be set.
- **Model:** the orbits in the atom picture illustrate the levels; they are not electron orbits to scale. The brightness of the lines is a rough guide. In absorption, almost all atoms in a cold gas are in the ground state; Balmer lines are seen in absorption e.g. in hot stellar atmospheres.
- **Common pitfalls:**
  - “The electron emits light while it circles.” – Light is only produced in a jump between two levels, one photon per jump.
  - “High levels give red light.” – What matters is the energy difference, not the height of the starting level.
  - “There is no such thing as negative energy.” – The zero is chosen freely: $E = 0$ means “electron just free”; bound states lie below it.
  - “In the absorption spectrum the light is missing because it stays swallowed.” – The atoms emit the energy again, but in all directions.
- **Further topics:** Franck–Hertz experiment (mercury, $4.9\,\text{eV}$), photoelectric effect, spectral analysis in astronomy, fluorescent lamps and LEDs.
