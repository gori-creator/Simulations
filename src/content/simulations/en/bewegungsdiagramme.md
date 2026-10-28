## What is it about?

A motion is described by the **position** $s$ (measured on a tape) at every **time** $t$. Plotting $s$ against $t$ gives the **position–time graph** (s–t graph). The **velocity** tells you how fast the position changes:

$$
v = \frac{\Delta s}{\Delta t} \qquad 1\,\tfrac{\text{m}}{\text{s}} = 3.6\,\tfrac{\text{km}}{\text{h}}
$$

**Uniform motion:** The velocity is constant. In equal times the car covers equal distances:

$$
s(t) = s_0 + v \cdot t
$$

In the s–t graph you get a **straight line** – its **slope** is the velocity. In the v–t graph it is a horizontal line. The **area** under the v–t graph (a rectangle $v \cdot t$) is the displacement $\Delta s$.

**Uniformly accelerated motion:** The velocity changes by the same amount in equal times. The **acceleration** is

$$
a = \frac{\Delta v}{\Delta t}, \qquad v(t) = v_0 + a \cdot t, \qquad s(t) = s_0 + v_0 \cdot t + \tfrac{1}{2}\, a \cdot t^2 .
$$

Now the v–t graph is a sloping straight line with slope $a$, and the s–t graph is a **parabola**. The velocity at an instant is the slope of the **tangent** to the parabola. If the car starts from rest, the distances in successive equal time intervals are in the ratio $1 : 3 : 5 : 7 : \ldots$ – the stroboscope shows this.

**Braking to a stop:** With initial velocity $v_0$ and deceleration $|a|$, braking takes $t_B = \frac{v_0}{|a|}$ and the **braking distance** is $s_B = \frac{v_0^2}{2\,|a|}$. Twice the speed therefore means **four times** the braking distance.

## Try it

1. Press **Start** and watch the stroboscope: for uniform motion the gaps are equal. Compare with the slope triangle in the s–t graph.
2. Let the car drive backwards. What do the s–t and v–t graphs look like now? [Driving backwards](?v=-5&s0=50)
3. Speed up with $a = 2\,\tfrac{\text{m}}{\text{s}^2}$. How do the gaps in the stroboscope grow? [Speeding up](?mode=acc)
4. Drag the **time marker** (triangle at the top of the s–t graph) back and forth. Compare the slope of the tangent with the value in the v–t graph.
5. Choose the **schedule** and drag the corners of the v–t graph. Watch how the s–t graph changes. [Schedule](?mode=plan)
6. Switch off “Show the graphs before the trip” and **predict** what the graphs will look like. Only then start. [Prediction](?mode=acc&v0=20&a=-4&T=8&pre=0)

## Tasks

### Task 1: Distance at constant velocity

A car moves uniformly at $54\,\tfrac{\text{km}}{\text{h}}$. How far does it travel in $8\,\text{s}$? [Load task](?v=15&T=8&_hide=1)

<details>
<summary>Show solution</summary>

$54\,\tfrac{\text{km}}{\text{h}} = 54 : 3.6\,\tfrac{\text{m}}{\text{s}} = 15\,\tfrac{\text{m}}{\text{s}}$, so $\Delta s = v \cdot \Delta t = 15\,\tfrac{\text{m}}{\text{s}} \cdot 8\,\text{s} = 120\,\text{m}$. This is the rectangle under the v–t graph.

</details>

### Task 2: Reading a graph

Load the task and read from the s–t graph: Where does the car start, how fast does it move, and when does it pass the point $s = 0$? [Load task](?v=12.5&s0=-50&T=12&slope=0&_hide=1)

<details>
<summary>Show solution</summary>

Starting position $s_0 = -50\,\text{m}$. After $12\,\text{s}$ the car is at $100\,\text{m}$, so $v = \frac{150\,\text{m}}{12\,\text{s}} = 12.5\,\tfrac{\text{m}}{\text{s}}$. It is at $s = 0$ after $t = \frac{50\,\text{m}}{12.5\,\text{m/s}} = 4\,\text{s}$ (where the graph crosses the t-axis).

</details>

### Task 3: Speeding up

A car starts from rest and speeds up uniformly with $a = 2.5\,\tfrac{\text{m}}{\text{s}^2}$. How fast is it after $6\,\text{s}$, and how far has it travelled by then? How long does it take to reach $100\,\tfrac{\text{km}}{\text{h}}$? [Load task](?mode=acc&a=2.5&T=12&_hide=1)

