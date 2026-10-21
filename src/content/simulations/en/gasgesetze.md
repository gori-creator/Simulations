---
description: "Interactive simulation of the gas laws – gas in a cylinder with a piston in the particle model, isothermal (Boyle–Mariotte), isobaric (Gay-Lussac) and isochoric (Amontons) changes, data series in p–V, p–1/V, V–T and p–T graphs, extrapolation to absolute zero and the ideal gas law."
---

## What is it about?

The state of a fixed amount of gas is described by three quantities: its **pressure** $p$, its **volume** $V$ and its **absolute temperature** $T$ (in kelvin, $T = \vartheta + 273.15\,\text{K}$). If one quantity is kept fixed, the other two are related in a simple way:

| Experiment | fixed | Law | Graph |
| --- | --- | --- | --- |
| **isothermal** (water bath) | $T$ | Boyle–Mariotte: $p \cdot V = \text{constant}$ | hyperbola in the p–V graph |
| **isobaric** (weight on the piston) | $p$ | Gay-Lussac: $\frac{V}{T} = \text{constant}$ | line through the origin in the V–T graph |
| **isochoric** (piston locked) | $V$ | Amontons: $\frac{p}{T} = \text{constant}$ | line through the origin in the p–T graph |

All three are special cases of the **ideal gas law**:

$$
p \cdot V = n \cdot R \cdot T, \qquad R = 8.314\,\tfrac{\text{J}}{\text{mol} \cdot \text{K}}
$$

Here $n$ is the **amount of substance** in mol. Handy for calculations: $1\,\text{kPa} \cdot 1\,\text{L} = 1\,\text{J}$. Example: $1\,\text{mol}$ of gas at $0\,°\text{C}$ and standard pressure $101.325\,\text{kPa}$ takes up

$$
V = \frac{n \cdot R \cdot T}{p} = \frac{1\,\text{mol} \cdot 8.314\,\frac{\text{J}}{\text{mol}\cdot\text{K}} \cdot 273.15\,\text{K}}{101.325\,\text{kPa}} \approx 22.4\,\text{L}
$$

(the **molar volume**).

**Units:** The simulation gives the pressure in kilopascals. $1\,\text{bar} = 100\,\text{kPa} = 1000\,\text{hPa} = 10^5\,\text{Pa}$; normal air pressure is about $1013\,\text{hPa} = 101.3\,\text{kPa} \approx 1\,\text{bar}$. The volume is in litres: $1\,\text{L} = 1\,\text{dm}^3 = 10^{-3}\,\text{m}^3$. So $1\,\text{kPa} \cdot 1\,\text{L} = 10^3\,\text{Pa} \cdot 10^{-3}\,\text{m}^3 = 1\,\text{N} \cdot \text{m} = 1\,\text{J}$. For Boyle–Mariotte and the ratio equations you may use any unit as long as it is the same on both sides – only the temperature must always be in kelvin.

**Linearisation:** A hyperbola is hard to recognise as such. If you plot $p$ against $\frac{1}{V}$, the points of an isothermal series lie on a **line through the origin** with slope $p \cdot V = n \cdot R \cdot T$.

**Absolute zero:** If you measure the volume at constant pressure (or the pressure at constant volume) at several temperatures and extend the line of best fit to the left, it meets the temperature axis near $-273\,°\text{C}$. There the volume or the pressure of an ideal gas would be zero. This temperature, $\vartheta = -273.15\,°\text{C}$ or $T = 0\,\text{K}$, is called **absolute zero**; there are no lower temperatures. That is why the gas laws only work with the kelvin temperature.

**Particle model:** The pressure is caused by the particles hitting the walls and the piston (the collisions flash briefly on screen). Half the volume means twice as many collisions per area and time, so twice the pressure. A higher temperature means faster particles: they hit the walls more often **and** harder. Twice the number of particles at the same $V$ and $T$ gives twice the pressure. The simulation also measures the pressure directly from the collisions of the last few seconds and shows it next to the value from the formula (“from collisions ≈ …”). Because there are only a few particles on screen, this value fluctuates by a few per cent – with the unimaginably many particles of a real gas the pressure is completely steady.

