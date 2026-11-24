---
description: "From the power plant to the socket: energy flow diagrams with efficiencies, the electricity mix over a whole day, pumped storage and batteries, and high voltage against line losses."
---

## What is it about?

Electrical energy does not simply come “out of the socket”. A **power plant** converts another form of energy into electrical energy in several stages – in a coal power plant, for example: chemical energy → thermal energy (boiler) → rotational energy (turbine) → electrical energy (generator). At every stage part of it is lost to the surroundings as heat (**energy degradation**). The energy does not disappear; it just can no longer be used. The **efficiency** states what share is used:

$$
\eta = \frac{P_\text{out}}{P_\text{in}} \qquad \eta_\text{total} = \eta_1 \cdot \eta_2 \cdot \eta_3 \cdot \ldots
$$

The **energy flow diagram** (Sankey diagram) shows this: the width of a band is proportional to the power, and the losses branch off downwards. The input power is always equal to the sum of the useful power and the losses (**conservation of energy**).

**Renewable** energies (wind, sun, water, biomass) are available again and again; **finite** energy sources (coal, natural gas, uranium) are not. Wind and sun only deliver when the weather allows. That is why a power grid needs **storage** and **controllable** power plants, because at every moment exactly as much power must be fed in as is consumed.

The **energy** follows from power and time; the energy in **pumped storage** comes from the potential energy of the water:

$$
E = P \cdot t \qquad E = m \cdot g \cdot h \qquad 1\,\text{kWh} = 3.6 \cdot 10^6\,\text{J}
$$

During **transmission** through lines with resistance $R$, heat is produced. For the same power $P$:

$$
I = \frac{P}{U} \qquad P_\text{L} = I^2 \cdot R
$$

Three times the voltage means a third of the current and only a ninth of the losses. That is why electrical energy is transmitted at **high voltage** (110 kV to 380 kV); **transformers** step the voltage up and down again.

All numbers in the simulation are **rounded example values**: efficiencies of typical modern plants, CO₂ values as rounded medians over the whole life cycle according to the IPCC (2014), the daily curve for a large example country – not measured data.

## Try it

1. Tap the seven power plants one after the other. Where are the largest losses? Which plant has the highest efficiency, which the lowest? [Coal power plant](?src=kohle) · [Wind turbine](?src=wind) · [Hydroelectric power plant](?src=wasser)
2. Tap a stage in the diagram (e.g. the steam turbine) and read the explanation. Why is so much energy lost exactly there?
3. Switch on combined heat and power for the gas plant. What changes in the efficiency, and what in the overall utilisation? [Gas with combined heat and power](?src=gas&chp=1)
4. Play a sunny summer day. When is the sun enough, and when do storage and gas plants step in? [Summer day](?mode=day&sea=sommer&sun=100&wind=20)
5. Compare a calm winter night with a storm. How do the share of renewable energy and the CO₂ per kWh change? [Dark doldrums](?mode=day&sea=winter&sun=15&wind=5) · [Storm](?mode=day&sea=winter&sun=30&wind=95)
6. Drag the upper reservoir of the pumped-storage plant upwards. How does the stored energy depend on the height? [Pumped storage](?mode=store)
7. Change the voltage of the line from 20 kV to 380 kV. Watch the current, the dots on the line and the losses. [High voltage](?mode=grid&u=20)

## Exercises

### Exercise 1: Energy and power

a) A $1\,\text{kW}$ fan heater runs for $3\,\text{h}$. How much energy is converted?
b) The coal power plant in the simulation delivers $398\,\text{MW}$. How much electrical energy does it deliver in $8\,\text{h}$? [Load exercise](?src=kohle&dur=8&_hide=1)

<details>
<summary>Show solution</summary>

a) $E = P \cdot t = 1\,\text{kW} \cdot 3\,\text{h} = 3\,\text{kWh}$.

b) $E = 398\,\text{MW} \cdot 8\,\text{h} = 3184\,\text{MWh}$. That is roughly the annual demand of $3\,184\,000\,\text{kWh} : 3500\,\text{kWh} \approx 910$ households. [Show in the simulation](?src=kohle&dur=8)

</details>

### Exercise 2: Efficiency

A power plant receives $100\,\text{MW}$ of thermal power and has an efficiency of $40\%$. How large are the electrical power and the waste heat? Then check in the simulation how the total efficiency of the coal power plant results from the stages. [Load exercise](?src=kohle&pin=100&_hide=1)

<details>
<summary>Show solution</summary>

