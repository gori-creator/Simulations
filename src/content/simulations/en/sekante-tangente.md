## What is it about?

The **secant** is the line through two points of the graph: $P(x_0 \mid f(x_0))$ and $Q(x_0 + h \mid f(x_0 + h))$. Its slope is the **difference quotient**

$$
m_s = \frac{f(x_0 + h) - f(x_0)}{h}.
$$

It describes the **average rate of change** of $f$ between $x_0$ and $x_0 + h$. In the slope triangle, $h$ is the horizontal side and $\Delta y = f(x_0 + h) - f(x_0)$ the vertical side.

If $Q$ moves closer and closer to $P$ ($h \to 0$), the secant turns into a limiting position: the **tangent** at $P$. Its slope is the **derivative** of $f$ at $x_0$ (instantaneous rate of change):

$$
f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}.
$$

Important: you must **not plug in** $h = 0$. That would give $\frac{0}{0}$, and you cannot divide by $0$. Instead you look at what $m_s$ approaches as $h$ gets smaller – from the right ($h > 0$) and from the left ($h < 0$).

### Example: $f(x) = x^2$ (h-method)

$$
m_s = \frac{(x_0 + h)^2 - x_0^2}{h} = \frac{2x_0 h + h^2}{h} = 2x_0 + h \;\xrightarrow{\;h \to 0\;}\; 2x_0
$$

Cancelling $h$ is allowed as long as $h \neq 0$. So $f'(x_0) = 2x_0$, e.g. $f'(1) = 2$. The tangent at $P(1 \mid 1)$ has the equation $y = 2(x - 1) + 1 = 2x - 1$.

### When there is no limit: the kink of $|x|$

For $f(x) = |x|$ and $x_0 = 0$ we get $m_s = \frac{|h|}{h}$. For every $h > 0$ this is $1$, for every $h < 0$ it is $-1$. From the right and from the left you get different values. The limit does not exist, and $f$ is **not differentiable** at $0$. The graph has a **kink** there, and there is no tangent.

## Try it

1. Drag $Q$ towards $P$ or press **h → 0**. Watch the difference quotient and the table.
2. Choose a negative $h$: then $Q$ lies to the left of $P$. Is the limit the same? [Negative h](?h=-1.5)
3. Set $h = 0$. What does the simulation show, and why?
4. Show the tangent and move $P$. Where is the tangent horizontal? [Cubic function](?fn=cubic&x0=-1&h=2&tangent=1)
5. Switch on **Trace the derivative f′** and slowly drag $P$ from left to right. Which function appears for $\sin x$? [Sine](?fn=sin&x0=0.5&h=1&trace=1)
6. Choose $f(x) = |x|$ with $x_0 = 0$. Compare the table for positive and for negative $h$. [Kink of |x|](?fn=abs&x0=0&h=1)

## Exercises

### Exercise 1: Difference quotients

For $f(x) = x^2$ and $x_0 = 1$, compute the difference quotient for $h = 1$, $h = 0.5$ and $h = 0.1$. Work it out by hand first, then compare with the table. Which value do the results approach?

<details>
<summary>Show solution</summary>

- $h = 1$: $\frac{4 - 1}{1} = 3$
- $h = 0.5$: $\frac{2.25 - 1}{0.5} = 2.5$
- $h = 0.1$: $\frac{1.21 - 1}{0.1} = 2.1$

In general $m_s = 2 + h$; the values approach $f'(1) = 2$. [Show in the simulation](?x0=1&h=0.5)

</details>

### Exercise 2: h-method with negative h

Use the h-method to find the derivative of $f(x) = x^2$ at $x_0 = -2$. Also compute $m_s$ for $h = 1$ and for $h = -1$. What does the sign of $f'(-2)$ mean?

<details>
<summary>Show solution</summary>

$m_s = 2x_0 + h = -4 + h$. For $h = 1$, $m_s = -3$; for $h = -1$, $m_s = -5$. From both sides $m_s$ approaches $-4$, so $f'(-2) = -4$. The tangent goes down: the graph is decreasing at this point. [Show in the simulation](?x0=-2&h=1&tangent=1)

