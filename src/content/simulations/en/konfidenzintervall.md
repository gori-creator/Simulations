---
description: "Prediction and confidence intervals: draw many samples and see how often the intervals hit the true p – with the prediction interval, the confidence ellipse and the required sample size."
---

## What is it about?

**Prediction interval (p known):** if you toss a fair coin $n = 100$ times, the relative frequency $h$ of tails varies around $p = 0.5$. With the standard deviation $\sigma = \sqrt{p(1-p)/n} = 0.05$, $h$ lies in the interval

$$
[\,p - 1.96\,\sigma;\; p + 1.96\,\sigma\,] = [0.402;\; 0.598]
$$

with a probability of about 95%.

**Confidence interval (p unknown):** usually it is the other way round: a poll gives $h$, and $p$ is wanted. For $n = 100$ and $h = 0.4$ the approximation gives

$$
h \pm 1.96\sqrt{\frac{h(1-h)}{n}} = 0.4 \pm 0.096 = [0.304;\; 0.496].
$$

Important: the **interval** is random, not $p$. “95%” means: if you draw very many samples and calculate such an interval each time, about 95% of these intervals hit the true $p$. That is exactly what the simulation shows – green intervals hit, red ones miss.

| Confidence level $\gamma$ | 90% | 95% | 99% |
| --- | --- | --- | --- |
| $z$ | 1.64 | 1.96 | 2.58 |

**Confidence ellipse:** all pairs $(p, h)$ with $|h - p| \le z\sqrt{p(1-p)/n}$ form an ellipse in the $p$-$h$ diagram. Vertically at $p$ you read off the prediction interval, horizontally at $h$ the confidence interval – without the approximation $\sigma \approx \sqrt{h(1-h)/n}$.

**Sample size:** for the interval to be at most $\pm\varepsilon$ wide, you need $n \ge z^2\,p(1-p)/\varepsilon^2$. Without prior knowledge you set $p = 0.5$: for $\pm 3\%$ at 95% that is $n \ge 1068$ respondents.

## Try it

1. Draw 100 samples. How many intervals miss $p$? Repeat a few times. [Load](?mode=conf&p=0.4&n=100&level=95&method=wald)
2. Switch to 99%. What happens to the width and to the hit rate?
3. Hide $p$ and estimate it from the intervals. [p hidden](?mode=conf&p=0.37&n=200&level=95&show=0)
4. Small $p$, small $n$: why does the approximation hit much less often than 95%? Compare with “Exactly via the confidence ellipse”. [Load](?mode=conf&p=0.05&n=30&level=95&method=wald)
5. Drag $h$ and $p$ in the confidence ellipse. When does the point $(p, h)$ lie inside the ellipse? [Ellipse](?mode=ellipse&n=100&h=0.4&p=0.5&level=95&method=wilson)
6. Hypothesis test: is a coin biased if it lands heads 60 times in 100 tosses? [Test](?mode=test&n=100&p0=0.5&side=right&alpha=5&kobs=60&p=0.6)
7. Set the rejection region yourself. What happens to α and β? [Own rule](?mode=test&n=100&p0=0.5&side=right&alpha=5&kobs=60&p=0.6&own=1&kc=56)
8. How often do 95% intervals really hit for n = 30? [Coverage](?mode=cover&n=30&level=95&p=0.1)
9. Practise with calculations on intervals and tests. [Practice](?mode=ex&q=1)

## Exercises

### Exercise 1: Prediction interval

A coin is tossed 400 times. In what range does the number of tails lie with a probability of about 95%?

<details>
<summary>Show solution</summary>

$\mu = 200$, $\sigma = \sqrt{400 \cdot 0.25} = 10$, so $200 \pm 19.6$: between 181 and 219. [Show in the simulation](?mode=prog&p=0.5&n=400&level=95)

</details>

### Exercise 2: Confidence interval

In a poll of 100 people, 40 are in favour. Find the 95% confidence interval.

<details>
<summary>Show solution</summary>

Approximation: $[0.304;\; 0.496]$. Via the confidence ellipse: $[0.309;\; 0.498]$. [Show in the simulation](?mode=ellipse&n=100&h=0.4&p=0.4&level=95&method=wilson)

</details>

### Exercise 3: Sample size

How many people do you have to ask so that the 95% interval is at most $\pm 5\%$ wide?

<details>
<summary>Show solution</summary>

$n \ge (1.96 / 0.1)^2 = 384.2$, so at least 385 people. [Show in the simulation](?mode=size&eps=0.05&level=95)

</details>

### Exercise 4: A biased coin?

A coin is tossed 100 times. You test $H_0$: $p = 0.5$ against $H_1$: $p > 0.5$ with $\alpha = 5\%$. Find the rejection region. How large is the type II error if in reality $p = 0.6$?

<details>
<summary>Show solution</summary>

$P(X \ge 59) \approx 4.4\%$, but $P(X \ge 58) \approx 6.7\%$. So $H_0$ is rejected from 59 heads on. For $p = 0.6$, $P(X \le 58) \approx 37.7\%$: that is how often you wrongly stay with $H_0$. [Show in the simulation](?mode=test&n=100&p0=0.5&side=right&alpha=5&kobs=60&p=0.6)

</details>

## Ideas for the classroom

- **Use:** the switch “from $p$ to $h$” (prediction) and “from $h$ to $p$” (confidence) becomes visible on the same ellipse.
- **Common misconceptions:**
  - “$p$ lies in the interval with a probability of 95%” – $p$ is fixed; the interval varies.
  - Twice the accuracy needs not twice but four times as many respondents.
  - The approximation with $h$ instead of $p$ is unreliable for small $n$ or for $p$ close to 0 or 1 (Laplace condition $\sigma > 3$).
- **Curriculum link:** whether the approximation or the confidence ellipse is used, and which $z$ values are usual, differs – please check your own curriculum.
