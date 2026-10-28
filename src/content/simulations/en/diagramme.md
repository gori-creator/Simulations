---
description: "One small data set as a tally chart, column, bar, line, strip or pie chart and pictogram – the shapes morph into each other. Plus typical tricks to uncover and a detective mode with six cases."
---

## What is it about?

Data – such as the favourite sports of a class or Lina's phone time over one week – can be shown in many ways. Each **representation** has its strengths:

- **Tally chart and table:** When counting, you make tally marks and bundle them in fives. The table shows every value exactly – but you only see differences by comparing the numbers.
- **Column and bar charts:** The **height** of the column (or the length of the bar) shows the value. You read it off on the axis, which should start at $0$.
- **Line chart:** It shows how a value changes **over time**, e.g. the temperature from Monday to Sunday. Between sports, however, there is no "in between" – there a line suggests a trend that does not exist.
- **Pictogram:** Every picture stands for **the same amount**, e.g. one phone for $20$ minutes. $90$ minutes are then $4.5$ phones.
- **Strip and pie charts:** They show **shares of a whole**. The whole strip or the whole circle is $100\,\%$.

For the **share**, divide the value by the total of all values. If $6$ of $24$ children like dancing best, that is

$$
\frac{6}{24} = \frac{1}{4} = 25\,\%.
$$

In a **pie chart** each category gets a sector. Its **central angle** is the share of $360°$:

$$
\text{angle} = \text{share} \cdot 360° = \frac{6}{24} \cdot 360° = 90°.
$$

Because the whole circle is $360°$, the angles must add up to exactly $360°$ – and the percentages to $100\,\%$. Rounding can give a total of $99\,\%$ or $101\,\%$ (e.g. $3 \cdot 33.3\,\% = 99.9\,\%$). In the results table the simulation rounds so that the angles add up to exactly $360°$ and the percentages to exactly $100\,\%$.

**Charts can mislead** – sometimes by accident, sometimes on purpose:

- **Truncated axis:** If the vertical axis starts at $90$ instead of $0$, the columns for $95$ and $100$ votes are $5$ and $10$ units tall. They look like $1 : 2$, although $95 : 100 = 0.95 : 1$. If an axis really should not start at $0$, this is marked with an **axis break** (a small zigzag on the axis).
- **Uneven axis steps:** If $0,\ 10,\ 20,\ 50,\ 100,\ 200$ are evenly spaced, large values are squashed.
- **Area pictogram:** If a picture is doubled in height **and** width, its area is four times as large: $2 \cdot 2 = 4$. Our eyes compare areas.
- **Missing unit:** "23 degrees" – Celsius or Fahrenheit? Without a title and a unit, numbers cannot be interpreted.
- **Pie not adding up to 100 %:** If someone divided by the wrong base, the percentages add up to e.g. $120\,\%$.

## Try it

1. Tap a column in the column chart: a guide line leads to the axis, and the value and share appear on the right. Drag the column up – how do the shares of **all** sports change? [Column chart](?chart=col)
2. Switch to the **strip chart** and then to the **pie chart**. The columns line up into a strip and the strip bends into a circle. Why is the piece for dancing exactly a quarter? [Pie chart](?chart=pie)
3. Choose the temperatures and the pie chart. Why does the note "not suitable" appear? [Temperatures as a pie](?data=temp&chart=pie)
4. Show the favourite sports as a line chart. What is the line between riding and tennis supposed to mean? [Sports as a line](?chart=line)
5. Set the phone time in the pictogram. How do you read off a phone outline that is only partly shown? [Pictogram](?data=handy&chart=pict)
6. Switch to the **tricks** and try the truncated axis. Move the start of the axis with the slider and watch the meter "looks" versus "real". Then: **Reveal the trick**. [Truncated axis](?mode=trick&trick=cut&data=wahl&cut=90)
7. Become a **detective**: each of the six cases hides a trick. Tap the spot in the chart that misleads. [Detective mode](?mode=detect&fall=1)

## Tasks

### Task 1: Reading off

Read off the column chart: how many children like riding best? What percentage of the class is that? [Load task](?chart=col&lab=0&_hide=1)

<details>
<summary>Show solution</summary>

