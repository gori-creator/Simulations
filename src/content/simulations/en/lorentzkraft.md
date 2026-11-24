## What is it about?

If a charge $q$ moves with velocity $v$ perpendicular to a magnetic field $B$, the **Lorentz force** acts on it:

$$
F = q \cdot v \cdot B .
$$

It is perpendicular to both $v$ and $B$. If $v$ makes the angle $\alpha$ with $B$, in general $F = q \cdot v \cdot B \cdot \sin\alpha$. If the charge moves **parallel** to the field lines, there is **no** force – and none without a field ($B = 0$).

**Direction (three-finger rule, “cause – medium – effect”):** thumb in the direction of motion (cause), index finger in the direction of the field (medium); the middle finger then points in the direction of the force (effect).

- For **electrons** (negative charge) use the **left hand**. The simulation shows this rule.
- For **positive charges** (and for the conventional current direction) use the **right hand**. The force then points exactly the other way.

Because the force always acts perpendicular to the motion, it only changes the direction of the velocity, not its size: the electrons move on a **circle**.

**Link to a conductor in a magnetic field:** on a current-carrying conductor of length $l$ perpendicular to the field, the force is $F = I \cdot l \cdot B$ (conductor swing). This is the sum of the Lorentz forces on all moving charges in the conductor.

In the **fine beam tube** a glass bulb is filled with a little gas. The electrons collide with the gas atoms and make them glow, which makes their path visible.

**1. Accelerating:** an electron gun accelerates the electrons through the voltage $U$. From $e \cdot U = \tfrac12 m v^2$:

$$
v = \sqrt{2 \cdot \frac{e}{m} \cdot U} .
$$

**2. Magnetic field:** two **Helmholtz coils** (number of turns $n$, radius $R$, separation $R$) produce an almost uniform field in the middle:

$$
B = \left(\tfrac45\right)^{3/2} \cdot \mu_0 \cdot \frac{n \cdot I}{R} .
$$

Here $n = 130$, $R = 15\,\text{cm}$, so $B \approx 0.78\,\text{mT}$ per ampere.

**3. Circular path:** the Lorentz force acts as the centripetal force: $e \cdot v \cdot B = \frac{m v^2}{r}$. So

$$
r = \frac{m \cdot v}{e \cdot B} = \frac{1}{B}\sqrt{\frac{2 \, U \, m}{e}}
\qquad\text{and}\qquad
\frac{e}{m} = \frac{2 \, U}{B^2 \, r^2} .
$$

From $U$, $I$ and the measured radius you can determine the **specific charge** $e/m$ of the electron. The accepted value is $e/m \approx 1.76 \cdot 10^{11}\,\frac{\text{C}}{\text{kg}}$.

**Period:** for one revolution an electron needs

$$
T = \frac{2\pi r}{v} = \frac{2\pi \cdot m}{e \cdot B} .
$$

$T$ does not depend on $v$: faster electrons move on a larger circle but take just as long.

**Measuring:**

- The horizontal measuring ladder starts at the gun. Its marks are at 2, 4, 6, 8 and 10 cm **diameter**.
- Set the coil current so that the beam hits a mark exactly (it then lights up) and record the reading.
- The beam cannot reach the 2 cm mark within the slider limits. At 100 V this would need about 4.3 A; the slider only goes up to 3 A.
- If you plot $2U$ against $B^2 r^2$, the points lie on a line through the origin with slope $e/m$.

**About the display:** the magnetic field points into the page (⊗). The coils are drawn to scale with the glass bulb and are therefore cut off at the edge. The electrons are treated non-relativistically; up to 300 V this is very accurate.

## Try it

1. Increase the coil current. How does the circle change? What happens without a magnetic field? [No magnetic field](?I=0)
2. Increase the accelerating voltage at the same current. Why does the circle get bigger? [Example](?U=300&I=1.4)
3. Check the direction of the force with the left-hand rule where the beam leaves the gun: the electron moves up, the field points into the page, the force points to the right. [Left-hand rule](?hand=1)
4. Use the button “Set the beam to the nearest mark” to put the beam on a mark and record readings at different voltages. What is the slope of the line? [Measurement](?U=200&I=1.4)
5. Set a very strong field: how small does the circle get? [Strong field](?U=150&I=3)

## Exercises

### Exercise 1: Field of the Helmholtz coils

