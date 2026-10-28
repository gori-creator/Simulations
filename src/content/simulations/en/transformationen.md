---
description: "Interactive simulation for year 11: shift, stretch and reflect the graph of a basic function with g(x) = a · f(b(x − c)) + d – step by step on a timeline, with draggable anchor and shape points, moving key points, a table of points and the properties of g for parabola, square root, absolute value, hyperbola, sine and exponential function."
---

## What is it about?

From the graph of a **basic function** $f$ (for example $x^2$, $\sqrt{x}$, $\frac{1}{x}$, $\sin x$ or $2^x$) we get the graph of

$$
g(x) = a \cdot f\big(b\,(x - c)\big) + d
$$

by shifting, stretching and reflecting.

You can think of it as a **sequence of four steps** – this is exactly how the timeline plays it:

| Step | Term | Effect on the graph |
| --- | --- | --- |
| ① $b$ | $f(bx)$ | horizontal stretch by the factor $\frac{1}{b}$ (for $\lvert b\rvert > 1$ a compression); $b < 0$: also a reflection in the $y$-axis |
| ② $c$ | $f\big(b(x - c)\big)$ | shift by $c$ in the $x$-direction ($c > 0$: to the **right**) |
| ③ $a$ | $a \cdot f\big(b(x - c)\big)$ | vertical stretch by the factor $a$; $a < 0$: also a reflection in the $x$-axis |
| ④ $d$ | $\ldots + d$ | shift by $d$ in the $y$-direction ($d > 0$: up) |

A point $(x \mid y)$ on the graph of $f$ becomes

$$
\left(\frac{x}{b} + c \;\middle|\; a \cdot y + d\right).
$$

Example: in $g(x) = 2\,(x - 1)^2 - 2$ we have $a = 2$, $b = 1$, $c = 1$, $d = -2$. The vertex $(0 \mid 0)$ of the standard parabola moves to $S(1 \mid -2)$, the point $(2 \mid 4)$ moves to $(2 + 1 \mid 2 \cdot 4 - 2) = (3 \mid 6)$. Check: $g(3) = 2 \cdot 4 - 2 = 6$. The zeros are $0$ and $2$, and $g(0) = 0$.

**Why $b$ first, then $c$?** If the inside reads $f(bx - c)$, the curve that has already been shifted is stretched – and the shift shrinks with it. You have to factor out $b$: $f(2x - 1) = f\big(2(x - 0.5)\big)$. The vertex of $(2x - 1)^2$ lies at $x = 0.5$, the vertex of $\big(2(x - 1)\big)^2$ at $x = 1$.

**Good to know:** For some basic functions, $b$ can be replaced by a factor in front of $f$, for example $(2x)^2 = 4x^2$ or $\frac{1}{2x} = \frac{0.5}{x}$. This does not work for the sine: $\sin(2x)$ has half the period, $2 \sin x$ has twice the amplitude.

## Try it

1. [Starting picture](?f=sq&a=2&b=1&c=1&d=-2): Press “Play step by step”. Watch how the graph is stretched, shifted, stretched and shifted one after the other. Pause, use “Step back” and “Step forward”, or drag the knob of the timeline.
2. Drag the round **anchor point**: it is the image of the origin, so $(c \mid d)$. Drag the diamond-shaped **shape point**: it changes $a$ and $b$. What happens if you drag it below the anchor point or past it to the left?
3. [Square root with b = −1](?f=sqrt&a=1&b=-1&c=2&d=0): Play the steps. How does the graph “flip over” the $y$-axis? Why is the domain now $x \le 2$?
4. [Sine function](?f=sin&a=2&b=2&c=0&d=1): Read off the amplitude, the period and the midline. Change $b$ and watch the period $\frac{2\pi}{\lvert b\rvert}$.
5. [Hyperbola](?f=inv&a=2&b=1&c=-1&d=1) and [exponential function](?f=exp&a=-1&b=1&c=1&d=3): How do the asymptotes move?
6. [Pitfall: order](?f=sq&a=1&b=2&c=1&d=0&ord=swap): The animation shifts first and then stretches. Compare the result $h$ with the correct $g$ (dashed).
7. Set $a = 0$. What is left of the graph?

## Tasks

### Task 1: Read off the parameters

The graph comes from the absolute value function $f(x) = \lvert x\rvert$. Find $a$, $c$ and $d$ (here $b = 1$) and give the term. [Load task](?f=abs&a=-0.5&b=1&c=-2&d=3&info=0&_hide=1)

<details>
<summary>Show solution</summary>

The corner point is at $(-2 \mid 3)$, so $c = -2$ and $d = 3$. The graph opens downwards and is flatter than $\lvert x\rvert$: going 2 to the right, it drops by 1, so $a = -0.5$. Hence $g(x) = -0.5 \cdot \lvert x + 2\rvert + 3$. [Show solution](?f=abs&a=-0.5&b=1&c=-2&d=3)

</details>

### Task 2: A point moves

