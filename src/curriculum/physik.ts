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
                'Lass eine Kugel auf Erde, Mond oder Mars fallen und sieh, wie sie immer schneller wird. Dazu Kugel und Feder mit und ohne Luft.',
                'Drop a ball on Earth, the Moon or Mars and see how it gets faster and faster. Plus a ball and a feather with and without air.',
              ),
              grades: [9, 11],
              kmk: ['P-E', 'P-S', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['freier Fall', 'Fallbeschleunigung', 'Ortsfaktor', 'Fallröhre', 'Vakuum', 'Luftwiderstand', 'Stroboskop', 'Fallgesetz', 'Reaktionszeit', 'Lineal', 'gleichmäßig beschleunigte Bewegung'],
                ['free fall', 'gravitational acceleration', 'feather', 'vacuum', 'air resistance', 'stroboscope', 'law of falling bodies', 'reaction time', 'ruler', 'uniformly accelerated motion'],
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
                'Hänge Gewichte an einen Hebel und bring ihn ins Gleichgewicht. Dazu Hebel aus dem Alltag wie Schubkarre und Flaschenöffner.',
                'Hang weights on a lever and balance it. With everyday levers such as a wheelbarrow and a bottle opener.',
              ),
              grades: [7, 11],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Energie'],
              keywords: L(
                ['Hebel', 'Hebelgesetz', 'Drehmoment', 'Kraftarm', 'Lastarm', 'Drehachse', 'einseitiger Hebel', 'zweiseitiger Hebel', 'Gleichgewicht', 'Kraftmesser', 'Schubkarre', 'Nussknacker', 'Flaschenöffner', 'Wippe', 'Goldene Regel der Mechanik', 'Kraftwandler'],
                ['lever', 'law of the lever', 'torque', 'moment', 'effort arm', 'load arm', 'pivot', 'fulcrum', 'equilibrium', 'spring balance', 'wheelbarrow', 'nutcracker', 'bottle opener', 'seesaw', 'golden rule of mechanics'],
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
                'Starte einen Planeten mit eigener Geschwindigkeit und sieh, ob er auf einer Ellipse kreist oder davonfliegt. Mit den Keplerschen Gesetzen.',
                'Launch a planet at your chosen speed and see whether it moves on an ellipse or flies away. With Kepler\'s laws.',
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
                'Wirf einen Ball unter einem Winkel und sieh seine Bahn. Welcher Winkel trägt am weitesten? Auch auf Mond und Mars.',
                'Throw a ball at an angle and watch its path. Which angle goes furthest? Also on the Moon and Mars.',
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
      grades: [10, 13],
      kmk: ['P-S', 'P-E', 'P-BK-Superposition', 'P-BK-Mathematisieren'],
      topics: [
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
      grades: [6, 13],
      kmk: ['P-S', 'P-E', 'P-BK-System', 'P-BK-Wechselwirkung'],
      topics: [
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
                'Stelle die Spannung ein und miss die Stromstärke. So entsteht die Kennlinie und du entdeckst das Ohmsche Gesetz.',
                'Set the voltage and measure the current. This gives the characteristic curve and you discover Ohm\'s law.',
              ),
              grades: [8, 9],
              kmk: ['P-E', 'P-K', 'P-S', 'P-BK-System'],
              keywords: L(
                ['Ohmsches Gesetz', 'Widerstand', 'Kennlinie', 'I-U-Diagramm', 'U-I-Diagramm', 'Stromstärke', 'Spannung', 'Amperemeter', 'Voltmeter', 'Glühlampe', 'Konstantan', 'spezifischer Widerstand', 'Ursprungsgerade', 'Proportionalität'],
                ['Ohm’s law', 'resistance', 'characteristic', 'current–voltage graph', 'current', 'voltage', 'ammeter', 'voltmeter', 'light bulb', 'constantan', 'resistivity', 'proportionality'],
              ),
            },
          ],
        },
        {
          id: 'felder',
          title: L('Elektrische und magnetische Felder', 'Electric and magnetic fields'),
          grades: [9, 13],
          simulations: [
            {
              id: 'induktion',
              status: 'ready',
              slug: L('elektromagnetische-induktion', 'electromagnetic-induction'),
              title: L('Elektromagnetische Induktion', 'Electromagnetic induction'),
              summary: L(
                'Schiebe einen Magneten in eine Spule oder drehe eine Spule im Magnetfeld: Es entsteht eine Spannung. So funktioniert ein Generator.',
                'Push a magnet into a coil or turn a coil in a magnetic field: a voltage appears. This is how a generator works.',
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
              id: 'feldlinien',
              status: 'ready',
              slug: L('feldlinien-punktladungen', 'field-lines-point-charges'),
              title: L('Feldlinien von Punktladungen', 'Field lines of point charges'),
              summary: L(
                'Verschiebe elektrische Ladungen und sieh, wie sich ihre Feldlinien verändern. Mit Messung von Feldstärke und Kraft.',
                'Move electric charges and see how their field lines change. With measurements of field strength and force.',
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
                'Verschiebe Lampe, Gegenstand und Schirm und sieh, wie Kernschatten und Halbschatten entstehen. Dazu Sonnen- und Mondfinsternis.',
                'Move the lamp, the object and the screen and see how umbra and penumbra form. Plus solar and lunar eclipses.',
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
                'Richte einen Laser auf einen Spiegel und miss die Winkel. Dazu das Spiegelbild einer Kerze.',
                'Point a laser at a mirror and measure the angles. Plus the mirror image of a candle.',
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
              id: 'linsen',
              status: 'ready',
              slug: L('linsen-bildentstehung', 'lenses-image-formation'),
              title: L('Linsen und Bildentstehung', 'Lenses and image formation'),
              summary: L(
                'Verschiebe eine Kerze vor einer Linse und konstruiere das Bild mit drei besonderen Strahlen. Auf dem Schirm wird es scharf.',
                'Move a candle in front of a lens and construct the image with three special rays. It becomes sharp on the screen.',
              ),
              grades: [6, 10],
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
                'Heize Eis zu Wasser und Dampf und sieh, wie sich die Teilchen dabei bewegen. Dazu ein Diagramm der Temperatur.',
                'Heat ice into water and steam and see how the particles move. With a graph of the temperature.',
              ),
              grades: [6, 9],
              kmk: ['P-BK-Materie', 'P-BK-Energie', 'P-S'],
              keywords: L(
                ['Teilchenmodell', 'Temperatur', 'Aggregatzustand', 'fest', 'flüssig', 'gasförmig', 'Schmelzen', 'Sieden', 'Erstarren', 'Kondensieren', 'Schmelztemperatur', 'Siedetemperatur', 'Schmelzwärme', 'Verdampfungswärme', 'Kelvin', 'absoluter Nullpunkt', 'Bewegungsenergie', 'Diffusion', 'Brownsche Bewegung'],
                ['particle model', 'temperature', 'state of matter', 'solid', 'liquid', 'gas', 'melting', 'boiling', 'freezing', 'condensing', 'melting point', 'boiling point', 'latent heat', 'kelvin', 'absolute zero', 'kinetic energy', 'diffusion'],
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
                'Ein Gas in einem Zylinder mit Kolben: Ändere Druck, Volumen oder Temperatur und sieh, wie sich die anderen Größen verhalten.',
                'A gas in a cylinder with a piston: change the pressure, volume or temperature and see how the other quantities respond.',
              ),
              grades: [8, 13],
              uni: true,
              kmk: ['P-BK-Materie', 'P-BK-Mathematisieren', 'P-E', 'P-S'],
              keywords: L(
                ['Gasgesetze', 'ideales Gas', 'allgemeine Gasgleichung', 'Boyle-Mariotte', 'Gay-Lussac', 'Amontons', 'isotherm', 'isobar', 'isochor', 'Druck', 'Volumen', 'Temperatur', 'Kelvin', 'absoluter Nullpunkt', 'Stoffmenge', 'Gaskonstante', 'Manometer', 'Teilchenmodell', 'Linearisierung', 'Zustandsänderung'],
                ['gas laws', 'ideal gas', 'ideal gas law', 'Boyle’s law', 'Charles’s law', 'Gay-Lussac', 'Amontons', 'isothermal', 'isobaric', 'isochoric', 'pressure', 'volume', 'temperature', 'kelvin', 'absolute zero', 'amount of substance', 'gas constant', 'pressure gauge', 'particle model', 'linearisation'],
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
      grades: [9, 14],
      kmk: ['P-S', 'P-E', 'P-BK-Zufall', 'P-BK-Materie'],
      topics: [
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
              grades: [9, 13],
              kmk: ['P-BK-Zufall', 'P-BK-Mathematisieren', 'P-BK-Materie'],
              keywords: L(
                ['Radioaktivität', 'radioaktiver Zerfall', 'Halbwertszeit', 'Zerfallsgesetz', 'Zerfallskonstante', 'Aktivität', 'Becquerel', 'Zählrohr', 'Geiger-Müller-Zählrohr', 'Zählrate', 'Alphazerfall', 'Betazerfall', 'Gammastrahlung', 'Mutterkern', 'Tochterkern', 'Zerfallsgleichung', 'Nuklid', 'C-14-Methode', 'Altersbestimmung', 'Zufall', 'Exponentialfunktion'],
                ['radioactivity', 'radioactive decay', 'half-life', 'decay law', 'decay constant', 'activity', 'becquerel', 'Geiger counter', 'count rate', 'alpha decay', 'beta decay', 'gamma radiation', 'parent nucleus', 'daughter nucleus', 'decay equation', 'nuclide', 'radiocarbon dating', 'chance', 'exponential function'],
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
              id: 'photoeffekt',
              status: 'ready',
              slug: L('photoeffekt-gegenfeldmethode', 'photoelectric-effect-retarding-field'),
              title: L('Photoeffekt', 'Photoelectric effect'),
              summary: L(
                'Licht trifft auf ein Metall und löst Elektronen heraus, aber nur ab einer bestimmten Farbe. So zeigt sich, dass Licht aus Photonen besteht.',
                'Light hits a metal and knocks out electrons, but only from a certain colour on. This shows that light consists of photons.',
              ),
              grades: [12, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Materie', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Photoeffekt', 'lichtelektrischer Effekt', 'Fotozelle', 'Gegenfeldmethode', 'Gegenspannung', 'Austrittsarbeit', 'Grenzfrequenz', 'Einstein-Gerade', 'Photon', 'Planck-Konstante', 'Bewegungsenergie', 'Intensität', 'Fotostrom', 'Quantenobjekt'],
                ['photoelectric effect', 'photocell', 'retarding field method', 'stopping voltage', 'work function', 'threshold frequency', 'Einstein line', 'photon', 'Planck constant', 'kinetic energy', 'intensity', 'photocurrent', 'quantum object'],
              ),
            },
            {
              id: 'linienspektren',
              status: 'ready',
              slug: L('linienspektren-energieniveaus', 'line-spectra-energy-levels'),
              title: L('Atommodelle und Linienspektren', 'Atomic models and line spectra'),
              summary: L(
                'Ein Elektron springt zwischen den Energiestufen eines Atoms und sendet dabei Licht einer bestimmten Farbe aus. So entsteht das Linienspektrum.',
                'An electron jumps between the energy levels of an atom and emits light of a particular colour. This produces the line spectrum.',
              ),
              grades: [12, 13],
              kmk: ['P-S', 'P-E', 'P-BK-Materie', 'P-BK-Energie', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Linienspektrum', 'Spektrallinie', 'Energieniveau', 'Termschema', 'Elektronensprung', 'Photon', 'Emission', 'Absorption', 'Emissionsspektrum', 'Absorptionsspektrum', 'Bohrsches Atommodell', 'Wasserstoff', 'Balmer-Serie', 'Lyman-Serie', 'Natrium-D-Linie', 'Quecksilber', 'Helium', 'Planck-Konstante', 'Frequenz', 'Wellenlänge', 'Spektralfarben', 'Prisma', 'Fraunhofer-Linien'],
                ['line spectrum', 'spectral line', 'energy level', 'energy level diagram', 'electron transition', 'photon', 'emission', 'absorption', 'emission spectrum', 'absorption spectrum', 'Bohr model', 'hydrogen', 'Balmer series', 'Lyman series', 'sodium D line', 'mercury', 'helium', 'Planck constant', 'frequency', 'wavelength', 'spectral colours', 'prism', 'Fraunhofer lines'],
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
          ],
        },
      ],
    },
  ],
};
