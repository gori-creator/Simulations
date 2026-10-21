---
description: Interactive Monty Hall problem – play yourself or simulate thousands of games and find out whether switching pays off.
---

## What is it about?

A game show has three doors. Behind one there is a **car**, behind each of the other two a **goat**.

1. You pick a door. It is marked “Your choice”.
2. The host knows where the car is. She opens **another** door with a goat behind it.
3. You may **stay** with your door or **switch** to the “other door”.

Many people think: two doors are left, so it is 50 : 50. But that is wrong!

- **Staying** wins only if the first pick was right: probability $\frac{1}{3}$.
- **Switching** wins exactly when the first pick was wrong: probability $\frac{2}{3}$.

If the first pick was wrong, only the door with the car is left after the host opens a door. The host is not allowed to open the car door.

With $n$ doors the host opens all doors except yours and one other. Then staying wins with $\frac{1}{n}$ and switching with $\frac{n-1}{n}$.

### The rules matter

The calculation assumes that the host **always** opens a goat door, **never** your door, and **always** offers the switch. If the rules change, the probabilities change as well (see exercises 4 and 6).

### Frequency and probability

Under **Results** you see how often you won, for example “Switch: won 7 of 10 (70 %)”. This is a **relative frequency**. It depends on chance and is different in every series. The **probability** $\frac{2}{3}$, on the other hand, is a fixed value. Over many games the relative frequency settles close to it (empirical law of large numbers). In the mode **Simulate many games** the chart shows this: the curves approach the dashed lines “Switch: 2/3” and “Stay: 1/3”.

## Try it

1. Play ten times and always **stay**. Then play ten times and always **switch**. Compare under **Results**.
2. Try ten doors: after your pick only two doors stay closed. Would you switch? [10 doors](?doors=10)
3. Let 1000 games run in the mode **Simulate many games**. Where do the shares of wins settle? [Simulation](?mode=simulate)
4. Think first: which shares of wins do you expect with four doors? Then check with the simulation. [Simulate 4 doors](?mode=simulate&doors=4)

## Exercises

### Exercise 1: Tree diagram

Use a tree diagram to show that switching wins with probability $\frac{2}{3}$.

<details>
<summary>Show solution</summary>

First stage: the first pick is the car with $\frac{1}{3}$ and a goat with $\frac{2}{3}$.

- First pick car ($\frac{1}{3}$): switching surely leads to a goat.
- First pick goat ($\frac{2}{3}$): the host must reveal the other goat. Switching surely leads to the car.

So $P(\text{win when switching}) = \frac{2}{3} \cdot 1 = \frac{2}{3}$.

</details>

### Exercise 2: Evaluate the simulation

Simulate 1000 games with three doors. How far do the shares of wins differ from $\frac{1}{3}$ and $\frac{2}{3}$? Repeat several times. [Open simulation](?mode=simulate)

<details>
<summary>Show solution</summary>

The shares of wins usually lie within about three percentage points of $33.3\,\%$ and $66.7\,\%$. With 1000 games about 95 % of all series lie within $\pm 1.96 \cdot \sqrt{\frac{1}{3} \cdot \frac{2}{3} / 1000} \approx \pm 0.029$, i.e. roughly between $63.7\,\%$ and $69.6\,\%$ when switching.

</details>

### Exercise 3: Ten doors

What are the probabilities of winning with ten doors? Why does this example help to understand the result for three doors? [10 doors](?doors=10)

<details>
<summary>Show solution</summary>

Stay: $\frac{1}{10}$, switch: $\frac{9}{10}$. The first pick almost never hits the car. The host then opens eight goat doors and leaves exactly one door closed. That is almost always the door with the car. With three doors it is the same principle, just less obvious.

</details>

### Exercise 4: The host does not know (challenge)

Suppose the host does **not** know where the car is. She opens one of the two other doors at random. By chance there is a goat behind it. Should you switch now?

<details>
<summary>Show solution</summary>

No, now it really is $\frac{1}{2}$ to $\frac{1}{2}$. There are six equally likely cases (each $\frac{1}{6}$):

- first pick car, one of the two goat doors opened (2 cases): staying wins,
- first pick goat, the other goat opened (2 cases): switching wins,
- first pick goat, the car opened (2 cases): these are ruled out because a goat was shown.

Of the 4 remaining cases switching wins in 2. So the host's knowledge makes the difference. The simulation always plays by the original rules. You can act out this variant with three playing cards.

</details>

### Exercise 5: Frequency or probability?

Lea always switches in 10 games and wins only 5 times. She says: “So switching only gives 50 %, not $\frac{2}{3}$.” What do you think?

<details>
<summary>Show solution</summary>

$\frac{5}{10} = 50\,\%$ is a relative frequency from only 10 games. It varies a lot: with 10 games the range from exercise 2 is about $\pm 1.96 \cdot \sqrt{\frac{1}{3} \cdot \frac{2}{3} / 10} \approx \pm 0.29$. So 50 % is well within it. At most 5 wins in 10 games happen with a probability of about 21 % when switching, i.e. in roughly one series out of five. Only many games reliably show that switching is better.

</details>

### Exercise 6: Four doors, only one is opened (challenge)

There are four doors. After your pick the host opens only **one** goat door. You may stay or switch to one of the **two** other closed doors. Calculate both probabilities of winning.

<details>
<summary>Show solution</summary>

Stay: $\frac{1}{4} = 25\,\%$. Switch: with $\frac{3}{4}$ the first pick was wrong. Then the car is behind one of the two other closed doors, and you hit it with $\frac{1}{2}$. So $P(\text{win when switching}) = \frac{3}{4} \cdot \frac{1}{2} = \frac{3}{8} = 37.5\,\%$. Switching still pays off, but less than in the simulation. There only one other door is left, and switching wins with $\frac{3}{4}$.

</details>

## Ideas for the classroom

- **Use:** Grade 10 (multi-stage random experiments, simulations); please check against your curriculum. A good starter: let the class vote beforehand whether they would switch.
- **Play mode:** The doors can be tapped directly, also on an interactive whiteboard. Each group can play ten games with “Stay” and ten with “Switch”. Then collect the results of the whole class.
- **Simulation mode:** Thousands of games run in seconds. This is a good moment to talk about the difference between relative frequency and probability (exercise 5).
- **To grasp the idea:** With ten doors the result becomes obvious for many students (exercise 3).
- **Common stumbling blocks:**
  - “Two doors left, so 50 : 50.” The host does not choose at random.
  - The importance of the rules is overlooked (exercises 4 and 6).
- **History:** The problem became famous in 1990 through a column by Marilyn vos Savant. Even many experts at first thought the correct solution was wrong.
