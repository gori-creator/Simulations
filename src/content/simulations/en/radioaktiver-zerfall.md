---
description: "Interactive simulation of radioactive decay – many nuclei decay at random, a counter tube registers counts, N–t graph with half-life (linear and logarithmic), activity A = λ · N, five real nuclides, radiocarbon dating and a single nucleus whose decay cannot be predicted."
---

## What is it about?

Radioactive nuclei are unstable: at some moment they turn into a different nucleus and emit radiation. The original nucleus is called the **parent nucleus**, the new one the **daughter nucleus**. In **alpha decay** the nucleus emits a helium nucleus ($^4_2\text{He}$, two protons and two neutrons). In **beta⁻ decay** a neutron inside the nucleus turns into a proton, and an electron (plus an antineutrino) leaves the nucleus. Often **gamma radiation** follows. Mass number and charge number are conserved in the decay equation, for example

$$
^{220}_{\ 86}\text{Rn} \rightarrow\ ^{216}_{\ 84}\text{Po} + ^4_2\text{He}, \qquad ^{131}_{\ 53}\text{I} \rightarrow\ ^{131}_{\ 54}\text{Xe} + ^{\ \ 0}_{-1}\text{e} + \bar\nu
$$

**Chance:** When a particular nucleus decays cannot be predicted at all. Only the probability is known: in every short time step $\Delta t$ each remaining nucleus decays with the same probability $p = 1 - e^{-\lambda \cdot \Delta t}$ – independent of the other nuclei and of how long it has already existed. This is exactly how the simulation calculates (200 steps per half-life). You can think of it as a dice game: every nucleus rolls a die in every step and decays only on one particular number.

**Decay law:** With very many nuclei chance evens out. After each **half-life** $T_{1/2}$ about half of the remaining parent nuclei have decayed:

$$
N(t) = N_0 \cdot \left(\tfrac{1}{2}\right)^{t/T_{1/2}} = N_0 \cdot e^{-\lambda t}, \qquad \lambda = \frac{\ln 2}{T_{1/2}}
$$

After $T_{1/2}$ half is left, after $2\,T_{1/2}$ a quarter, after $3\,T_{1/2}$ an eighth ($12.5\,\%$). $N(t)$ never becomes exactly zero; in a real sample with a finite number of nuclei, however, the last nucleus does decay at some point. $\lambda$ is called the **decay constant**. On a **logarithmic axis** the curve becomes a straight line – that is how you recognise exponential decrease (compare the maths simulation “Exponential growth and decay”).

**Random fluctuation:** The data points never lie exactly on the curve. The typical deviation only grows with the square root of the number: with $N_0$ nuclei, $N$ scatters by about $\tfrac12\sqrt{N_0}$ (standard deviation) after one half-life. With 100 nuclei that is about 5 nuclei ($10\,\%$ of 50), with 2500 nuclei about 25 nuclei (only $2\,\%$ of 1250). The more nuclei, the more precisely the decay law holds.

**Activity:** The number of decays per unit time is called the activity, $A = \lambda \cdot N$, unit $1\,\text{Bq} = 1\,\tfrac{1}{\text{s}}$ (becquerel). It decreases with the same half-life as $N$. A **counter tube** only registers the particles that reach its window. Its **count rate** is therefore smaller than the activity, but proportional to it. Alpha particles travel only a few centimetres in air – the simulation shows this too.

**Radiocarbon dating (C-14 method):** Living things take in carbon with a known share of C-14. After they die, the C-14 decays with $T_{1/2} = 5730\,\text{a}$. The age follows from the remaining fraction: $t = T_{1/2} \cdot \log_2 \frac{N_0}{N}$.

**About the model:** The nuclei are drawn greatly enlarged and simplified, and time runs in time-lapse (slider “one half-life takes …”). A real sample contains unimaginably many nuclei – 1 g of uranium-238 about $2.5 \cdot 10^{21}$. The daughter nuclei of Rn-220 (Po-216) and U-238 (Th-234) are themselves radioactive; only the first decay is considered here. For Cs-137 the gamma radiation strictly comes from the excited daughter nucleus Ba-137m.

## Try it

1. Start with 500 nuclei and watch the data points. How many nuclei are left after one half-life? Restart several times with “New sample”. [Radon-220](?N0=500)
2. Take only 100 nuclei and compare with 2500 nuclei. When do the data points deviate more from the theoretical curve? [100 nuclei](?N0=100) · [2500 nuclei](?N0=2500)
3. Switch the N axis to logarithmic. What happens to the curve? What happens at the very end, when only a few nuclei are left? [Logarithmic](?N0=2500&log=1)
4. Tap a nucleus and wait until it decays (keyboard: Tab to the dish, then press Enter until a nucleus is marked). Try it with several nuclei. Do they all decay after exactly one half-life?
5. Compare the activity graph with the graph of $N$. How are count rate and activity related? Switch the sound on.
6. Switch to “A single nucleus” and evaluate 100 nuclei. What does the histogram look like, and the curve “not yet decayed”? [Single nucleus](?mode=one)
7. Choose different nuclides. What changes in the graph if time is measured in half-lives – and what does not? [Uranium-238](?nuc=u238)

## Tasks

### Task 1: After three half-lives

A sample contains $1000$ iodine-131 nuclei ($T_{1/2} = 8.02\,\text{d}$). About how many are still there after $24\,\text{d}$? [Load task](?nuc=i131&N0=1000&theo=0&_hide=1)

<details>
<summary>Show solution</summary>

