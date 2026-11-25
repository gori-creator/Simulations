import { L } from './helpers';
import type { Subject } from './types';

/**
 * Lehrplanstruktur Physik (bundeslandneutral, orientiert an den
 * KMK-Bildungsstandards und typischen Klassenstufen).
 *
 * Alle Einträge sind noch geplant – das Grundgerüst (Animationsuhr,
 * Diagramme, Zahlenformatierung) ist für Physik-Simulationen vorbereitet.
 */
export const physik: Subject = {
  id: 'physik',
  slug: L('physik', 'physics'),
  title: L('Physik', 'Physics'),
  description: L(
    'Bewegungen, Kräfte, Schwingungen, Stromkreise und Licht als Experimente am Bildschirm – mit Messwerten und Diagrammen.',
    'Motion, forces, oscillations, circuits and light as on-screen experiments – with measurements and graphs.',
  ),
  status: 'active',
  areas: [
    {
      id: 'messen',
      slug: L('messen', 'measurement'),
      title: L('Messen und Auswerten', 'Measurement and analysis'),
      description: L('Größen ablesen, Messreihen auswerten und Unsicherheit verstehen.', 'Read quantities, analyse measurements and understand uncertainty.'),
      grades: [5, 13],
      kmk: ['P-E', 'P-K'],
      topics: [{
        id: 'messmethoden',
        title: L('Messmethoden', 'Measurement methods'),
        grades: [5, 13],
        simulations: [{
          id: 'messunsicherheit',
          status: 'ready',
          slug: L('messunsicherheit', 'measurement-uncertainty'),
          title: L('Messen und Messunsicherheit', 'Measurement and uncertainty'),
          summary: L('Lies ein Lineal ab, verändere Messwerte und untersuche Mittelwert, Streuung, Fehlerbalken und Ausgleichsgeraden. Wiederholte Versuche zeigen, warum mehr Messungen nicht jeden Fehler beseitigen.', 'Read a ruler, edit measurements and explore means, scatter, error bars and best-fit lines. Repeated experiments show why more readings do not remove every error.'),
          grades: [5, 13],
          kmk: ['P-E', 'P-K', 'P-S'],
          keywords: L(['Messen', 'Einheiten', 'Messunsicherheit', 'Messfehler', 'Mittelwert', 'Standardabweichung', 'Standardfehler', 'Ausgleichsgerade', 'Regression', 'Fehlerbalken', 'Auflösung', 'Praktikum'], ['measurement', 'units', 'uncertainty', 'mean', 'standard deviation', 'standard error', 'regression', 'error bars', 'resolution', 'practical']),
        }],
      }],
    },
    {
      id: 'mechanik',
      slug: L('mechanik', 'mechanics'),
      title: L('Mechanik', 'Mechanics'),
      description: L(
        'Bewegungen beschreiben, Kräfte zerlegen, Energie und Impuls erhalten – vom Hebel bis zu Planetenbahnen.',
        'Describing motion, resolving forces, conserving energy and momentum – from levers to planetary orbits.',
      ),
      grades: [7, 13],
      kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Energie', 'P-BK-Erhaltung'],
      topics: [
        {
          id: 'bewegungen',
          title: L('Bewegungen', 'Motion'),
          grades: [7, 10],
          simulations: [
            {
              id: 'bewegungsdiagramme',
              status: 'ready',
              slug: L('bewegungsdiagramme', 'motion-graphs'),
              title: L('Gleichförmige und beschleunigte Bewegung (t-s- und t-v-Diagramme)', 'Uniform and accelerated motion (distance–time and velocity–time graphs)'),
              summary: L(
                'Ein Auto fährt gleichmäßig oder wird schneller. Dabei entstehen live die Diagramme für Weg, Geschwindigkeit und Beschleunigung.',
                'A car drives at a steady speed or speeds up. The graphs for distance, speed and acceleration are drawn live.',
              ),
              grades: [7, 11],
              kmk: ['P-E', 'P-K', 'P-S'],
              keywords: L(
                ['Bewegung', 'gleichförmige Bewegung', 'beschleunigte Bewegung', 't-s-Diagramm', 't-v-Diagramm', 't-a-Diagramm', 'Zeit-Ort-Diagramm', 'Geschwindigkeit', 'Beschleunigung', 'Bremsweg', 'Durchschnittsgeschwindigkeit', 'Steigungsdreieck'],
                ['motion', 'uniform motion', 'accelerated motion', 'distance–time graph', 'velocity–time graph', 'acceleration–time graph', 'velocity', 'acceleration', 'braking distance', 'average velocity', 'slope'],
              ),
            },
            {
              id: 'freier-fall',
              status: 'ready',
              slug: L('freier-fall', 'free-fall'),
              title: L('Freier Fall', 'Free fall'),
              summary: L(
                'Eine Kugel fällt auf Erde, Mond oder Mars und wird jede Sekunde schneller. Im Vakuum hält sogar eine Feder mit.',
                'A ball falls on Earth, the Moon or Mars and gets faster every second. In a vacuum even a feather keeps up.',
              ),
              grades: [9, 11],
              kmk: ['P-E', 'P-S', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['freier Fall', 'Fallbeschleunigung', 'Ortsfaktor', 'Fallröhre', 'Vakuum', 'Luftwiderstand', 'Stroboskop', 'Fallgesetz', 'Reaktionszeit', 'Lineal', 'gleichmäßig beschleunigte Bewegung'],
                ['free fall', 'gravitational acceleration', 'feather', 'vacuum', 'air resistance', 'stroboscope', 'law of falling bodies', 'reaction time', 'ruler', 'uniformly accelerated motion'],
              ),
            },
            {
              id: 'kleine-schritte',
              status: 'ready',
              slug: L('methode-der-kleinen-schritte', 'method-of-small-steps'),
              title: L('Methode der kleinen Schritte', 'Method of small steps'),
              summary: L(
                'Wenn sich die Kraft dauernd ändert, hilft keine Formel aus dem Buch. Man rechnet in kleinen Zeitschritten, wie in einer Tabelle – und sieht, wie gut das klappt.',
                'When the force keeps changing, no textbook formula helps. You compute in small time steps, like in a spreadsheet – and see how well it works.',
              ),
              grades: [10, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Methode der kleinen Schritte', 'numerische Simulation', 'Modellbildung', 'Tabellenkalkulation', 'Euler-Verfahren', 'Differenzenquotient', 'Zeitschritt', 'Luftwiderstand', 'Fallschirmspringer', 'Endgeschwindigkeit', 'Federpendel', 'Iteration', 'Computer'],
                ['method of small steps', 'numerical simulation', 'modelling', 'spreadsheet', 'Euler method', 'difference quotient', 'time step', 'air resistance', 'skydiver', 'terminal velocity', 'spring pendulum', 'iteration', 'computer'],
              ),
            },
          ],
        },
        {
          id: 'kraefte',
          title: L('Kräfte', 'Forces'),
          grades: [7, 10],
          simulations: [
            {
              id: 'hookesches-gesetz',
              status: 'ready',
              slug: L('hookesches-gesetz', 'hookes-law'),
              title: L('Hookesches Gesetz', 'Hooke’s law'),
              summary: L(
                'Hänge Gewichte an eine Feder und miss, wie weit sie sich dehnt. Doppelte Kraft heißt doppelte Dehnung.',
                'Hang weights on a spring and measure how far it stretches. Double the force means double the stretch.',
              ),
              grades: [7, 10],
              kmk: ['P-E', 'P-S', 'P-K', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Hookesches Gesetz', 'Feder', 'Federhärte', 'Federkonstante', 'Verlängerung', 'Kraft', 'Gewichtskraft', 'Proportionalität', 'Ursprungsgerade', 'Elastizitätsgrenze', 'Kraftmesser', 'Reihenschaltung', 'Parallelschaltung'],
                ['Hooke’s law', 'spring', 'spring constant', 'extension', 'force', 'weight', 'proportionality', 'elastic limit', 'spring balance', 'springs in series', 'springs in parallel'],
              ),
            },
            {
              id: 'hebelgesetz',
              status: 'ready',
              slug: L('hebelgesetz', 'law-of-the-lever'),
              title: L('Hebelgesetz', 'Law of the lever'),
              summary: L(
                'Wie hebt ein Kind einen Erwachsenen auf der Wippe? Mit dem längeren Arm. Schubkarre und Flaschenöffner nutzen denselben Trick.',
                'How can a child lift an adult on a seesaw? With the longer arm. Wheelbarrows and bottle openers use the same trick.',
              ),
              grades: [7, 11],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Energie'],
              keywords: L(
                ['Hebel', 'Hebelgesetz', 'Drehmoment', 'Kraftarm', 'Lastarm', 'Drehachse', 'einseitiger Hebel', 'zweiseitiger Hebel', 'Gleichgewicht', 'Kraftmesser', 'Schubkarre', 'Nussknacker', 'Flaschenöffner', 'Wippe', 'Goldene Regel der Mechanik', 'Kraftwandler'],
                ['lever', 'law of the lever', 'torque', 'moment', 'effort arm', 'load arm', 'pivot', 'fulcrum', 'equilibrium', 'spring balance', 'wheelbarrow', 'nutcracker', 'bottle opener', 'seesaw', 'golden rule of mechanics'],
              ),
            },
            {
              id: 'newtonsche-gesetze',
              status: 'ready',
              slug: L('newtonsche-gesetze', 'newtons-laws'),
              title: L('Newton’sche Gesetze: Trägheit, F = m · a, Wechselwirkung', 'Newton’s laws: inertia, F = m · a, action and reaction'),
              summary: L(
                'Beim scharfen Bremsen rutscht die Kiste weiter, ein Zuggewicht beschleunigt einen Wagen, und zwei Wagen stoßen sich mit gleich großen Kräften ab. Drei Versuche, drei Gesetze.',
                'When the truck brakes hard the box keeps sliding, a hanging weight accelerates a cart, and two carts push each other apart with equal forces. Three experiments, three laws.',
              ),
              grades: [7, 12],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Newton', 'Newtonsche Gesetze', 'Newtonsche Axiome', 'Trägheit', 'Trägheitsgesetz', 'Beharrungsvermögen', 'Sicherheitsgurt', 'Grundgleichung der Mechanik', 'F = m · a', 'Kraft', 'Masse', 'Beschleunigung', 'Wechselwirkungsprinzip', 'actio gleich reactio', 'Gegenkraft', 'Reibung', 'Fahrbahnversuch', 'Rolle', 'Massepunkt', 'Idealisierung'],
                ['Newton', 'Newton’s laws', 'inertia', 'law of inertia', 'seat belt', 'second law', 'F = m · a', 'force', 'mass', 'acceleration', 'third law', 'action and reaction', 'reaction force', 'friction', 'air track', 'pulley', 'point mass', 'idealisation'],
              ),
            },
            {
              id: 'kraefteaddition',
              status: 'ready',
              slug: L('kraefte-addieren-und-zerlegen', 'adding-and-resolving-forces'),
              title: L('Kräfte addieren und zerlegen', 'Adding and resolving forces'),
              summary: L(
                'Zwei Kräfte ziehen an einem Punkt. Mit dem Kräfteparallelogramm findest du die Gesamtkraft oder zerlegst eine Kraft in zwei.',
                'Two forces pull on one point. Use the parallelogram of forces to find the total force or to split a force into two.',
              ),
              grades: [8, 11],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Superposition'],
              keywords: L(
                ['Kraft', 'Vektor', 'Kräfteaddition', 'Kräftezerlegung', 'Kräfteparallelogramm', 'Kräftepolygon', 'Krafteck', 'Resultierende', 'Komponenten', 'Gleichgewicht', 'Gegenkraft', 'Seilkraft', 'Federwaage', 'Wäscheleine', 'Lampe'],
                ['force', 'vector', 'adding forces', 'resolving forces', 'parallelogram of forces', 'polygon of forces', 'resultant', 'components', 'equilibrium', 'tension', 'spring balance', 'clothesline'],
              ),
            },
            {
              id: 'schiefe-ebene',
              status: 'ready',
              slug: L('schiefe-ebene', 'inclined-plane'),
              title: L('Schiefe Ebene', 'Inclined plane'),
              summary: L(
                'Ein Klotz liegt auf einer schrägen Ebene. Ab welchem Winkel rutscht er? Die Gewichtskraft wird dazu in zwei Teile zerlegt.',
                'A block sits on a slope. At what angle does it start to slide? The weight is split into two parts to find out.',
              ),
              grades: [8, 11],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Superposition'],
              keywords: L(
                ['schiefe Ebene', 'Hangabtriebskraft', 'Normalkraft', 'Gewichtskraft', 'Kräftezerlegung', 'Reibung', 'Haftreibung', 'Gleitreibung', 'Reibungszahl', 'Grenzwinkel', 'Kraftmesser', 'Kraftwandler', 'Goldene Regel der Mechanik'],
                ['inclined plane', 'downhill force', 'normal force', 'weight', 'resolving forces', 'friction', 'static friction', 'kinetic friction', 'coefficient of friction', 'limiting angle', 'spring balance', 'golden rule of mechanics'],
              ),
            },
          ],
        },
        {
          id: 'dichte-auftrieb',
          title: L('Dichte und Auftrieb', 'Density and buoyancy'),
          grades: [7, 10],
          simulations: [
            {
              id: 'dichte-auftrieb',
              status: 'ready',
              slug: L('dichte-schwimmen-auftrieb', 'density-floating-buoyancy'),
              title: L('Dichte, Schwimmen und Auftrieb', 'Density, floating and buoyancy'),
              summary: L(
                'Holz schwimmt, Eisen sinkt, ein Stahlschiff trägt Ladung: Lege Körper ins Wasser, miss ihre Dichte und lass einen Heißluftballon steigen.',
                'Wood floats, iron sinks, a steel ship carries cargo: put bodies into water, measure their density and let a hot-air balloon rise.',
              ),
              grades: [7, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Materie', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Dichte', 'Auftrieb', 'Auftriebskraft', 'Archimedes', 'archimedisches Prinzip', 'Schwimmen', 'Schweben', 'Sinken', 'Gewichtskraft', 'Überlaufgefäß', 'Messzylinder', 'Waage', 'Volumen', 'Masse', 'Eintauchtiefe', 'Schiff', 'U-Boot', 'Heißluftballon', 'Luftdichte', 'Eisberg', 'Salzwasser'],
                ['density', 'buoyancy', 'buoyant force', 'upthrust', 'Archimedes’ principle', 'floating', 'sinking', 'hovering', 'weight', 'overflow can', 'measuring cylinder', 'balance', 'volume', 'mass', 'ship', 'submarine', 'hot-air balloon', 'air density', 'iceberg', 'salt water'],
              ),
            },
            {
              id: 'druck',
              status: 'ready',
              slug: L('druck-hydraulik-luftdruck', 'pressure-hydraulics-air-pressure'),
              title: L('Druck: Kraft pro Fläche, Hydraulik, Wasser- und Luftdruck', 'Pressure: force per area, hydraulics, water and air pressure'),
              summary: L(
                'Mit Schneeschuhen sinkt man nicht ein, mit einer kleinen Kraft hebt man ein Auto, und beim Tauchen drückt das Wasser von allen Seiten. Am Ende erklärt der Druck sogar den Wind an der Küste.',
                'With snowshoes you don’t sink in, a small force lifts a car, and when diving the water presses from all sides. Finally, pressure even explains the wind at the coast.',
              ),
              grades: [7, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Druck', 'Auflagedruck', 'Pascal', 'Bar', 'Hektopascal', 'hydraulische Presse', 'Hydraulik', 'Kraftwandler', 'Schweredruck', 'Wasserdruck', 'Tauchen', 'Luftdruck', 'Barometer', 'barometrische Höhenformel', 'Hochdruckgebiet', 'Tiefdruckgebiet', 'Wind', 'Seewind', 'Landwind', 'Wetter'],
                ['pressure', 'contact pressure', 'pascal', 'bar', 'hectopascal', 'hydraulic press', 'hydraulics', 'force multiplier', 'hydrostatic pressure', 'water pressure', 'diving', 'air pressure', 'barometer', 'barometric formula', 'high-pressure area', 'low-pressure area', 'wind', 'sea breeze', 'land breeze', 'weather'],
              ),
            },
          ],
        },
        {
          id: 'energie-impuls',
          title: L('Energie und Impuls', 'Energy and momentum'),
          grades: [7, 11],
          simulations: [
            {
              id: 'energieerhaltung',
              status: 'ready',
              slug: L('energieerhaltung-achterbahn', 'energy-roller-coaster'),
              title: L('Energieerhaltung (Achterbahn)', 'Conservation of energy (roller coaster)'),
              summary: L(
                'Ein Wagen fährt Achterbahn: Energie-Säulen zeigen, wie sich Lageenergie und Bewegungsenergie ineinander umwandeln.',
                'A car rides a roller coaster: energy bars show how potential and kinetic energy turn into each other.',
              ),
              grades: [7, 11],
              kmk: ['P-BK-Energie', 'P-S', 'P-E'],
              keywords: L(
                ['Energieerhaltung', 'Lageenergie', 'Bewegungsenergie', 'Höhenenergie', 'kinetische Energie', 'Reibung', 'Reibungswärme', 'innere Energie', 'Achterbahn', 'Looping', 'Zentripetalkraft', 'Energieumwandlung', 'Energiediagramm', 'Umkehrpunkt'],
                ['conservation of energy', 'potential energy', 'kinetic energy', 'friction', 'heat', 'internal energy', 'roller coaster', 'loop', 'centripetal force', 'energy conversion', 'energy diagram', 'turning point'],
              ),
            },
            {
              id: 'stoesse',
              status: 'ready',
              slug: L('elastische-und-unelastische-stoesse', 'elastic-and-inelastic-collisions'),
              title: L('Elastische und unelastische Stöße', 'Elastic and inelastic collisions'),
              summary: L(
                'Zwei Gleiter stoßen auf einer Luftkissenbahn zusammen. Vorher und nachher wird verglichen, was erhalten bleibt.',
                'Two gliders collide on an air track. Before and after are compared to see what stays the same.',
              ),
              grades: [10, 11],
              kmk: ['P-BK-Erhaltung', 'P-BK-Energie', 'P-E', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Stoß', 'elastischer Stoß', 'unelastischer Stoß', 'teilelastischer Stoß', 'Impuls', 'Impulserhaltung', 'Impulserhaltungssatz', 'Energieerhaltung', 'Bewegungsenergie', 'innere Energie', 'Stoßzahl', 'Schwerpunkt', 'Schwerpunktsgeschwindigkeit', 'Luftkissenbahn', 'Gleiter', 'Klettband'],
                ['collision', 'elastic collision', 'inelastic collision', 'partially elastic collision', 'momentum', 'conservation of momentum', 'conservation of energy', 'kinetic energy', 'internal energy', 'coefficient of restitution', 'centre of mass', 'air track', 'glider', 'Velcro'],
              ),
            },
            {
              id: 'drehimpuls',
              status: 'ready',
              slug: L('drehimpuls-traegheitsmoment', 'angular-momentum-moment-of-inertia'),
              title: L('Drehimpuls und Trägheitsmoment', 'Angular momentum and moment of inertia'),
              summary: L(
                'Eine Eiskunstläuferin zieht die Arme an und dreht sich plötzlich viel schneller. Und beim Wettrollen gewinnt nicht der schwerste Körper, sondern der mit der Masse nah an der Achse.',
                'A figure skater pulls in her arms and suddenly spins much faster. And in a rolling race the winner is not the heaviest body but the one with its mass close to the axis.',
              ),
              grades: [10, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Erhaltung', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Drehimpuls', 'Drehimpulserhaltung', 'Trägheitsmoment', 'Winkelgeschwindigkeit', 'Drehzahl', 'Rotationsenergie', 'Pirouette', 'Eiskunstlauf', 'Rollen', 'schiefe Ebene', 'Vollkugel', 'Hohlzylinder', 'Drehbewegung', 'Kreisel'],
                ['angular momentum', 'conservation of angular momentum', 'moment of inertia', 'angular velocity', 'rotation rate', 'rotational energy', 'pirouette', 'figure skating', 'rolling', 'inclined plane', 'solid sphere', 'hoop', 'rotation', 'gyroscope'],
              ),
            },
          ],
        },
        {
          id: 'kreisbewegung-gravitation',
          title: L('Kreisbewegung und Gravitation', 'Circular motion and gravitation'),
          grades: [9, 13],
          simulations: [
            {
              id: 'kreisbewegung',
              status: 'ready',
              slug: L('kreisbewegung-zentripetalkraft', 'circular-motion-centripetal-force'),
              title: L('Kreisbewegung und Zentripetalkraft', 'Circular motion and centripetal force'),
              summary: L(
                'Eine Kugel kreist an einer Schnur, ein Auto fährt durch eine Kurve. Welche Kraft hält sie auf der Kreisbahn?',
                'A ball swings round on a string, a car drives through a bend. Which force keeps them on a circular path?',
              ),
              grades: [9, 11],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Kreisbewegung', 'gleichförmige Kreisbewegung', 'Zentripetalkraft', 'Zentripetalbeschleunigung', 'Bahngeschwindigkeit', 'Winkelgeschwindigkeit', 'Umlaufdauer', 'Frequenz', 'Trägheit', 'Tangente', 'Kurvenfahrt', 'Haftreibung', 'Haftreibungszahl', 'Kurvenradius', 'Glatteis'],
                ['circular motion', 'uniform circular motion', 'centripetal force', 'centripetal acceleration', 'speed', 'angular velocity', 'period', 'frequency', 'inertia', 'tangent', 'cornering', 'static friction', 'coefficient of friction', 'radius of a bend', 'black ice'],
              ),
            },
            {
              id: 'planetenbahnen',
              status: 'ready',
              slug: L('planetenbahnen-keplersche-gesetze', 'planetary-orbits-keplers-laws'),
              title: L('Planetenbahnen und Keplersche Gesetze', 'Planetary orbits and Kepler’s laws'),
              summary: L(
                'Zu schnell, und der Planet fliegt auf Nimmerwiedersehen davon. Etwas langsamer, und er zieht eine Ellipse um die Sonne, genau nach den Keplerschen Gesetzen.',
                'Too fast and the planet flies off, never to return. A little slower and it traces an ellipse around the Sun, exactly as Kepler\'s laws say.',
              ),
              grades: [10, 13],
              uni: true,
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Erhaltung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Keplersche Gesetze', 'Planetenbahn', 'Ellipse', 'Brennpunkt', 'große Halbachse', 'Exzentrizität', 'Perihel', 'Aphel', 'Flächensatz', 'Umlaufdauer', 'Gravitation', 'Gravitationsgesetz', 'Kreisbahngeschwindigkeit', 'Fluchtgeschwindigkeit', 'Hyperbel', 'Drehimpulserhaltung', 'Komet', 'Sonnensystem'],
                ['Kepler’s laws', 'planetary orbit', 'ellipse', 'focus', 'semi-major axis', 'eccentricity', 'perihelion', 'aphelion', 'law of areas', 'orbital period', 'gravitation', 'law of gravitation', 'circular speed', 'escape velocity', 'hyperbola', 'conservation of angular momentum', 'comet', 'solar system'],
              ),
            },
          ],
        },
        {
          id: 'wuerfe',
          title: L('Würfe', 'Projectile motion'),
          grades: [10, 11],
          simulations: [
            {
              id: 'schiefer-wurf',
              status: 'ready',
              slug: L('schiefer-wurf', 'projectile-motion'),
              title: L('Waagerechter und schiefer Wurf', 'Horizontal and oblique projectile motion'),
              summary: L(
                'Welcher Abwurfwinkel trägt am weitesten? Auf der Erde ist es 45°, und auf dem Mond fliegt derselbe Ball sechsmal so weit.',
                'Which launch angle goes furthest? On Earth it is 45°, and on the Moon the same ball flies six times as far.',
              ),
              grades: [10, 11],
              kmk: ['P-E', 'P-BK-Superposition', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Wurf', 'schiefer Wurf', 'waagerechter Wurf', 'Wurfparabel', 'Wurfweite', 'Steighöhe', 'Superposition', 'Luftwiderstand', 'Fallbeschleunigung', 'Abwurfwinkel', 'Zielwurf', 'Komplementärwinkel'],
                ['projectile', 'oblique throw', 'horizontal throw', 'trajectory', 'range', 'maximum height', 'superposition', 'air resistance', 'gravitational acceleration', 'launch angle', 'target', 'complementary angles'],
              ),
            },
          ],
        },
      ],
    },
    {
      id: 'schwingungen-wellen',
      slug: L('schwingungen-und-wellen', 'oscillations-and-waves'),
      title: L('Schwingungen und Wellen', 'Oscillations and waves'),
      description: L(
        'Pendel, Resonanz, Wellenausbreitung und Interferenz – mit Zeitlupe und Diagrammen in Echtzeit.',
        'Pendulums, resonance, wave propagation and interference – with slow motion and real-time graphs.',
      ),
      grades: [5, 13],
      kmk: ['P-S', 'P-E', 'P-BK-Superposition', 'P-BK-Mathematisieren'],
      topics: [
        {
          id: 'akustik',
          title: L('Akustik', 'Acoustics'),
          grades: [5, 11],
          simulations: [
            {
              id: 'schall',
              status: 'ready',
              slug: L('schall-tonhoehe-lautstaerke', 'sound-pitch-loudness'),
              title: L('Schall: Tonhöhe und Lautstärke', 'Sound: pitch and loudness'),
              summary: L(
                'Höher heißt schneller schwingen, lauter heißt weiter schwingen. Auf dem Oszilloskop sieht man den Unterschied, und hören kann man ihn auch.',
                'Higher means vibrating faster, louder means vibrating further. You can see the difference on the oscilloscope, and hear it too.',
              ),
              grades: [5, 11],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Schall', 'Akustik', 'Tonhöhe', 'Lautstärke', 'Frequenz', 'Hertz', 'Amplitude', 'Periodendauer', 'Oszilloskop', 'Klangfarbe', 'Obertöne', 'Schallgeschwindigkeit', 'Wellenlänge', 'Längswelle', 'Schallausbreitung', 'Vakuum', 'Dezibel', 'Schallpegel', 'Lärm', 'Gehör', 'Hörbereich', 'Ultraschall', 'Infraschall', 'Echo', 'Schwebung', 'Saite', 'Pfeife', 'Sender', 'Empfänger', 'Lautsprecher'],
                ['sound', 'acoustics', 'pitch', 'loudness', 'frequency', 'hertz', 'amplitude', 'period', 'oscilloscope', 'timbre', 'overtones', 'speed of sound', 'wavelength', 'longitudinal wave', 'propagation of sound', 'vacuum', 'decibel', 'sound level', 'noise', 'hearing', 'range of hearing', 'ultrasound', 'infrasound', 'echo', 'beats', 'string', 'pipe', 'transmitter', 'receiver', 'loudspeaker'],
              ),
            },
          ],
        },
        {
          id: 'schwingungen',
          title: L('Mechanische Schwingungen', 'Mechanical oscillations'),
          grades: [10, 12],
          simulations: [
            {
              id: 'fadenpendel',
              status: 'ready',
              slug: L('fadenpendel', 'simple-pendulum'),
              title: L('Fadenpendel', 'Simple pendulum'),
              summary: L(
                'Lenke ein Pendel aus, lass es los und miss, wie lange eine Schwingung dauert. Wovon hängt das ab? Auch mit großen Winkeln und Dämpfung.',
                'Pull a pendulum aside, let it go and measure how long one swing takes. What does it depend on? Also with large angles and damping.',
              ),
              grades: [10, 12],
              kmk: ['P-E', 'P-BK-Mathematisieren', 'P-BK-Energie'],
              keywords: L(
                ['Pendel', 'Fadenpendel', 'Schwingung', 'Periodendauer', 'Frequenz', 'Amplitude', 'Kleinwinkelnäherung', 'harmonische Schwingung', 'Dämpfung', 'Sekundenpendel', 'Ortsfaktor', 'Fadenkraft', 'Rückstellkraft', 'Phasendiagramm', 'Messreihe'],
                ['pendulum', 'oscillation', 'period', 'frequency', 'amplitude', 'small-angle approximation', 'harmonic motion', 'damping', 'seconds pendulum', 'gravitational acceleration', 'tension', 'restoring force', 'phase diagram', 'measurement series'],
              ),
            },
            {
              id: 'federpendel',
              status: 'ready',
              slug: L('federpendel', 'spring-pendulum'),
              title: L('Federpendel', 'Spring pendulum'),
              summary: L(
                'Ein Körper schwingt an einer Feder auf und ab. Diagramme zeigen Ort, Geschwindigkeit und Energie während der Schwingung.',
                'A mass bounces up and down on a spring. Graphs show position, speed and energy during the oscillation.',
              ),
              grades: [10, 12],
              kmk: ['P-S', 'P-E', 'P-BK-Mathematisieren', 'P-BK-Energie', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Federpendel', 'Schwingung', 'harmonische Schwingung', 'Periodendauer', 'Frequenz', 'Kreisfrequenz', 'Amplitude', 'Elongation', 'Phase', 'Nullphasenwinkel', 'Zeigerdiagramm', 'Federhärte', 'Rückstellkraft', 'lineares Kraftgesetz', 'Spannenergie', 'Dämpfung', 'Stoppuhr'],
                ['spring pendulum', 'mass on a spring', 'oscillation', 'harmonic motion', 'period', 'frequency', 'angular frequency', 'amplitude', 'displacement', 'phase', 'initial phase', 'phasor diagram', 'spring constant', 'restoring force', 'elastic energy', 'damping', 'stopwatch'],
              ),
            },
            {
              id: 'resonanz',
              status: 'ready',
              slug: L('erzwungene-schwingung-resonanz', 'driven-oscillation-resonance'),
              title: L('Erzwungene Schwingung und Resonanz', 'Driven oscillation and resonance'),
              summary: L(
                'Ein Motor treibt ein schwingendes Rad an. Trifft der Motor genau den richtigen Takt, schwingt das Rad besonders stark: Resonanz.',
                'A motor drives an oscillating wheel. If the motor hits exactly the right rhythm, the wheel swings especially strongly: resonance.',
              ),
              grades: [10, 13],
              uni: true,
              kmk: ['P-S', 'P-E', 'P-BK-Mathematisieren', 'P-BK-Energie', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Resonanz', 'erzwungene Schwingung', 'Pohlsches Rad', 'Drehpendel', 'Erreger', 'Erregerfrequenz', 'Eigenfrequenz', 'Resonanzfrequenz', 'Resonanzkurve', 'Phasenverschiebung', 'Einschwingvorgang', 'Dämpfung', 'Wirbelstrombremse', 'Resonanzkatastrophe', 'Zeigerdiagramm'],
                ['resonance', 'driven oscillation', 'forced oscillation', 'Pohl’s wheel', 'torsion pendulum', 'driver', 'driving frequency', 'natural frequency', 'resonance frequency', 'resonance curve', 'phase shift', 'transient', 'damping', 'eddy-current brake', 'resonance disaster', 'phasor diagram'],
              ),
            },
          ],
        },
        {
          id: 'wellen',
          title: L('Wellen', 'Waves'),
          grades: [10, 13],
          simulations: [
            {
              id: 'wellen-ausbreitung',
              status: 'ready',
              slug: L('transversal-longitudinalwellen', 'transverse-longitudinal-waves'),
              title: L('Transversal- und Longitudinalwellen', 'Transverse and longitudinal waves'),
              summary: L(
                'Eine Welle läuft durch eine Kette von Teilchen. Jedes Teilchen schwingt nur auf der Stelle, quer oder längs zur Laufrichtung.',
                'A wave travels through a chain of particles. Each particle only oscillates in place, across or along the direction of travel.',
              ),
              grades: [10, 12],
              kmk: ['P-S', 'P-E', 'P-BK-Mathematisieren', 'P-BK-Materie', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Welle', 'mechanische Welle', 'Transversalwelle', 'Longitudinalwelle', 'Querwelle', 'Längswelle', 'Wellenlänge', 'Frequenz', 'Ausbreitungsgeschwindigkeit', 'c = λ·f', 'Wellenfront', 'Verdichtung', 'Verdünnung', 'Wellenberg', 'Wellental', 'Phase', 'gleichphasig', 'Zeigerdiagramm', 'gekoppelte Oszillatoren', 'Momentaufnahme', 'Schall'],
                ['wave', 'mechanical wave', 'transverse wave', 'longitudinal wave', 'wavelength', 'frequency', 'wave speed', 'c = λf', 'wave front', 'compression', 'rarefaction', 'crest', 'trough', 'phase', 'in phase', 'phasor', 'coupled oscillators', 'snapshot', 'sound'],
              ),
            },
            {
              id: 'doppler-effekt',
              status: 'ready',
              slug: L('doppler-effekt', 'doppler-effect'),
              title: L('Doppler-Effekt', 'Doppler effect'),
              summary: L(
                'Ein Krankenwagen fährt vorbei, und der Ton wird tiefer. Die Wellenfronten zeigen warum. Auf Wunsch zum Anhören.',
                'An ambulance drives past and the siren sounds lower. The wave fronts show why. You can also listen to it.',
              ),
              grades: [10, 12],
              kmk: ['P-S', 'P-E', 'P-BK-Mathematisieren', 'P-BK-Wechselwirkung', 'P-BK-Superposition'],
              keywords: L(
                ['Doppler-Effekt', 'Dopplereffekt', 'Schall', 'Frequenz', 'Tonhöhe', 'Wellenlänge', 'Wellenfront', 'Martinshorn', 'Krankenwagen', 'bewegte Quelle', 'bewegter Beobachter', 'Schallgeschwindigkeit', 'Radialgeschwindigkeit', 'Schallmauer', 'Überschall', 'Machscher Kegel', 'Machzahl', 'Überschallknall'],
                ['Doppler effect', 'sound', 'frequency', 'pitch', 'wavelength', 'wave front', 'siren', 'ambulance', 'moving source', 'moving observer', 'speed of sound', 'radial velocity', 'sound barrier', 'supersonic', 'Mach cone', 'Mach number', 'sonic boom'],
              ),
            },
            {
              id: 'interferenz',
              status: 'ready',
              slug: L('interferenz-kreiswellen', 'interference-circular-waves'),
              title: L('Interferenz zweier Kreiswellen', 'Interference of two circular waves'),
              summary: L(
                'Zwei Kreiswellen überlagern sich und verstärken sich an manchen Stellen, an anderen löschen sie sich aus.',
                'Two circular waves overlap: in some places they reinforce each other, in others they cancel out.',
              ),
              grades: [10, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Superposition', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Interferenz', 'Überlagerung', 'Superposition', 'Kreiswelle', 'Wellenwanne', 'Gangunterschied', 'Phasenunterschied', 'Knotenlinie', 'Bauchlinie', 'Hyperbel', 'Maximum', 'Minimum', 'konstruktive Interferenz', 'destruktive Interferenz', 'Auslöschung', 'Verstärkung', 'Zeigerdiagramm', 'kohärent', 'gegenphasig', 'Doppelspalt', 'Fernfeld'],
                ['interference', 'superposition', 'circular wave', 'ripple tank', 'path difference', 'phase difference', 'nodal line', 'antinodal line', 'hyperbola', 'maximum', 'minimum', 'constructive interference', 'destructive interference', 'phasor', 'coherent', 'antiphase', 'double slit', 'far field'],
              ),
            },
            {
              id: 'stehende-wellen',
              status: 'ready',
              slug: L('stehende-wellen', 'standing-waves'),
              title: L('Stehende Wellen', 'Standing waves'),
              summary: L(
                'Eine Welle wird am Ende zurückgeworfen, und es entsteht ein festes Muster aus Knoten und Bäuchen, wie auf einer Gitarrensaite.',
                'A wave is reflected at the end and a fixed pattern of nodes and antinodes appears, like on a guitar string.',
              ),
              grades: [11, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Superposition', 'P-BK-Mathematisieren', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['stehende Welle', 'Reflexion', 'festes Ende', 'loses Ende', 'Phasensprung', 'Knoten', 'Bauch', 'Schwingungsknoten', 'Schwingungsbauch', 'Überlagerung', 'Superposition', 'Eigenschwingung', 'Eigenfrequenz', 'Grundschwingung', 'Oberschwingung', 'Harmonische', 'Saite', 'Gitarre', 'Luftsäule', 'Pfeife', 'gedackte Pfeife', 'offene Pfeife', 'Orgelpfeife', 'Druckknoten', 'Schnelleknoten', 'Resonanz', 'Melde-Versuch', 'Hüllkurve'],
                ['standing wave', 'stationary wave', 'reflection', 'fixed end', 'free end', 'phase jump', 'node', 'antinode', 'superposition', 'normal mode', 'natural frequency', 'fundamental', 'overtone', 'harmonic', 'string', 'guitar', 'air column', 'pipe', 'stopped pipe', 'open pipe', 'organ pipe', 'pressure node', 'displacement node', 'resonance', 'Melde’s experiment', 'envelope'],
              ),
            },
          ],
        },
        {
          id: 'em-schwingungen',
          title: L('Elektromagnetische Schwingungen und Wellen', 'Electromagnetic oscillations and waves'),
          grades: [10, 13],
          simulations: [
            {
              id: 'em-spektrum',
              status: 'ready',
              slug: L('elektromagnetisches-spektrum', 'electromagnetic-spectrum'),
              title: L('Elektromagnetisches Spektrum, Dipol und Modulation', 'Electromagnetic spectrum, dipole and modulation'),
              summary: L(
                'Radio, WLAN, Wärme, Licht, Röntgen: alles dieselbe Art Welle, nur mit anderer Wellenlänge. Ein Stab als Sender strahlt sie ab, und Musik reist huckepack auf der Radiowelle.',
                'Radio, Wi-Fi, heat, light, X-rays: all the same kind of wave, just with a different wavelength. A rod antenna sends them out, and music rides piggyback on the radio wave.',
              ),
              grades: [10, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['elektromagnetisches Spektrum', 'elektromagnetische Welle', 'Wellenlänge', 'Frequenz', 'Lichtgeschwindigkeit', 'Radiowellen', 'Mikrowellen', 'Infrarot', 'Wärmestrahlung', 'sichtbares Licht', 'Ultraviolett', 'UV', 'Röntgenstrahlung', 'Gammastrahlung', 'Photonenenergie', 'ionisierende Strahlung', 'Hertzscher Dipol', 'Antenne', 'offener Schwingkreis', 'Modulation', 'Amplitudenmodulation', 'Frequenzmodulation', 'AM', 'FM', 'Trägerwelle'],
                ['electromagnetic spectrum', 'electromagnetic wave', 'wavelength', 'frequency', 'speed of light', 'radio waves', 'microwaves', 'infrared', 'thermal radiation', 'visible light', 'ultraviolet', 'UV', 'X-rays', 'gamma rays', 'photon energy', 'ionising radiation', 'Hertzian dipole', 'antenna', 'open oscillating circuit', 'modulation', 'amplitude modulation', 'frequency modulation', 'AM', 'FM', 'carrier wave'],
              ),
            },
            {
              id: 'schwingkreis',
              status: 'ready',
              slug: L('elektromagnetischer-schwingkreis', 'lc-circuit'),
              title: L('Elektromagnetischer Schwingkreis und Selbstinduktion', 'LC circuit and self-induction'),
              summary: L(
                'Die Energie pendelt zwischen Kondensator und Spule hin und her, genau wie bei einem Federpendel. Beim Ein- und Ausschalten zeigt die Spule, dass sie Strom nicht sofort ändern lässt.',
                'The energy swings back and forth between capacitor and coil, just like a spring pendulum. When switching on and off, the coil shows that it does not let the current change instantly.',
              ),
              grades: [11, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Energie', 'P-BK-Erhaltung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Schwingkreis', 'Thomson-Gleichung', 'Thomsonsche Schwingungsgleichung', 'Kondensator', 'Spule', 'Induktivität', 'Kapazität', 'elektromagnetische Schwingung', 'gedämpfte Schwingung', 'aperiodischer Grenzfall', 'Kriechfall', 'Selbstinduktion', 'Einschaltvorgang', 'Ausschaltvorgang', 'Energie des Magnetfelds', 'Federpendel', 'Analogie'],
                ['LC circuit', 'Thomson formula', 'capacitor', 'coil', 'inductance', 'capacitance', 'electromagnetic oscillation', 'damped oscillation', 'critical damping', 'overdamping', 'self-induction', 'switching on', 'switching off', 'magnetic field energy', 'spring pendulum', 'analogy'],
              ),
            },
          ],
        },
      ],
    },
    {
      id: 'elektrizitaet',
      slug: L('elektrizitaetslehre', 'electricity-and-magnetism'),
      title: L('Elektrizitätslehre', 'Electricity and magnetism'),
      description: L(
        'Stromkreise bauen, Spannungen messen, Felder sichtbar machen und Induktion verstehen.',
        'Build circuits, measure voltages, visualise fields and understand induction.',
      ),
      grades: [5, 13],
      kmk: ['P-S', 'P-E', 'P-BK-System', 'P-BK-Wechselwirkung'],
      topics: [
        {
          id: 'magnetismus',
          title: L('Magnetismus', 'Magnetism'),
          grades: [5, 7],
          simulations: [
            {
              id: 'magnete',
              status: 'ready',
              slug: L('magnete-kompass', 'magnets-compass'),
              title: L('Magnete und Kompass', 'Magnets and compass'),
              summary: L(
                'Nordpol trifft Südpol: Die Magnete schnappen zusammen. Eisenfeilspäne und Kompassnadeln zeigen das unsichtbare Feld, und die ganze Erde ist ein riesiger Magnet.',
                'North pole meets south pole: the magnets snap together. Iron filings and compass needles show the invisible field, and the whole Earth is a giant magnet.',
              ),
              grades: [5, 7],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-System'],
              keywords: L(
                ['Magnet', 'Dauermagnet', 'Permanentmagnet', 'Stabmagnet', 'Hufeisenmagnet', 'Nordpol', 'Südpol', 'Anziehung', 'Abstoßung', 'Magnetfeld', 'Feldlinien', 'Kompass', 'Kompassnadel', 'Eisenfeilspäne', 'Elementarmagnete', 'Magnetisierung', 'Entmagnetisieren', 'Curie-Temperatur', 'Erdmagnetfeld', 'Inklination', 'Eisen', 'Nickel', 'Kobalt', 'ferromagnetisch'],
                ['magnet', 'permanent magnet', 'bar magnet', 'horseshoe magnet', 'north pole', 'south pole', 'attraction', 'repulsion', 'magnetic field', 'field lines', 'compass', 'compass needle', 'iron filings', 'elementary magnets', 'magnetisation', 'demagnetise', 'Curie temperature', 'Earth’s magnetic field', 'inclination', 'iron', 'nickel', 'cobalt', 'ferromagnetic'],
              ),
            },
          ],
        },
        {
          id: 'stromkreise',
          title: L('Stromkreise', 'Circuits'),
          grades: [6, 9],
          simulations: [
            {
              id: 'einfacher-stromkreis',
              status: 'ready',
              slug: L('einfacher-stromkreis', 'simple-circuit'),
              title: L('Einfacher Stromkreis', 'Simple circuit'),
              summary: L(
                'Baue einen Stromkreis aus Batterie, Schalter und Lampe, als Aufbau und als Schaltplan. Ist der Kreis geschlossen, leuchtet die Lampe.',
                'Build a circuit with a battery, a switch and a lamp, as a set-up and as a circuit diagram. When the circuit is closed, the lamp lights up.',
              ),
              grades: [6, 9],
              kmk: ['P-S', 'P-E', 'P-K', 'P-BK-System'],
              keywords: L(
                ['Stromkreis', 'geschlossener Stromkreis', 'offener Stromkreis', 'Schalter', 'Glühlampe', 'Batterie', 'Elektronen', 'technische Stromrichtung', 'Schaltplan', 'Schaltzeichen', 'Kurzschluss', 'Sicherung', 'Leiter', 'Nichtleiter', 'Isolator'],
                ['electric circuit', 'closed circuit', 'open circuit', 'switch', 'light bulb', 'battery', 'electrons', 'conventional current', 'circuit diagram', 'circuit symbols', 'short circuit', 'fuse', 'conductor', 'insulator'],
              ),
            },
            {
              id: 'ladungen-coulomb',
              status: 'ready',
              slug: L('elektrische-ladung-coulomb', 'electric-charge-coulomb'),
              title: L('Elektrische Ladung und Coulomb’sches Gesetz', 'Electric charge and Coulomb’s law'),
              summary: L(
                'Reibt man einen Kunststoffstab an Wolle, wandern Elektronen – Stab und Tuch ziehen sich danach an. Ein Elektroskop zeigt die Ladung, und das Coulomb’sche Gesetz sagt, wie stark die Kraft ist.',
                'Rub a plastic rod with wool and electrons move – afterwards rod and cloth attract. An electroscope shows the charge, and Coulomb’s law tells how strong the force is.',
              ),
              grades: [6, 12],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['elektrische Ladung', 'Elektrostatik', 'Reibungselektrizität', 'Elektron', 'positiv', 'negativ', 'Anziehung', 'Abstoßung', 'Elektroskop', 'Ladungstrennung', 'Coulomb', 'Coulombsches Gesetz', 'Coulombkraft', 'Elementarladung', 'Erdung'],
                ['electric charge', 'electrostatics', 'charging by friction', 'electron', 'positive', 'negative', 'attraction', 'repulsion', 'electroscope', 'charge separation', 'coulomb', 'Coulomb’s law', 'Coulomb force', 'elementary charge', 'earthing'],
              ),
            },
            {
              id: 'reihe-parallel',
              status: 'ready',
              slug: L('reihen-und-parallelschaltung', 'series-and-parallel-circuits'),
              title: L('Reihen- und Parallelschaltung', 'Series and parallel circuits'),
              summary: L(
                'Schalte Lampen hintereinander oder nebeneinander und miss Strom und Spannung an verschiedenen Stellen.',
                'Connect lamps in series or in parallel and measure current and voltage at different points.',
              ),
              grades: [7, 9],
              kmk: ['P-BK-System', 'P-E', 'P-S'],
              keywords: L(
                ['Reihenschaltung', 'Parallelschaltung', 'gemischte Schaltung', 'Ersatzwiderstand', 'Gesamtwiderstand', 'Knotenregel', 'Maschenregel', 'Spannungsteiler', 'Stromstärke', 'Spannung', 'Glühlampe', 'Kirchhoff', 'Verzweigung'],
                ['series circuit', 'parallel circuit', 'mixed circuit', 'equivalent resistance', 'total resistance', 'junction rule', 'loop rule', 'voltage divider', 'current', 'voltage', 'light bulb', 'Kirchhoff'],
              ),
            },
            {
              id: 'ohmsches-gesetz',
              status: 'ready',
              slug: L('ohmsches-gesetz', 'ohms-law'),
              title: L('Ohmsches Gesetz', 'Ohm’s law'),
              summary: L(
                'Spannung hoch, Strom hoch, immer im selben Verhältnis. Messpunkt für Messpunkt entsteht die Kennlinie, beim Lämpchen aber nicht ganz gerade.',
                'Turn up the voltage and the current rises, always in the same ratio. Point by point the characteristic curve appears, though not quite straight for a lamp.',
              ),
              grades: [7, 9],
              kmk: ['P-E', 'P-K', 'P-S', 'P-BK-System'],
              keywords: L(
                ['Ohmsches Gesetz', 'Widerstand', 'Kennlinie', 'I-U-Diagramm', 'U-I-Diagramm', 'Stromstärke', 'Spannung', 'Amperemeter', 'Voltmeter', 'Glühlampe', 'Konstantan', 'spezifischer Widerstand', 'Ursprungsgerade', 'Proportionalität'],
                ['Ohm’s law', 'resistance', 'characteristic', 'current–voltage graph', 'current', 'voltage', 'ammeter', 'voltmeter', 'light bulb', 'constantan', 'resistivity', 'proportionality'],
              ),
            },
          ],
        },
        {
          id: 'energieversorgung',
          title: L('Energieversorgung', 'Energy supply'),
          grades: [7, 13],
          simulations: [
            {
              id: 'energieversorgung',
              status: 'ready',
              slug: L('energieversorgung-kraftwerke-strommix', 'energy-supply-power-plants-electricity-mix'),
              title: L('Energieversorgung: Kraftwerke, Strommix und Netz', 'Energy supply: power plants, electricity mix and grid'),
              summary: L(
                'Vom Kraftwerk bis zur Steckdose: Wirkungsgrade im Energieflussdiagramm, Strommix über einen ganzen Tag mit Sonne, Wind und Speichern sowie Hochspannung gegen Leitungsverluste.',
                'From the power plant to the socket: efficiencies in an energy flow diagram, the electricity mix over a whole day with sun, wind and storage, and high voltage against line losses.',
              ),
              grades: [7, 13],
              kmk: ['P-BK-Energie', 'P-BK-System', 'P-B', 'P-S'],
              keywords: L(
                ['Energieversorgung', 'Kraftwerk', 'Wirkungsgrad', 'Energieflussdiagramm', 'Sankey-Diagramm', 'Energieentwertung', 'regenerative Energien', 'erneuerbare Energien', 'erschöpfbare Energieträger', 'Windkraft', 'Photovoltaik', 'Wasserkraft', 'Biomasse', 'Kernkraftwerk', 'Kohlekraftwerk', 'Gaskraftwerk', 'Kraft-Wärme-Kopplung', 'Strommix', 'Lastgang', 'Dunkelflaute', 'Pumpspeicherkraftwerk', 'Batteriespeicher', 'Hochspannung', 'Leitungsverluste', 'Transformator', 'CO₂', 'Energiewende'],
                ['energy supply', 'power plant', 'efficiency', 'energy flow diagram', 'Sankey diagram', 'energy dissipation', 'renewable energy', 'finite energy sources', 'wind power', 'photovoltaics', 'hydropower', 'biomass', 'nuclear power plant', 'coal power plant', 'gas power plant', 'combined heat and power', 'electricity mix', 'load curve', 'dark doldrums', 'pumped-storage plant', 'battery storage', 'high voltage', 'line losses', 'transformer', 'CO₂', 'energy transition'],
              ),
            },
          ],
        },
        {
          id: 'felder',
          title: L('Elektrische und magnetische Felder', 'Electric and magnetic fields'),
          grades: [8, 13],
          simulations: [
            {
              id: 'magnetfeld-spule',
              status: 'ready',
              slug: L('magnetfeld-leiter-spule', 'magnetic-field-wire-coil'),
              title: L('Magnetfeld von Leiter und Spule', 'Magnetic field of a wire and a coil'),
              summary: L(
                'Fließt Strom durch einen Draht, dreht sich die Kompassnadel daneben weg. Wickelt man den Draht zur Spule, entsteht ein Elektromagnet, der Relais schaltet und Motoren antreibt.',
                'When current flows through a wire, the compass needle next to it turns away. Wind the wire into a coil and you get an electromagnet that switches relays and drives motors.',
              ),
              grades: [8, 12],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Magnetfeld', 'Elektromagnetismus', 'Ørsted', 'Oersted', 'Kompass', 'Rechte-Faust-Regel', 'Feldlinien', 'magnetische Flussdichte', 'Tesla', 'Hallsonde', 'gerader Leiter', 'Leiterschleife', 'Spule', 'Windungszahl', 'Eisenkern', 'Permeabilität', 'Elektromagnet', 'Relais', 'Elektromotor', 'Stromwender', 'Kommutator', 'Drehmoment', 'magnetische Feldkonstante'],
                ['magnetic field', 'electromagnetism', 'Ørsted', 'Oersted', 'compass', 'right-hand grip rule', 'field lines', 'magnetic flux density', 'tesla', 'Hall probe', 'straight wire', 'current loop', 'coil', 'solenoid', 'number of turns', 'iron core', 'permeability', 'electromagnet', 'relay', 'electric motor', 'commutator', 'torque', 'magnetic constant'],
              ),
            },
            {
              id: 'induktion',
              status: 'ready',
              slug: L('elektromagnetische-induktion', 'electromagnetic-induction'),
              title: L('Elektromagnetische Induktion', 'Electromagnetic induction'),
              summary: L(
                'Magnet rein, Zeiger schlägt aus. Magnet raus, Zeiger schlägt andersherum aus. Nach demselben Prinzip arbeitet jeder Generator.',
                'Magnet in, the needle swings. Magnet out, it swings the other way. Every generator works on the same principle.',
              ),
              grades: [9, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Induktion', 'Induktionsgesetz', 'Induktionsspannung', 'magnetischer Fluss', 'Lenzsche Regel', 'Spule', 'Stabmagnet', 'Leiterschleife', 'Generator', 'Wechselspannung', 'Scheitelwert', 'Effektivwert', 'Windungszahl', 'Flussdichte', 'Lorentzkraft'],
                ['induction', 'law of induction', 'induced voltage', 'magnetic flux', 'Lenz’s law', 'coil', 'bar magnet', 'conducting loop', 'generator', 'alternating voltage', 'peak value', 'rms value', 'number of turns', 'flux density', 'Lorentz force'],
              ),
            },
            {
              id: 'lorentzkraft',
              status: 'ready',
              slug: L('lorentzkraft-fadenstrahlrohr', 'lorentz-force-fine-beam-tube'),
              title: L('Lorentzkraft und Fadenstrahlrohr', 'Lorentz force and fine-beam tube'),
              summary: L(
                'Elektronen fliegen in einem Magnetfeld auf einer leuchtenden Kreisbahn. Aus dem Radius bestimmst du eine Eigenschaft des Elektrons.',
                'Electrons fly along a glowing circular path in a magnetic field. From the radius you determine a property of the electron.',
              ),
              grades: [10, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Lorentzkraft', 'Fadenstrahlrohr', 'Helmholtzspulen', 'spezifische Ladung', 'e/m', 'Elektron', 'Kreisbahn', 'Zentripetalkraft', 'Magnetfeld', 'Flussdichte', 'Beschleunigungsspannung', 'Linke-Hand-Regel', 'Drei-Finger-Regel'],
                ['Lorentz force', 'fine-beam tube', 'Helmholtz coils', 'specific charge', 'e/m', 'electron', 'circular path', 'centripetal force', 'magnetic field', 'flux density', 'accelerating voltage', 'left-hand rule', 'three-finger rule'],
              ),
            },
            {
              id: 'teilchen-felder',
              status: 'ready',
              slug: L('geladene-teilchen-in-feldern', 'charged-particles-in-fields'),
              title: L('Geladene Teilchen in Feldern: Ablenkung, Millikan, Zyklotron, Hall-Effekt', 'Charged particles in fields: deflection, Millikan, cyclotron, Hall effect'),
              summary: L(
                'Elektronen werden beschleunigt und zwischen Platten abgelenkt, ein Öltröpfchen schwebt im Kondensator, Protonen kreisen im Zyklotron, und im Hall-Plättchen drückt das Magnetfeld die Ladungen zur Seite.',
                'Electrons are accelerated and deflected between plates, an oil droplet hovers in a capacitor, protons circle in a cyclotron, and in a Hall plate the magnetic field pushes the charges sideways.',
              ),
              grades: [10, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['geladene Teilchen', 'Elektronenkanone', 'Beschleunigungsspannung', 'Längsfeld', 'Querfeld', 'Ablenkung', 'Braunsche Röhre', 'Parabelbahn', 'Millikan', 'Öltröpfchen', 'Elementarladung', 'Zyklotron', 'Teilchenbeschleuniger', 'Hall-Effekt', 'Hall-Sonde', 'Hall-Spannung', 'Lorentzkraft'],
                ['charged particles', 'electron gun', 'accelerating voltage', 'longitudinal field', 'transverse field', 'deflection', 'cathode-ray tube', 'parabolic path', 'Millikan', 'oil drop', 'elementary charge', 'cyclotron', 'particle accelerator', 'Hall effect', 'Hall probe', 'Hall voltage', 'Lorentz force'],
              ),
            },
            {
              id: 'feldlinien',
              status: 'ready',
              slug: L('feldlinien-punktladungen', 'field-lines-point-charges'),
              title: L('Feldlinien von Punktladungen', 'Field lines of point charges'),
              summary: L(
                'Zwei Ladungen, und das Feld ordnet sich neu. Eine Probeladung misst, wo die Kraft am größten ist.',
                'Two charges and the field rearranges itself. A test charge measures where the force is strongest.',
              ),
              grades: [11, 12],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['elektrisches Feld', 'Feldlinien', 'Feldstärke', 'Punktladung', 'Coulombsches Gesetz', 'Dipol', 'Äquipotentiallinien', 'Potential', 'Probeladung', 'Plattenkondensator', 'homogenes Feld', 'Superposition'],
                ['electric field', 'field lines', 'field strength', 'point charge', 'Coulomb’s law', 'dipole', 'equipotential lines', 'potential', 'test charge', 'parallel-plate capacitor', 'uniform field', 'superposition'],
              ),
            },
            {
              id: 'kondensator',
              status: 'ready',
              slug: L('kondensator-laden-entladen', 'capacitor-charging-discharging'),
              title: L('Lade- und Entladekurve des Kondensators', 'Charging and discharging a capacitor'),
              summary: L(
                'Ein Kondensator lädt sich über einen Widerstand auf und entlädt sich wieder. Die Diagramme zeigen, wie Spannung und Strom sich mit der Zeit ändern.',
                'A capacitor charges through a resistor and discharges again. The graphs show how voltage and current change over time.',
              ),
              grades: [11, 12],
              kmk: ['P-BK-Mathematisieren', 'P-S', 'P-E', 'P-BK-Energie'],
              keywords: L(
                ['Kondensator', 'Kapazität', 'Laden', 'Entladen', 'RC-Glied', 'Zeitkonstante', 'Halbwertszeit', 'Exponentialfunktion', 'Tangente', 'Ladestrom', 'Energie im Kondensator', 'Widerstand'],
                ['capacitor', 'capacitance', 'charging', 'discharging', 'RC circuit', 'time constant', 'half-life', 'exponential function', 'tangent', 'charging current', 'energy in a capacitor', 'resistor'],
              ),
            },
            {
              id: 'wechselstrom',
              status: 'ready',
              slug: L('wechselstromkreise-zeigerdiagramm', 'ac-circuits-phasors'),
              title: L('Wechselstromkreise und Zeigerdiagramm', 'AC circuits and phasors'),
              summary: L(
                'Spule und Kondensator bremsen Wechselstrom auf ihre eigene Art. Drehende Zeiger zeigen, warum Strom und Spannung dann nicht mehr im Takt sind und wie viel Leistung wirklich ankommt.',
                'Coils and capacitors hold back alternating current in their own way. Rotating phasors show why current and voltage fall out of step and how much power really arrives.',
              ),
              grades: [11, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Wechselstrom', 'Wechselspannung', 'Effektivwert', 'Scheitelwert', 'Zeigerdiagramm', 'induktiver Widerstand', 'kapazitiver Widerstand', 'Blindwiderstand', 'Scheinwiderstand', 'Impedanz', 'Phasenverschiebung', 'Wirkleistung', 'Blindleistung', 'Scheinleistung', 'Reihenschwingkreis', 'Resonanzfrequenz', 'RLC'],
                ['alternating current', 'AC voltage', 'rms value', 'peak value', 'phasor diagram', 'inductive reactance', 'capacitive reactance', 'reactance', 'impedance', 'phase shift', 'real power', 'reactive power', 'apparent power', 'series RLC circuit', 'resonance frequency', 'RLC'],
              ),
            },
          ],
        },
        {
          id: 'elektronik',
          title: L('Elektronik', 'Electronics'),
          grades: [9, 13],
          simulations: [
            {
              id: 'diode-transistor',
              status: 'ready',
              slug: L('diode-und-transistor', 'diode-and-transistor'),
              title: L('Diode und Transistor', 'Diode and transistor'),
              summary: L(
                'Nimm die Kennlinie einer Diode auf, sieh Löcher und Elektronen am pn-Übergang, richte Wechselspannung gleich und schalte mit einem kleinen Basisstrom einen großen Kollektorstrom.',
                'Record the characteristic of a diode, watch holes and electrons at the pn junction, rectify AC voltage and switch a large collector current with a small base current.',
              ),
              grades: [9, 13],
              kmk: ['P-S', 'P-E', 'P-BK-System', 'P-BK-Materie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Diode', 'Halbleiter', 'pn-Übergang', 'Sperrschicht', 'Dotierung', 'Löcher', 'Kennlinie', 'Schleusenspannung', 'Durchlassrichtung', 'Sperrrichtung', 'Shockley-Gleichung', 'Leuchtdiode', 'LED', 'Gleichrichter', 'Brückengleichrichter', 'Glättungskondensator', 'Transistor', 'Stromverstärkung', 'Dämmerungsschalter', 'Fotowiderstand', 'Elektronik'],
                ['diode', 'semiconductor', 'pn junction', 'depletion layer', 'doping', 'holes', 'characteristic', 'threshold voltage', 'forward bias', 'reverse bias', 'Shockley equation', 'light-emitting diode', 'LED', 'rectifier', 'bridge rectifier', 'smoothing capacitor', 'transistor', 'current gain', 'twilight switch', 'photoresistor', 'electronics'],
              ),
            },
          ],
        },
      ],
    },
    {
      id: 'optik',
      slug: L('optik', 'optics'),
      title: L('Optik', 'Optics'),
      description: L(
        'Lichtstrahlen verfolgen, Spiegel und Linsen verschieben und Interferenzmuster entstehen lassen.',
        'Trace light rays, move mirrors and lenses and create interference patterns.',
      ),
      grades: [6, 13],
      kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Superposition'],
      topics: [
        {
          id: 'strahlenoptik',
          title: L('Strahlenoptik', 'Ray optics'),
          grades: [6, 9],
          simulations: [
            {
              id: 'licht-schatten',
              status: 'ready',
              slug: L('licht-und-schatten', 'light-and-shadow'),
              title: L('Licht und Schatten', 'Light and shadow'),
              summary: L(
                'Eine Lampe wirft einen scharfen Schatten, zwei Lampen einen Halbschatten. Genauso entstehen Sonnen- und Mondfinsternis.',
                'One lamp casts a sharp shadow, two lamps a penumbra. Solar and lunar eclipses form in just the same way.',
              ),
              grades: [6, 7],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Licht', 'Schatten', 'Kernschatten', 'Halbschatten', 'Randstrahl', 'Lichtquelle', 'punktförmig', 'geradlinige Ausbreitung', 'farbige Schatten', 'Sonnenfinsternis', 'Mondfinsternis', 'Mondphasen'],
                ['light', 'shadow', 'umbra', 'penumbra', 'edge ray', 'light source', 'point source', 'rectilinear propagation', 'coloured shadows', 'solar eclipse', 'lunar eclipse', 'moon phases'],
              ),
            },
            {
              id: 'reflexion',
              status: 'ready',
              slug: L('reflexion-ebener-spiegel', 'reflection-plane-mirror'),
              title: L('Reflexion am ebenen Spiegel', 'Reflection at a plane mirror'),
              summary: L(
                'Laser auf den Spiegel, Winkel messen: Einfallswinkel gleich Ausfallswinkel, jedes Mal. Und warum steht die Kerze im Spiegel genauso weit hinten?',
                'Laser at the mirror, measure the angles: angle of incidence equals angle of reflection, every time. And why does the candle appear just as far behind the mirror?',
              ),
              grades: [6, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Reflexion', 'Reflexionsgesetz', 'Spiegel', 'Einfallswinkel', 'Reflexionswinkel', 'Lot', 'Spiegelbild', 'virtuelles Bild', 'Sehstrahl', 'Winkelspiegel', 'Mehrfachbilder', 'Kaleidoskop'],
                ['reflection', 'law of reflection', 'mirror', 'angle of incidence', 'angle of reflection', 'normal', 'mirror image', 'virtual image', 'line of sight', 'angled mirrors', 'multiple images', 'kaleidoscope'],
              ),
            },
            {
              id: 'brechung',
              status: 'ready',
              slug: L('brechung-totalreflexion', 'refraction'),
              title: L('Brechung und Totalreflexion', 'Refraction and total internal reflection'),
              summary: L(
                'Ein Lichtstrahl knickt beim Übergang in Glas oder Wasser ab. Bei flachem Winkel kann er nicht mehr hinaus: Totalreflexion, wie in der Glasfaser.',
                'A light ray bends when it passes into glass or water. At a shallow angle it cannot get out at all: total internal reflection, as in an optical fibre.',
              ),
              grades: [6, 10],
              kmk: ['P-E', 'P-S', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Brechung', 'Brechungsgesetz', 'Snellius', 'Totalreflexion', 'Grenzwinkel', 'Brechungsindex', 'Lot', 'Einfallswinkel', 'optisch dichter', 'Lichtleiter', 'Glasfaser', 'Prisma', 'Dispersion', 'Brewster-Winkel', 'scheinbare Hebung', 'Huygens'],
                ['refraction', 'Snell’s law', 'total internal reflection', 'critical angle', 'refractive index', 'normal', 'angle of incidence', 'optical fibre', 'prism', 'dispersion', 'Brewster angle', 'apparent depth', 'Huygens'],
              ),
            },
            {
              id: 'farben',
              status: 'ready',
              slug: L('farben-prisma-farbmischung', 'colours-prism-colour-mixing'),
              title: L('Farben: Prisma und Farbmischung', 'Colours: prism and colour mixing'),
              summary: L(
                'Ein Prisma fächert weißes Licht in alle Regenbogenfarben auf. Drei farbige Lampen ergeben zusammen wieder Weiß, drei Farbfilter zusammen Schwarz.',
                'A prism fans white light out into all the colours of the rainbow. Three coloured lamps together make white again, three colour filters together make black.',
              ),
              grades: [6, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Farben', 'Prisma', 'Spektrum', 'Spektralfarben', 'Dispersion', 'Regenbogen', 'weißes Licht', 'additive Farbmischung', 'subtraktive Farbmischung', 'RGB', 'CMY', 'CMYK', 'Farbfilter', 'Absorption', 'Transmission', 'Komplementärfarbe', 'Bildschirm', 'Pixel', 'Infrarot', 'Ultraviolett'],
                ['colours', 'prism', 'spectrum', 'spectral colours', 'dispersion', 'rainbow', 'white light', 'additive colour mixing', 'subtractive colour mixing', 'RGB', 'CMY', 'CMYK', 'colour filter', 'absorption', 'transmission', 'complementary colour', 'screen', 'pixel', 'infrared', 'ultraviolet'],
              ),
            },
            {
              id: 'linsen',
              status: 'ready',
              slug: L('linsen-bildentstehung', 'lenses-image-formation'),
              title: L('Linsen und Bildentstehung', 'Lenses and image formation'),
              summary: L(
                'Verschiebe eine Kerze vor einer Linse und konstruiere das Bild mit drei besonderen Strahlen. Auf dem Schirm wird es scharf.',
                'Move a candle in front of a lens and construct the image with three special rays. It becomes sharp on the screen.',
              ),
              grades: [6, 11],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Linse', 'Sammellinse', 'Zerstreuungslinse', 'Brennweite', 'Brennpunkt', 'Parallelstrahl', 'Mittelpunktstrahl', 'Brennpunktstrahl', 'Linsengleichung', 'Abbildungsmaßstab', 'reelles Bild', 'virtuelles Bild', 'Lupe', 'Projektor', 'Kamera', 'Auge', 'Blende', 'Schärfentiefe'],
                ['lens', 'converging lens', 'diverging lens', 'focal length', 'focal point', 'parallel ray', 'central ray', 'focal ray', 'lens equation', 'magnification', 'real image', 'virtual image', 'magnifying glass', 'projector', 'camera', 'eye', 'aperture', 'depth of field'],
              ),
            },
          ],
        },
        {
          id: 'wellenoptik',
          title: L('Wellenoptik', 'Wave optics'),
          grades: [10, 13],
          simulations: [
            {
              id: 'doppelspalt',
              status: 'ready',
              slug: L('doppelspalt-gitter', 'double-slit-grating'),
              title: L('Doppelspalt und Gitter', 'Double slit and grating'),
              summary: L(
                'Laserlicht fällt durch einen Doppelspalt oder ein Gitter. Auf dem Schirm entsteht ein Muster aus hellen und dunklen Streifen.',
                'Laser light passes through a double slit or a grating. A pattern of bright and dark stripes appears on the screen.',
              ),
              grades: [10, 13],
              kmk: ['P-BK-Superposition', 'P-S', 'P-E', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Doppelspalt', 'Gitter', 'Mehrfachspalt', 'Einzelspalt', 'Interferenz', 'Beugung', 'Gitterkonstante', 'Gangunterschied', 'Maximum', 'Ordnung', 'Nebenmaximum', 'Laser', 'Wellenlänge', 'Huygens', 'Intensitätsverteilung', 'Wellenmodell des Lichts'],
                ['double slit', 'grating', 'multiple slit', 'single slit', 'interference', 'diffraction', 'grating constant', 'path difference', 'maximum', 'order', 'secondary maximum', 'laser', 'wavelength', 'Huygens', 'intensity distribution', 'wave model of light'],
              ),
            },
          ],
        },
      ],
    },
    {
      id: 'waerme',
      slug: L('waermelehre', 'thermodynamics'),
      title: L('Wärmelehre', 'Thermodynamics'),
      description: L(
        'Vom Teilchenmodell zu den Gasgesetzen: Temperatur, Druck und Volumen im Zusammenspiel.',
        'From the particle model to the gas laws: temperature, pressure and volume interacting.',
      ),
      grades: [6, 13],
      kmk: ['P-S', 'P-BK-Materie', 'P-BK-Energie'],
      topics: [
        {
          id: 'waermetransport',
          title: L('Wärmetransport und Klima', 'Heat transfer and climate'),
          grades: [5, 13],
          simulations: [
            {
              id: 'waermetransport',
              status: 'ready',
              slug: L('waermeleitung-stroemung-strahlung', 'conduction-convection-radiation'),
              title: L('Wärmeleitung, Wärmeströmung, Wärmestrahlung', 'Conduction, convection and radiation'),
              summary: L(
                'Warum wird der Löffel im Tee heiß, warum steigt warmes Wasser auf, und wie wärmt die Sonne durch das leere All? Am Ende geht es um die Frage, wie viel eine gedämmte Hauswand spart.',
                'Why does the spoon in your tea get hot, why does warm water rise, and how does the Sun warm us through empty space? Finally: how much does an insulated wall save?',
              ),
              grades: [5, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Wärmetransport', 'Wärmeleitung', 'Wärmeleitfähigkeit', 'Wärmeströmung', 'Konvektion', 'Wärmestrahlung', 'Stefan-Boltzmann-Gesetz', 'Emissionsgrad', 'Wärmedämmung', 'U-Wert', 'Wärmedurchgangskoeffizient', 'Temperaturgefälle', 'Isolator', 'Styropor', 'Kupfer', 'Energiesparen'],
                ['heat transfer', 'conduction', 'thermal conductivity', 'convection', 'thermal radiation', 'Stefan–Boltzmann law', 'emissivity', 'insulation', 'U-value', 'thermal transmittance', 'temperature gradient', 'insulator', 'polystyrene', 'copper', 'saving energy'],
              ),
            },
            {
              id: 'treibhauseffekt',
              status: 'ready',
              slug: L('treibhauseffekt-strahlungshaushalt', 'greenhouse-effect-radiation-budget'),
              title: L('Treibhauseffekt und Strahlungshaushalt der Erde', 'Greenhouse effect and the Earth’s radiation budget'),
              summary: L(
                'Ohne Lufthülle wäre die Erde im Mittel −18 °C kalt. Treibhausgase halten einen Teil der Wärmestrahlung zurück – und schon wenige Prozent mehr machen sie spürbar wärmer.',
                'Without its atmosphere the Earth would average −18 °C. Greenhouse gases hold back part of the thermal radiation – and just a few percent more make it noticeably warmer.',
              ),
              grades: [8, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Energie', 'P-BK-Mathematisieren', 'P-B'],
              keywords: L(
                ['Treibhauseffekt', 'Strahlungshaushalt', 'Strahlungsgleichgewicht', 'Klima', 'Klimawandel', 'Albedo', 'Treibhausgase', 'Kohlenstoffdioxid', 'CO2', 'Methan', 'Wasserdampf', 'Gegenstrahlung', 'Infrarot', 'Stefan-Boltzmann-Gesetz', 'Solarkonstante', 'Eis-Albedo-Rückkopplung'],
                ['greenhouse effect', 'radiation budget', 'radiative equilibrium', 'climate', 'climate change', 'albedo', 'greenhouse gases', 'carbon dioxide', 'CO2', 'methane', 'water vapour', 'back radiation', 'infrared', 'Stefan–Boltzmann law', 'solar constant', 'ice–albedo feedback'],
              ),
            },
          ],
        },
        {
          id: 'teilchenmodell',
          title: L('Teilchenmodell', 'Particle model'),
          grades: [6, 8],
          simulations: [
            {
              id: 'teilchenmodell',
              status: 'ready',
              slug: L('teilchenmodell-temperatur', 'particle-model-temperature'),
              title: L('Teilchenmodell und Temperatur', 'Particle model and temperature'),
              summary: L(
                'Eis schmilzt, Wasser siedet, und die Temperatur bleibt dabei stehen. Die Teilchen zeigen, wohin die Energie in der Zwischenzeit geht.',
                'Ice melts, water boils, and the temperature stops rising meanwhile. The particles show where the energy goes in between.',
              ),
              grades: [6, 9],
              kmk: ['P-BK-Materie', 'P-BK-Energie', 'P-S'],
              keywords: L(
                ['Teilchenmodell', 'Temperatur', 'Aggregatzustand', 'fest', 'flüssig', 'gasförmig', 'Schmelzen', 'Sieden', 'Erstarren', 'Kondensieren', 'Schmelztemperatur', 'Siedetemperatur', 'Schmelzwärme', 'Verdampfungswärme', 'Kelvin', 'absoluter Nullpunkt', 'Bewegungsenergie', 'Diffusion', 'Brownsche Bewegung'],
                ['particle model', 'temperature', 'state of matter', 'solid', 'liquid', 'gas', 'melting', 'boiling', 'freezing', 'condensing', 'melting point', 'boiling point', 'latent heat', 'kelvin', 'absolute zero', 'kinetic energy', 'diffusion'],
              ),
            },
            {
              id: 'waermeausdehnung',
              status: 'ready',
              slug: L('waermeausdehnung-anomalie-wasser', 'thermal-expansion-anomaly-of-water'),
              title: L('Wärmeausdehnung und Anomalie des Wassers', 'Thermal expansion and the anomaly of water'),
              summary: L(
                'Brücken brauchen Dehnungsfugen, Bimetalle schalten Bügeleisen ab, und Gase dehnen sich am stärksten aus. Nur Wasser tanzt aus der Reihe: Bei 4 °C ist es am schwersten.',
                'Bridges need expansion joints, bimetals switch off irons, and gases expand the most. Only water breaks the rule: it is heaviest at 4 °C.',
              ),
              grades: [6, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Wärmeausdehnung', 'Längenausdehnung', 'Ausdehnungskoeffizient', 'Bimetall', 'Dehnungsfuge', 'Volumenausdehnung', 'Gas', 'Gay-Lussac', 'absoluter Nullpunkt', 'Kelvin', 'Anomalie des Wassers', 'Dichte', '4 °C', 'Eis', 'See im Winter', 'Teilchenmodell', 'Thermometer'],
                ['thermal expansion', 'linear expansion', 'expansion coefficient', 'bimetal', 'expansion joint', 'volume expansion', 'gas', 'Gay-Lussac', 'absolute zero', 'kelvin', 'anomaly of water', 'density', '4 °C', 'ice', 'lake in winter', 'particle model', 'thermometer'],
              ),
            },
          ],
        },
        {
          id: 'gase',
          title: L('Gase', 'Gases'),
          grades: [8, 13],
          simulations: [
            {
              id: 'gasgesetze',
              status: 'ready',
              slug: L('gasgesetze', 'gas-laws'),
              title: L('Gasgesetze', 'Gas laws'),
              summary: L(
                'Kolben halb hineindrücken, und der Druck verdoppelt sich. Erwärmen, und das Gas schiebt den Kolben hinaus. Druck, Volumen und Temperatur hängen fest zusammen.',
                'Push the piston halfway in and the pressure doubles. Heat the gas and it pushes the piston out. Pressure, volume and temperature are tightly linked.',
              ),
              grades: [8, 13],
              uni: true,
              kmk: ['P-BK-Materie', 'P-BK-Mathematisieren', 'P-E', 'P-S'],
              keywords: L(
                ['Gasgesetze', 'ideales Gas', 'allgemeine Gasgleichung', 'Boyle-Mariotte', 'Gay-Lussac', 'Amontons', 'isotherm', 'isobar', 'isochor', 'Druck', 'Volumen', 'Temperatur', 'Kelvin', 'absoluter Nullpunkt', 'Stoffmenge', 'Gaskonstante', 'Manometer', 'Teilchenmodell', 'Linearisierung', 'Zustandsänderung'],
                ['gas laws', 'ideal gas', 'ideal gas law', 'Boyle’s law', 'Charles’s law', 'Gay-Lussac', 'Amontons', 'isothermal', 'isobaric', 'isochoric', 'pressure', 'volume', 'temperature', 'kelvin', 'absolute zero', 'amount of substance', 'gas constant', 'pressure gauge', 'particle model', 'linearisation'],
              ),
            },
            {
              id: 'waermekraftmaschine',
              status: 'ready',
              slug: L('waermekraftmaschine-waermepumpe', 'heat-engine-heat-pump'),
              title: L('Wärmekraftmaschine, Wärmepumpe und Entropie', 'Heat engine, heat pump and entropy'),
              summary: L(
                'Ein Gas im Zylinder nimmt Wärme auf, schiebt den Kolben und gibt den Rest ans Kalte ab. Rückwärts betrieben pumpt dieselbe Maschine Wärme ins Haus. Warum nie die ganze Wärme zu Arbeit wird, zeigt die Entropie.',
                'A gas in a cylinder takes in heat, pushes the piston and gives the rest to the cold side. Run backwards, the same machine pumps heat into the house. Entropy shows why heat never turns entirely into work.',
              ),
              grades: [8, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Energie', 'P-BK-Mathematisieren', 'P-B'],
              keywords: L(
                ['Wärmekraftmaschine', 'Carnot', 'Carnot-Prozess', 'Kreisprozess', 'p-V-Diagramm', 'Wirkungsgrad', 'Wärmepumpe', 'Kühlschrank', 'Leistungszahl', 'Entropie', 'Hauptsatz der Thermodynamik', 'reversibel', 'irreversibel', 'isotherm', 'adiabatisch', 'innere Energie', 'Kraftwerk', 'Motor'],
                ['heat engine', 'Carnot', 'Carnot cycle', 'thermodynamic cycle', 'p-V diagram', 'efficiency', 'heat pump', 'refrigerator', 'coefficient of performance', 'entropy', 'law of thermodynamics', 'reversible', 'irreversible', 'isothermal', 'adiabatic', 'internal energy', 'power plant', 'engine'],
              ),
            },
          ],
        },
      ],
    },
    {
      id: 'moderne-physik',
      slug: L('atom-kern-und-quantenphysik', 'atomic-nuclear-and-quantum-physics'),
      title: L('Atom-, Kern- und Quantenphysik', 'Atomic, nuclear and quantum physics'),
      description: L(
        'Radioaktiver Zerfall, Spektrallinien und Photoeffekt – Zufall und Quantisierung erleben.',
        'Radioactive decay, spectral lines and the photoelectric effect – experience randomness and quantisation.',
      ),
      grades: [7, 14],
      kmk: ['P-S', 'P-E', 'P-BK-Zufall', 'P-BK-Materie'],
      topics: [
        {
          id: 'sterne',
          title: L('Sterne', 'Stars'),
          grades: [7, 13],
          simulations: [
            {
              id: 'hr-diagramm',
              status: 'ready',
              slug: L('sterne-hertzsprung-russell-diagramm', 'stars-hertzsprung-russell-diagram'),
              title: L('Sterne und Hertzsprung-Russell-Diagramm', 'Stars and the Hertzsprung–Russell diagram'),
              summary: L(
                'Blaue Riesen, Rote Zwerge, Weiße Zwerge: Im HR-Diagramm bekommt jeder Stern seinen Platz. Du verfolgst den Lebensweg eines Sterns bis zur Supernova und misst Entfernungen mit der Parallaxe.',
                'Blue giants, red dwarfs, white dwarfs: in the HR diagram every star gets its place. Follow the life of a star up to a supernova and measure distances with the parallax.',
              ),
              grades: [7, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Materie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Stern', 'Sterne', 'Hertzsprung-Russell-Diagramm', 'HR-Diagramm', 'Hauptreihe', 'Roter Riese', 'Überriese', 'Weißer Zwerg', 'Leuchtkraft', 'Oberflächentemperatur', 'Spektralklasse', 'Stefan-Boltzmann-Gesetz', 'Wiensches Verschiebungsgesetz', 'Planck', 'Schwarzer Körper', 'Sternentwicklung', 'Supernova', 'Neutronenstern', 'Schwarzes Loch', 'Planetarischer Nebel', 'Parallaxe', 'Parsec', 'Lichtjahr', 'absolute Helligkeit', 'Sonne', 'Beteigeuze', 'Sirius'],
                ['star', 'stars', 'Hertzsprung–Russell diagram', 'HR diagram', 'main sequence', 'red giant', 'supergiant', 'white dwarf', 'luminosity', 'surface temperature', 'spectral class', 'Stefan–Boltzmann law', 'Wien’s displacement law', 'Planck', 'black body', 'stellar evolution', 'supernova', 'neutron star', 'black hole', 'planetary nebula', 'parallax', 'parsec', 'light year', 'absolute magnitude', 'Sun', 'Betelgeuse', 'Sirius'],
              ),
            },
          ],
        },
        {
          id: 'radioaktivitaet',
          title: L('Radioaktivität', 'Radioactivity'),
          grades: [9, 12],
          simulations: [
            {
              id: 'radioaktiver-zerfall',
              status: 'ready',
              slug: L('radioaktiver-zerfall', 'radioactive-decay'),
              title: L('Radioaktiver Zerfall und Halbwertszeit', 'Radioactive decay and half-life'),
              summary: L(
                'Viele Atomkerne zerfallen zufällig, und ein Zählrohr knackt. Trotzdem ist nach jeder Halbwertszeit ungefähr die Hälfte übrig.',
                'Many nuclei decay at random and a Geiger counter clicks. Even so, after each half-life almost exactly half are left.',
              ),
              grades: [8, 13],
              kmk: ['P-BK-Zufall', 'P-BK-Mathematisieren', 'P-BK-Materie'],
              keywords: L(
                ['Radioaktivität', 'radioaktiver Zerfall', 'Halbwertszeit', 'Zerfallsgesetz', 'Zerfallskonstante', 'Aktivität', 'Becquerel', 'Zählrohr', 'Geiger-Müller-Zählrohr', 'Zählrate', 'Alphazerfall', 'Betazerfall', 'Gammastrahlung', 'Mutterkern', 'Tochterkern', 'Zerfallsgleichung', 'Nuklid', 'C-14-Methode', 'Altersbestimmung', 'Zufall', 'Exponentialfunktion'],
                ['radioactivity', 'radioactive decay', 'half-life', 'decay law', 'decay constant', 'activity', 'becquerel', 'Geiger counter', 'count rate', 'alpha decay', 'beta decay', 'gamma radiation', 'parent nucleus', 'daughter nucleus', 'decay equation', 'nuclide', 'radiocarbon dating', 'chance', 'exponential function'],
              ),
            },
            {
              id: 'strahlenschutz',
              status: 'ready',
              slug: L('ionisierende-strahlung-strahlenschutz', 'ionising-radiation-protection'),
              title: L('Ionisierende Strahlung und Strahlenschutz', 'Ionising radiation and radiation protection'),
              summary: L(
                'Alphastrahlung bleibt im Papier stecken, Betastrahlung in Aluminium, Gammastrahlung kommt selbst durch Blei noch teilweise durch. Abstand halten hilft am meisten.',
                'Alpha radiation stops in paper, beta in aluminium, while gamma still partly gets through lead. Keeping your distance helps most.',
              ),
              grades: [8, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren', 'P-B'],
              keywords: L(
                ['ionisierende Strahlung', 'Alphastrahlung', 'Betastrahlung', 'Gammastrahlung', 'Absorption', 'Reichweite', 'Halbwertsdicke', 'Abstandsgesetz', 'Zählrohr', 'Geiger-Müller-Zählrohr', 'Nullrate', 'Strahlenschutz', 'Abschirmung', 'Dosis', 'Äquivalentdosis', 'Sievert', 'Strahlenbiophysik'],
                ['ionising radiation', 'alpha radiation', 'beta radiation', 'gamma radiation', 'absorption', 'range', 'half-value thickness', 'inverse-square law', 'Geiger counter', 'Geiger–Müller tube', 'background count', 'radiation protection', 'shielding', 'dose', 'equivalent dose', 'sievert', 'radiation biophysics'],
              ),
            },
            {
              id: 'kernspaltung',
              status: 'ready',
              slug: L('kernspaltung-kernfusion', 'nuclear-fission-fusion'),
              title: L('Kernspaltung, Kernfusion und Kettenreaktion', 'Nuclear fission, fusion and chain reaction'),
              summary: L(
                'Warum liefert ein gespaltener Urankern so viel Energie, und warum auch das Verschmelzen von Wasserstoff? Die Kurve der Bindungsenergie gibt die Antwort. Eine Kettenreaktion zeigt, was Steuerstäbe im Reaktor tun.',
                'Why does splitting a uranium nucleus release so much energy – and so does fusing hydrogen? The binding-energy curve answers both. A chain reaction shows what control rods do in a reactor.',
              ),
              grades: [9, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Energie', 'P-BK-Mathematisieren', 'P-B'],
              keywords: L(
                ['Kernspaltung', 'Kernfusion', 'Bindungsenergie', 'Bindungsenergie pro Nukleon', 'Massendefekt', 'Tröpfchenmodell', 'Uran-235', 'Kettenreaktion', 'Vermehrungsfaktor', 'kritisch', 'Steuerstäbe', 'Moderator', 'Kernkraftwerk', 'Sonne', 'Wasserstoff', 'Helium', 'Energie'],
                ['nuclear fission', 'nuclear fusion', 'binding energy', 'binding energy per nucleon', 'mass defect', 'liquid-drop model', 'uranium-235', 'chain reaction', 'multiplication factor', 'critical', 'control rods', 'moderator', 'nuclear power plant', 'Sun', 'hydrogen', 'helium', 'energy'],
              ),
            },
          ],
        },
        {
          id: 'relativitaet',
          title: L('Relativitätstheorie', 'Theory of relativity'),
          grades: [11, 13],
          simulations: [
            {
              id: 'zeitdilatation',
              status: 'ready',
              slug: L('zeitdilatation-laengenkontraktion', 'time-dilation-length-contraction'),
              title: L('Zeitdilatation und Längenkontraktion', 'Time dilation and length contraction'),
              summary: L(
                'Eine Lichtuhr fährt im Zug mit: Vom Bahnsteig aus läuft das Licht schräg und braucht länger. Auch Zug und Tunnel, ein Lichtblitz in der Zugmitte, Myonen und E = m · c² kommen vor.',
                'A light clock rides on a train: seen from the platform, the light travels diagonally and takes longer. A train and a tunnel, a flash in the middle of the train, muons and E = m · c² follow.',
              ),
              grades: [11, 13],
              kmk: ['P-S', 'P-E', 'P-K', 'P-BK-Mathematisieren', 'P-BK-Energie', 'P-BK-Erhaltung'],
              keywords: L(
                ['spezielle Relativitätstheorie', 'Relativitätstheorie', 'Einstein', 'Postulate', 'Relativitätsprinzip', 'Lichtgeschwindigkeit', 'Konstanz der Lichtgeschwindigkeit', 'Lichtuhr', 'Zeitdilatation', 'Eigenzeit', 'Längenkontraktion', 'Ruhelänge', 'Lorentzfaktor', 'Relativität der Gleichzeitigkeit', 'Gleichzeitigkeit', 'Inertialsystem', 'Bezugssystem', 'Myon', 'Höhenstrahlung', 'GPS', 'relativistische Masse', 'Massenzunahme', 'Ruheenergie', 'Gesamtenergie', 'E = mc²', 'relativistischer Impuls', 'Teilchenbeschleuniger', 'Weltbild'],
                ['special relativity', 'theory of relativity', 'Einstein', 'postulates', 'principle of relativity', 'speed of light', 'constancy of the speed of light', 'light clock', 'time dilation', 'proper time', 'length contraction', 'rest length', 'Lorentz factor', 'relativity of simultaneity', 'simultaneity', 'inertial frame', 'frame of reference', 'muon', 'cosmic rays', 'GPS', 'relativistic mass', 'mass increase', 'rest energy', 'total energy', 'E = mc²', 'relativistic momentum', 'particle accelerator', 'world view'],
              ),
            },
          ],
        },
        {
          id: 'astrophysik',
          title: L('Astrophysik und Kosmologie', 'Astrophysics and cosmology'),
          grades: [11, 13],
          simulations: [
            {
              id: 'hubble',
              status: 'ready',
              slug: L('expandierendes-universum-hubble', 'expanding-universe-hubble'),
              title: L('Expandierendes Universum', 'Expanding universe'),
              summary: L(
                'Je weiter eine Galaxie entfernt ist, desto schneller flieht sie und desto röter ist ihr Licht. Rückwärts gerechnet führt das zum Urknall vor etwa 14 Milliarden Jahren.',
                'The farther away a galaxy is, the faster it recedes and the redder its light. Run backwards, this leads to the Big Bang about 14 billion years ago.',
              ),
              grades: [11, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Mathematisieren', 'P-BK-Energie'],
              keywords: L(
                ['Hubble', 'Hubble-Konstante', 'Hubble-Gesetz', 'Hubble-Diagramm', 'Rotverschiebung', 'Spektrallinie', 'Fluchtgeschwindigkeit', 'Galaxie', 'Expansion', 'Urknall', 'Weltalter', 'Hubble-Zeit', 'Skalenfaktor', 'Friedmann', 'Dunkle Energie', 'Dunkle Materie', 'Hintergrundstrahlung', 'Kosmologie', 'Standardkerze', 'Supernova', 'Cepheiden', 'Parsec', 'Lichtjahr'],
                ['Hubble', 'Hubble constant', 'Hubble’s law', 'Hubble diagram', 'redshift', 'spectral line', 'recession velocity', 'galaxy', 'expansion', 'Big Bang', 'age of the universe', 'Hubble time', 'scale factor', 'Friedmann', 'dark energy', 'dark matter', 'background radiation', 'cosmology', 'standard candle', 'supernova', 'Cepheids', 'parsec', 'light year'],
              ),
            },
          ],
        },
        {
          id: 'quanten',
          title: L('Quantenphysik', 'Quantum physics'),
          grades: [12, 14],
          simulations: [
            {
              id: 'linienspektren',
              status: 'ready',
              slug: L('linienspektren-energieniveaus', 'line-spectra-energy-levels'),
              title: L('Atommodelle und Linienspektren', 'Atomic models and line spectra'),
              summary: L(
                'Jedes Element leuchtet in seinen eigenen Farben. Springt ein Elektron eine Stufe tiefer, entsteht genau eine Linie im Spektrum.',
                'Every element glows in its own colours. When an electron drops one level, exactly one line appears in the spectrum.',
              ),
              grades: [9, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Materie', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Linienspektrum', 'Spektrallinie', 'Energieniveau', 'Termschema', 'Elektronensprung', 'Photon', 'Emission', 'Absorption', 'Emissionsspektrum', 'Absorptionsspektrum', 'Bohrsches Atommodell', 'Wasserstoff', 'Balmer-Serie', 'Lyman-Serie', 'Natrium-D-Linie', 'Quecksilber', 'Helium', 'Planck-Konstante', 'Frequenz', 'Wellenlänge', 'Spektralfarben', 'Prisma', 'Fraunhofer-Linien'],
                ['line spectrum', 'spectral line', 'energy level', 'energy level diagram', 'electron transition', 'photon', 'emission', 'absorption', 'emission spectrum', 'absorption spectrum', 'Bohr model', 'hydrogen', 'Balmer series', 'Lyman series', 'sodium D line', 'mercury', 'helium', 'Planck constant', 'frequency', 'wavelength', 'spectral colours', 'prism', 'Fraunhofer lines'],
              ),
            },
            {
              id: 'photoeffekt',
              status: 'ready',
              slug: L('photoeffekt-gegenfeldmethode', 'photoelectric-effect-retarding-field'),
              title: L('Photoeffekt', 'Photoelectric effect'),
              summary: L(
                'Rotes Licht kann noch so hell sein, es löst kein einziges Elektron. Kurzwelliges Licht schafft es sofort. Für Wellen ist das rätselhaft, für Photonen nicht.',
                'Red light can be as bright as you like, it frees not a single electron. Short-wave light does it at once. A puzzle for waves, not for photons.',
              ),
              grades: [12, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Materie', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Photoeffekt', 'lichtelektrischer Effekt', 'Fotozelle', 'Gegenfeldmethode', 'Gegenspannung', 'Austrittsarbeit', 'Grenzfrequenz', 'Einstein-Gerade', 'Photon', 'Planck-Konstante', 'Bewegungsenergie', 'Intensität', 'Fotostrom', 'Quantenobjekt'],
                ['photoelectric effect', 'photocell', 'retarding field method', 'stopping voltage', 'work function', 'threshold frequency', 'Einstein line', 'photon', 'Planck constant', 'kinetic energy', 'intensity', 'photocurrent', 'quantum object'],
              ),
            },
            {
              id: 'elektronenbeugung',
              status: 'ready',
              slug: L('elektronenbeugung-graphit', 'electron-diffraction-graphite'),
              title: L('Elektronenbeugung', 'Electron diffraction'),
              summary: L(
                'Elektronen treffen auf eine dünne Graphitschicht und bilden Ringe auf dem Schirm, wie es nur Wellen tun.',
                'Electrons hit a thin layer of graphite and form rings on the screen, just like waves do.',
              ),
              grades: [12, 14],
              uni: true,
              kmk: ['P-S', 'P-E', 'P-BK-Materie', 'P-BK-Superposition', 'P-BK-Mathematisieren', 'P-BK-Zufall'],
              keywords: L(
                ['Elektronenbeugung', 'Elektronenbeugungsröhre', 'de-Broglie-Wellenlänge', 'Materiewelle', 'Welle-Teilchen-Dualismus', 'Graphit', 'Bragg-Bedingung', 'Netzebenenabstand', 'Beugungsring', 'Beschleunigungsspannung', 'Impuls', 'Planck-Konstante', 'Leuchtschirm', 'Linearisierung', 'Quantenobjekt'],
                ['electron diffraction', 'electron diffraction tube', 'de Broglie wavelength', 'matter wave', 'wave–particle duality', 'graphite', 'Bragg condition', 'lattice spacing', 'diffraction ring', 'accelerating voltage', 'momentum', 'Planck constant', 'fluorescent screen', 'linearisation', 'quantum object'],
              ),
            },
            {
              id: 'mach-zehnder',
              status: 'ready',
              slug: L('mach-zehnder-interferometer', 'mach-zehnder-interferometer'),
              title: L('Mach-Zehnder-Interferometer mit einzelnen Photonen', 'Mach-Zehnder interferometer with single photons'),
              summary: L(
                'Ein einzelnes Photon trifft auf einen Strahlteiler – und nimmt scheinbar beide Wege zugleich. Sobald man den Weg herausfinden könnte, verschwindet die Interferenz.',
                'A single photon meets a beam splitter – and seems to take both paths at once. As soon as the path could be found out, the interference disappears.',
              ),
              grades: [12, 14],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-B'],
              keywords: L(
                ['Mach-Zehnder-Interferometer', 'Interferometer', 'Strahlteiler', 'einzelne Photonen', 'Einzelphotonen', 'Interferenz', 'Welcher-Weg-Information', 'Komplementarität', 'Superposition', 'Quantenobjekt', 'Wahrscheinlichkeit', 'Delayed Choice', 'Polarisation', 'Quantenphysik', 'Weltbild'],
                ['Mach-Zehnder interferometer', 'interferometer', 'beam splitter', 'single photons', 'interference', 'which-path information', 'complementarity', 'superposition', 'quantum object', 'probability', 'delayed choice', 'polarisation', 'quantum physics', 'world view'],
              ),
            },
            {
              id: 'potentialtopf',
              status: 'ready',
              slug: L('potentialtopf', 'particle-in-a-box'),
              title: L('Potentialtopf: Energiestufen und Aufenthaltswahrscheinlichkeit', 'Particle in a box: energy levels and probability'),
              summary: L(
                'Ein Elektron, eingesperrt in einen engen Kasten, darf nur bestimmte Energien haben – wie eine schwingende Saite nur bestimmte Töne. Wo es sich aufhält, sagt nur eine Wahrscheinlichkeit.',
                'An electron locked in a narrow box may only have certain energies – just as a vibrating string has only certain notes. Where it is can only be given as a probability.',
              ),
              grades: [12, 14],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Potentialtopf', 'Potenzialtopf', 'unendlich hoher Potentialtopf', 'Energiestufen', 'Energieniveaus', 'Quantenzahl', 'Wellenfunktion', 'Betragsquadrat', 'Aufenthaltswahrscheinlichkeit', 'stehende Welle', 'de-Broglie-Wellenlänge', 'Grundzustand', 'Farbstoffmolekül', 'Kernmodell', 'Nukleon'],
                ['potential well', 'particle in a box', 'infinite square well', 'energy levels', 'quantum number', 'wave function', 'squared magnitude', 'probability of presence', 'standing wave', 'de Broglie wavelength', 'ground state', 'dye molecule', 'nuclear model', 'nucleon'],
              ),
            },
          ],
        },
      ],
    },
  ],
};
