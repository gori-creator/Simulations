## What is it about?

A function $f$ assigns exactly one $y = f(x)$ to every $x$. The **inverse function** $f^{-1}$ goes the other way: it assigns to every function value its $x$ again. From $f(3) = 5$ we get $f^{-1}(5) = 3$.

**When does this work?** Only if every function value occurs **exactly once**. In the picture this means: every horizontal line meets the graph **at most once**. This is certainly the case if $f$ is **strictly monotonic**. For $f(x) = x^2$ on all of $\mathbb{R}$ it does not work, because $f(-2) = f(2) = 4$. If you restrict the domain to a strictly monotonic part, it works: for $x \geq 0$, $f^{-1}(x) = \sqrt{x}$; for $x \leq 0$, $f^{-1}(x) = -\sqrt{x}$. Monotonicity is **sufficient but not necessary**: $f(x) = \frac{1}{x}$ is not monotonic on $\mathbb{R}\setminus\{0\}$ and still invertible – it is even its own inverse.

**By calculation** you find $f^{-1}$ in two steps:

1. solve $y = f(x)$ for $x$,
2. swap $x$ and $y$.

*Example:* $y = 2x - 1 \;\Rightarrow\; x = \frac{y + 1}{2} \;\Rightarrow\; f^{-1}(x) = \frac{x + 1}{2}$.

**Graphically**, swapping $x$ and $y$ is the **reflection in the line $y = x$**: $P(a, b)$ becomes $P'(b, a)$. The segment $PP'$ is perpendicular to $y = x$, and its midpoint $M\left(\frac{a+b}{2}, \frac{a+b}{2}\right)$ lies on $y = x$. **Domain and range** also swap roles: $D_{f^{-1}} = W_f$ and $W_{f^{-1}} = D_f$ (here $W$ denotes the range). This is how the **natural logarithm** arises: $f(x) = e^x$ has $D_f = \mathbb{R}$ and $W_f = \mathbb{R}^+$, so $\ln x$ is only defined for $x > 0$ and takes all real values.

**Derivative of the inverse function.** If you reflect the tangent at $P$ as well, the legs of the slope triangle swap: $\frac{\Delta y}{\Delta x} = m$ becomes $\frac{\Delta x}{\Delta y} = \frac{1}{m}$. So for $b = f(a)$ and $f'(a) \neq 0$:

$$
\left(f^{-1}\right)'(b) = \frac{1}{f'(a)} .
$$

For $f(x) = e^x$ it follows that $(\ln x)' = \frac{1}{e^{\ln x}} = \frac{1}{x}$. If $f'(a) = 0$ (horizontal tangent), $f^{-1}$ has a **vertical tangent** at $(b, a)$ and is not differentiable there – for example $f(x) = 0.5x^3$ at $0$.

## Try it

1. [Square root function](?view=mirror&fn=sq&dom=pos&x=1.5): drag $P$ on the graph – or $P'$ directly. What do $P$, $P'$ and the point $M$ have to do with the line $y = x$?
2. Press “Reflect in y = x”: the graph flips over the line $y = x$ like a transparency. The dashed traces show that every point moves perpendicular to $y = x$. Also watch the coloured intervals on the axes and the columns of the table of values.
3. [Line](?view=mirror&fn=lin&x=3): press “Working step by step”. At the step “swap x and y” the graph flips over.
4. [x² on all of ℝ](?view=test&fn=sq&dom=all&x=2): let the horizontal line sweep. What is the largest number of intersections? Why is the mirror image not the graph of a function? Then switch to “increasing branch” and “decreasing branch”.
5. [0.5x³](?view=test&fn=cube&x=0): the tangent at $(0, 0)$ is horizontal. Is $f$ still strictly monotonic?
6. [eˣ and ln x](?view=deriv&fn=exp&x=1): compare the slope triangles at $P$ and $P'$. Let $P$ move: how are $m$ and $m'$ related? What becomes of a [horizontal tangent](?view=deriv&fn=cube&x=0)?
7. [1/x](?view=mirror&fn=hyp&x=2): why do the graphs of $f$ and $f^{-1}$ coincide?
8. Outlook: [restricted sine](?view=test&fn=sin&dom=pos&x=0.5). On $\left[-\frac{\pi}{2}; \frac{\pi}{2}\right]$, $\sin$ is strictly increasing; its inverse function is called $\arcsin$.

## Exercises

### Exercise 1: Inverting a linear function

Find the inverse function of $f(x) = 2x - 1$ and calculate $f^{-1}(5)$. [Load exercise](?view=mirror&fn=lin&x=3&show=0&inv=0&_hide=1)

<details>
<summary>Show solution</summary>

$y = 2x - 1 \Rightarrow y + 1 = 2x \Rightarrow x = \frac{y + 1}{2}$, so $f^{-1}(x) = \frac{x + 1}{2}$. Then $f^{-1}(5) = \frac{6}{2} = 3$; check: $f(3) = 6 - 1 = 5$. The slopes are $2$ and $\frac{1}{2} = 0.5$. [Show the solution](?view=mirror&fn=lin&x=3)

</details>

### Exercise 2: Cubic function

Find the inverse function of $f(x) = 0.5x^3$ and check it with the point $P(2, f(2))$. [Load exercise](?view=mirror&fn=cube&x=2&show=0&inv=0&_hide=1)

