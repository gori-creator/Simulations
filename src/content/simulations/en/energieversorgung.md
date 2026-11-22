---
description: "From the power plant to the socket: energy flow diagrams with efficiencies, the electricity mix over a whole day, pumped storage and batteries, and high voltage against line losses."
---

## What is it about?

A **power plant** converts another form of energy into electrical energy in several stages – in a coal plant: chemical energy → thermal energy (boiler) → rotational energy (turbine) → electrical energy (generator). At every stage part of the energy is lost to the surroundings as heat (**energy dissipation**). The **efficiency** tells you which share is used:

$$
\eta = \frac{P_\text{out}}{P_\text{in}} \qquad \eta_\text{total} = \eta_1 \cdot \eta_2 \cdot \eta_3 \cdot \ldots
$$

In the **energy flow (Sankey) diagram** the width of a band is proportional to the power; the losses branch off downwards. Input power always equals useful power plus losses.

**Renewable** sources (wind, sun, water, biomass) are replenished, **finite** ones (coal, gas, uranium) are not. Wind and sun depend on the weather, so a grid needs **storage** and **dispatchable** plants: at every moment the power fed in must equal the power used.

$$
E = P \cdot t \qquad E = m \cdot g \cdot h \qquad I = \frac{P}{U} \qquad P_\text{loss} = I^2 \cdot R
$$

For the same power, three times the voltage means a third of the current and only a ninth of the losses – that is why electricity is transmitted at **high voltage** with **transformers**. All numbers in the simulation are **rounded example values** (CO₂: rounded life-cycle medians after IPCC 2014), not measured data.

## Try it

1. Tap the seven power plants. Where are the largest losses? [Coal](?src=kohle) · [Wind](?src=wind) · [Hydro](?src=wasser)
2. Switch on combined heat and power for the gas plant. [Gas with CHP](?src=gas&chp=1)
3. Play a sunny summer day, then compare a calm winter night with a storm. [Summer](?mode=day&sea=sommer&sun=100&wind=20) · [Dark doldrums](?mode=day&sea=winter&sun=15&wind=5) · [Storm](?mode=day&sea=winter&sun=30&wind=95)
4. Drag the upper reservoir of the pumped-storage plant. [Pumped storage](?mode=store)
5. Raise the line voltage from 20 kV to 380 kV. [High voltage](?mode=grid&u=20)

## Tasks

### Task 1: Energy and efficiency

a) A 1 kW heater runs for 3 h. How much energy does it use? b) A plant receives 100 MW of heat and has an efficiency of 40 %. What are the electrical power and the waste heat?

<details>
<summary>Show solution</summary>

a) $E = 1\,\text{kW} \cdot 3\,\text{h} = 3\,\text{kWh}$. b) $P_\text{el} = 0.40 \cdot 100\,\text{MW} = 40\,\text{MW}$, waste heat $60\,\text{MW}$. [Coal plant with 100 MW](?src=kohle&pin=100)

</details>

### Task 2: Pumped storage

1 million m³ of water is stored 300 m above the lower reservoir. How much energy is that in MWh? [Load task](?mode=store&sto=pump&hp=300&vol=1&pp=300&_hide=1)

<details>
<summary>Show solution</summary>

$E = m g h = 10^9\,\text{kg} \cdot 9.81\,\tfrac{\text{m}}{\text{s}^2} \cdot 300\,\text{m} = 2.943 \cdot 10^{12}\,\text{J} \approx 817.5\,\text{MWh}$. A 300 MW turbine converting 87 % runs for about $711\,\text{MWh} : 300\,\text{MW} \approx 2.4\,\text{h}$.

</details>

### Task 3: Why high voltage?

100 MW are transmitted through a line with $R = 10\,\Omega$. Compare 110 kV and 380 kV. [Load task](?mode=grid&pt=100&len=100&u=110&_hide=1)

<details>
<summary>Show solution</summary>

110 kV: $I \approx 909\,\text{A}$, $P_\text{loss} \approx 8.26\,\text{MW}$. 380 kV: $I \approx 263\,\text{A}$, $P_\text{loss} \approx 0.69\,\text{MW}$ – about $(380/110)^2 \approx 11.9$ times less. [Show](?mode=grid&pt=100&len=100&u=380)

</details>

## Ideas for the classroom

- **Use:** energy conversion and efficiency, renewable vs. finite sources, energy supply as an evaluation topic up to upper secondary level. The four views work well for a jigsaw activity.
- **Model:** rounded example values; the line is calculated with $I = P/U$ (no three-phase current); in the daily model gas plants fill every gap.
- **Common stumbling blocks:**
  - “Energy is lost.” – It is dissipated as low-temperature heat.
  - “kW and kWh are the same.” – kW is power, kWh is energy.
  - “High voltage means high losses.” – For the same power it is the other way round.
