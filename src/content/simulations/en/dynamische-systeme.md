## What is it about?

A **dynamical system** describes how a state changes over time, with each new state following from the previous one. Even very simple rules can produce astonishing behaviour: regular oscillations, apparent randomness, or shapes that repeat within themselves again and again.

### Predator and prey

Hares ($x$) multiply and foxes ($y$) eat hares. The **Lotka-Volterra model** describes this with two rates of change:

$$x' = a\,x - b\,x\,y, \qquad y' = d\,x\,y - c\,y$$

- Without foxes, the hares grow exponentially (rate $a$).
- Without hares, the foxes die out (rate $c$).
- Encounters ($x \cdot y$) reduce the hares and increase the foxes.

The result is **out-of-phase oscillations**: first there are many hares, then many foxes, then few hares, then few foxes, and so on. In the **phase diagram** (hares to the right, foxes upwards) this becomes a closed orbit around the **equilibrium** $\big(\tfrac{c}{d} \mid \tfrac{a}{b}\big)$. If you start exactly there, everything stays constant.

### The logistic map and the Feigenbaum diagram

A population (as a share $x$ between 0 and 1) grows by the factor $r$ but is held back by limited food:

$$x_{n+1} = r \cdot x_n \cdot (1 - x_n)$$

Depending on $r$ it behaves very differently:

| $r$ | Behaviour |
| --- | --- |
| up to 1 | the population dies out |
| 1 to 3 | it approaches a fixed value $1 - \tfrac1r$ |
| 3 to about 3.45 | it alternates between 2 values |
| up to about 3.54 | it cycles through 4 values, then 8, 16, … |
| from about 3.57 | **chaos**: no pattern, and extreme sensitivity to the starting value |

The **Feigenbaum diagram** plots, for each $r$, the values the sequence takes in the long run. You can see the **period doublings** and the transition to chaos, but also windows of order in the middle of it, such as period 3 at $r \approx 3.83$.

### Fractals

A **fractal** arises when you apply a rule again and again to ever smaller parts. Every detail then looks like the whole (**self-similarity**).

- **Koch snowflake:** Each segment is divided into thirds, and a spike goes over the middle third. At each level the perimeter becomes $\tfrac43$ times as long, so it grows without bound. The area, on the other hand, approaches $1.6$ times the starting triangle.
- **Sierpinski triangle:** The middle sub-triangle is removed from every triangle. The area shrinks to $\tfrac34$ at each level and tends to $0$, yet infinitely many points remain.

The **fractal dimension** $D = \tfrac{\log(\text{number of parts})}{\log(\text{scale factor})}$ lies between the familiar dimensions. For the Sierpinski triangle it is $\tfrac{\log 3}{\log 2} \approx 1.585$, for the Koch curve $\tfrac{\log 4}{\log 3} \approx 1.262$.

## Try it

- [Hares and foxes](?mode=raeuber&x0=30&y0=5&a=1&c=1.5&u=0.3): Move the point in time. When are there the most foxes?
- [Start at equilibrium](?mode=raeuber&x0=20&y0=10&a=1&c=1.5&u=0.5): What happens if you move just slightly away from it?
- [Period 2](?mode=logistisch&r=3.2&xs=0.2): Increase r in small steps up to 3.6.
- [Chaos at r = 3.9](?mode=logistisch&r=3.9&xs=0.2): Change the starting value by just 0.01. How differently do the sequences run?
- [Koch snowflake](?mode=fraktal&f=koch&n=4): By what factor does the perimeter grow from level to level?

## Exercises

**1. Equilibrium.** Find the equilibrium point for $a = 1$, $b = 0.1$, $c = 1.5$ and $d = 0.075$. [Load exercise](?mode=raeuber&x0=20&y0=10&a=1&c=1.5&_hide=1)

<details><summary>Show solution</summary>

Both rates of change must be $0$: $x = \tfrac{c}{d} = 20$ and $y = \tfrac{a}{b} = 10$.

</details>

**2. Fixed value.** What value does the logistic sequence tend to for $r = 2.5$? [Load exercise](?mode=logistisch&r=2.5&xs=0.2&_hide=1)

<details><summary>Show solution</summary>

A fixed value satisfies $x = r\,x\,(1 - x)$, so $x = 1 - \tfrac1r = 0.6$.

</details>

**3. Perimeter of the snowflake.** The starting triangle has perimeter 3. What is the perimeter after 5 levels? [Load exercise](?mode=fraktal&f=koch&n=5&_hide=1)

<details><summary>Show solution</summary>

$3 \cdot \big(\tfrac43\big)^5 \approx 12.64$.

</details>

**4. Sierpinski.** How many triangles are there after 6 levels, and what share of the area is left?

<details><summary>Show solution</summary>

$3^6 = 729$ triangles and $\big(\tfrac34\big)^6 \approx 0.178$, so about 18 % of the area.

</details>
