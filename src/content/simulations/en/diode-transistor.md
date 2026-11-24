---
description: "Record the characteristic of a diode, see the pn junction in the particle model, rectify alternating voltage and use the transistor as a switch and amplifier."
---

## What is it about?

**Semiconductors** such as silicon conduct poorly but can be changed deliberately by **doping**: a few foreign atoms with five outer electrons (e.g. phosphorus) supply freely moving **electrons** (n-doping); foreign atoms with three outer electrons (e.g. boron) create **holes**, which move like positive charges (p-doping). Where the two regions meet, electrons and holes recombine. What remains is the **depletion layer** with fixed, charged ions – almost without mobile charge carriers.

A **diode** is such a pn junction. In the **forward direction** (plus on the p region) the depletion layer shrinks, and the current rises exponentially. In the **reverse direction** it widens, and only a tiny reverse current flows. The characteristic is described by the **Shockley equation**

$$
I = I_S \cdot \left(e^{\,U/(n \cdot U_T)} - 1\right), \qquad U_T = \frac{k \cdot T}{e} \approx 25.85\,\text{mV} \ (\text{at } 300\,\text{K})
$$

with the saturation current $I_S$ and the emission coefficient $n$. For every $n \cdot U_T \cdot \ln 10 \approx 60\,\text{mV}$ more voltage, ten times as much current flows (for $n = 1$). In the reverse direction $I \approx -I_S$.

- **Threshold voltage $U_S$:** from about this voltage on, a noticeable current flows. In the simulation it is defined as the voltage at $10\,\text{mA}$: silicon $\approx 0.65\,\text{V}$, germanium $\approx 0.30\,\text{V}$.
- **Light-emitting diodes (LEDs)** emit light when electrons and holes recombine. The threshold voltage depends on the colour: $e \cdot U_S \approx h \cdot f = \frac{h \cdot c}{\lambda}$. Blue LEDs need more voltage than red ones.
- **Rectifier:** one diode lets only one half-wave through (half-wave), four diodes in a bridge circuit use both. The peak value drops by the forward voltage $U_F \approx 0.7\,\text{V}$ per conducting diode: $\hat u_\text{out} = \hat U - U_F$ or $\hat U - 2\,U_F$. A **smoothing capacitor** keeps the voltage up between the peaks; what remains is a small **ripple voltage** $\Delta U \approx \frac{I}{f_B \cdot C}$.
- **Transistor (npn):** a small base current $I_B$ controls a large collector current $I_C = B \cdot I_B$ (current gain $B$, typically 100 to 500). The load resistor does not allow more than $I_{C,\max} = \frac{U_B - U_{CE,\text{sat}}}{R_C}$: the transistor is then **saturated** and works as a closed **switch**. In the linear range in between it **amplifies**.

**About the display:** the blue dots in the wires are electrons (against the conventional current direction, speed logarithmic in the current). The component values are typical model values; real diodes have, for example, a larger reverse current and a series resistance.

## Try it

1. Record the characteristic of the silicon diode: increase the voltage in small steps and press “Record a data point” each time – or “Automatic series”. From what voltage does the current rise steeply? [Silicon diode](?mode=diode&d=si)
2. Tap the diode in the picture. What do the meters show in the reverse direction? [Reverse bias](?mode=diode&flip=1&U=5)
3. Compare silicon and germanium. [Germanium](?mode=diode&d=ge&U=1)
4. Show the load line and change the series resistor. The operating point always lies at the intersection. [Load line](?mode=diode&line=1&U=3)
5. Look at the pn junction and reverse the battery. How does the depletion layer change? [pn junction](?mode=pn&U=1.5)
6. Slowly increase the voltage across the four LEDs. In what order do they light up? [LEDs](?mode=led&U=2.2)
7. Compare the half-wave and bridge rectifiers on the oscilloscope and add the capacitor. [Bridge with smoothing](?mode=rect&rc=bridge&cap=1)
8. Slowly make the sky of the twilight switch darker. When does the lamp come on? [Twilight switch](?mode=switch&bs=ldr&E=80)
9. In the amplifier, drag the operating point to the right until the output signal is clipped at the top. [Amplifier](?mode=amp)

## Exercises

### Exercise 1: Thermal voltage

Calculate $U_T = \frac{k \cdot T}{e}$ for $T = 300\,\text{K}$ and for $T = 330\,\text{K}$ ($k = 1.381 \cdot 10^{-23}\,\text{J/K}$, $e = 1.602 \cdot 10^{-19}\,\text{C}$).

<details>
<summary>Show solution</summary>

$U_T(300\,\text{K}) = \frac{1.381 \cdot 10^{-23} \cdot 300}{1.602 \cdot 10^{-19}}\,\text{V} \approx 25.85\,\text{mV}$, $U_T(330\,\text{K}) \approx 28.44\,\text{mV}$. Warmer means a flatter characteristic, but much more current at the same voltage, because $I_S$ grows strongly with temperature.

</details>

### Exercise 2: Ten times the current