**About the model:** The particle model is two-dimensional with only a few particles (24 per mole) and heavily slowed down. The particles are point-like and only hit the walls – exactly the model of an **ideal gas**. Real gases deviate from it at high pressure and low temperature (shortly before they liquefy). The piston slides without friction; in the isobaric experiment the weight and the outside air pressure together set the pressure. The pressure is always the **absolute** pressure. If you like, the data points carry a small measurement uncertainty (about $\pm 1\,\%$).

## Try it

1. Drag the piston down by its handle until the volume is halved. What does the pressure gauge show? What happens to the rectangle $p \cdot V$ in the graph? [Starting state](?V=22.4)
2. Start “Automatic series” in the isothermal experiment and then switch to the p–1/V graph. [Linearisation](?ch=pinv&V=15)
3. Raise the temperature of the water bath. Where does the new isotherm lie compared with the old ones? [Isotherm at 100 °C](?T=100)
4. Switch to the isobaric experiment and heat from $0\,°\text{C}$ to $100\,°\text{C}$. By what factor does the volume grow? Compare with $\frac{373.15\,\text{K}}{273.15\,\text{K}}$. [Gay-Lussac](?mode=isobar&ch=VT&T=100)
5. Record an automatic series in the isobaric or isochoric experiment. Where does the extended line meet the temperature axis? [Amontons](?mode=isochor&ch=pT)
6. Double the amount of gas at the same volume and temperature. Count the particles and compare the pressure. [Twice the particles](?n=2)
7. What happens in the isobaric experiment when the piston hits the top stop? Is $p = \text{constant}$ still true? [Stop](?mode=isobar&n=2&T=200&p=60&ch=pV)

## Tasks

### Task 1: Molar volume