$24\,\text{d} \approx 3 \cdot 8.02\,\text{d}$, i.e. three half-lives: $N \approx 1000 \cdot \left(\tfrac12\right)^3 = 125$. In the experiment the value is usually a few nuclei higher or lower because of chance. [Show in the simulation](?nuc=i131&N0=1000)

</details>

### Task 2: Decay constant

Calculate the decay constant of C-14 ($T_{1/2} = 5730\,\text{a}$) and the activity of $1000$ C-14 nuclei. [Load task](?nuc=c14&N0=1000&_hide=1)

<details>
<summary>Show solution</summary>

$\lambda = \frac{\ln 2}{5730\,\text{a}} \approx 1.21 \cdot 10^{-4}\,\tfrac{1}{\text{a}}$. $A = \lambda \cdot N \approx 0.121$ decays per year – so on average one of the 1000 nuclei decays about every 8 years. In becquerel: $A \approx 3.8 \cdot 10^{-9}\,\text{Bq}$.

</details>

### Task 3: Radiocarbon dating

Only $25\,\%$ of the original C-14 is left in a piece of wood from an excavation. How old is the wood? [Load task](?nuc=c14&N0=1000&theo=0&_hide=1)

<details>
<summary>Show solution</summary>

$25\,\% = \left(\tfrac12\right)^2$, so two half-lives have passed: $t = 2 \cdot 5730\,\text{a} = 11\,460\,\text{a}$. In general $t = T_{1/2} \cdot \log_2 \frac{N_0}{N} = 5730\,\text{a} \cdot \log_2 4$. Under “Time from the remaining fraction” the simulation shows how good this estimate is for a sample of only 1000 nuclei.

</details>

### Task 4: Reading off the half-life

Read off the graph after what time only a quarter of the 2500 Rn-220 nuclei is left (about 625 nuclei). Determine the half-life from this and compare it with the value in the nuclide selection. [Load task](?N0=2500&theo=0&_hide=1)

<details>
<summary>Show solution</summary>

A quarter is reached after about $111\,\text{s}$ (because of chance a few seconds earlier or later, depending on the sample). That is two half-lives, so $T_{1/2} \approx 111\,\text{s} : 2 \approx 56\,\text{s}$ (table value $55.6\,\text{s}$; $2 \cdot 55.6\,\text{s} = 111.2\,\text{s}$). The straight line on the logarithmic axis is particularly easy to read. [With theoretical curve](?N0=2500&log=1)

</details>

### Task 5: A single nucleus

A nucleus has already existed for three half-lives. What is the probability that it decays within the next half-life? Give reasons. [Load task](?mode=one&_hide=1)

<details>
<summary>Show solution</summary>

$50\,\%$ – just like a “fresh” nucleus. Nuclei do not age; the decay probability does not depend on how long the nucleus has existed. That is why the mean lifetime $\tau = \frac{T_{1/2}}{\ln 2} \approx 1.44\,T_{1/2}$ is even longer than the half-life: some nuclei live very long. [Evaluate many nuclei](?mode=one)

</details>

### Task 6: How much does chance scatter? (advanced)

Several groups start a sample with $100$ nuclei and note $N$ after one half-life. Then they repeat this with $2500$ nuclei. By how many nuclei do the results typically deviate from the expected value, in absolute terms and in percent? [100 nuclei](?N0=100&theo=0&_hide=1) · [2500 nuclei](?N0=2500&theo=0&_hide=1)

<details>
<summary>Show solution</summary>

$50$ and $1250$ nuclei are expected. The typical deviation (standard deviation) is $\tfrac12\sqrt{N_0}$: with $100$ nuclei $\tfrac12 \cdot 10 = 5$ nuclei, i.e. $10\,\%$ of $50$; with $2500$ nuclei $\tfrac12 \cdot 50 = 25$ nuclei, i.e. only $2\,\%$ of $1250$. About two thirds of the groups lie within this deviation. The absolute fluctuation grows with more nuclei, the relative one shrinks – that is why the decay law holds very precisely for real samples with unimaginably many nuclei.

</details>

## Ideas for the classroom

- **Use:** radioactivity in lower secondary (types of decay, half-life, counter tube) and in more depth in upper secondary (decay law with $\lambda$, activity, logarithms, chance as a basic concept). Please check the exact assignment against your curriculum.
- **Dice model as a starter:** Each student rolls many dice; all sixes “decay” and are removed. Then present the simulation as “very many dice in very small steps”.
- **Ask for predictions:** “Have all nuclei decayed after two half-lives?” – many expect this at first. The data points show the quarter.
- **Chance and law:** Several groups each start “New sample” with 100 nuclei and note $N$ after one half-life; the results scatter (mostly between 45 and 55), their mean is close to 50. The button “Reset time” repeats exactly the same random course.
- **Task mode:** With the “Load task” links, half-life, decay constant, activity and the evaluation are hidden in the picture and in the results; “Reveal” shows them again. The nuclide selection still states the half-life – in task 4 it serves for comparison.
- **Common stumbling blocks:**
  - “After two half-lives everything is gone.” – Half of the remainder is left each time.
  - “An old nucleus will decay soon.” – The probability does not depend on age.
  - Count rate and activity are treated as the same – the counter tube only registers a part.
  - The half-life is taken as the lifetime of each individual nucleus.
- **Curriculum links:** structure of nuclei, alpha, beta and gamma radiation, decay equations, half-life, activity, applications (medicine with I-131, dating with C-14, Cs-137 after reactor accidents).
