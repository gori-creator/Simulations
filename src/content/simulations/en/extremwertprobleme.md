## What is it about?

The picture changes with the variable, the point on the graph of the **objective function** follows, and the strip below shows the **derivative** (green: increasing, red: decreasing). The method: objective function → constraint (one variable left) → domain → $Z' = 0$ → sign change of $Z'$ or sign of $Z''$ → compare the boundary values → answer.

*Box:* $V(x) = x(30 - 2x)(20 - 2x)$, $0 < x < 10$, is largest for $x \approx 3.92$ cm with $V \approx 1056.3$ cm³; the second zero of $V'$, $x \approx 12.74$, lies outside the domain. *Can:* $S(r) = 2\pi r^2 + \frac{2V}{r}$ is smallest for $r = \sqrt[3]{V/(2\pi)}$, where $h = 2r$. *Cylinder in a cone:* $r = \frac{2}{3}R$, $h = \frac{H}{3}$, always $\frac{4}{9}$ of the cone. *Lifeguard:* $T(x) = \frac{\sqrt{20^2 + x^2}}{v_1} + \frac{\sqrt{30^2 + (60 - x)^2}}{v_2}$; at the optimum $\frac{\sin \alpha_1}{v_1} = \frac{\sin \alpha_2}{v_2}$ – the law of refraction.

## Try it

1. [Box](?prob=box&a=30&b=20&x=2): drag the handle or the point on the graph, then press “Find the optimum”.
2. [Flat sheet](?prob=box&a=16&b=10&x=1&flat=1): drag a corner of a cut-out, then press “Fold”.
3. [1-litre can](?prob=can&v=1000&x=3) and [cylinder in a cone](?prob=cone&cr=6&ch=12&x=2): change the data – what stays the same in the “Check” card?
4. [Lifeguard](?prob=life&x=24): start the “Race”. With [equal speeds](?prob=life&v1=4&v2=4&x=40) the straight line is fastest.

## Tasks

### Task 1: Box

A sheet measures $16$ cm × $10$ cm. Find the largest box. [Load task](?prob=box&a=16&b=10&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$V(x) = 4x^3 - 52x^2 + 160x$, $V'(x) = 0 \iff 3x^2 - 26x + 40 = 0 \iff x = 2$ or $x = \frac{20}{3} \notin D$. $V(2) = 144$ cm³. [Show](?prob=box&a=16&b=10&x=2)

</details>

### Task 2: Can

Which can holding $500$ cm³ needs the least metal? [Load task](?prob=can&v=500&x=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$r = \sqrt[3]{250/\pi} \approx 4.30$ cm, $h \approx 8.60$ cm $= 2r$, $S \approx 348.7$ cm². [Show](?prob=can&v=500&x=4.3)

</details>

### Task 3: Lifeguard

Compare $T(24)$, $T(60)$ and the optimum for $v_1 = 7$ m/s, $v_2 = 2$ m/s. [Load task](?prob=life&x=24&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$T(24) \approx 27.89$ s, $T(60) \approx 24.04$ s, optimum $x \approx 51.71$ m with $T \approx 23.48$ s; $T(0) \approx 36.40$ s. [Show](?prob=life&x=51.71)

</details>

## Ideas for the classroom

- Fold paper boxes first and compare their volumes, then let “Find the optimum” show trying and calculating.
- With “Show the solution” off, graph and results are hidden for tasks; “Reveal the solution” uncovers them step by step.
- The lifeguard leads to the law of refraction (Fermat's principle) – a joint lesson with physics.
- **Common stumbling blocks:** not using the constraint; keeping solutions outside the domain; not comparing boundary values (for the lifeguard $T(60)$ is only slightly worse than the optimum).
