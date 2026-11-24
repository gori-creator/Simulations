## What is it about?

A **capacitor** stores electric charge: electrons collect on one plate, they are missing on the other. The charge $Q$ is proportional to the voltage, $Q = C \cdot U$, with the **capacitance** $C$ (unit farad, $1\,\text{F} = 1\,\frac{\text{C}}{\text{V}}$). One farad is a lot; common capacitors have capacitances in µF ($10^{-6}\,\text{F}$), nF ($10^{-9}\,\text{F}$) or pF ($10^{-12}\,\text{F}$). How large $C$ is depends on how it is built; for a parallel-plate capacitor, for example, $C = \varepsilon_0 \cdot \varepsilon_r \cdot \frac{A}{d}$.

**Charging (switch position 1):** the empty capacitor is connected to the voltage $U_0$ through a resistor $R$. At the start the whole voltage is across the resistor, and the largest current flows:

$$
I_0 = \frac{U_0}{R} .
$$

The fuller the capacitor gets, the larger its opposing voltage $U_C$ and the smaller the current. The voltage approaches $U_0$ more and more slowly:

$$
U_C(t) = U_0 \cdot \left(1 - e^{-t/\tau}\right), \qquad I(t) = I_0 \cdot e^{-t/\tau} .
$$

**Discharging (switch position 2):** the capacitor is short-circuited through the resistor. Voltage and current fall exponentially; the current now flows in the opposite direction (negative in the graph):

$$
U_C(t) = U_0 \cdot e^{-t/\tau}, \qquad I(t) = -I_0 \cdot e^{-t/\tau} .
$$

How fast this happens is set by the **time constant**

$$
\tau = R \cdot C .
$$

What it means:

- **After $t = \tau$:** when charging, the voltage has reached 63 % of its final value. When discharging, it has fallen to 37 % ($e^{-1} \approx 0.37$).
- **Tangent at $t = 0$:** it meets the final value exactly at $t = \tau$. This lets you read $\tau$ from a measured curve.
- **Half-life $t_{1/2} = \tau \cdot \ln 2 \approx 0.69\,\tau$:** after this time the distance to the final value has halved, after $2\,t_{1/2}$ it has quartered.
- **After about $5\,\tau$:** the process is considered complete (over 99 %).

The full capacitor stores the **energy**

$$
W = \tfrac12 \cdot C \cdot U^2 .
$$

**About the display:**

- The dots in the circuit are electrons. They move against the conventional current direction (red arrow); their speed is proportional to the current.
- The number of plus and minus signs on the plates grows with $U_C$.
- The resistor glows while current flows, because energy is converted into heat there.
- If $\tau$ is very small or very large, the picture runs in fast motion or slow motion (shown at the top right). The graphs always show the real time.

## Try it

1. Watch the electrons, the plates and the graphs while charging. When does the largest current flow? [Charge](?sw=charge)
2. Tap the switch in the picture while the capacitor is still charging. From what voltage does the discharge start? [Charge](?sw=charge)
3. Read the time constant from the tangent and compare with $R \cdot C$. [With tangent](?tan=1)
4. Double the resistance or the capacitance. How do $\tau$ and $I_0$ change? [R = 20 kΩ](?R=20) · [C = 200 µF](?C=200)
5. Discharging with half-life: after how many half-lives is only an eighth of the voltage left? [Half-life](?sw=discharge&half=1&tan=0)

## Exercises

### Exercise 1: Time constant and initial current

A capacitor with $C = 100\,\mu\text{F}$ is charged through $R = 10\,\text{k}\Omega$ to $U_0 = 10\,\text{V}$. Calculate $\tau$, $I_0$ and the voltage after $t = \tau$. [Load exercise](?tan=0&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\tau = R \cdot C = 10^4\,\Omega \cdot 10^{-4}\,\text{F} = 1.0\,\text{s}$, $I_0 = \frac{10\,\text{V}}{10\,\text{k}\Omega} = 1.0\,\text{mA}$,
$U_C(\tau) = 10\,\text{V} \cdot (1 - e^{-1}) \approx 6.32\,\text{V}$. [Show in the simulation](?tan=1)

</details>

### Exercise 2: Half-life

How long does it take for the same capacitor to have only $5\,\text{V}$ left when discharging? And to $2.5\,\text{V}$? [Load exercise](?sw=discharge&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$t_{1/2} = \tau \cdot \ln 2 \approx 0.693\,\text{s}$; to $2.5\,\text{V}$ it takes two half-lives, i.e. about $1.39\,\text{s}$. [Show in the simulation](?sw=discharge&half=1&tan=0)

</details>

### Exercise 3: Energy

How much energy does the capacitor ($100\,\mu\text{F}$) store at $10\,\text{V}$? How much is it at half the voltage? [Load exercise](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

$W = \tfrac12 \cdot 10^{-4}\,\text{F} \cdot (10\,\text{V})^2 = 5\,\text{mJ}$. At half the voltage only a quarter: $1.25\,\text{mJ}$. [Show in the simulation](?sw=charge)

</details>

### Exercise 4: When is the capacitor full?

The same capacitor ($100\,\mu\text{F}$, $10\,\text{k}\Omega$, $10\,\text{V}$) is charged. What is its voltage after $2\,\tau$ and after $5\,\tau$? How much charge does it carry when full? [Load exercise](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

After $2\,\tau$: $U_C = 10\,\text{V} \cdot (1 - e^{-2}) \approx 8.65\,\text{V}$, i.e. about 86 %. After $5\,\tau$: $U_C = 10\,\text{V} \cdot (1 - e^{-5}) \approx 9.93\,\text{V}$, i.e. over 99 %. Fully charged: $Q = C \cdot U_0 = 10^{-4}\,\text{F} \cdot 10\,\text{V} = 10^{-3}\,\text{C} = 1\,\text{mC}$. At the end of the process ($t = 5\,\text{s}$) the simulation shows $U_C = 9.93\,\text{V}$. [Show in the simulation](?sw=charge)

</details>

## Ideas for the classroom

- Record the real experiment with a large electrolytic capacitor (e.g. 1000 µF, 10 kΩ, data logger) and compare the curves and $\tau$ with the simulation.
- Compare the tangent method and the half-life method for determining $\tau$.
- **Typical stumbling blocks:**
  - “Current flows through the capacitor.” – The charges only flow in the leads; between the plates there is an insulating layer.
  - “After $2\,\tau$ the capacitor is full.” – Only after about $5\,\tau$ is it practically full; in theory never completely.
  - “When discharging, the current flows in the same direction.” – It reverses, which is why $I$ is negative in the graph.
