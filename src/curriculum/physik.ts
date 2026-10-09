import { L, planned } from './helpers';
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
                'Ein Auto fährt gleichförmig, beschleunigt oder nach Fahrplan – live entstehen t-s-, t-v- und t-a-Diagramm mit Steigungsdreieck, Fläche unter dem Graphen und Stroboskop.',
                'A car moves uniformly, accelerates or follows a schedule – the distance–time, velocity–time and acceleration–time graphs appear live, with slope triangles, the area under the graph and a stroboscope.',
              ),
              grades: [7, 10],
              kmk: ['P-E', 'P-K', 'P-S'],
              keywords: L(
                ['Bewegung', 'gleichförmige Bewegung', 'beschleunigte Bewegung', 't-s-Diagramm', 't-v-Diagramm', 't-a-Diagramm', 'Zeit-Ort-Diagramm', 'Geschwindigkeit', 'Beschleunigung', 'Bremsweg', 'Durchschnittsgeschwindigkeit', 'Steigungsdreieck'],
                ['motion', 'uniform motion', 'accelerated motion', 'distance–time graph', 'velocity–time graph', 'acceleration–time graph', 'velocity', 'acceleration', 'braking distance', 'average velocity', 'slope'],
              ),
              thumb: 'generic',
            },
            {
              id: 'freier-fall',
              status: 'ready',
              slug: L('freier-fall', 'free-fall'),
              title: L('Freier Fall', 'Free fall'),
              summary: L(
                'Stroboskopaufnahme einer fallenden Kugel auf Erde, Mond, Mars oder Jupiter, Kugel und Feder in der Fallröhre mit und ohne Luft und ein Reaktionstest mit fallendem Lineal.',
                'Stroboscopic picture of a falling ball on Earth, the Moon, Mars or Jupiter, a ball and a feather in a tube with and without air, and a reaction test with a falling ruler.',
              ),
              grades: [9, 10],
              kmk: ['P-E', 'P-S', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['freier Fall', 'Fallbeschleunigung', 'Ortsfaktor', 'Fallröhre', 'Vakuum', 'Luftwiderstand', 'Stroboskop', 'Fallgesetz', 'Reaktionszeit', 'Lineal', 'gleichmäßig beschleunigte Bewegung'],
                ['free fall', 'gravitational acceleration', 'feather', 'vacuum', 'air resistance', 'stroboscope', 'law of falling bodies', 'reaction time', 'ruler', 'uniformly accelerated motion'],
              ),
              thumb: 'generic',
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
                'Massestücke an eine Feder hängen, die Verlängerung messen und im F-s-Diagramm die Ursprungsgerade finden – mit Federn hintereinander und nebeneinander und der Elastizitätsgrenze.',
                'Hang weights on a spring, measure the extension and find the straight line through the origin in the force–extension graph – with springs in series and in parallel and the elastic limit.',
              ),
              grades: [7, 8],
              kmk: ['P-E', 'P-S', 'P-K', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Hookesches Gesetz', 'Feder', 'Federhärte', 'Federkonstante', 'Verlängerung', 'Kraft', 'Gewichtskraft', 'Proportionalität', 'Ursprungsgerade', 'Elastizitätsgrenze', 'Kraftmesser', 'Reihenschaltung', 'Parallelschaltung'],
                ['Hooke’s law', 'spring', 'spring constant', 'extension', 'force', 'weight', 'proportionality', 'elastic limit', 'spring balance', 'springs in series', 'springs in parallel'],
              ),
              thumb: 'generic',
            },
            {
              id: 'hebelgesetz',
              status: 'ready',
              slug: L('hebelgesetz', 'law-of-the-lever'),
              title: L('Hebelgesetz', 'Law of the lever'),
              summary: L(
                'Massestücke an einen Hebel mit Lochraster hängen, mit dem Kraftmesser ziehen – auch schräg – und Drehmomente vergleichen. Dazu Schubkarre, Flaschenöffner, Nussknacker und Wippe als Hebel im Alltag.',
                'Hang weights on a lever with holes, pull with a spring balance – also at an angle – and compare torques. Plus a wheelbarrow, a bottle opener, a nutcracker and a seesaw as everyday levers.',
              ),
              grades: [7, 8],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Energie'],
              keywords: L(
                ['Hebel', 'Hebelgesetz', 'Drehmoment', 'Kraftarm', 'Lastarm', 'Drehachse', 'einseitiger Hebel', 'zweiseitiger Hebel', 'Gleichgewicht', 'Kraftmesser', 'Schubkarre', 'Nussknacker', 'Flaschenöffner', 'Wippe', 'Goldene Regel der Mechanik', 'Kraftwandler'],
                ['lever', 'law of the lever', 'torque', 'moment', 'effort arm', 'load arm', 'pivot', 'fulcrum', 'equilibrium', 'spring balance', 'wheelbarrow', 'nutcracker', 'bottle opener', 'seesaw', 'golden rule of mechanics'],
              ),
              thumb: 'generic',
            },
            {
              id: 'kraefteaddition',
              status: 'ready',
              slug: L('kraefte-addieren-und-zerlegen', 'adding-and-resolving-forces'),
              title: L('Kräfte addieren und zerlegen', 'Adding and resolving forces'),
              summary: L(
                'Kraftpfeile am gemeinsamen Angriffspunkt ziehen und die Resultierende mit dem Kräfteparallelogramm oder durch Aneinanderhängen konstruieren, Kräfte zerlegen – und sehen, warum die Seilkraft bei einer flach gespannten Leine so groß wird.',
                'Drag force arrows acting at one point and construct the resultant with the parallelogram of forces or head to tail, resolve a force – and see why the tension in a nearly straight line becomes so large.',
              ),
              grades: [8, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Superposition'],
              keywords: L(
                ['Kraft', 'Vektor', 'Kräfteaddition', 'Kräftezerlegung', 'Kräfteparallelogramm', 'Kräftepolygon', 'Krafteck', 'Resultierende', 'Komponenten', 'Gleichgewicht', 'Gegenkraft', 'Seilkraft', 'Federwaage', 'Wäscheleine', 'Lampe'],
                ['force', 'vector', 'adding forces', 'resolving forces', 'parallelogram of forces', 'polygon of forces', 'resultant', 'components', 'equilibrium', 'tension', 'spring balance', 'clothesline'],
              ),
              thumb: 'generic',
            },
            {
              id: 'schiefe-ebene',
              status: 'ready',
              slug: L('schiefe-ebene', 'inclined-plane'),
              title: L('Schiefe Ebene', 'Inclined plane'),
              summary: L(
                'Klotz oder Wagen auf einer geneigten Ebene: Gewichtskraft in Hangabtriebs- und Normalkraft zerlegen, Haft- und Gleitreibung für verschiedene Materialpaare, Grenzwinkel finden, loslassen und mit dem Kraftmesser hochziehen – mit Diagramm F(α).',
                'A block or cart on an incline: resolve the weight into the downhill force and the normal force, explore static and kinetic friction for different materials, find the limiting angle, release the body or pull it up with a spring balance – with a graph F(α).',
              ),
              grades: [8, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung', 'P-BK-Superposition'],
              keywords: L(
                ['schiefe Ebene', 'Hangabtriebskraft', 'Normalkraft', 'Gewichtskraft', 'Kräftezerlegung', 'Reibung', 'Haftreibung', 'Gleitreibung', 'Reibungszahl', 'Grenzwinkel', 'Kraftmesser', 'Kraftwandler', 'Goldene Regel der Mechanik'],
                ['inclined plane', 'downhill force', 'normal force', 'weight', 'resolving forces', 'friction', 'static friction', 'kinetic friction', 'coefficient of friction', 'limiting angle', 'spring balance', 'golden rule of mechanics'],
              ),
              thumb: 'generic',
            },
          ],
        },
        {
          id: 'energie-impuls',
          title: L('Energie und Impuls', 'Energy and momentum'),
          grades: [9, 11],
          simulations: [
            {
              id: 'energieerhaltung',
              status: 'ready',
              slug: L('energieerhaltung-achterbahn', 'energy-roller-coaster'),
              title: L('Energieerhaltung (Achterbahn)', 'Conservation of energy (roller coaster)'),
              summary: L(
                'Ein Wagen rollt über Tal, Hügel oder Looping: Lage- und Bewegungsenergie wandeln sich um, mit Reibung entsteht innere Energie.',
                'A car rolls through a valley, hills or a loop: potential and kinetic energy convert into each other; friction produces internal energy.',
              ),
              grades: [9, 10],
              kmk: ['P-BK-Energie', 'P-S', 'P-E'],
              keywords: L(
                ['Energieerhaltung', 'Lageenergie', 'Bewegungsenergie', 'Höhenenergie', 'kinetische Energie', 'Reibung', 'Achterbahn', 'Looping', 'Energieumwandlung'],
                ['conservation of energy', 'potential energy', 'kinetic energy', 'friction', 'roller coaster', 'loop', 'energy conversion'],
              ),
              thumb: 'coaster',
            },
            {
              id: 'stoesse',
              status: 'ready',
              slug: L('elastische-und-unelastische-stoesse', 'elastic-and-inelastic-collisions'),
              title: L('Elastische und unelastische Stöße', 'Elastic and inelastic collisions'),
              summary: L(
                'Zwei Gleiter stoßen auf der Luftkissenbahn zusammen – elastisch, teilelastisch oder mit Klettband. Impuls- und Energiebilanz vorher und nachher, Schwerpunkt, t-v- und t-x-Diagramm.',
                'Two gliders collide on an air track – elastically, partially elastically or with Velcro. Momentum and energy balance before and after, centre of mass, velocity–time and position–time graphs.',
              ),
              grades: [10, 11],
              kmk: ['P-BK-Erhaltung', 'P-BK-Energie', 'P-E', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Stoß', 'elastischer Stoß', 'unelastischer Stoß', 'teilelastischer Stoß', 'Impuls', 'Impulserhaltung', 'Impulserhaltungssatz', 'Energieerhaltung', 'Bewegungsenergie', 'innere Energie', 'Stoßzahl', 'Schwerpunkt', 'Schwerpunktsgeschwindigkeit', 'Luftkissenbahn', 'Gleiter', 'Klettband'],
                ['collision', 'elastic collision', 'inelastic collision', 'partially elastic collision', 'momentum', 'conservation of momentum', 'conservation of energy', 'kinetic energy', 'internal energy', 'coefficient of restitution', 'centre of mass', 'air track', 'glider', 'Velcro'],
              ),
              thumb: 'generic',
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
                'Ball mit v₀ unter dem Winkel α werfen – auf Erde, Mond oder Mars, mit oder ohne Luftwiderstand. Mit Bahn, Stroboskop und Geschwindigkeitsvektoren.',
                'Throw a ball with v₀ at angle α – on Earth, the Moon or Mars, with or without air resistance. With trajectory, stroboscope and velocity vectors.',
              ),
              grades: [10, 11],
              kmk: ['P-E', 'P-BK-Superposition', 'P-BK-Mathematisieren'],
              keywords: L(
                ['Wurf', 'schiefer Wurf', 'waagerechter Wurf', 'Wurfparabel', 'Wurfweite', 'Steighöhe', 'Superposition', 'Luftwiderstand', 'Fallbeschleunigung'],
                ['projectile', 'oblique throw', 'horizontal throw', 'trajectory', 'range', 'maximum height', 'superposition', 'air resistance', 'gravitational acceleration'],
              ),
              thumb: 'projectile',
            },
          ],
        },
        {
          id: 'kreisbewegung-gravitation',
          title: L('Kreisbewegung und Gravitation', 'Circular motion and gravitation'),
          grades: [10, 13],
          simulations: [
            planned('kreisbewegung', L('Kreisbewegung und Zentripetalkraft', 'Circular motion and centripetal force'), [10, 11]),
            planned('planetenbahnen', L('Planetenbahnen und Keplersche Gesetze', 'Planetary orbits and Kepler’s laws'), [11, 13], { uni: true }),
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
                'Pendel auslenken und loslassen: Periodendauer messen, mit 2π√(l/g) vergleichen, Energie, Dämpfung und große Auslenkungen untersuchen.',
                'Pull the pendulum aside and release it: measure the period, compare it with 2π√(l/g) and explore energy, damping and large amplitudes.',
              ),
              grades: [10, 12],
              kmk: ['P-E', 'P-BK-Mathematisieren', 'P-BK-Energie'],
              keywords: L(
                ['Pendel', 'Fadenpendel', 'Schwingung', 'Periodendauer', 'Frequenz', 'Amplitude', 'Kleinwinkelnäherung', 'harmonische Schwingung', 'Dämpfung'],
                ['pendulum', 'oscillation', 'period', 'frequency', 'amplitude', 'small-angle approximation', 'harmonic motion', 'damping'],
              ),
              thumb: 'pendulum',
            },
            planned('federpendel', L('Federpendel', 'Spring pendulum'), [10, 12]),
            planned('resonanz', L('Erzwungene Schwingung und Resonanz', 'Driven oscillation and resonance'), [11, 13], { uni: true }),
          ],
        },
        {
          id: 'wellen',
          title: L('Wellen', 'Waves'),
          grades: [10, 13],
          simulations: [
            planned('wellen-ausbreitung', L('Transversal- und Longitudinalwellen', 'Transverse and longitudinal waves'), [10, 12]),
            planned('doppler-effekt', L('Doppler-Effekt', 'Doppler effect'), [10, 12]),
            planned('interferenz', L('Interferenz zweier Kreiswellen', 'Interference of two circular waves'), [11, 13], { kmk: ['P-BK-Superposition'] }),
            planned('stehende-wellen', L('Stehende Wellen', 'Standing waves'), [11, 13]),
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
      grades: [7, 13],
      kmk: ['P-S', 'P-E', 'P-BK-System', 'P-BK-Wechselwirkung'],
      topics: [
        {
          id: 'stromkreise',
          title: L('Stromkreise', 'Circuits'),
          grades: [7, 9],
          simulations: [
            {
              id: 'einfacher-stromkreis',
              status: 'ready',
              slug: L('einfacher-stromkreis', 'simple-circuit'),
              title: L('Einfacher Stromkreis', 'Simple circuit'),
              summary: L(
                'Batterie, Schalter und Lampe als Aufbau und als Schaltplan: Im geschlossenen Kreis fließen sichtbar Elektronen. Dazu Kurzschluss, Sicherung und ein Leitertest.',
                'A battery, a switch and a bulb as a set-up and as a circuit diagram: electrons visibly flow in the closed circuit. Plus short circuit, fuse and a conductor test.',
              ),
              grades: [7, 8],
              kmk: ['P-S', 'P-E', 'P-K', 'P-BK-System'],
              keywords: L(
                ['Stromkreis', 'geschlossener Stromkreis', 'offener Stromkreis', 'Schalter', 'Glühlampe', 'Batterie', 'Elektronen', 'technische Stromrichtung', 'Schaltplan', 'Schaltzeichen', 'Kurzschluss', 'Sicherung', 'Leiter', 'Nichtleiter', 'Isolator'],
                ['electric circuit', 'closed circuit', 'open circuit', 'switch', 'light bulb', 'battery', 'electrons', 'conventional current', 'circuit diagram', 'circuit symbols', 'short circuit', 'fuse', 'conductor', 'insulator'],
              ),
              thumb: 'generic',
            },
            {
              id: 'ohmsches-gesetz',
              status: 'ready',
              slug: L('ohmsches-gesetz', 'ohms-law'),
              title: L('Ohmsches Gesetz', 'Ohm’s law'),
              summary: L(
                'Spannung am Netzgerät einstellen, Stromstärke und Spannung an Zeigerinstrumenten ablesen und die Kennlinie aufnehmen: Ursprungsgerade beim Widerstand und Konstantandraht, gekrümmte Kennlinie bei der Glühlampe.',
                'Set the voltage, read current and voltage on analogue meters and record the characteristic: a straight line through the origin for a resistor and a constantan wire, a curved one for a light bulb.',
              ),
              grades: [8, 9],
              kmk: ['P-E', 'P-K', 'P-S', 'P-BK-System'],
              keywords: L(
                ['Ohmsches Gesetz', 'Widerstand', 'Kennlinie', 'I-U-Diagramm', 'U-I-Diagramm', 'Stromstärke', 'Spannung', 'Amperemeter', 'Voltmeter', 'Glühlampe', 'Konstantan', 'spezifischer Widerstand', 'Ursprungsgerade', 'Proportionalität'],
                ['Ohm’s law', 'resistance', 'characteristic', 'current–voltage graph', 'current', 'voltage', 'ammeter', 'voltmeter', 'light bulb', 'constantan', 'resistivity', 'proportionality'],
              ),
              thumb: 'generic',
            },
            {
              id: 'reihe-parallel',
              status: 'ready',
              slug: L('reihen-und-parallelschaltung', 'series-and-parallel-circuits'),
              title: L('Reihen- und Parallelschaltung', 'Series and parallel circuits'),
              summary: L(
                'Zwei oder drei Lampen in Reihe, parallel oder gemischt: Strom- und Spannungsmesser an beliebige Stellen setzen, Lampen herausdrehen und die Gesetze für Stromstärke, Spannung und Ersatzwiderstand entdecken.',
                'Two or three bulbs in series, in parallel or mixed: place ammeters and voltmeters anywhere, unscrew bulbs and discover the rules for current, voltage and equivalent resistance.',
              ),
              grades: [8, 9],
              kmk: ['P-BK-System', 'P-E', 'P-S'],
              keywords: L(
                ['Reihenschaltung', 'Parallelschaltung', 'gemischte Schaltung', 'Ersatzwiderstand', 'Gesamtwiderstand', 'Knotenregel', 'Maschenregel', 'Spannungsteiler', 'Stromstärke', 'Spannung', 'Glühlampe', 'Kirchhoff', 'Verzweigung'],
                ['series circuit', 'parallel circuit', 'mixed circuit', 'equivalent resistance', 'total resistance', 'junction rule', 'loop rule', 'voltage divider', 'current', 'voltage', 'light bulb', 'Kirchhoff'],
              ),
              thumb: 'generic',
            },
          ],
        },
        {
          id: 'felder',
          title: L('Elektrische und magnetische Felder', 'Electric and magnetic fields'),
          grades: [11, 13],
          simulations: [
            planned('feldlinien', L('Feldlinien von Punktladungen', 'Field lines of point charges'), [11, 12]),
            planned('kondensator', L('Lade- und Entladekurve des Kondensators', 'Charging and discharging a capacitor'), [11, 12], { kmk: ['P-BK-Mathematisieren'] }),
            planned('lorentzkraft', L('Lorentzkraft und Fadenstrahlrohr', 'Lorentz force and fine-beam tube'), [11, 13]),
            planned('induktion', L('Elektromagnetische Induktion', 'Electromagnetic induction'), [11, 13]),
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
                'Lampe, Scheibe und Schirm auf der optischen Bank verschieben: Randstrahlen zeigen, wie Kern- und Halbschatten entstehen – mit punktförmiger, ausgedehnter oder zwei farbigen Lampen. Dazu Sonnen- und Mondfinsternis im Modell.',
                'Move a lamp, a disc and a screen on the optical bench: edge rays show how umbra and penumbra form – with a point-like, an extended or two coloured lamps. Plus solar and lunar eclipses in a model.',
              ),
              grades: [6, 7],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Licht', 'Schatten', 'Kernschatten', 'Halbschatten', 'Randstrahl', 'Lichtquelle', 'punktförmig', 'geradlinige Ausbreitung', 'farbige Schatten', 'Sonnenfinsternis', 'Mondfinsternis', 'Mondphasen'],
                ['light', 'shadow', 'umbra', 'penumbra', 'edge ray', 'light source', 'point source', 'rectilinear propagation', 'coloured shadows', 'solar eclipse', 'lunar eclipse', 'moon phases'],
              ),
              thumb: 'generic',
            },
            {
              id: 'reflexion',
              status: 'ready',
              slug: L('reflexion-ebener-spiegel', 'reflection-plane-mirror'),
              title: L('Reflexion am ebenen Spiegel', 'Reflection at a plane mirror'),
              summary: L(
                'Laser auf der optischen Scheibe drehen und das Reflexionsgesetz messen, das Spiegelbild einer Kerze mit Sehstrahlen konstruieren und im Winkelspiegel Mehrfachbilder zählen.',
                'Turn a laser on the optical disc and measure the law of reflection, construct the image of a candle with lines of sight and count multiple images in two angled mirrors.',
              ),
              grades: [6, 8],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Reflexion', 'Reflexionsgesetz', 'Spiegel', 'Einfallswinkel', 'Reflexionswinkel', 'Lot', 'Spiegelbild', 'virtuelles Bild', 'Sehstrahl', 'Winkelspiegel', 'Mehrfachbilder', 'Kaleidoskop'],
                ['reflection', 'law of reflection', 'mirror', 'angle of incidence', 'angle of reflection', 'normal', 'mirror image', 'virtual image', 'line of sight', 'angled mirrors', 'multiple images', 'kaleidoscope'],
              ),
              thumb: 'generic',
            },
            {
              id: 'brechung',
              status: 'ready',
              slug: L('brechung-totalreflexion', 'refraction'),
              title: L('Brechung und Totalreflexion', 'Refraction and total internal reflection'),
              summary: L(
                'Laser auf der optischen Scheibe drehen: Einfalls- und Brechungswinkel ablesen, Brechungsgesetz prüfen und den Grenzwinkel der Totalreflexion finden.',
                'Turn a laser on the optical disc: read angles of incidence and refraction, check the law of refraction and find the critical angle.',
              ),
              grades: [8, 10],
              kmk: ['P-E', 'P-S', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Brechung', 'Brechungsgesetz', 'Snellius', 'Totalreflexion', 'Grenzwinkel', 'Brechungsindex', 'Lot', 'Einfallswinkel', 'optisch dichter'],
                ['refraction', 'Snell’s law', 'total internal reflection', 'critical angle', 'refractive index', 'normal', 'angle of incidence'],
              ),
              thumb: 'refraction',
            },
            {
              id: 'linsen',
              status: 'ready',
              slug: L('linsen-bildentstehung', 'lenses-image-formation'),
              title: L('Linsen und Bildentstehung', 'Lenses and image formation'),
              summary: L(
                'Gegenstand vor einer Sammel- oder Zerstreuungslinse ziehen und das Bild mit Parallel-, Mittelpunkt- und Brennpunktstrahl konstruieren – mit Linsengleichung, Abbildungsmaßstab und Anwendungen. Auf der optischen Bank das Kerzenbild auf dem Schirm scharf stellen.',
                'Drag an object in front of a converging or diverging lens and construct the image with parallel, central and focal rays – with the lens equation, magnification and applications. Focus the image of a candle on a screen on the optical bench.',
              ),
              grades: [8, 10],
              kmk: ['P-S', 'P-E', 'P-BK-Wechselwirkung'],
              keywords: L(
                ['Linse', 'Sammellinse', 'Zerstreuungslinse', 'Brennweite', 'Brennpunkt', 'Parallelstrahl', 'Mittelpunktstrahl', 'Brennpunktstrahl', 'Linsengleichung', 'Abbildungsmaßstab', 'reelles Bild', 'virtuelles Bild', 'Lupe', 'Projektor', 'Kamera', 'Auge', 'Blende', 'Schärfentiefe'],
                ['lens', 'converging lens', 'diverging lens', 'focal length', 'focal point', 'parallel ray', 'central ray', 'focal ray', 'lens equation', 'magnification', 'real image', 'virtual image', 'magnifying glass', 'projector', 'camera', 'eye', 'aperture', 'depth of field'],
              ),
              thumb: 'generic',
            },
          ],
        },
        {
          id: 'wellenoptik',
          title: L('Wellenoptik', 'Wave optics'),
          grades: [11, 13],
          simulations: [planned('doppelspalt', L('Doppelspalt und Gitter', 'Double slit and grating'), [11, 13], { kmk: ['P-BK-Superposition'] })],
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
      grades: [7, 13],
      kmk: ['P-S', 'P-BK-Materie', 'P-BK-Energie'],
      topics: [
        {
          id: 'teilchenmodell',
          title: L('Teilchenmodell', 'Particle model'),
          grades: [7, 8],
          simulations: [planned('teilchenmodell', L('Teilchenmodell und Temperatur', 'Particle model and temperature'), [7, 8], { kmk: ['P-BK-Materie'] })],
        },
        {
          id: 'gase',
          title: L('Gase', 'Gases'),
          grades: [9, 13],
          simulations: [planned('gasgesetze', L('Gasgesetze', 'Gas laws'), [9, 13], { uni: true })],
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
          simulations: [planned('radioaktiver-zerfall', L('Radioaktiver Zerfall und Halbwertszeit', 'Radioactive decay and half-life'), [9, 12], { kmk: ['P-BK-Zufall', 'P-BK-Mathematisieren'] })],
        },
        {
          id: 'quanten',
          title: L('Quantenphysik', 'Quantum physics'),
          grades: [12, 14],
          simulations: [
            planned('photoeffekt', L('Photoeffekt', 'Photoelectric effect'), [12, 13]),
            planned('linienspektren', L('Atommodelle und Linienspektren', 'Atomic models and line spectra'), [12, 13]),
            planned('elektronenbeugung', L('Elektronenbeugung', 'Electron diffraction'), [12, 14], { uni: true }),
          ],
        },
      ],
    },
  ],
};
