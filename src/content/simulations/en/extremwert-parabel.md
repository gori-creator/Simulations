---
description: "Interactive simulation: optimisation problems without calculus – enclosure against a wall, rectangle in a triangle, ticket price and gutter. The picture and the graph of the quadratic objective function move together; the maximum is found first by trial and error and then exactly by completing the square."
---

## What is it about?

In an **optimisation problem** you look for the largest (or smallest) value of a quantity. Example: with $40\,\text{m}$ of fence a rectangular enclosure is built against a wall, so the fence forms three sides.

- **What is maximised:** $A = x \cdot y$.
- **What is fixed (constraint):** $2x + y = 40$, so $y = 40 - 2x$.
- **Objective function:** $A(x) = x\,(40 - 2x) = -2x^2 + 40x$ with domain $0 < x < 20$.

Its graph is a parabola opening downwards, so its **vertex** is the highest point. Completing the square gives

$$
A(x) = -2\,(x^2 - 20x + 10^2 - 10^2) = -2\,(x - 10)^2 + 200 .
$$

The vertex $S(10 \mid 200)$ tells us: width $10\,\text{m}$, length $20\,\text{m}$, largest area $200\,\text{m}^2$. The zeros $0$ and $20$ are the ends of the domain, and the vertex lies exactly halfway between them.

The simulation also contains a free-standing enclosure (best shape: a square), a rectangle cut from a triangular board (corner at the midpoint of the hypotenuse), a ticket price with revenue $E(x) = (8 + x)(300 - 20x)$, and a gutter bent from a metal strip.

## Try it

1. Drag the handle of the enclosure or the point on the graph. [Load example](?sit=wall&L=40&x=4)
2. Switch the card to **Table of values**. Where is the largest value? [Load example](?sit=wall&L=40&x=6&card=table)
3. Click **Find the maximum**: first trial and error, then completing the square.
4. Without a wall the best enclosure is a square. [Load example](?sit=free&L=40&x=4)
5. Ticket price: sometimes a price cut is better. [Load example](?sit=price&p=12&n=200&k=25&xp=0)

## Tasks

### Task 1

With $60\,\text{m}$ of fence an enclosure is built against a wall. Find the largest area. [Load task](?sit=wall&L=60&x=5&sol=0&_hide=1)

<details>
<summary>Show solution</summary>

$A(x) = x\,(60 - 2x) = -2\,(x - 15)^2 + 450$: width $15\,\text{m}$, length $30\,\text{m}$, $A_{\max} = 450\,\text{m}^2$. [Show in the simulation](?sit=wall&L=60&x=15)

</details>

### Task 2

A swimming pool charges €4 and has 600 guests a day. Every €1 more costs 50 guests. Which price gives the largest revenue? [Load task](?sit=price&p=4&n=600&k=50&xp=0&sol=0&_hide=1)

<details>
<summary>Show solution</summary>

$E(x) = (4 + x)(600 - 50x) = -50\,(x - 4)^2 + 3200$: price €8, 400 guests, revenue €3200. [Show in the simulation](?sit=price&p=4&n=600&k=50&xp=4)

</details>

### Task 3

A gutter is bent from a $24\,\text{cm}$ wide strip. How high should the sides be?

<details>
<summary>Show solution</summary>

$A(x) = x\,(24 - 2x) = -2\,(x - 6)^2 + 72$: sides $6\,\text{cm}$, cross-section $72\,\text{cm}^2$. [Show in the simulation](?sit=gutter&s=24&xg=6)

</details>

## Notes for teachers

- **Use:** grade 9, quadratic functions and modelling; no derivatives needed.
- **Structure:** quantity to maximise, constraint, objective function, domain, vertex, interpretation – the card shows exactly these steps.
- **Common mistakes:** sign errors when factoring out a negative number; forgetting the domain; assuming a square is always best (not with a wall).
- **Task mode:** `sol=0` together with **Share → hide results** hides the vertex and the working.
