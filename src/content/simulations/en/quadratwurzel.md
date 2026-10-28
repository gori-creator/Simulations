## What is it about?

The **square root** $\sqrt{a}$ (for $a \geq 0$) is the non-negative number whose square is $a$: $\left(\sqrt{a}\right)^2 = a$ and $\sqrt{a} \geq 0$. The number $a$ under the root sign is called the **radicand**. Geometrically, $\sqrt{a}$ is the **side length of a square with area $a$**.

If you lay $a$ unit squares on squared paper as ever larger squares ($1 + 3 + 5 + \ldots$), all squares fit exactly only for **square numbers**: $\sqrt{49} = 7$, $\sqrt{144} = 12$. Otherwise some are left over, and $\sqrt{a}$ lies between two whole numbers:

$$
7^2 = 49 < 50 < 64 = 8^2 \quad\Rightarrow\quad 7 < \sqrt{50} < 8
$$

If the radicand contains a square factor, you can **partly take the root**: $\sqrt{50} = \sqrt{25 \cdot 2} = \sqrt{25} \cdot \sqrt{2} = 5\sqrt{2} \approx 7.071$.

**Heron’s method:** start with a rectangle of area $a$, that is with the sides $x_0$ and $\frac{a}{x_0}$. The new side is the **mean** of the two sides; the other side is again $a$ divided by the new side:

$$
x_{n+1} = \frac{x_n + \frac{a}{x_n}}{2}
$$

The area always stays $a$, and the rectangle gets more and more square. Why? Cut a strip of width $\frac{x - a/x}{2}$ off the rectangle and put it on the short side. This gives almost a square with side $x_{n+1}$ – only a small corner is missing. So from the first step on, $x_{n+1}$ is always slightly **above** $\sqrt{a}$ and $\frac{a}{x_{n+1}}$ slightly **below**. This is very fast: the number of correct digits roughly doubles. For $\sqrt{2}$ with $x_0 = 2$:

$$
x_1 = 1.5 \qquad x_2 = \tfrac{17}{12} \approx 1.416667 \qquad x_3 = \tfrac{577}{408} \approx 1.4142157 \qquad \sqrt{2} \approx 1.4142136
$$

**Nested intervals:** you trap $\sqrt{a}$ between numbers whose squares trap $a$, and check by **squaring**:

$$
1 < \sqrt{2} < 2, \qquad 1.4 < \sqrt{2} < 1.5 \;\;(1.96 < 2 < 2.25), \qquad 1.41 < \sqrt{2} < 1.42 \;\;(1.9881 < 2 < 2.0164)
$$

Each digit makes the interval ten times shorter.

**$\sqrt{2}$ is irrational:** the diagonal of the unit square has length $\sqrt{2}$, because the square on it is made of four half unit squares and has area $2$. This length is not a fraction. If $\sqrt{2} = \frac{p}{q}$ were fully reduced, then $p^2 = 2q^2$, so $p$ is even, $p = 2r$; then $4r^2 = 2q^2$, so $q^2 = 2r^2$ and $q$ is even too – a contradiction to the reduced fraction. That is why the decimal expansion of $\sqrt{2}$ never ends and never repeats. In the same way, $\sqrt{a}$ is irrational for every whole number $a$ that is not a square number.

## Try it

1. [49 unit squares](?mode=square&a=49): press “Lay the square”. How do the squares $1, 4, 9, \ldots$ grow? How many unit squares are added each time? Compare with [50 unit squares](?mode=square&a=50).
2. Drag the green corner of the square. For which values of $a$ does everything fit exactly?
3. [√2 with Heron](?a=2&x0=2): click “Next step” and watch the strip and the missing corner. The correct digits in the table are bold. How many are added per step?
4. [A long rectangle](?a=10&x0=10): start with $10 \times 1$. Drag the blue corner at step 0 and try other starting lengths. Does the start matter much?
5. [Nesting √2](?mode=nest&a=2): tap the subinterval that contains $\sqrt{2}$. What does the check show if you tap the wrong one? Why does the nesting stop at once for [√49](?mode=nest&a=49)?
6. [√2 is not a fraction](?mode=irr): go through the proof step by step and look at the near misses $\frac{p}{q}$.

## Tasks

### Task 1: Between two square numbers

