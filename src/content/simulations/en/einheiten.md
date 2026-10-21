---
description: "Place quantities in the unit chart and watch the decimal point move as you convert – for length, mass, area, volume and time."
---

## What is it about?

A **quantity** has a **number** and a **unit**: in $3.5\,\text{km}$ the number is $3.5$ and the unit is km. Converting keeps the quantity the same; only number and unit change:

$$
3.5\,\text{km} = 3{,}500\,\text{m}
$$

The **conversion factor** between neighbouring units tells you how much the number changes:

| Quantity | Units | Conversion factor | Columns per unit |
| --- | --- | --- | --- |
| Length | km, m, dm, cm, mm | $10$ (between km and m: $1{,}000$) | 1 (km and m: 3) |
| Mass | t, kg, g, mg | $1{,}000$ | 3 |
| Area | km², ha, a, m², dm², cm², mm² | $100$ | 2 |
| Volume | m³, dm³, cm³, mm³ | $1{,}000$ | 3 |

Also $1\,\text{a} = 100\,\text{m}^2$ (a square with $10\,\text{m}$ sides), $1\,\text{ha} = 100\,\text{a} = 10{,}000\,\text{m}^2$, $1\,\text{dm}^3 = 1\,\text{l}$ and $1\,\text{cm}^3 = 1\,\text{ml}$.

**The unit chart:** each column is one place. The ones digit (O) of the number goes into the column of the unit, with the decimal point to its right. To convert, put the point to the right of the O column of the new unit:

- To a **smaller** unit the point moves **right** and the number gets bigger: $2.5\,\text{m} = 250\,\text{cm}$.
- To a **larger** unit the point moves **left** and the number gets smaller: $45\,\text{g} = 0.045\,\text{kg}$.
- Empty columns between the digits and the point are filled with **zeros** (pale in the simulation); unneeded zeros at the start or end are dropped.

Each column the point moves means “times $10$” or “divided by $10$”. Three columns to the right means times $1{,}000$.

**Time is different:** $1\,\text{d} = 24\,\text{h}$, $1\,\text{h} = 60\,\text{min}$ and $1\,\text{min} = 60\,\text{s}$. These are not powers of ten, so the unit chart does not help. You work step by step along a **conversion chain**: multiply to go to a smaller unit, divide to go to a larger one. Time spans are often written in **mixed units**: $135\,\text{min} = 2\,\text{h}\;15\,\text{min} = 2.25\,\text{h}$, because $135 \div 60 = 2$ remainder $15$.

## Try it

1. Look at the starting example: where do the cards of $3.5\,\text{km}$ lie, and why does $3{,}500\,\text{m}$ need two zeros? [Load example](?q=len&v=3.5&lf=km&lt=m)
2. Tap the heading of another unit in the chart, for example cm. How many places does the point move now? What do the small arcs above the units show?
3. Convert $250\,\text{cm}$ to metres. Which card is dropped? [250 cm](?q=len&v=250&lf=cm&lt=m)
4. Converting $45\,\text{g}$ to kilograms creates zeros in front of the digits. Why is there a $0$ before the point? [45 g](?q=mass&v=45&mf=g&mt=kg)
5. Compare area and volume: how many columns does each unit have, and why? Look at the grid square and the cube in the illustration. [Area](?q=area&v=3.5&af=m2&at=dm2) · [Volume](?q=vol&v=1&vf=dm3&vt=cm3)
6. Convert a time and watch the value move from station to station. [2 days in seconds](?q=time&v=2&tf=d&tt=s)
7. After converting, press **Way back ⇄**: do you get the starting value again?

## Tasks

### Task 1: Length

