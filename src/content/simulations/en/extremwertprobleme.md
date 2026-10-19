---
description: "Interactive simulation for year 13: optimisation problems with calculus – a box from a sheet of card (with folding), a can with the smallest surface, a rectangle under an exponential, the largest cylinder in a cone and a lifeguard's fastest route, with the graph of the derivative, boundary values and a full solution."
---

## What is it about?

Objective function → constraint (reduce to one variable) → domain → necessary condition $Z' = 0$ → sufficient condition ($Z''$ or a sign change of $Z'$, shown in the strip below the graph) → compare the boundary values → answer.

*Box:* $V(x) = x(30 - 2x)(20 - 2x)$ is largest for $x \approx 3.92$ cm. *Can:* the surface $S(r) = 2\pi r^2 + \frac{2V}{r}$ is smallest for $r = \sqrt[3]{V/(2\pi)}$, where $h = 2r$. *Cylinder in a cone* ($R = 6$ cm, $H = 12$ cm): $V(r) = \pi r^2(12 - 2r)$ is largest for $r = 4$ cm $= \frac{2}{3}R$.

*Lifeguard:* $20$ m of sand, $30$ m of water, $60$ m sideways; running at $7$ m/s, swimming at $2$ m/s: $T(x) = \frac{\sqrt{20^2 + x^2}}{7} + \frac{\sqrt{30^2 + (60 - x)^2}}{2}$, $0 \le x \le 60$. Numerically $x \approx 51.71$ m, $T \approx 23.48$ s – and $\frac{\sin \alpha_1}{v_1} = \frac{\sin \alpha_2}{v_2}$: the law of refraction.

## Try it

1. [Box](?prob=box&a=30&b=20&x=4): press “Fold”, then drag the point and press “Go to the optimum”.
2. [Rectangle](?prob=rect&x=0.8): press “Scan” – the graph appears by trial.
3. [1-litre can](?prob=can&v=1000&x=3) and [cylinder in a cone](?prob=cone&ch=12&x=2): change the height of the cone – why does the best radius stay at $4$ cm?
4. [Lifeguard](?prob=life&x=24): start the “Race” and compare the straight line with the fastest route. With [equal speeds](?prob=life&v1=4&v2=4&x=40) the straight line wins.

## Tasks

### Task 1: Box

A square sheet with side $24$ cm: which $x$ gives the largest box? [Load task](?prob=box&a=24&b=24&x=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$V(x) = x(24 - 2x)^2$, $V'(x) = (24 - 2x)(24 - 6x) = 0 \Rightarrow x = 4$ cm, $V = 1024$ cm³. [Show](?prob=box&a=24&b=24&x=4)

</details>

### Task 2: Cylinder in a cone

Find the largest cylinder in a cone with $R = 6$ cm and $H = 12$ cm. [Load task](?prob=cone&ch=12&x=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$h = 12 - 2r$, $V'(r) = 6\pi r(4 - r) = 0 \Rightarrow r = 4$ cm, $h = 4$ cm, $V = 64\pi \approx 201.1$ cm³ – $\frac{4}{9}$ of the cone. [Show](?prob=cone&ch=12&x=4)

</details>

### Task 3: Lifeguard

Compare $T(24)$ (straight line), $T(60)$ and the optimum. [Load task](?prob=life&x=24&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$T(24) \approx 27.89$ s, $T(60) \approx 24.04$ s, optimum $x \approx 51.71$ m with $T \approx 23.48$ s; $T(0) \approx 36.40$ s. [Show](?prob=life&x=51.7)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Fold boxes from A4 paper first.
- The lifeguard leads straight to the law of refraction (Fermat's principle) – a joint lesson with physics.
- **Common stumbling blocks:** not using the constraint; ignoring the domain; not comparing boundary values (for the lifeguard $T(60)$ is only slightly worse than the optimum).