Between which whole numbers does $\sqrt{50}$ lie? Simplify $\sqrt{50}$ by partly taking the root. [Load task](?mode=square&a=50&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$7^2 = 49 < 50 < 64 = 8^2$, so $7 < \sqrt{50} < 8$. Also $\sqrt{50} = \sqrt{25 \cdot 2} = 5\sqrt{2} \approx 5 \cdot 1.4142 \approx 7.071$. [Show in the simulation](?mode=square&a=50)

</details>

### Task 2: Heron by hand

Use Heron’s method to find two approximations of $\sqrt{10}$, starting at $x_0 = 3$. [Load task](?a=10&x0=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$x_1 = \frac{3 + \frac{10}{3}}{2} = \frac{19}{6} \approx 3.16667$ and $\frac{10}{x_1} = \frac{60}{19} \approx 3.15789$.

$x_2 = \frac{\frac{19}{6} + \frac{60}{19}}{2} = \frac{721}{228} \approx 3.162281$. For comparison: $\sqrt{10} \approx 3.162278$ – four decimal places are already correct. [Show in the simulation](?a=10&x0=3&n=2)

</details>

### Task 3: Finding intervals

Between which numbers with one and with two decimal places does $\sqrt{3}$ lie? Justify by squaring. [Load task](?mode=nest&a=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1.7^2 = 2.89 < 3 < 3.24 = 1.8^2$, so $1.7 < \sqrt{3} < 1.8$.

$1.73^2 = 2.9929 < 3 < 3.0276 = 1.74^2$, so $1.73 < \sqrt{3} < 1.74$. [Show in the simulation](?mode=nest&a=3&n=2)

</details>

### Task 4: Why is √a always in between?

Use the picture of the moved strip to explain: $x_{n+1}^2 = a + d^2$ with $d = \frac{x_n - a/x_n}{2}$. What follows for $x_{n+1}$ and $\frac{a}{x_{n+1}}$? [Watch the strip move](?a=2&x0=2)

<details>
<summary>Show solution</summary>

The almost-square with side $x_{n+1}$ consists of the whole rectangle (area $a$) and the missing corner (area $d^2$). So $x_{n+1}^2 = a + d^2 \geq a$, that is $x_{n+1} \geq \sqrt{a}$. Since $x_{n+1} \cdot \frac{a}{x_{n+1}} = a = \sqrt{a} \cdot \sqrt{a}$, it follows that $\frac{a}{x_{n+1}} \leq \sqrt{a}$: $\sqrt{a}$ always lies between the two sides.

</details>

### Task 5: How accurate is 577/408?

In Heron’s method for $\sqrt{2}$ (starting at $2$), $x_3 = \frac{577}{408}$. How many decimal places are correct? Work out $\left(\frac{577}{408}\right)^2$ as exactly as you can without a calculator. [Load task](?a=2&x0=2&n=3&show=0)

<details>
<summary>Show solution</summary>

$\frac{577}{408} = 1.4142156\ldots$ and $\sqrt{2} = 1.4142135\ldots$: five decimal places are correct. We have $577^2 = 332\,929$ and $2 \cdot 408^2 = 2 \cdot 166\,464 = 332\,928$. So $\left(\frac{577}{408}\right)^2 = 2 + \frac{1}{166\,464} \approx 2.000006$ – almost $2$, but not exactly. [Show](?a=2&x0=2&n=3)

</details>

### Task 6: No fraction hits exactly

Check without a calculator whether $\frac{17}{12}$ or $\frac{99}{70}$ can be equal to $\sqrt{2}$. [See the proof](?mode=irr)

<details>
<summary>Show solution</summary>

$17^2 = 289$, but $2 \cdot 12^2 = 288$; $99^2 = 9801$, but $2 \cdot 70^2 = 9800$. Both times they differ by exactly $1$ – very close, but never equal: by the proof, $p^2 = 2q^2$ is impossible. [Show all steps](?mode=irr&n=5)

</details>

## Ideas for the classroom

- **Use:** grade 9, topic “square roots” (definition of the root, approximation methods, irrational and real numbers, calculating with roots) – please check the exact assignment against your curriculum. The four views work well as an introduction (unit squares), main phase (Heron, intervals) and deeper look (proof).
- **Start without the formula:** the moved rectangle makes Heron’s method visible before the formula is written down. It may be worth letting the students suggest first how a rectangle could be made “more square”.
- **Race:** who gets six correct digits first – with Heron or with nested intervals?
- **For tasks:** with “Show values” off (`show=0`), $\sqrt{a}$ and the approximations appear as “?” in the picture.
- **Model:** bold digits in the table already agree with $\sqrt{a}$; the nested intervals are computed with whole numbers, so without rounding errors.
- **Common stumbling blocks:**
  - “$\sqrt{2} = 1.41$” – that is only an approximation; $1.41^2 = 1.9881$.
  - The bounds of an interval are guessed but not checked by squaring.
  - In Heron’s method the second side is averaged as well instead of being recomputed as $a : x$ – then the area is no longer right.
  - $\sqrt{a + b} = \sqrt{a} + \sqrt{b}$ – false (e.g. $\sqrt{9 + 16} = 5 \neq 7$); only for products does $\sqrt{a \cdot b} = \sqrt{a} \cdot \sqrt{b}$ hold.
  - Concluding “irrational” from “lots of digits look random” – only the proof shows that nothing repeats.
