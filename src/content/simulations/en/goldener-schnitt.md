## What is it about?

A segment is divided into two parts, a larger part $a$ and a smaller part $b$. In the **golden ratio**, the larger part relates to the smaller **exactly** as the whole segment relates to the larger part:

$$\frac{a}{b} = \frac{a+b}{a} = \varphi$$

### The golden number φ

If you set $b = 1$, the condition $\tfrac{a}{1} = \tfrac{a+1}{a}$ becomes the equation $a^2 = a + 1$, that is $a^2 - a - 1 = 0$. Its positive solution is

$$\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.618$$

This number has special properties: $\varphi^2 = \varphi + 1$ and $\tfrac{1}{\varphi} = \varphi - 1 \approx 0.618$. So in the golden ratio the division point lies at about $61.8\,\%$ of the segment.

### Construction with compass and ruler

1. Draw the segment $\overline{AB}$.
2. Draw the perpendicular at $B$ and mark $\overline{BC} = \tfrac12\,\overline{AB}$ on it.
3. Join $A$ and $C$.
4. The circle about $C$ with radius $\overline{CB}$ cuts $\overline{AC}$ at $D$.
5. The circle about $A$ with radius $\overline{AD}$ cuts $\overline{AB}$ at $T$.

Then $T$ divides $\overline{AB}$ in the golden ratio. Pythagoras' theorem confirms it: for $\overline{AB} = 1$ we have $\overline{AC} = \tfrac{\sqrt5}{2}$, so $\overline{AT} = \overline{AD} = \tfrac{\sqrt5 - 1}{2} = \tfrac{1}{\varphi}$.

### Golden rectangle and spiral

A rectangle with sides in the ratio $\varphi : 1$ is called a **golden rectangle**. If you cut a square off it, another golden rectangle is left, just smaller. This goes on for ever. Joining quarter circles in the squares gives a spiral that resembles the spiral of a snail shell.

### Fibonacci numbers

The sequence $1, 1, 2, 3, 5, 8, 13, 21, \dots$ is formed by adding the two previous numbers each time. The ratios of consecutive numbers approach $\varphi$: $\tfrac{8}{5} = 1.6$, $\tfrac{13}{8} = 1.625$, $\tfrac{21}{13} \approx 1.615$, …

### Where it appears

In a regular pentagon and in a pentagram, the diagonal and the side are in the golden ratio. In art and architecture the golden ratio is often felt to be especially harmonious. Many examples attributed to it only match it roughly, though, so it is worth measuring for yourself.

## Try it

- [Golden section](?mode=teilung&t=0.618): Move the division point. Where do the two curves cross?
- [Construction](?mode=konstruktion&step=1): Go through the five steps one at a time.
- [Golden spiral](?mode=rechteck&depth=8&spiral=1): How does the rectangle change with each square that is cut off?
- [Fibonacci ratios](?mode=fibonacci&n=12): From which n on do the first three decimal places match φ?

## Exercises

**1. Working out a length.** A segment of $20\,\text{cm}$ is to be divided in the golden ratio. How long is the larger part? [Load exercise](?mode=teilung&t=0.618&_hide=1)

<details><summary>Show solution</summary>

$a = \tfrac{20}{\varphi} \approx 12.36\,\text{cm}$, and the smaller part is $b \approx 7.64\,\text{cm}$.

</details>

**2. Equation.** Show that $\varphi = \tfrac{1+\sqrt5}{2}$ satisfies the equation $x^2 = x + 1$.

<details><summary>Show solution</summary>

$\varphi^2 = \tfrac{1 + 2\sqrt5 + 5}{4} = \tfrac{6 + 2\sqrt5}{4} = \tfrac{3 + \sqrt5}{2}$. Also $\varphi + 1 = \tfrac{1 + \sqrt5}{2} + \tfrac22 = \tfrac{3 + \sqrt5}{2}$. The two results are the same.

</details>

**3. Fibonacci.** Work out the next three Fibonacci numbers after $21$ and the ratio of the last two. [Load exercise](?mode=fibonacci&n=11&_hide=1)

<details><summary>Show solution</summary>

$34, 55, 89$ and $\tfrac{89}{55} \approx 1.6182$.

</details>

**4. Measuring.** Measure two lengths in a picture, a building or a face and work out their ratio. How close do you get to $1.618$?

<details><summary>Show solution</summary>

There is no single answer here. The values often lie between $1.5$ and $1.7$, and they vary noticeably depending on exactly where you measure.

</details>