What volume does $1\,\text{mol}$ of an ideal gas take up at $100\,°\text{C}$ and $101.3\,\text{kPa}$? [Load task](?mode=isobar&ch=VT&T=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \frac{n R T}{p} = \frac{1 \cdot 8.314 \cdot 373.15}{101.3}\,\text{L} \approx 30.6\,\text{L}$. The same result follows from Gay-Lussac: $22.4\,\text{L} \cdot \frac{373.15\,\text{K}}{273.15\,\text{K}} \approx 30.6\,\text{L}$. So the volume only grows by a factor of $1.37$. With Celsius values ($\frac{100}{0}$) you could not calculate at all. [Show in the simulation](?mode=isobar&ch=VT&T=100)

</details>

### Task 2: Pushing the piston in

$1\,\text{mol}$ of gas at $0\,°\text{C}$ has a volume of $30\,\text{L}$. The piston is pushed in slowly (isothermally) to $15\,\text{L}$. Calculate the pressure before and after. [Load task](?V=30&_hide=1)

<details>
<summary>Show solution</summary>

$p_1 = \frac{n R T}{V_1} = \frac{8.314 \cdot 273.15}{30}\,\text{kPa} \approx 75.7\,\text{kPa}$; by Boyle–Mariotte $p_2 = p_1 \cdot \frac{V_1}{V_2} = 2 \cdot p_1 \approx 151.4\,\text{kPa}$. [Show in the simulation](?V=15)

</details>

### Task 3: Car tyre

A tyre has an (absolute) pressure of $250\,\text{kPa}$ at $10\,°\text{C}$. After a long drive in the sun it is $50\,°\text{C}$ warm. Its volume hardly changes. What is the pressure now? [Load task](?mode=isochor&ch=pT&T=10&n=1.2&V=11.3&_hide=1)

<details>
<summary>Show solution</summary>

Isochoric: $\frac{p_2}{T_2} = \frac{p_1}{T_1}$, so $p_2 = 250\,\text{kPa} \cdot \frac{323.15\,\text{K}}{283.15\,\text{K}} \approx 285\,\text{kPa}$ – about $14\,\%$ more. Using Celsius values ($\frac{50}{10}$) would wrongly give five times the pressure. [Show in the simulation](?mode=isochor&ch=pT&T=50&n=1.2&V=11.3)

</details>

### Task 4: Analysing a data series

Record an automatic series in the isochoric experiment. Read off from the line of best fit at which temperature the pressure would be zero, and explain why the result is not exactly $-273.15\,°\text{C}$. [Load task](?mode=isochor&ch=pT&_hide=1)

<details>
<summary>Show solution</summary>

The line meets the ϑ axis close to $-273\,°\text{C}$ (see “Analysis”). The data scatter by about $1\,\%$; because the line is extended far beyond the measuring range ($-50\,°\text{C}$ to $250\,°\text{C}$), small errors in the slope have a large effect. Without measurement uncertainty the result is exactly $-273.15\,°\text{C}$. [Without uncertainty](?mode=isochor&ch=pT&noise=0)

</details>

### Task 5: Finding the amount of substance

A $20\,\text{L}$ container holds gas at $27\,°\text{C}$ and $150\,\text{kPa}$. How many moles of gas are inside, and how many particles is that?

<details>
<summary>Show solution</summary>

$n = \frac{p V}{R T} = \frac{150 \cdot 20}{8.314 \cdot 300.15}\,\text{mol} \approx 1.2\,\text{mol}$; $N = n \cdot N_\text{A} \approx 1.2 \cdot 6.02 \cdot 10^{23} \approx 7.2 \cdot 10^{23}$. [Check](?n=1.2&T=27&V=20)

</details>

### Task 6: Closing off a syringe

A syringe contains $60\,\text{mL}$ of air at $1013\,\text{hPa}$. You close the opening and slowly (isothermally) push the plunger in to $20\,\text{mL}$. What is the pressure now? Give it in hPa, kPa and bar.

<details>
<summary>Show solution</summary>

Boyle–Mariotte: $p_2 = p_1 \cdot \frac{V_1}{V_2} = 1013\,\text{hPa} \cdot \frac{60\,\text{mL}}{20\,\text{mL}} = 3039\,\text{hPa} \approx 304\,\text{kPa} \approx 3.0\,\text{bar}$. You do not need to convert the volume into litres because only the ratio matters. You can try the same ratio in the simulation: push the piston from $30\,\text{L}$ to $10\,\text{L}$ – the pressure triples. [Start at 30 L](?V=30)

</details>

## Ideas for the classroom

- **Use:** gas laws in lower secondary thermal physics, or as revision in upper secondary physics or in chemistry (molar volume, amount of substance); please check the exact place in your curriculum. Works well alongside real experiments with a gas syringe, a gas thermometer or a syringe with a pressure gauge.
- **Ask for predictions:** “What does the gauge show if we halve the volume?” or “How large does the volume get at $100\,°\text{C}$?” – for the second question many students first expect it to double or more.
- **Data series as in a lab session:** Record data points one by one, copy the table, draw a graph by hand and extend the line; then compare with the simulation. The measurement uncertainty can be switched on and off.
- **Connect particle model and formula:** The display “from collisions” shows that pressure is nothing but the effect of many particle collisions.
- **Common stumbling blocks:**
  - Calculating with Celsius instead of kelvin – then “twice the temperature” and ratios make no sense.
  - “At $-273\,°\text{C}$ the gas disappears.” – The line is an extrapolation for an ideal gas; real gases liquefy before that.
  - Confusing gauge pressure (tyre gauge) with absolute pressure.
  - “When compressed, the particles get smaller.” – Only the distances and hence the number of collisions per area change.
  - Taking the isotherm for a falling straight line – the linearisation p against 1/V clears this up.
- **Curriculum link:** relationship between pressure, volume and temperature of gases, the kelvin scale and absolute zero, particle model of pressure; analysing data series by linearisation. The ideal gas law with the amount of substance is rather upper-secondary or chemistry material.
