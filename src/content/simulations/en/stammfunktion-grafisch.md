## What is it about?

A function $F$ is called an **antiderivative** of $f$ if $F'(x) = f(x)$. So the values of $f$ are the **slopes** of $F$: the height of the graph of $f$ at $x$ is the slope of the graph of $F$ at the same $x$.

This lets you sketch $F$ without calculating (**graphical integration**):

- Where $f(x) > 0$, $F$ **increases**; where $f(x) < 0$, $F$ **decreases**. The larger $|f(x)|$, the steeper $F$.
- A zero of $f$ **with a change of sign** is an **extreme point** of $F$: from $+$ to $-$ a maximum, from $-$ to $+$ a minimum. Without a change of sign you get a **saddle point**.
- An **extreme point of $f$** is a **point of inflection** of $F$ – there $F$ is steepest or flattest. Where $f$ increases, $F$ is concave up; where $f$ decreases, concave down.
- The **area** between the graph of $f$ and the $x$-axis between two zeros is the **change in height** of $F$ there (positive above the axis, negative below).

Antiderivatives are not unique: if $F$ is an antiderivative, so is $F + C$, because the constant disappears when differentiating. All antiderivatives form a **family of curves** whose graphs are only shifted vertically against each other. You can see this in the **slope field**: the short line segments with slope $f(x)$ are the same in every vertical column.

An **initial value** picks exactly one antiderivative out of the family (**initial value problem**): from $F(x) = F_0(x) + C$ and $F(x_0) = y_0$ it follows that

$$
C = y_0 - F_0(x_0).
$$

Example: $f(x) = 3x^2 - 2$ has the antiderivatives $x^3 - 2x + C$. With $F(1) = 4$: $1 - 2 + C = 4$, so $C = 5$ and $F(x) = x^3 - 2x + 5$.

In everyday life, $f$ is often a **rate of change** and $F$ an **amount**: inflow → amount of water, rate of deposits → account balance, climb rate → height, charging current → charge. The initial amount is the constant.

## Try it

1. [Transfer the slope](?mode=trace&fn=par&x=-3): press “Let P run along”. Compare the length of the purple bar at the top with the vertical side of the slope triangle below.
2. [Slope field](?mode=feld&fn=par): drag the starting point up and down. Why does the curve always stay “in the stream” of the line segments? Press “Try different C”.
3. [Initial value problem](?mode=feld&fn=par&pa=3&pb=0&pc=-2&x0=1&c=4): read off $C$ in the card and check the calculation at the top.
4. [Features](?mode=feat&fn=par): press “Features step by step”. Which point of $f$ belongs to the point of inflection of $F$?
5. [Zero without a change of sign](?mode=feat&fn=par&pa=1&pb=0&pc=0): what does $F$ have at $x = 0$?
6. [Area pieces of sin](?mode=area&fn=sin): press “Transfer the areas”. Why is every piece the same size?
7. [Reverse: F → f](?mode=back&fn=cub&x=-3.2): let the tangent run. Where is $f$ zero, where is it smallest?
8. [Steps](?mode=trace&fn=step&x=-4) and [a function drawn by you](?mode=feat&fn=own): drag the blue points at the top – $F$ changes immediately.
9. Everyday life: [savings account](?mode=feld&kind=app&app=konto), [hot-air balloon](?mode=trace&kind=app&app=ballon&x=0), [lift](?mode=area&kind=app&app=lift), [heating](?mode=feat&kind=app&app=heat), [battery](?mode=trace&kind=app&app=akku&x=0), [car park](?mode=back&kind=app&app=park&x=6), [CO₂ in the classroom](?mode=area&kind=app&app=co2). What do the maximum and the point of inflection mean in each case?

## Exercises

### Exercise 1: Sketch it yourself

