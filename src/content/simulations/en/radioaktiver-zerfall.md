---
description: "Interactive simulation of radioactive decay – many nuclei decay at random, a counter tube registers counts, N–t graph with half-life (linear and logarithmic), activity A = λ · N, five real nuclides, radiocarbon dating and a single nucleus whose decay cannot be predicted."
---

## What is it about?

Radioactive nuclei are unstable. At some moment a **parent nucleus** turns into a **daughter nucleus** and emits radiation: in **alpha decay** a helium nucleus $^4_2\text{He}$, in **beta⁻ decay** an electron (and an antineutrino), often followed by **gamma radiation**. Mass number and charge number are conserved, e.g. $^{220}_{\ 86}\text{Rn} \rightarrow\ ^{216}_{\ 84}\text{Po} + ^4_2\text{He}$.

When a particular nucleus decays cannot be predicted. In every short time step $\Delta t$ each nucleus decays with the same probability $p = 1 - e^{-\lambda \Delta t}$, independent of its age. With many nuclei this gives the **decay law**

$$
N(t) = N_0 \cdot \left(\tfrac12\right)^{t/T_{1/2}} = N_0 \cdot e^{-\lambda t}, \qquad \lambda = \frac{\ln 2}{T_{1/2}}
$$

After one **half-life** half remains, after two a quarter, after three an eighth ($12.5\,\%$). On a logarithmic axis the curve becomes a straight line. The **activity** $A = \lambda \cdot N$ (unit becquerel, $1\,\text{Bq} = 1/\text{s}$) decreases with the same half-life. A counter tube only registers the particles that reach its window, so its count rate is smaller than, but proportional to, the activity.

**Radiocarbon dating:** after an organism dies its C-14 decays with $T_{1/2} = 5730\,\text{a}$; the age follows from $t = T_{1/2} \cdot \log_2 \frac{N_0}{N}$.

**About the model:** nuclei are drawn greatly enlarged, time runs in time-lapse. The daughters of Rn-220 and U-238 are themselves radioactive; only the first decay is shown.

## Try it

1. Watch 500 nuclei. How many are left after one half-life? Repeat with “New sample”. [Radon-220](?N0=500)
2. Compare 100 and 2500 nuclei. [100 nuclei](?N0=100) · [2500 nuclei](?N0=2500)
3. Switch to the logarithmic axis. [Logarithmic](?N0=2500&log=1)
4. Tap a nucleus and wait for it to decay. Do all nuclei last exactly one half-life?
5. Switch to “A single nucleus” and evaluate 100 nuclei. [Single nucleus](?mode=one)

## Tasks

### Task 1: Three half-lives

A sample contains $1000$ iodine-131 nuclei ($T_{1/2} = 8.02\,\text{d}$). About how many are left after $24\,\text{d}$? [Load task](?nuc=i131&N0=1000&theo=0&_hide=1)

<details>
<summary>Show solution</summary>

$24\,\text{d}$ is about three half-lives: $N \approx 1000 \cdot \left(\tfrac12\right)^3 = 125$, give or take a few because of chance.

</details>

### Task 2: Radiocarbon dating

Only $25\,\%$ of the original C-14 is left in a piece of wood. How old is it? [Load task](?nuc=c14&N0=1000&_hide=1)

<details>
<summary>Show solution</summary>

$25\,\% = \left(\tfrac12\right)^2$: two half-lives, $t = 2 \cdot 5730\,\text{a} = 11\,460\,\text{a}$. The decay constant is $\lambda = \ln 2 / 5730\,\text{a} \approx 1.21 \cdot 10^{-4}\,\text{a}^{-1}$.

</details>

### Task 3: An old nucleus

A nucleus has already existed for three half-lives. What is the probability that it decays within the next half-life? [Load task](?mode=one&_hide=1)

<details>
<summary>Show solution</summary>

$50\,\%$, just like a new one – nuclei do not age. The mean lifetime $\tau = T_{1/2} / \ln 2 \approx 1.44\,T_{1/2}$ is even longer than the half-life.

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Start with dice: every six “decays” and is removed; then present the simulation as very many dice in very small steps.
- Let several groups run “New sample” with 100 nuclei and compare $N$ after one half-life: the results scatter, their mean is close to 50.
- **Common stumbling blocks:** “after two half-lives everything is gone”; “an old nucleus will decay soon”; confusing count rate and activity; taking the half-life as the lifetime of each nucleus.