<details>
<summary>Show solution</summary>

$v = a \cdot t = 2.5 \cdot 6\,\tfrac{\text{m}}{\text{s}} = 15\,\tfrac{\text{m}}{\text{s}}$ and $s = \tfrac12 \cdot 2.5 \cdot 6^2\,\text{m} = 45\,\text{m}$ (triangle under the v–t graph). $100\,\tfrac{\text{km}}{\text{h}} \approx 27.8\,\tfrac{\text{m}}{\text{s}}$, so $t = \frac{27.8}{2.5}\,\text{s} \approx 11.1\,\text{s}$.

</details>

### Task 4: Braking distance

A car moving at $20\,\tfrac{\text{m}}{\text{s}}$ ($72\,\tfrac{\text{km}}{\text{h}}$) brakes with $a = -5\,\tfrac{\text{m}}{\text{s}^2}$. How long is the braking distance? How long would it be at twice the speed? [Load task](?mode=acc&v0=20&a=-5&T=6&_hide=1)

<details>
<summary>Show solution</summary>

$s_B = \frac{v_0^2}{2\,|a|} = \frac{(20\,\text{m/s})^2}{2 \cdot 5\,\text{m/s}^2} = 40\,\text{m}$ after $t_B = 4\,\text{s}$. At $40\,\tfrac{\text{m}}{\text{s}}$ it is $160\,\text{m}$ – **four times** the braking distance. [Twice the speed](?mode=acc&v0=40&a=-5&T=10&_hide=1)

</details>

### Task 5: Evaluating a schedule

A car goes from rest to $15\,\tfrac{\text{m}}{\text{s}}$ in $5\,\text{s}$, then moves uniformly for $10\,\text{s}$ and brakes to a stop in $5\,\text{s}$. Calculate the accelerations, the distances of the sections, the total distance and the average velocity. [Load task](?mode=plan&_hide=1)

<details>
<summary>Show solution</summary>

$a_1 = 3\,\tfrac{\text{m}}{\text{s}^2}$, $a_2 = 0$, $a_3 = -3\,\tfrac{\text{m}}{\text{s}^2}$. Areas under the v–t graph: $37.5\,\text{m} + 150\,\text{m} + 37.5\,\text{m} = 225\,\text{m}$. Average velocity $\bar v = \frac{225\,\text{m}}{20\,\text{s}} = 11.25\,\tfrac{\text{m}}{\text{s}}$.

</details>

### Task 6: Distance or displacement?

In the example “There and back” the car ends up at its start again. How large are the displacement and the distance travelled? What is the car’s acceleration at the turning point at $t = 8\,\text{s}$? [Load task](?mode=plan&v1=8&t1=4&v2=-8&t2=8&v3=0&t3=4&_hide=1)

<details>
<summary>Show solution</summary>

Displacement $\Delta s = 0$ (the areas above and below the t-axis cancel), distance travelled $4 \cdot 16\,\text{m} = 64\,\text{m}$. At the turning point $v = 0$, but $a = -2\,\tfrac{\text{m}}{\text{s}^2}$ – the car is at rest for just an instant.

</details>

## Ideas for the classroom

- **Use:** Uniform motion, velocity and the s–t graph when starting mechanics (about grades 7/8); uniformly accelerated motion, the v–t graph and braking distance in grades 9/10. The graphs can be switched off individually, e.g. the a–t graph for younger classes.
- **Notation:** The simulation calls the position $s$; many textbooks write $x$ and speak of the **position–time graph**. Displacement $\Delta s$ (with sign) and distance travelled (always positive) are distinguished.
- **Model:** The car is treated as a point mass (white marker, dropped line to the tape); it is drawn larger than to scale. When braking it stops at $v = 0$ and does not reverse by itself. In the schedule the velocity changes uniformly in each section; the jumps in the a–t graph are idealised.
- **Predictions:** With “Show the graphs before the trip” switched off and `_hide=1`, learners can sketch the graphs first and then check them.
- **Common stumbling blocks:**
  - The s–t graph is read as a picture of the path (“the car drives uphill”).
  - “High in the v–t graph means far away” – in fact it is the **area** under the graph that counts.
  - “If $v = 0$, then $a = 0$ too” – at the turning point (task 6) this is not true.
  - Slope and value are mixed up: a flat but high s–t graph means slow, not fast.
