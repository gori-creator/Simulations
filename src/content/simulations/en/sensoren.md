## What is it about?

A thermostat switches the heating off when it is warm enough. A street lamp switches on when it gets dark. This needs **sensors**: components that convert a quantity such as temperature or brightness into an electrical quantity.

### Resistors that change

- A **thermistor** (NTC) conducts better when warm: its resistance falls as the temperature rises. At 25 °C the sensor in the simulation has 10 kΩ, at 60 °C only about 2.5 kΩ.
- A **photoresistor** (LDR) conducts better in light: in the dark it has a few hundred kilo-ohms, in sunlight only a few hundred ohms.

### The voltage divider

You cannot “see” a resistance directly. So the sensor is connected in series with a **fixed resistor** to a voltage (here 5 V). The voltage is shared in the ratio of the resistances:

$$U_\text{out} = U \cdot \frac{R_\text{fixed}}{R_\text{sensor} + R_\text{fixed}}$$

If the sensor resistance gets smaller, the fixed resistor gets a larger share of the voltage. In this way temperature or light becomes a **voltage** that can be measured or processed further – for example by a microcontroller.

### Switching with a threshold

A **comparator** checks whether the voltage is above or below a **switching threshold**:

- Temperature switch: if the voltage rises above the threshold (it is warm), the fan runs.
- Twilight switch: if the voltage falls below the threshold (it is dark), the lamp switches on.

The fixed resistor and the threshold decide **at which temperature or brightness** the switch acts.

## Try it

- [Thermistor, cold](?sensor=ntc&T=10&Rf=10&Us=3): Raise the temperature. When does the fan start?
- [Thermistor, 50 °C](?sensor=ntc&T=50&Rf=10&Us=3): Change the threshold so that the fan only starts at 60 °C.
- [Daylight](?sensor=ldr&lg=3&Rf=10&Us=2.5): Make it darker. When does the lamp switch on?

## Exercises

**1. Half and half.** At what temperature is exactly half the voltage, 2.5 V, across the 10 kΩ fixed resistor? [Load exercise](?sensor=ntc&T=10&Rf=10&Us=2.5&_hide=1)

<details><summary>Show solution</summary>

When sensor and fixed resistor are equal: at 25 °C (10 kΩ).

</details>

**2. Calculating the voltage.** At 60 °C the thermistor has about 2.5 kΩ. Calculate the voltage across the 10 kΩ fixed resistor. [Load exercise](?sensor=ntc&T=60&Rf=10&Us=3&_hide=1)

<details><summary>Show solution</summary>

$U = 5\,\text{V} \cdot \dfrac{10}{2.5 + 10} = 4\,\text{V}$.

</details>

**3. Switching on earlier.** The street lamp should switch on while there is still a bit more light. Do you need to raise or lower the threshold? [Load exercise](?sensor=ldr&lg=1.5&Rf=10&Us=2.5)

<details><summary>Show solution</summary>

Raise it: with more light the voltage is higher. If the threshold is higher, the voltage drops below it while there is still more light.

</details>
