## What is it about?

A $2\pi$-periodic function can be written as a **Fourier series** $f(x) \approx \frac{a_0}{2} + \sum_{k=1}^{N}(a_k \cos kx + b_k \sin kx)$. Writing each term as $\hat A_k \sin(kx + \varphi_k)$ gives the **amplitude spectrum** $\hat A_k = \sqrt{a_k^2 + b_k^2}$ and the **phase spectrum** $\varphi_k$. The square wave is $\frac{4}{\pi}(\sin x + \frac13 \sin 3x + \frac15 \sin 5x + \ldots)$.

- **Phasors:** each term is a phasor of length $\hat A_k$ turning $k$ times as fast as the fundamental; chained together, the height of the tip draws $S_N$.
- **Symmetry:** odd functions have sine terms only, even functions cosine terms only; if $f(x + \pi) = -f(x)$, all even $k$ vanish.
- **Jumps vs. kinks:** with jumps the amplitudes fall like $\frac1k$, with kinks like $\frac{1}{k^2}$.
- **Gibbs phenomenon:** at a jump the partial sums overshoot by about $9\,\%$ of the jump (square wave: $1.179$), however large $N$ is. Fejér factors $\sigma_k = 1 - \frac{k}{N+1}$ remove the overshoot.
- **Parseval:** $P = \frac{1}{2\pi}\int f^2\,dx = (\frac{a_0}{2})^2 + \frac12 \sum (a_k^2 + b_k^2)$. The fundamental of the square wave carries $\frac{8}{\pi^2} \approx 81.06\,\%$ of the power.

## Try it

1. [Square wave](?sig=sq&n=1): press “Add a harmonic” several times, then “Play the build-up”.
2. [Phasors draw a square wave](?view=epi&sig=sq&n=7) and [stacked harmonics](?view=stack&sig=saw&n=8&x=2).
3. [Gibbs phenomenon](?sig=sq&n=30&x=0.1) versus [Fejér smoothing](?sig=sq&n=30&x=0.1&sm=fejer).
4. [Clarinet](?view=spec&sig=sq&n=11&f0=147) versus [flute](?view=spec&sig=tri&n=5&f0=523) – compare spectra and listen.
5. [LED dimmer](?sig=pulse&d=25&n=20&f0=500&tax=1&x=0.5): change the duty cycle $d$.

## Tasks

### Task 1: Symmetry

Why does the square wave series contain only sines and the triangle series only cosines? What happens if the square wave is shifted by $90°$?

<details>
<summary>Show solution</summary>

The square wave is odd ($a_k = 0$), the triangle is even ($b_k = 0$). Shifted by $\frac{\pi}{2}$ the square wave becomes even: cosine terms only, same amplitudes. [Show](?view=spec&sig=sq&n=9&ph=90)

</details>

### Task 2: Parseval

What share of the power of the square wave is contained in $S_1$ and in $S_3$? From which $N$ on is it at least $95\,\%$? [Load task](?view=spec&sig=sq&n=1&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$S_1$: $\frac{8}{\pi^2} \approx 81.06\,\%$; $S_3$: $\frac{8}{\pi^2}(1 + \frac19) \approx 90.06\,\%$; $S_7$: $94.96\,\%$; $S_9$: $95.96\,\%$ – so from $N = 9$ on. [Show](?view=spec&sig=sq&n=9)

</details>

### Task 3: LED dimmer

A pulse train (height $1$, duty cycle $d = 25\,\%$) drives an LED. Find the DC part and the first four amplitudes. Which one is missing?

<details>
<summary>Show solution</summary>

DC part $d = 0.25$; $\hat A_k = \frac{2|\sin(\pi k d)|}{\pi k}$: $0.450$, $0.318$, $0.150$ and $\hat A_4 = 0$ (every fourth harmonic vanishes). [Show](?view=spec&sig=pulse&d=25&n=8)

</details>

### Task 4: Full-wave rectifier

Mains at $50\,\text{Hz}$ gives $|\sin x|$ after the rectifier. Find the mean and the second harmonic (first overtone, $k = 2$). At which frequency does the power supply hum?

<details>
<summary>Show solution</summary>

Mean $\frac{2}{\pi} \approx 0.637$; only even $k$: $a_2 = -\frac{4}{3\pi} \approx -0.424$ at $100\,\text{Hz}$. [Show](?view=spec&sig=full&n=8&f0=50&tax=1)

</details>

## Ideas for the classroom

- Start with “Play the build-up”, then add the values by hand in the stacked view; with “Values in the picture” off (`info=0`) the pictures work as exercises.
- Link to acoustics (timbre of clarinet, violin, flute) and electronics (rectifier, pulse-width modulation).
- **Common stumbling blocks:** the constant term is $\frac{a_0}{2}$; expecting the Gibbs overshoot to vanish; a shift changes only the phases, not the amplitudes.
