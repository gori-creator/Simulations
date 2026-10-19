---
description: "Interactive simulation for university: Fourier series of square, sawtooth, triangle and rectified sine waves – built up harmonic by harmonic, with amplitude spectrum, test point and the Gibbs phenomenon."
---

## What is it about?

A $2\pi$-periodic function can be written as $f(x) \approx \frac{a_0}{2} + \sum_{k=1}^{N}(a_k \cos kx + b_k \sin kx)$. The square wave is $\frac{4}{\pi}(\sin x + \frac13 \sin 3x + \frac15 \sin 5x + \ldots)$. Signals with jumps have amplitudes falling like $\frac1k$; at a jump the partial sums overshoot by about $9\,\%$ of the jump (**Gibbs phenomenon**), however large $N$ is.

## Try it

1. [Square wave](?sig=sq&n=1): press “Next harmonic” several times, then “Play the build-up”.
2. [Gibbs phenomenon](?sig=sq&n=30&x=0.1) and [triangle](?sig=tri&n=3).

## Tasks

### Task 1: Symmetry

Why does the square wave series contain only sines and the triangle series only cosines?

<details>
<summary>Show solution</summary>

The square wave is odd ($a_k = 0$), the triangle is even ($b_k = 0$). [Show](?sig=tri&n=5)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Link to acoustics: the timbre of an instrument is its spectrum.
- **Common stumbling blocks:** the constant term is $\frac{a_0}{2}$; expecting the Gibbs overshoot to vanish.
