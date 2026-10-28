---
description: "The birthday problem in four views: one class in a calendar, 1000 simulated classes with a frequency curve, the complement calculation step by step and all pairs as lines – plus same month, same weekday and the pigeonhole principle."
---

## What is it about?

What is the probability that in a class of $n$ people **at least two share a birthday**? Many people guess only a few percent for $25$ people – in fact it is almost $57\,\%$.

**Model:** Each of the $365$ days is equally likely (no leap days, no twins), and the birthdays are independent.

**Calculation via the complement** (view “Calculation”): Instead of “at least two equal” we compute “all different”. The people arrive one by one: the first may have any day, the second must hit one of the $364$ free days, the third one of the remaining $363$ … By the path rule we multiply:

$$
P(\text{all different}) = \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \cdot \ldots \cdot \frac{365 - n + 1}{365},
\qquad
P(\text{at least two equal}) = 1 - P(\text{all different}).
$$

| $n$ | $10$ | $23$ | $30$ | $50$ |
| --- | --- | --- | --- | --- |
| $P(\text{at least two equal})$ | $11.7\,\%$ | $50.7\,\%$ | $70.6\,\%$ | $97.0\,\%$ |

**Why so high? – Counting pairs** (view “Pairs”): It is not about one particular day but about **any pair**. $n$ people form $\frac{n \cdot (n-1)}{2}$ pairs, already $253$ for $23$ people. Each pair shares a birthday with probability $\frac{1}{365}$. If we pretend the pairs are independent, we get the good approximation

$$
P \approx 1 - \left(\frac{364}{365}\right)^{\frac{n(n-1)}{2}}, \qquad n = 23: \; 1 - \left(\tfrac{364}{365}\right)^{253} \approx 50.0\,\%.
$$

**Compare: “on my birthday”.** Here only the $n$ pairs “me – other person” count:

$$
P(\text{someone on my day}) = 1 - \left(\frac{364}{365}\right)^{n}, \qquad n = 25: \approx 6.6\,\%.
$$

Only from $253$ other people on is this value above $50\,\%$.

**Simulation** (view “Many classes”): Each tile is a randomly drawn class: filled with, light with a border without a shared birthday. The relative frequency $h = \frac{\text{hits}}{\text{classes}}$ varies a lot at first and then approaches the probability $P$ (empirical law of large numbers). The light funnel shows where $h$ lies after $N$ classes in about $95\,\%$ of all cases: $P \pm 1.96 \cdot \sqrt{\frac{P(1-P)}{N}}$.

**Same month, same weekday:** The same calculation works with $12$ months or $7$ weekdays. With only $5$ people, two share a birth month with probability $61.8\,\%$. From $13$ people on it is **certain**: there are only $12$ months, so two must share one (**pigeonhole principle**). The product then contains the factor $\frac{0}{12}$.

## Try it

1. Press **New class** several times. How often do you find a shared day? [One class](?mode=class&n=25)
2. Tap your birthday in the calendar and compare the two questions. [My birthday](?q=mine&both=1)
3. Start **1000 classes** and watch the curve of the relative frequency settle into the funnel. [Simulation](?mode=sim&n=23)
4. Watch the free days shrink. From which person on is $P(\text{all different})$ smaller than $0.5$? [Calculation](?mode=calc&n=30)
5. Tap a person in the pairs view: how many pairs does it form? How many pairs are there in total? [Pairs](?mode=pairs&n=12)
6. Switch the pairs view to “on my birthday”. Why are there suddenly far fewer lines? [Only my pairs](?mode=pairs&q=mine&n=25)
7. Choose “same month” and increase $n$ from $5$ to $13$. What happens at $13$? [Same month](?d=12&n=5) · [13 people](?d=12&n=13&mode=calc)

## Tasks

### Task 1: Three people

Find the probability that at least two of three people share a birthday. [Load task](?mode=calc&n=3&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$P = 1 - \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \approx 1 - 0.9918 = 0.0082$, so about $0.82\,\%$. [Show in the simulation](?mode=calc&n=3)

</details>

### Task 2: Your class

Find the probability for a class size of $28$. About how many of $1000$ classes of this size have a shared birthday? Check with the simulation. [Load task](?mode=sim&n=28&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

For $n = 28$, $P \approx 65.4\,\%$, so about $654$ of $1000$ classes. The simulation gives values around this; after $1000$ classes $h$ almost always lies between about $0.62$ and $0.68$. [Show in the simulation](?mode=sim&n=28)

</details>

### Task 3: Pairs and approximation

How many pairs do $30$ people form? Use this to compute the approximation and compare it with the exact value $70.6\,\%$. [Load task](?mode=pairs&n=30&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{30 \cdot 29}{2} = 435$ pairs. Approximation: $1 - \left(\frac{364}{365}\right)^{435} \approx 69.7\,\%$ – just below the exact value $70.6\,\%$. [Show in the simulation](?mode=pairs&n=30)

</details>

### Task 4: My birthday

What is the probability that one of $25$ other people has a birthday on exactly your birthday? Why is this so much less than $56.9\,\%$? [Load task](?q=mine&n=25&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 - \left(\frac{364}{365}\right)^{25} \approx 6.6\,\%$. Here someone has to hit one **particular** day, and there are only $25$ pairs “me – other”. In the birthday problem **any** of $300$ pairs is enough. [Show in the simulation](?mode=pairs&q=mine&n=25)

</details>

### Task 5: Same weekday

What is the probability that at least two of $4$ people were born on the same weekday? From how many people on is it certain? [Load task](?d=7&n=4&mode=calc&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$P = 1 - \frac{7 \cdot 6 \cdot 5 \cdot 4}{7^4} = 1 - \frac{840}{2401} \approx 65.0\,\%$. From $8$ people on it is certain (pigeonhole principle: only $7$ weekdays). [Show in the simulation](?d=7&n=4&mode=calc)

</details>

### Task 6: Model check

In reality, birthdays are not spread quite evenly over the year. Does this make a shared birthday more or less likely?

<details>
<summary>Show solution</summary>

Rather **more** likely: if some days are more frequent, birthdays cluster there and matches become more likely. The even distribution is the “least favourable” case for shared birthdays.

</details>

## Ideas for the classroom

- **Use:** Lower secondary, multi-stage random experiments and stochastic simulations. Let the class estimate before calculating – and perhaps take a look at the birthdays in your own class.
- **Simulation and calculation:** The view “Many classes” makes the surprising size plausible, the view “Calculation” explains it. The funnel shows how much relative frequencies still vary after $100$ classes.
- **Same month** works well as a game in class: even in small groups a shared month almost always turns up.
- **Compare groups:** Each device draws its own classes. Collect the numbers of hits after $100$ classes each on the board – the spread between the groups fits the funnel well.
- **Common stumbling blocks:**
  - The birthday problem is confused with “someone shares my birthday”.
  - Computing $\frac{n}{365}$ – which is even greater than $1$ for large $n$.
  - Adding the factors $\frac{364}{365}, \frac{363}{365}, \ldots$ instead of multiplying them.
