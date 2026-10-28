## What is it about?

A gas of single atoms does not glow in all colours but only in very specific ones: behind a prism you see separate bright lines, a **line spectrum**. Every element has its own pattern, like a fingerprint.

The electrons of an atom can only have certain energies, the **energy levels**. When the electron jumps from a higher level $E_\text{u}$ (upper) to a lower level $E_\text{l}$, the atom emits exactly **one photon** with

$$
\Delta E = E_\text{u} - E_\text{l} = h \cdot f, \qquad \lambda = \frac{c}{f} = \frac{h \cdot c}{\Delta E},
$$

with $h = 6.626 \cdot 10^{-34}\,\text{J}\cdot\text{s}$ and $h \cdot c \approx 1240\,\text{eV}\cdot\text{nm}$. For **hydrogen** the Bohr model gives $E_n = -\frac{13.6\,\text{eV}}{n^2}$. Jumps ending on the same level form a **series**: Lyman ($n = 1$, UV), **Balmer** ($n = 2$, visible lines at $656$, $486$, $434$ and $410\,\text{nm}$), Paschen ($n = 3$, infrared).

**Absorption:** white light passing through a cool gas loses exactly the photons whose energy fits a jump upwards – dark lines appear at the same places as the bright emission lines (Fraunhofer lines).

The orbits in the picture are a model and not to scale. For helium, sodium and mercury the levels are taken from tables. The simulation uses **vacuum wavelengths**; tables for air give slightly smaller values, e.g. the yellow helium line at $587.7\,\text{nm}$ (vacuum) instead of $587.6\,\text{nm}$ (air).

## Try it

1. Watch a jump from $n = 3$ to $n = 2$ in slow motion. [Load example](?u=3&l=2&slow=1)
2. Tap the other arrows of the Balmer series. How do $\Delta E$, $f$ and $\lambda$ change? [Balmer series](?u=4&l=2)
3. Choose a jump that ends at $n = 1$. Why is no colour visible? [Lyman-α](?u=2&l=1)
4. Let the gas glow and compare the four elements. [All lines](?run=all)
5. Switch to absorption. [Sodium in absorption](?el=Na&mode=abs&u=2&l=1)

## Tasks

### Task 1: The blue-green hydrogen line

Calculate energy, frequency and wavelength of the photon for the jump from $n = 4$ to $n = 2$. [Load task](?u=4&l=2&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta E = -0.85\,\text{eV} - (-3.40\,\text{eV}) = 2.55\,\text{eV}$, $f = \frac{\Delta E}{h} \approx 6.17 \cdot 10^{14}\,\text{Hz}$, $\lambda \approx 486\,\text{nm}$. [Show in the simulation](?u=4&l=2)

</details>

### Task 2: Invisible light

Calculate the wavelength for the jump from $n = 2$ to $n = 1$. Why can't you see it? [Load task](?u=2&l=1&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta E = 10.2\,\text{eV}$, $\lambda = \frac{1240\,\text{eV}\cdot\text{nm}}{10.2\,\text{eV}} \approx 122\,\text{nm}$ – ultraviolet, outside the visible range of about $380$ to $780\,\text{nm}$. [Show in the simulation](?u=2&l=1)

</details>

### Task 3: The yellow sodium line

Sodium street lamps glow at $589\,\text{nm}$. What is the energy difference of the levels involved? [Load task](?el=Na&u=2&l=1&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta E = \frac{1240\,\text{eV}\cdot\text{nm}}{589\,\text{nm}} \approx 2.10\,\text{eV}$ (jump $3\text{p} \to 3\text{s}$). [Show in the simulation](?el=Na&u=2&l=1)

</details>

### Task 4: Series limit

What is the shortest wavelength of the Balmer series (jump from $E = 0$ to $n = 2$)?

<details>
<summary>Show solution</summary>

$\Delta E = 3.40\,\text{eV}$, $\lambda \approx 365\,\text{nm}$ (just in the UV). The levels crowd together near $E = 0$, so the lines crowd together too.

</details>

## Ideas for the classroom

- Combine with real spectral tubes and a hand spectroscope: look at the real spectrum first, then find the origin of each line here.
- With `val=0` the values in the picture are hidden for calculation exercises.
- **Common stumbling blocks:**
  - “The electron emits light while orbiting.” – Light is only emitted during a jump, one photon per jump.
  - “Higher levels give red light.” – What matters is the energy difference.
  - “Negative energies make no sense.” – $E = 0$ means the electron has just become free; bound states lie below.
