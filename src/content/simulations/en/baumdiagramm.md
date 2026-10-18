---
description: "Draw balls from an urn – with or without replacement. The tree diagram grows with fractions on its branches, paths and events light up (1st and 2nd path rule), and drawing a hundred times brings the frequencies close to the probabilities."
---

## What is it about?

A **multi-stage experiment** repeats a simple one, e.g. drawing twice from an urn with $3$ red and $4$ blue balls. The **tree diagram** shows every possible course; each **path** is one outcome.

The branches carry probabilities. **With replacement** they stay the same; **without replacement** the urn shrinks (after red: $\frac26$ red, $\frac46$ blue).

- **1st path rule (product):** $P(rr) = \frac37 \cdot \frac26 = \frac17$.
- **2nd path rule (sum):** $P(\text{same colour}) = P(rr) + P(bb) = \frac17 + \frac27 = \frac37$.
- **Complement:** $P(\text{at least one red}) = 1 - P(\text{no red})$.

Simulating many draws, the relative frequencies usually come close to the probabilities.

## Try it

1. Draw once and watch the path light up. [Load example](?r=3&b=4&rep=0)
2. Switch on **with replacement**. Which fractions change? [With replacement](?rep=1)
3. Choose the event “all the same colour” and draw 100 times, several times. [Event](?ev=same)

## Tasks

### Task 1: Path probabilities

$3$ red, $4$ blue, two draws without replacement: compute all four path probabilities. [Load task](?show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(rr) = \frac17$, $P(rb) = P(br) = P(bb) = \frac27$; together $1$. [Show in simulation](?show=1)

</details>

### Task 2: At least one red

Three draws with replacement: find $P(\text{at least one red})$. [Load task](?n=3&rep=1&ev=minR&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 - \left(\frac47\right)^3 = \frac{279}{343} \approx 81.3\,\%$. [Show in simulation](?n=3&rep=1&ev=minR)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Drawing a few times from a real urn first and then letting the simulation do the many repetitions can work well.
- **Common stumbling blocks:** keeping the same probabilities without replacement; adding along a path instead of multiplying; treating $rb$ and $br$ as one outcome.
