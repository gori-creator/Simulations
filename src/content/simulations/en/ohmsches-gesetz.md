---
description: "Interactive Ohm’s law – set the voltage, read current and voltage on analogue meters and record the characteristics of a resistor, a light bulb and a constantan wire; R = U / I and R = ρ · l / A."
---

## What is it about?

The **ammeter** is connected **in series** with the component, the **voltmeter** **in parallel**. The **resistance** is

$$
R = \frac{U}{I} \qquad 1\,\Omega = 1\,\frac{\text{V}}{\text{A}}
$$

**Ohm’s law:** for metal wires at constant temperature, $I \propto U$ – the characteristic is a straight line through the origin and $R$ is constant. In a $U$–$I$ graph the slope equals $R$.

A **light bulb** filament gets very hot; its resistance rises from about $3\,\Omega$ (cold) to $48\,\Omega$ at $12\,\text{V}$, so its characteristic is curved. The resistance of a **wire** is $R = \rho \cdot \frac{l}{A}$ with $\rho_{\text{constantan}} = 0.49\,\Omega\,\text{mm}^2/\text{m}$.

## Try it

1. Turn the knob of the power supply, record data points or start the automatic series.
2. Compare resistors. [47 Ω](?R=47) · [150 Ω](?R=150)
3. Record the characteristic of the bulb. [Bulb](?part=lamp)
4. Double the length or the cross-section of the wire. [1 m](?part=wire&U=2) · [2 m](?part=wire&l=2&U=2) · [double area](?part=wire&A=0.2&U=2)

## Tasks

### Task 1: Unknown resistor

Determine resistor B from a series of measurements. [Load task](?part=mys&X=B&fit=0&_hide=1)

<details>
<summary>Show solution</summary>

At $8\,\text{V}$ the current is about $0.098\,\text{A}$, so $R \approx 82\,\Omega$.

</details>

### Task 2: Resistance of the bulb

Calculate the resistance of the bulb at $2\,\text{V}$ and at $12\,\text{V}$. [Load task](?part=lamp&U=2&_hide=1)

<details>
<summary>Show solution</summary>

About $18\,\Omega$ at $2\,\text{V}$ ($0.110\,\text{A}$) and $48\,\Omega$ at $12\,\text{V}$ ($0.25\,\text{A}$): the hotter filament has a larger resistance.

</details>

## Notes for teachers

- Data are read off like in the lab; `fit=0` hides the best-fit line. Both graph conventions ($I$ against $U$ and $U$ against $I$) are available; several series stay in the graph for comparison.
- Model: supply $0$–$12\,\text{V}$ with a $2\,\text{A}$ current limit, ideal meters with automatic range, bulb $12\,\text{V}/0.25\,\text{A}$ with a radiation–conduction energy balance and $R \propto T^{1.2}$.
- **Misconception:** “$R = U/I$ is Ohm’s law” – it defines resistance; Ohm’s law states that $R$ is constant.
