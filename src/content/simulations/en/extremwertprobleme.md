## What is it about?

In an **optimisation problem** you look for the largest or smallest value of a quantity – the largest volume, the smallest surface area, the shortest time. At the top of the picture the object changes with the variable; below it the point on the graph of the **objective function** moves along, and at the very bottom the strip shows the **derivative**: green where the objective function increases, red where it decreases. The procedure is always the same:

1. **Objective function:** the quantity to be optimised, as a formula (e.g. $V = \text{length} \cdot \text{width} \cdot \text{height}$).
2. **Constraint:** use relationships until only **one** variable is left.
3. **Domain:** which values make sense in the context?
4. **Necessary and sufficient condition:** $Z'(x) = 0$; change of sign of $Z'$ or sign of $Z''$.
5. **Compare the endpoints** (an endpoint value can be better than any local extremum!) and state the **result** in the context.

*Box:* from a sheet of card $30\,\text{cm} \times 20\,\text{cm}$, squares with side length $x$ are cut out at the corners, then the sides are folded up: $V(x) = x(30 - 2x)(20 - 2x) = 4x^3 - 100x^2 + 600x$, $0 < x < 10$. $V'(x) = 12x^2 - 200x + 600 = 0 \iff 3x^2 - 50x + 150 = 0$ gives $x_1 \approx 3.92$ and $x_2 \approx 12.74 \notin D$. With $V''(3.92) < 0$ and $V(x) \to 0$ for $x \to 0$ and $x \to 10$ (the endpoints do not belong to $D$), the maximum is $V \approx 1056.3\,\text{cm}^3$.

*Can:* for a fixed volume $V$, $h = \frac{V}{\pi r^2}$, so $O(r) = 2\pi r^2 + \frac{2V}{r}$. From $O'(r) = 4\pi r - \frac{2V}{r^2} = 0$ it follows that $r = \sqrt[3]{\frac{V}{2\pi}}$ – and then $h = 2r$: the best can is as tall as it is wide. For $V = 1\,\text{L}$: $r \approx 5.42\,\text{cm}$, $h \approx 10.84\,\text{cm}$, $O = 6\pi r^2 \approx 553.6\,\text{cm}^2$.

*Cylinder in a cone:* by the intercept theorem $h = H\left(1 - \frac{r}{R}\right)$, so $V(r) = \pi r^2 H\left(1 - \frac{r}{R}\right)$. The maximum lies at $r = \frac{2}{3}R$, $h = \frac{H}{3}$ with $V = \frac{4\pi R^2 H}{27}$ – that is always $\frac{4}{9}$ of the cone's volume.

*Lifeguard:* the lifeguard stands $20\,\text{m}$ from the water, the swimmer is $30\,\text{m}$ from the shore and $60\,\text{m}$ to the side. Entering the water at the point $x$ takes $T(x) = \frac{\sqrt{20^2 + x^2}}{v_1} + \frac{\sqrt{30^2 + (60 - x)^2}}{v_2}$, $0 \le x \le 60$. $T'(x) = 0$ can only be solved numerically (the card shows Newton's method). For $v_1 = 7\,\frac{\text{m}}{\text{s}}$ and $v_2 = 2\,\frac{\text{m}}{\text{s}}$: $x \approx 51.71\,\text{m}$, $T \approx 23.48\,\text{s}$. At the optimum $\frac{\sin \alpha_1}{v_1} = \frac{\sin \alpha_2}{v_2}$ – the **law of refraction** from optics.

## Try it

1. [Box](?prob=box&a=30&b=20&x=2): drag the handle on the edge of the box or the point on the graph. When is the box flat, when tall and narrow?
2. Press “Find the optimum”: $x$ runs through the whole domain, the graph appears, then the derivative is set to zero. Watch the tangent.
3. [Flat sheet](?prob=box&a=16&b=10&x=1&flat=1): drag the corner of a cut-out and then press “Fold”. Why is the second zero of $V'$ at $\frac{20}{3}$ not in the domain? And does $x = \frac{a}{6}$ hold for the [square sheet](?prob=box&a=30&b=30&x=3)?
4. [1-litre can](?prob=can&v=1000&x=3): drag the edge of the can. From what point does the can become “too tall” for the picture? How does $O(r)$ behave at the endpoints? Real [drink cans](?prob=can&v=350&x=3.3) are slimmer than the optimum – what might be the reason?
5. [Rectangle](?prob=rect&x=0.8): wider means lower. Where do both effects balance?
6. [Cylinder in a cone](?prob=cone&cr=6&ch=12&x=2): change $R$ and $H$. What always stays the same in the “Check” card?
7. [Lifeguard](?prob=life&x=24): the straight line is the shortest but not the fastest route. Start the “Race”. In the “Law of refraction” card compare the two quotients. Where is the optimum if both speeds are [the same](?prob=life&v1=4&v2=4&x=40)?

## Exercises

### Exercise 1: Small sheet

