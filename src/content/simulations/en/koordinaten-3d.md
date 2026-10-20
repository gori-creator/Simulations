---
description: "Three-dimensional coordinates in six views: a point with coordinate path, projections and mirror point, a cuboid with space diagonal, the distance between two points, a find-the-point task, top/front/side views with a riddle and the eight octants with random points – rotatable, with views from above, the front and the side."
---

## What is it about?

In a **three-dimensional coordinate system** the $x_1$ axis points towards you, the $x_2$ axis to the right and the $x_3$ axis up. A point $P(p_1, p_2, p_3)$ is reached along its **coordinate path**: $p_1$ units in the $x_1$ direction, then $p_2$, then $p_3$.

Two axes span a **coordinate plane**, e.g. the $x_1x_2$ plane ($x_3 = 0$). The projection of $P(2, 3, 4)$ onto it is $P_{12}(2, 3, 0)$. The distance from the origin is $\sqrt{p_1^2 + p_2^2 + p_3^2}$.

**Distance:** $\overline{PQ} = \sqrt{\Delta x_1^2 + \Delta x_2^2 + \Delta x_3^2}$ – Pythagoras twice, e.g. $P(1, 2, 2)$ to the origin: $3$. The space diagonal of a $4 \times 3 \times 2$ cuboid is $\sqrt{29} \approx 5.39$. A point in a coordinate plane or on an axis makes that plane or axis light up.

**Views:** the top view shows $x_1$ and $x_2$, the front view $x_2$ and $x_3$, the side view $x_1$ and $x_3$. Two views determine a point: $T'(2, -1)$ and $T''(-1, 3)$ give $T(2, -1, 3)$. **Octants:** the coordinate planes split space into eight octants (I–IV above, V–VIII below); points on a plane lie in none.

A drawing in perspective is ambiguous – many points in space land on the same spot. Helper lines or rotating the view reveal where a point really is.

## Try it

1. Press **Path from the origin** to follow the path to $P(3, 4, 2)$. [Load example](?x=3&y=4&z=2)
2. Switch the **view**: from above, the front and the side. Which coordinates can you read off? [Load example](?x=2&y=3&z=3&proj=1)
3. Switch to the **cuboid** and tap its corners. [Cuboid](?mode=box&x=0&y=0&z=0&a=4&b=3&c=2)
4. Drag $P$ and $Q$ in the **distance** view. [Distance](?mode=dist&x=3&y=4&z=2&qx=-1&qy=1&qz=-2)
5. **Find the point** by dragging. [Find the point](?mode=find&x=1&y=1&z=1)
6. Tap a view in **Views** – the camera turns. Then try the riddle. [Views](?mode=views&fig=house)
7. Tap an octant and drop **50 random points**. [Octants](?mode=oct&x=2&y=-3&z=2)

## Tasks

### Task 1: Reading coordinates

Read off the coordinates of the point. [Load task](?x=-2&y=3&z=-1.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(-2, 3, -1.5)$ – below the $x_1x_2$ plane. [Show in simulation](?x=-2&y=3&z=-1.5)

</details>

### Task 2: Corners of a cuboid

A cuboid has corner $A(1, -2, 1)$ and edges $a = 2$, $b = 3$, $c = 2.5$. Give all corners. [Load task](?mode=box&x=1&y=-2&z=1&a=2&b=3&c=2.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$A(1, -2, 1)$, $B(3, -2, 1)$, $C(3, 1, 1)$, $D(1, 1, 1)$, $E(1, -2, 3.5)$, $F(3, -2, 3.5)$, $G(3, 1, 3.5)$, $H(1, 1, 3.5)$. [Show in simulation](?mode=box&x=1&y=-2&z=1&a=2&b=3&c=2.5)

</details>

### Task 3: Distance

Find the distance between $P(3, 4, 2)$ and $Q(-1, 1, -2)$. [Load task](?mode=dist&x=3&y=4&z=2&qx=-1&qy=1&qz=-2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\sqrt{16 + 9 + 16} = \sqrt{41} \approx 6.40$. [Show in simulation](?mode=dist&x=3&y=4&z=2&qx=-1&qy=1&qz=-2)

</details>

### Task 4: Octants

In which octant are $A(2, -3, 2)$, $B(-1, -2, -3)$ and $C(2, 0, 3)$? [Load task](?mode=oct&x=2&y=-3&z=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$A$: IV, $B$: VII, $C$ lies in the $x_1x_3$ plane – no octant. [Show in simulation](?mode=oct&x=2&y=0&z=3)

</details>

## Ideas for the classroom

- Reading points without rotating first, then discussing why it is ambiguous, can motivate coordinate paths.
- **Common stumbling blocks:** confusing $x_1$ with the horizontal axis of the plane; ignoring the foot point; setting the wrong coordinate to $0$ in a projection.
