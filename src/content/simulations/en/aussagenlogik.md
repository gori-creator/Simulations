## What is it about?

A **statement** is a sentence that is either **true** (T) or **false** (F), for example "It is raining" or "7 is a prime number". Questions like "What time is it?" and commands are not statements. Statements can be **combined** with small words into new statements, and whether the result is true depends only on the truth values of the parts.

### The connectives

| Name | Symbol | read as | true when … |
| --- | --- | --- | --- |
| negation | $\neg A$ | not A | A is false |
| conjunction | $A \wedge B$ | A and B | both are true |
| disjunction | $A \vee B$ | A or B | at least one is true |
| implication | $A \rightarrow B$ | if A, then B | it is not the case that A is true and B false |
| equivalence | $A \leftrightarrow B$ | A if and only if B | both have the same value |
| exclusive or (XOR) | $A \oplus B$ | either A or B | exactly one is true |
| NAND | $\neg(A \wedge B)$ | not both | not both are true |
| NOR | $\neg(A \vee B)$ | neither A nor B | both are false |

Note that the mathematical "or" includes "both". For "either … or" there is XOR.

The **implication** is false in one case only: when A is true and B is false. So anything follows from a false premise. "If 2 + 2 = 5, then I am the Pope" is a true statement.

### Truth tables

A **truth table** lists every assignment of the variables. With two variables that is 4 rows, with three variables 8. Each row shows the truth value of the formula.

### Equivalent formulas

Two formulas are **equivalent** if they have the same value in **every** row. Important examples:

- **De Morgan:** $\neg(A \wedge B) \equiv \neg A \vee \neg B$ and $\neg(A \vee B) \equiv \neg A \wedge \neg B$
- **Implication:** $A \rightarrow B \equiv \neg A \vee B$
- **Contrapositive:** $A \rightarrow B \equiv \neg B \rightarrow \neg A$
- **Distributive law:** $A \wedge (B \vee C) \equiv (A \wedge B) \vee (A \wedge C)$

The **converse** $B \rightarrow A$, however, is **not** equivalent to $A \rightarrow B$. "If it rains, the street is wet" is true, but the converse "If the street is wet, it is raining" is not necessarily true.

A formula that is always true is called a **tautology**, for example $A \vee \neg A$. A formula that is always false is called a **contradiction**, for example $A \wedge \neg A$.

### Logic in circuits

Computers calculate with exactly these connectives: current on means true, current off means false. The building blocks are called **gates**. NAND gates alone can build all the others, for example $\neg A = \neg(A \wedge A)$.

## Try it

- [AND gate](?mode=verknuepfung&op=and&a=1&b=1): Switch A and B. When does the lamp light up?
- [If … then](?mode=verknuepfung&op=impl&a=0&b=1): In which row is the implication false?
- [De Morgan](?mode=vergleich&pair=demorgan1): Compare both columns row by row.
- [Converse](?mode=vergleich&pair=umkehr&a=0&b=1): In which row do A → B and B → A differ?

## Exercises

**1. Truth value.** A: "5 is even", B: "5 is a prime number". Find the value of $A \vee B$, $A \wedge B$ and $A \rightarrow B$. [Load exercise](?mode=verknuepfung&op=or&a=0&b=1&_hide=1)

<details><summary>Show solution</summary>

A is false and B is true. So $A \vee B$ is true, $A \wedge B$ is false and $A \rightarrow B$ is true.

</details>

**2. NOR.** When is "neither A nor B" true? [Load exercise](?mode=verknuepfung&op=nor&a=0&b=0&_hide=1)

<details><summary>Show solution</summary>

Only when A and B are both false.

</details>

**3. Negating.** Negate the statement "I am hungry and thirsty" without using "not (… and …)". [Load exercise](?mode=vergleich&pair=demorgan1&_hide=1)

<details><summary>Show solution</summary>

By De Morgan: "I am not hungry or I am not thirsty."

</details>

**4. Tautology.** Use a truth table to show that $A \vee \neg A$ is always true. [Load exercise](?mode=vergleich&pair=taut&_hide=1)

<details><summary>Show solution</summary>

If A is true, then $A \vee \neg A$ is true. If A is false, then $\neg A$ is true, and so is the disjunction.

</details>
