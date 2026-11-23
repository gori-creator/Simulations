---
description: "Growth models compared: linear, exponential, bounded and logistic – explicit and recursive, with rate of change, inflection point, table characteristics and data to fit."
---

## What is it about?

| Model | Rate | Function |
| --- | --- | --- |
| linear | $B' = d$ | $B_0 + dt$ |
| exponential | $B' = kB$ | $B_0 e^{kt}$ |
| bounded | $B' = k(S - B)$ | $S - (S - B_0)e^{-kt}$ |
| logistic | $B' = kB(1 - B/S)$ | $S / (1 + \frac{S - B_0}{B_0}e^{-kt})$ |

Example: $S = 100$, $B(0) = 10$, $k = 0.5$ gives $B(t) = 100/(1 + 9e^{-0.5t})$ with the inflection point at $B = 50$, $t = 2\ln 9 \approx 4.39$.

## Try it

1. Compare all four: [load](?mode=compare&B0=10&d=8&k=0.5&S=100&tmax=14)
2. Logistic in detail: [load](?mode=single&model=logistic&B0=10&k=0.5&S=100&tmax=14)
3. Fit a model to data: [sunflower](?mode=data&ds=sunflower&model=logistic&B0=18&k=0.4&S=220)

- Everyday applications: [compound interest](?mode=apps&sc=interest&K0=1000&pz=5&yrs=20), [medicine](?mode=apps&sc=drug&dose=400&hl=8&tau=8), [rumour](?mode=apps&sc=rumor&N=400&kr=0.8), [tea](?mode=apps&sc=cooling&T0=90&Tr=20&kc=0.05&Tt=50)
- Cobweb diagram of the recursive sequence: [load](?mode=cobweb&model=logistic&B0=10&k=2.3&S=100&tmax=40)
- Practice setting up models: [load](?mode=exam&q=1)

## Tasks

### Task 1

10; 15; 22.5; 33.75 – which model?

<details>
<summary>Show solution</summary>

Constant ratio 1.5: exponential.

</details>

### Task 2

Inflection point of $100/(1 + 9e^{-0.5t})$?

<details>
<summary>Show solution</summary>

$t = 2\ln 9 \approx 4.39$, $B = 50$.

</details>

## Ideas for the classroom

- Recognise models from tables (differences, ratios) and fit them to data. The data series are invented but typical.
