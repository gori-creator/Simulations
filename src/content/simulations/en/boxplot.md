---
description: "Drag or add data points on the number line: ordered list, median, quartiles, box plot and mean follow live – step by step or comparing two groups."
---

## What is it about?

A maths test, pocket money or the long jump produce many single values – the **raw data**. To describe them, we sum them up in a few **statistics**.

**Mean** (arithmetic mean): add all values and divide by their number $n$.

$$
\bar{x} = \frac{x_1 + x_2 + \ldots + x_n}{n}
$$

For the points of class 7a this gives $\bar{x} = \frac{295}{15} \approx 19.67$ points. You can picture the mean as the **balance point**: put the points on the number line as equally heavy balls, and the line balances exactly at the mean (red triangle).

**Median** (middle value): put the values in order of size (**ordered list**). The median is exactly in the middle. With $n = 15$ values it is the $8$th value. With an even number there are two middle values; the median is their mean, so for $n = 12$ it is $\frac{6\text{th value} + 7\text{th value}}{2}$. At least half of the values are less than or equal to the median, at least half are greater than or equal to it.

**Quartiles:** The median splits the ordered list into a lower and an upper half (with an odd count the median itself belongs to neither half). The **lower quartile** $Q_1$ is the median of the lower half, the **upper quartile** $Q_3$ the median of the upper half. Example: for $1, 2, \ldots, 9$ the median is $5$ and the lower half is $1, 2, 3, 4$. So $Q_1 = \frac{2 + 3}{2} = 2.5$ and $Q_3 = \frac{7 + 8}{2} = 7.5$. Some textbooks and programs define the quartiles slightly differently – for small data sets the values may then differ a little.

**Spread:** The **range** is $\text{maximum} - \text{minimum}$, the **interquartile range** is $Q_3 - Q_1$.

The **box plot** shows the five values minimum, $Q_1$, median, $Q_3$ and maximum at a glance: the **box** goes from $Q_1$ to $Q_3$, the line inside the box is the median, and the **whiskers** reach to the minimum and maximum. Box and whiskers split the data roughly into **four quarters** – the box holds about the middle half of the values.

**Outliers:** Values that lie more than $1.5$ times the interquartile range outside the box are often marked as outliers. The whiskers then stop at the last value inside. A single outlier can shift the mean a lot – but hardly the median: for $1, 2, 3, 4, 100$ the mean is $\bar{x} = \frac{110}{5} = 22$, but the median is $3$.

## Try it

1. Drag the point with the largest value far to the right. What happens to the mean, what to the median? [Load example](?ctx=test)
2. Press **Step by step** and watch the box plot grow out of the ordered list.
3. One child gets €90 of pocket money. Why is the mean above almost all other values? Turn outlier marking on and off. [Pocket money](?ctx=geld&out=1)
4. There are $12$ long-jump values. Where is the median in the ordered list? Tap the number line to add a 13th value – what changes? [Long jump](?ctx=sprung)
5. Compare classes 7a and 7b: median and mean are the same. How can you still see a big difference? [Comparison](?mode=cmp&pct=1)
6. For the way to school, the right whisker is much longer than the left one. What does that tell you about the data? [Way to school](?ctx=weg&pct=1)
7. Can you make median and mean exactly equal? And can you make the mean larger than $Q_3$? [Own data](?ctx=own)

## Tasks

### Task 1: Statistics of the test

Order the points of class 7a and find minimum, $Q_1$, median, $Q_3$, maximum and mean. [Load task](?ctx=test&show=0&box=0&mean=0&_hide=1)

<details>
<summary>Show solution</summary>

Ordered: $9, 12, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28$. Median: $8$th value $= 20$. Lower half $9 \ldots 19$ (7 values), $Q_1 = 16$; upper half $21 \ldots 28$, $Q_3 = 24$. Minimum $9$, maximum $28$. Mean $\frac{295}{15} \approx 19.67$. [Show in simulation](?ctx=test)

</details>

### Task 2: Even count

Find the median and the quartiles of the $12$ jump distances in autumn. [Load task](?ctx=sprung&show=0&box=0&_hide=1)

<details>
<summary>Show solution</summary>

