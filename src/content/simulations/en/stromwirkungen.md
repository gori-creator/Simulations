## What is it about?

You cannot see electric current. You only notice it by its **effects** – and these effects are also what makes it dangerous.

### The effects of current

- **Heating effect:** every wire carrying current gets warm. Heating wires in toasters, kettles and hair dryers use this.
- **Lighting effect:** if the wire gets very hot, it glows – this is how a light bulb works. LEDs produce light in a different way, with almost no heat.
- **Magnetic effect:** a wire with current becomes a magnet. As a coil with an iron core (**electromagnet**) it lifts paper clips; it works in door openers, bells and motors.
- **Chemical effect:** current through salt water splits substances, and gas bubbles rise at the wires (**electrolysis**). This is used to plate metals and charge batteries.

The **larger the current**, the stronger the effect: the lamp glows brighter, the magnet holds more clips, more bubbles rise.

### Fuse and short circuit

If the two leads touch directly, the current bypasses the device through a path with almost no resistance: a **short circuit**. The current becomes huge and the cables get hot – a fire can start. A **fuse** contains a thin wire that melts when the current is too large and breaks the circuit. In houses today **circuit breakers** do this job.

### Danger to people

Our body conducts electricity because it contains a lot of salt water. If current flows from the hand to the feet, it acts on muscles and the heart:

| Body current | Effect (guide values) |
|---|---|
| below 1 mA | hardly noticeable |
| 1–10 mA | tingling, shock |
| 10–50 mA | muscles cramp – you can no longer let go |
| above 50 mA | ventricular fibrillation – danger to life |

How much current flows depends on the **voltage** and on the body’s **resistance**. Wet skin conducts much better than dry skin. That is why batteries are harmless but the **mains socket (230 V) is deadly** – especially in the bathroom.

A **residual-current device (RCD)** compares the current flowing out and back. If more than 30 mA are missing (because they flow through a person to earth), it switches off in about 0.03 seconds. This usually saves the person’s life.

**Rules:** never tamper with sockets or cables, do not use electrical devices near water, do not touch damaged cables, keep away from railway overhead lines.

### At home: currents add up

Each device draws $I = \frac{P}{U}$: a 2000 W kettle on 230 V about 8.7 A. On a power strip the currents of all devices add up. A household circuit is usually protected at **16 A** – kettle, hair dryer and fan heater together (over 25 A) trip the breaker.

### Protective earth and RCD

Devices with a metal casing have a **protective earth** wire (green-yellow). If a live wire touches the casing, a large current flows to earth and the breaker trips at once. Without it the casing would be live. An **RCD** compares outgoing and returning current and switches off within a fraction of a second if 30 mA are missing.

### Why the bird is safe

A bird on **one** wire bridges only a few centimetres of cable – there is practically no voltage between its feet. It becomes dangerous when the body connects two points with a large voltage difference: two wires, or a wire and the earth.

## Try it

- [Light bulb](?mode=wirkungen&geraet=lampe&U=6&sich=2&kurz=0): Raise the voltage. How do the current and brightness change?
- [Heating wire](?mode=wirkungen&geraet=heiz&U=12&sich=5&kurz=0): What happens with a 2 A fuse?
- [Short circuit](?mode=wirkungen&geraet=lampe&U=6&sich=2&kurz=1): Why does the fuse blow?
- [Socket](?mode=gefahr&quelle=netz&nass=1&fi=0): Switch on the RCD.
- [Breakfast](?mode=haushalt&kocher=1&toaster=1&foehn=0&heizer=0&lampe=1&laden=1), [overload](?mode=haushalt&kocher=1&foehn=1&heizer=1&toaster=0&lampe=1&laden=1)
- [Fault with earth](?mode=schutz&pe=1&fi=0&fehl=1), [without earth](?mode=schutz&pe=0&fi=0&fehl=1), [with RCD](?mode=schutz&pe=0&fi=1&fehl=1): press “Touch the casing”.
- [Bird on one wire](?mode=vogel&kon=eins), [kite string](?mode=vogel&kon=boden), [practice](?mode=ueben&qn=1)

## Exercises

**1. Electromagnet.** How can you make the electromagnet hold more paper clips? [Load exercise](?mode=wirkungen&geraet=spule&U=4&sich=5&kurz=0)

<details><summary>Show solution</summary>

Raise the voltage: more current flows and the magnetic effect becomes stronger. (More turns would also help.)

</details>

**2. Short circuit.** At 6 V a short circuit lets about 15 A flow. What would happen without a fuse? [Load exercise](?mode=wirkungen&geraet=lampe&U=6&sich=5&kurz=1&_hide=1)

<details><summary>Show solution</summary>

The cables would get very hot, the insulation could melt and start a fire. The fuse breaks the circuit before that.

</details>

**3. Wet hands.** Calculate the body current at 230 V for dry skin (3000 Ω) and wet skin (1000 Ω). [Load exercise](?mode=gefahr&quelle=netz&nass=1&fi=0&_hide=1)

<details><summary>Show solution</summary>

Dry: $I = \dfrac{230\,\text{V}}{3000\,\Omega} \approx 77$ mA. Wet: $I = \dfrac{230\,\text{V}}{1000\,\Omega} = 230$ mA. Both are deadly.

</details>

**4. Power strip.** Kettle (2000 W), toaster (900 W) and hair dryer (1800 W) run on one strip; the circuit is protected at 16 A. Does the breaker trip? [Load task](?mode=haushalt&kocher=1&toaster=1&foehn=1&heizer=0&lampe=0&laden=0&_hide=1)

<details><summary>Show solution</summary>

$I = \frac{4700\,\text{W}}{230\,\text{V}} \approx 20.4\,\text{A}$ – more than 16 A, the breaker trips.

</details>

## Ideas for teaching

- Read the rating plates of devices at home and calculate $I = P / U$.
- Common mistake: the fuse protects the wiring from overheating – not people. People are protected by the RCD.
