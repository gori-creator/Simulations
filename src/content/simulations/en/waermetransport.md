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

**Windows** are a house’s weak points. Single glazing has $U \approx 5.8\,\frac{\text{W}}{\text{m}^2 \cdot \text{K}}$, modern triple glazing only about $0.7$: gas between the panes conducts poorly, and a very thin metal coating reflects heat radiation back into the room.

### Everyday: why does tea stay hot in a vacuum flask?

Hot tea loses heat in all three ways: through the wall of the mug (**conduction**), with warm air and steam above the open surface (**convection** and evaporation) and as **radiation**. The bigger the temperature difference, the faster it cools – first quickly, then more and more slowly (Newton’s law of cooling):

$$
T(t) = T_U + (T_0 - T_U) \cdot e^{-k t}
$$

A **lid** keeps the warm air and steam in; a **double-walled** mug has an insulating layer of air; a **vacuum flask** has a vacuum between its walls (no particles, so no conduction or convection) and **silvered** walls that reflect radiation. What is left is mainly conduction through the neck and stopper.

### Everyday: clothing and wind

At rest the body produces about 100 W of heat, considerably more when walking briskly. It is given off through the skin: by conduction, convection and radiation. Clothing insulates because it holds air between the fibres – like a house wall with insulation. Wind blows away the warm layer of air at the surface, which is why a windy day feels colder than a still one at the same temperature. The simulation ignores sweating and uses P = A · ΔT / (R_clothing + R_air).

### Solar collector

A flat-plate collector on the roof uses all three kinds of heat transfer: a black absorber swallows the sunlight, conduction carries the heat into the water, and a glass pane reduces losses by convection and thermal radiation. The hotter the water compared with the air, the more is lost again – the efficiency drops.

## Try it

- [Winter walk in the wind](?mode=koerper&kclo=2&kta=-5&kv=6&kakt=gehen) and [T-shirt at 5 °C](?mode=koerper&kclo=0.5&kta=5&kv=0&kakt=ruhe): how much clothing do you need so you do not get cold?
- [Collector in summer](?mode=kollektor&sg=800&stc=50&sta=20&sglas=1&sschw=1) and [no glass, bare sheet metal](?mode=kollektor&sg=800&stc=50&sta=20&sglas=0&sschw=0): what do glass and black paint do?
- [Copper](?mode=leitung&mat=copper) vs [wood](?mode=leitung&mat=wood&raffer=10000)
- [Pot of water](?mode=stroemung), [hotplate](?mode=strahlung&tk=500)
- [Old wall](?mode=daemmung&di=0) vs [insulated](?mode=daemmung&di=16)
- [Single glazing](?mode=daemmung&bau=fenster&fen=einfach&fa=4&ta=-5) vs [triple glazing](?mode=daemmung&bau=fenster&fen=dreifach&fa=4&ta=-5)
- [Tea in a mug](?mode=abkuehlen&gef=becher&t0=85&dauer=60) and [vacuum flask over 6 hours](?mode=abkuehlen&gef=thermos&t0=85&dauer=360): press “Start”.
- [Practice](?mode=ueben&qn=1): eight tasks – classify and calculate.

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

**5. Replacing a window.** A 4 m² single-glazed window ($U = 5.8$) is replaced by triple glazing ($U = 0.7$). Outside −5 °C, inside 20 °C. How many kWh are saved per day? [Load task](?mode=daemmung&bau=fenster&fen=dreifach&fa=4&ta=-5&_hide=1)

<details><summary>Show solution</summary>

Before: $5.8 \cdot 4 \cdot 25\,\text{W} = 580\,\text{W}$, after: $70\,\text{W}$. Saving $510\,\text{W} \cdot 24\,\text{h} \approx 12.2\,\text{kWh}$ per day.

</details>

**6. Cooling tea.** Tea at 85 °C cools in an open mug with $k = 0.024\,\frac{1}{\text{min}}$, room at 20 °C. How warm is it after 30 minutes? [Load task](?mode=abkuehlen&gef=becher&t0=85&dauer=60&_hide=1)

<details><summary>Show solution</summary>

$T = 20\,°\text{C} + 65\,\text{K} \cdot e^{-0.72} \approx 51.6\,°\text{C}$.

</details>

## Ideas for teaching

- Rods of different metals coated with wax, heated at one end.
- A drop of ink in a beaker heated from below shows convection.
- Compute the heating energy saved in a winter and compare with a real heating bill.
- Climate: the Earth loses heat to space only by radiation – this leads on to the greenhouse effect.
- Two identical mugs of hot water, one with a lid: measure every 5 minutes and compare the curves with the simulation.
- Common mistake: cold does not “creep in” – heat always flows from warm to cold.
