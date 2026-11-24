---
description: "Read a ruler, edit measurements, compare scatter and uncertainty, and explore best-fit lines and systematic offsets."
---

## What is it about?

A measured value consists of **a number and a unit**. A ruler with a millimetre scale shows a length with a different precision than a coarse centimetre scale. The magnifier enlarges the ideal scale; it does not create any additional information.

When the same measurement is repeated, the values scatter. The **arithmetic mean** $\bar x$ summarises them. The **empirical standard deviation** $s$ describes the scatter of the individual values. For independent repetitions under the same conditions, $u_A$ estimates the **statistical standard uncertainty of the mean**:

$$
\bar x=\frac{1}{n}\sum_{i=1}^n x_i,\qquad s=\sqrt{\frac{\sum_{i=1}^n(x_i-\bar x)^2}{n-1}},\qquad u_A=\frac{s}{\sqrt n}.
$$

$s$ and $u_A$ have the same unit as the measured values, here cm. With only one value, $s$ and $u_A$ cannot be determined. Identical readings give $s=0$ but do not prove a perfect measurement: resolution and common systematic offsets may remain.

When rounding to the scale division $d$, the pure rounding deviation lies between $-d/2$ and $+d/2$. Assuming a uniform distribution gives $u_B=d/\sqrt{12}$. The simplified budget $u_c=\sqrt{u_A^2+u_B^2}$ assumes independent contributions. If the resolution is already fully contained in the scatter, it must not be counted twice. Calibration and other influences are not covered here.

**A standard uncertainty is not a guaranteed error limit.** For normally distributed measurements without an offset, in the long run about 68% of the means lie within a range of $\pm\sigma/\sqrt n$ around the true value, if $\sigma$ is known. The fourth view simulates 40 independent experiments with the reference $10\,\text{cm}$. An offset shifts all results and does not disappear with more measurements.

The **best-fit line** $y=a\,t+b$ describes a motion. The times $t_i=i\,\Delta t$ are taken as exact here; all position values have equal, independent uncertainties. The method of least squares minimises $\sum r_i^2$ with $r_i=y_i-(a\,t_i+b)$. The slope $a$ is the velocity in cm/s, $b$ the initial position in cm. Two points fix a line but do not allow the remaining scatter to be estimated. With equal times there is no unique slope.

## Try it

1. Drag the red pointer on the ruler to the end of the object. Compare the centimetre and millimetre scales. [Ruler](?mode=measure&length=10.37&cursor=10.4)
2. Change one point of the series. Compare the wide violet zone $\bar x\pm s$ with the narrower green zone $\bar x\pm u_A$. [Five measurements](?mode=series)
3. Switch on **Scatter step by step**. “Next calculation step” adds one squared deviation at a time. Playing continues the steps automatically. [Calculation](?steps=1)
4. Generate more example measurements. **Systematic offset** and **Random scatter σ** only affect new data; existing measurements do not change. The experiment number makes the example reproducible.
5. In the third view, fit a line yourself. Try to reduce the sum of squares, then compare with the best-fit line. [Your own line](?mode=fit&data=1.1%3B2.8%3B5.2%3B6.9%3B9&manual=1)
6. In the fourth view, increase $n$ from 1 to 100. Then compare an offset of 1 cm with no offset. [40 experiments](?mode=repeat&noise=1&repn=25)
7. Vernier caliper: drag the slider and look in the magnifier for the vernier mark that lines up exactly with a millimetre mark. Also try the 1/20 vernier. [Caliper](?mode=caliper&jaw=23.4&nonius=0.1) · [Practise](?mode=caliper&jaw=37.6&nonius=0.1&quiz=1)
8. Gravitational acceleration from the pendulum: which measurement do you have to improve – the length or the time? Halve both uncertainties one after the other. [Pendulum](?mode=propagate&formula=pendulum&x1=1&u1=0.005&x2=2.006&u2=0.01)
9. Time the pendulum yourself – once over one and once over ten oscillations. How much do your values scatter? [Timing](?mode=stopwatch&periods=1)

## Exercises

### Exercise 1: Five length measurements

The measured values are $9.8;10.1;9.9;10.2;10.0\,\text{cm}$. Calculate the mean, $s$ and $u_A$. [Load exercise](?mode=series&show=0&_hide=1)

<details>
<summary>Show solution</summary>

The sum is 50 cm, so $\bar x=10.0\,\text{cm}$. The squared deviations give $0.04+0.01+0.01+0.04+0=0.10\,\text{cm}^2$. Hence $s=\sqrt{0.10/4}\approx0.1581\,\text{cm}$ and $u_A=s/\sqrt5\approx0.07071\,\text{cm}$. [Recalculate](?steps=1&step=5)

</details>

### Exercise 2: What does measuring more often achieve?

