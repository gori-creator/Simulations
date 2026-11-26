## What is it about?

Two children go up the same stairs: one strolls, the other runs. At the top, both have done **the same amount of work** – but the faster one has delivered **more power**.

### Work done lifting

Climbing stairs means lifting your whole body weight by the height $h$. This requires the **work**:

$$W = m \cdot g \cdot h \qquad (g \approx 9.81\,\tfrac{\text{N}}{\text{kg}})$$

The unit is the **joule**: $1\,\text{J} = 1\,\text{N} \cdot 1\,\text{m}$. The work does not depend on how fast you go.

### Power

**Power** tells you how fast work is done:

$$P = \frac{W}{t}$$

Its unit is the **watt**: $1\,\text{W} = 1\,\tfrac{\text{J}}{\text{s}}$. Running twice as fast means twice the power.

Power used to be given in **horsepower**: $1\,\text{hp} \approx 736\,\text{W}$ (metric) – about what a strong horse can deliver for a long time. Running up stairs, teenagers often manage more than 1 hp for a few seconds. Over hours, though, a person delivers only about 100 W.

### Measuring your own power

1. Count the steps of a staircase and measure the height of one step (usually about 17 cm). The height is $h = \text{steps} \cdot \text{step height}$.
2. Have someone time you running up.
3. Enter mass, height and time into the simulation.

The bar chart compares you with devices and machines. Because the values are so different, the axis grows in **steps of ten**: each mark means ten times as much.

### Same work, different power

A crane lifting 500 kg by 12 m always does the same work: about 59 kJ. A 5 kW motor needs almost 12 s for it, a 10 kW motor only half. From $W = F \cdot s$ and $P = \frac{W}{t}$ it also follows that $P = F \cdot v$: with the same power the crane lifts a heavy load more slowly than a light one.

### In the work–time graph

If you plot the work done against time, climbing stairs at a steady pace gives a straight line. Its **slope** is $\frac{W}{t}$, i.e. the power. The steeper line belongs to the more powerful person – even if they did less work in total.

### Energy and power at home

The energy a device uses is $E = P \cdot t$. Electricity is billed in **kilowatt hours**: $1\,\text{kWh} = 1000\,\text{W} \cdot 3600\,\text{s} = 3.6\,\text{MJ}$. An evening of TV (100 W, 3 hours) needs 0.3 kWh. That is over 1000 kJ – as much work as climbing a floor about 670 times.

### Hydropower

In a hydroelectric plant the water flow $Q$ falls down the head $h$ every second. The power is $P = \eta \cdot \rho \cdot Q \cdot g \cdot h$ with efficiency $\eta \approx 0.85$. River plants have a lot of water and little height, mountain reservoirs little water and a great height.

## Try it

- [Walking calmly](?m=55&h=6&t=15): How many LED lamps could you power with that?
- [Running up](?m=55&h=6&t=5): Do you beat a horse?
- [Church tower](?m=70&h=20&t=60): How large is the work, how large the power?
- [Tower crane](?mode=heben&lm=1000&lh=20&lp=10000) and [weak motor](?mode=heben&lm=600&lh=15&lp=1000): Press play. What changes, what stays the same?
- [Anna versus Ben](?mode=diagramm&h=6&ma=50&ta=6&mb=80&tb=10): Whose line is steeper?
- [Evening of TV](?mode=energie&dv=tv&dur=180&m=55) and [kettle](?mode=energie&dv=kocher&dur=3&m=55): How many floors would you have to climb for it?
- [River plant](?mode=wasser&q=100&wh=10) and [reservoir](?mode=wasser&q=20&wh=300): How many households can be supplied?
- [Practice](?mode=ueben&qn=1): Six kinds of tasks with a score.

## Exercises

**1. Stair run.** Lena (50 kg) runs up 6 m of stairs in 6 s. Calculate work and power. [Load exercise](?m=50&h=6&t=6&_hide=1)

<details><summary>Show solution</summary>

$W = 50\,\text{kg} \cdot 9.81\,\tfrac{\text{N}}{\text{kg}} \cdot 6\,\text{m} \approx 2943\,\text{J}$, $P = \dfrac{2943\,\text{J}}{6\,\text{s}} \approx 490\,\text{W}$.

</details>

**2. Same work.** Tom (50 kg) needs 12 s for the same stairs. Compare with Lena. [Load exercise](?m=50&h=6&t=12&_hide=1)

<details><summary>Show solution</summary>

The work is the same (2943 J), the power only half as large (about 245 W).

</details>

**3. Lift.** A lift motor delivers 5 kW. What is the shortest time it needs to raise 4 people with a total mass of 300 kg by 20 m?

<details><summary>Show solution</summary>

$W = 300 \cdot 9.81 \cdot 20\,\text{J} \approx 58\,900\,\text{J}$, $t = \dfrac{W}{P} = \dfrac{58\,900\,\text{J}}{5000\,\text{W}} \approx 12\,\text{s}$ (ignoring friction and the lift car).

</details>

**4. Who is more powerful?** Anna (50 kg) runs up 6 m in 6 s, Ben (80 kg) in 10 s. Who has the greater power? [Load task](?mode=diagramm&h=6&ma=50&ta=6&mb=80&tb=10&_hide=1)

<details><summary>Show solution</summary>

Anna: $P = \dfrac{50 \cdot 9.81 \cdot 6\,\text{J}}{6\,\text{s}} \approx 491\,\text{W}$. Ben: $P = \dfrac{80 \cdot 9.81 \cdot 6\,\text{J}}{10\,\text{s}} \approx 471\,\text{W}$. Anna is slightly ahead although Ben does more work.

</details>

**5. Electricity cost.** A kettle (2000 W) runs for 3 minutes. How much energy in kWh does it need, and what does it cost at €0.35 per kWh? [Load task](?mode=energie&dv=kocher&dur=3&m=55&_hide=1)

<details><summary>Show solution</summary>

$E = 2\,\text{kW} \cdot 0.05\,\text{h} = 0.1\,\text{kWh}$, cost $0.1 \cdot €0.35 \approx €0.04$.

</details>

## Ideas for teaching

- **Measuring on the stairs:** Count the steps, time the run, estimate the mass – and compare your own power in the “Stairs” view.
- **Common mistake:** Confusing work and power. The “Lifting” view shows the same work taking different times depending on the power.
- **Saving energy:** The “Energy at home” view makes tangible how much muscle work is in one kilowatt hour.
