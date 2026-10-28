## What is it about?

If you know the rate of change $r(t)$, the total change is the area under its graph:

$$B(t) = B(0) + \int_0^t r(u)\,du.$$

Rectangles $r(t_i)\,\Delta t$ (with $t_i$ at the left edge, right edge or midpoint) approximate it, and the units fit: $\tfrac{\text{m}}{\text{s}} \cdot \text{s} = \text{m}$. Areas below the time axis (outflow, reversing) count negative. Counting every area as positive gives $\int_0^t |r(u)|\,du$ – the total distance travelled (trip meter).

The slope of $B$ is the rate, $B'(t) = r(t)$: where $r$ changes sign from $+$ to $-$ the amount has a **maximum**, from $-$ to $+$ a **minimum**.

## Try it

1. [Car](?sit=car&t=25): press “Play the process” and watch the area grow together with the distance.
2. [Rectangles](?sit=car&t=25&n=5): press “Stack the rectangles”, then “Double the strips” several times.
3. [Left, right, midpoint](?sit=tank&t=20&n=2&rule=l): why is the midpoint sum exact here?
4. [Water tank](?sit=tank&t=30&v0=30): when is the tank fullest?
5. [Forwards and back](?sit=back&t=40): compare position and trip meter.
6. [Your own inflow rate](?sit=own&t=40&v0=30): drag the five points so the tank ends as full as it started.

## Tasks

### Task 1: Distance

How far has the car travelled after $25$ s? [Load task](?sit=car&t=25&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Triangle up to $10$ s: $100$ m, then $15 \cdot 20 = 300$ m – together $400$ m. [Show](?sit=car&t=25)

</details>

### Task 2: Three rectangle sums

Estimate the distance in the first $10$ s with $2$ strips (left edge, right edge, midpoint). [Load task](?sit=car&t=10&n=2&rule=l&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$v(t) = 2t$. Left: $5 \cdot (0 + 10) = 50$ m, right: $5 \cdot (10 + 20) = 150$ m, midpoint: $5 \cdot (5 + 15) = 100$ m = exact, since the rate is a straight line. [Show](?sit=car&t=10&n=2&rule=m)

</details>

### Task 3: Water tank

$r(t) = 4 - 0.2t$ (L/min), $30$ L at the start. Find $V(30)$ and the time when the tank is fullest. [Load task](?sit=tank&t=30&v0=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$V(30) = 30 + [4u - 0.1u^2]_0^{30} = 60$ L. Fullest where $r$ changes from $+$ to $-$: $t = 20$, $V(20) = 70$ L. [Show](?sit=tank&t=30&v0=30)

</details>

### Task 4: Forwards and back

The car drives $60$ m forwards in $20$ s and then $30$ m backwards. Where is it after $40$ s, and what does the trip meter show? [Load task](?sit=back&t=40&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Total change $60 - 30 = 30$ m; trip meter $\int_0^{40} |v|\,dt = 60 + 30 = 90$ m. [Show](?sit=back&t=40)

</details>

### Task 5: Maximum and minimum

The rate is a polyline through $(0 \mid 2)$, $(10 \mid 4)$, $(20 \mid 0)$, $(30 \mid -3)$, $(40 \mid 1)$; $V(0) = 30$ L. Find the maximum, the minimum and $V(40)$. [Load task](?sit=own&t=40&v0=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Maximum at $t = 20$: $V = 30 + 30 + 20 = 80$ L. Minimum at $t = 37.5$: $V = 80 - 15 - 11.25 = 53.75$ L. End: $V(40) = 55$ L. [Show](?sit=own&t=40&v0=30)

</details>

## Ideas for the classroom

- Year 13 (reconstructing an amount from its rate of change); link to the $t$-$v$ diagram in mechanics.
- Use units as a check: rate times time always gives the unit of the amount.
- Pair work: one student drags a rate and gives $V(0)$, the other sketches the amount – then reveal.
- **Common stumbling blocks:** reading the rate as the amount; counting negative areas as positive or mixing up total change and distance travelled; looking for the maximum of the amount at the maximum of the rate; forgetting $B(0)$.