$4$ of $24$ children: $\frac{4}{24} = \frac{1}{6} \approx 16.7\,\%$. [Show in the simulation](?chart=col&lab=1)

</details>

### Task 2: Central angles

What are the angles in the pie chart for football ($8$ children) and for tennis ($3$ children)? Check whether all five angles add up to $360°$. [Load task](?chart=pie&lab=0&_hide=1)

<details>
<summary>Show solution</summary>

Football: $\frac{8}{24} \cdot 360° = 120°$, tennis: $\frac{3}{24} \cdot 360° = 45°$. Together: $120° + 90° + 60° + 45° + 45° = 360°$. [Show in the simulation](?chart=pie)

</details>

### Task 3: Reading a trend

Read off the line chart: on which day did Lina spend the most time on her phone? By how many minutes did her phone time increase from Thursday to Saturday? [Load task](?data=handy&chart=line&lab=0&_hide=1)

<details>
<summary>Show solution</summary>

On Saturday ($120$ min). From $60$ min to $120$ min: it increased by $60$ minutes, so it doubled. [Show in the simulation](?data=handy&chart=line)

</details>

### Task 4: A landslide?

Jonas has $100$ votes, Mia $95$. In the chart the vertical axis starts at $90$. What percentage of the height of Jonas' column does Mia's column have? What percentage of Jonas' votes does Mia really have? [Load task](?mode=trick&trick=cut&data=wahl&cut=90&_hide=1)

<details>
<summary>Show solution</summary>

Heights: $95 - 90 = 5$ and $100 - 90 = 10$, so $\frac{5}{10} = 50\,\%$. Really: $\frac{95}{100} = 95\,\%$. The chart greatly exaggerates the gap. [Show honestly](?mode=trick&trick=cut&data=wahl&cut=90&honest=1)

</details>

### Task 5: Twice as big?

In the area pictogram the football figure is twice as tall and twice as wide as the riding figure. How many times as large is its area? How many times as many children really like football? [Load task](?mode=trick&trick=area&_hide=1)

<details>
<summary>Show solution</summary>

Area: $2 \cdot 2 = 4$ times as large. Really there are $8 : 4 = 2$ times as many children. An honest pictogram simply shows twice as many figures of the same size. [Show honestly](?mode=trick&trick=area&honest=1)

</details>

### Task 6: Mistake on the poster

A poster says: football $40\,\%$, dancing $30\,\%$, riding $20\,\%$, tennis $15\,\%$, gymnastics $15\,\%$. What is wrong? Work out the correct percentages if $8, 6, 4, 3, 3$ of $24$ children are meant. [Load task](?mode=trick&trick=sum&_hide=1)

<details>
<summary>Show solution</summary>

Together they make $120\,\%$ – but a whole is $100\,\%$. Someone divided by $20$ instead of $24$. Correct: $33.3\,\%$, $25\,\%$, $16.7\,\%$, $12.5\,\%$, $12.5\,\%$. [Show honestly](?mode=trick&trick=sum&honest=1)

</details>

## Ideas for the classroom

- **Use:** About grade 6 (percentages, data and charts): create, read and critically judge charts; shares as percentages and as central angles. Also possible in year 5 for reading column charts.
- **Your own data:** The class could collect its own favourite sports and enter the values with the sliders; the tally chart is created along the way.
- **Changing representations:** The morph from columns via the strip to the circle can show that all three charts contain the same data – only the strip and the circle show the share of the whole directly.
- **Detective mode:** May work well in pairs; the cases can also be linked individually (e.g. case 3). A follow-up idea is to design a "polished" chart yourselves and swap it with others.
- **Common stumbling blocks:**
  - The column height is taken as the value although the axis does not start at $0$.
  - In a pie chart the percentage is used directly as the angle ($25\,\%$ → $25°$) instead of $25\,\% \cdot 360° = 90°$.
  - In a pictogram, partly shown pictures are overlooked or counted as whole ones.
  - Line charts are also used for categories that have no order.
  - For temperatures, an axis that does not start at $0$ is often sensible – the zero point of the Celsius scale is arbitrary. Whether an axis misleads therefore depends on whether heights are read as ratios.
