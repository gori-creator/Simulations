---
description: "Interactive simulation for grades 6 and 7: base value, rate and percentage value on a percentage bar – with the rule of three step by step, a hundred square and a circle, discounts, price rises, VAT, interest, surveys and the classic pitfall when working backwards."
---

## What is it about?

Percent means **hundredths**: $1\,\% = \frac{1}{100}$, so $25\,\% = \frac{25}{100} = \frac14 = 0.25$. Every percentage problem has three quantities:

- the **base value** $G$ – the whole, it corresponds to $100\,\%$ (purple),
- the **rate** $p\,\%$ (orange),
- the **percentage value** $W$ – the part as a quantity, e.g. in euros (blue).

On the **percentage bar**, percentages are on top and values underneath. **Rule of three on the bar** (25 % of €80): split the bar into 100 equal parts, so $1\,\% \;\hat{=}\; €0.80$, and $25\,\% \;\hat{=}\; 25 \cdot €0.80 = €20$. To find the base value, go backwards: from the percentage value to $1\,\%$ and then to $100\,\%$.

$$
W = G \cdot \frac{p}{100}, \qquad p\,\% = \frac{W}{G}, \qquad G = W \cdot \frac{100}{p}
$$

With **20 % off** you pay $80\,\%$ of the old price ($G \cdot 0.8$); after a **20 % rise** it costs $120\,\%$ ($G \cdot 1.2$). German **VAT** is usually $19\,\%$, so the gross price is $119\,\%$ of the net price. **Pitfall:** if a bike costs €84 after a 20 % rise, then $€84 \;\hat{=}\; 120\,\%$, so it cost $€84 : 1.2 = €70$ before – not $€84 - 20\,\% = €67.20$.

## Try it

1. [Start](?G=80&p=25): press “Rule of three on the bar” and watch the hundred square.
2. Drag the orange handle or tap squares in the hundred square: which rates give one half or one quarter? [Three quarters as a circle](?p=75&rep=pie)
3. [Find the base value](?find=G&G=240&p=15): now the animation counts backwards.
4. [Above 100 %](?G=80&p=150): the percentage value is larger than the base value.
5. Everyday life: [discount](?sit=rabatt&G=60&p=20), [receipt](?sit=mwst&G=50&p=19), [savings](?sit=zins&G=1200&p=2.5), [survey](?sit=klasse&find=p&G=48&p=25), [pitfall](?sit=erh&find=G&G=70&p=20).

## Tasks

### Task 1: Discount

A jumper costs €60 with 20 % off. What does it cost now? [Load task](?sit=rabatt&G=60&p=20&show=0&_hide=1)

<details>
<summary>Show solution</summary>

You pay $80\,\%$: $€60 \cdot 0.8 = €48$ (discount €12). [Show](?sit=rabatt&G=60&p=20)

</details>

### Task 2: Interest

€1200 earn 2.5 % interest per year. How much interest after one year? [Load task](?sit=zins&G=1200&p=2.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1\,\% \;\hat{=}\; €12$, so $2.5\,\% \;\hat{=}\; €30$; the balance is then €1230. [Show](?sit=zins&G=1200&p=2.5)

</details>

### Task 3: Working backwards

After a 20 % rise a bike costs €84. What did it cost before? [Load task](?sit=erh&find=G&G=70&p=20&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$€84 \;\hat{=}\; 120\,\%$, $1\,\% \;\hat{=}\; €0.70$, $100\,\% \;\hat{=}\; €70$. Taking 20 % off €84 (€67.20) is wrong. And +20 % followed by −20 % gives $1.2 \cdot 0.8 = 0.96$, i.e. 4 % less than at the start. [Show](?sit=erh&find=G&G=70&p=20)

</details>

## Ideas for the classroom

- With “Show the solution” switched off (`show=0`), the unknown appears as “?” – estimate on the bar first, then calculate and check with the animation. “New task” creates practice problems with friendly numbers.
- Bar, hundred square and circle show the same share: a bridge from $\frac34$ via $0.75$ to $75\,\%$.
- **Common stumbling blocks:** mixing up base value and percentage value; confusing the discount with the new price; subtracting the rate from the new value when working backwards; thinking that +20 % and −20 % cancel out; believing rates above 100 % are impossible.
