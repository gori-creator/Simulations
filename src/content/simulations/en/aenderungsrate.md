## What is it about?

Often you do not know a quantity itself but how fast it changes: the **velocity** of a car, the **inflow rate** into a tank. How large is the **total change** then?

If the rate is constant, you calculate “rate times time”: $20\,\tfrac{\text{m}}{\text{s}} \cdot 30\,\text{s} = 600\,\text{m}$ – that is the area of a rectangle under the graph. The unit fits too: $\tfrac{\text{m}}{\text{s}} \cdot \text{s} = \text{m}$ or $\tfrac{\text{L}}{\text{min}} \cdot \text{min} = \text{L}$. If the rate changes, you split the time into $n$ strips of width $\Delta t$ and add up $r(t_i) \cdot \Delta t$. The point $t_i$ lies at the **left edge**, at the **right edge** or at the **midpoint** of the strip. For $n \to \infty$ this becomes the integral:

$$B(t) = B(0) + \int_0^t r(u)\,du.$$

The **area under the graph of the rate of change** is the total change of the amount. Areas **below** the time axis (outflow, driving backwards) count **negatively** – the amount decreases. If you count all areas as positive, you calculate $\int_0^t |r(u)|\,du$: for a journey the **total distance travelled** (trip meter), for the tank the total amount of water that has flowed.

**Rate and amount are linked:** the slope of $B$ is the rate, $B'(t) = r(t)$. If $r$ changes sign from $+$ to $-$, the amount has a **maximum**; from $-$ to $+$, a **minimum**.

## Try it

1. [Car journey](?sit=car&t=25): press “Play the process”. When does the area grow fastest – and when is the distance graph steepest?
2. [Rectangles](?sit=car&t=25&n=5): press “Stack the rectangles”: every rectangle at the top becomes a step at the bottom. Then press “Double the strips” several times and watch the card “Error when doubling”.
3. [Left, right, midpoint](?sit=tank&t=20&n=2&rule=l): set the height of the rectangles to “right edge” and “midpoint”. Why is the midpoint sum exact here?
4. [Water tank](?sit=tank&t=30&v0=30): from when on does water flow out? When is the tank fullest – and what is the rate doing there?
5. [Forwards and back](?sit=back&t=40): compare the position and the trip meter. Where can you see the difference in the graph?
6. [Your own inflow rate](?sit=own&t=40&v0=30): drag the five points. Create a rate for which the tank is exactly as full at the end as at the start.
7. [Bike ride](?sit=bike&t=90&n=32&rule=m): why does the distance always increase, although the velocity varies?

## Exercises

### Exercise 1: Distance after 25 seconds