The known scatter of a single measurement is $\sigma=1\,\text{cm}$. Compare the standard uncertainty of the means of 25 and 100 independent measurements. [Load exercise](?mode=repeat&noise=1&repn=25&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1/\sqrt{25}=0.2\,\text{cm}$ and $1/\sqrt{100}=0.1\,\text{cm}$. Four times as many measurements halve the statistical uncertainty. A constant offset of 1 cm remains 1 cm in both cases. [Compare](?mode=repeat&noise=1&repn=100&offset=1)

</details>

### Exercise 3: Millimetre scale

An idealised ruler has the scale division $d=0.1\,\text{cm}$. How large are the rounding range and the standard uncertainty of the resolution?

<details>
<summary>Show solution</summary>

The pure rounding range is $\pm0.05\,\text{cm}$. With a uniform distribution, $u_B=0.1/\sqrt{12}\approx0.02887\,\text{cm}$. Together with $u_A\approx0.07071\,\text{cm}$ from exercise 1, the simplified independent budget would give $u_c\approx0.07638\,\text{cm}$. [Show](?res=0.1)

</details>

### Exercise 4: Analysing a motion

At $t=0;1;2\,\text{s}$ the positions are $y=1;2;4\,\text{cm}$. Find the best-fit line. [Load exercise](?mode=fit&data=1%3B2%3B4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\bar t=1\,\text{s}$, $\bar y=7/3\,\text{cm}$, $\sum(t_i-\bar t)^2=2\,\text{s}^2$ and $\sum(t_i-\bar t)(y_i-\bar y)=3\,\text{cm}\,\text{s}$. Therefore $a=1.5\,\text{cm/s}$, $b=5/6\,\text{cm}$. The residuals are $1/6;-1/3;1/6\,\text{cm}$; their sum of squares is $1/6\,\text{cm}^2$. [Show](?mode=fit&data=1%3B2%3B4)

</details>

### Exercise 5: Reading a vernier caliper

The zero mark of the 1/10 vernier lies between 23 mm and 24 mm, and vernier mark 4 lines up exactly with a mark on the main scale. How long is the object?

<details>
<summary>Show solution</summary>

$23\,\text{mm} + 4 \cdot 0.1\,\text{mm} = 23.4\,\text{mm}$. Vernier mark 4 lies at $23.4\,\text{mm} + 4 \cdot 0.9\,\text{mm} = 27.0\,\text{mm}$, i.e. exactly on a millimetre mark. [Show in the simulation](?mode=caliper&jaw=23.4&nonius=0.1)

</details>

### Exercise 6: Gravitational acceleration with uncertainty

A simple pendulum is $l = (1.000 \pm 0.005)\,\text{m}$ long and has the period $T = (2.006 \pm 0.010)\,\text{s}$. Calculate $g = 4\pi^2 l / T^2$ with its uncertainty.

<details>
<summary>Show solution</summary>

$g = 4\pi^2 \cdot 1.000 / 2.006^2 \approx 9.811\,\text{m/s}^2$. Relative uncertainties: $0.005/1.000 = 0.5\%$ for $l$ and $2 \cdot 0.010/2.006 \approx 1.0\%$ for $T$ (the square counts twice). By Gaussian propagation: $\sqrt{0.5^2 + 1.0^2}\,\% \approx 1.12\%$, so $u(g) \approx 0.11\,\text{m/s}^2$ and $g = (9.81 \pm 0.11)\,\text{m/s}^2$. Improving the time measurement helps most. [Show in the simulation](?mode=propagate&formula=pendulum&x1=1&u1=0.005&x2=2.006&u2=0.01)

</details>

## Ideas for the classroom

- **Use:** from grade 5/6, number, unit and reading off are suitable; mean and scatter fit lower secondary, standard uncertainty and regression upper secondary and lab courses. Where exactly it fits depends on the curriculum.
- **Model:** units are cm and s ($1\,\text{cm}=0.01\,\text{m}$). The data list takes at most 20 values from −100 to 100 cm; negative positions are possible. Generated lists are simulated normal values rounded to 0.001 cm and cut off at the input limits. The fourth view uses unrounded, untruncated normal values with known scatter. None of the views replaces checking a real measuring procedure.
- **Regression:** the adjustable error bars show $\pm u(y)$; with equal uncertainties their common size does not affect the unweighted line. The green band shows one standard uncertainty of the estimated line from the remaining scatter – not a prediction interval and not a 95% confidence band. The uncertainties of slope and intercept also come from the remaining scatter. $R^2$ is not defined for constant position values.
- **Common pitfalls:** $s$ describes individual values, $s/\sqrt n$ their mean. Systematic offsets do not get smaller with repetition. An unusual measurement must not be deleted without a good reason; the simulation makes its influence visible. For small samples, the estimated uncertainty is itself uncertain.