A sheet of card measures $16\,\text{cm} \times 10\,\text{cm}$. Write $V(x)$ as a polynomial and find the maximum. [Load exercise](?prob=box&a=16&b=10&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$V(x) = x(16 - 2x)(10 - 2x) = 4x^3 - 52x^2 + 160x$, $0 < x < 5$. $V'(x) = 12x^2 - 104x + 160 = 0 \iff 3x^2 - 26x + 40 = 0 \iff x = 2$ or $x = \frac{20}{3}$; only $x = 2$ lies in $D$. $V(2) = 2 \cdot 12 \cdot 6 = 144\,\text{cm}^3$. [Show in the simulation](?prob=box&a=16&b=10&x=2)

</details>

### Exercise 2: Can

A can is to hold $500\,\text{cm}^3$. Find the radius, height and surface area of the can that uses the least metal. [Load exercise](?prob=can&v=500&x=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$O(r) = 2\pi r^2 + \frac{1000}{r}$, $O'(r) = 4\pi r - \frac{1000}{r^2} = 0 \Rightarrow r^3 = \frac{250}{\pi} \Rightarrow r \approx 4.30\,\text{cm}$. $O''(r) = 4\pi + \frac{2000}{r^3} > 0$: minimum. $h = \frac{500}{\pi r^2} \approx 8.60\,\text{cm} = 2r$, $O = 6\pi r^2 \approx 348.7\,\text{cm}^2$. [Show in the simulation](?prob=can&v=500&x=4.3)

</details>

### Exercise 3: Rectangle under the exponential function

A rectangle has two sides on the coordinate axes: one corner is at the origin, the opposite corner $P(u \mid f(u))$ lies on the graph of $f(x) = 3e^{-0.5x}$. For which $u$ is the area largest? [Load exercise](?prob=rect&x=0.8&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$A(u) = 3u\,e^{-0.5u}$, $A'(u) = 3e^{-0.5u}(1 - 0.5u) = 0 \Rightarrow u = 2$, since $e^{-0.5u} \neq 0$. $A''(2) = 3e^{-1}(0.5 - 1) < 0$. $A(2) = \frac{6}{e} \approx 2.21$. Endpoints: $A(u) \to 0$ for $u \to 0$ and for $u \to \infty$. [Show in the simulation](?prob=rect&x=2)

</details>

### Exercise 4: Cylinder in a cone

A cylinder is placed inside a cone with $R = 9\,\text{cm}$ and $H = 15\,\text{cm}$. Which cylinder has the largest volume? What fraction of the cone is that? [Load exercise](?prob=cone&cr=9&ch=15&x=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Intercept theorem: $\frac{h}{15} = \frac{9 - r}{9}$, so $h = 15 - \frac{5}{3}r$ and $V(r) = \pi\left(15r^2 - \frac{5}{3}r^3\right)$, $0 < r < 9$. $V'(r) = \pi(30r - 5r^2) = 5\pi r(6 - r) = 0 \Rightarrow r = 6$. $h = 5\,\text{cm}$, $V = 180\pi \approx 565.5\,\text{cm}^3$. The cone has $\frac{1}{3}\pi \cdot 81 \cdot 15 = 405\pi$, so the cylinder fills $\frac{4}{9}$ of it. [Show in the simulation](?prob=cone&cr=9&ch=15&x=6)

</details>

### Exercise 5: Lifeguard

Set up $T(x)$ for $v_1 = 7\,\frac{\text{m}}{\text{s}}$ and $v_2 = 2\,\frac{\text{m}}{\text{s}}$. Compare the straight line (why $x = 24$?), the route “first run to directly opposite” ($x = 60$) and the optimum. [Load exercise](?prob=life&x=24&show=0&_hide=1)

<details>
<summary>Show solution</summary>

By the intercept theorem the straight line meets the shore at $x = 60 \cdot \frac{20}{50} = 24$: $T(24) \approx 27.89\,\text{s}$. Running to directly opposite: $T(60) = \frac{\sqrt{4000}}{7} + 15 \approx 24.04\,\text{s}$. Optimum (numerically, e.g. Newton's method): $x \approx 51.71\,\text{m}$, $T \approx 23.48\,\text{s}$. Since $T(0) \approx 36.40\,\text{s}$ and $T(60) \approx 24.04\,\text{s}$, the minimum is global – but only just better than the endpoint. [Show in the simulation](?prob=life&x=51.71)

</details>

## Ideas for the classroom

- **Use:** applications of differential calculus in upper secondary. The box works well as an introduction, the cone and the lifeguard for going deeper.
- **Starter:** fold boxes from A4 paper with different $x$ and compare; “Find the optimum” then shows first the trial and error, then the calculation. Perhaps the class guesses beforehand which $x$ is best.
- **Exercise mode:** with “Show the solution” switched off, graph, results and solution are hidden; the picture can still be used. “Reveal the solution” reveals the answer step by step.
- **Model criticism:** why are real drink cans not optimal? (Seam, stability, grip, space for advertising.)
- **Cross-curricular:** the lifeguard leads to the law of refraction and Fermat's principle – a reason for a joint lesson with physics.
- **Common pitfalls:**
  - The constraint is not substituted – the objective function still has two variables.
  - Solutions outside the domain are accepted (second zero for the box).
  - The endpoint values are not compared – for the lifeguard, $T(60)$ is only slightly worse than the optimum.
  - The second derivative is evaluated at the wrong point or its sign is misread.
