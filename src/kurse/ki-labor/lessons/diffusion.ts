import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Diffusionsmodelle lernen, Rauschen schrittweise zu entfernen. Rückwärts angewendet wird aus reinem Rauschen ein neues Bild.', 'Diffusion models learn to remove noise step by step. Applied backwards, pure noise turns into a new picture.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Bildgeneratoren arbeiten rückwärts: Im Training lernt ein Netz, aus verrauschten Bildern das Rauschen herauszurechnen. Zum Erzeugen startet man mit reinem Rauschen und entrauscht Schritt für Schritt.', 'Image generators work backwards: in training a network learns to remove the noise from noisy images. To generate, you start with pure noise and denoise step by step.') },
    {
      kind: 'info',
      title: L('Vorwärts und rückwärts', 'Forward and backward'),
      text: L(
        'Vorwärts wird einem Bild x₀ in T Schritten immer mehr Gauß-Rauschen beigemischt, bis nichts mehr zu erkennen ist. Ein Netz lernt, aus xₜ das ursprüngliche Bild (oder das Rauschen) zu schätzen. Rückwärts nutzt man diese Schätzung, um von xₜ nach xₜ₋₁ zu gehen. Ein Text-„Prompt“ steuert, wohin das Entrauschen führt.',
        'Forward, more and more Gaussian noise is mixed into an image x₀ over T steps until nothing can be recognised. A network learns to estimate the original image (or the noise) from xₜ. Backward, this estimate is used to go from xₜ to xₜ₋₁. A text “prompt” steers where the denoising leads.',
      ),
      formula: 'xₜ = √ᾱₜ · x₀ + √(1 − ᾱₜ) · ε,   ε ~ N(0, 1)',
    },
    { kind: 'game', game: 'diffusion', intro: L('Mische erst Rauschen in ein Bild, dann erzeuge Bilder aus reinem Rauschen – mit und ohne Prompt.', 'First mix noise into an image, then generate images from pure noise – with and without a prompt.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Neu oder kopiert?', 'New or copied?'),
      text: L(
        'Unser Entrauscher kennt nur vier Bilder und erzeugt deshalb genau diese. Echte Modelle haben Milliarden Bilder gesehen und setzen daraus Neues zusammen. Ganz frei vom Kopieren sind sie aber nicht: 2023 gelang es Forschenden, aus einem Bildgenerator einzelne Trainingsbilder fast unverändert wieder herauszuholen. Wessen Bilder in den Trainingsdaten stecken und ob das erlaubt ist, wird vor Gericht verhandelt.',
        'Our denoiser only knows four images and therefore produces exactly those. Real models have seen billions of images and combine them into something new. But they aren’t completely free of copying: in 2023 researchers managed to extract individual training images almost unchanged from an image generator. Whose images are in the training data and whether that is allowed is being argued in court.',
      ),
    },
    {
      kind: 'choice',
      question: L('Ein Foto zeigt eine Politikerin bei etwas, das nie geschah. Was hilft am meisten?', 'A photo shows a politician doing something that never happened. What helps most?'),
      options: [
        { text: L('Quelle und Zusammenhang prüfen: Wer hat es zuerst veröffentlicht? Berichten seriöse Medien darüber?', 'Check source and context: who published it first? Do reputable media report it?'), correct: true, feedback: L('Genau. Bildfehler werden seltener – Quellen prüfen bleibt.', 'Exactly. Image glitches are getting rarer – checking sources stays.') },
        { text: L('Auf sechs Finger achten – dann erkennt man es immer.', 'Look for six fingers – then you can always tell.'), feedback: L('Solche Fehler gab es früher; neue Generatoren machen sie kaum noch.', 'Such errors used to happen; new generators hardly make them any more.') },
        { text: L('Gar nichts, Fotos lügen nicht.', 'Nothing, photos don’t lie.'), feedback: L('Genau das stimmt nicht mehr.', 'That’s exactly what is no longer true.') },
      ],
      explain: L('Der AI Act verlangt, dass künstlich erzeugte oder veränderte Bilder, Töne und Videos als solche gekennzeichnet werden.', 'The AI Act requires artificially generated or manipulated images, audio and video to be labelled as such.'),
    },
    { kind: 'say', mood: 'wink', text: L('Erzeugen ist das eine. Noch heikler wird es, wenn KI über Menschen entscheidet – etwa über Kredite. Wann ist das fair?', 'Generating is one thing. It gets even trickier when AI decides about people – for example about loans. When is that fair?') },
  ],
};

export default lesson;
