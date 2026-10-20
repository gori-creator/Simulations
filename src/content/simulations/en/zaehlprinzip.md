---
description: "Counting principle and tree diagrams to try out: outfits, ice-cream cones, a combination lock, a menu and a podium – the tree grows stage by stage, and the number is the product of the choices per stage."
---

## What is it about?

You choose **in stages**: first the trousers, then the T-shirt, then the hat. A **tree diagram** branches at every stage into as many branches as there are choices. Every **path** from the start to the far right is exactly **one outcome** – that is why each path gets a card.

**Counting principle (product rule):** with $n_1, n_2, \ldots, n_k$ choices per stage there are

$$
n_1 \cdot n_2 \cdot \ldots \cdot n_k
$$

outcomes, e.g. $3 \cdot 4 \cdot 2 = 24$ outfits.

- **With repetition** (digits of a PIN): $n^k$, e.g. $10^4 = 10\,000$ four-digit PINs.
- **Without repetition** (nobody can be first *and* second): one choice fewer at each stage, e.g. $8 \cdot 7 \cdot 6 = 336$ podiums.
- **Ordering all $n$ things:** $n! = n \cdot (n-1) \cdot \ldots \cdot 1$ (“n factorial”), e.g. $5! = 120$.

The **table** counts systematically: one row for each choice in stage 1, all continuations in order behind it – rows times row length.

## Try it

1. Watch the outfit tree grow. Tap a pair of trousers: how many outfits start with it, and why is that $4 \cdot 2$? [Outfits](?sit=outfit&a=3&b=4&c=2)
2. Use **Walk all paths**. Is any outfit counted twice or missing?
3. Switch **with repetition** off for the cone. Which branches disappear? [Cone](?sit=eis&n=4&k=3&rep=1)
4. Set as many places as runners and compare $3!$, $4!$, $5!$. [All places](?sit=podest&l=5&p=5)

## Tasks

### Task 1: Wardrobe

2 pairs of trousers, 5 T-shirts, 3 hats: how many outfits? [Load task](?sit=outfit&a=2&b=5&c=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$2 \cdot 5 \cdot 3 = 30$ outfits. [Show in the simulation](?sit=outfit&a=2&b=5&c=3)

</details>

### Task 2: Different flavours

6 flavours, 3 different scoops stacked (order counts). How many cones? And if flavours may repeat?

<details>
<summary>Show solution</summary>

$6 \cdot 5 \cdot 4 = 120$ without repetition, $6^3 = 216$ with repetition. [Show in the simulation](?sit=eis&n=6&k=3&rep=0)

</details>

### Task 3: Prize-giving

8 children run a race. How many possibilities for the first three places, how many for the complete finishing order?

<details>
<summary>Show solution</summary>

$8 \cdot 7 \cdot 6 = 336$ and $8! = 40\,320$. [Show in the simulation](?sit=podest&l=8&p=8)

</details>

## Ideas for the classroom

- **Use:** introducing the counting principle (around grade 5), revisiting it for Laplace probabilities (around grade 8).
- Students could first write down outfits by hand and discover duplicates or gaps before using the tree and the table.
- **Common stumbling blocks:**
  - Adding instead of multiplying ($3 + 4 + 2$) – the tree shows that *every* pair of trousers goes with every T-shirt.
  - Mixing up with and without repetition: can the same thing be chosen again later?
  - For the cone the order counts (bottom, middle, top); without order there would be fewer possibilities.
