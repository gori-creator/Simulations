## What is it about?

Every (sufficiently well-behaved) $2\pi$-periodic function can be written as a sum of sine and cosine oscillations – as a **Fourier series**:

$$f(x) \approx \frac{a_0}{2} + \sum_{k=1}^{N} \bigl(a_k \cos kx + b_k \sin kx\bigr), \qquad a_k = \frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\cos kx\,dx, \quad b_k = \frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\sin kx\,dx.$$

The oscillation with $k = 1$ is called the **fundamental**, the others are **overtones**; all together they are called **harmonics**. The sum of the first $N$ terms is the **partial sum** $S_N$. Combining $a_k \cos kx + b_k \sin kx = \hat A_k \sin(kx + \varphi_k)$ gives the **amplitude spectrum** $\hat A_k = \sqrt{a_k^2 + b_k^2}$ and the **phase spectrum** $\varphi_k$. *Example square wave:* $f(x) = \frac{4}{\pi}\left(\sin x + \frac{1}{3}\sin 3x + \frac{1}{5}\sin 5x + \ldots\right)$ – only odd $k$, amplitudes like $\frac{1}{k}$.

**Phasors:** every term is a phasor of length $\hat A_k$ that turns $k$ times as fast as the fundamental. If you put the phasors tip to tail, the height of the tip draws exactly $S_N$ – this is what the view “Phasors (epicycles)” shows.

**Symmetry:** odd functions (square wave, sawtooth) have only sine terms, even ones (triangle, pulse train, full-wave) only cosine terms. If $f(x + \pi) = -f(x)$, all even $k$ are missing. **Smooth or jumping?** With jumps the amplitudes only fall like $\frac{1}{k}$, with kinks like $\frac{1}{k^2}$ – the series then converges much faster.

**Gibbs phenomenon:** at a jump, $S_N$ overshoots – for the square wave to about $1.179$ instead of $1$, i.e. by about $9\%$ of the jump height $2$. As $N$ grows, the overshoot gets narrower but not lower. Smoothing factors $\sigma_k$ (Fejér: $\sigma_k = 1 - \frac{k}{N+1}$) damp the high terms: Fejér removes the overshoot, Lanczos ($\sigma_k = \frac{\sin u}{u}$ with $u = \frac{\pi k}{N+1}$) reduces it strongly.

**Parseval:** the mean power is distributed over the terms:

$$P = \frac{1}{2\pi}\int_{-\pi}^{\pi} f(x)^2\,dx = \left(\frac{a_0}{2}\right)^2 + \frac{1}{2}\sum_{k=1}^{\infty}\bigl(a_k^2 + b_k^2\bigr).$$

For the square wave ($P = 1$) the fundamental alone contains the share $\frac{1}{2}\left(\frac{4}{\pi}\right)^2 = \frac{8}{\pi^2} \approx 81.06\%$. **Time instead of angle:** with the fundamental frequency $f_0$, $x = \omega t = 2\pi f_0 t$; the $k$-th harmonic has the frequency $k \cdot f_0$. That way you hear the spectrum as **timbre** (“Play sound”).

## Try it

1. [Square wave with one harmonic](?sig=sq&n=1): press “Add a harmonic” several times. Why are even $k$ skipped? Then press “Play the build-up” and watch the corners and the share of power.
2. [Phasors draw a square wave](?view=epi&sig=sq&n=7): which phasor turns fastest, which is longest?
3. [Stacked harmonics](?view=stack&sig=saw&n=8&x=2): drag the test point. The values on the right add up to $S_8(x)$.
4. [Gibbs phenomenon](?sig=sq&n=30&x=0.1): does the overshoot get smaller with larger $N$? Compare with [Fejér smoothing](?sig=sq&n=30&x=0.1&sm=fejer).
5. [Clarinet](?view=spec&sig=sq&n=11&f0=147) and [flute](?view=spec&sig=tri&n=5&f0=523): compare spectra and shares of power, then “Play sound”.
6. [Phase shift](?view=spec&sig=saw&n=8&ph=90): change $\varphi$. What changes in the amplitude spectrum, what in the phase spectrum?
7. [LED dimmer](?sig=pulse&d=25&n=20&f0=500&tax=1&x=0.5): change the duty cycle $d$. How does the DC component depend on it?
8. [Own sound](?view=epi&sig=own&n=8&c1=1&c2=0.5&c3=0.35&c4=0.25&c5=0&c6=0&c7=0&c8=0): set the amplitudes $c_k$ and listen.

## Exercises

### Exercise 1: Calculating a partial sum

