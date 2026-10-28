---
description: "Interactive simulation for years 11 and 12: graphical differentiation – tangent and slope triangle draw the graph of f′ (and f″), the secant becomes the tangent as h → 0, features with a sign chart, your own sketch of f′, the rules of differentiation visualised and nine everyday examples."
---

## What is it about?

The **derivative** $f'(x)$ is the slope of the **tangent** to the graph of $f$ at $x$. It is the limit of the slopes of secants (**difference quotient**):

$$
f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}
$$

Example $f(x) = x^2$ at $1$ with $h = 0.1$: from the right $\frac{1.21 - 1}{0.1} = 2.1$, from the left $\frac{1 - 0.81}{0.1} = 1.9$, symmetric $\frac{1.21 - 0.81}{0.2} = 2$. As $h \to 0$ all of them approach $f'(1) = 2$. If the left and the right limit are **not** equal, the graph has a **kink** and $f$ is not differentiable there (e.g. $|x|$ at $0$: left $-1$, right $1$).

Assigning the slope $f'(x)$ to every $x$ gives the **derivative function** $f'$. You can sketch its graph without calculating:

- Where $f$ **increases**, $f'(x) > 0$; where $f$ **decreases**, $f'(x) < 0$. The steeper $f$, the further $f'$ is from the $x$-axis.
- A **horizontal tangent** of $f$ is a **zero** of $f'$. With a sign change ($+ \to -$ maximum, $- \to +$ minimum) it is an extremum, without a sign change a **saddle point** (stationary point of inflection).
- Where $f$ increases or decreases most steeply (**point of inflection**), $f'$ has an **extremum**. There $f''$ changes sign: $f'' > 0$ means concave up, $f'' < 0$ concave down.

The **rules of differentiation** can be justified with pictures: constant multiple rule $(a \cdot f)' = a \cdot f'$ (all heights and so all slopes become $a$ times as large), sum rule $(g + h)' = g' + h'$ (the increases add up), power rule $(x^n)' = n \cdot x^{n-1}$, product rule $(u \cdot v)' = u' \cdot v + u \cdot v'$ (increase of a rectangle’s area) and chain rule $(\sin(kx))' = k \cdot \cos(kx)$.

In everyday life $f'$ is a **rate of change**: distance → velocity → acceleration, amount of water → inflow, cost → marginal cost, elevation profile → gradient ($100\,\tfrac{\text{m}}{\text{km}} = 10\,\%$).

## Try it

1. [Running tangent](?mode=trace&fn=cub&x=-2.5): press “Let P run along”. Compare the vertical side of the slope triangle (with $\Delta x = 1$) with the vertical bar in the picture of $f'$: it is exactly $f'(x)$ high.
2. [With the second derivative](?mode=trace&fn=cub&x=-2.5&d2=1): the small tangent to $f'$ has the slope $f''(x)$. Where is $f''$ zero?
3. [Parabola](?fn=par&x=-3), [sine](?fn=sin&x=-6), [exponential](?fn=exp&x=-3.5&full=1) and [ln x](?fn=ln&x=0.5): which well-known function appears below each time?
4. [Secant → tangent](?mode=sek&fn=par&pa=1&pb=0&pc=0&x=1&h=1): press “Let h tend to 0”. How does the point in the chart of the difference quotient move? Also choose “left” and “symmetric”.
5. [Kink of |x|](?mode=sek&fn=abs&x=0&h=1.5&side=l): why do the two branches in the lower picture not meet at $h = 0$?
6. [Features](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1): press “Features step by step” and follow the guide lines through all three pictures. [Saddle point of x³](?mode=feat&k3=1&k2=0&k1=0&k0=0&d2=1): what is different?
7. Rules: [constant multiple rule](?mode=rule&rule=fak&fn=sin&rk=2&x=0.5), [sum rule](?mode=rule&rule=sum&x=1), [power rule](?mode=rule&rule=pow&pn=3&x=1&dx=0.5), [product rule](?mode=rule&rule=prod&x=2&dx=0.5), [chain rule](?mode=rule&rule=chain&rk=2&x=0.5). Make $\Delta x$ smaller for the product rule: what happens to the small corner piece $\Delta u \cdot \Delta v$?
8. Everyday life: [car](?kind=app&app=car&x=0&d2=1), [100 m sprint](?kind=app&app=sprint&x=0&d2=1), [lift](?mode=feat&kind=app&app=lift&d2=1), [vertical throw](?mode=feat&kind=app&app=ball&d2=1), [temperature](?kind=app&app=temp&x=0), [epidemic](?mode=feat&kind=app&app=pop&d2=1), [cost](?mode=feat&kind=app&app=cost), [hike](?kind=app&app=hike&x=0), [bathtub](?mode=sek&kind=app&app=tank&x=5&h=2). What do a maximum, a zero of $f'$ and a point of inflection mean in each case?

## Tasks

### Task 1: Features of x³ − 3x

For $f(x) = x^3 - 3x$, find $f'(2)$, the extrema and the points of inflection, first graphically, then by calculation. [Load task](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = 3x^2 - 3$, so $f'(2) = 12 - 3 = 9$. $f'(x) = 0$ for $x = \pm 1$: at $-1$ the sign of $f'$ changes from $+$ to $-$ (maximum $(-1, 2)$), at $1$ from $-$ to $+$ (minimum $(1, -2)$). $f''(x) = 6x$ is zero at $0$ and changes sign: point of inflection $(0, 0)$. [Show solution](?mode=feat&k3=1&k2=0&k1=-3&k0=0&d2=1)