Sketch the antiderivative of $f(x) = x^2 - 1$ with $F(0) = 0$: drag the seven points, then “Reveal the solution”. [Load exercise](?mode=draw&fn=par&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f > 0$ for $|x| > 1$, $f < 0$ for $|x| < 1$. $F$ increases up to $x = -1$ (maximum, $f$: $+ \to -$), decreases up to $x = 1$ (minimum, $f$: $- \to +$) and then increases. At $x = 0$, $f$ has a minimum, so $F$ has a point of inflection there. $F(x) = \frac{1}{3}x^3 - x$, maximum $\left(-1, \frac{2}{3}\right)$, minimum $\left(1, -\frac{2}{3}\right)$. [Show the solution](?mode=feat&fn=par)

</details>

### Exercise 2: Initial value problem

Find the antiderivative of $f(x) = 3x^2 - 2$ with $F(1) = 4$ and calculate $F(2)$. [Load exercise](?mode=feld&pa=3&pb=0&pc=-2&x0=1&c=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$F(x) = x^3 - 2x + C$; $F(1) = 1 - 2 + C = 4 \Rightarrow C = 5$. So $F(x) = x^3 - 2x + 5$ and $F(2) = 8 - 4 + 5 = 9$. [Show the solution](?mode=feld&pa=3&pb=0&pc=-2&x0=1&c=4)

</details>

### Exercise 3: Cosine and exponential function

a) Which antiderivative of $\cos x$ passes through $(0, 1)$? Calculate $F\left(\frac{\pi}{2}\right)$. b) Which antiderivative of $e^x$ passes through $(0, 3)$? [Load exercise](?mode=feld&fn=cos&x0=0&c=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

a) $F(x) = \sin x + C$, $\sin 0 + C = 1 \Rightarrow C = 1$, $F\left(\frac{\pi}{2}\right) = 1 + 1 = 2$. [Show](?mode=feld&fn=cos&x0=0&c=1) b) $F(x) = e^x + C$, $e^0 + C = 3 \Rightarrow C = 2$, so $F(x) = e^x + 2$. [Show](?mode=feld&fn=exp&x0=0&c=3)

</details>

### Exercise 4: Storage basin

The net inflow is $q(t) = -0.5t^2 + 4t - 3.5$ (in m³/h), and at the start there are $20$ m³ in the basin. In the period $0 \leq t \leq 10$ h, when is there the least and when the most water in the basin? When does the amount of water increase fastest? [Load exercise](?mode=feat&kind=app&app=pool&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$q(t) = -0.5(t - 1)(t - 7)$: zeros at $1$ ($- \to +$, minimum) and $7$ ($+ \to -$, maximum). $V(t) = -\frac{1}{6}t^3 + 2t^2 - 3.5t + 20$, so $V(7) = \frac{109}{3} \approx 36.33$ m³ (the most). The least water is in the basin at $t = 1$ h and at the end $t = 10$ h, $\frac{55}{3} \approx 18.33$ m³ each time: $V(1) = -\frac{1}{6} + 2 - 3.5 + 20 = \frac{55}{3}$ and $V(10) = -\frac{1000}{6} + 200 - 35 + 20 = \frac{55}{3}$. $V$ increases fastest where $q$ is largest: at $t = 4$ h (point of inflection of $V$). [Show](?mode=feat&kind=app&app=pool)

</details>

### Exercise 5: Lift

A lift accelerates for 2 s (up to 2 m/s), travels at 2 m/s for 6 s, brakes for 2 s, stops for 3 s and then goes down: 2 s accelerating up to 2 m/s, 2 s at 2 m/s, 2 s braking. It starts on the ground floor. At what height does it stop, and where is it at the end? One floor is 4 m high. [Load exercise](?mode=area&kind=app&app=lift&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Area going up: $2 \cdot \frac{2 \cdot 2}{2} + 6 \cdot 2 = 4 + 12 = 16$ m (4th floor). Going down: $2 \cdot \frac{2 \cdot 2}{2} + 2 \cdot 2 = 8$ m. At the end: $16 - 8 = 8$ m, i.e. on the 2nd floor. [Show](?mode=area&kind=app&app=lift)

</details>

### Exercise 6: True or false?

“If $f$ has a maximum at $x_0$, then $F$ also has a maximum at $x_0$.”

<details>
<summary>Show solution</summary>

False. A maximum of $f$ means that the slope of $F$ is largest there – $F$ has a point of inflection at $x_0$. Example $f(x) = x \cdot e^{-x^2/2}$: maximum at $x = 1$, and $F$ has a point of inflection there. [Example](?mode=feat&fn=gauss)

</details>

## Ideas for the classroom

- **Use:** upper secondary (antiderivative, graphical integration, constant of integration); initial value problems as a look ahead to differential equations. The views can be used as a sequence: transfer the slope → slope field → features → area pieces → reverse → own sketch.
- **Exercise mode:** in “Task: sketch F” the card first only shows hints (initial point hit? number of extreme points?). Only “Reveal the solution” shows the correct curve, the deviation and, for each section, whether the slope fits. Good for pair work: one person sketches, the other gives reasons.
- **Counterpart:** use together with “The derivative function graphically” and “Integral function and fundamental theorem” – the same relationships in the opposite direction, or with the area as an integral.
- **Everyday link:** the eight examples interpret maxima (most water, highest balance, greatest height) and points of inflection (fastest increase) in context, with units (m³/h · h = m³).
- **Common pitfalls:**
  - Maxima of $f$ are confused with maxima of $F$.
  - The constant of integration is forgotten, or students believe there is only one antiderivative.
  - A zero without a change of sign is taken to be an extreme point of $F$.
  - With an initial value, $C = y_0$ is set although $F_0(x_0) \neq 0$ (e.g. for $e^x$).
