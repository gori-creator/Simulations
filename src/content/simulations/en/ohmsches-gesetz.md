---
description: "Interactive Ohm’s law – set the voltage of a power supply, read current and voltage on analogue meters and record the characteristics of a resistor, a light bulb and a constantan wire; R = U / I and R = ρ · l / A."
---

## What is it about?

If a **voltage** $U$ is applied to a component, an electric current $I$ flows. This is how you measure:

- The **ammeter** is connected **in series** with the component – the whole current has to pass through it.
- The **voltmeter** is connected **in parallel** with the component – it measures the voltage between its two terminals.

The **electrical resistance** tells you how strongly a component opposes the current:

$$
R = \frac{U}{I} \qquad [R] = 1\,\Omega = 1\,\frac{\text{V}}{\text{A}}
$$

**Ohm’s law:** For metal wires at a constant temperature, the current is proportional to the voltage, $I \propto U$. The resistance $R$ is then constant and $U = R \cdot I$. The **characteristic** in an $I$–$U$ graph is a **straight line through the origin** – the larger $R$, the flatter the line. In a $U$–$I$ graph the slope of the line equals $R$.

**Light bulb:** The tungsten filament gets hotter than $2000\,°\text{C}$. As its temperature rises, so does its resistance – from about $3\,\Omega$ (cold) to $48\,\Omega$ at $12\,\text{V}$. Its characteristic is therefore curved; Ohm’s law does not apply to the bulb.

**Resistance of a wire:** It increases with the length $l$ and decreases with the cross-sectional area $A$:

$$
R = \rho \cdot \frac{l}{A} \qquad \rho_{\text{constantan}} = 0.49\,\frac{\Omega \cdot \text{mm}^2}{\text{m}}
$$

The **resistivity** $\rho$ depends on the material. The resistance of constantan hardly changes when it warms up.

## Try it

1. Turn the knob of the power supply and watch the pointers. Record data points at different voltages – or start the automatic series.
2. Measure different resistors one after the other and compare the lines in the graph. [47 Ω](?R=47) · [150 Ω](?R=150)
3. Record the characteristic of the light bulb and watch the filament. [Light bulb](?part=lamp)
4. Switch to the U–I graph: now the slope of the line is the resistance. [U–I graph](?axes=UI)
5. Investigate the constantan wire: double the length, then the cross-section. [1 m](?part=wire&U=2) · [2 m](?part=wire&l=2&U=2) · [double cross-section](?part=wire&A=0.2&U=2)

## Tasks

### Task 1: Unknown resistor

Determine resistor B from a series of measurements. Draw the best-fit line yourself. [Load task](?part=mys&X=B&fit=0&_hide=1)

<details>
<summary>Show solution</summary>

For example at $U = 8\,\text{V}$: $I \approx 0.098\,\text{A}$, so $R = \frac{8\,\text{V}}{0.098\,\text{A}} \approx 82\,\Omega$. All data points lie on a straight line through the origin with this value. [Show solution](?part=mys&X=B)

</details>

### Task 2: Predict the current

A voltage of $6\,\text{V}$ is applied to a resistor of $100\,\Omega$. How large is the current?

<details>
<summary>Show solution</summary>

$I = \frac{U}{R} = \frac{6\,\text{V}}{100\,\Omega} = 0.06\,\text{A} = 60\,\text{mA}$. [Check](?R=100&U=6)

</details>

### Task 3: Set the voltage

Which voltage do you need so that exactly $0.2\,\text{A}$ flows through a resistor of $47\,\Omega$?

<details>
<summary>Show solution</summary>

$U = R \cdot I = 47\,\Omega \cdot 0.2\,\text{A} = 9.4\,\text{V}$. [Check](?R=47&U=9.4)

</details>

### Task 4: Resistance of the light bulb

Calculate the resistance of the bulb at $2\,\text{V}$ and at $12\,\text{V}$. Why are the values different? [Load task](?part=lamp&U=2&_hide=1)

<details>
<summary>Show solution</summary>

At $2\,\text{V}$ about $0.110\,\text{A}$ flows, so $R \approx 18\,\Omega$. At $12\,\text{V}$ it is $0.25\,\text{A}$, so $R = 48\,\Omega$. At a higher voltage the filament is hotter, and the resistance of metals increases with temperature.

</details>

### Task 5: Longer and thicker wire

A constantan wire with $l = 1\,\text{m}$ and $A = 0.1\,\text{mm}^2$ has $4.9\,\Omega$. What is the resistance of a wire that is $2\,\text{m}$ long with a cross-section of $0.2\,\text{mm}^2$?

<details>
<summary>Show solution</summary>

Double the length doubles $R$, double the cross-section halves it: again $4.9\,\Omega$. [Check](?part=wire&l=2&A=0.2&U=4)

</details>

### Task 6: Current limit

For the wire ($1\,\text{m}$, $0.1\,\text{mm}^2$) the power supply is set to $12\,\text{V}$, but the voltmeter only shows about $9.8\,\text{V}$. Explain. [Load task](?part=wire&U=12&_hide=1)

<details>
<summary>Show solution</summary>

At $12\,\text{V}$ a current of $\frac{12\,\text{V}}{4.9\,\Omega} \approx 2.4\,\text{A}$ would flow. But the power supply delivers at most $2\,\text{A}$, so it lowers the voltage to $U = 4.9\,\Omega \cdot 2\,\text{A} = 9.8\,\text{V}$. That is why you always measure the voltage directly across the component.

</details>

## Ideas for the classroom

- **Use:** resistance, Ohm’s law and characteristics (grades 8/9), the wire resistance $R = \rho \cdot \frac{l}{A}$ as an extension. Data are produced by reading the meters, like in the lab; with `fit=0` students draw the best-fit line themselves. Since textbooks use both conventions, you can switch between the $I$–$U$ characteristic and the $U$–$I$ graph. Several series stay in the graph for comparison.
- **Meters:** The analogue meters choose their range automatically (it is shown below the scale; small currents in mA). With real meters the range is set by hand – starting with the largest range.
- **Model:** power supply $0$ to $12\,\text{V}$ with a current limit of $2\,\text{A}$; ideal meters. Bulb $12\,\text{V}\,/\,0.25\,\text{A}$: balance between the electrical power supplied and the losses by radiation and heat conduction, resistance of tungsten $R \propto T^{1.2}$. Heating of the constantan wire is neglected. The filament temperature is a model value.
- **Common stumbling blocks:**
  - “$R = U / I$ is Ohm’s law.” – This is the definition of resistance and holds for every component. Ohm’s law says that $R$ is constant ($I \propto U$).
  - “A large resistance lets a lot of current through.” – It is the other way round.
  - “The ammeter can also be connected in parallel.” – In parallel it causes almost a short circuit.