Calculate the partial sum $S_3$ of the square wave at $x = 1.2$. [Load exercise](?sig=sq&n=3&x=1.2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$S_3(1.2) = \frac{4}{\pi}\left(\sin 1.2 + \frac{1}{3}\sin 3.6\right) \approx 1.2732 \cdot (0.9320 - 0.1475) \approx 0.999$ – already very close to the target value $1$. [Show](?view=stack&sig=sq&n=3&x=1.2)

</details>

### Exercise 2: Symmetry

Why does the series of the square wave contain only sine terms and that of the triangle only cosine terms? What happens if you shift the square wave by $90°$?

<details>
<summary>Show solution</summary>

The square wave is point-symmetric (odd): all $a_k = 0$. The triangle is axis-symmetric (even): all $b_k = 0$. Shifted by $\frac{\pi}{2}$, the square wave becomes axis-symmetric, so only cosine terms – the amplitudes stay the same. [Show](?view=spec&sig=sq&n=9&ph=90)

</details>

### Exercise 3: Energy by Parseval

What share of the power of the square wave is in $S_1$, what share in $S_3$? From which $N$ on is it at least $95\%$? [Load exercise](?view=spec&sig=sq&n=1&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$P = 1$, $\frac{1}{2}b_k^2 = \frac{8}{\pi^2 k^2}$. $S_1$: $\frac{8}{\pi^2} \approx 81.06\%$; $S_3$: $\frac{8}{\pi^2}\left(1 + \frac{1}{9}\right) \approx 90.06\%$; $S_5$: $93.31\%$; $S_7$: $94.96\%$; $S_9$: $95.96\%$. So from $N = 9$ on. [Show](?view=spec&sig=sq&n=9)

</details>

### Exercise 4: Why does the flute sound so pure?

A flute note is almost sinusoidal; a triangle serves as a simple model. Calculate the share of power of the fundamental ($P = \frac{1}{3}$, $a_1 = \frac{8}{\pi^2}$).

<details>
<summary>Show solution</summary>

$\frac{\frac{1}{2}a_1^2}{P} = \frac{3}{2}\cdot\frac{64}{\pi^4} = \frac{96}{\pi^4} \approx 98.55\%$ – almost all the power is in the fundamental, and the note sounds almost like a pure sine. The clarinet (in the low register, simplified ≈ square wave) has only $81\%$ in the fundamental and therefore sounds “hollower”, full of overtones. [Show](?view=spec&sig=tri&n=5&f0=523)

</details>

### Exercise 5: LED dimmer

An LED is driven by a pulse train (height $1$, duty cycle $d = 25\%$). Find the DC component and the amplitudes of the first four harmonics. Which one is missing? [Load exercise](?sig=pulse&d=25&n=8&info=0&_hide=1)

<details>
<summary>Show solution</summary>

DC component $\frac{a_0}{2} = d = 0.25$ (on average the LED shines at $25\%$). $\hat A_k = \frac{2\,|\sin(\pi k d)|}{\pi k}$: $\hat A_1 \approx 0.450$, $\hat A_2 \approx 0.318$, $\hat A_3 \approx 0.150$, $\hat A_4 = 0$, because $\sin \pi = 0$ (every fourth one is missing). [Show](?view=spec&sig=pulse&d=25&n=8)

</details>

### Exercise 6: Power supply with a full-wave rectifier

The mains supplies $f_0 = 50\,\text{Hz}$. After the full-wave rectifier, $|\sin x|$ is applied. Find the mean value and the first overtone. At what frequency does the power supply “hum”?

<details>
<summary>Show solution</summary>

$\frac{a_0}{2} = \frac{2}{\pi} \approx 0.637$; since $|\sin x|$ has period $\pi$, there are only even $k$: $a_2 = -\frac{4}{3\pi} \approx -0.424$ at $2 \cdot 50\,\text{Hz} = 100\,\text{Hz}$. The capacitor mainly has to smooth out this $100\text{-Hz}$ component. The DC component alone carries $\frac{8}{\pi^2} \approx 81\%$ of the power. [Show](?view=spec&sig=full&n=8&f0=50&tax=1)

</details>

## Ideas for the classroom

- **Use:** analysis or mathematics for engineers at university; as an outlook also in an upper-secondary seminar (acoustics, signal processing). The phasor view links to the phasor representation of harmonic oscillations in physics.
- **Suggested sequence:** start with “Play the build-up”, then add up by hand at one point in the stacked view; with “Values in the picture” switched off (`info=0`), the pictures work as calculation tasks. Timbres (clarinet, violin, flute), power supplies and pulse-width modulation connect mathematics with physics, electrical engineering and computer science (compression, MP3).
- **Common pitfalls:**
  - The constant term is $\frac{a_0}{2}$, not $a_0$.
  - Students expect the Gibbs overshoot to disappear as $N$ grows – it only gets narrower.
  - At a jump the series gives the mean of the one-sided limits.
  - A shift only changes the phases, not the amplitudes.
