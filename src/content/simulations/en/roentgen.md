## What is it about?

In 1895 Wilhelm Conrad Röntgen discovered invisible radiation that passes through paper, wood and even the hand. Today we know that X-rays are electromagnetic radiation with a very short wavelength – about a thousand times shorter than visible light.

### The X-ray tube

In an evacuated tube, electrons leave a hot cathode. The voltage $U$ (some tens of kilovolts) accelerates them towards the anode, where each electron has the energy $e\cdot U$. On impact two kinds of radiation are produced:

- **Bremsstrahlung (braking radiation):** the electrons are slowed down in the field of the nuclei and emit photons – sometimes with a lot of energy, sometimes with little. This gives a **continuous spectrum**.
- **Characteristic radiation:** an electron knocks another one out of the innermost shell (K shell) of an anode atom. An electron from a higher shell drops into the gap and emits a photon of fixed energy: the **Kα and Kβ lines**. They are typical for each element.

### The short-wavelength limit

A photon can receive at most the whole energy $e\cdot U$ of one electron. This gives a **shortest wavelength** (Duane–Hunt law):

$$\lambda_\text{min} = \frac{h \cdot c}{e \cdot U}$$

With this formula you can even determine Planck’s constant $h$ from the spectrum.

### Measuring with a rotating crystal

X-rays are reflected by the atomic planes of a crystal. The waves reflected from neighbouring planes only reinforce each other if their path difference is a multiple of the wavelength (**Bragg condition**):

$$2d \cdot \sin \theta = n \cdot \lambda$$

So for each glancing angle $\theta$ only one wavelength reaches the detector, which sits at $2\theta$. Turning the crystal slowly measures the whole spectrum. The simulation uses a lithium fluoride crystal with $d = 201.4$ pm and shows the first order ($n = 1$).

### Moseley’s law

The energy of the Kα line grows with the atomic number $Z$ roughly like this:

$$E_{K\alpha} \approx 10.2\,\text{eV} \cdot (Z-1)^2$$

In 1913 Henry Moseley used it to order the elements in the periodic table by $Z$ and found gaps for elements not yet known.

### The Compton effect

When an X-ray photon hits an (almost) free electron, it bounces off like a billiard ball. It gives energy and momentum to the electron and afterwards has a **longer wavelength**:

$$\Delta\lambda = \lambda' - \lambda = \lambda_C \cdot (1 - \cos\varphi), \qquad \lambda_C = \frac{h}{m_e \cdot c} \approx 2.43\,\text{pm}$$

The shift depends only on the scattering angle $\varphi$, not on $\lambda$. In 1923 Arthur Compton showed with this that photons carry **momentum** $p = h/\lambda$.

## Try it

- [Molybdenum, 30 kV](?mode=roehre&anode=mo&U=30&th=10): Turn the crystal from 3° to 30°. Where are the lines?
- [Below threshold](?mode=roehre&anode=mo&U=18&th=10): Slowly raise the voltage. When do the lines appear?
- [Copper](?mode=roehre&anode=cu&U=25&th=22.5): Compare the position of the Kα line with molybdenum.
- [Compton](?mode=compton&l0=20&phi=90): Change the scattering angle. When is the shift largest?

## Exercises

**1. Cut-off wavelength.** Calculate $\lambda_\text{min}$ for $U = 30$ kV. [Load exercise](?mode=roehre&anode=mo&U=30&th=10&_hide=1)

<details><summary>Show solution</summary>

$\lambda_\text{min} = \dfrac{1240\,\text{keV pm}}{30\,\text{keV}} \approx 41.3$ pm.

</details>

**2. Bragg angle.** At what glancing angle does the Kα line of molybdenum (71 pm) appear with the LiF crystal? [Load exercise](?mode=roehre&anode=mo&U=30&th=5&_hide=1)

<details><summary>Show solution</summary>

$\sin\theta = \dfrac{71}{2 \cdot 201.4} \approx 0.176$, so $\theta \approx 10.2°$.

</details>

**3. Moseley.** Estimate the energy of the Kα line of copper ($Z = 29$) and compare with the measured value of 8.04 keV. [Load exercise](?mode=roehre&anode=cu&U=25&th=22.5&_hide=1)

<details><summary>Show solution</summary>

$10.2\,\text{eV} \cdot 28^2 \approx 8.0$ keV – very close to the measured value.

</details>

**4. Compton.** A photon of 20 pm is scattered by 90°. What is the new wavelength, and what energy does the electron receive? [Load exercise](?mode=compton&l0=20&phi=90&_hide=1)

<details><summary>Show solution</summary>

$\lambda' = 20 + 2.43 = 22.43$ pm. $E_e = \dfrac{1240}{20} - \dfrac{1240}{22.43} \approx 62.0 - 55.3 = 6.7$ keV.

</details>
