---
description: "Counting principle and tree diagrams to try out: outfits, ice-cream cones, a combination lock, a menu and a podium – the tree grows stage by stage, and the number is the product of the choices per stage."
---

## What is it about?

Many questions start with “How many possibilities are there …?”: How many outfits from 3 pairs of trousers, 4 T-shirts and 2 hats? How many four-digit PINs? How many podiums with 8 runners? You choose **in stages** – first the trousers, then the T-shirt, then the hat.

A **tree diagram** makes this visible: from the start, every stage branches into as many branches as there are choices there. Every **path** from the start to the far right is exactly **one outcome** – that is why each path gets a card.

**Counting principle (product rule):** if stage 1 has $n_1$ choices, stage 2 has $n_2$ choices (for each choice before it), and so on, then there are

$$
n_1 \cdot n_2 \cdot \ldots \cdot n_k
$$

outcomes altogether. For the outfits: $3 \cdot 4 \cdot 2 = 24$. The tree shows why: each of the 3 pairs of trousers has 4 T-shirt branches, that is $3 \cdot 4 = 12$ branches, and each of them has 2 hats.

**With repetition:** if every stage chooses again from the same $n$ things (digits of a PIN, ice-cream flavours that may repeat), then with $k$ stages there are

$$
n \cdot n \cdot \ldots \cdot n = n^k
$$

possibilities, e.g. $10^4 = 10{,}000$ four-digit PINs from the digits 0 to 9.

**Without repetition:** if each thing may occur only once (nobody can be first *and* second), each stage has one choice fewer: for the podium with 8 runners there are $8 \cdot 7 \cdot 6 = 336$ possibilities.

**Orderings:** if all $n$ things are to be put in order, you get the product of all numbers from $n$ down to 1. It is written briefly as the **factorial** $n!$ (read “n factorial”):

$$
5! = 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1 = 120
$$

**Counting systematically** also works without a tree: in the table, each choice in stage 1 has its own row, followed by all continuations in order. Every row has the same length – so this is a product again: rows times the length of a row.

## Try it

1. Watch the outfit tree grow. Tap a pair of trousers: how many outfits start with it? Why is that $4 \cdot 2$? [Outfits](?sit=outfit&a=3&b=4&c=2)
2. Add a third hat. How many new branches appear, how many new outfits? [One more hat](?sit=outfit&c=3)
3. Use **Walk all paths** to light up every path one after another. Is any outfit counted twice? Is one missing?
4. For the cone, switch **with repetition** off and on again. Which branches disappear, and why does each stage then have one choice fewer? [Cone](?sit=eis&n=4&k=3&rep=1)
5. For the combination lock the tree becomes huge. How many paths are behind a collapsed branch? Check with the counting principle. [Combination lock](?sit=pin&z=10&s=4)
6. For the podium, set as many places as runners. Compare $3!$, $4!$ and $5!$ – how fast do the numbers grow? [5 runners, all places](?sit=podest&l=5&p=5)
7. Switch to the **table**. Where in the picture do you find the calculation “rows times the length of a row”? [Menu as a table](?sit=menu&view=liste)

## Tasks

### Task 1: Wardrobe

Lea has 2 pairs of trousers, 5 T-shirts and 3 hats. How many different outfits can she put together? [Load task](?sit=outfit&a=2&b=5&c=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

By the counting principle: $2 \cdot 5 \cdot 3 = 30$ outfits. [Show in the simulation](?sit=outfit&a=2&b=5&c=3)

</details>

### Task 2: Bike lock

A bike lock has 3 wheels with the digits 0 to 9. How many settings are there? How long would it take at most to try them all if one setting takes 2 seconds?

<details>
<summary>Show solution</summary>

$10 \cdot 10 \cdot 10 = 10^3 = 1000$ settings. $1000 \cdot 2\,\text{s} = 2000\,\text{s}$, that is just over 33 minutes. [Show in the simulation](?sit=pin&z=10&s=3&rep=1)

</details>

### Task 3: Different flavours

The ice-cream parlour has 6 flavours. Tim wants 3 scoops stacked, all different; the order from bottom to top counts. How many cones are possible? How many would there be if flavours could occur more than once? [Load task](?sit=eis&n=6&k=3&rep=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Without repetition: $6 \cdot 5 \cdot 4 = 120$. With repetition: $6^3 = 216$. The $216 - 120 = 96$ extra cones are exactly those in which at least one flavour occurs more than once. [Show in the simulation](?sit=eis&n=6&k=3&rep=0)

</details>

### Task 4: Prize-giving

At sports day, 8 children run a race. How many possibilities are there for the first three places? How many for the complete finishing order? [Load task](?sit=podest&l=8&p=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Podium: $8 \cdot 7 \cdot 6 = 336$. Complete order: $8! = 40{,}320$. [Show in the simulation](?sit=podest&l=8&p=8)

</details>

### Task 5: Thinking backwards

A restaurant offers 2 starters and 3 desserts and advertises “24 different menus”. How many main courses are on the menu?

<details>
<summary>Show solution</summary>

$2 \cdot h \cdot 3 = 24$, so $6h = 24$ and $h = 4$ main courses. [Show in the simulation](?sit=menu&v=2&h=4&d=3)

</details>

### Task 6: When does it become impossible?

A code is to consist of 4 different digits. How many codes are there with the digits 0 to 9? Why is there no such code if only 3 digits are available?

<details>
<summary>Show solution</summary>

$10 \cdot 9 \cdot 8 \cdot 7 = 5040$ codes. [Show in the simulation](?sit=pin&z=10&s=4&rep=0)

With only 3 digits, no digit is left after three positions: $3 \cdot 2 \cdot 1 \cdot 0 = 0$. [Show dead ends](?sit=pin&z=3&s=4&rep=0)

</details>

## Ideas for the classroom

- **Use:** in Bavaria in year 5 (learning area “multiplication and division”: counting principle with tree diagrams) as an introduction, for instance with the outfits; in year 8 (Laplace experiments) for revision, when counting favourable and possible outcomes.
- **Starting without a formula:** the class could first write down outfits themselves and discover duplicates or gaps; walking all paths and the table then show two ways of counting systematically.
- **Representation:** with many paths only the beginning of the tree is drawn in full; collapsed branches carry the number of paths behind them. This can be an occasion to discuss why, beyond a certain size, you calculate instead of drawing.
- **Common stumbling blocks:**
  - The numbers are added instead of multiplied ($3 + 4 + 2$) – the tree shows that *every* pair of trousers goes with all T-shirts.
  - “With” and “without repetition” are mixed up; it helps to ask whether the same thing can be chosen again at a later stage.
  - For the cone the number depends on whether the order counts. Here it does (bottom, middle, top); without order there would be fewer possibilities.
  - $0! = 1$ seems strange at first; but it fits the fact that there is exactly one way to arrange nothing.
