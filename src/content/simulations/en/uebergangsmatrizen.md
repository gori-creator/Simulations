---
description: "Transition graph, transition matrix and state vector: calculate step by step, interpret matrix powers and find the stable distribution."
---

## What is it about?

Many processes happen in **steps**: customers switch a little between providers every year, a sunny day is usually followed by sun again, eggs turn into larvae. How many are in which **state** after $n$ steps is summed up by the **state vector** $\vec x_n$.

The transitions are shown in the **transition graph** (arrows with probabilities) and in the **transition matrix** $M$. The entry $m_{ij}$ in row $i$, column $j$ gives the share that moves **from** state $j$ **to** state $i$. That is why in a transition matrix every **column sum is 1**: from every state, everything goes somewhere.

$$
\vec x_{n+1} = M \cdot \vec x_n \qquad\Rightarrow\qquad \vec x_n = M^n \cdot \vec x_0
$$

For the weather with $M = \begin{pmatrix} 0.9 & 0.2 \\ 0.1 & 0.8 \end{pmatrix}$ and sun today, $\vec x_0 = \begin{pmatrix} 1 \\ 0 \end{pmatrix}$, tomorrow is $\vec x_1 = \begin{pmatrix} 0.9 \\ 0.1 \end{pmatrix}$.

- **Matrix powers:** the entry $(M^n)_{ij}$ is the probability of getting from $j$ to $i$ in $n$ steps. It is the sum over all paths of length $n$ (path rules as in a tree diagram).
- **Stable distribution (fixed vector):** a vector with $M \cdot \vec x = \vec x$. You solve $(M - E)\cdot\vec x = \vec 0$ together with $x_1 + \dots + x_k = 1$.
- **In the long run:** for a *regular* chain, $M^n$ approaches a **limit matrix** whose columns are all equal – wherever you start. With **absorbing** states (whoever is there stays) the end depends on the start. In **cyclic** processes $M^n$ never settles down.
- **Backwards:** if $M$ is invertible, $\vec x_{n-1} = M^{-1}\cdot\vec x_n$. Negative entries show that you have calculated too far back.
- **Populations:** in population matrices (e.g. eggs → larvae → beetles) the column sums are not 1; the population can grow, shrink or repeat cyclically.

## Try it

1. Press “Next step” several times and watch the dots flow along the arrows. The width of an arrow shows how much is moving along it. [Load customers](?sc=kunden&view=step&n=0)
2. Tap an entry of the matrix: the matching arrow lights up, and the row is worked out below. [Weather, one step](?sc=wetter&view=step&n=1)
3. Start once with all customers at A and once at C (tap the state in the graph) and run to $n = 20$. What do you notice at the end? [Stable distribution](?sc=kunden&view=fix&n=20)
4. Look at $M^2$ for the weather and tap the entries. The paths are listed. [Look at M²](?sc=wetter&view=pow&n=2&ci=1&cj=2)
5. The studies example has two absorbing states. What does the limit matrix look like? [Studies](?sc=studium&view=fix&n=12)
6. The beetles return to the same population every three steps. Check $M^3$. [Beetles](?sc=kaefer&view=pow&n=3&ci=1&cj=1)
7. Calculate backwards for the weather (negative $n$). From when on does it become impossible? [Backwards](?sc=wetter&view=back&n=-1)

## Exercises

### Exercise 1: The day after tomorrow

The sun is shining today. What is the probability that it shines the day after tomorrow? [Load exercise](?sc=wetter&view=step&n=0&_hide=1)

<details>
<summary>Show solution</summary>

Two paths lead from sun to sun: S → S → S with $0.9 \cdot 0.9 = 0.81$ and S → R → S with $0.1 \cdot 0.2 = 0.02$. Together $0.83$, which is the entry $(M^2)_{11}$. [Show in the simulation](?sc=wetter&view=pow&n=2&ci=1&cj=1)

</details>

### Exercise 2: One year of customers switching

