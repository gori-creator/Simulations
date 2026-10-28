## What is it about?

In a right triangle the side opposite the right angle is the **hypotenuse**; the other two sides are the **legs**. Seen from an acute angle, one leg lies next to the angle (**adjacent side**), the other lies opposite it (**opposite side**). For the angle $\alpha$:

$$
\begin{gathered}
\sin \alpha = \frac{\text{opposite}}{\text{hypotenuse}} \\[4pt]
\cos \alpha = \frac{\text{adjacent}}{\text{hypotenuse}} \\[4pt]
\tan \alpha = \frac{\text{opposite}}{\text{adjacent}}
\end{gathered}
$$

In triangle $ABC$ with the right angle at $C$, for $\alpha$ (at $A$) this gives $\sin \alpha = \frac{a}{c}$, $\cos \alpha = \frac{b}{c}$ and $\tan \alpha = \frac{a}{b}$.

**Why do the ratios depend on the angle only?** All right triangles with the same angle $\alpha$ are **similar**: you get them by an enlargement with its centre at the vertex of $\alpha$. Every side is multiplied by the same factor $k$, and $k$ cancels in the fraction: $\frac{k \cdot a}{k \cdot c} = \frac{a}{c}$.

**The roles depend on the angle.** For $\beta$ (at $B$) the legs swap roles: $a$ becomes the adjacent side, $b$ the opposite side. Since $\beta = 90° - \alpha$,

$$
\sin \alpha = \cos(90° - \alpha), \qquad \cos \alpha = \sin(90° - \alpha).
$$

**On the unit circle** the hypotenuse is $1$. Then the opposite side itself is $\sin \alpha$ and the adjacent side is $\cos \alpha$; the point $P$ has the coordinates $(\cos \alpha, \sin \alpha)$. Pythagoras' theorem becomes $(\sin \alpha)^2 + (\cos \alpha)^2 = 1$, and $\tan \alpha = \frac{\sin \alpha}{\cos \alpha}$. On the tangent $x = 1$ the adjacent side is $1$, so $\tan \alpha$ can be read off there as a length.

**Special values** (exact): $\sin 30° = \frac12$, $\sin 45° = \frac{\sqrt2}{2} \approx 0.7071$, $\sin 60° = \frac{\sqrt3}{2} \approx 0.8660$; $\tan 30° = \frac{\sqrt3}{3} \approx 0.5774$, $\tan 45° = 1$, $\tan 60° = \sqrt3 \approx 1.732$.

**Backwards:** If you know two sides, form the matching ratio and find the angle with the inverse key, e.g. $\alpha = \sin^{-1}(0.6) \approx 36.87°$. For $\sin$ and $\cos$ the ratio must be less than $1$ – the hypotenuse is the longest side.

## Try it

1. [Start](?al=35&c=6): drag vertex $B$. Which side is the opposite side of $\alpha$? What happens to $\sin \alpha$ if you only change $c$?
2. Press **“Grow similar triangles”**: the triangle grows from vertex $A$, the copies with $k = 0.25;\ 0.5;\ 0.75$ stay in place. Which numbers in the table change, which do not?
3. Tap the angle arc at $B$ or press “Switch reference angle”. Watch where the names “opposite” and “adjacent” move. [Reference angle β](?ref=b&al=35&c=8)
4. Choose [tangent](?f=tan&al=45&c=7). Why is $\tan 45° = 1$? What happens to $\tan \alpha$ at [85°](?f=tan&al=85&c=10)?
5. [Unit circle](?mode=unit&al=30): press “Sweep the angle” and watch the table of special values. When is $\sin \alpha = \cos \alpha$?
6. [Finding the angle](?mode=inv&f=sin&go=3&hy=5): let the solution be shown step by step. What happens if the opposite side is longer than the hypotenuse? [Special case](?mode=inv&f=sin&go=6&hy=5)
7. Applications: [ramp](?mode=app&app=ramp&pc=6&rh=0.5), [ladder](?mode=app&app=ladder&ll=4&al=70), [tower](?mode=app&app=tower&d=50&al=32). Press “Play the calculation” and drag the points in the picture.

## Tasks

### Task 1: Finding sides

