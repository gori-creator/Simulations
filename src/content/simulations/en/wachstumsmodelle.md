---
description: "Growth models compared: linear, exponential, bounded and logistic – explicit and recursive, with rate of change, inflection point, table characteristics and data to fit."
---

## What is it about?

How a quantity $B(t)$ grows depends on **what the increase depends on**:

| Model | Increase per unit of time | Function | Sign in the table |
| --- | --- | --- | --- |
| linear | always the same: $B' = d$ | $B(t) = B_0 + d\,t$ | equal differences |
| exponential | proportional to the amount: $B' = k\,B$ | $B(t) = B_0\,e^{kt}$ | equal ratios |
| bounded | proportional to the distance from the limit: $B' = k\,(S - B)$ | $B(t) = S - (S - B_0)\,e^{-kt}$ | differences ∝ $S - B$ |
| logistic | proportional to the amount **and** the distance: $B' = k\,B\,(1 - B/S)$ | $B(t) = \dfrac{S}{1 + \frac{S - B_0}{B_0} e^{-kt}}$ | differences first rising, then falling |

Each model can also be written **recursively**, i.e. step by step: linear $B(n+1) = B(n) + d$, exponential $B(n+1) = a \cdot B(n)$ with the growth factor $a = e^k$.

**Logistic growth** starts almost exponentially and ends almost bounded. Example: $S = 100$, $B(0) = 10$, $k = 0.5$ gives

$$
B(t) = \frac{100}{1 + 9\,e^{-0.5t}}.
$$

At the **inflection point** half of the limit is reached, $B = 50$, and there the amount grows fastest. From $9\,e^{-0.5t} = 1$ we get $t = 2 \ln 9 \approx 4.39$.

The **rate of change against the amount** (lower picture) shows the models especially clearly: a horizontal line (linear), a line through the origin (exponential), a falling line down to $S$ (bounded) and a downward-opening parabola (logistic).

## Try it

1. Compare all four models. Which one is fastest at the start, which one at the end? [Comparison](?mode=compare&B0=10&d=8&k=0.5&S=100&tmax=14)
2. Logistic: where is the inflection point? Change $B_0$ and watch it move. [Logistic](?mode=single&model=logistic&B0=10&k=0.5&S=100&tmax=14)
3. Recursive with a large $k$: why does the amount jump past the limit? [Oscillation](?mode=single&model=logistic&B0=10&k=2.3&S=100&tmax=40&rec=1)
4. Which model fits the sunflower? Try them all and press “Fit automatically”. [Sunflower](?mode=data&ds=sunflower&model=logistic&B0=18&k=0.4&S=220)
5. Cooling: which room temperature is hidden in the data? [Tea](?mode=data&ds=tea&model=bounded&B0=90&k=0.15&S=25)
6. Compound interest against simple interest: how big is the difference after 20 years? [Saving](?mode=apps&sc=interest&K0=1000&pz=5&yrs=20)
7. Medicine: how high does the amount in the body rise if you take 400 mg every 8 hours? [Medicine](?mode=apps&sc=drug&dose=400&hl=8&tau=8)
8. Cobweb diagram: change k from 0.5 to 2.8. When does the sequence oscillate, when does it become chaotic? [Cobweb](?mode=cobweb&model=logistic&B0=10&k=2.3&S=100&tmax=40)
9. Practise: set up the right model for a text. [Practice](?mode=exam&q=1)

## Exercises

### Exercise 1: Which model?

An amount grows like this: 10; 15; 22.5; 33.75. Which model fits?

<details>
<summary>Show solution</summary>

The ratios are always 1.5 – exponential growth with $B(t) = 10 \cdot 1.5^t$.

</details>

### Exercise 2: Inflection point

For $B(t) = \dfrac{100}{1 + 9e^{-0.5t}}$, find the inflection point and the largest increase.

<details>
<summary>Show solution</summary>

$B = 50$ at $t = 2\ln 9 \approx 4.39$. The largest increase is $k \cdot S/4 = 0.5 \cdot 100/4 = 12.5$ per unit of time. [Show in the simulation](?mode=single&model=logistic&B0=10&k=0.5&S=100&tmax=14)

</details>

### Exercise 3: Doubling time

Bacteria multiply with $k = 0.35$ per hour. After what time has their number doubled?

<details>
<summary>Show solution</summary>

$T = \ln 2 / 0.35 \approx 1.98$ hours. [Show in the simulation](?mode=single&model=exp&B0=2&k=0.35&tmax=8)

</details>

### Exercise 4: Medicine

A patient takes 400 mg of a medicine with a half-life of 8 hours every 8 hours. How much is in the body after the third dose? What maximum does it approach?

<details>
<summary>Show solution</summary>

After 8 hours half is left: $B_{n+1} = 0.5 \cdot B_n + 400$. After the third dose: $400 + 200 + 100 = 700\,\text{mg}$. In equilibrium $B = 0.5 \cdot B + 400$, so $B = 800\,\text{mg}$ (right after a dose) and $400\,\text{mg}$ (right before). [Show in the simulation](?mode=apps&sc=drug&dose=400&hl=8&tau=8)

</details>

## Ideas for the classroom

- **Use:** compare models, recognise them from tables (differences, ratios) and fit them to measured data.
- **The data sets are made up** but typical (sunflower, cooling, bacteria, piggy bank) – good for comparing with your own data.
- **Common stumbling blocks:**
  - Confusing exponential with “fast” – at the start, linear growth is often faster.
  - Swapping $S$ and $B_0$ in bounded growth (cooling: $S$ is the room temperature).
  - For the logistic model, the recursive and the explicit form only agree approximately.
