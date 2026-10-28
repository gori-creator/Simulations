---
description: "Interactive roller coaster on conservation of energy – energy bars, synchronised energy graphs, a custom track, forces in the loop and a series of measurements for the smallest starting height."
---

## What is it about?

At the start a roller coaster car high up has **potential energy** (gravitational energy). As it rolls down, this turns into **kinetic energy** – and back again when it climbs:

$$
E_\text{pot} = m \cdot g \cdot h \qquad E_\text{kin} = \tfrac{1}{2}\, m\, v^2
$$

Without friction the **law of conservation of energy** holds: the sum stays the same at every point. This gives the speed at any height:

$$
m g h_0 = m g h + \tfrac{1}{2} m v^2 \quad\Rightarrow\quad v = \sqrt{2 g\,(h_0 - h)}
$$

The mass cancels out: a heavy car and a light car are **equally fast** at every point; only their energies differ. Without friction the car turns back exactly at the starting height; it only gets over a hill if the hill is lower than $h_0$.

With **friction**, part of the energy is converted into **internal energy** (heat from friction $W_\text{f}$): the rails and wheels get a little warmer. This energy can hardly be used again – it has been **degraded**. The total energy is conserved, but $E_\text{pot} + E_\text{kin}$ decreases:

$$
E_\text{pot} + E_\text{kin} + W_\text{f} = m g h_0 = \text{constant}
$$

**Loop (radius $r$):** at the highest point the weight alone must be at most as large as the centripetal force needed: $m g \leq m \frac{v^2}{r}$, so $v \geq \sqrt{g \cdot r}$. Without friction this requires a starting height of at least $2.5 \cdot r$ above the lowest point. If the car starts lower (but higher than $r$), it would fall out of the track at the height $h = \frac{2 h_0 + r}{3}$ without safety bars.

## Try it

1. Press **Go** and watch the energy bars. What always stays the same? Before the ride, drag the car to another point on the starting ramp.
2. Tap the track to set up to four **measuring points**. The simulation shows the height and speed there, the table shows the energies. Then double the mass: what changes, what does not? [Double mass](?track=tal&h0=15&m=800)
3. Switch on friction. Into which form of energy is the energy converted? Watch the bar $W_\text{f}$. The second, dotted line shows how high the car can still get. [With friction](?mu=0.03)
4. Open the **energy graphs**. At the top, the potential energy along the path is an "energy hill" shaped like the track; the gap up to the horizontal line is the kinetic energy. At the bottom, the energies are stacked against time – the top edge always stays the same. Tap the lower graph to move the time. [Energy graphs](?mode=energy&track=tal&h0=15&mu=0.02)
5. Build a **custom track**: drag points 1 to 4 and the car. When does it get over the hill at point 2? [Custom track](?track=eigen)
6. Look at the **forces in the loop**: from 20 m and from 13 m. [Loop from 20 m](?mode=loop&track=looping&h0=20) · [from 13 m](?mode=loop&track=looping&h0=13)
7. **Discovery task:** find the smallest starting height with which the car gets through the loop. Every ride appears as a point in the series of measurements. [Start the task](?mode=task&track=looping&h0=10&_hide=1)
8. Ride the **mega coaster** with two loops. The camera follows the train, the overview at the top right shows the whole track. The **g-force gauge** at the bottom left shows how strongly the seat pushes you – as a multiple of your weight (in $g$): strongly in the valley, less than zero on the first hill (airtime). Why are the loops tighter at the top than at the bottom? [Mega coaster](?track=mega)

## Tasks

### Task 1: Speed in the valley

The car starts in the valley at a height of $15\,\text{m}$. How fast is it at the lowest point (no friction)? [Load task](?track=tal&h0=15&_hide=1)

<details>
<summary>Show solution</summary>

$$v = \sqrt{2 \cdot 9.81\,\tfrac{\text{m}}{\text{s}^2} \cdot 15\,\text{m}} \approx 17.2\,\tfrac{\text{m}}{\text{s}} \approx 62\,\tfrac{\text{km}}{\text{h}}$$

</details>

### Task 2: Energies on the way

A car with $m = 400\,\text{kg}$ starts at a height of $20\,\text{m}$. Calculate its potential energy at the start as well as its speed, potential and kinetic energy at a height of $10\,\text{m}$. Check with a measuring point. [Load task](?track=tal&h0=20&m=400&_hide=1)

<details>
<summary>Show solution</summary>

Start: $E_\text{pot} = 400 \cdot 9.81 \cdot 20\,\text{J} = 78\,480\,\text{J}$. At $10\,\text{m}$, half of it is potential energy ($39\,240\,\text{J}$) and the other half kinetic energy ($39\,240\,\text{J}$). Hence $v = \sqrt{2 \cdot 9.81 \cdot 10}\,\tfrac{\text{m}}{\text{s}} \approx 14.0\,\tfrac{\text{m}}{\text{s}}$.

</details>

### Task 3: Minimum height for the loop

Explain why, without friction, the car must start at a height of at least $2.5 \cdot r$ to get safely through the loop ($r = 6\,\text{m}$). How fast is it at the top then?

<details>
<summary>Show solution</summary>

At the top $m g \leq m \frac{v^2}{r}$, so $v^2 \geq g r$. Conservation of energy between the start and the highest point ($h = 2r$):