The car accelerates uniformly for $10\,\text{s}$ to $20\,\tfrac{\text{m}}{\text{s}}$ and then drives at a constant speed. How far has it travelled after $25\,\text{s}$? [Load exercise](?sit=car&t=25&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Triangle up to $10\,\text{s}$: $\frac{1}{2} \cdot 10\,\text{s} \cdot 20\,\tfrac{\text{m}}{\text{s}} = 100\,\text{m}$; then $15\,\text{s} \cdot 20\,\tfrac{\text{m}}{\text{s}} = 300\,\text{m}$. Together $s(25) = 400\,\text{m}$. [Show in the simulation](?sit=car&t=25)

</details>

### Exercise 2: Three rectangle sums

Estimate the distance in the first $10\,\text{s}$ with $2$ strips ($\Delta t = 5\,\text{s}$): once with the height at the left edge, at the right edge and at the midpoint. [Load exercise](?sit=car&t=10&n=2&rule=l&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Here $v(t) = 2t$. Left: $5 \cdot (0 + 10) = 50\,\text{m}$, right: $5 \cdot (10 + 20) = 150\,\text{m}$, midpoint: $5 \cdot (5 + 15) = 100\,\text{m}$. Exactly it is $100\,\text{m}$: the midpoint sum is exact because the rate is a straight line (the triangles above and below balance out). Left and right enclose the exact value, because $v$ increases. [Show in the simulation](?sit=car&t=10&n=2&rule=m)

</details>

### Exercise 3: Water tank

The inflow rate is $r(t) = 4 - 0.2t$ (in L/min), and at the start there are $30\,\text{L}$ in the tank. How much water is in the tank after $30$ minutes? When is it fullest? [Load exercise](?sit=tank&t=30&v0=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$V(30) = 30 + \int_0^{30}(4 - 0.2u)\,du = 30 + \left[4u - 0.1u^2\right]_0^{30} = 30 + 30 = 60\,\text{L}$. Fullest where $r$ changes from $+$ to $-$: $r(t) = 0 \iff t = 20$, so $V(20) = 30 + 40 = 70\,\text{L}$. The area consists of $+40\,\text{L}$ (inflow) and $-10\,\text{L}$ (outflow). [Show in the simulation](?sit=tank&t=30&v0=30)

</details>

### Exercise 4: Forwards and back

A car drives forwards for $20\,\text{s}$ (accelerating to $4\,\tfrac{\text{m}}{\text{s}}$ in $5\,\text{s}$, $10\,\text{s}$ constant, $5\,\text{s}$ braking) and then backwards for $20\,\text{s}$ (the same, but with at most $2\,\tfrac{\text{m}}{\text{s}}$). Where is it after $40\,\text{s}$, and how many metres does the trip meter show? [Load exercise](?sit=back&t=40&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Forwards: trapezium $10 + 40 + 10 = 60\,\text{m}$. Backwards: $5 + 20 + 5 = 30\,\text{m}$, so area $-30\,\text{m}$. Total change $\int_0^{40} v\,dt = 60 - 30 = 30\,\text{m}$: the car is $30\,\text{m}$ ahead of the start. The trip meter shows $\int_0^{40} |v|\,dt = 60 + 30 = 90\,\text{m}$. It is furthest away at $t = 20\,\text{s}$ ($60\,\text{m}$). [Show in the simulation](?sit=back&t=40)

</details>

### Exercise 5: Halving the error

For the tank up to $t = 20$ (exactly $40\,\text{L}$ inflow), the left sum with $4$ strips gives $50\,\text{L}$. How large is the error with $8$ and with $16$ strips? [Load exercise](?sit=tank&t=20&n=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Error $10\,\text{L}$, then $5\,\text{L}$, then $2.5\,\text{L}$. For a linear rate the error exactly halves: every strip contains one triangle too much. If you halve $\Delta t$, these triangles have half the width and half the height, so a quarter of the area – but there are twice as many. [Show in the simulation](?sit=tank&t=20&n=16)

</details>

### Exercise 6: Maximum and minimum

The inflow rate is piecewise linear (a polygonal line) through $(0, 2)$, $(10, 4)$, $(20, 0)$, $(30, -3)$ and $(40, 1)$ (time in min, rate in L/min); at the start there are $30\,\text{L}$ in the tank. When is the tank fullest, and when is it emptiest in between? How much is in it at the end? [Load exercise](?sit=own&t=40&v0=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Trapezium and triangle areas: $0$–$10$: $30\,\text{L}$, $10$–$20$: $20\,\text{L}$, $20$–$30$: $-15\,\text{L}$. Between $30$ and $40$, $r$ changes from $-$ to $+$ at $t = 37.5$: $-11.25\,\text{L}$ and $+1.25\,\text{L}$. Maximum at $t = 20$: $V = 80\,\text{L}$; minimum at $t = 37.5$: $V = 53.75\,\text{L}$; at the end $V(40) = 55\,\text{L}$. [Show in the simulation](?sit=own&t=40&v0=30)

</details>

## Ideas for the classroom

- **Use:** upper secondary, integral calculus: reconstructing an amount from the rate of change, area and the definite integral. Suitable as an introduction (area = total change as time runs), for practice (hidden values) and for going deeper (order of the error of rectangle sums).
- **From rectangle to integral:** with “Stack the rectangles” and “Double the strips” you can demonstrate the limit $n \to \infty$; the error card makes it measurable.
- **Units as a check:** “rate times time” always gives the unit of the amount – a nice check for your own calculations.
- **Physics link:** $s(t)$ from $v(t)$ as in the $t$-$v$ diagram in mechanics; “forwards and back” separates change of position and distance travelled.
- **Pair work:** one person drags five points for their own rate and states $V(0)$, the other sketches the amount – then reveal.
- **Common pitfalls:**
  - The value of the rate is read as the amount (“20 m/s, so 20 m”).
  - Negative rates are counted as positive areas – or the distance travelled is confused with the total change.
  - The maximum of the amount is looked for at the maximum of the rate instead of at its change of sign.
  - The initial amount $B(0)$ is forgotten.
