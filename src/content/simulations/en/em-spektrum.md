## What is it about?

Radio waves, microwaves, thermal radiation, light, UV, X-rays and gamma rays are **the same kind of wave**: electromagnetic waves. They consist of an electric and a magnetic field that create each other, and they need no medium. In a vacuum they all travel at the **speed of light**

$$
c \approx 3 \cdot 10^8\,\tfrac{\text{m}}{\text{s}} \qquad c = \lambda \cdot f
$$

They differ only in **wavelength** $\lambda$ and therefore **frequency** $f$. The spectrum spans more than 18 powers of ten, which is why the band in the simulation is **logarithmic**: every tick means "ten times larger".

### Energy and danger

Electromagnetic radiation delivers energy in portions, the **photons**, each with $E = h \cdot f$ ($h \approx 6.63 \cdot 10^{-34}\,\text{J s}$). The shorter the wavelength, the more energy per photon. From far UV (about 10 eV) it can knock electrons out of atoms: the radiation is **ionising** and can damage DNA. Radio, microwaves and light are non-ionising; they mainly heat.

### How are radio waves made? The Hertzian dipole

An LC circuit oscillates but hardly radiates. Pull the capacitor plates apart and stretch the coil into a wire and you get an **open oscillating circuit**: a straight rod, the **Hertzian dipole**. Its electrons oscillate, the ends switch between plus and minus, and the changing field detaches as a wave. A dipole works best when its length is half a wavelength: $l = \frac{\lambda}{2} = \frac{c}{2f}$.

### Modulation

An audio signal is far too slow to be radiated itself. It is imprinted on a fast **carrier**:

- **AM:** the carrier's amplitude follows the audio signal; the receiver extracts the envelope.
- **FM:** the amplitude stays constant, the frequency varies with the signal. Interference mostly affects amplitude, so FM radio sounds cleaner.

### The spectrum in everyday life

Almost every household device uses a part of the spectrum. Radios and phones send radio waves and microwaves, the microwave oven works at 2.45 GHz (λ ≈ 12 cm) – almost the same frequency as Wi-Fi. The remote control flashes in the infrared, a UV lamp checks banknotes, and at the doctor’s X-rays pass through the body. Only from the ultraviolet onwards are photons energetic enough to **ionise** atoms – that is why we protect ourselves from UV and X-rays, not from Wi-Fi.

### All waves travel equally fast

In a vacuum all electromagnetic waves travel at the **speed of light** $c \approx 300\,000\,\text{km/s}$. The travel time is $t = \frac{s}{c}$: a radio signal takes 1.3 s to the Moon, sunlight a good 8 minutes to the Earth. GPS uses exactly this: the phone measures how long the signals from several satellites were on their way and works out its position.

## Try it

- [Green light](?lg=-6.3), [FM radio](?lg=0.5), [Wi-Fi](?lg=-0.9), [X-ray](?lg=-10)
- [Hertzian dipole](?mode=dipol&fMHz=100): when is the current largest, when the charges at the ends?
- Compare [AM](?mode=mod&art=am) and [FM](?mode=mod&art=fm).
- [Microwave oven](?mode=alltag&ger=mikro), [remote control](?mode=alltag&ger=fernbed) and [X-ray](?mode=alltag&ger=roentgen): which radiation is ionising?
- [Radio to the Moon](?mode=laufzeit&ziel=mond) and [light from the Sun](?mode=laufzeit&ziel=sonne): press play.
- [Practice](?mode=ueben&qn=1): six kinds of tasks with a score.

## Exercises

**1. Frequency from wavelength.** An FM station transmits with $\lambda \approx 3\,\text{m}$. Find the frequency. [Load exercise](?lg=0.5&_hide=1)

<details><summary>Show solution</summary>

$f = \frac{c}{\lambda} = \frac{3 \cdot 10^8\,\text{m/s}}{3\,\text{m}} = 100\,\text{MHz}$.

</details>

**2. Microwave oven.** A microwave oven works at $2.45\,\text{GHz}$. What is the wavelength?

<details><summary>Show solution</summary>

$\lambda = \frac{c}{f} \approx 0.12\,\text{m} = 12\,\text{cm}$ – microwaves, almost the same frequency as Wi-Fi.

</details>

**3. Photon energy.** Compare a green photon ($500\,\text{nm}$) with an X-ray photon ($0.1\,\text{nm}$). Which is ionising? [Load exercise](?lg=-10&_hide=1)

<details><summary>Show solution</summary>

Green: about $2.5\,\text{eV}$. X-ray: 5000 times shorter wavelength, so about $12\,400\,\text{eV}$. Only the X-ray photon is ionising.

</details>

**4. Antenna length.** How long is a $\lambda/2$ dipole for $100\,\text{MHz}$? And for $433\,\text{MHz}$? [Load exercise](?mode=dipol&fMHz=100&_hide=1)

<details><summary>Show solution</summary>

$1.5\,\text{m}$ and about $35\,\text{cm}$.

</details>

**Travel time.** How long does a radio signal take to a GPS satellite at an altitude of 20 200 km? [Load task](?mode=laufzeit&ziel=gps&_hide=1)

<details><summary>Show solution</summary>

$t = \dfrac{2.02 \cdot 10^7\,\text{m}}{3 \cdot 10^8\,\text{m/s}} \approx 0.067\,\text{s}$. An error of just a millionth of a second already means a 300 m error in the position.

</details>

## Ideas for teaching

- Pin everyday objects (radio, phone, remote control, lamp, sunscreen, X-ray image) to the band.
- The "about the size of" readout makes powers of ten tangible.
- The dipole is an opened-up LC circuit; photon energy leads on to the photoelectric effect.