</details>

### Exercise 3: Horizontal tangents

The graph of $f(x) = 0.25x^3 - x$ has two points with a horizontal tangent. Find them in the simulation and compute them with $f'(x) = 0.75x^2 - 1$.

<details>
<summary>Show solution</summary>

$0.75x^2 - 1 = 0 \Rightarrow x^2 = \frac{4}{3} \Rightarrow x = \pm\frac{2}{\sqrt{3}} \approx \pm 1.15$. There is a maximum ($x \approx -1.15$) and a minimum ($x \approx 1.15$). At $x_0 = 1.15$ the simulation shows $f'(1.15) \approx -0.008$, because $1.15$ is only rounded. [Show in the simulation](?fn=cubic&x0=1.15&h=0.8&tangent=1)

</details>

### Exercise 4: Derivative of the sine function

For $f(x) = \sin x$, switch on the derivative graph and drag the point $P$ across the graph. Which well-known function appears?

<details>
<summary>Show solution</summary>

The cosine function: $(\sin x)' = \cos x$. For example, the slope at $x = 0$ is $1$, and at the maxima and minima it is $0$. [Show in the simulation](?fn=sin&x0=0&h=1&trace=1&tangent=1)

</details>

### Exercise 5: Tangent to the exponential function

For $f(x) = e^x$ and $x_0 = 0$, use a calculator to compute the difference quotient for $h = 1$ and $h = 0.1$. Estimate $f'(0)$ and give the equation of the tangent at $P(0 \mid 1)$.

<details>
<summary>Show solution</summary>

- $h = 1$: $\frac{e - 1}{1} \approx 1.718$
- $h = 0.1$: $\frac{e^{0.1} - 1}{0.1} \approx 1.052$

The values approach $f'(0) = 1$. The tangent is $y = x + 1$. [Show in the simulation](?fn=exp&x0=0&h=0.1&tangent=1)

</details>

### Exercise 6: The kink of $|x|$

For $f(x) = |x|$ at $x_0 = 0$, compute the difference quotient for $h = 0.1$ and for $h = -0.1$. Does the graph have a tangent at $0$?

<details>
<summary>Show solution</summary>

$h = 0.1$: $\frac{0.1 - 0}{0.1} = 1$. $\;h = -0.1$: $\frac{0.1 - 0}{-0.1} = -1$. On the right you always get $1$, on the left always $-1$. There is no common limit, so there is no derivative and no tangent at $0$. At every other point $|x|$ is differentiable ($f'(x) = -1$ for $x < 0$, $f'(x) = 1$ for $x > 0$). [Show in the simulation](?fn=abs&x0=0&h=-0.1&tangent=1)

</details>

## Ideas for the classroom

- **Use:** Upper secondary, introduction to calculus (slopes of secants and tangents, average and instantaneous rate of change, derivative function, tangent equation). The **h → 0** animation shrinks $h$ logarithmically, so the approach stays evenly visible.
- **Table:** The table shows the difference quotients for $h = 1;\ 0.1;\ 0.01;\ 0.001$ with the sign of the chosen $h$. It is a good way to prepare the idea of a limit numerically. Let the class guess or compute the values by hand first.
- **h = 0:** If you set $h = 0$, the difference quotient is undefined ($\frac{0}{0}$); the simulation then shows only the tangent. This is a good moment to discuss the difference between "plugging in $h = 0$" and "the limit as $h \to 0$".
- **Two-sided limit:** Compare $h > 0$ and $h < 0$ first for $x^2$ (same limit) and then for $|x|$ (different values). This makes it tangible why differentiability needs more than "the graph has no jump".
- **Common pitfalls:**
  - "The tangent touches the graph at only one point" – for the cubic function the tangent often cuts the graph at another point.
  - Secant and tangent get mixed up. In the simulation the secant is a solid line and the tangent is dashed; the legend shows both line styles.
  - When cancelling $h$, students forget that this only works for $h \neq 0$.
