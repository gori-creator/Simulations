## What is it about?

Heat always flows by itself from the **warmer** to the **colder** body until both are equally warm. There are three ways.

### Conduction

Particles at the hot end vibrate strongly and bump their neighbours, so energy travels through the material **without the material moving**. Metals such as copper and aluminium conduct heat very well; wood, glass, polystyrene and above all air conduct it badly – they are **insulators**. The measure is the **thermal conductivity** $\lambda$. When heat flows through a layer of thickness $l$ and area $A$, in steady state

$$
P = \lambda \cdot A \cdot \frac{\Delta T}{l}
$$

### Convection

In liquids and gases the material itself moves: heated water expands, becomes lighter and **rises**; cold water sinks at the sides. The flow **carries the heat** with it. Radiators, hair dryers, wind and ocean currents all work this way.

### Radiation

Every body emits infrared radiation – the hotter, the **much** more, even through a vacuum. Stefan–Boltzmann law: $P = \varepsilon \cdot \sigma \cdot A \cdot T^4$ with $\sigma \approx 5.67 \cdot 10^{-8}\,\tfrac{\text{W}}{\text{m}^2\text{K}^4}$. Matt black surfaces radiate (and absorb) a lot, emissivity $\varepsilon \approx 1$; shiny metal hardly at all, $\varepsilon \approx 0.05$. That is why a rescue blanket is silver and a vacuum flask is mirrored inside.

### Insulation

The **U-value** says how many watts pass per square metre and kelvin: $P = U \cdot A \cdot \Delta T$. The smaller $U$, the better. A polystyrene layer contains a lot of trapped air and lowers the U-value dramatically.

## Try it

- [Copper](?mode=leitung&mat=copper) vs [wood](?mode=leitung&mat=wood&raffer=10000)
- [Pot of water](?mode=stroemung), [hotplate](?mode=strahlung&tk=500)
- [Old wall](?mode=daemmung&di=0) vs [insulated](?mode=daemmung&di=16)

## Exercises

**1. Copper or wood?** A rod 20 cm long, 1 cm² cross-section, joins 100 °C and 20 °C. Heat flow for copper ($\lambda = 390$) and wood ($\lambda = 0.13$)? [Load exercise](?mode=leitung&mat=copper&th=100&_hide=1)

<details><summary>Show solution</summary>

Copper 15.6 W, wood about 0.005 W – 3000 times less.

</details>

**2. Radiation.** A matt black surface ($\varepsilon = 0.95$) at 200 °C – power per m²? And at 500 °C? [Load exercise](?mode=strahlung&tk=200&_hide=1)

<details><summary>Show solution</summary>

About 2.7 kW and 19 kW – seven times as much, because $(773/473)^4 \approx 7.1$. Use kelvin!

</details>

**3. Is insulation worth it?** 10 m² of brick wall (24 cm, $\lambda = 0.8$), 20 °C inside, −5 °C outside. Loss without and with 16 cm polystyrene ($\lambda = 0.035$)? $R_\text{si} = 0.13$, $R_\text{se} = 0.04$. [Load exercise](?mode=daemmung&dw=24&di=0&ta=-5&_hide=1)

<details><summary>Show solution</summary>

Without: $U \approx 2.13$, $P \approx 532\,\text{W}$. With: $U \approx 0.20$, $P \approx 50\,\text{W}$.

</details>

**4. Which kind of transfer?** Match: radiator under the window – sunburn – hot pan handle – vacuum flask with a mirror layer.

<details><summary>Show solution</summary>

Radiator: mainly **convection**. Sunburn: **radiation**. Pan handle: **conduction**. Vacuum flask: the mirror layer stops **radiation**, the vacuum stops **conduction** and **convection**.

</details>

## Ideas for teaching

- Rods of different metals coated with wax, heated at one end.
- A drop of ink in a beaker heated from below shows convection.
- Compute the heating energy saved in a winter and compare with a real heating bill.
- Climate: the Earth loses heat to space only by radiation – this leads on to the greenhouse effect.
