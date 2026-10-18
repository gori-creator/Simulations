---
description: "One small data set as a tally chart, column, bar, line, strip or pie chart and pictogram – the shapes morph into each other. Plus typical tricks to uncover and a detective mode with six cases."
---

## What is it about?

The same data can be shown in many ways. **Column and bar charts** show values as heights or lengths, read off on an axis that should start at $0$. A **line chart** shows a change over time. In a **pictogram** every picture stands for the same amount. **Strip and pie charts** show **shares of a whole**: the whole is $100\,\%$.

The share is the value divided by the total: $6$ of $24$ children is $\frac{6}{24} = 25\,\%$. In a pie chart the central angle is

$$
\text{angle} = \text{share} \cdot 360° = \frac{6}{24} \cdot 360° = 90°.
$$

Charts can mislead: a **truncated axis** (starting at $90$, the values $95$ and $100$ look like $1 : 2$ instead of $0.95 : 1$), **uneven axis steps**, an **area pictogram** (double the height means four times the area), a **missing unit**, or a **pie whose percentages do not add up to 100 %**.

## Try it

1. Tap a column to read it off, then drag it. How do the shares of all categories change? [Column chart](?chart=col)
2. Switch to the strip chart and then to the pie chart and watch the columns turn into a circle. [Pie chart](?chart=pie)
3. Why is a pie chart of temperatures not suitable? [Temperatures as a pie](?data=temp&chart=pie)
4. Explore the truncated axis and reveal the trick. [Truncated axis](?mode=trick&trick=cut&data=wahl&cut=90)
5. Become a detective: find the trick in six cases. [Detective mode](?mode=detect&fall=1)

## Tasks

### Task 1: Central angles

What are the angles for football ($8$ children) and tennis ($3$ children)? [Load task](?chart=pie&lab=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{8}{24} \cdot 360° = 120°$ and $\frac{3}{24} \cdot 360° = 45°$. [Show in the simulation](?chart=pie)

</details>

### Task 2: A landslide?

Jonas has $100$ votes, Mia $95$; the axis starts at $90$. What percentage of Jonas' column height does Mia's column have – and what percentage of his votes does she really have? [Load task](?mode=trick&trick=cut&data=wahl&cut=90&_hide=1)

<details>
<summary>Show solution</summary>

Heights $5$ and $10$: $50\,\%$. Really: $\frac{95}{100} = 95\,\%$. [Show honestly](?mode=trick&trick=cut&data=wahl&cut=90&honest=1)

</details>

### Task 3: The poster

A poster says: football $40\,\%$, dancing $30\,\%$, riding $20\,\%$, tennis $15\,\%$, gymnastics $15\,\%$. What is wrong? [Load task](?mode=trick&trick=sum&_hide=1)

<details>
<summary>Show solution</summary>

The total is $120\,\%$, but a whole is $100\,\%$. Someone divided by $20$ instead of $24$. Correct: $33.3\,\%$, $25\,\%$, $16.7\,\%$, $12.5\,\%$, $12.5\,\%$. [Show honestly](?mode=trick&trick=sum&honest=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- **Use:** Year 6, reading and judging charts, shares as percentages and as angles. The class could collect its own data and enter it with the sliders.
- **Detective mode** may work well in pairs; individual cases can be linked directly.
- **Common stumbling blocks:**
  - Reading column heights as values although the axis does not start at $0$.
  - Taking the percentage as the angle ($25\,\%$ → $25°$ instead of $90°$).
  - Using line charts for categories that have no order.
