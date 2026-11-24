## What is it about?

In **exponential growth**, a quantity changes by the **same factor** $b$ in equal time steps:

$$
f(t) = a \cdot b^t \qquad b = 1 + \frac{p}{100}
$$

- $a$ is the **initial value**, $b$ the **growth factor**, $p$ the percentage change per time step.
- For $b > 1$, $f$ grows; for $0 < b < 1$, $f$ decreases (**exponential decay**, e.g. radioactive decay).
- For a decrease, $p$ is negative: a decrease of $8\,\%$ means $p = -8$ and $b = 1 - 0.08 = 0.92$. So the growth factor is not $0.08$.

In **linear growth**, on the other hand, the **same amount** is added in each time step. At first both look similar – in the long run, however, the exponential function grows much faster.

The **doubling time** (or **half-life**) is always the same in exponential growth. From $b^{T_d} = 2$ or $b^{T_{1/2}} = 0.5$ the logarithm gives:

$$
T_d = \log_b 2 = \frac{\lg 2}{\lg b} \qquad T_{1/2} = \log_b 0.5 = \frac{\lg 0.5}{\lg b}
$$

Instead of $\lg$ you can use any logarithm, e.g. $\ln$. The simulation shows the value rounded to two decimal places (“≈”). Only when it is exact does it show “=” (e.g. $T_d = 1$ day for $p = 100$).

### A function from measurements

Real measurements never lie exactly on a curve. A sign of exponential growth: the **ratios** of successive values (at equal time intervals) are roughly equal – not the differences. From two data points $(t_1, v_1)$ and $(t_2, v_2)$ you get a matching exponential function:

$$
b = \left(\frac{v_2}{v_1}\right)^{\frac{1}{t_2 - t_1}} \qquad a = \frac{v_1}{b^{t_1}}
$$

Using the first and the last data point keeps the effect of small measurement errors smallest.

## Try it

1. Start the water lilies with “Play”. The pond is full after 10 days. When was it half full?
2. Compare compound interest with linear growth (simple interest). [5 % interest](?scenario=zinsen&a=1000&p=5&span=40&linear=1)
3. Watch the individual nuclei in radioactive decay. Do they decay evenly? [Iodine-131](?scenario=zerfall&a=1000&p=-8&span=40) With $p = -8$ you get $T_{1/2} \approx 8.31$ days – close to the real value of just over 8 days.
4. Switch on the logarithmic y-axis. What happens to the graph? [Logarithmic](?scenario=zinsen&a=1000&p=5&span=60&log=1)
5. **Fitting measurements:** set $a$ and $p$ so that the graph passes through the data points. Below the picture you can see how well the function fits. “Calculate from two points” uses the first and the last point. [Bacteria](?scenario=daten&ds=bakterien&a=100&p=10) · [Tea](?scenario=daten&ds=tee&a=100&p=10) · [Medicine](?scenario=daten&ds=medikament&a=100&p=10)
6. **Practice:** calculate a function value, the percentage change or the doubling time or half-life, enter it and have it checked. [Practice](?scenario=ueben&q=1)

## Exercises

### Exercise 1: The water lily puzzle

The water lilies double their area every day. After 10 days the pond is completely covered. After how many days was it half covered?

<details>
<summary>Show solution</summary>

After **9 days** – on the last day the area doubles from half to full. Many people guess 5 days at first; that is exactly what makes exponential growth so hard to imagine. [Show in the simulation](?scenario=seerosen)

</details>

### Exercise 2: Compound interest

$1000\,€$ is invested at $5\,\%$ interest, with the interest added every year. How much is in the account after 10 years? When has it doubled?

<details>
<summary>Show solution</summary>

$f(10) = 1000 \cdot 1.05^{10} \approx 1628.89\,€$. Doubling time: $T_d = \frac{\ln 2}{\ln 1.05} \approx 14.2$ years. Without compound interest it would only be $1500\,€$ after 10 years. [Show in the simulation](?scenario=zinsen&a=1000&p=5&span=40&linear=1)

</details>

### Exercise 3: Half-life

Iodine-131 has a half-life of about 8 days. What fraction is still there after 24 days? What is the daily decrease in percent?

<details>
<summary>Show solution</summary>

24 days are 3 half-lives: $\left(\frac{1}{2}\right)^3 = \frac{1}{8} = 12.5\,\%$. Daily factor: $b = 0.5^{1/8} \approx 0.917$, so a decrease of about $8.3\,\%$ per day.

</details>

### Exercise 4: Rule of thumb

For small percentages there is a rule of thumb: doubling time $\approx \frac{70}{p}$. Check it for $p = 2$, $p = 5$ and $p = 10$.

<details>
<summary>Show solution</summary>

Exact: $\frac{\ln 2}{\ln 1.02} \approx 35.0$, $\frac{\ln 2}{\ln 1.05} \approx 14.2$, $\frac{\ln 2}{\ln 1.1} \approx 7.3$. The rule of thumb gives $35$, $14$ and $7$ – very good for small $p$.

</details>

### Exercise 5: Medicine in the blood

After taking a medicine there are $400\,\text{mg}$ of the active substance in the blood, after $10$ hours still $79\,\text{mg}$. Find an exponential function that fits. What percentage is broken down per hour, and what is the half-life? [See the measurements](?scenario=daten&ds=medikament&a=100&p=10)

<details>
<summary>Show solution</summary>

$b = \left(\frac{79}{400}\right)^{\frac{1}{10}} \approx 0.850$, so $f(t) = 400 \cdot 0.85^t$. About $15\,\%$ is broken down per hour. Half-life: $T_{1/2} = \frac{\lg 0.5}{\lg 0.85} \approx 4.27$ hours. [Show in the simulation](?scenario=daten&ds=medikament&a=400&p=-15)

</details>

### Exercise 6: Linear or exponential?

For the cooling tea, measurements were taken every 5 minutes: $70$, $57.5$, $46.2$, $38.3$ (degrees above room temperature). Use differences and ratios to check which model fits better.

<details>
<summary>Show solution</summary>

Differences: $-12.5$, $-11.3$, $-7.9$ – not equal. Ratios: $0.82$, $0.80$, $0.83$ – roughly equal. Exponential decrease fits better, about $18\,\%$ per 5 minutes. [See the measurements](?scenario=daten&ds=tee&a=70&p=-4)

</details>

## Ideas for the classroom

- **Use:** About grade 10 (exponential functions, exponential growth, logarithm).
- **Decay:** Each of the 400 nuclei decays at a random time; on average the number follows the exponential function. This shows that decay is a random process.
- **Logarithmic axis:** Exponential functions appear as straight lines – a good preparation for the logarithm.
- **Modelling:** the data sets are invented example data with small fluctuations. Well suited for comparing fitting by eye with the calculation from two points.
- **Practice:** the tasks are numbered. The same number means the same task. Odd numbers ask for a function value, even ones alternately for the percentage change and the doubling time or half-life (which needs the logarithm).
- **Common pitfalls:**
  - Exponential growth is extrapolated like linear growth (water lily puzzle).
  - “After two half-lives everything has decayed.” In fact a quarter is still left.
  - Percentage and growth factor are mixed up: for an $8\,\%$ decrease, $b = 0.92$, not $0.08$ or $1.08$. The “Growth factor” readout shows both side by side.
- **Table of values:** In the example “Free” a table of values replaces the picture. Have students compare the factors “· b” between the rows with the differences in linear growth.
