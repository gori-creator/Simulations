## What is it about?

A **sequence** is an infinite list of numbers $a_1, a_2, a_3, \dots$ – for example $1, \tfrac12, \tfrac13, \tfrac14, \dots$ Adding the terms one after another gives a **series**. Two questions are exciting: do the terms approach a fixed number? And does the infinite sum have a finite value?

### Arithmetic and geometric sequences

- **Arithmetic:** the same number $d$ is always added: $a_n = a + (n-1)\,d$.
- **Geometric:** you always multiply by the same number $q$: $a_n = a \cdot q^{\,n-1}$.

### Limit and ε-neighbourhood

A sequence **converges** to the limit $g$ if its terms get **arbitrarily close** to $g$ and stay there. More precisely: for every number $\varepsilon > 0$, however small, there is an index $N$ from which on **all** further terms lie inside the strip $g - \varepsilon < a_n < g + \varepsilon$.

In the simulation this strip is shaded. If you make $\varepsilon$ smaller, $N$ moves to the right – but there always is one. For $a_n = \tfrac1n$ and $\varepsilon = 0.01$, every term from $n = 101$ on lies inside the strip.

A sequence without a limit **diverges**: it grows beyond all bounds (like $a_n = n$) or jumps back and forth (like $(-1)^n$).

**Limit laws:** if $(a_n) \to a$ and $(b_n) \to b$, then $a_n \pm b_n \to a \pm b$, $a_n \cdot b_n \to a \cdot b$ and – if $b \ne 0$ – $\tfrac{a_n}{b_n} \to \tfrac{a}{b}$. For example, $\tfrac{n}{n+1} = \tfrac{1}{1 + 1/n} \to 1$.

### Series

The **partial sum** $s_n = a_1 + a_2 + \dots + a_n$ forms a sequence itself.

- **Arithmetic series:** $s_n = \tfrac{n}{2}\,(a_1 + a_n)$ – this is how the young Gauss calculated $1 + 2 + \dots + 100 = 5050$. It grows beyond all bounds.
- **Geometric series:** $s_n = a \cdot \dfrac{1 - q^n}{1 - q}$. For $|q| < 1$, $q^n \to 0$, and the infinite series has the sum $\dfrac{a}{1-q}$. Example: $1 + \tfrac12 + \tfrac14 + \dots = 2$.
- **Harmonic series:** $1 + \tfrac12 + \tfrac13 + \dots$ Although the terms tend to zero, the sum grows beyond all bounds – just very slowly.

## Try it

- [1/n](?mode=folge&typ=inv&eps=0.1): Make ε smaller. From which n on do the terms lie inside the strip?
- [Sequence for e](?mode=folge&typ=euler&eps=0.1): Which number does $(1 + 1/n)^n$ approach?
- [(−1)ⁿ](?mode=folge&typ=alt&eps=0.1): Why is there no limit?
- [1 + 1/2 + 1/4 + …](?mode=reihe&rt=geom&a=1&q=0.5): Change q. When does the series have a sum?

## Exercises

**1. ε-neighbourhood.** From which $n$ on is $\tfrac1n < 0.05$? [Load exercise](?mode=folge&typ=inv&eps=0.05&_hide=1)

<details><summary>Show solution</summary>

$\tfrac1n < 0.05 \Leftrightarrow n > 20$, so from $n = 21$ on.

</details>

**2. Geometric series.** Calculate $3 + 1 + \tfrac13 + \tfrac19 + \dots$ [Load exercise](?mode=reihe&rt=geom&a=3&q=0.35&_hide=1)

<details><summary>Show solution</summary>

$a = 3$, $q = \tfrac13$: sum $\dfrac{3}{1 - 1/3} = 4.5$. (In the simulation q can only be set in steps of 0.05 – with $q = 0.35$ you get a similar value.)

</details>

**3. Gauss.** Calculate $1 + 2 + 3 + \dots + 30$. [Load exercise](?mode=reihe&rt=arith&a=1&d=1&_hide=1)

<details><summary>Show solution</summary>

$s_{30} = \tfrac{30}{2} \cdot (1 + 30) = 465$.

</details>
