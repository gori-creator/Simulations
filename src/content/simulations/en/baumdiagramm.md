---
description: "Draw balls from an urn – with or without replacement. The tree grows with fractions on its branches, both variants can be compared side by side, the path rules play step by step, and in the simulation the relative frequency approaches the probability."
---

## What is it about?

In a **multi-stage random experiment** a simple experiment is carried out several times in a row – here: two balls are drawn from an urn with $3$ red and $2$ blue balls. A **tree diagram** shows every possible course: each stage is one draw, each branch is a possible result of that draw, and each **path** from left to right is one outcome of the whole experiment.

The probabilities are written on the branches. In the first draw they are $\frac35$ (red) and $\frac25$ (blue). In the second draw it depends:

- **With replacement:** the urn is as before, so the branches again carry $\frac35$ and $\frac25$.
- **Without replacement:** only $4$ balls are left. If red came first, red is now $\frac24$ and blue $\frac24$.

**1st path rule (product rule):** the probability of a path is the product of the probabilities along the path:

$$
\text{without replacement: } P(\text{red, red}) = \frac35 \cdot \frac24 = \frac{6}{20} = \frac{3}{10}, \qquad \text{with replacement: } P(\text{red, red}) = \frac35 \cdot \frac35 = \frac{9}{25}.
$$

**2nd path rule (sum rule):** the probability of an event is the sum of the probabilities of all paths that belong to it:

$$
P(\text{both the same colour}) = P(rr) + P(bb) = \frac{3}{10} + \frac{1}{10} = \frac25 \quad (\text{without replacement}).
$$

At every fork the branches add up to $1$, and all paths together also add up to $1$. This gives the route via the **complement**: if the complement has fewer paths, use $P(E) = 1 - P(\overline{E})$, e.g. $P(\text{at least one red}) = 1 - P(bb) = 1 - \frac{1}{10} = \frac{9}{10}$.

**Special cases without replacement:**

- If a colour is used up, its branch has probability $0$ – drawn in the tree as a dashed stub “0/…”.
- After as many draws as there are balls, the urn is **empty**; no further draws are possible.

**Simulation:** if the experiment is repeated many times, the relative frequencies are usually close to the probabilities (empirical law of large numbers). The light funnel shows the range in which the relative frequency lies after $N$ runs in about $95\,\%$ of cases.

## Try it

1. Draw **once**: the balls fly out of the urn and the path lights up in the tree. What changes in the urn for the second draw? [Draw](?mode=draw&rep=0)
2. Compare both trees side by side. Which fractions are the same, which are not? [With and without replacement](?mode=compare&ev=custom&sel=rr)
3. Play the calculation for “all the same colour”: first the products appear, then the sum. [Path rules](?mode=rules&ev=same)
4. For “at least one red” the complement has only one path – see what the calculation looks like then. [Complement](?mode=rules&ev=minR)
5. Start **Draw 1000 times** and watch the curve settle into the funnel. [Simulation](?mode=sim&ev=same)
6. Choose **tap your own** and tap paths. This way you can put together any event you like. [Choose your own](?ev=custom)
7. Set up a small urn with $2$ red balls and $1$ blue ball and draw three times. Where does a branch end with $0$? [Small urn](?r=2&b=1&n=3)

## Tasks

### Task 1: Path probabilities

The urn contains $3$ red and $2$ blue balls. Two balls are drawn without replacement. Work out the probabilities of all four paths and check that they add up to $1$. [Load task](?show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(rr) = \frac35 \cdot \frac24 = \frac{3}{10}$, $P(rb) = \frac35 \cdot \frac24 = \frac{3}{10}$, $P(br) = \frac25 \cdot \frac34 = \frac{3}{10}$, $P(bb) = \frac25 \cdot \frac14 = \frac{1}{10}$. Sum: $\frac{3 + 3 + 3 + 1}{10} = 1$ ✓. [Show in simulation](?show=1)

</details>

### Task 2: With and without replacement

What is the probability of drawing two balls of the same colour – with and without replacement? Explain the difference. [Load task](?mode=compare&ev=same&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Without replacement: $\frac{3}{10} + \frac{1}{10} = \frac25 = 40\,\%$. With replacement: $\frac{9}{25} + \frac{4}{25} = \frac{13}{25} = 52\,\%$. Without replacement one ball of the colour drawn first is missing in the second draw – so equal colours become less likely. [Show in simulation](?mode=compare&ev=same)

</details>

### Task 3: At least one red

Three balls are drawn with replacement. Work out $P(\text{at least one red ball})$ in a clever way. [Load task](?mode=rules&n=3&rep=1&ev=minR&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Via the complement “no red”: $1 - \left(\frac25\right)^3 = 1 - \frac{8}{125} = \frac{117}{125} = 93.6\,\%$. Directly you would have to add seven paths. [Show in simulation](?mode=rules&n=3&rep=1&ev=minR)

</details>

### Task 4: Certainly at least one red?

Now three draws **without** replacement. Explain why $P(\text{at least one red}) = 1$. [Load task](?mode=rules&n=3&ev=minR&show=0&_hide=1)

<details>
<summary>Show solution</summary>

There are only $2$ blue balls. After two blue ones, blue is used up (branch “0/3”), so the third draw is certainly red. The complement “no red” is impossible, so $P = 1 - 0 = 1$. [Show in simulation](?mode=rules&n=3&ev=minR)

</details>

### Task 5: Three colours

The urn contains $2$ red, $3$ blue and $1$ green ball. Two balls are drawn without replacement. What is the probability that the two balls have different colours? [Load task](?r=2&b=3&g=1&ev=diff&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Complement “same colour”: $\frac26 \cdot \frac15 + \frac36 \cdot \frac25 = \frac{2}{30} + \frac{6}{30} = \frac{8}{30} = \frac{4}{15}$ (two green balls are impossible). So $P = 1 - \frac{4}{15} = \frac{11}{15} \approx 73.3\,\%$. [Show in simulation](?mode=rules&r=2&b=3&g=1&ev=diff)

</details>

### Task 6: A small urn

An urn contains $2$ red balls and $1$ blue ball. All three are drawn one after the other. What is the probability that the blue ball comes last? [Load task](?r=2&b=1&n=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

The path $rrb$: $\frac23 \cdot \frac12 \cdot 1 = \frac13$. All three paths are equally likely – the blue ball is equally likely to end up in any position. [Show in simulation](?r=2&b=1&n=3)

</details>

## Ideas for the classroom

- **Use:** grade 8 (Laplace experiments, tree diagram) and grade 10, learning area “Multi-stage random experiments and stochastic simulations” (LehrplanPLUS Bavaria, Gymnasium).
- **A real urn alongside:** first draw a few times from a real urn, then compare with the “Simulation” view – it takes over the many repetitions.
- **Fractions:** the branches deliberately show unreduced fractions (e.g. $\frac24$) so that the contents of the urn stay visible; only the products are reduced.
- **Common stumbling blocks:**
  - Without replacement, the same probabilities as in the first draw are used in the second draw.
  - Probabilities along a path are added instead of multiplied.
  - Paths such as $rb$ and $br$ are counted as the same outcome and added only once.
  - For “at least once” not all matching paths are found; the complement is often easier.
