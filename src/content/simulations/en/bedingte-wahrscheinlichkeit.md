---
description: "1000 people are coloured by disease status and test result. Only those who tested positive remain – and often only a small part of them really have the disease. With tree, reversed tree, Bayes’ formula and a second test."
---

## What is it about?

A test for a disease $D$ is never perfect. Three numbers describe the situation:

- **Prevalence** $P(D)$: share of people with the disease, e.g. $1\,\%$.
- **Sensitivity** $P(+ \mid D)$: share of people with the disease who test positive, e.g. $90\,\%$.
- **Specificity** $P(- \mid \overline{D})$: share of healthy people who test negative, e.g. $91\,\%$.

After a positive result, however, you want to know $P(D \mid +)$, the **positive predictive value**. Think in **natural frequencies**: of $1000$ people, $10$ are ill and $9$ of them test positive (**true positives**). Of the $990$ healthy people, $9\,\%$ – that is $89.1 \approx 89$ – also test positive (**false positives**). So only $9$ of $98$ positive results belong to ill people:

$$
P(D \mid +) = \frac{P(D) \cdot P(+ \mid D)}{P(D) \cdot P(+ \mid D) + P(\overline{D}) \cdot P(+ \mid \overline{D})} = \frac{0.009}{0.009 + 0.0891} \approx 9.2\,\%.
$$

This is **Bayes’ theorem**; in the **reversed tree** the value sits directly on the branch “positive → ill”. Ignoring the prevalence (the base rate) leads to far too high estimates – the **base rate fallacy**. A **second test** after a positive first test starts with prevalence $9.2\,\%$ and gives $\frac{100}{199} \approx 50.3\,\%$. All example numbers are **simplified**.

## Try it

1. Watch the process, then tap “Only those who tested positive”. [Load example](?prev=1&se=90&sp=91&pos=1)
2. Raise the prevalence to $50\,\%$. [Common disease](?prev=50&se=90&sp=90&pos=1)
3. Set the specificity to $100\,\%$. [Specificity 100 %](?sp=100&pos=1)
4. Switch to the tree and reverse it. [Tree](?view=tree&dir=fwd)
5. Do a second test. [Second test](?n2=1)

## Tasks

### Task 1: Natural frequencies

Prevalence $1\,\%$, sensitivity $90\,\%$, specificity $91\,\%$. Find the four groups for $1000$ people and $P(D \mid +)$. [Load task](?prev=1&se=90&sp=91&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$9$ true positives, $1$ false negative, $89.1 \approx 89$ false positives, $900.9 \approx 901$ true negatives. $P(D \mid +) = \frac{9}{9 + 89.1} \approx 9.2\,\%$. [Show in simulation](?prev=1&se=90&sp=91&pos=1)

</details>

### Task 2: Rapid test (simplified)

Sensitivity $80\,\%$, specificity $98\,\%$, prevalence $0.5\,\%$. [Load task](?prev=0.5&se=80&sp=98&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(D \mid +) = \frac{0.004}{0.004 + 0.0199} \approx 16.7\,\%$: $4$ true against about $20$ false positives per $1000$. [Show in simulation](?prev=0.5&se=80&sp=98&pos=1)

</details>

### Task 3: Second test

After a positive result in Task 1, a second independent test of the same kind is positive too. [Load task](?n2=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

New prevalence $p_2 \approx 9.17\,\%$, then $\frac{p_2 \cdot 0.9}{p_2 \cdot 0.9 + (1 - p_2) \cdot 0.09} = \frac{100}{199} \approx 50.3\,\%$. [Show in simulation](?n2=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- **Use:** conditional probability and Bayes’ theorem (upper secondary). Two-way tables are covered in more depth in [Two-way tables and Venn diagrams](../two-way-table-venn-diagram/), path rules in [Multi-stage experiments](../tree-diagram-path-rules/).
- **Start with an estimate:** let students guess $P(D \mid +)$ before revealing it.
- **Common stumbling blocks:**
  - Confusing sensitivity $P(+ \mid D)$ with the predictive value $P(D \mid +)$.
  - Ignoring the prevalence (base rate).
  - Mixing up false positives and false negatives.
