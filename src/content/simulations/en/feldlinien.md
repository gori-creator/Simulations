## What is it about?

An electric charge changes the space around it: every other charge there feels a force. This state is called an **electric field**. It is measured with a small positive **test charge** $q_0$: the **field strength** is the force per charge,

$$
\vec E = \frac{\vec F}{q_0}, \qquad [E] = 1\,\frac{\text{N}}{\text{C}} = 1\,\frac{\text{V}}{\text{m}} .
$$

For a **point charge** $Q$, Coulomb's law gives at distance $r$

$$
E = k \cdot \frac{|Q|}{r^2}, \qquad k = \frac{1}{4\pi\varepsilon_0} \approx 8.99 \cdot 10^9\,\frac{\text{N}\,\text{m}^2}{\text{C}^2} .
$$

So twice the distance means only a quarter of the field strength. For a positive charge the field points away from it, for a negative charge towards it. Right on the charge ($r = 0$) the field strength is not defined; if you put the test charge exactly on a charge, the simulation therefore shows no value.

**Force on a charge:** a charge $q$ in the field feels $F = q \cdot E$. If $q$ is positive, the force points along the field lines; if $q$ is negative (for example an electron), it points exactly the opposite way. The test charge in the simulation is always positive ($q_0 = +1\,\text{nC}$).

If **several charges** act, their fields add as **vectors** (superposition). The “vector addition” box shows this: the individual fields $\vec E_1, \vec E_2, \dots$ are joined end to end, and the orange arrow is the sum.

**Field lines** make the field visible:

- They start at positive and end at negative charges (or at infinity).
- At every point the field strength points along the field line.
- Where the lines are close together, the field is strong. Here the number of lines is proportional to the charge (8 lines per nC).
- Field lines never cross.

**Equipotential lines** (green, dashed) join points with the same potential $\varphi = \sum k \cdot Q_i / r_i$. They are everywhere perpendicular to the field lines. Moving a charge along an equipotential line requires no work.

In a **parallel-plate capacitor** the field between the plates is **uniform**: equally strong and pointing the same way everywhere, with

$$
E = \frac{U}{d} .
$$

The equipotential lines there are parallel to the plates and equally spaced.

**About the display:** the background colour shows the field strength on a logarithmic scale (10 to 100 000 N/C). The force arrow grows in proportion to $E$ and is cut off for very strong fields (sign ≫). For the capacitor, edge effects are neglected: there is no field outside.

## Try it

1. Drag the test charge around the dipole. Where is the field strongest? In which direction does it point on the perpendicular bisector between the two charges? [Dipole](?px=0&py=0)
2. A single charge: double the distance of the test charge from 10 cm to 20 cm. What happens to $E$? [Single charge](?n=1&x1=0&y1=0&px=10&py=0)
3. Two equal charges: find the point where the field is zero. [Two equal charges](?q2=1&eq=1&px=0&py=6)
4. Unequal charges: three times as many lines leave the large charge. Where do the others go? [+3 nC and −1 nC](?q1=3&q2=-1&px=0&py=8)
5. Switch on the equipotential lines. Check: are they perpendicular to the field lines everywhere? [With equipotential lines](?eq=1)
6. Parallel-plate capacitor: move the test charge between the plates. Does $E$ change? [Parallel-plate capacitor](?mode=plates&eq=1&py=3)

## Exercises

### Exercise 1: Field of a point charge

