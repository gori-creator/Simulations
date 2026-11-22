---
description: "Record the characteristic of a diode, see the pn junction in a particle model, rectify AC voltage and use a transistor as a switch and an amplifier."
---

## What is it about?

Doped semiconductors contain mobile **electrons** (n-type, e.g. phosphorus) or **holes** (p-type, e.g. boron). Where both regions meet, a **depletion layer** forms. A **diode** is such a pn junction. In the **forward direction** the layer shrinks and the current rises exponentially; in the **reverse direction** it widens and only a tiny reverse current flows. The **Shockley equation** describes the characteristic:

$$
I = I_S \cdot \left(e^{\,U/(n \cdot U_T)} - 1\right), \qquad U_T = \frac{k \cdot T}{e} \approx 25.85\,\text{mV} \ (\text{at } 300\,\text{K})
$$

- About 60 mV more voltage gives ten times the current ($n = 1$); in reverse $I \approx -I_S$.
- Threshold voltage (here: voltage at 10 mA): silicon ≈ 0.65 V, germanium ≈ 0.30 V. For LEDs $e \cdot U_S \approx h \cdot f$.
- **Rectifier:** peak output $\hat U - U_F$ (half-wave) or $\hat U - 2\,U_F$ (bridge); a smoothing capacitor leaves a small ripple $\Delta U \approx I/(f_r \cdot C)$.
- **Transistor:** $I_C = B \cdot I_B$, but at most $I_{C,\max} = (U_B - U_{CE,\text{sat}})/R_C$ (saturation – the transistor acts as a closed switch).

The component values are typical model values.

## Try it

1. Record the characteristic of the silicon diode point by point or automatically. [Silicon diode](?mode=diode&d=si)
2. Tap the diode to turn it round. [Reverse bias](?mode=diode&flip=1&U=5)
3. Show the load line. [Load line](?mode=diode&line=1&U=3)
4. Reverse the battery at the pn junction. [pn junction](?mode=pn&U=1.5)
5. Slowly raise the voltage at the four LEDs. [LEDs](?mode=led&U=2.2)
6. Compare half-wave and bridge rectifier and add the capacitor. [Bridge with smoothing](?mode=rect&rc=bridge&cap=1)
7. Make it dark in the twilight switch. [Twilight switch](?mode=switch&bs=ldr&E=80)

## Tasks

### Task 1: Ten times the current

The silicon diode ($I_S = 10^{-13}\,\text{A}$, $n = 1$) carries 1.2 mA at 0.60 V. Find the current at 0.66 V. [Load task](?mode=diode&U=1.88&_hide=1)

<details>
<summary>Show solution</summary>

$e^{0.06/0.02585} \approx 10.2$, so $I \approx 12.2\,\text{mA}$; the supply needs $0.66\,\text{V} + 12.2\,\text{mA} \cdot 100\,\Omega \approx 1.88\,\text{V}$. [Show in the simulation](?mode=diode&U=1.88)

</details>

### Task 2: Rectifier

$\hat U = 12\,\text{V}$, $U_F = 0.7\,\text{V}$. Find the output peak for both circuits. [Load task](?mode=rect&Uh=12&rc=bridge&_hide=1)

<details>
<summary>Show solution</summary>

Half-wave: 11.3 V; bridge: 10.6 V (two diodes in the path). Mean values: about 3.48 V and 6.29 V. [Show in the simulation](?mode=rect&Uh=12&rc=bridge)

</details>

### Task 3: Amplifier

$B = 150$, $I_B = 0.08\,\text{mA}$, $U_B = 9\,\text{V}$, $R_C = 470\,\Omega$. Find $I_C$ and $U_{CE}$. [Load task](?mode=amp&B=150&IB=0.08&ac=0&_hide=1)

<details>
<summary>Show solution</summary>

$I_C = 12\,\text{mA}$, $U_{CE} \approx 3.36\,\text{V}$. With $I_B = 0.2\,\text{mA}$ the transistor saturates at about 18.7 mA. [Show in the simulation](?mode=amp&B=150&IB=0.2&ac=0)

</details>

## Ideas for the classroom

- Record a real diode characteristic with two multimeters first, then compare with the automatic series.
- The LED view prepares the classic experiment to determine $h$.
- **Common stumbling blocks:**
  - “A diode has a fixed resistance.” – $U/I$ depends strongly on the voltage.
  - “Below the threshold no current flows at all.” – The current grows continuously; $U_S$ is a practical limit.
  - “The transistor produces energy.” – The energy comes from $U_B$; the transistor only controls it.