Convert $4.2\,\text{km}$ to m and $75\,\text{cm}$ to m. [Load task](?q=len&v=4.2&lf=km&lt=m&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$4.2\,\text{km} = 4{,}200\,\text{m}$ (point 3 places right, times $1{,}000$). $75\,\text{cm} = 0.75\,\text{m}$ (point 2 places left, divided by $100$). [Show in the simulation](?q=len&v=75&lf=cm&lt=m)

</details>

### Task 2: Mass

Convert $3.5\,\text{kg}$ to g, $250\,\text{g}$ to kg and $1.2\,\text{t}$ to kg. [Load task](?q=mass&v=250&mf=g&mt=kg&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$3.5\,\text{kg} = 3{,}500\,\text{g}$, $250\,\text{g} = 0.25\,\text{kg}$ (the final zero is dropped), $1.2\,\text{t} = 1{,}200\,\text{kg}$. For mass the conversion factor is always $1{,}000$. [Show in the simulation](?q=mass&v=250&mf=g&mt=kg)

</details>

### Task 3: Area

A classroom board has an area of $2.5\,\text{m}^2$. How many dm² is that? A farm has $4\,\text{ha}$ of meadow. How many m² is that? [Load task](?q=area&v=4&af=ha&at=m2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$2.5\,\text{m}^2 = 250\,\text{dm}^2$ (conversion factor $100$, point 2 places right). $4\,\text{ha} = 400\,\text{a} = 40{,}000\,\text{m}^2$ (point 4 places right). [Show in the simulation](?q=area&v=4&af=ha&at=m2)

</details>

### Task 4: Litres and millilitres

A bottle holds $1.5\,\text{l}$. How many ml is that? A glass holds $250\,\text{cm}^3$. How many litres is that? [Load task](?q=vol&v=250&vf=cm3&vt=l&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1.5\,\text{l} = 1{,}500\,\text{ml}$. $250\,\text{cm}^3 = 250\,\text{ml} = 0.25\,\text{dm}^3 = 0.25\,\text{l}$, because $1\,\text{l} = 1\,\text{dm}^3 = 1{,}000\,\text{cm}^3$. [Show in the simulation](?q=vol&v=250&vf=cm3&vt=l)

</details>

### Task 5: Time spans

A film lasts $150\,\text{min}$. Write the length in hours and minutes and as a decimal in hours. How many seconds are $3\,\text{h}$? [Load task](?q=time&v=150&tf=min&tt=h&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$150 \div 60 = 2$ remainder $30$, so $150\,\text{min} = 2\,\text{h}\;30\,\text{min} = 2.5\,\text{h}$. $3\,\text{h} = 3 \cdot 60\,\text{min} = 180\,\text{min} = 180 \cdot 60\,\text{s} = 10{,}800\,\text{s}$. [Show in the simulation](?q=time&v=3&tf=h&tt=s)

</details>

### Task 6: Find the mistake

Tim writes: $3.5\,\text{m}^2 = 35\,\text{dm}^2$. What did he do wrong? [Load task](?q=area&v=3.5&af=m2&at=dm2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Tim used the conversion factor $10$, as for length. For area it is $100$: $1\,\text{m}^2 = 10\,\text{dm} \cdot 10\,\text{dm} = 100\,\text{dm}^2$. The correct answer is $3.5\,\text{m}^2 = 350\,\text{dm}^2$ – in the chart every area unit has two columns. [Show in the simulation](?q=area&v=3.5&af=m2&at=dm2)

</details>

## Ideas for the classroom

- **Use:** Year 5, quantities and units (length, mass, time; area and volume units later, depending on the curriculum – please check your curriculum). On the projector the chart works well for predicting together: “Where does the point go?”
- **Practice:** With the switch “Show the result right away” turned off, or via **New task**, pupils first work it out themselves; “Convert” reveals the answer. **Way back ⇄** shows that converting back gives the starting value.
- **Illustration:** Link the ruler, grid square and cube to real objects (ruler, squared paper, litre jug, centimetre cubes).
- **Common stumbling blocks:**
  - Using $10$ instead of $100$ or $1{,}000$ for area and volume.
  - Moving only one place between km and m instead of three.
  - Forgetting the $0$ before the point when converting to a larger unit ($45\,\text{g} = .045\,\text{kg}$).
  - Reading times as decimals: $2.5\,\text{h}$ is not $2\,\text{h}\;50\,\text{min}$ but $2\,\text{h}\;30\,\text{min}$.