Ordered: $2.9, 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.4$. Median $= \frac{3.6 + 3.7}{2} = 3.65\,\text{m}$. Lower half: 6 values, $Q_1 = \frac{3.2 + 3.4}{2} = 3.3\,\text{m}$. Upper half: $Q_3 = \frac{3.9 + 4.0}{2} = 3.95\,\text{m}$. [Show in simulation](?ctx=sprung)

</details>

### Task 3: The outlier

Work out mean and median of the pocket money – once with and once without the €90. Which statistic describes the “typical” pocket money better? [Load task](?ctx=geld&show=0&_hide=1)

<details>
<summary>Show solution</summary>

With: $\bar{x} = \frac{355}{11} \approx €32.27$, median €25. Without: $\bar{x} = \frac{265}{10} = €26.50$, median $\frac{25 + 25}{2} = €25$. The median does not change at all, the mean changes by almost €6. Here the median describes the “typical” pocket money better. Outlier limit: $Q_3 + 1.5 \cdot (Q_3 - Q_1) = 35 + 1.5 \cdot 15 = 57.5$ – the €90 lie above it. [Show in simulation](?ctx=geld&out=1)

</details>

### Task 4: Reading a box plot

In the way-to-school box plot, $Q_1 = 11$, median $= 15$, $Q_3 = 22.5$ and maximum $= 45$ minutes. Which statements are true? (a) About half need at most $15$ minutes. (b) About a quarter need more than $22.5$ minutes. (c) There are more children between $22.5$ and $45$ minutes than between $11$ and $15$. [Load task](?ctx=weg&rank=0&_hide=1)

<details>
<summary>Show solution</summary>

(a) and (b) are true. (c) is false: each of the two sections holds about a quarter of the values. The long whisker only shows that the values are **further apart** there, not that there are more of them. [Show in simulation](?ctx=weg&pct=1)

</details>

### Task 5: Comparing two classes

In the test, both classes have median $20$ and mean $19.67$. Compare the interquartile ranges. In which class would extra lessons for the weaker students be more urgent? [Load task](?mode=cmp&show=0&_hide=1)

<details>
<summary>Show solution</summary>

7a: $Q_3 - Q_1 = 24 - 16 = 8$; 7b: $27 - 13 = 14$. In 7b the results are spread much more widely: a quarter of the class has at most $13$ points (in 7a: at most $16$). Extra lessons would probably be more urgent there. [Show in simulation](?mode=cmp&pct=1)

</details>

### Task 6: Make up data

Make up five values with median $10$ and mean $20$. Check your answer by typing the values into “Own data”. [Load task](?ctx=own)

<details>
<summary>Show solution</summary>

The middle value must be $10$, the sum $5 \cdot 20 = 100$. For example $5, 8, 10, 12, 65$ – the large value pulls the mean up. [Show in simulation](?ctx=own&d=5%3B8%3B10%3B12%3B65)

</details>

## Ideas for the classroom

- **Use:** About grade 7, statistics of data: comparing mean and median, range and quartiles, drawing and interpreting box plots. Dragging a single point may be a good way in; “Step by step” can accompany the construction on the board.
- **Own data:** The class could collect its own data (way to school, hours of sleep, long jump) and type it into the “Values” field. Comparison mode shows two surveys side by side.
- **Quartiles:** The simulation takes the quartiles as medians of the two halves (with an odd count the median is left out). Another common convention takes as $Q_1$ the smallest value up to which at least a quarter of the values reach (for $1, \ldots, 9$ that is $3$ instead of $2.5$). If your textbook uses another convention, a short note can avoid confusion.
- **Outliers with few values:** For $1, 2, 3, 4, 100$ the box is very wide ($Q_1 = 1.5$, $Q_3 = 52$). So the $1.5$ rule does not mark the $100$ as an outlier – but it still shifts the mean a lot. [Try it](?ctx=own&d=1%3B2%3B3%3B4%3B100&out=1)
- **Common stumbling blocks:**
  - The median is read from the **unordered** raw data.
  - With an even count only one of the two middle values is taken.
  - A long whisker or a wide box is read as “more values” – correct is: the same number of values, just more spread out.
  - Mean and median are treated as the same; with skewed data or outliers they differ clearly.
  - The box is taken as the range of “all normal values”; but it only holds about the middle half.