The silicon diode in the simulation ($I_S = 10^{-13}\,\text{A}$, $n = 1$) carries about $1.2\,\text{mA}$ at $0.60\,\text{V}$. What current flows at $0.66\,\text{V}$? What voltage do you need at the power supply with $R = 100\,\Omega$? [Load exercise](?mode=diode&U=1.88&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{I(0.66\,\text{V})}{I(0.60\,\text{V})} = e^{0.06/0.02585} \approx 10.2$, so $I \approx 12.2\,\text{mA}$. At the power supply: $U_0 = U_D + I \cdot R = 0.66\,\text{V} + 12.2\,\text{mA} \cdot 100\,\Omega \approx 1.88\,\text{V}$. [Show in the simulation](?mode=diode&U=1.88)

</details>

### Exercise 3: Rectifier

A transformer supplies $\hat U = 12\,\text{V}$. Find the peak output voltage for a half-wave and a bridge rectifier ($U_F = 0.7\,\text{V}$). Why is the mean value almost twice as large for the bridge? [Load exercise](?mode=rect&Uh=12&rc=bridge&_hide=1)

<details>
<summary>Show solution</summary>

Half-wave: $12\,\text{V} - 0.7\,\text{V} = 11.3\,\text{V}$; bridge: $12\,\text{V} - 1.4\,\text{V} = 10.6\,\text{V}$, because the current always flows through two diodes. The bridge uses both half-waves: mean value $\approx 6.29\,\text{V}$ instead of $\approx 3.48\,\text{V}$ (without the forward voltage it would be $\frac{2\hat U}{\pi} = 7.64\,\text{V}$ and $\frac{\hat U}{\pi} = 3.82\,\text{V}$). [Show in the simulation](?mode=rect&Uh=12&rc=bridge)

</details>

### Exercise 4: Transistor as an amplifier

A transistor with $B = 150$ receives $I_B = 0.08\,\text{mA}$; $U_B = 9\,\text{V}$, $R_C = 470\,\Omega$, $U_{CE,\text{sat}} = 0.2\,\text{V}$. Calculate $I_C$ and $U_{CE}$. What changes at $I_B = 0.2\,\text{mA}$? [Load exercise](?mode=amp&B=150&IB=0.08&ac=0&_hide=1)

<details>
<summary>Show solution</summary>

$I_C = 150 \cdot 0.08\,\text{mA} = 12\,\text{mA}$, $U_{CE} = 9\,\text{V} - 12\,\text{mA} \cdot 470\,\Omega \approx 3.36\,\text{V}$. At $0.2\,\text{mA}$, $B \cdot I_B$ would be $30\,\text{mA}$, but at most $I_{C,\max} = \frac{8.8\,\text{V}}{470\,\Omega} \approx 18.7\,\text{mA}$ is possible: the transistor is saturated. [Show in the simulation](?mode=amp&B=150&IB=0.2&ac=0)

</details>

### Exercise 5: Planck's constant from an LED

The blue LED ($\lambda = 470\,\text{nm}$) has the threshold voltage $U_S \approx 2.64\,\text{V}$ in the simulation. Determine $h$ from this. [Load exercise](?mode=led&d=blu&U=4&_hide=1)

<details>
<summary>Show solution</summary>

$f = \frac{c}{\lambda} = \frac{3.00 \cdot 10^8\,\text{m/s}}{470 \cdot 10^{-9}\,\text{m}} \approx 6.38 \cdot 10^{14}\,\text{Hz}$, $h \approx \frac{e \cdot U_S}{f} = \frac{1.602 \cdot 10^{-19}\,\text{C} \cdot 2.64\,\text{V}}{6.38 \cdot 10^{14}\,\text{Hz}} \approx 6.6 \cdot 10^{-34}\,\text{J·s}$. In the model $U_S$ is chosen exactly like this; real LEDs give values that differ by a few per cent. [Show in the simulation](?mode=led&d=blu&U=4)

</details>

### Exercise 6: Twilight switch

At $10\,\text{lx}$ the photoresistor has about $15\,\text{k}\Omega$, $R_1 = 47\,\text{k}\Omega$. Calculate the voltage at the voltage divider. Explain why the lamp lights up in the dark but not in daylight. [Load exercise](?mode=switch&bs=ldr&E=50&_hide=1)

<details>
<summary>Show solution</summary>

$U = 9\,\text{V} \cdot \frac{15\,\text{k}\Omega}{47\,\text{k}\Omega + 15\,\text{k}\Omega} \approx 2.18\,\text{V}$ – well above the base–emitter threshold of about $0.6\,\text{V}$: base current flows and the lamp lights up. In daylight the LDR has a low resistance (about $600\,\Omega$ at $1000\,\text{lx}$), the voltage stays below $0.6\,\text{V}$ and the transistor blocks. $R_1$ sets the switching threshold. [Show in the simulation](?mode=switch&bs=ldr&E=50)

</details>

## Ideas for the classroom

- **Use:** electronics in grades 9/10 (characteristic, diode, transistor as a switch) and in upper secondary (semiconductor physics, pn junction, amplifier). Where exactly the topic appears differs between curricula – please check yours.
- **Real experiment and simulation:** first record the characteristic with a real diode, a power supply and two multimeters, then compare with the automatic series – it becomes clear why a series resistor is needed.
- **LEDs and $h$:** prepare or follow up the classic LED experiment for determining $h$; the LED view shows the relationship $e \cdot U_S \approx h \cdot f$ at a glance.
- **Rectifier:** the oscilloscope picture invites students to draw the current path through the bridge for both half-waves themselves and then compare with the diodes that light up.
- **Common pitfalls:**
  - “The diode has a fixed resistance.” – Its resistance $U/I$ depends strongly on the voltage; the characteristic is not a straight line.
  - “Below the threshold voltage no current flows at all.” – The current grows continuously and exponentially; $U_S$ is only a practical limit.
  - “The transistor produces energy.” – The energy comes from the supply voltage $U_B$; the transistor only controls how much of it flows.
  - “Holes are particles.” – A hole is a missing electron bond that behaves like a positive charge.
