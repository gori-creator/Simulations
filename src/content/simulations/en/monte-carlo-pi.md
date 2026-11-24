---
description: Interactive Monte Carlo simulation – random points in a square give an ever better estimate of π.
---

## What is it about?

You can find the number $\pi$ with **chance**. Place random points in the unit square (side length 1) and count how many of them lie inside the **quarter circle** of radius 1.

The areas compare like this:

$$
\frac{A_\text{quarter circle}}{A_\text{square}} = \frac{\frac{1}{4} \pi \cdot 1^2}{1^2} = \frac{\pi}{4}
$$

If the points fall uniformly at random, about the fraction $\frac{\pi}{4} \approx 78.5\,\%$ lands inside the quarter circle. If $k$ of $n$ points lie inside, then

$$
\frac{k}{n} \approx \frac{\pi}{4} \quad\Rightarrow\quad \pi \approx 4 \cdot \frac{k}{n}.
$$

A point $(x, y)$ lies inside the quarter circle if its distance from the origin is at most 1: $x^2 + y^2 \le 1$ (Pythagorean theorem). In the simulation, points inside the circle are round and points outside are small squares.

The estimate is itself random. Two runs with the same number of points almost always give different values. As $n$ grows, the spread gets smaller, but only slowly: the typical deviation from $\pi$ is roughly proportional to $\frac{1}{\sqrt{n}}$.

Methods that compute something with many random trials are called **Monte Carlo methods**, after the casino in Monaco. They are used, for example, in physics, climate research and financial mathematics.

### Buffon’s needle

As early as 1777, Georges-Louis Leclerc de Buffon asked a surprising question: you drop a needle of length $l$ onto a wooden floor whose boards are $d$ wide ($l \le d$). How likely is it that the needle crosses a gap between two boards? The answer contains $\pi$:

$$
P(\text{needle crosses}) = \frac{2l}{\pi d} \qquad\Rightarrow\qquad \pi \approx \frac{2l}{d} \cdot \frac{n}{k}
$$

Here $n$ is the number of drops and $k$ the number of needles that cross a gap. Intuitively: a needle crosses if its centre is close enough to a gap – how close depends on the angle. Averaging over all angles brings in $\pi$ (the exact derivation needs integral calculus).

### Estimating areas

The method works for any area: drop random points into a rectangle of known area and count the share that lands in the area you are looking for. For the area under the parabola $y = x^2$ in the unit square you get about $\frac{1}{3}$ – exactly the value integral calculus gives: $\int_0^1 x^2\,\mathrm{d}x = \frac{1}{3}$.

## Try it

1. Add single points. How much does the estimate change at first?
2. Add 1000 points or press **Play**. How many decimal places are correct? Compare your values in class – almost everyone gets a different estimate.
3. Switch to the full circle in a square. Why is the factor still 4? [Full circle](?shape=full)
4. Set 1000 points per second, press **Play** and watch the funnel. Does the curve sometimes leave it? [Fast](?speed=1000)
5. **Buffon’s needle:** drop needles onto a floor with gaps. How many cross a gap? Change the needle length – does the estimate stay near $\pi$? [Drop needles](?mode=needle) · [Short needles](?mode=needle&len=0.5)
6. **Area under a parabola:** add 1000 points. What share lies below the parabola? [Parabola](?mode=area)

## Exercises

### Exercise 1: Where does the 4 come from?

Explain why you have to multiply the fraction of points inside the circle by 4.

<details>
<summary>Show solution</summary>

The fraction of points inside the circle estimates the area ratio $\frac{\pi}{4}$ (quarter circle to square). Multiplying by 4 gives an estimate for $\pi$.

</details>

### Exercise 2: Same factor for the full circle

For the full circle of radius 1, the points lie in a square with side length 2. Show that the area ratio is again $\frac{\pi}{4}$.

<details>
<summary>Show solution</summary>

$$\frac{A_\text{circle}}{A_\text{square}} = \frac{\pi \cdot 1^2}{2^2} = \frac{\pi}{4}$$

[Show in the simulation](?shape=full)

