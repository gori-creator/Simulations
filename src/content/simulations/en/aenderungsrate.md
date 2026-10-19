---
description: "Interactive simulation for year 13: the integral as total change – reconstructing distance from velocity and volume from an inflow rate, with rectangle sums (left, right, midpoint), stacked strips, an error chart, extrema of the amount and a rate you draw yourself."
---

## What is it about?

If you know the rate of change $r(t)$, the total change is the area under its graph: $B(t) = B(0) + \int_0^t r(u)\,du$. Rectangles $r(t_i)\,\Delta t$ (with $t_i$ at the left edge, right edge or midpoint) approximate it. Areas below the time axis (water flowing out) count negative.

**Stack the rectangles** turns every strip into a step of the amount – a staircase that hugs the graph of $B$ as $n$ grows. Doubling $n$ roughly halves the error of the left and right sums and quarters the error of the midpoint sum.

The slope of $B$ is the rate, $B'(t) = r(t)$: where $r$ changes sign from $+$ to $-$ the amount has a **maximum**, from $-$ to $+$ a **minimum**.

*Example:* a car accelerating for $10$ s to $20$ m/s, cruising $30$ s and braking $10$ s covers $100 + 600 + 100 = 800$ m.

## Try it

1. [Car](?sit=car&t=25): press “Play the process”.
2. [Rectangles](?sit=car&t=25&n=5): press “Stack the rectangles”, then “Double the strips” several times and watch the error chart.
3. [Left, right, midpoint](?sit=tank&t=20&n=2&rule=l): why is the midpoint sum exact here?
4. [Water tank](?sit=tank&t=30&v0=30): when is the tank fullest?
5. [Your own inflow rate](?sit=own&t=40&v0=30): drag the five points. Make the tank end as full as it started.
6. [Bike ride](?sit=bike&t=90).

## Tasks

### Task 1: Distance

How far has the car travelled after $25$ s? [Load task](?sit=car&t=25&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Triangle up to $10$ s: $100$ m, then $15 \cdot 20 = 300$ m – together $400$ m. [Show](?sit=car&t=25)

</details>

### Task 2: Water tank

$r(t) = 4 - 0.2t$ (L/min), $30$ L at the start. Find $V(30)$ and the time when the tank is fullest. [Load task](?sit=tank&t=30&v0=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$V(30) = 30 + [4u - 0.1u^2]_0^{30} = 60$ L. Fullest where $r$ changes from $+$ to $-$: $t = 20$, $V(20) = 70$ L. [Show](?sit=tank&t=30&v0=30)

</details>

### Task 3: Left and right sums

Estimate the car's distance after $25$ s with $5$ strips (left and right edge). [Load task](?sit=car&t=25&n=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta t = 5$ s. Left: $5 \cdot (0 + 10 + 20 + 20 + 20) = 350$ m; right: $5 \cdot (10 + 20 + 20 + 20 + 20) = 450$ m; exact: $400$ m. [Show](?sit=car&t=25&n=5)

</details>

### Task 4: Maximum and minimum

The rate is a polyline through $(0 \mid 2)$, $(10 \mid 4)$, $(20 \mid 0)$, $(30 \mid -3)$, $(40 \mid 1)$; $V(0) = 30$ L. Find the maximum, the minimum and $V(40)$. [Load task](?sit=own&t=40&v0=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Maximum at $t = 20$: $V = 30 + 30 + 20 = 80$ L. Minimum at $t = 37.5$: $V = 80 - 15 - 11.25 = 53.75$ L. End: $V(40) = 55$ L. [Show](?sit=own&t=40&v0=30)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Year 13 (reconstructing an amount from its rate of change); link to the $t$-$v$ diagram in mechanics.
- Pair work: one student draws a rate and gives $V(0)$, the other sketches the amount.
- **Common stumbling blocks:** reading the rate as the amount; counting negative areas as positive; looking for the maximum of the amount at the maximum of the rate; forgetting $B(0)$.
