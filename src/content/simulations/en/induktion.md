## What is it about?

If the magnetic field passing through a coil changes, a voltage appears at its ends: **electromagnetic induction**. What matters is the **magnetic flux**

$$
\Phi = B \cdot A \cdot \cos\varphi ,
$$

i.e. the flux density $B$ times the area $A$ that the field passes through at right angles ($\varphi$ is the angle between the field and the normal to the area). The **law of induction** is

$$
U_\text{ind} = -n \cdot \frac{\Delta\Phi}{\Delta t}
$$

with the number of turns $n$. So what counts is not the flux itself but **how fast it changes**. If nothing moves, the voltage is zero.

The flux can be changed in three ways – exactly what the three experiments show:

1. **Magnet and coil:** the magnet is moved, $B$ inside the coil changes. Pushing in and pulling out give voltages with different signs; moving faster and more turns give more voltage.
2. **Conducting loop in a field:** a rod of length $l$ slides with speed $v$ along two rails through a uniform field. The enclosed area $A = l \cdot x$ grows by $l \cdot v$ per second, so
   $$
   U = B \cdot l \cdot v .
   $$
   The same result follows from the Lorentz force on the electrons in the moving rod.
3. **Generator:** a coil rotates with frequency $f$ in the field. The angle changes steadily, $\Phi = B \cdot A \cdot \cos(\omega t)$ with $\omega = 2\pi f$, and an **alternating voltage** appears:
   $$
   U(t) = \hat U \cdot \sin(\omega t), \qquad \hat U = n \cdot B \cdot A \cdot \omega .
   $$
   The voltage is largest when the coil's area is parallel to the field – then the flux is zero but changes fastest.

**Lenz's law:** the minus sign in the law of induction means that the induced current opposes its cause. If a north pole approaches, the end of the coil becomes a north pole and repels the magnet; the rod on the rails is braked by the force $F = B \cdot I \cdot l$. That is why you have to do work – it arrives as electrical energy in the circuit.

**About the display:** in the picture the generator runs ten times slower, but the graph shows the real time. For the rod on the rails, the circuit in the model has the resistance $R = 2\,\Omega$. The range of the voltmeter adjusts itself. The magnet and the rod can also be moved with the keyboard: select the stage with the Tab key, then press Enter – the rod then moves steadily at the set speed $v$.

## Try it

1. Watch the voltmeter and the graph while the magnet moves into the coil and out again. When is the voltage zero? [Load example](?mode=magnet)
2. Switch off “Move back and forth automatically” and drag the magnet yourself: slowly, fast, not at all. [Drag it yourself](?mode=magnet&auto=0)
3. Triple the number of turns. What changes? [Three times the turns](?mode=magnet&n=300)
4. For the rod on the rails: how does the voltage depend on $v$, $l$ and $B$? Look at the arrows for $v$ and $F$. [Rod on rails](?mode=rail)
5. For the generator: in which position of the coil is the voltage largest? Compare the curves of $U$ and $\Phi$. [Generator](?mode=gen&B=0.1&n=100&A=100&f=5)
6. Double the rotation frequency of the generator. What happens to the period and the peak value? [Twice the frequency](?mode=gen&B=0.1&n=100&A=100&f=10)

## Exercises

### Exercise 1: Moving conductor

