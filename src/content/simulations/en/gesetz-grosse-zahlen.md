---
description: Interactive simulation of the empirical law of large numbers – toss a coin, a die or a drawing pin thousands of times and watch the relative frequency.
---

## What is it about?

If a die is thrown $n$ times and shows a six $k$ times, then $k$ is the **absolute frequency** and $h_n = \frac{k}{n}$ the **relative frequency**. With few throws $h_n$ jumps around a lot; with many throws it **settles** near the **probability** $p$ – the **empirical law of large numbers**. This lets us estimate unknown probabilities, e.g. for a drawing pin landing point up.

Chance does **not** "even out": a die has no memory. The relative frequency approaches $p$ because early deviations are spread over more and more throws.

The green **funnel** $p \pm 1.96\sqrt{p(1-p)/n}$ contains the relative frequency in about 95 % of all runs.

## Try it

1. Throw the die one at a time. Why does the curve jump so much at first?
2. Throw 1000 times or press **Play**. Where does the curve settle?
3. Estimate the drawing pin's probability without showing it. [Drawing pin](?exp=tack&showP=0)

## Exercises

### Exercise 1: Expectation

About how many sixes do you expect in 600 throws? Are 92 sixes suspicious?

<details>
<summary>Show solution</summary>

About 100. 92 sixes ($h \approx 0.153$) are not suspicious – the funnel at $n = 600$ ranges from about $0.137$ to $0.196$.

</details>

### Exercise 2: Does the die remember?

"No six in five throws – one must come soon!" Comment.

<details>
<summary>Show solution</summary>

Wrong (gambler's fallacy): the throws are independent, each has probability $\frac{1}{6}$.

</details>

## Notes for teachers

- **Use:** Grades 6–8 (relative frequency, probability as an estimate).
- **Misconceptions:** gambler's fallacy; "600 throws give exactly 100 sixes"; the absolute deviation $k - np$ typically grows, only the relative deviation shrinks.
