---
description: "Draw balls from an urn – with or without replacement. The tree grows with fractions on its branches, both variants can be compared side by side, the path rules play step by step, and in the simulation the relative frequency approaches the probability."
---

## What is it about?

A **multi-stage experiment** repeats a simple one, e.g. drawing twice from an urn with $3$ red and $2$ blue balls. The **tree diagram** shows every possible course; each **path** is one outcome.

The branches carry probabilities. **With replacement** they stay the same; **without replacement** the urn shrinks (after red: $\frac24$ red, $\frac24$ blue).

- **1st path rule (product):** without replacement $P(rr) = \frac35 \cdot \frac24 = \frac{3}{10}$, with replacement $\frac35 \cdot \frac35 = \frac{9}{25}$.
- **2nd path rule (sum):** $P(\text{same colour}) = \frac{3}{10} + \frac{1}{10} = \frac25$ (without replacement).
- **Complement:** $P(\text{at least one red}) = 1 - P(bb) = \frac{9}{10}$.
- **Special cases without replacement:** a used-up colour gets a branch with probability $0$ (dashed), and the urn runs empty.

In the simulation the relative frequency approaches the probability; the funnel shows the $95\,\%$ range.

## Try it

1. Draw once and watch the path light up. [Draw](?mode=draw&rep=0)
2. Compare both trees side by side. [Comparison](?mode=compare&ev=custom&sel=rr)
3. Play the calculation for “same colour”. [Path rules](?mode=rules&ev=same)
4. Draw 1000 times. [Simulation](?mode=sim&ev=same)

## Tasks

### Task 1: Path probabilities

$3$ red, $2$ blue, two draws without replacement: compute all four path probabilities. [Load task](?show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(rr) = P(rb) = P(br) = \frac{3}{10}$, $P(bb) = \frac{1}{10}$; together $1$. [Show in simulation](?show=1)

</details>

### Task 2: At least one red

Three draws with replacement: find $P(\text{at least one red})$. [Load task](?mode=rules&n=3&rep=1&ev=minR&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 - \left(\frac25\right)^3 = \frac{117}{125} = 93.6\,\%$. [Show in simulation](?mode=rules&n=3&rep=1&ev=minR)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Drawing a few times from a real urn first and then letting the simulation do the many repetitions can work well.
- **Common stumbling blocks:** keeping the same probabilities without replacement; adding along a path instead of multiplying; treating $rb$ and $br$ as one outcome.
