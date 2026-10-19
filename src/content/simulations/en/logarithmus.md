---
description: "Interactive simulation on logarithms as the inverse of exponentiation: graphs of bˣ and log_b x with an animated reflection in y = x, the laws of logarithms as arrows on a logarithmic scale, and solving exponential equations with the change of base."
---

## What is it about?

Exponentiation asks: what is $2^3$? Answer: $8$. The **logarithm** asks the reverse question: **“2 to the power of what gives 8?”** Answer: $3$, written $\log_2 8 = 3$.

$$
\log_b y = x \quad\Longleftrightarrow\quad b^x = y \qquad (b > 0,\; b \neq 1,\; y > 0)
$$

- **Special logarithms:** $\lg y = \log_{10} y$ (common logarithm) and $\ln y = \log_e y$ (natural logarithm, $e \approx 2.718$).
- **Not defined** for $y \le 0$, because $b^x$ is always positive. The base $b = 1$ is excluded since $1^x = 1$.
- $\log_b 1 = 0$ and $\log_b b = 1$; for $b > 1$, numbers between $0$ and $1$ have negative logarithms, e.g. $\log_2 0.5 = -1$.
- **Inverse function:** the graph of $y = \log_b x$ is the reflection of $y = b^x$ in the line $y = x$: the point $(x \mid b^x)$ becomes $(b^x \mid x)$. Key features: $D = \mathbb{R}^+$, $W = \mathbb{R}$, zero at $x = 1$, point $(b \mid 1)$, vertical asymptote $x = 0$, increasing for $b > 1$ and decreasing for $0 < b < 1$.
- **Laws:** $\log_b(uv) = \log_b u + \log_b v$, $\log_b \frac{u}{v} = \log_b u - \log_b v$, $\log_b(u^r) = r \log_b u$ – they follow from the laws of exponents.
- **Exponential equations:** $b^x = c \Rightarrow x = \log_b c = \frac{\lg c}{\lg b}$ (change of base), e.g. $2^x = 10 \Rightarrow x = \frac{1}{0.30103} \approx 3.3219$.

## Try it

1. Drag the point $P$ along the blue graph of $y = 2^x$. Its mirror image $P'$ on the red graph has swapped coordinates: $\log_2 4 = 2$.
2. Click **Reflect in y = x** and watch the exponential graph fold over onto the logarithmic graph.
3. Drag $B(1 \mid b)$ below $1$ – both graphs become decreasing. [Load example](?b=0.5&x=-2)
4. Open **Laws of logarithms** and click **Put the arrows together**: arrows of length $2$ and $3$ give $5$, and $4 \cdot 8 = 32 = 2^5$ – the idea of the slide rule. [Load example](?view=laws)
5. Open **Solving an exponential equation** and drag $S$. Between which whole numbers does the solution of $2^x = 10$ lie? [Load example](?view=solve&c=10)

## Tasks

### Task 1: Mental logarithms

Find $\log_2 32$, $\log_3 \frac{1}{9}$, $\lg 0.001$ and $\log_4 2$.

<details>
<summary>Show solution</summary>

$5$ (since $2^5 = 32$), $-2$ (since $3^{-2} = \frac{1}{9}$), $-3$ (since $10^{-3} = 0.001$), $0.5$ (since $4^{0.5} = 2$). [Show in the simulation](?view=solve&c=32)

</details>

### Task 2: Solve an equation

Solve $3^x = 50$ and check your answer. [Load task](?view=solve&b=3&c=50&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$3^3 = 27 < 50 < 81 = 3^4$, so $3 < x < 4$. $x = \frac{\lg 50}{\lg 3} = \frac{1.69897}{0.47712} \approx 3.561$; check: $3^{3.561} \approx 50.0$. [Show in the simulation](?view=solve&b=3&c=50)

</details>

### Task 3: Using the laws

Work out $\lg 20 + \lg 50$ and $\log_2 48 - \log_2 3$ without a calculator.

<details>
<summary>Show solution</summary>

$\lg(20 \cdot 50) = \lg 1000 = 3$ and $\log_2 \frac{48}{3} = \log_2 16 = 4$. [Show](?view=laws&b=10&u=20&v=50) · [Show](?view=laws&law=quot&u=48&v=3)

</details>

### Task 4: Doubling time

Savings grow by $5\,\%$ per year. After how many years have they doubled?

<details>
<summary>Show solution</summary>

$1.05^x = 2 \Rightarrow x = \frac{\lg 2}{\lg 1.05} \approx 14.2$, so in the 15th year. [Show in the simulation](?view=solve&b=1.05&c=2)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- **Use:** introducing logarithms as “to the power of what?”, exponential equations and the laws of logarithms (grade 10 in Bavaria); the logarithmic function and $\ln$ as the inverse of $e^x$ come later (upper secondary) – please check your curriculum.
- **Slide rule:** the laws view shows why multiplication became addition of lengths before calculators existed.
- **Common stumbling blocks:**
  - $\log(u + v) = \log u + \log v$ – wrong; the law is about the **product**.
  - “$\log_2 0.5$ does not exist” – it does: $-1$. Only numbers $\le 0$ have no logarithm.
  - Swapping numerator and denominator in the change of base – the check $b^x \approx c$ reveals it at once.