<details>
<summary>Show solution</summary>

$y = 0.5x^3 \Rightarrow x^3 = 2y \Rightarrow x = \sqrt[3]{2y}$, so $f^{-1}(x) = \sqrt[3]{2x}$ with $D_{f^{-1}} = \mathbb{R}$. Check: $f(2) = 0.5 \cdot 8 = 4$ and $f^{-1}(4) = \sqrt[3]{8} = 2$; the image point is $P'(4, 2)$. [Show the solution](?view=mirror&fn=cube&x=2)

</details>

### Exercise 3: Making it invertible

Explain why $f(x) = x^2$ is not invertible on $\mathbb{R}$. Give two restrictions of the domain on which $f$ is invertible, and in each case $f^{-1}$ with its domain and range. [Load exercise](?view=test&fn=sq&dom=all&x=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f(-2) = f(2) = 4$: the line $y = 4$ meets the graph twice. For $x \geq 0$, $f$ is strictly increasing, $f^{-1}(x) = \sqrt{x}$ with $D_{f^{-1}} = \mathbb{R}_0^+$ and $W_{f^{-1}} = \mathbb{R}_0^+$. For $x \leq 0$, $f$ is strictly decreasing, $f^{-1}(x) = -\sqrt{x}$ with $D_{f^{-1}} = \mathbb{R}_0^+$ and $W_{f^{-1}} = \mathbb{R}_0^-$. [First option](?view=test&fn=sq&dom=pos&x=2), [second option](?view=test&fn=sq&dom=neg&x=-2)

</details>

### Exercise 4: Exponential function and logarithm

For $f(x) = e^x$ and $f^{-1}(x) = \ln x$, give the domain and range of each. Which point of the graph of $\ln$ belongs to $P(1, e)$? [Load exercise](?view=mirror&fn=exp&x=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$D_f = \mathbb{R}$, $W_f = \mathbb{R}^+$, so $D_{f^{-1}} = \mathbb{R}^+$ and $W_{f^{-1}} = \mathbb{R}$. $P(1, e)$ corresponds to $P'(e, 1)$, because $\ln e = 1$. [Show the solution](?view=mirror&fn=exp&x=1)

</details>

### Exercise 5: Derivative of the square root function

$f(x) = x^2$ with $x \geq 0$, $P(1.5, 2.25)$. Calculate $f'(1.5)$ and from it the slope of $f^{-1}(x) = \sqrt{x}$ at $2.25$. Check with $(\sqrt{x})' = \frac{1}{2\sqrt{x}}$. [Load exercise](?view=deriv&fn=sq&dom=pos&x=1.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = 2x$, so $f'(1.5) = 3$. Hence $\left(f^{-1}\right)'(2.25) = \frac{1}{3} \approx 0.333$. Check: $\frac{1}{2\sqrt{2.25}} = \frac{1}{2 \cdot 1.5} = \frac{1}{3}$. In the slope triangle, reflection turns $\Delta x$ and $\Delta y$ into $\Delta y$ and $\Delta x$. [Show the solution](?view=deriv&fn=sq&dom=pos&x=1.5)

</details>

### Exercise 6: Vertical tangent

Explain without calculation why $f^{-1}(x) = \sqrt[3]{2x}$ is not differentiable at the origin, although $f(x) = 0.5x^3$ is differentiable there. Also calculate $\left(f^{-1}\right)'(4)$. [Load exercise](?view=deriv&fn=cube&x=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(0) = 1.5 \cdot 0^2 = 0$: the tangent to $f$ at $(0, 0)$ is horizontal; reflected, it becomes vertical – $\frac{1}{0}$ does not exist. For $b = 4$, $a = 2$ and $f'(2) = 1.5 \cdot 4 = 6$, so $\left(f^{-1}\right)'(4) = \frac{1}{6} \approx 0.167$. [Show the vertical tangent](?view=deriv&fn=cube&x=0) · [Show the point 4](?view=deriv&fn=cube&x=2)

</details>

## Ideas for the classroom

- **Use:** upper secondary: square root function (invertibility via strict monotonicity) and the natural logarithm function with its derivative. The sine with $\arcsin$ is meant as an outlook.
- **Sequence:** the three views can be used in order: first “Invertible?” (horizontal line), then “Reflect in y = x” (working and flipping), finally “Derivative of f⁻¹” as the route to $(\ln x)' = \frac{1}{x}$.
- **Hands-on:** draw a graph on a transparency and turn the transparency over along $y = x$ – then compare with the animation. With “Show solutions” switched off (`show=0`) and without the graph of $f^{-1}$ (`inv=0`), the pictures work as exercises.
- **Common pitfalls:**
  - $f^{-1}(x)$ is confused with $\frac{1}{f(x)}$ – the superscript $-1$ means “inverse” here, not “reciprocal”.
  - After solving, swapping $x$ and $y$ is forgotten.
  - The restriction of the domain (e.g. $x \geq 0$) is not taken into account, and then the sign in $-\sqrt{x}$ is missing.
  - “Strictly monotonic” is equated with “$f' > 0$”: $0.5x^3$ is strictly increasing, although $f'(0) = 0$.
  - In $\left(f^{-1}\right)'(b) = \frac{1}{f'(a)}$, $f'$ is evaluated at the wrong point ($b$ instead of $a$).
