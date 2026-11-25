## What is it about?

A building is three-dimensional, but a building plan is flat. So that all the measurements can still be read off, the building is drawn from several directions. This is done with **parallel projections**: every point is carried onto the drawing plane along parallel lines.

### Three-view drawing

In an **orthographic projection** you look straight at one side:

- The **front view** shows the building from the front, with length and height.
- The **side view** shows it from the left, with width and height.
- The **plan** shows it from above, with length and width.

The three views are arranged so that matching points lie on the same **projection lines**: the plan sits below the front view and the side view to its right. Architects speak of plans, elevations and sections.

### Oblique drawing

An **oblique drawing** shows the solid in space in a single picture. The front view is drawn undistorted, and the edges running backwards are drawn at an angle $\alpha$ and shortened by a factor $k$. Usual values are $\alpha = 45°$ and $k = \tfrac12$ (**cavalier projection**). Segments parallel to the front face appear in true length, while depths are shortened.

### True size

A segment or face only appears in **true size** in a view if it is **parallel** to the drawing plane. The sloping surface of a gable roof is not parallel to any of the three planes:

- In the **plan** it appears shortened, and its depth there is only half the width of the house, $\tfrac b2$.
- In the **side view** the roof slope $s$ appears in true length. By Pythagoras' theorem, $s = \sqrt{\left(\tfrac b2\right)^2 + d^2}$.

The true size of the roof surface (for counting roof tiles, for example) is then $a \cdot s$. It is always larger than the area seen in the plan.

## Try it

- [Family house](?mode=dreitafel&body=haus&a=10&b=6&h=3&d=4): Follow the projection lines. Where does the ridge appear in the side view?
- [Hip roof](?mode=dreitafel&body=walm&a=12&b=8&h=3&d=3): How does the plan differ from the gable roof?
- [Oblique 45°, ½](?mode=schraeg&body=haus&al=45&k=0.5): Change the angle and the factor. Which edges keep their length?
- [Roof surface in true size](?mode=wahre&body=haus&a=10&b=6&h=3&d=4): How does the length s depend on the roof height?

## Exercises

**1. Roof slope.** A house is 6 m wide and its roof is 4 m high. How long is the roof slope? [Load exercise](?mode=wahre&body=haus&a=10&b=6&h=3&d=4&_hide=1)

<details><summary>Show solution</summary>

$s = \sqrt{3^2 + 4^2} = 5$ m.

</details>

**2. Roof area.** How large are the two roof surfaces together if the house is 10 m long? How large do they appear in the plan?

<details><summary>Show solution</summary>

The true size is $2 \cdot 10 \cdot 5 = 100\,\text{m}^2$. In the plan they appear as only $10 \cdot 6 = 60\,\text{m}^2$.

</details>

**3. Oblique drawing.** A cube with 4 cm edges is drawn with $\alpha = 45°$ and $k = \tfrac12$. How long do you draw the edges running backwards? [Load exercise](?mode=schraeg&body=winkel&al=45&k=0.5&_hide=1)

<details><summary>Show solution</summary>

$4\,\text{cm} \cdot \tfrac12 = 2$ cm, at 45° to the horizontal.

</details>

**4. Matching the view.** In which view do you see the triangular gable of a gable roof?

<details><summary>Show solution</summary>

In the side view, because the gable is at the narrow end and parallel to the side plane.

</details>
