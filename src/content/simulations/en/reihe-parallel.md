---
description: "Interactive series and parallel circuits – bulbs or resistors in series, in parallel or mixed, ammeters and voltmeters at selectable positions, unscrewing bulbs, equivalent resistance and the junction rule."
---

## What is it about?

**Series circuit:** the components lie one after another; there is only one path for the current.

- The current is the same everywhere: $I = I_1 = I_2$
- The source voltage is shared: $U = U_1 + U_2$
- The resistances add up to the **equivalent resistance**: $R = R_1 + R_2$

If one component fails, the whole circuit is broken. Two identical $6$ V bulbs in series at $6\,\text{V}$ get only $3\,\text{V}$ each and glow dimly; at $12\,\text{V}$ they light normally.

**Parallel circuit:** each component lies in its own **branch** between two **junctions** (nodes).

- All branches have the same voltage: $U = U_1 = U_2$
- The branch currents add up in the main wire (**junction rule**): $I = I_1 + I_2$
- For the equivalent resistance:

$$
\frac{1}{R} = \frac{1}{R_1} + \frac{1}{R_2}
$$

$R$ is smaller than each single resistance. If one branch fails, the others keep working – this is how appliances are connected at home.

**Mixed circuit:** bulb 1 is in series with bulbs 2 and 3 in parallel:

$$
R = R_1 + \frac{R_2 \cdot R_3}{R_2 + R_3}
$$

**Measuring:** the ammeter is connected **in series** into the wire, the voltmeter **in parallel** across the component.

## Try it

1. Place the ammeter at different positions in the series circuit (tap the numbered circles). Where is the current largest? [Series circuit](?a1=1&a2=2)
2. Measure the voltages across both bulbs and then across the source. [Measure voltages](?v1=1&v2=2)
3. Unscrew a bulb (tap it) – first in the series, then in the parallel circuit. [Three in series](?n=3) · [Three in parallel](?circ=parallel&n=3)
4. In the parallel circuit, compare the main wire with the branches. [Junction rule](?circ=parallel&n=3&a1=1&a2=2)
5. Which bulb is brightest in the mixed circuit? Then unscrew bulb 3. [Mixed circuit](?circ=mixed)
6. Connect two $6$ V bulbs to $12\,\text{V}$ – in series and in parallel. [12 V in series](?U=12) · [12 V in parallel](?U=12&circ=parallel)
7. Replace the bulbs with resistors and compare the voltages. [Resistors in series](?kind=res&n=3&v1=1&v2=3)

## Tasks

### Task 1: Two bulbs in series

Two identical bulbs ($R = 12\,\Omega$) are in series at $6\,\text{V}$. Calculate the equivalent resistance, the current and the voltage across each bulb. [Load task](?a1=0&v1=0&_hide=1)

<details>
<summary>Show solution</summary>

$R = 12\,\Omega + 12\,\Omega = 24\,\Omega$, $I = \frac{6\,\text{V}}{24\,\Omega} = 0.25\,\text{A}$, $U_1 = U_2 = 12\,\Omega \cdot 0.25\,\text{A} = 3\,\text{V}$. [Check by measuring](?a1=1&v1=1&v2=2)

</details>

### Task 2: Three bulbs in parallel

Three such bulbs are in parallel at $6\,\text{V}$. What is the current in each branch and in the main wire? What is the equivalent resistance? [Load task](?circ=parallel&n=3&a1=0&v1=0&_hide=1)

<details>
<summary>Show solution</summary>

Each bulb gets $6\,\text{V}$: $I_1 = I_2 = I_3 = 0.5\,\text{A}$. In the main wire $I = 1.5\,\text{A}$, so $R = \frac{6\,\text{V}}{1.5\,\text{A}} = 4\,\Omega$ – a third of $12\,\Omega$. [Check by measuring](?circ=parallel&n=3&a1=1&a2=2)

</details>

### Task 3: Two resistors in parallel

$R_1 = 20\,\Omega$ and $R_2 = 30\,\Omega$ are in parallel at $6\,\text{V}$. Calculate $I_1$, $I_2$, $I$ and $R$. [Load task](?circ=parallel&kind=res&a1=0&v1=0&_hide=1)

<details>
<summary>Show solution</summary>

$I_1 = \frac{6\,\text{V}}{20\,\Omega} = 0.3\,\text{A}$, $I_2 = \frac{6\,\text{V}}{30\,\Omega} = 0.2\,\text{A}$, $I = 0.5\,\text{A}$ and $R = \frac{6\,\text{V}}{0.5\,\text{A}} = 12\,\Omega$. Check: $\frac{1}{20} + \frac{1}{30} = \frac{1}{12}$. [Check by measuring](?circ=parallel&kind=res&a1=1&a2=2)

</details>

### Task 4: Mixed circuit

Why is bulb 1 brighter than bulbs 2 and 3? What happens if you unscrew bulb 3? [Load task](?circ=mixed&_hide=1)

<details>
<summary>Show solution</summary>

The whole current flows through bulb 1; after that it divides between bulbs 2 and 3. Bulbs 2 and 3 in parallel have only $6\,\Omega$, so bulb 1 gets $4\,\text{V}$ and bulbs 2 and 3 get $2\,\text{V}$ each. Without bulb 3, bulbs 1 and 2 are simply in series and get $3\,\text{V}$ each: bulb 1 gets dimmer, bulb 2 brighter. [Show](?circ=mixed&x3=1&v1=1&v2=2)

</details>

### Task 5: Bulbs at 12 V

Two $6$ V bulbs are to light normally at a $12$ V source. How do you connect them? What happens with the other circuit?

<details>
<summary>Show solution</summary>

In series: each bulb gets $6\,\text{V}$ and lights normally. [Series](?U=12) In parallel each bulb gets $12\,\text{V}$ – twice its rated voltage. The filaments overheat and blow. [Parallel](?U=12&circ=parallel)

</details>

### Task 6: Circuits at home

Why are the appliances at home connected in parallel and not in series?

<details>
<summary>Show solution</summary>

That way each appliance gets the full mains voltage, can be switched on and off on its own and keeps working when another one fails. In series the appliances would have to share the voltage, and switching one off would switch off all the others.

</details>

## Ideas for the classroom

- **Use:** rules of series and parallel circuits, equivalent resistance and the junction rule (grades 8/9). Two ammeters and two voltmeters can be placed at the numbered positions or across components and the source – like in a student experiment. With `a1=0&v1=0` and `_hide=1` a set-up becomes a calculation task; with `sym=1` the bulbs appear as circuit symbols.
- **Model:** ideal voltage source, ideal meters, wires without resistance. As usual in class, the bulbs are treated as fixed $12\,\Omega$ resistors ($6\,\text{V}$, $0.5\,\text{A}$). Real bulbs have a smaller resistance when cold (see the Ohm's law simulation); the differences in brightness would really be somewhat smaller. The brightness follows from the power via the filament temperature; above $9\,\text{V}$ across a bulb it blows.
- **Current animation:** the dots have the same spacing everywhere (same electron density in the metal) and move at a speed proportional to the current. At the junctions you can see how the current divides and joins again.
- **Common stumbling blocks:**
  - "The current is used up from bulb to bulb – the first bulb in series is the brightest." – The current is the same everywhere; identical bulbs are equally bright.
  - "The battery always supplies the same current." – More current flows in the parallel circuit than in the series circuit.
  - "More bulbs always mean more resistance." – Only in series; in parallel the equivalent resistance falls.
  - "There is no voltage across an unscrewed bulb." – In a series circuit the full voltage appears across the gap.