A charge $Q = 1.0\,\text{nC}$ sits at the origin. Calculate the field strength at a distance of $10\,\text{cm}$ and of $20\,\text{cm}$. [Load exercise](?n=1&x1=0&y1=0&px=10&py=0&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$E = 8.99 \cdot 10^9\,\frac{\text{N}\,\text{m}^2}{\text{C}^2} \cdot \frac{1.0 \cdot 10^{-9}\,\text{C}}{(0.10\,\text{m})^2} \approx 899\,\frac{\text{N}}{\text{C}}$.
At twice the distance a quarter of that: $E \approx 225\,\frac{\text{N}}{\text{C}}$. [Show in the simulation](?n=1&x1=0&y1=0&px=10&py=0)

</details>

### Exercise 2: Dipole

$Q_1 = +1\,\text{nC}$ at $x = -10\,\text{cm}$, $Q_2 = -1\,\text{nC}$ at $x = +10\,\text{cm}$. Find the size and direction of the field strength in the middle and the force on $q_0 = 1\,\text{nC}$. [Load exercise](?px=0&py=0&val=0&_hide=1)

<details>
<summary>Show solution</summary>

Each charge contributes $899\,\frac{\text{N}}{\text{C}}$. Both fields point to the right (away from $Q_1$, towards $Q_2$), so $E \approx 1798\,\frac{\text{N}}{\text{C}}$ towards the negative charge. Force: $F = q_0 \cdot E \approx 1.80\,\mu\text{N}$. [Show in the simulation](?px=0&py=0)

</details>

### Exercise 3: Parallel-plate capacitor

A capacitor with $d = 10\,\text{cm}$ has $U = 1000\,\text{V}$ across it. What are the field strength and the force on $q_0 = 1\,\text{nC}$? What potential does a point $5\,\text{cm}$ from the negative plate have? [Load exercise](?mode=plates&py=3&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$E = \frac{U}{d} = \frac{1000\,\text{V}}{0.10\,\text{m}} = 10\,000\,\frac{\text{V}}{\text{m}}$, $F = q_0 \cdot E = 10\,\mu\text{N}$. Potential: $\varphi = E \cdot s = 10\,000\,\frac{\text{V}}{\text{m}} \cdot 0.05\,\text{m} = 500\,\text{V}$. [Show in the simulation](?mode=plates&py=3&eq=1)

</details>

### Exercise 4: Two equal charges

Two charges of $+1\,\text{nC}$ sit at $x = -10\,\text{cm}$ and $x = +10\,\text{cm}$. Find the field strength at the point $(0 \mid 10\,\text{cm})$ above the middle. Where is the field zero? [Load exercise](?q2=1&px=0&py=10&val=0&_hide=1)

<details>
<summary>Show solution</summary>

Distance to each charge: $r = \sqrt{(0.10\,\text{m})^2 + (0.10\,\text{m})^2} \approx 0.141\,\text{m}$, so $E_1 = E_2 = 8.99 \cdot 10^9 \cdot \frac{10^{-9}}{0.02}\,\frac{\text{N}}{\text{C}} \approx 449\,\frac{\text{N}}{\text{C}}$. The horizontal components cancel, the vertical ones add: $E = 2 \cdot 449\,\frac{\text{N}}{\text{C}} \cdot \frac{10\,\text{cm}}{14.1\,\text{cm}} \approx 636\,\frac{\text{N}}{\text{C}}$, vertically upwards (90°). Exactly between the charges ($x = 0$, $y = 0$) the two fields cancel completely: the field is zero there (field-free point). [Show in the simulation](?q2=1&px=0&py=10)

</details>

### Exercise 5: Field-free point with unequal charges

$Q_1 = +1\,\text{nC}$ sits at $x = -10\,\text{cm}$, $Q_2 = +4\,\text{nC}$ at $x = +14\,\text{cm}$. Where between the charges is the field zero? [Load exercise](?q2=4&x2=14&px=0&py=0&val=0&_hide=1)

<details>
<summary>Show solution</summary>

The charges are $24\,\text{cm}$ apart. At a distance $a$ from $Q_1$: $\frac{k \cdot 1\,\text{nC}}{a^2} = \frac{k \cdot 4\,\text{nC}}{(24\,\text{cm} - a)^2}$, so $24\,\text{cm} - a = 2a$ and $a = 8\,\text{cm}$. The field-free point lies at $x = -2\,\text{cm}$, closer to the smaller charge. [Show in the simulation](?q2=4&x2=14&px=-2&py=0)

</details>

### Exercise 6: An electron in the capacitor

Instead of the test charge, an electron ($q = -1.6 \cdot 10^{-19}\,\text{C}$) is in the capacitor from Exercise 3. How large is the force, and in which direction does it point? [Load exercise](?mode=plates&py=3&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$F = |q| \cdot E = 1.6 \cdot 10^{-19}\,\text{C} \cdot 10\,000\,\frac{\text{N}}{\text{C}} = 1.6 \cdot 10^{-15}\,\text{N}$. Because the electron is negative, the force points against the field lines, i.e. towards the positive plate. The orange arrow of the positive test charge points exactly the opposite way. [Show in the simulation](?mode=plates&py=3)

</details>

## Ideas for the classroom

- Use semolina grains in oil or cotton fluff to show what field line patterns look like in an experiment, then compare here.
- Have students draw the vector addition by hand for two charges first, then check with the box.
- **Typical stumbling blocks:**
  - “Field lines are the paths on which charges move.” – They show the direction of the force; a charge with an initial velocity generally does not follow them.
  - “There is no field between two field lines.” – The field is everywhere; the lines are just a selection.
  - “In the capacitor the field is weaker in the middle.” – In an ideal capacitor it is the same everywhere.
