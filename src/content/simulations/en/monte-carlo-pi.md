---
description: Interactive Monte Carlo simulation – random points in a square give an ever better estimate of π.
---

## What is it about?

Place random points in the unit square and count how many lie inside the **quarter circle** of radius 1. Since

$$
\frac{A_\text{quarter circle}}{A_\text{square}} = \frac{\pi}{4},
$$

about $\frac{\pi}{4} \approx 78.5\,\%$ of the points land inside. With $k$ hits out of $n$ points: $\pi \approx 4 \cdot \frac{k}{n}$. A point lies inside if $x^2 + y^2 \le 1$.

Methods that compute something with many random trials are called **Monte Carlo methods**.

## Try it

1. Add single points – how much does the estimate change at first?
2. Add 1000 points or press **Play**.
3. Switch to the full circle – why is the factor still 4? [Full circle](?shape=full)

## Exercises

### Exercise 1: How accurate?

About $100\,000$ points give an error of at most $0.01$ (95 %). How many points are needed for $0.001$?

<details>
<summary>Show solution</summary>

The error shrinks like $\frac{1}{\sqrt{n}}$: ten times smaller needs $100$ times as many points, about 10 million.

</details>

### Exercise 2: Class experiment

Everyone adds 1000 points. How do you combine the results?

<details>
<summary>Show solution</summary>

Add all hits and all points: $\pi \approx 4 \cdot \frac{k_1 + k_2 + \ldots}{n_1 + n_2 + \ldots}$.

</details>

## Notes for teachers

- **Use:** Grade 10. Links probability, the area of a circle and the Pythagorean theorem.
- **Display:** the first $120\,000$ points are drawn; counting continues without limit.
