## What is it about?

Sound is produced when something **vibrates**: a guitar string, the membrane of a loudspeaker, the vocal cords. The vibration pushes the air particles. They pass the push on to their neighbours. In this way a **sound wave** travels through the air to the ear. In the **transmitter–receiver model** the sound source is the transmitter, the ear or a microphone is the receiver and the air is the medium.

**Pitch and frequency:** The faster a source vibrates, the higher the note sounds. The number of vibrations per second is the **frequency** $f$ (unit hertz, $1\,\text{Hz} = \tfrac{1}{\text{s}}$). The duration of one vibration is the **period** $T = \tfrac{1}{f}$. Concert A has $f = 440\,\text{Hz}$, so $T = \tfrac{1}{440}\,\text{s} \approx 2.27\,\text{ms}$. One octave higher means double the frequency.

**Loudness and amplitude:** The further the source swings, the louder the note. On the oscilloscope the curve is then taller. The **sound level** is measured in decibels (dB). Double the amplitude gives $+6\,\text{dB}$, double the sound power $+3\,\text{dB}$. We perceive about $+10\,\text{dB}$ as twice as loud.

**Timbre:** A violin and a flute can play the same note and still sound different. Besides the fundamental there are **overtones** with the frequencies $2f$, $3f$, … Their mix determines the timbre and the shape of the curve.

**Propagation:** Sound is a **longitudinal wave**. The particles move back and forth along the direction of travel, creating compressions and rarefactions. For the **wavelength**

$$
\lambda = \frac{c}{f}.
$$

In air at $20\,^\circ\text{C}$, $c \approx 343\,\tfrac{\text{m}}{\text{s}}$. For $440\,\text{Hz}$ this gives $\lambda = \tfrac{343}{440}\,\text{m} \approx 0.78\,\text{m}$. In water sound is about four times as fast, in steel about fifteen times. In a **vacuum** there are no particles and therefore no sound.

**Hearing range:** Humans hear from about $20\,\text{Hz}$ to $20\,\text{kHz}$. Below lies **infrasound** (elephants), above lies **ultrasound** (bats, ultrasound scans).

**Noise:** Doubling the distance lowers the level by $6\,\text{dB}$. From about $85\,\text{dB}$ noise damages hearing over time, from about $120\,\text{dB}$ even briefly.

## Try it

1. Change the frequency. What happens to the curve, and what to the sound? [Oscilloscope](?mode=osc&f=440&amp=60&tim=sine)
2. Measure the period with the cursors and calculate $f = \tfrac{1}{T}$. [Measure it yourself](?mode=osc&f=262&amp=70&tim=sine&cur=1&val=0)
3. Compare the timbres at the same frequency. What stays the same? [Timbre](?mode=osc&f=330&amp=70&tim=violin)
4. Switch from air to water and steel. How does the wavelength change? [Propagation](?mode=wave&f=440&med=air&temp=20)
5. Drag the ear further away. By how many dB does the level drop with each doubling? [Level](?mode=level&L1=90&r=2&n=1)
6. Shout at the rock face and time it. From what distance do you hear a separate echo? [Echo](?mode=echo&d=170&med=air&temp=20)
7. Halve the length of the string. How does the note change? [String](?mode=source&src=string&sl=65&ten=70&sty=e1&hn=1)

## Tasks

### Task 1: Concert A

Calculate the period and the wavelength of concert A ($440\,\text{Hz}$) in air ($c = 343\,\tfrac{\text{m}}{\text{s}}$).

<details>
<summary>Show solution</summary>

$T = \tfrac{1}{440\,\text{Hz}} \approx 2.27\,\text{ms}$, $\lambda = \tfrac{343\,\text{m/s}}{440\,\text{Hz}} \approx 0.78\,\text{m}$. [Show in the simulation](?mode=osc&f=440&amp=60&tim=sine)

</details>

### Task 2: Echo

A shout comes back as an echo after $1.0\,\text{s}$. How far away is the rock face?

<details>
<summary>Show solution</summary>

The sound travels there and back: $d = \tfrac{c \cdot t}{2} = \tfrac{343 \cdot 1.0}{2}\,\text{m} \approx 172\,\text{m}$. [Show in the simulation](?mode=echo&d=172&med=air&temp=20)

</details>

### Task 3: Loudness

At a distance of $1\,\text{m}$ you measure $90\,\text{dB}$. What is the level at $4\,\text{m}$? What is it if a second, equally loud source is added?

<details>
<summary>Show solution</summary>

Doubled twice: $90 - 6 - 6 = 78\,\text{dB}$. With two sources you add $3\,\text{dB}$: about $81\,\text{dB}$. [Show in the simulation](?mode=level&L1=90&r=4&n=2)

</details>

### Task 4: Guitar string

A string ($L = 65\,\text{cm}$, $\mu = 0.4\,\tfrac{\text{g}}{\text{m}}$) is tensioned with $70\,\text{N}$. What is the frequency of its fundamental? What happens if you press it down in the middle?

<details>
<summary>Show solution</summary>

$f = \tfrac{1}{2L}\sqrt{\tfrac{F}{\mu}} = \tfrac{1}{1.3\,\text{m}} \cdot \sqrt{\tfrac{70\,\text{N}}{0.0004\,\text{kg/m}}} \approx 322\,\text{Hz}$. At half the length the frequency doubles: the note sounds one octave higher. [Show in the simulation](?mode=source&src=string&sl=65&ten=70&sty=e1&hn=1)

</details>

### Task 5: Beats

Two tuning forks vibrate at $440\,\text{Hz}$ and $444\,\text{Hz}$. How many times per second does the sound swell?

<details>
<summary>Show solution</summary>

$f_B = |444 - 440|\,\text{Hz} = 4\,\text{Hz}$, so four times per second. [Show in the simulation](?mode=beat&f=440&df=4)

</details>

## Ideas for the classroom

- **Starter:** Strike a tuning fork and dip it into water. The vibration becomes visible. Then look at it on the oscilloscope.
- **Measuring:** Use a microphone and an oscilloscope (or an app) to find the frequency of your own notes and compare with the simulation.
- **Noise:** Use a sound-level app around the school and place the readings on the scale of the simulation.
- **Common pitfalls:**
  - Mixing up loudness and pitch: the frequency sets the pitch, the amplitude sets the loudness.
  - “The air travels to the ear.” The particles only move back and forth; it is the disturbance that travels.
  - Adding decibels: two equally loud sources do not give twice as many dB, only $+3\,\text{dB}$.
