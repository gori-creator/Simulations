## What is it about?

Many quantities depend on **two** inputs. The height of a landscape depends on the position east–west and north–south, the volume of a cylinder on its radius and height. A **function of two variables** assigns a value $z = f(x, y)$ to every pair $(x \mid y)$.

### The graph is a surface

If you plot the value $z = f(x, y)$ upwards above every point $(x \mid y)$ of the base plane, you get a **surface in space**:

- $f(x, y) = \tfrac12(x^2 + y^2)$ gives a bowl (**paraboloid**) with its minimum at the origin.
- $f(x, y) = \tfrac12(x^2 - y^2)$ gives a **saddle**.
- $f(x, y) = ax + by + c$ gives a **plane**.

### Section curves

If you hold one variable fixed, the surface turns into an ordinary curve:

- For a fixed $y = y_0$ you get the curve $x \mapsto f(x, y_0)$. It lies in a plane parallel to the $x$-$z$ plane.
- For a fixed $x = x_0$ you get the curve $y \mapsto f(x_0, y)$.

For the saddle $\tfrac12(x^2 - y^2)$, the section with $y = 0$ is a parabola opening upwards, and the section with $x = 0$ is one opening downwards.

### Partial derivatives

The slope of the section curve in the $x$-direction is called the **partial derivative with respect to $x$**, written $f_x$ or $\tfrac{\partial f}{\partial x}$. You differentiate with respect to $x$ and treat $y$ as a constant. $f_y$ is worked out the same way.

Example: $f(x, y) = x^2 y + 3y$ has $f_x = 2xy$ and $f_y = x^2 + 3$.

In the simulation, $f_x$ and $f_y$ are the slopes of the two dashed **tangents** at the point $P$.

### Horizontal points

If both partial derivatives are zero, the surface is horizontal at $P$. This can be a **maximum**, a **minimum** or a **saddle point**. At a saddle point it goes uphill in one direction and downhill in the other, like a mountain pass.

## Try it

- [Saddle point](?fn=sattel&x0=0&y0=0&cut=beide&tan=1): Turn the view. What shape are the two section curves?
- [Minimum](?fn=paraboloid&x0=0&y0=0&cut=beide&tan=1): Drag the point away. How do the tangents change?
- [Wave](?fn=welle&x0=0.5&y0=1&cut=x&tan=1): Look for points where the surface is horizontal.
- [Plane](?fn=ebene&x0=1&y0=-1&cut=beide&tan=1): Why are the slopes the same everywhere?

## Exercises

**1. Function value.** For $f(x, y) = \tfrac12(x^2 - y^2)$, work out the value at the point $(2 \mid 1)$. [Load exercise](?fn=sattel&x0=2&y0=1&_hide=1)

<details><summary>Show solution</summary>

$f(2, 1) = \tfrac12(4 - 1) = 1.5$.

</details>

**2. Partial derivatives.** Find $f_x$ and $f_y$ for $f(x, y) = x^2 y + 3y$.

<details><summary>Show solution</summary>

$f_x = 2xy$, because $y$ is treated like a number. And $f_y = x^2 + 3$.

</details>

**3. Section curve.** Which curve do you get by cutting the paraboloid $\tfrac12(x^2 + y^2)$ with the plane $y = 1$? [Load exercise](?fn=paraboloid&x0=0&y0=1&cut=x&_hide=1)

<details><summary>Show solution</summary>

$z = \tfrac12 x^2 + \tfrac12$. That is the standard parabola compressed by the factor $\tfrac12$ and shifted up by $\tfrac12$.

</details>

**4. Slope at a point.** What are the partial derivatives of the bell $2e^{-(x^2+y^2)/2}$ at the point $(0 \mid 0)$? What does that mean? [Load exercise](?fn=glocke&x0=0&y0=0&_hide=1)

<details><summary>Show solution</summary>

Both are $0$. The surface is horizontal there, and it is the maximum of the bell.

</details>