Providers A, B and C have 400, 350 and 250 customers. Calculate the numbers of customers after one year. [Load exercise](?sc=kunden&view=step&n=0&_hide=1)

<details>
<summary>Show solution</summary>

$A: 0.8 \cdot 400 + 0.2 \cdot 350 + 0.1 \cdot 250 = 415$, $B: 0.1 \cdot 400 + 0.7 \cdot 350 + 0.2 \cdot 250 = 335$, $C: 0.1 \cdot 400 + 0.1 \cdot 350 + 0.7 \cdot 250 = 250$. The total stays 1000. [Show in the simulation](?sc=kunden&view=step&n=0)

</details>

### Exercise 3: Stable distribution

Find the stable distribution of the customers switching. How many of the 1000 customers does A have in the long run?

<details>
<summary>Show solution</summary>

From $(M - E)\cdot\vec x = \vec 0$ it follows that $0.2a = 0.2b + 0.1c$ and $0.3c = 0.1a + 0.1b$, so $a = 1.75c$, $b = 1.25c$. With $a + b + c = 1$: $c = \tfrac14$, $b = \tfrac{5}{16}$, $a = \tfrac{7}{16}$. In the long run A has $437.5$ customers. [Show in the simulation](?sc=kunden&view=fix&n=20)

</details>

### Exercise 4: Graduate or drop out?

Each year 30% of the students graduate, 10% drop out and the rest keep studying. What share graduates in the end?

<details>
<summary>Show solution</summary>

Whoever stays a student faces the same choice again every year. The share that graduates is $0.3 + 0.6 \cdot 0.3 + 0.6^2 \cdot 0.3 + \dots = \frac{0.3}{1 - 0.6} = 0.75$. So 75% graduate, 25% drop out. [Show in the simulation](?sc=studium&view=fix&n=12)

</details>

### Exercise 5: A beetle cycle

600 eggs: half become larvae, a third of the larvae become beetles, and each beetle lays 6 eggs. How does the population develop? Show that $M^3 = E$.

<details>
<summary>Show solution</summary>

$600$ eggs → $300$ larvae → $100$ beetles → $600$ eggs. For $M^3$ each state is passed through once in turn: $6 \cdot 0.5 \cdot \tfrac13 = 1$ on the diagonal, 0 elsewhere. So $M^3 = E$, and the population repeats every 3 steps. [Show in the simulation](?sc=kaefer&view=pow&n=3&ci=1&cj=1)

</details>

### Exercise 6: Yesterday?

Today it is certainly sunny, $\vec x_0 = (1, 0)$. What would the distribution have had to be yesterday?

<details>
<summary>Show solution</summary>

$M^{-1} = \frac{1}{0.7}\begin{pmatrix} 0.8 & -0.2 \\ -0.1 & 0.9 \end{pmatrix}$, so $\vec x_{-1} = M^{-1}\vec x_0 \approx (1.143, -0.143)$. A negative share is impossible: certain sun today cannot come from any distribution yesterday. [Show in the simulation](?sc=wetter&view=back&n=0)

</details>

## Ideas for the classroom

- **Use:** transition processes and Markov chains in upper secondary, usually within linear algebra. The graph is good for getting started, the matrix view for practising multiplication, the course over the steps for conjectures about long-term behaviour.
- **Possible sequence:** read the graph → calculate one step by hand → interpret $M^2$ via paths → conjecture the limit behaviour → calculate the fixed vector → compare special cases (absorbing, cyclic).
- **Own matrices:** under “Own matrix” you can enter exercises from the textbook (separate rows with a semicolon; fractions like 1/3 are allowed).
- **Common pitfalls:**
  - Rows and columns swapped – here column $j$ shows where things go **from** $j$; some books write the matrix transposed (row sum 1).
  - The stable distribution is confused with the start vector: for regular chains it does not depend on the start at all.
  - When calculating backwards, negative entries are overlooked.
- **Curriculum link:** the terms (transition matrix, process matrix, state vector) differ between curricula and books – please check your own curriculum.
