---
description: "Interactive simulation of the gas laws – gas in a cylinder with a piston in the particle model, isothermal (Boyle–Mariotte), isobaric (Gay-Lussac) and isochoric (Amontons) changes, data series in p–V, p–1/V, V–T and p–T graphs, extrapolation to absolute zero and the ideal gas law."
---

## What is it about?

The state of a fixed amount of gas is described by its **pressure** $p$, **volume** $V$ and **absolute temperature** $T$ (in kelvin, $T = \vartheta + 273.15\,\text{K}$). If one quantity is kept fixed, the other two are simply related:

- **isothermal** ($T$ fixed, water bath): Boyle–Mariotte, $p \cdot V = \text{constant}$ – a hyperbola in the p–V graph.
- **isobaric** ($p$ fixed, weight on the piston): Gay-Lussac, $\frac{V}{T} = \text{constant}$ – a line through the origin in the V–T graph.
- **isochoric** ($V$ fixed, piston locked): Amontons, $\frac{p}{T} = \text{constant}$ – a line through the origin in the p–T graph.

All three follow from the **ideal gas law** $p \cdot V = n \cdot R \cdot T$ with $R = 8.314\,\frac{\text{J}}{\text{mol}\cdot\text{K}}$ (note $1\,\text{kPa} \cdot 1\,\text{L} = 1\,\text{J}$). One mole at $0\,°\text{C}$ and $101.325\,\text{kPa}$ takes up about $22.4\,\text{L}$.

Plotting $p$ against $\frac{1}{V}$ turns the hyperbola into a straight line (**linearisation**). Extending the V–T or p–T line to the left, it meets the temperature axis near $-273\,°\text{C}$: **absolute zero**, $T = 0\,\text{K}$.

In the particle model the pressure comes from the collisions of the particles with the walls (they flash briefly). The simulation also measures the pressure from the collisions and compares it with the formula.

**About the model:** two-dimensional, 24 particles per mole, slowed down; point-like particles that only hit the walls (ideal gas). Pressures are absolute pressures. Data points can carry a small uncertainty (about ±1 %).

## Try it

1. Drag the piston down until the volume is halved. What does the gauge show? [Start](?V=22.4)
2. Run an automatic series and switch to the p–1/V graph. [Linearisation](?ch=pinv&V=15)
3. Heat at constant pressure from $0\,°\text{C}$ to $100\,°\text{C}$. By what factor does the volume grow? [Gay-Lussac](?mode=isobar&ch=VT&T=100)
4. Record a series at constant volume. Where does the extended line meet the temperature axis? [Amontons](?mode=isochor&ch=pT)
5. Double the amount of gas at the same $V$ and $T$. [Twice the particles](?n=2)

## Tasks

### Task 1: Compressing slowly

$1\,\text{mol}$ of gas at $0\,°\text{C}$ has a volume of $30\,\text{L}$. It is compressed isothermally to $15\,\text{L}$. Find the pressure before and after. [Load task](?V=30&_hide=1)

<details>
<summary>Show solution</summary>

$p_1 = \frac{nRT}{V_1} = \frac{8.314 \cdot 273.15}{30}\,\text{kPa} \approx 75.7\,\text{kPa}$, $p_2 = 2 p_1 \approx 151.4\,\text{kPa}$. [Show in the simulation](?V=15)

</details>

### Task 2: Car tyre

A tyre has an absolute pressure of $250\,\text{kPa}$ at $10\,°\text{C}$ and warms up to $50\,°\text{C}$ at constant volume. Find the new pressure. [Load task](?mode=isochor&ch=pT&T=10&_hide=1)

<details>
<summary>Show solution</summary>

$p_2 = 250\,\text{kPa} \cdot \frac{323.15\,\text{K}}{283.15\,\text{K}} \approx 285\,\text{kPa}$. Using Celsius values would wrongly give five times the pressure. [Show in the simulation](?mode=isochor&ch=pT&T=50)

</details>

### Task 3: Amount of substance

A $20\,\text{L}$ container holds gas at $150\,\text{kPa}$ and $27\,°\text{C}$. How many moles is that?

<details>
<summary>Show solution</summary>

$n = \frac{pV}{RT} = \frac{150 \cdot 20}{8.314 \cdot 300.15}\,\text{mol} \approx 1.2\,\text{mol}$. [Check](?n=1.2&T=27&V=20)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Use it alongside real experiments with a gas syringe, a pressure gauge or a gas thermometer; let students record and plot the data themselves first.
- Ask for predictions: “What happens to the pressure if we halve the volume?”, “How large is the volume at $100\,°\text{C}$?”
- **Common stumbling blocks:** calculating with Celsius instead of kelvin; confusing gauge pressure with absolute pressure; thinking the gas “disappears” at $-273\,°\text{C}$ (real gases liquefy first); taking the isotherm for a straight line.
