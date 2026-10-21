---
description: Interactive simulation of the empirical law of large numbers – toss a coin, a die or a drawing pin thousands of times and watch the relative frequency.
---

## What is it about?

If you throw a die $n$ times and get a six $k$ times, then

- $k$ is the **absolute frequency** and
- $h_n = \dfrac{k}{n}$ is the **relative frequency** of the six.

Example: $17$ sixes in $100$ throws give $h_{100} = \dfrac{17}{100} = 0.17 = 17\,\%$.

With few throws $h_n$ varies a lot. The more often you throw, the more the relative frequency **settles** – close to the **probability** $p$ (coin: $p = 0.5$, die: $p = \frac{1}{6} \approx 0.167$). This is called the **empirical law of large numbers**.

There is no guarantee, though: usually $h_n$ gets closer to $p$ with more throws, but not always. Even after many throws $h_n$ can move a little further away again – large deviations just become less and less likely.

Conversely, this is used to **estimate** unknown probabilities: for a drawing pin you cannot calculate $p$ for "point up" – but after very many throws $h_n$ is a good estimate of $p$.

**Important:** Chance does not "even out". A die has no memory – after five throws without a six, a six is not more likely on the next throw. The relative frequency approaches $p$ because early outliers are spread over more and more throws.

### The funnel

The green funnel shows the range $p \pm 1.96 \cdot \sqrt{\dfrac{p(1-p)}{n}}$. After $n$ throws, the relative frequency lies inside it in about 95 % of all runs. It gets narrower as $n$ grows – four times as many throws make it half as wide.

## Try it

1. Throw the die one at a time and watch how much the curve jumps at first. Why is that?
2. Throw 1000 times or press **Play**. Where does the curve settle?
3. Compare with the coin: does the curve become "calm" faster? [Coin](?exp=coin)
4. Estimate the drawing pin's probability without showing it first. [Drawing pin](?exp=tack&showP=0)
5. Switch off the logarithmic axis. What can you see better, what worse? [Linear axis](?logScale=0)

## Exercises

### Exercise 1: Expectation

About how many sixes do you expect when you throw a die $600$ times? Is it suspicious if there are only $92$ sixes?

<details>
<summary>Show solution</summary>

You expect about $600 \cdot \frac{1}{6} = 100$ sixes. $92$ sixes are **not** suspicious: that is a relative frequency of about $0.153$. At $n = 600$ the funnel ranges from about $0.137$ to $0.196$ – so $0.153$ lies within the usual range of variation.

</details>

### Exercise 2: Estimating the drawing pin

Throw the drawing pin 1000 times without showing the probability. Give an estimate for $p$ ("point up") and then compare it with the set value (switch on "Show probability p" for this). [Load exercise](?exp=tack&showP=0&pTack=0.6&_hide=1)

<details>
<summary>Show solution</summary>

The estimate is the relative frequency after 1000 throws. The set value is $p = 0.6$; after 1000 throws $h$ usually lies between about $0.57$ and $0.63$.

</details>

### Exercise 3: Does the die have a memory?

Lena says: "I haven't thrown a six five times in a row, so one must come soon!" Comment on this.

<details>
<summary>Show solution</summary>

Lena is wrong (this is the so-called **gambler's fallacy**). The throws are independent – the probability of a six is $\frac{1}{6}$ on every throw, no matter what happened before. The relative frequency approaches $p$ not because things even out, but because earlier deviations hardly matter when $n$ is large.

</details>

### Exercise 4: Absolute and relative deviation

With many throws, watch the deviation of the count $|k - n \cdot p|$ and the deviation of the relative frequency $|h_n - p|$. Both are shown under **Results**. What do you notice?

<details>
<summary>Show solution</summary>

The deviation $|h_n - p|$ typically keeps getting smaller. The deviation of the count $|k - n \cdot p|$, however, typically even grows (roughly like $\sqrt{n}$). So the law of large numbers does not say that the counts "even out".

</details>

## Ideas for the classroom

- **Use:** Bavaria grade 8 (Laplace experiments: relative frequency and the empirical law of large numbers); in other German states partly from grade 6. The drawing pin is the classic example of a probability that can only be determined by experiment.
- **Images:** Die, coin, drawing pin and table are shown as photos; if an image is missing, the simulation draws a replacement graphic.
- **Common stumbling blocks:**
  - Gambler's fallacy ("now the six is due").
  - "600 throws give exactly 100 sixes."
  - The probability is equated with the relative frequency of a short series of trials.
- **Funnel:** The limits are based on the normal approximation and are only rough for small $n$ – in lower secondary school the interpretation "almost all runs lie inside" is enough.
