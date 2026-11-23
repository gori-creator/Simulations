---
description: "Read a ruler, edit measurements, compare scatter and uncertainty, and explore best-fit lines and systematic offsets."
---

## What is it about?

A measurement has a number and a unit. Repeating the measurement of one length produces a **mean** $\bar x$ and a **sample standard deviation** $s$. For independent repetitions, the estimated standard uncertainty of the mean is $u_A=s/\sqrt n$.

$$
\bar x=\frac{\sum x_i}{n},\qquad s=\sqrt{\frac{\sum(x_i-\bar x)^2}{n-1}}.
$$

One reading cannot determine $s$. Identical readings give $s=0$, but resolution and systematic offsets may remain. A division $d$ gives a rounding interval of $\pm d/2$. Uniform rounding error has standard uncertainty $u_B=d/\sqrt{12}$. The simplified budget $u_c=\sqrt{u_A^2+u_B^2}$ assumes independent contributions: do not count resolution twice if it is already fully represented by the scatter.

Standard uncertainty is **not a guaranteed error bound**. View 4 simulates 40 independent experiments around a 10 cm reference using known normal scatter $\sigma$. About 68% coverage within $\pm\sigma/\sqrt n$ is a long-run expectation for unbiased normal data, not a promise for these 40 trials. More readings do not remove a systematic offset.

The best-fit line $y=at+b$ minimises the sum of squared residuals. Times are exact and all positions have equal independent uncertainties. The slope is velocity in cm/s and the intercept is initial position in cm. Two points define a line but cannot estimate residual scatter; identical times cannot determine a slope.

## Try it

1. Drag the pointer to the object's end and compare coarse and fine scales. [Ruler](?mode=measure&length=10.37&cursor=10.4)
2. Drag a point and compare the purple $\bar x\pm s$ zone and the green $\bar x\pm u_A$ zone. [Steps](?steps=1)
3. Adjust a line yourself and reduce its squared residuals. [Fit](?mode=fit&data=1.1%3B2.8%3B5.2%3B6.9%3B9&manual=1)
4. Compare 25 and 100 readings per experiment, with and without an offset. [Repeat](?mode=repeat&noise=1&repn=25)
5. Vernier caliper: find the vernier line that meets a millimetre line. [Caliper](?mode=caliper&jaw=23.4&nonius=0.1)
6. Gravity from a pendulum: which measurement should you improve? [Pendulum](?mode=propagate&formula=pendulum&x1=1&u1=0.005&x2=2.006&u2=0.01)
7. Time the pendulum yourself over one and over ten oscillations. [Timing](?mode=stopwatch&periods=1)

## Tasks

### Five readings

Find the mean, sample standard deviation and uncertainty of the mean of 9.8, 10.1, 9.9, 10.2 and 10.0 cm. [Load task](?show=0&_hide=1)

<details>
<summary>Show solution</summary>

The mean is 10 cm. Squared deviations sum to 0.10 cm², giving $s=\sqrt{0.10/4}\approx0.1581$ cm and $u_A=s/\sqrt5\approx0.07071$ cm.

</details>

### More measurements

For known scatter $\sigma=1$ cm, compare 25 and 100 independent readings.

<details>
<summary>Show solution</summary>

$\sigma/\sqrt{25}=0.2$ cm, whereas $\sigma/\sqrt{100}=0.1$ cm. Four times as many readings halve this statistical uncertainty. A systematic offset remains unchanged.

</details>

### Fit a line

Fit positions 1, 2 and 4 cm at times 0, 1 and 2 s. [Load task](?mode=fit&data=1%3B2%3B4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

The slope is $a=1.5$ cm/s and the intercept $b=5/6$ cm. Residuals are $1/6,-1/3,1/6$ cm; their squared sum is $1/6$ cm².

</details>

### Gravity with uncertainty

$l = (1.000 \pm 0.005)\,\text{m}$, $T = (2.006 \pm 0.010)\,\text{s}$. What is $g = 4\pi^2 l/T^2$?

<details>
<summary>Show solution</summary>

$g \approx 9.81\,\text{m/s}^2$; relative uncertainty $\sqrt{0.5^2 + 1.0^2}\,\% \approx 1.12\,\%$, so $g = (9.81 \pm 0.11)\,\text{m/s}^2$.

</details>

## Ideas for the classroom

- **Use:** Units and ruler reading for younger students, mean and scatter in intermediate classes, regression and uncertainty in advanced practical work.
- **Model:** Lists accept up to 20 values from −100 to 100 cm. Generated lists contain simulated normal data, rounded to 0.001 cm and clipped at the input limits. View 4 uses unrounded, unclipped normal data. An offset and scatter setting affect newly generated data only; the experiment number makes them reproducible.
- **Regression:** Error bars show ±u(y); equal error bars do not change an unweighted fit. The green band is one standard uncertainty of the estimated line from residual scatter, not a prediction interval or 95% confidence band. Slope/intercept uncertainties also use residual scatter. R² is undefined for constant positions.
- **Common stumbling blocks:** Standard deviation and uncertainty of the mean describe different things. Repetition cannot correct calibration. An unusual reading should not be removed without a physical reason. Small samples also make the uncertainty estimate uncertain.
