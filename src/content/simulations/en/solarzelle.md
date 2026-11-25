## What is it about?

A solar cell converts light directly into electrical energy. How much power it delivers depends on the light – but also on what is connected and on how several cells are wired together.

### The characteristic

The **I-V characteristic** shows which current flows at which voltage:

- With nothing connected (open circuit) the **open-circuit voltage** $U_0$ is present and no current flows.
- In a short circuit the **short-circuit current** $I_{sc}$ flows and the voltage is zero.
- In between, the current stays almost constant for a long time and drops steeply just before $U_0$.

The **short-circuit current** is proportional to the irradiance. The open-circuit voltage, in contrast, depends only slightly on the light.

### Operating point and maximum power

With a load (resistance $R$) the **operating point** is where the characteristic crosses the line $I = U/R$. The power is $P = U \cdot I$. It is largest at one particular resistance: the **maximum power point** (MPP). Inverters in photovoltaic systems keep searching for this point.

### Series and parallel

- **In series** the voltages add up and the current stays the same.
- **In parallel** the currents add up and the voltage stays the same.

**Shade** on just one module of a string is treacherous: the current is the same everywhere in the string, so the weakest module sets the current for all. A small shadow can thus strongly reduce the power of the whole string. Real modules therefore contain bypass diodes that bridge shaded parts; this simulation leaves them out.

### Tilt

If light falls at an angle, less of it hits the surface: the current falls roughly with the cosine of the angle of incidence. A module delivers the most energy when the light hits it perpendicularly.

## Try it

- [One module](?E=1000&w=0&ns=1&np=1&sch=0&R=4): Find the resistance with the greatest power.
- [Three in series](?E=1000&w=0&ns=3&np=1&sch=0&R=12): Compare open-circuit voltage and short-circuit current with one module.
- [Three in parallel](?E=1000&w=0&ns=1&np=3&sch=0&R=1.5): What changes now?
- [Shade](?E=1000&w=0&ns=3&np=1&sch=50&R=12): How much does the power drop?

## Exercises

**1. Half the light.** How do the short-circuit current and open-circuit voltage change if the irradiance drops from 1000 to 500 W/m²? [Load exercise](?E=500&w=0&ns=1&np=1&sch=0&R=4&_hide=1)

<details><summary>Show solution</summary>

The short-circuit current halves (0.5 A → 0.25 A). The open-circuit voltage drops only slightly.

</details>

**2. At an angle.** By what percentage does the short-circuit current fall at an angle of incidence of 60°? [Load exercise](?E=1000&w=60&ns=1&np=1&sch=0&R=4&_hide=1)

<details><summary>Show solution</summary>

$\cos 60° = 0.5$: it falls by 50 %.

</details>

**3. Shade.** Why does a string of three modules lose more than a third of its power when one of them is half shaded? [Load exercise](?E=1000&w=0&ns=3&np=1&sch=50&R=12&_hide=1)

<details><summary>Show solution</summary>

The same current flows through all modules in series. The shaded module only supplies half the current – so the current of the whole string drops to about half, even though two modules are fully lit.

</details>