</details>

### Task 2: Difference quotient

For $f(x) = x^2$ at $x = 1$ with $h = 0.1$, calculate the right, the left and the symmetric difference quotient. Which one is closest to $f'(1)$? [Load task](?mode=sek&fn=par&pa=1&pb=0&pc=0&x=1&h=0.1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Right $\frac{1.21 - 1}{0.1} = 2.1$, left $\frac{1 - 0.81}{0.1} = 1.9$, symmetric $\frac{1.21 - 0.81}{0.2} = 2$. The symmetric quotient even hits $f'(1) = 2$ exactly here (always for parabolas); the one-sided ones are off by exactly $h$. [Show solution](?mode=sek&fn=par&pa=1&pb=0&pc=0&x=1&h=0.1&side=c)

</details>

### Task 3: Sketch f′

Sketch the graph of the derivative of $f(x) = \frac{1}{4}(x^3 - 6x)$: drag the seven points in the lower picture, then press “Reveal the solution”. [Load task](?mode=draw&fn=cub)

<details>
<summary>Show solution</summary>

$f$ increases, decreases between the extrema at $x = \pm\sqrt{2} \approx \pm 1.41$ and increases again. So $f'$ is an upward-opening parabola with zeros at $\pm\sqrt{2}$ and its minimum at $x = 0$ (point of inflection of $f$): $f'(x) = \frac{3}{4}x^2 - 1.5$, e.g. $f'(0.5) = -1.3125$. [Show solution](?mode=feat&fn=cub&d2=1)

</details>

### Task 4: Car

In $t$ seconds a car covers the distance $s(t) = -0.05t^3 + 1.5t^2$ (in m) ($0 \le t \le 20$). How fast is it after $4$ s? When is it fastest, and what is the acceleration at the start? [Load task](?kind=app&app=car&x=4&d2=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$v(t) = s'(t) = -0.15t^2 + 3t$, so $v(4) = -2.4 + 12 = 9.6\,\tfrac{\text{m}}{\text{s}} \approx 34.6\,\tfrac{\text{km}}{\text{h}}$. $a(t) = v'(t) = -0.3t + 3$ is zero at $t = 10$: there $v$ is greatest, $v(10) = 15\,\tfrac{\text{m}}{\text{s}} = 54\,\tfrac{\text{km}}{\text{h}}$, and $s$ has a point of inflection. At the start $a(0) = 3\,\tfrac{\text{m}}{\text{s}^2}$. [Show solution](?kind=app&app=car&x=4&d2=1)

</details>

### Task 5: Applying the rules

a) Differentiate $f(x) = 2\sin x + x^3$ and calculate $f'(0)$. b) Use the product rule to calculate $(u \cdot v)'(2)$ for $u(x) = 1 + 0.5x$ and $v(x) = 1 + 0.25x^2$. [Load task](?mode=rule&rule=prod&x=2&dx=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

a) Constant multiple, sum and power rule: $f'(x) = 2\cos x + 3x^2$, $f'(0) = 2$. b) $u(2) = 2$, $u' = 0.5$, $v(2) = 2$, $v'(x) = 0.5x$, so $v'(2) = 1$: $(u \cdot v)'(2) = 0.5 \cdot 2 + 2 \cdot 1 = 3$. [Show](?mode=rule&rule=prod&x=2&dx=0.5)

</details>

### Task 6: True or false?

“If $f'$ has a maximum at $x_0$, then $f$ also has a maximum there.”

<details>
<summary>Show solution</summary>

False. A maximum of $f'$ means that $f$ increases most steeply there – $f$ has a **point of inflection** at $x_0$. Example epidemic: the most new cases per day ($N'$ greatest, after about $13.2$ days) occur at the point of inflection of the number of cases $N$. [Example](?mode=feat&kind=app&app=pop&d2=1)

</details>

## Ideas for the classroom

- **Use:** the views work well as a sequence: secant → tangent, running tangent, features, your own sketch, rules. The simulation fits upper secondary calculus (local and global differentiation, monotonicity and extrema) and later the derivatives of sine and cosine and the product and chain rules.
- **Predictions:** with “Show terms and values” switched off, students first sketch $f'$ on paper, then check with the trace or in the task mode “sketch f′”, which tells them for each point whether it fits.
- **Differentiability:** the chart “difference quotient against h” turns limits into a picture: for smooth functions the left and right branches run towards the same point, for $|x|$ they do not.
- **Real-world context:** nine examples with units (m/s, m/s², L/min, MU/unit, m/km and percent) – good for interpreting maxima, zeros of $f'$ and points of inflection in context.
- **Common stumbling blocks:**
  - A maximum of $f$ is confused with a maximum of $f'$.
  - The function value $f(x)$ is confused with the slope $f'(x)$ (“$f$ is negative, so $f$ decreases”).
  - A zero of $f'$ without a sign change is taken for an extremum.
  - Points of inflection are overlooked because “nothing special” can be seen on the graph there.
