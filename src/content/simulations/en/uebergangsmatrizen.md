---
description: "Transition graph, transition matrix and state vector: calculate step by step, interpret matrix powers and find the stable distribution."
---

## What is it about?

Many processes happen in **steps**: customers switch providers, a sunny day is usually followed by sun, eggs turn into larvae. The **state vector** $\vec x_n$ says how many are in which **state** after $n$ steps.

The transitions are shown in the **transition graph** and the **transition matrix** $M$. The entry $m_{ij}$ (row $i$, column $j$) is the share moving **from** state $j$ **to** state $i$, so every **column sums to 1**.

$$
\vec x_{n+1} = M \cdot \vec x_n \qquad\Rightarrow\qquad \vec x_n = M^n \cdot \vec x_0
$$

- $(M^n)_{ij}$ is the probability of getting from $j$ to $i$ in $n$ steps – the sum over all paths of length $n$.
- A **stable distribution** (fixed vector) satisfies $M\vec x = \vec x$: solve $(M - E)\vec x = \vec 0$ with $x_1 + \dots + x_k = 1$.
- For a *regular* chain $M^n$ approaches a **limit matrix** with identical columns. **Absorbing** states keep everything that arrives; **cyclic** processes never settle.
- Going **backwards**: $\vec x_{n-1} = M^{-1}\vec x_n$ (if $M$ is invertible). Negative entries mean you went back too far.

## Try it

1. Press "Next step" a few times and watch the dots flow along the arrows. [Customers](?sc=kunden&view=step&n=0)
2. Tap a matrix entry: its arrow lights up. [Weather](?sc=wetter&view=step&n=1)
3. Start with everything in A, then in C, and run to $n = 20$. [Stable distribution](?sc=kunden&view=fix&n=20)
4. Look at $M^2$ for the weather and tap its entries. [M²](?sc=wetter&view=pow&n=2&ci=1&cj=2)
5. Absorbing states: [studies](?sc=studium&view=fix&n=12). A cycle: [beetles](?sc=kaefer&view=pow&n=3&ci=1&cj=1).

## Tasks

### Task 1: The day after tomorrow

Today it is sunny. What is the probability of sun the day after tomorrow?

<details>
<summary>Show solution</summary>

$0.9 \cdot 0.9 + 0.1 \cdot 0.2 = 0.83 = (M^2)_{11}$. [Show](?sc=wetter&view=pow&n=2&ci=1&cj=1)

</details>

### Task 2: One year of switching

A, B and C have 400, 350 and 250 customers. How many after one year?

<details>
<summary>Show solution</summary>

$415$, $335$ and $250$ (the total stays 1000). [Show](?sc=kunden&view=step&n=0)

</details>

### Task 3: Stable distribution

Find the stable distribution of the customers.

<details>
<summary>Show solution</summary>

$(\tfrac{7}{16} \mid \tfrac{5}{16} \mid \tfrac14)$, i.e. 437.5, 312.5 and 250 customers. [Show](?sc=kunden&view=fix&n=20)

</details>

### Task 4: Degree or drop-out?

Each year 30 % graduate and 10 % drop out. Which share graduates in the end?

<details>
<summary>Show solution</summary>

$\frac{0.3}{1 - 0.6} = 0.75$, so 75 %. [Show](?sc=studium&view=fix&n=12)

</details>

## Ideas for the classroom

- **Use:** transition processes and Markov chains in upper secondary (linear algebra). Start with the graph, practise multiplication in the matrix view, form conjectures with the course chart.
- **Own matrices:** enter textbook examples under "Own matrix" (rows separated by semicolons, fractions like 1/3 allowed).
- **Common stumbling blocks:**
  - Rows and columns swapped – here column $j$ says where things go **from** $j$; some books use the transpose (row sums 1).
  - The stable distribution does not depend on the start for regular chains.
  - Negative entries when calculating backwards are overlooked.
