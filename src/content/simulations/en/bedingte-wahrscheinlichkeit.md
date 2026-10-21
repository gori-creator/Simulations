---
description: "1000 people are coloured by disease status and test result. Only those who tested positive remain – and often only a small part of them really have the disease. With tree, reversed tree, Bayes’ formula and a second test."
---

## What is it about?

A test for a disease $D$ is never perfect. Three numbers describe the situation:

- **Prevalence** $P(D)$: share of people with the disease among those tested, e.g. $1\,\%$.
- **Sensitivity** $P(+ \mid D)$: share of people with the disease who test positive, e.g. $90\,\%$.
- **Specificity** $P(- \mid \overline{D})$: share of healthy people who test negative, e.g. $91\,\%$.

After a positive result, however, you want to know something else: how likely am I **ill, given** a positive test? This is the **positive predictive value** $P(D \mid +)$ – the “reversed” conditional probability.

It is easiest to think in **natural frequencies**. Of $1000$ people, $10$ are ill; $9$ of them test positive (**true positives**), $1$ tests negative (**false negative**). Of the $990$ healthy people, $9\,\%$ – that is $89.1 \approx 89$ – still test positive (**false positives**), $901$ test negative (**true negatives**). So $9 + 89 = 98$ people test positive – and only $9$ of them are ill:

$$
P(D \mid +) = \frac{9}{9 + 89.1} \approx 9.2\,\%.
$$

With the rounded counts you get almost the same: $\frac{9}{98} \approx 9.2\,\%$. For whole numbers without rounding, use $10\,000$ people: $100$ ill, $90$ of them positive; $9900$ healthy, $891$ of them positive; so $\frac{90}{90 + 891} \approx 9.2\,\%$.

In general this is **Bayes’ theorem**:

$$
P(D \mid +) = \frac{P(D) \cdot P(+ \mid D)}{P(D) \cdot P(+ \mid D) + P(\overline{D}) \cdot P(+ \mid \overline{D})} = \frac{0.01 \cdot 0.9}{0.01 \cdot 0.9 + 0.99 \cdot 0.09} = \frac{0.009}{0.0981} \approx 9.2\,\%.
$$

In the **reversed tree** this value sits directly on the branch “positive → ill”. The reason for the small value: there are so many healthy people that even a small share of false alarms far outnumbers the few true positives. Ignoring the prevalence (the “base rate”) leads to far too high estimates of $P(D \mid +)$ – the **base rate fallacy**. The **negative predictive value** $P(\overline{D} \mid -) = \frac{900.9}{900.9 + 1} \approx 99.9\,\%$, on the other hand, is very high.

A **second test** after a positive first test starts with the group of people who tested positive. Their share of people with the disease – the new prevalence – is the predictive value of the first test, $9.2\,\%$. After two positive tests (assumed independent) you get $\frac{100}{199} \approx 50.3\,\%$.

The numbers in the examples are **simplified** and only illustrate the idea; real tests have different values depending on the device, the timing and the group of people.

## Try it

1. Watch the process: first the people with the disease turn red, then the test shows its result. People with the disease also carry a dot on their body. Then tap “Only those who tested positive”. How many of those who tested positive really have the disease? [Load example](?prev=1&se=90&sp=91&pos=1)
2. Raise the prevalence slowly to $50\,\%$. How does the predictive value change? The link shows the final state with sensitivity and specificity of $90\,\%$ each. [Common disease](?prev=50&se=90&sp=90&pos=1)
3. Set the specificity to $100\,\%$. What happens to the false positives? [Specificity 100 %](?sp=100&pos=1)
4. Lower the sensitivity to $50\,\%$. Does the predictive value change a lot – and what happens to the false negatives? [Sensitivity 50 %](?se=50)
5. Switch to the tree and reverse it. Which numbers stay the same, which change? [Tree](?view=tree&dir=fwd)
6. Do a second test. How much does the predictive value rise? [Second test](?n2=1)

## Tasks

### Task 1: Natural frequencies

