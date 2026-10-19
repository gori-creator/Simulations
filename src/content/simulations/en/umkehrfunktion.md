---
description: "Interactive simulation for upper secondary: inverse functions as a reflection in the line y = x – with a draggable point and its image, an animation, the steps for x², eˣ, 1/x and more and the counterexample x² on all of ℝ."
---

## What is it about?

The **inverse function** $f^{-1}$ reverses $f$. This only works if every value occurs **once**, e.g. if $f$ is strictly monotonic. $x^2$ on all of $\mathbb{R}$ is not invertible ($f(-2) = f(2)$); restricted to $x \geq 0$ its inverse is $\sqrt{x}$.

To find $f^{-1}$: solve $y = f(x)$ for $x$, then swap $x$ and $y$. Graphically this is a **reflection in $y = x$**: $P(a \mid b)$ becomes $P'(b \mid a)$, and domain and range swap.

## Try it

1. [Square root](?fn=sq&dom=pos&x=1.5): drag $P$ and press “Reflect in y = x”.
2. [x² on all of ℝ](?fn=sq&dom=all&x=1.5): why is the reflection not a function?
3. [eˣ and ln x](?fn=exp&x=1) and [1/x](?fn=hyp&x=2).

**Horizontal line test:** $f$ is invertible exactly when every horizontal line meets the graph at most once ([try it](?fn=sq&dom=all&hl=1&c=2)). **Slope of the inverse:** reflecting swaps $\Delta x$ and $\Delta y$, so $\left(f^{-1}\right)'(f(a)) = \frac{1}{f'(a)}$ ([see it](?fn=exp&x=1&tan=1)).

## Tasks

### Task 1: Find the inverse

Find the inverse of $f(x) = 0.5x^3$. [Load task](?fn=cube&x=1.5&show=0&inv=0&_hide=1)

<details>
<summary>Show solution</summary>

$x = \sqrt[3]{2y}$, so $f^{-1}(x) = \sqrt[3]{2x}$. [Show](?fn=cube&x=1.5)

</details>

### Task 2: Making it invertible

Restrict the domain of $x^2$ in two ways so that it becomes invertible.

<details>
<summary>Show solution</summary>

$x \geq 0$: $\sqrt{x}$; $x \leq 0$: $-\sqrt{x}$. [Show](?fn=sq&dom=neg&x=-1.5)

</details>

### Task: Shifted parabola

Find the inverse of $f(x) = (x-2)^2 + 1$, $x \geq 2$. [Load task](?fn=shift&x=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$x = 2 + \sqrt{y - 1}$, so $f^{-1}(x) = 2 + \sqrt{x - 1}$ with domain $[1;\,\infty[$ and range $[2;\,\infty[$. [Show](?fn=shift&x=3)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Draw graphs on transparencies and flip them along $y = x$.
- **Common stumbling blocks:** confusing $f^{-1}(x)$ with $\frac{1}{f(x)}$; forgetting to swap $x$ and $y$.
