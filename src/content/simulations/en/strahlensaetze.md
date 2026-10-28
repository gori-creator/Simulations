## What is it about?

Two rays from a common starting point $Z$ are cut by two **parallel** lines: the first ray at $A$ and $A'$, the second at $B$ and $B'$. Then the **intercept theorems** hold.

**1st intercept theorem:** The segments on one ray are in the same ratio as the corresponding segments on the other ray:

$$
\frac{\overline{ZA'}}{\overline{ZA}} = \frac{\overline{ZB'}}{\overline{ZB}} \qquad \text{and likewise} \qquad \frac{\overline{ZA}}{\overline{AA'}} = \frac{\overline{ZB}}{\overline{BB'}}
$$

**2nd intercept theorem:** The segments on the parallels are in the same ratio as the corresponding segments on a ray, **measured from $Z$**:

$$
\frac{\overline{A'B'}}{\overline{AB}} = \frac{\overline{ZA'}}{\overline{ZA}}
$$

The “pieces” form ($\overline{ZA} : \overline{AA'}$) only works for the segments on the rays, **not** for the parallels.

The common value is the **scale factor** $k$. Triangle $ZA'B'$ is the image of $ZAB$ under an **enlargement** with centre $Z$: the two triangles are **similar** – same angles, every side times $k$. For $k > 1$ the figure is enlarged, for $0 < k < 1$ it is reduced, and for $k = 1$ the two parallels coincide.

If the parallels lie on different sides of $Z$, you get the **X shape**. The intercept theorems hold there in the same way; you always measure from $Z$. The simulation then shows a negative scale factor ($k < 0$: “other side of $Z$”); the ratios use lengths, i.e. $|k|$.

**Without parallels it does not work:** If $AB$ and $A'B'$ are not parallel, the ratios differ. Conversely, the **converse of the 1st theorem** holds: if $\overline{ZA'} : \overline{ZA} = \overline{ZB'} : \overline{ZB}$ (and $A'$ and $B'$ either both lie on the same side of $Z$ as $A$ and $B$, or both on the other side), then $AB \parallel A'B'$. The **converse of the 2nd theorem is false**: there can be a second point $B''$ with $\overline{A'B''} : \overline{AB} = k$ as well, although $A'B''$ is not parallel to $AB$.

**Working with an unknown:** Set up a proportion – best with the unknown $x$ in the numerator – and solve it by multiplying, e.g. $\frac{x}{\overline{ZB}} = \frac{\overline{ZA'}}{\overline{ZA}} \Rightarrow x = \frac{\overline{ZA'} \cdot \overline{ZB}}{\overline{ZA}}$.

## Try it

1. Press **“Slide the parallel”**: the parallel slides from $AB$ to $A'B'$. Watch the coloured scale bars on the right – all three ratios count up together. What do the tick marks in the thick bars mean?
2. Drag $A'$ and turn the first ray with the handle at its outer end. Try [$k = 0.5$](?k=0.5&a=6&b=7), [$k = 1$](?k=1), [a very acute angle](?th=10&k=3&a=8&b=8) and [an obtuse angle](?th=150&k=0.5&a=5&b=3). Do the ratios change?
3. [X shape](?mode=x&a=4&b=5&k=0.75): press “Slide the parallel” – the parallel passes through $Z$ to the other side.
4. Compare the two “pieces” bars in the card “1st intercept theorem”: when do the dividing lines lie exactly on top of each other? Read in the card “2nd intercept theorem” why you must not use $\overline{AA'}$ there.
5. [Not parallel](?par=0&kb=1.4): which bars no longer match? Press “Adjust B′ (converse)”. What happens to $A'B'$? What does the dashed circle around $A'$ with the point $B''$ show?
6. [Unknown length x](?mode=calc&ask=bb2&a=2.5&b=3&c=2&k=2.4): choose different unknown lengths and let “Solve step by step” show you the working.
7. [Tree height](?mode=baum&ht=12&st=1.5&el=36.87): play the measurement and then drag the sun. What happens at a [sun elevation of 45°](?mode=baum&el=45)?
8. [Pond width](?mode=teich&w=24&kt=4): drag $A'$ closer to $Z$. Why does $\overline{A'B'}$ get shorter, but the calculated width does not?

## Tasks

### Task 1: Missing length (1st theorem)

In a V shape with $AB \parallel A'B'$, $\overline{ZA} = 3\,\text{cm}$, $\overline{ZA'} = 6\,\text{cm}$ and $\overline{ZB} = 4\,\text{cm}$. Calculate $\overline{ZB'}$. [Load task](?mode=calc&ask=zb2&a=3&b=4&c=2.6&k=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{x}{4\,\text{cm}} = \frac{6\,\text{cm}}{3\,\text{cm}} = 2$, so $x = \overline{ZB'} = 8\,\text{cm}$. [Show solution](?mode=calc&ask=zb2&a=3&b=4&c=2.6&k=2)

</details>

### Task 2: Working with pieces

You know $\overline{ZA} = 2.5\,\text{cm}$, $\overline{AA'} = 3.5\,\text{cm}$ and $\overline{ZB} = 3\,\text{cm}$ ($AB \parallel A'B'$, V shape). How long is $\overline{BB'}$? [Load task](?mode=calc&ask=bb2&a=2.5&b=3&c=2&k=2.4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{x}{3\,\text{cm}} = \frac{3.5\,\text{cm}}{2.5\,\text{cm}} = 1.4$, so $x = \frac{3.5 \cdot 3}{2.5}\,\text{cm} = 4.2\,\text{cm}$. Check: $2.5 : 3.5 = 3 : 4.2$ (both $\approx 0.714$). [Show solution](?mode=calc&ask=bb2&a=2.5&b=3&c=2&k=2.4)

</details>

### Task 3: The 2nd theorem

$\overline{ZA} = 4\,\text{cm}$, $\overline{ZA'} = 10\,\text{cm}$ and $\overline{AB} = 3\,\text{cm}$. Calculate $\overline{A'B'}$. Why would $\frac{\overline{A'B'}}{\overline{AB}} = \frac{\overline{AA'}}{\overline{ZA}}$ be wrong? [Load task](?mode=calc&ask=a2b2&a=4&b=5&c=3&k=2.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{x}{3\,\text{cm}} = \frac{10\,\text{cm}}{4\,\text{cm}} = 2.5$, so $\overline{A'B'} = 7.5\,\text{cm}$. With $\frac{\overline{AA'}}{\overline{ZA}} = \frac{6}{4} = 1.5$ you would get $4.5\,\text{cm}$ – in the 2nd theorem you have to measure from $Z$. [Show solution](?mode=calc&ask=a2b2&a=4&b=5&c=3&k=2.5)

</details>

### Task 4: Unknown in the denominator

In the same figure, $\overline{ZB} = 5\,\text{cm}$, $\overline{ZB'} = 12.5\,\text{cm}$ and $\overline{A'B'} = 7.5\,\text{cm}$. Find $\overline{AB}$. [Load task](?mode=calc&ask=ab&a=4&b=5&c=3&k=2.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Put the unknown in the numerator: $\frac{x}{7.5\,\text{cm}} = \frac{5\,\text{cm}}{12.5\,\text{cm}} = 0.4$, so $\overline{AB} = 3\,\text{cm}$. [Show](?mode=calc&ask=ab&a=4&b=5&c=3&k=2.5)

</details>

### Task 5: How tall is the tree?

A stick is $1.5\,\text{m}$ long. It is placed so that the tip of its shadow and the tip of the tree’s shadow meet. The stick stands $2\,\text{m}$ and the tree $16\,\text{m}$ from the shadow tip. Calculate the height of the tree. [Load task](?mode=baum&ht=12&st=1.5&el=36.87&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{h}{1.5\,\text{m}} = \frac{16\,\text{m}}{2\,\text{m}} = 8$, so $h = 12\,\text{m}$. Sunlight is (almost) parallel; stick and tree stand vertically and are therefore parallel to each other. [Show solution](?mode=baum&ht=12&st=1.5&el=36.87)

</details>

### Task 6: Across the pond

To find the width $\overline{AB}$ of a pond, an X shape is marked out with $\overline{ZA'} = \frac14\,\overline{ZA}$ and $\overline{ZB'} = \frac14\,\overline{ZB}$. The measured length is $\overline{A'B'} = 6\,\text{m}$. How wide is the pond, and why is $A'B'$ automatically parallel to $AB$? [Load task](?mode=teich&w=24&kt=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

The ratios on both lines are equal ($4 : 1$), so by the converse of the 1st theorem $A'B' \parallel AB$. Then $\overline{AB} = 4 \cdot 6\,\text{m} = 24\,\text{m}$. [Show solution](?mode=teich&w=24&kt=4)

</details>

### Task 7: Parallel or not? (puzzle)

$\overline{ZA} = 3\,\text{cm}$, $\overline{ZA'} = 6\,\text{cm}$, $\overline{ZB} = 4\,\text{cm}$ and $\overline{ZB'} = 5.6\,\text{cm}$. Are $AB$ and $A'B'$ parallel? Where would $B'$ have to be? And: is it enough to check by measuring that $\overline{A'B'} = 2 \cdot \overline{AB}$?

<details>
<summary>Show solution</summary>

No: $\frac63 = 2$, but $\frac{5.6}{4} = 1.4$. A parallel would need $\overline{ZB'} = 8\,\text{cm}$. Measuring $\overline{A'B'}$ is not enough, because the converse of the 2nd theorem is false: the circle around $A'$ with radius $2 \cdot \overline{AB}$ can meet the line $ZB$ twice – only one of the two points gives the parallel. [Show](?par=0&kb=1.4)

</details>

## Ideas for the classroom

- **Use:** About grade 9, similarity, enlargement and intercept theorems. The animation “Slide the parallel” can prompt a conjecture (“All ratios stay the same – but only if …”), and the cards then confirm it with numbers.
- **Negative scale factors:** Whether the X shape is described with $k < 0$ varies between classrooms – please check against the curriculum. That is why the slider works with the ratio of the lengths.
- **Measuring outside:** The tree and pond tasks can be recreated on the school grounds; “Play the measurement” shows the order of the steps. With “Show the result” switched off (`show=0`), the calculation mode and the applications become exercises.
- **Common stumbling blocks:**
  - In the 2nd theorem, $\overline{AA'}$ is used instead of $\overline{ZA'}$.
  - The theorems are applied without parallels.
  - In the X shape, lengths are added across $Z$.
  - Numerator and denominator are swapped between the two sides of the equation – the rule “unknown in the numerator, its partner below” helps here.
  - Parallelism is concluded from $\overline{A'B'} : \overline{AB} = k$ (the converse of the 2nd theorem is false).