Calculate the flux density for $n = 130$, $R = 15\,\text{cm}$ and $I = 1.0\,\text{A}$. [Load exercise](?I=1&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$B = 0.716 \cdot 1.257 \cdot 10^{-6}\,\frac{\text{T}\,\text{m}}{\text{A}} \cdot \frac{130 \cdot 1.0\,\text{A}}{0.15\,\text{m}} \approx 0.779\,\text{mT}$. [Show in the simulation](?I=1)

</details>

### Exercise 2: Radius of the path

Electrons are accelerated through $U = 200\,\text{V}$ and move in a field of $B = 1.0\,\text{mT}$. Calculate the speed and the radius of the path. [Load exercise](?U=200&I=1.28&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$v = \sqrt{2 \cdot 1.76 \cdot 10^{11}\,\frac{\text{C}}{\text{kg}} \cdot 200\,\text{V}} \approx 8.39 \cdot 10^6\,\frac{\text{m}}{\text{s}}$,
$r = \frac{v}{(e/m) \cdot B} \approx 4.77\,\text{cm}$. In the simulation, $I = 1.28\,\text{A}$ gives $B \approx 0.997\,\text{mT}$, so $r \approx 4.78\,\text{cm}$. [Show in the simulation](?U=200&I=1.28)

</details>

### Exercise 3: Determining e/m

At $U = 250\,\text{V}$ the beam hits the 8 cm mark when $I = 1.71\,\text{A}$ flows. Determine $e/m$. [Load exercise](?U=250&I=1.71&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$B = 0.779\,\frac{\text{mT}}{\text{A}} \cdot 1.71\,\text{A} \approx 1.333\,\text{mT}$, $r = 4.0\,\text{cm}$:
$\frac{e}{m} = \frac{2 \cdot 250\,\text{V}}{(1.333 \cdot 10^{-3}\,\text{T})^2 \cdot (0.040\,\text{m})^2} \approx 1.76 \cdot 10^{11}\,\frac{\text{C}}{\text{kg}}$. [Show in the simulation](?U=250&I=1.71)

</details>

### Exercise 4: Period

Using $r = \frac{m \cdot v}{e \cdot B}$, show that the period $T$ does not depend on the speed. Calculate $T$ for $B = 1.0\,\text{mT}$. [Load exercise](?U=200&I=1.28&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$T = \frac{2\pi r}{v} = \frac{2\pi}{v} \cdot \frac{m \cdot v}{e \cdot B} = \frac{2\pi \cdot m}{e \cdot B}$ – the $v$ cancels.
$T = \frac{2\pi}{1.76 \cdot 10^{11}\,\frac{\text{C}}{\text{kg}} \cdot 1.0 \cdot 10^{-3}\,\text{T}} \approx 3.57 \cdot 10^{-8}\,\text{s} = 35.7\,\text{ns}$.
At $U = 300\,\text{V}$ the circle gets bigger, $T$ stays the same. [Show in the simulation](?U=300&I=1.28)

</details>

### Exercise 5: Lorentz force and weight

At $U = 200\,\text{V}$ and $I = 1.4\,\text{A}$, $B \approx 1.09\,\text{mT}$ and $v \approx 8.39 \cdot 10^6\,\frac{\text{m}}{\text{s}}$. Calculate the Lorentz force on an electron and compare it with its weight ($m = 9.11 \cdot 10^{-31}\,\text{kg}$). [Load exercise](?U=200&I=1.4&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$F = e \cdot v \cdot B = 1.60 \cdot 10^{-19}\,\text{C} \cdot 8.39 \cdot 10^6\,\frac{\text{m}}{\text{s}} \cdot 1.09 \cdot 10^{-3}\,\text{T} \approx 1.47 \cdot 10^{-15}\,\text{N}$.
$F_G = m \cdot g = 9.11 \cdot 10^{-31}\,\text{kg} \cdot 9.81\,\frac{\text{N}}{\text{kg}} \approx 8.94 \cdot 10^{-30}\,\text{N}$.
The Lorentz force is about $1.6 \cdot 10^{14}$ times larger. The weight can therefore be neglected. [Show in the simulation](?U=200&I=1.4)

</details>

### Exercise 6: Protons instead of electrons

Suppose protons (positive charge $e$, mass $1836$ times larger) were accelerated in the tube through the same voltage $U = 200\,\text{V}$, at $B \approx 1.09\,\text{mT}$. In which direction are they deflected, and what would the radius of the path be? (For electrons: $r \approx 4.37\,\text{cm}$.)

<details>
<summary>Show solution</summary>

Protons are positive: with the right hand the force at the exit point points to the **left**, the circle goes the other way round.
From $r = \frac{1}{B}\sqrt{\frac{2\,U\,m}{e}}$ it follows that $r \sim \sqrt{m}$: $r_p \approx 4.37\,\text{cm} \cdot \sqrt{1836} \approx 4.37\,\text{cm} \cdot 42.8 \approx 1.87\,\text{m}$ – far too large for the tube.

</details>

## Ideas for the classroom

- First qualitatively (the circle gets smaller with more current and larger with more voltage), then let students derive the formula for $r$.
- Record and evaluate the series of measurements by hand, then compare with “Automatic series”.
- **Typical stumbling blocks:**
  - “The Lorentz force makes the electrons faster.” – It acts perpendicular to the motion and only changes the direction.
  - Right instead of left hand: for electrons use the left hand. With the right hand the thumb must point against the direction the electrons fly (conventional current).
  - “Every moving charge in a magnetic field feels a force.” – Only the part of the motion perpendicular to the field lines counts; parallel to the field $F = 0$.
  - Mixing up diameter and radius: the marks give the diameter.
