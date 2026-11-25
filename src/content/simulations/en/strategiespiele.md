## What is it about?

There are 15 matchsticks on the table. Two players take turns taking **1, 2 or 3** sticks. Whoever takes the **last** stick wins. That sounds like luck, but it isn't: with the right **strategy**, you always win if you start well.

### Thinking backwards

Work backwards from the end of the game:

- If there are 1, 2 or 3 sticks left, take them all and win.
- If there are **4** sticks left, you are stuck: whether you take 1, 2 or 3, your opponent can take the rest. 4 is a **losing position** for the player whose turn it is.
- With 5, 6 or 7 sticks, take enough to leave 4. Then your opponent is stuck.
- **8** is a losing position again, and so are **12**, **16** and so on.

### The winning strategy

If you may take at most $k$ sticks, the multiples of $k + 1$ are the losing positions. So the strategy is: **always leave a multiple of $k + 1$.** The **remainder** when dividing by $k + 1$ tells you how many to take. With 15 sticks and $k = 3$, $15 \div 4 = 3$ remainder $3$. So you take 3 and leave 12.

If a multiple of $k + 1$ is already in front of you, you have no chance against a clever opponent. All you can do is hope they make a mistake.

### Nim with several piles

In classic **Nim** there are several piles. You may take any number of sticks from **one** pile. The strategy here is surprising: write the pile sizes in **binary** one below the other and add each digit without carrying (1 + 1 = 0). The result is called the **nim-sum**. Whoever always leaves a nim-sum of 0 wins.

### Strategy games and games of chance

There is no chance in these games. Everything depends on the moves, which is why they can be worked out completely. In **games of chance** such as dice games, by contrast, you can only work out probabilities, because chance plays a part.

## Try it

- [15 sticks, 1 to 3](?mode=ein&n=15&k=3&first=ich): Play a few rounds against the computer. When do you win?
- [Computer starts at 12](?mode=ein&n=12&k=3&first=pc): Now the computer has a problem. Can you win?
- [Nim 3 – 4 – 5](?mode=mehr&h1=3&h2=4&h3=5&first=ich): Switch on the strategy and watch the nim-sum.

## Exercises

**1. Losing positions.** You may take 1 to 4 sticks. Which numbers are losing positions? [Load exercise](?mode=ein&n=20&k=4&hint=1&_hide=1)

<details><summary>Show solution</summary>

The multiples of 5, that is 5, 10, 15, 20 and so on.

</details>

**2. First move.** There are 17 sticks and you may take 1 to 3. How many do you take first?

<details><summary>Show solution</summary>

$17 \div 4 = 4$ remainder $1$, so you take 1 and leave 16.

</details>

**3. Who should start?** With 20 sticks and "1 to 3": do you want to start or let the other player start?

<details><summary>Show solution</summary>

20 is a multiple of 4, so whoever is to move loses if the opponent plays well. So you let the other player start.

</details>

**4. Nim-sum.** Work out the nim-sum of 1, 2 and 3. [Load exercise](?mode=mehr&h1=1&h2=2&h3=3&hint=1&_hide=1)

<details><summary>Show solution</summary>

$01 \oplus 10 \oplus 11 = 00$, so it is 0. Whoever is to move here loses against a clever opponent.

</details>