A rod of length $0.20\,\text{m}$ moves at $2.0\,\frac{\text{m}}{\text{s}}$ at right angles through a magnetic field with $B = 0.50\,\text{T}$. Calculate the induced voltage. [Load exercise](?mode=rail&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$U = B \cdot l \cdot v = 0.50\,\text{T} \cdot 0.20\,\text{m} \cdot 2.0\,\frac{\text{m}}{\text{s}} = 0.20\,\text{V}$. [Show in the simulation](?mode=rail)

</details>

### Exercise 2: Current and braking force

The rod from Exercise 1 is closed through a resistance of $2.0\,\Omega$. Calculate the current, the braking force and the mechanical power needed. Compare with the electrical power.

<details>
<summary>Show solution</summary>

$I = \frac{U}{R} = 0.10\,\text{A}$, $F = B \cdot I \cdot l = 0.50\,\text{T} \cdot 0.10\,\text{A} \cdot 0.20\,\text{m} = 0.010\,\text{N}$. Mechanical power $P = F \cdot v = 0.020\,\text{W}$, electrical power $P = U \cdot I = 0.020\,\text{W}$ – energy is conserved.

</details>

### Exercise 3: Generator

A coil with $100$ turns and $A = 100\,\text{cm}^2$ rotates at $f = 5\,\text{Hz}$ in a field with $B = 0.10\,\text{T}$. Calculate the peak value, the RMS value and the period of the voltage. [Load exercise](?mode=gen&B=0.1&n=100&A=100&f=5&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\omega = 2\pi \cdot 5\,\text{Hz} \approx 31.4\,\frac{1}{\text{s}}$, $\hat U = n \cdot B \cdot A \cdot \omega = 100 \cdot 0.10\,\text{T} \cdot 0.010\,\text{m}^2 \cdot 31.4\,\frac{1}{\text{s}} \approx 3.14\,\text{V}$, $U_\text{rms} = \frac{\hat U}{\sqrt 2} \approx 2.22\,\text{V}$, $T = \frac{1}{f} = 0.2\,\text{s}$. [Show in the simulation](?mode=gen&B=0.1&n=100&A=100&f=5)

</details>

### Exercise 4: Twice the frequency

How do the peak value and the period change if the generator from Exercise 3 turns twice as fast?

<details>
<summary>Show solution</summary>

$\hat U \sim \omega$: the peak value doubles to about $6.28\,\text{V}$, the period halves to $0.1\,\text{s}$. [Show in the simulation](?mode=gen&B=0.1&n=100&A=100&f=10)

</details>

### Exercise 5: Lenz's law

A magnet is pushed into a coil north pole first. Which pole forms at the end of the coil facing the magnet? What happens when you pull it out again? [Magnet and coil](?mode=magnet)

<details>
<summary>Show solution</summary>

When pushing in, a north pole forms there: the coil repels the magnet. When pulling out, a south pole forms and attracts the magnet. In both cases the motion is braked; the voltage has opposite signs.

</details>

### Exercise 6: Switching on a field

A coil with $500$ turns and $A = 20\,\text{cm}^2$ is perpendicular to a magnetic field that rises steadily from $0$ to $0.20\,\text{T}$ in $0.10\,\text{s}$. What voltage is induced?

<details>
<summary>Show solution</summary>

$\Delta\Phi = 0.20\,\text{T} \cdot 20 \cdot 10^{-4}\,\text{m}^2 = 4.0 \cdot 10^{-4}\,\text{Wb}$, $|U| = n \cdot \frac{\Delta\Phi}{\Delta t} = 500 \cdot \frac{4.0 \cdot 10^{-4}\,\text{Wb}}{0.10\,\text{s}} = 2.0\,\text{V}$.

Here the flux density $B$ changes while the area stays fixed. For the rod on the rails it is the other way round: $B$ stays the same, the area $A$ grows.

</details>

### Exercise 7: Position of the coil

The generator from Exercise 3 is turning. How large is the voltage at the moment when the normal to the area makes the angle $\varphi = 30^\circ$ with the field? And at $\varphi = 90^\circ$? [Load exercise](?mode=gen&B=0.1&n=100&A=100&f=5&_hide=1)

<details>
<summary>Show solution</summary>

$U = \hat U \cdot \sin\varphi$ with $\hat U \approx 3.14\,\text{V}$: at $30^\circ$, $U \approx 3.14\,\text{V} \cdot 0.5 \approx 1.57\,\text{V}$. At $90^\circ$ the coil's area is parallel to the field: the flux is zero but changes fastest, so $U = \hat U \approx 3.14\,\text{V}$. In the picture you can see the position from the arrow of the normal and the display of $\varphi$.

</details>

## Ideas for the classroom

- **Use:** upper secondary, topic induction; please check the exact place in your curriculum. The three experiments match the usual hands-on experiments with a bar magnet, a conductor swing and a hand generator.
- **Possible sequence:** start qualitatively with the magnet (when is there a voltage?), then derive $U = B \cdot l \cdot v$ quantitatively with the rod on the rails and generalise to the law of induction, finally the generator as an application.
- **Model:** field of the bar magnet on the axis of the coil, thin coil; uniform field for the generator; self-induction and the effect back on the motion are not calculated.
- **Common pitfalls:**
  - “A strong magnet in the coil produces a voltage.” – Only the change of flux counts; if the magnet is at rest, $U = 0$.
  - “The generator's voltage is largest when the coil is perpendicular to the field.” – Then the flux is maximal but is just not changing.
  - The minus sign is often left out; it contains Lenz's law and thus the conservation of energy.
- **Going further:** transformer, eddy currents (eddy-current brake), self-induction, the AC power grid.
