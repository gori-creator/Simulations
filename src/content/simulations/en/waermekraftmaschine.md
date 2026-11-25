## What is it about?

Car engines, power-plant turbines and heat pumps have one thing in common: a gas runs through a **cycle** again and again. It takes in heat, expands, pushes a piston – and finally returns to its initial state.

### Internal energy and the first law

The random motion of gas particles is the **internal energy** $U$. It changes when heat $Q$ is supplied or work $W$ is done on the gas: $\Delta U = Q + W$. Energy is never lost, only converted.

### The Carnot cycle

1. **Isothermal expansion** at $T_h$: the gas absorbs $Q_h$ from the hot reservoir.
2. **Adiabatic expansion**: no heat exchange, the gas cools to $T_c$.
3. **Isothermal compression** at $T_c$: the gas releases $Q_c$ to the cold reservoir.
4. **Adiabatic compression** back to the start.

In the **p-V diagram** the enclosed area is the work $W = Q_h - Q_c$.

### Efficiency and the second law

Not all heat can become work. Even the ideal engine only reaches the **Carnot efficiency**

$$
\eta = 1 - \frac{T_c}{T_h} \qquad (T \text{ in kelvin})
$$

### Entropy

For a **reversible** process $\frac{Q_h}{T_h} = \frac{Q_c}{T_c}$ – entropy stays the same. When heat flows **directly** from hot to cold, entropy increases: $\Delta S = \frac{Q}{T_c} - \frac{Q}{T_h} > 0$. The process is **irreversible**.

### Heat pump and fridge

Run **backwards**, the cycle uses work to pump heat from cold to warm. The ideal **coefficient of performance** is $\varepsilon = \frac{T_h}{T_h - T_c}$.

## Try it

- [Engine](?mode=motor&th=327&tc=27), [power plant](?mode=motor&th=550&tc=30)
- [Heat pump](?mode=pumpe&th=35&tc=5) and [in frost](?mode=pumpe&th=35&tc=-15)
- [Direct heat flow](?mode=direkt&th=227&tc=-23)

## Exercises

**1. Power plant.** Maximum efficiency between 550 °C and 30 °C? [Load exercise](?mode=motor&th=550&tc=30&_hide=1)

<details><summary>Show solution</summary>

$\eta = 1 - \frac{303}{823} \approx 63\,\%$; real plants reach about 40–45 %.

</details>

**2. Heat and work.** Between 327 °C and 27 °C the gas absorbs about 346 J per cycle. Work and waste heat? [Load exercise](?mode=motor&th=327&tc=27&_hide=1)

<details><summary>Show solution</summary>

$\eta = 0.5$, so $W \approx 173\,\text{J}$ and $Q_c \approx 173\,\text{J}$.

</details>

**3. Heat pump in winter.** Compare the ideal COP at 5 °C and −15 °C outside with 35 °C flow temperature. [Load exercise](?mode=pumpe&th=35&tc=5&_hide=1)

<details><summary>Show solution</summary>

About 10.3 and 6.2.

</details>

**4. Entropy.** 1000 J flow directly from 227 °C to −23 °C. Entropy change? [Load exercise](?mode=direkt&th=227&tc=-23&_hide=1)

<details><summary>Show solution</summary>

$\Delta S = 4 - 2 = 2\,\tfrac{\text{J}}{\text{K}}$ – entropy increases.

</details>

## Ideas for teaching

- Why is there a warm grille behind the fridge?
- Why is "electricity from heat" lossy while "heat from electricity" via a heat pump is very efficient?
