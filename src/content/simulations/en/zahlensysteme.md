## What is it about?

We write numbers in **base ten**: ten ones are grouped into a ten, ten tens into a hundred, and so on. Every place is worth ten times as much as the one to its right. But you can group with any other number instead of ten. That number is called the **base**.

### Place value systems

In base $b$ the places have the values $\dots,\ b^3,\ b^2,\ b^1,\ b^0 = 1$, and there are the digits $0$ to $b - 1$.

- **Binary, base 2:** There are only the digits 0 and 1, and the place values are $1, 2, 4, 8, 16, \dots$ For example, $1011_2 = 1 \cdot 8 + 0 \cdot 4 + 1 \cdot 2 + 1 \cdot 1 = 11$. Computers store everything this way. One place is a **bit**, and eight bits make a **byte**.
- **Hexadecimal, base 16:** Letters stand for the digits ten to fifteen: A = 10, B = 11, …, F = 15. For example, $\text{FF}_{16} = 15 \cdot 16 + 15 = 255$. One hexadecimal digit stands for exactly four bits, which is why you often see it in colour codes such as #FF8800.

The subscript gives the base. Without one, base ten is meant.

### Converting

**Into base ten:** Multiply each digit by its place value and add.

**Out of base ten (repeated division):** Keep dividing by the base and note the remainders. Read from bottom to top, they give the representation you want:

$$\begin{aligned} 13 : 2 &= 6 \text{ remainder } 1 \\ 6 : 2 &= 3 \text{ remainder } 0 \\ 3 : 2 &= 1 \text{ remainder } 1 \\ 1 : 2 &= 0 \text{ remainder } 1 \end{aligned} \qquad\Rightarrow\qquad 13 = 1101_2$$

### Calculating

Written addition works exactly as in base ten, except that you carry as soon as a place reaches the base. So in binary, $1_2 + 1_2 = 10_2$.

### The largest number with k digits

The largest $k$-digit number in base $b$ has every digit equal to $b - 1$, so in binary it is all ones. It is one less than the next place:

$$1 + 2 + 4 + \dots + 2^{k-1} = 2^k - 1$$

This is an example of the **geometric series formula**. That is why 8 bits can store the numbers $0$ to $2^8 - 1 = 255$.

### Numerals of other cultures

- **Romans:** They had no place value system, but symbols with fixed values: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500 and M = 1000. The values are added. A smaller symbol before a larger one is subtracted: IV = 4, XC = 90. There was no zero.
- **Maya:** They grouped in **twenties**. A dot stands for 1, a bar for 5, and a shell for zero. The places are written from bottom to top.
- **Babylonians:** They grouped in **sixties**. A corner wedge stands for 10 and an upright wedge for 1. Base sixty lives on today in hours, minutes and seconds and in the 360° of a circle.

## Try it

- [11 in binary](?mode=stellen&n=11&base=2): Increase the number by one. When does a new place appear?
- [255 in hexadecimal](?mode=stellen&n=255&base=16): Switch between bases 2, 8 and 16.
- [Convert 13](?mode=umrechnen&n=13&base=2): Read the remainders from bottom to top.
- [1011₂ + 110₂](?mode=rechnen&x=11&y=6&base=2): Where do you need to carry?
- [The number 2026](?mode=kulturen&n=2026): Compare the three ways of writing it.

## Exercises

**1. Into base ten.** Which number is $101101_2$? [Load exercise](?mode=stellen&n=45&base=2&_hide=1)

<details><summary>Show solution</summary>

$32 + 8 + 4 + 1 = 45$.

</details>

**2. Repeated division.** Write $100$ in binary and in hexadecimal. [Load exercise](?mode=umrechnen&n=100&base=2&_hide=1)

<details><summary>Show solution</summary>

$100 = 1100100_2 = 64_{16}$, because $6 \cdot 16 + 4 = 100$.

</details>

**3. Adding.** Work out $111_2 + 101_2$ in writing. [Load exercise](?mode=rechnen&x=7&y=5&base=2&_hide=1)

<details><summary>Show solution</summary>

$1100_2$, which is $7 + 5 = 12$.

</details>

**4. Bits.** How many different numbers can 4 bits store? What is the largest?

<details><summary>Show solution</summary>

$2^4 = 16$ numbers, namely $0$ to $1111_2 = 15$.

</details>

**5. Roman.** Write 1999 in Roman numerals. [Load exercise](?mode=kulturen&n=1999&_hide=1)

<details><summary>Show solution</summary>

MCMXCIX, that is $1000 + 900 + 90 + 9$.

</details>
