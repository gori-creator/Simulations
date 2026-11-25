## What is it about?

A simple pendulum is the epitome of regularity. Attach a second pendulum to it and you get a **double pendulum** – which behaves wildly and unpredictably.

### Deterministic yet unpredictable

The motion follows fixed laws: knowing the initial values **exactly** determines everything – the system is **deterministic**. Yet in practice it cannot be predicted, because

> tiny differences in the initial conditions grow **exponentially**.

Two pendulums differing by a thousandth of a degree double their difference roughly every second; after about 15 seconds they swing completely differently. This is **deterministic chaos**, the **butterfly effect**.

### In the graph

The graph shows the logarithm of the angle difference. A rising **straight line** means exponential growth; its slope is the **Lyapunov exponent**. For small swings the difference stays small – regular motion.

### Energy is conserved

Chaos does not mean "anything goes": without friction the total energy stays constant.

## Try it

- [Chaotic](?a1=120&a2=120&delta=0.001), [small swing](?a1=10&a2=10&delta=0.1), [tiny difference](?a1=120&a2=120&delta=0.00001)

## Exercises

**1. Doubling.** The difference doubles about every second. How long until 0.001° becomes about 60°? [Load exercise](?a1=120&a2=120&delta=0.001&_hide=1)

<details><summary>Show solution</summary>

$2^n = 60\,000$, $n \approx 16$ – about 16 seconds.

</details>

**2. A hundred times more precise.** How much longer can you predict with 0.00001° instead of 0.001°? [Load exercise](?a1=120&a2=120&delta=0.00001&_hide=1)

<details><summary>Show solution</summary>

$100 \approx 2^{6.6}$: only about 7 seconds longer.

</details>

**3. Regular or chaotic?** Compare 10° and 120°. [Load exercise](?a1=10&a2=10&delta=0.1&_hide=1)

<details><summary>Show solution</summary>

At 10° the difference stays about the same; at 120° it grows exponentially.

</details>

**4. Weather.** Why are weather forecasts unreliable beyond about two weeks?

<details><summary>Show solution</summary>

The atmosphere is chaotic; measurement errors grow exponentially.

</details>

## Ideas for teaching

- Film a real double pendulum started twice from the "same" position.
- Connect to logarithmic plots and doubling times.
