## What is it about?

A **Platonic solid** is a solid whose faces are **all identical regular polygons**, with the **same number** of faces meeting at every vertex. The ancient Greeks already knew that there are exactly **five** of them.

| Solid | Faces | at each vertex | Vertices V | Edges E | Faces F |
| --- | --- | --- | --- | --- | --- |
| Tetrahedron | equilateral triangles | 3 | 4 | 6 | 4 |
| Cube (hexahedron) | squares | 3 | 8 | 12 | 6 |
| Octahedron | equilateral triangles | 4 | 6 | 12 | 8 |
| Dodecahedron | regular pentagons | 3 | 20 | 30 | 12 |
| Icosahedron | equilateral triangles | 5 | 12 | 30 | 20 |

### Why only five?

At least three faces must meet at a vertex, and their angles must add up to **less than 360°**, otherwise everything lies flat in a plane.

- **Triangles** have $60°$ angles. Three ($180°$), four ($240°$) or five ($300°$) fit, while six already make $360°$. This gives the tetrahedron, octahedron and icosahedron.
- **Squares** have $90°$ angles. Only three fit ($270°$), which gives the cube.
- **Pentagons** have $108°$ angles. Only three fit ($324°$), which gives the dodecahedron.
- **Hexagons** have $120°$ angles. Three already make $360°$, so they do not work.

### Euler's polyhedron formula

Leonhard Euler discovered that every solid made of flat faces and without holes satisfies

$$V - E + F = 2$$

This works not only for the Platonic solids but also, for example, for every prism ($2n - 3n + (n+2) = 2$) and every pyramid ($(n+1) - 2n + (n+1) = 2$).

### Dual solids

Joining the centres of neighbouring faces gives another Platonic solid, the **dual** solid. Vertices and faces swap their numbers:

- The cube and the octahedron are dual to each other.
- The dodecahedron and the icosahedron are dual to each other.
- The tetrahedron is dual to itself.

## Try it

- [Tetrahedron](?k=tetra&mark=ecken): Turn the solid and count the vertices.
- [Cube with octahedron](?k=hexa&mark=keine&dual=1): How many vertices does the inner octahedron have? How many faces does the cube have?
- [Dodecahedron](?k=dodeka&mark=flaechen): How many pentagons meet at a vertex?
- [Euler for a prism](?k=prisma&n=6&mark=ecken): Change the number of vertices of the base. Does V − E + F stay the same?

## Exercises

**1. Counting.** Count the vertices, edges and faces of the octahedron and check Euler's formula. [Load exercise](?k=okta&mark=ecken&_hide=1)

<details><summary>Show solution</summary>

$V = 6$, $E = 12$, $F = 8$, so $6 - 12 + 8 = 2$.

</details>

**2. Working out the edges.** The icosahedron has 20 triangular faces. How many edges does it have, without counting?

<details><summary>Show solution</summary>

Each face has 3 edges, and each edge belongs to 2 faces. So $E = \tfrac{20 \cdot 3}{2} = 30$.

</details>

**3. Using Euler.** A solid has 12 faces and 30 edges. How many vertices does it have? [Load exercise](?k=dodeka&mark=keine&_hide=1)

<details><summary>Show solution</summary>

$V = 2 + E - F = 2 + 30 - 12 = 20$. This is the dodecahedron.

</details>

**4. No sixth solid.** Why is there no Platonic solid made of hexagons?

<details><summary>Show solution</summary>

A regular hexagon has interior angles of $120°$. Three of them already make $360°$ at a vertex and lie flat in the plane. That gives a tiling, but not a corner in space.

</details>