Prevalence $1\,\%$, sensitivity $90\,\%$, specificity $91\,\%$. Find the four groups for $1000$ people and the positive predictive value. [Load task](?prev=1&se=90&sp=91&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Ill $10$: true positives $9$, false negative $1$. Healthy $990$: false positives $990 \cdot 0.09 = 89.1 \approx 89$, true negatives $900.9 \approx 901$. $P(D \mid +) = \frac{9}{9 + 89.1} \approx 9.2\,\%$. [Show in simulation](?prev=1&se=90&sp=91&pos=1)

</details>

### Task 2: Rapid test with low prevalence (simplified)

A rapid test has sensitivity $80\,\%$ and specificity $98\,\%$. The disease is currently rare: $0.5\,\%$. How likely is it that a person who tested positive is ill? [Load task](?prev=0.5&se=80&sp=98&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Of $1000$: $5$ ill, $4$ of them positive. $995$ healthy, $995 \cdot 0.02 = 19.9 \approx 20$ of them positive. $P(D \mid +) = \frac{0.005 \cdot 0.8}{0.005 \cdot 0.8 + 0.995 \cdot 0.02} = \frac{0.004}{0.0239} \approx 16.7\,\%$ – only about one in six people who test positive is ill. [Show in simulation](?prev=0.5&se=80&sp=98&pos=1)

</details>

### Task 3: Mammography screening (simplified example)

Assume that $0.8\,\%$ of the women examined have breast cancer, the sensitivity is $90\,\%$ and the specificity $93\,\%$. Calculate $P(D \mid +)$ with Bayes’ formula. [Load task](?prev=0.8&se=90&sp=93&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(D \mid +) = \frac{0.008 \cdot 0.9}{0.008 \cdot 0.9 + 0.992 \cdot 0.07} = \frac{0.0072}{0.07664} \approx 9.4\,\%$. In natural frequencies: $7.2$ true positives against $69.4$ false positives per $1000$ women (rounded to $7$ and $69$ in the simulation). For $10\,000$ women: $72$ true positives and $9920 \cdot 0.07 = 694.4 \approx 694$ false positives. [Show in simulation](?prev=0.8&se=90&sp=93&view=tree&dir=rev)

</details>

### Task 4: Second test

Everyone who tested positive in Task 1 takes a second, independent test of the same kind, which is positive again. How likely is it now that the person is ill? [Load task](?n2=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

New prevalence $p_2 = P(D \mid +) = \frac{0.009}{0.0981} \approx 9.17\,\%$. Then $\frac{p_2 \cdot 0.9}{p_2 \cdot 0.9 + (1 - p_2) \cdot 0.09} = \frac{100}{199} \approx 50.3\,\%$. With frequencies: of the $98.1$ people who tested positive, $9$ are ill; $8.1$ of them test positive again, and $8.02$ of the $89.1$ healthy people. So $\frac{8.1}{8.1 + 8.02} \approx 50.3\,\%$. [Show in simulation](?n2=1)

</details>

### Task 5: How good does the test have to be?

Prevalence $1\,\%$, sensitivity $90\,\%$. What specificity is needed at least so that at least half of the people who test positive are ill? [Load task](?prev=1&se=90&sp=91&show=0&_hide=1)

<details>
<summary>Show solution</summary>

We need false positives $\le$ true positives, i.e. $0.99 \cdot (1 - s) \le 0.009$, so $1 - s \le 0.00909$ and $s \ge 99.09\,\%$. With $s = 99.1\,\%$ you get $P(D \mid +) = \frac{0.009}{0.009 + 0.00891} \approx 50.3\,\%$. [Show in simulation](?prev=1&se=90&sp=99.1&pos=1)

</details>

## Ideas for the classroom

- **Use:** conditional probability and Bayes’ theorem (upper secondary; in Bavaria grade 11 – please check against your own curriculum). Two-way tables and tree diagrams are covered in more depth in [Two-way tables and Venn diagrams](../two-way-table-venn-diagram/), path rules in [Multi-stage experiments](../tree-diagram-path-rules/).
- **Start with an estimate:** before revealing it, let students guess how likely a person who tested positive is ill – the guesses are often far above $9\,\%$.
- **Natural frequencies:** the icon picture and the tree with counts often make the calculation easier to follow than the formula alone; Bayes’ formula can then be read off the tree.
- **For tasks:** with “Show results” switched off, counts and predictive values appear as “?”. Prevalence, sensitivity and specificity stay visible.
- **Model/simplifications:** prevalence, sensitivity and specificity are fixed numbers; for the second test the tests are assumed independent. The counts in the picture are rounded (always summing to $1000$), the percentages are calculated exactly. It is worth discussing with the class that a positive result is followed up by a doctor in practice; the simulation makes no statement about individual real tests.
- **Common stumbling blocks:**
  - Confusing sensitivity $P(+ \mid D)$ with the predictive value $P(D \mid +)$ (“the test is $90\,\%$ reliable, so I am $90\,\%$ likely to be ill”).
  - Ignoring the prevalence (base rate).
  - Taking the first-stage branches of the reversed tree from the forward tree.
  - Mixing up false positives and false negatives.