$P_\text{el} = 0.40 \cdot 100\,\text{MW} = 40\,\text{MW}$, waste heat $100\,\text{MW} - 40\,\text{MW} = 60\,\text{MW}$. In the simulation’s coal power plant: $\eta = 0.90 \cdot 0.47 \cdot 0.98 \cdot 0.96 \approx 0.398$, so from $100\,\text{MW}$ about $39.8\,\text{MW}$ electrical. The biggest gap is the steam turbine (47%): the steam has to be cooled, and this heat is lost through the cooling tower. [Show in the simulation](?src=kohle&pin=100)

</details>

### Exercise 3: Pumped storage

An upper reservoir holds $1$ million $\text{m}^3$ of water, $300\,\text{m}$ above the lower reservoir. Calculate the stored potential energy in MWh. How long can a $300\,\text{MW}$ turbine run on it if it converts 87% of the potential energy into electrical energy? [Load exercise](?mode=store&sto=pump&hp=300&vol=1&pp=300&_hide=1)

<details>
<summary>Show solution</summary>

$m = 1000\,\tfrac{\text{kg}}{\text{m}^3} \cdot 10^6\,\text{m}^3 = 10^9\,\text{kg}$, $E = m \cdot g \cdot h = 10^9\,\text{kg} \cdot 9.81\,\tfrac{\text{m}}{\text{s}^2} \cdot 300\,\text{m} = 2.943 \cdot 10^{12}\,\text{J}$. With $1\,\text{MWh} = 3.6 \cdot 10^9\,\text{J}$: $E \approx 817.5\,\text{MWh}$. Electrical: $0.87 \cdot 817.5\,\text{MWh} \approx 711\,\text{MWh}$, so $t = 711\,\text{MWh} : 300\,\text{MW} \approx 2.4\,\text{h}$. Twice the amount of water at half the height stores just as much. [Show in the simulation](?mode=store&sto=pump&hp=150&vol=2&pp=300)

</details>

### Exercise 4: Why high voltage?

$100\,\text{MW}$ are transmitted over a line with $R = 10\,\Omega$. Calculate the current and the power loss at $110\,\text{kV}$ and at $380\,\text{kV}$. [Load exercise](?mode=grid&pt=100&len=100&u=110&_hide=1)

<details>
<summary>Show solution</summary>

$110\,\text{kV}$: $I = 100\,\text{MW} : 110\,\text{kV} \approx 909\,\text{A}$, $P_\text{L} = (909\,\text{A})^2 \cdot 10\,\Omega \approx 8.26\,\text{MW}$ (8.3%).
$380\,\text{kV}$: $I \approx 263\,\text{A}$, $P_\text{L} \approx 0.69\,\text{MW}$ (0.7%). The losses drop by the factor $(380 : 110)^2 \approx 11.9$. [Show in the simulation](?mode=grid&pt=100&len=100&u=380)

</details>

### Exercise 5: A day without coal

Set up the sunny summer day and then switch off the coal plants. How do the amount of gas, the surplus and the CO₂ per kWh change? Explain why a power plant that always runs evenly fits well with the midday sun – or does not. [Load exercise](?mode=day&sea=sommer&sun=100&wind=20&base=0&_hide=1)

<details>
<summary>Show solution</summary>

With $8\,\text{GW}$ of coal (example values): about 191 GWh of gas, 84 GWh of surplus, about 227 g CO₂/kWh. Without coal: about 316 GWh of gas, only 17 GWh of surplus, about 163 g CO₂/kWh. Coal keeps running at midday too, when the sun already supplies almost everything – then electricity has to be exported or curtailed. Gas plants can be controlled quickly and fill exactly the gaps, but cause less CO₂ than coal. [Show in the simulation](?mode=day&sea=sommer&sun=100&wind=20&base=0)

</details>

## Ideas for the classroom

- **Use:** energy conversion and efficiency (lower secondary), renewable and finite energy sources, energy supply as a topic for evaluation up to upper secondary (please check your curriculum). The four views also suit a jigsaw activity: power plants, daily curve, storage, grid.
- **Evaluating:** the daily curve lets you discuss questions of the energy transition – for example how much storage would be needed to bridge dark doldrums, or what grid expansion and exports can achieve.
- **Model and simplifications:** all values are rounded example values. The line is calculated as in school with $I = P/U$ (without three-phase current, reactive power and voltage drop). In the daily model there is no electricity exchange with neighbouring countries except “surplus”; gas plants cover every gap. With combined heat and power the electrical efficiency stays unchanged here; in real plants it drops slightly.
- **Common pitfalls:**
  - “Energy is lost.” – It is degraded: afterwards it is present as heat at a low temperature.
  - “Kilowatt and kilowatt-hour are the same.” – kW is a power, kWh an energy ($E = P \cdot t$).
  - “High voltage means high losses.” – For the same power it is the other way round: what matters is the current.
  - “A storage system produces energy.” – It gives back less than was put in.
