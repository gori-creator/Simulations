## What is it about?

The **inverse function** $f^{-1}$ reverses $f$: from $f(3) = 5$ we get $f^{-1}(5) = 3$. This only works if every value occurs **exactly once** – every horizontal line meets the graph **at most once**. That is certainly the case if $f$ is **strictly monotonic**. $x^2$ on all of $\mathbb{R}$ is not invertible ($f(-2) = f(2) = 4$); restricted to $x \geq 0$ its inverse is $\sqrt{x}$, restricted to $x \leq 0$ it is $-\sqrt{x}$. Monotonicity is sufficient but not necessary: $\frac{1}{x}$ is invertible (it is even its own inverse).

To find $f^{-1}$: solve $y = f(x)$ for $x$, then swap $x$ and $y$. Graphically this is a **reflection in $y = x$**: $P(a \mid b)$ becomes $P'(b \mid a)$, and domain and range swap. Writing $D_f$ for the domain and $R_f$ for the range of $f$: $D_{f^{-1}} = R_f$, $R_{f^{-1}} = D_f$ (German textbooks write $W_f$ for the range, from *Wertemenge*). This is how $\ln x$ arises from $e^x$: $D_f = \mathbb{R}$ and $R_f = \mathbb{R}^+$, so $\ln x$ is defined only for $x > 0$.

Reflecting the tangent swaps the legs of the slope triangle, so for $b = f(a)$ and $f'(a) \neq 0$:

$$
\left(f^{-1}\right)'(b) = \frac{1}{f'(a)}, \qquad (\ln x)' = \frac{1}{e^{\ln x}} = \frac{1}{x}.
$$

If $f'(a) = 0$, the inverse has a **vertical tangent** at $(b \mid a)$, e.g. $0.5x^3$ at $0$.

## Try it

1. [Square root](?view=mirror&fn=sq&dom=pos&x=1.5): drag $P$ or $P'$, then press “Reflect in y = x” and watch the graph flip over, the intervals on the axes and the columns of the table.
2. [Line](?view=mirror&fn=lin&x=3): press “Working step by step”.
3. [x² on all of ℝ](?view=test&fn=sq&dom=all&x=2): sweep the horizontal line, then switch to a branch.
4. [eˣ and ln x](?view=deriv&fn=exp&x=1) and the [vertical tangent](?view=deriv&fn=cube&x=0).
5. [1/x](?view=mirror&fn=hyp&x=2) and, as an outlook, [restricted sine](?view=test&fn=sin&dom=pos&x=0.5).

## Tasks

### Task 1: Invert a linear function

Find the inverse of $f(x) = 2x - 1$ and $f^{-1}(5)$. [Load task](?view=mirror&fn=lin&x=3&show=0&inv=0&_hide=1)

<details>
<summary>Show solution</summary>

$x = \frac{y + 1}{2}$, so $f^{-1}(x) = \frac{x + 1}{2}$ and $f^{-1}(5) = 3$; check: $f(3) = 5$. [Show](?view=mirror&fn=lin&x=3)

</details>

### Task 2: Derivative of the square root

For $f(x) = x^2$, $x \geq 0$, and $P(1.5 \mid 2.25)$: find the slope of $\sqrt{x}$ at $2.25$. [Load task](?view=deriv&fn=sq&dom=pos&x=1.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(1.5) = 3$, so $\left(f^{-1}\right)'(2.25) = \frac{1}{3}$; check: $\frac{1}{2\sqrt{2.25}} = \frac{1}{3}$. [Show](?view=deriv&fn=sq&dom=pos&x=1.5)

</details>

### Task 3: Vertical tangent

Why is $\sqrt[3]{2x}$ not differentiable at $0$? Find $\left(f^{-1}\right)'(4)$ for $f(x) = 0.5x^3$. [Load task](?view=deriv&fn=cube&x=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(0) = 0$: the horizontal tangent becomes vertical. $f(2) = 4$ and $f'(2) = 6$, so $\left(f^{-1}\right)'(4) = \frac{1}{6}$. [Show](?view=deriv&fn=cube&x=2)

</details>

## Ideas for the classroom

- Use the views in order: “Invertible?” → “Reflect in y = x” → “Derivative of f⁻¹” leading to $(\ln x)' = \frac{1}{x}$.
- Draw a graph on a transparency and flip it along $y = x$, then compare with the animation.
- With `show=0` and `inv=0` the pictures work as exercises.
- **Common stumbling blocks:**
  - confusing $f^{-1}(x)$ with $\frac{1}{f(x)}$;
  - forgetting to swap $x$ and $y$, or forgetting the restricted domain (sign of $-\sqrt{x}$);
  - thinking “strictly monotonic” requires $f' > 0$ everywhere ($0.5x^3$ has $f'(0) = 0$);
  - evaluating $f'$ at $b$ instead of $a$ in $\left(f^{-1}\right)'(b) = \frac{1}{f'(a)}$.
