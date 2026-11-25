## What is it about?

The Earth gets its energy almost entirely from the **Sun**. In equilibrium it must give the same amount back – and into space that is only possible by **radiation**. The simulation shows this **radiation budget** in a simple model. All numbers are averages in watts per square metre of the Earth's surface.

### Sunlight and albedo

On average each square metre receives a quarter of the solar constant, about $\frac{1361}{4} \approx 340\,\tfrac{\text{W}}{\text{m}^2}$. About 30 % is reflected straight back by clouds, ice and snow – the **albedo** $a \approx 0.3$. The rest warms the ground.

### Thermal radiation of the ground

The warm ground emits infrared according to $P = \sigma T^4$. Without an atmosphere the balance $(1 - a) \cdot \frac{S}{4} = \sigma T^4$ gives $T \approx 255\,\text{K} \approx -18\,°\text{C}$ – an ice ball.

### The atmosphere as a blanket

Air is mostly transparent to sunlight but not to infrared: **greenhouse gases** such as water vapour, CO₂ and methane absorb a share $\varepsilon$ of the ground's radiation. The warmed air radiates itself – **half upwards, half back down**. This **back radiation** warms the ground further:

$$
\sigma T_\text{ground}^4 = (1 - a) \cdot \frac{S}{4} \cdot \frac{2}{2 - \varepsilon}
$$

With $\varepsilon \approx 0.78$ we get today's mean of about 15 °C – the **natural greenhouse effect**.

### More greenhouse gases

Burning coal, oil and gas raises CO₂, and $\varepsilon$ grows. A few hundredths more mean several degrees of warming. Melting ice lowers the albedo and warms even more – a **feedback**. The model is very simple (no clouds, convection or oceans), but the core idea holds.

## Try it

- [No greenhouse gases](?eps=0), [today](?eps=0.78), [more greenhouse gases](?eps=0.82)
- [Less ice](?alb=0.27), [snowball Earth](?alb=0.6)

## Exercises

**1. Earth without air.** Find the equilibrium temperature for $a = 0.3$ without atmosphere. [Load exercise](?eps=0&alb=0.3&_hide=1)

<details><summary>Show solution</summary>

$\sigma T^4 \approx 238\,\tfrac{\text{W}}{\text{m}^2}$, so $T \approx 255\,\text{K} \approx -18\,°\text{C}$.

</details>

**2. More energy at the ground than from the Sun?** The ground emits about 390 W/m² but receives only 238 W/m² from the Sun. Where does the rest come from? [Load exercise](?eps=0.78&_hide=1)

<details><summary>Show solution</summary>

From the **back radiation**: $238 + 152 = 390$. At the top, $86 + 152 = 238$ leave to space – the budget balances.

</details>

**3. How much warmer?** Raise $\varepsilon$ from 0.78 to 0.82. [Load exercise](?eps=0.82&_hide=1)

<details><summary>Show solution</summary>

From about 14.9 °C to 17.3 °C, roughly 2.4 degrees.

</details>

**4. Ice and albedo.** Why does melting ice amplify warming?

<details><summary>Show solution</summary>

Less ice means a darker surface, lower albedo, more absorbed sunlight and higher temperature – which melts more ice: a **positive feedback**.

</details>

## Ideas for teaching

- Model critique: which processes are missing, and why is the model still useful?
- Compare the Mauna Loa CO₂ record with global temperature.
- Evaluate measures that keep $\varepsilon$ from rising.