$$m g h_0 = m g \cdot 2r + \tfrac{1}{2} m v^2 \geq m g \cdot 2r + \tfrac{1}{2} m g r \quad\Rightarrow\quad h_0 \geq 2.5\,r = 15\,\text{m}.$$

At the top it is then $v = \sqrt{9.81 \cdot 6}\,\tfrac{\text{m}}{\text{s}} \approx 7.67\,\tfrac{\text{m}}{\text{s}}$. From $14\,\text{m}$, the car would fall out without safety bars at $h = \frac{2 \cdot 14 + 6}{3}\,\text{m} \approx 11.3\,\text{m}$; from $16\,\text{m}$ it makes it with $v \approx 8.86\,\tfrac{\text{m}}{\text{s}}$ at the top. [14 m](?mode=loop&track=looping&h0=14) · [16 m](?mode=loop&track=looping&h0=16)

</details>

### Task 4: Forces at the top of the loop

The car ($400\,\text{kg}$) starts at $20\,\text{m}$. Calculate the speed at the top, the weight, the centripetal force needed and the force of the track. [Load task](?mode=loop&track=looping&h0=20&_hide=1)

<details>
<summary>Show solution</summary>

$v = \sqrt{2 \cdot 9.81 \cdot (20 - 12)}\,\tfrac{\text{m}}{\text{s}} \approx 12.5\,\tfrac{\text{m}}{\text{s}}$, $F_\text{g} = 400 \cdot 9.81\,\text{N} = 3924\,\text{N}$, $F_\text{c} = \frac{400 \cdot 156.96}{6}\,\text{N} \approx 10\,464\,\text{N}$. So the track additionally pushes downwards with $F_\text{N} = F_\text{c} - F_\text{g} \approx 6540\,\text{N}$.

</details>

### Task 5: Friction

Start in the valley at $15\,\text{m}$ with $\mu = 0.02$. How high does the car get on the other side? How much energy is then in the heat from friction? [Try it](?mode=energy&track=tal&h0=15&mu=0.02)

<details>
<summary>Show solution</summary>

It turns back at a height of about $13.4\,\text{m}$. About $1.6\,\text{m}$ of height are missing, so $W_\text{f} \approx 400 \cdot 9.81 \cdot 1.59\,\text{J} \approx 6.2\,\text{kJ}$. The sum of all energies stays $400 \cdot 9.81 \cdot 15\,\text{J} \approx 58.9\,\text{kJ}$. By the way, with friction the loop needs more than $15\,\text{m}$: with $\mu = 0.02$ about $17\,\text{m}$. [Measurements with friction](?mode=task&track=looping&mu=0.02&h0=15)

</details>

### Task 6: Started too low

On the custom track the hill at point 2 is $14\,\text{m}$ high. The car starts without friction at $12\,\text{m}$. Where does it turn back? How fast is it in the valley at point 1 ($2\,\text{m}$)? [Load task](?track=eigen&h0=12&_hide=1)

<details>
<summary>Show solution</summary>

Without friction it turns back exactly at the starting height, i.e. at $12\,\text{m}$ on the slope before the hill. It does not get over the $14\,\text{m}$ hill. In the valley $\Delta h = 12\,\text{m} - 2\,\text{m} = 10\,\text{m}$, so $v = \sqrt{2 \cdot 9.81 \cdot 10}\,\tfrac{\text{m}}{\text{s}} \approx 14.0\,\tfrac{\text{m}}{\text{s}}$. Afterwards it rolls back to the start and swings back and forth.

</details>

## Ideas for the classroom

- **Use:** conservation of energy in lower secondary school (grades 9/10, please check against your curriculum); the energy graphs prepare for potential diagrams, the loop works as an extension on circular motion.
- **Discovery task in groups:** each group looks for the minimum height – first without, then with friction – and then justifies the result with $v^2 \geq g r$.
- **Model:** point mass on the rail, friction proportional to the normal force (also in the loop), $g = 9.81\,\tfrac{\text{m}}{\text{s}^2} = 9.81\,\tfrac{\text{N}}{\text{kg}}$. If you calculate with $g \approx 10\,\tfrac{\text{N}}{\text{kg}}$ in class, energies and forces come out about $2\,\%$ larger and speeds about $1\,\%$ larger. The simulation shows energies in kilojoules ($1\,\text{kJ} = 1000\,\text{J}$). The car is drawn larger than to scale. Safety bars keep it on the rail; where it would lift off without them, the simulation shows this (also "airtime" on hills). On the mega coaster a train of three cars is drawn; the calculation still uses one point mass in the middle of the train. Like real coasters, its loops are teardrop-shaped (wide at the bottom, tight at the top): at the bottom the train is fast, and a large radius keeps the g-force $1 + \frac{v^2}{g r}$ small; at the top it is slow, so a small radius is enough for $v^2 \geq g r$. The g-force is the normal force divided by the weight, $\frac{F_\text{N}}{m g}$.
- **Common stumbling blocks:**
  - "Heavier cars are faster." – The speed does not depend on the mass.
  - "Friction destroys energy." – It is converted into internal energy, not destroyed.
  - "A starting height of $2r$ is enough for the loop." – The car still needs speed at the top, hence $2.5\,r$.
