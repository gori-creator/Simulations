---
description: "Interactive series and parallel circuits – bulbs or resistors in series, in parallel or mixed, ammeters and voltmeters at selectable positions, unscrewing bulbs, equivalent resistance and the junction rule."
---

## What is it about?

**Series circuit:** the components lie one after another; there is only one path. The current is the same everywhere ($I = I_1 = I_2$), the voltages add up ($U = U_1 + U_2$) and so do the resistances ($R = R_1 + R_2$). If one component fails, the whole circuit is broken.

**Parallel circuit:** each component has its own branch. Every branch has the full voltage ($U = U_1 = U_2$), the branch currents add up in the main wire ($I = I_1 + I_2$) and

$$
\frac{1}{R} = \frac{1}{R_1} + \frac{1}{R_2}
$$

so $R$ is smaller than each single resistance. Ammeters are connected in series, voltmeters in parallel.

## Try it

1. Move the ammeter around the series circuit (tap the numbered circles). [Series](?a1=1&a2=2)
2. Unscrew a bulb in a series and in a parallel circuit. [Series](?n=3) · [Parallel](?circ=parallel&n=3)
3. Compare the main wire and the branches. [Junction rule](?circ=parallel&n=3&a1=1&a2=2)
4. Connect two 6 V bulbs to 12 V, in series and in parallel. [Series](?U=12) · [Parallel](?U=12&circ=parallel)

## Tasks

### Task 1: Two bulbs in series

Two bulbs ($12\,\Omega$ each) are in series at $6\,\text{V}$. Find $R$, $I$ and the voltage across each bulb. [Load task](?a1=0&v1=0&_hide=1)

<details>
<summary>Show solution</summary>

$R = 24\,\Omega$, $I = 0.25\,\text{A}$, $U_1 = U_2 = 3\,\text{V}$.

</details>

### Task 2: Two resistors in parallel

$R_1 = 20\,\Omega$ and $R_2 = 30\,\Omega$ are in parallel at $6\,\text{V}$. Find $I_1$, $I_2$, $I$ and $R$. [Load task](?circ=parallel&kind=res&a1=0&v1=0&_hide=1)

<details>
<summary>Show solution</summary>

$I_1 = 0.3\,\text{A}$, $I_2 = 0.2\,\text{A}$, $I = 0.5\,\text{A}$, $R = 12\,\Omega$.

</details>

## Notes for teachers

- Two ammeters and two voltmeters can be placed like in a student experiment; `a1=0&v1=0` with `_hide=1` turns a set-up into a calculation task.
- Model: ideal source and meters; bulbs as fixed $12\,\Omega$ resistors ($6\,\text{V}$, $0.5\,\text{A}$), brightness from the power via the filament temperature; a bulb blows above $9\,\text{V}$. The dots have the same spacing everywhere and move at a speed proportional to the current.
- **Misconceptions:** current is used up from bulb to bulb; the battery always supplies the same current; more bulbs always mean more resistance.