In a right triangle ($\gamma = 90°$), $c = 6\,\text{cm}$ and $\alpha = 30°$. Find $a$ and $b$. [Load task](?al=30&c=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$a = c \cdot \sin \alpha = 6\,\text{cm} \cdot \frac12 = 3\,\text{cm}$; $b = c \cdot \cos \alpha = 6\,\text{cm} \cdot \frac{\sqrt3}{2} = 3\sqrt3\,\text{cm} \approx 5.20\,\text{cm}$. [Show solution](?al=30&c=6)

</details>

### Task 2: The other angle

In the triangle with $\alpha = 35°$ and $c = 6\,\text{cm}$, $a \approx 3.44\,\text{cm}$ and $b \approx 4.91\,\text{cm}$. Write $\sin \beta$ and $\cos \beta$ as ratios of sides and work them out. What do you notice? [Load task](?ref=b&al=35&c=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

For $\beta$, $b$ is the opposite side and $a$ the adjacent side: $\sin \beta = \frac{b}{c} \approx \frac{4.91}{6} \approx 0.819$, $\cos \beta = \frac{a}{c} \approx \frac{3.44}{6} \approx 0.574$. So $\sin 55° = \cos 35°$ and $\cos 55° = \sin 35°$, because $\beta = 90° - \alpha$. [Show solution](?ref=b&al=35&c=6)

</details>

### Task 3: Angle from two sides

Opposite side $3\,\text{cm}$, hypotenuse $5\,\text{cm}$. How big is $\alpha$? How long is the adjacent side? [Load task](?mode=inv&f=sin&go=3&hy=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\sin \alpha = \frac{3}{5} = 0.6$, so $\alpha = \sin^{-1}(0.6) \approx 36.87°$. Adjacent side $= \sqrt{5^2 - 3^2}\,\text{cm} = 4\,\text{cm}$; check: $\cos \alpha = 0.8$, $\tan \alpha = 0.75$. [Show solution](?mode=inv&f=sin&go=3&hy=5)

</details>

### Task 4: Wheelchair ramp

An entrance step is $0.5\,\text{m}$ high. A ramp should have a gradient of $6\,\%$. What is the angle of the slope, and how long is the horizontal run? [Load task](?mode=app&app=ramp&pc=6&rh=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\tan \alpha = \frac{6}{100} = 0.06$, so $\alpha = \tan^{-1}(0.06) \approx 3.43°$ (not $6°$!). Horizontal: $l = \frac{0.5\,\text{m}}{0.06} \approx 8.33\,\text{m}$; the sloping ramp is $\sqrt{8.33^2 + 0.5^2}\,\text{m} \approx 8.35\,\text{m}$ long. [Show solution](?mode=app&app=ramp&pc=6&rh=0.5)

</details>

### Task 5: Ladder against a wall

A $4\,\text{m}$ ladder stands at an angle of $70°$ to the ground. How high does it reach, and how far is its foot from the wall? Is it safe? [Load task](?mode=app&app=ladder&ll=4&al=70&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$h = 4\,\text{m} \cdot \sin 70° \approx 3.76\,\text{m}$, $e = 4\,\text{m} \cdot \cos 70° \approx 1.37\,\text{m}$. $70°$ lies within the rule of thumb ($65°$ to $75°$). [Show solution](?mode=app&app=ladder&ll=4&al=70)

</details>

### Task 6: How tall is the tower?

From a distance of $50\,\text{m}$ you see the top of the tower at an angle of elevation of $32°$. The instrument is $1.5\,\text{m}$ above the ground. [Load task](?mode=app&app=tower&d=50&al=32&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\tan 32° = \frac{x}{50\,\text{m}}$, so $x = 50\,\text{m} \cdot \tan 32° \approx 31.24\,\text{m}$. Height of the tower $h \approx 31.24\,\text{m} + 1.5\,\text{m} = 32.74\,\text{m}$. [Show solution](?mode=app&app=tower&d=50&al=32)

</details>

### Task 7: True or false? (puzzle)

a) “$\sin \alpha$ can never be greater than $1$, but $\tan \alpha$ can.” b) “For every acute angle, $(\sin \alpha)^2 + (\cos \alpha)^2 = 1$.” Explain both statements.

<details>
<summary>Show solution</summary>

a) The hypotenuse is the longest side, so $\frac{\text{opposite}}{\text{hypotenuse}} < 1$. For the tangent the adjacent side is in the denominator; for $\alpha > 45°$ the opposite side is longer than the adjacent side, so $\tan \alpha > 1$. [Show special case](?mode=inv&f=sin&go=6&hy=5)

b) By Pythagoras, $a^2 + b^2 = c^2$. Dividing by $c^2$ gives $\left(\frac{a}{c}\right)^2 + \left(\frac{b}{c}\right)^2 = 1$. [Show on the unit circle](?mode=unit&al=35)

</details>

## Ideas for the classroom

- **Use:** About grade 9, trigonometry in the right triangle; the unit circle leads on to the sine and cosine functions.
- **Discover before naming:** The animation “Grow similar triangles” can come before the definition: what stays the same when the triangle grows? Afterwards students could measure triangles with $\alpha = 35°$ that they have drawn themselves.
- **Exercise mode:** With “Show results” off (`show=0`) the unknowns appear as “?” in the picture. This turns every topic into an exercise.
- **Calculator:** Check degree mode (DEG); the inverse keys $\sin^{-1}$, $\cos^{-1}$, $\tan^{-1}$ give the angle.
- **Common stumbling blocks:**
  - Opposite and adjacent sides are chosen without looking at the reference angle – switching to $\beta$ helps here.
  - The hypotenuse is confused with the “slanted” side, even when the triangle is turned.
  - A gradient in percent is read as an angle in degrees ($6\,\% \approx 3.43°$, but $6° \approx 10.5\,\%$).
  - The eye height is forgotten when measuring a tower.
  - The calculator is set to radians.
