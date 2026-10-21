---
description: Interactive place value chart with counters – regroup, read and write large numbers in groups of three and round to any place on a number line with a magnifier.
---

## What is it about?

In the **base-ten system** we write every number with the ten digits $0$ to $9$. The **value** of a digit depends on its **place**: in $4{,}253{,}718$ the $5$ stands for five **ten thousands**, that is $50{,}000$.

The reason is **regrouping**: $10$ ones make a ten, $10$ tens make a hundred, $10$ hundreds make a thousand, and so on. So every place is worth **ten times** as much as the place to its right. In the place value chart the places are arranged in **groups of three** – ones, thousands, millions, billions:

$$
1{,}000 \text{ thousands} = 1 \text{ million} = 1{,}000{,}000, \qquad 1{,}000 \text{ millions} = 1 \text{ billion}
$$

**Reading large numbers:** split the digits into groups of three from the right and read each group with its name:

$$
4{,}253{,}718 = 4 \cdot 1{,}000{,}000 + 2 \cdot 100{,}000 + 5 \cdot 10{,}000 + 3 \cdot 1{,}000 + 7 \cdot 100 + 1 \cdot 10 + 8
$$

In words: *four million two hundred and fifty-three thousand seven hundred and eighteen*.

**Rounding:** find the **rounding place** and look at the digit **to its right**:

- $0, 1, 2, 3, 4$: **round down** – the digit in the rounding place stays the same.
- $5, 6, 7, 8, 9$: **round up** – the digit in the rounding place goes up by $1$.

All digits to the right of the rounding place become $0$. We write $\approx$ (“approximately equal to”): to the nearest thousand, $4{,}253{,}718 \approx 4{,}254{,}000$. The number line shows why: the rounded number is the **nearer of the two neighbouring numbers**. A number exactly halfway is rounded up by convention.

## Try it

1. Load the number [999,999](?n=999999&r=5) and tap **+** in the **O** (ones) column. Watch how ten counters are regrouped into one counter of the next place – again and again.
2. Load [1,000](?n=1000&r=1) and tap **−** in the ones column. Where does the counter come from when the ones column is empty?
3. Press **× 10** and **÷ 10**. What happens to the digits in the place value chart?
4. Slowly drag the pin with the number on the lower number line across the halfway mark. When does the rounding arc switch sides? Which digit is under the pin then?
5. Tap different column headings of the place value chart. How does the section in the magnifier change?
6. The number is [exactly halfway](?n=4253500&r=3) – what does the rounding rule do?
7. Round [2,996,481 to the nearest ten thousand](?n=2996481&r=4). Why do several digits change at once when rounding up?

## Tasks

### Task 1: Number in words

[Load task](?n=30408015&words=0&_hide=1) Write the number in words. Watch out for the zeros!

<details>
<summary>Show solution</summary>

$30{,}408{,}015$: thirty million four hundred and eight thousand and fifteen. The zeros are not spoken, but they show that there are no hundred thousands and no hundreds.

</details>

### Task 2: Value of a digit

What is the value of the digit $7$ in $4{,}753{,}218$, and in $7{,}000{,}000{,}000$? [Load number](?n=4753218&r=5)

<details>
<summary>Show solution</summary>

In $4{,}753{,}218$ the $7$ is in the hundred thousands place: $7 \cdot 100{,}000 = 700{,}000$. In $7{,}000{,}000{,}000$ it is in the billions place and means seven billion. Tap the digit card in the simulation to show its value.

</details>

### Task 3: Rounding to different places

[Load task](?n=6849513&r=3&show=0&_hide=1) Round $6{,}849{,}513$ to the nearest thousand, ten thousand and million. Check with “Round”.

<details>
<summary>Show solution</summary>

- Thousand: the hundreds digit is $5$, so round up: $6{,}849{,}513 \approx 6{,}850{,}000$ (the $9$ thousands become $10$, so there is a carry).
- Ten thousand: the thousands digit is $9$: $6{,}849{,}513 \approx 6{,}850{,}000$.
- Million: the hundred thousands digit is $8$: $6{,}849{,}513 \approx 7{,}000{,}000$.

</details>

### Task 4: Regrouping

How many hundreds make a million? How many thousands make a billion?

<details>
<summary>Show solution</summary>

$1{,}000{,}000 \div 100 = 10{,}000$, so $10{,}000$ hundreds. A billion is $1{,}000{,}000{,}000 \div 1{,}000 = 1{,}000{,}000$ thousands – a million thousands.

</details>

### Task 5: Thinking backwards

A whole number rounded to the nearest hundred is $3{,}500$. What is the smallest and what is the largest number this is true for?

<details>
<summary>Show solution</summary>

The smallest is $3{,}450$, the largest $3{,}549$. All numbers from $3{,}450$ to $3{,}549$ are nearer to $3{,}500$ than to $3{,}400$ or $3{,}600$ ($3{,}450$ is exactly halfway, and then we round up). [Check with the pin](?n=3450&r=2)

</details>

### Task 6: Rounding in steps?

Mia rounds $71{,}499$ first to the nearest hundred and then the result to the nearest thousand. Tom rounds $71{,}499$ directly to the nearest thousand. Compare.

<details>
<summary>Show solution</summary>

Mia: $71{,}499 \approx 71{,}500$, then $71{,}500 \approx 72{,}000$. Tom: $71{,}499 \approx 71{,}000$, because the hundreds digit is $4$. Tom is right: $71{,}499$ is nearer to $71{,}000$ than to $72{,}000$. You must **always round the original number**. [Directly to the nearest thousand](?n=71499&r=3)

</details>

## Ideas for the classroom

- **Use:** Bavarian Gymnasium, year 5, learning area 1.1 (large numbers, the base-ten place value system, number line, rounding). The place value chart with counters builds on the representation used in primary school.
- **Controls:** **+** and **−** add or remove one counter in a column. When a tenth counter is added, the counters are regrouped automatically; when a column is empty, a counter from the left is exchanged – both are animated and named (“10 O = 1 T”). Tapping a column heading sets the rounding place, tapping a digit card shows its value. The pin on the number line can be dragged.
- **Number line with magnifier:** at the top, the section of the next higher place is divided into ten parts; below, the part between the two neighbouring numbers is magnified. The digits $0$ to $9$ under the parts show that the deciding digit tells you in which tenth of the interval the number lies. This way the rounding rule is justified by the position on the number line.
- **Task mode:** turn off “Show the rounded number right away” (`show=0`): the result only appears after “Round”. The number in words can be hidden (`words=0`).
- **Common pitfalls:**
  - Rounding in steps (Task 6).
  - Places are “cut off” when rounding: $8{,}492$ rounded to the nearest hundred is $8{,}500$, not $85$.
  - Zeros in the middle are forgotten when writing numbers ($30{,}408{,}015$).
  - The English *billion* is the German *Milliarde* ($10^9$); the German *Billion* is $10^{12}$.
- **Number words:** the simulation uses British English with “and” (*one hundred and five*).