Which point does the point $(2 \mid 4)$ of the standard parabola move to for $g(x) = 0.5 \cdot (x + 1)^2 + 3$?

<details>
<summary>Show solution</summary>

$a = 0.5$, $b = 1$, $c = -1$, $d = 3$. The point $(2 \mid 4)$ becomes $(2 + (-1) \mid 0.5 \cdot 4 + 3) = (1 \mid 5)$. Check: $g(1) = 0.5 \cdot 4 + 3 = 5$. [Show](?f=sq&a=0.5&b=1&c=-1&d=3)

</details>

### Task 3: Mind the bracket

By how much is the graph of $g(x) = (2x - 4)^2$ shifted compared with the graph of $f(x) = (2x)^2$?

<details>
<summary>Show solution</summary>

Factor out $b = 2$: $g(x) = \big(2(x - 2)\big)^2$. The graph is shifted by $c = 2$ to the right – not by $4$. [Show](?f=sq&a=1&b=2&c=2&d=0) For comparison, the wrong order “first shift by 4, then compress”: [Comparison](?f=sq&a=1&b=2&c=4&d=0&ord=swap)

</details>

### Task 4: Build a sine curve

Find $g(x) = a \cdot \sin(bx) + d$ with amplitude $2$, period $\pi$ and midline $y = 1$. Also give the range. [Load task](?f=sin&a=1&b=1&c=0&d=0)

<details>
<summary>Show solution</summary>

Amplitude $a = 2$, period $\frac{2\pi}{b} = \pi$, so $b = 2$, midline $d = 1$: $g(x) = 2\sin(2x) + 1$. The values vary by $2$ on either side of $1$: range $[-1, 3]$. [Show solution](?f=sin&a=2&b=2&c=0&d=1)

</details>

### Task 5: Reflected square root

Write $g(x) = \sqrt{2 - x}$ in the form $\sqrt{b(x - c)}$. Give the domain and calculate $g(-2)$.

<details>
<summary>Show solution</summary>

$2 - x = -(x - 2)$, so $b = -1$, $c = 2$: the square root is reflected in the $y$-axis and shifted $2$ to the right. The expression under the root must not be negative: $2 - x \ge 0$, so the domain is $(-\infty, 2]$. $g(-2) = \sqrt{4} = 2$. [Show](?f=sqrt&a=1&b=-1&c=2&d=0)

</details>

### Task 6: Asymptotes and zeros

a) Give the asymptotes and the zero of $g(x) = \frac{2}{x + 1} + 1$. b) Find the asymptote and the zero of $h(x) = -2^{x - 1} + 3$.

<details>
<summary>Show solution</summary>

a) The asymptotes $x = 0$ and $y = 0$ of $\frac{1}{x}$ move with $c = -1$ and $d = 1$: $x = -1$ and $y = 1$. Zero: $\frac{2}{x + 1} = -1 \Rightarrow x + 1 = -2 \Rightarrow x = -3$. [Show](?f=inv&a=2&b=1&c=-1&d=1)

b) Horizontal asymptote $y = 3$ (because $d = 3$). Zero: $2^{x - 1} = 3 \Rightarrow x - 1 = \log_2 3 \Rightarrow x = 1 + \log_2 3 \approx 2.585$. [Show](?f=exp&a=-1&b=1&c=1&d=3)

</details>

## Ideas for the classroom

- **Use:** Upper secondary, special properties of functions: shifting, stretching and reflecting graphs, applied to familiar types of functions. Please check the curriculum for the exact list of basic functions.
- **Steps on the board:** The timeline can be paused after each step. The class can first predict where the graph will move next and then check the prediction.
- **Guess the term:** With “Show the term and the effects” switched off, only the graph is shown and the sliders for $a$, $b$, $c$ and $d$ are hidden; “New task” rolls new values that can be read off uniquely, “Reveal the term” shows the answer and plays the steps. This works well in pairs.
- **Same logic, different functions:** The same four steps work in the same way for parabola, square root, hyperbola, sine and exponential function. It may be worth setting one transformation and only changing the basic function.
- **Model:** Parameters in tenths, $b = 0$ is not allowed. The sequence shown is one possible order; other orders also work if the parameters are adjusted accordingly. If “reduce motion” is switched on on the device, “Play step by step” jumps to the first step; “Step forward” continues.
- **Common stumbling blocks:**
  - “$f(x - 2)$ is shifted to the left.” – The minus inside the bracket means a shift to the **right**.
  - “$f(2x)$ is stretched horizontally.” – It is compressed, by the factor $\frac{1}{2}$.
  - In $f(2x - 4)$, $b$ is not factored out and the shift is read as $4$ instead of $2$.
  - The reflections are mixed up: $a < 0$ reflects in the $x$-axis, $b < 0$ in the $y$-axis.
  - For the parabola, students expect $b$ and $a$ to be uniquely determined – $(2x)^2 = 4x^2$ shows that this is not the case.