</details>

### Exercise 3: How accurate does it get?

For an estimate that differs from $\pi$ by at most $0.01$ with about 95 % certainty, you need roughly $100\,000$ points. Roughly how many points do you need for a deviation of at most $0.001$?

<details>
<summary>Show solution</summary>

The typical deviation shrinks like $\frac{1}{\sqrt{n}}$. More precisely, with about 95 % certainty the deviation is at most

$$
1.96 \cdot 4 \cdot \sqrt{\frac{\frac{\pi}{4}\left(1 - \frac{\pi}{4}\right)}{n}} \approx \frac{3.22}{\sqrt{n}}.
$$

For $n = 100\,000$ this gives $\frac{3.22}{316.2} \approx 0.010$. A deviation ten times smaller needs $10^2 = 100$ times as many points, so about $10$ million. Monte Carlo methods are therefore rather slow for $\pi$ – their strength shows in problems that are hard to solve any other way.

</details>

### Exercise 4: Class experiment

Everyone adds 1000 points and writes down $k$ and $n$. How do you combine all results of the class into a better estimate?

<details>
<summary>Show solution</summary>

Add all hits and all points: $\pi \approx 4 \cdot \frac{k_1 + k_2 + \ldots}{n_1 + n_2 + \ldots}$. With 25 people that makes $25\,000$ points. The typical deviation is then about $\sqrt{25} = 5$ times smaller than for one person. Single people can still be closer to $\pi$ than the whole class – that is chance.

</details>

### Exercise 5: Dropping needles

A class drops $100$ toothpicks onto lined paper. The toothpicks are exactly as long as the line spacing. $64$ toothpicks cross a line. What estimate of $\pi$ do you get? How many hits would you expect for exactly $\pi$? [Drop needles](?mode=needle)

<details>
<summary>Show solution</summary>

With $l = d$: $\pi \approx \frac{2n}{k} = \frac{200}{64} = 3.125$. You would expect $100 \cdot \frac{2}{\pi} \approx 63.7$ hits, so about $64$ – the class was lucky.

</details>

### Exercise 6: Area under the parabola

Of $1000$ random points in the unit square, $341$ lie below the parabola $y = x^2$. Estimate the area under the parabola. What is its exact value? [Parabola](?mode=area)

<details>
<summary>Show solution</summary>

The square has area $1$, so $A \approx \frac{341}{1000} = 0.341$. Exactly, $A = \int_0^1 x^2\,\mathrm{d}x = \frac{1}{3} \approx 0.333$. A deviation of $0.008$ is typical for $1000$ points.

</details>

## Ideas for the classroom

- **Use:** Lower secondary (simulating random experiments, the number π). Links probability, the area of a circle and the Pythagorean theorem.
- **Display:** The first $120\,000$ points are drawn; counting continues without limit. For each $n$, the funnel shows the range containing about 95 % of the estimates after $n$ points ($\pi \pm \frac{3.22}{\sqrt{n}}$). It is based on a normal approximation and is only rough for small $n$ (below about 50). A single curve may leave it now and then: on average it lies outside for about 5 % of all $n$.
- **Common pitfalls:**
  - "With more points the value gets more accurate at every step." – The estimate keeps fluctuating, just less and less.
  - "With 1000 points two decimal places are always correct." – With 1000 points the typical deviation is about $0.05$; often only the first decimal place is correct.
  - Computer random numbers are "truly random" – in fact they are pseudo-random numbers, which are good enough for this purpose.
- **Buffon hands-on:** drop toothpicks onto lined paper with a suitable line spacing and count. The simulation then continues the experiment with many thousands of drops. Deriving the probability $\frac{2l}{\pi d}$ is only possible in upper secondary; before that, it is enough to be amazed that $\pi$ appears.
- **Areas:** the parabola shows that the method is not limited to circles. In upper secondary the value can be compared with the integral.
- **Collecting estimates:** It can be exciting to let each group add 1000 points and collect the estimates on the board. The values visibly scatter around $\pi$ – a good starting point for the question of how accurate an estimate is.
