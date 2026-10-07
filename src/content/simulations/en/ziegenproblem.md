---
description: Interactive Monty Hall problem – play yourself or simulate thousands of games and find out whether switching pays off.
---

## What is it about?

There are three doors: a **car** behind one, **goats** behind the others. You pick a door; the host, who knows where the car is, opens **another** door with a goat and offers you to **switch**.

- **Staying** wins only if the first pick was right: $\frac{1}{3}$.
- **Switching** wins exactly when the first pick was wrong: $\frac{2}{3}$.

With $n$ doors the host opens all but two: staying wins with $\frac{1}{n}$, switching with $\frac{n-1}{n}$. This relies on the rules: the host **always** opens a goat door and **always** offers the switch.

## Try it

1. Play ten times always staying, then ten times always switching. Compare.
2. Try ten doors. [10 doors](?doors=10)
3. Simulate 1000 games. [Simulation](?mode=simulate)

## Exercises

### Exercise 1: Tree diagram

Use a tree diagram to show that switching wins with probability $\frac{2}{3}$.

<details>
<summary>Show solution</summary>

First pick: car ($\frac{1}{3}$) → switching loses; goat ($\frac{2}{3}$) → the host must reveal the other goat, so switching wins. Hence $\frac{2}{3}$.

</details>

### Exercise 2: Different rules (challenge)

The host does **not** know where the car is and opens one of the other doors at random. It happens to show a goat. Should you switch?

<details>
<summary>Show solution</summary>

Now it is $\frac{1}{2}$ : $\frac{1}{2}$ – of the four equally likely cases that show a goat, switching wins in two.

</details>

## Notes for teachers

- **Use:** Grade 10 (multi-stage experiments, simulation). Let the class vote before playing.
- **Misconception:** "two doors left, so 50 : 50" – the host's choice is not random.
