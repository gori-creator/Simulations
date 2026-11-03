import type { Localized } from '../../i18n/config';

/**
 * Quellen der Wissenskarten im KI-Abenteuer (Originalarbeit oder offizielle
 * Quelle zum Meilenstein). Für Lehrkräfte und Neugierige; die Kartentexte
 * selbst sind eigene, vereinfachte Zusammenfassungen.
 */
export const SOURCES: Record<string, string | Localized> = {
  'hallo-bit': 'McCarthy, J., Minsky, M. L., Rochester, N. & Shannon, C. E. (1955). A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence. Nachdruck: AI Magazine 27(4), 2006, 12–14.',
  'ki-im-alltag': { de: 'Apple: Vorstellung des iPhone 4S mit dem Sprachassistenten Siri, 4. Oktober 2011.', en: 'Apple: launch of the iPhone 4S with the voice assistant Siri, 4 October 2011.' },
  'aus-beispielen': 'Fix, E. & Hodges, J. L. (1951). Discriminatory Analysis. Nonparametric Discrimination: Consistency Properties. Report 4, USAF School of Aviation Medicine, Randolph Field, Texas.',
  'mensch-oder-maschine': 'Turing, A. M. (1950). Computing Machinery and Intelligence. Mind 59(236), 433–460.',
  'erster-chatbot': 'Weizenbaum, J. (1966). ELIZA – a computer program for the study of natural language communication between man and machine. Communications of the ACM 9(1), 36–45.',
  vorausdenken: 'Campbell, M., Hoane, A. J. & Hsu, F. (2002). Deep Blue. Artificial Intelligence 134(1–2), 57–83.',
  merkmale: 'Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems. Annals of Eugenics 7(2), 179–188.',
  grenze: 'Cortes, C. & Vapnik, V. (1995). Support-vector networks. Machine Learning 20(3), 273–297.',
  aufraeumen: 'Northcutt, C. G., Athalye, A. & Mueller, J. (2021). Pervasive label errors in test sets destabilize machine learning benchmarks. NeurIPS 2021, Datasets and Benchmarks Track.',
  nachbarn: 'Cover, T. & Hart, P. (1967). Nearest neighbor pattern classification. IEEE Transactions on Information Theory 13(1), 21–27.',
  fragenbaum: 'Quinlan, J. R. (1986). Induction of decision trees. Machine Learning 1(1), 81–106.',
  'gruppen-finden': 'MacQueen, J. (1967). Some methods for classification and analysis of multivariate observations. Proceedings of the 5th Berkeley Symposium on Mathematical Statistics and Probability 1, 281–297.',
  'ueben-pruefen': 'Stone, M. (1974). Cross-validatory choice and assessment of statistical predictions. Journal of the Royal Statistical Society B 36(2), 111–147.',
  steckbrief: 'Mitchell, M. et al. (2019). Model cards for model reporting. Proceedings of FAT* 2019, 220–229.',
  neuron: 'McCulloch, W. S. & Pitts, W. (1943). A logical calculus of the ideas immanent in nervous activity. Bulletin of Mathematical Biophysics 5, 115–133.',
  'neuron-lernt': 'Rosenblatt, F. (1958). The perceptron: a probabilistic model for information storage and organization in the brain. Psychological Review 65(6), 386–408.',
  bergab: 'Cauchy, A. (1847). Méthode générale pour la résolution des systèmes d’équations simultanées. Comptes rendus de l’Académie des sciences 25, 536–538.',
  'team-neuronen': 'Rumelhart, D. E., Hinton, G. E. & Williams, R. J. (1986). Learning representations by back-propagating errors. Nature 323, 533–536.',
  pixel: 'Kirsch, R. A., Cahn, L., Ray, C. & Urban, G. H. (1957). Experiments in processing pictorial information with a digital computer. Proceedings of the Eastern Joint Computer Conference, 221–229.',
  zeichen: 'LeCun, Y. et al. (1989). Backpropagation applied to handwritten zip code recognition. Neural Computation 1(4), 541–551.',
  'naechstes-wort': 'Shannon, C. E. (1948). A mathematical theory of communication. Bell System Technical Journal 27, 379–423, 623–656.',
  'woerter-karte': 'Mikolov, T., Chen, K., Corrado, G. & Dean, J. (2013). Efficient estimation of word representations in vector space. arXiv:1301.3781.',
  eisdiele: 'Robbins, H. (1952). Some aspects of the sequential design of experiments. Bulletin of the American Mathematical Society 58(5), 527–535.',
  labyrinth: 'Silver, D. et al. (2016). Mastering the game of Go with deep neural networks and tree search. Nature 529, 484–489.',
  streichhoelzer: 'Michie, D. (1961). Trial and error. Science Survey, Part 2, 129–145; Michie, D. (1963). Experiments on the mechanization of game-learning. Part I. The Computer Journal 6(3), 232–236.',
  'chatbot-bauen': 'Ouyang, L. et al. (2022). Training language models to follow instructions with human feedback. NeurIPS 35; OpenAI (2022). Introducing ChatGPT (blog post).',
  'bilder-aus-rauschen': 'Ramesh, A. et al. (2022). Hierarchical text-conditional image generation with CLIP latents. arXiv:2204.06125; Rombach, R. et al. (2022). High-resolution image synthesis with latent diffusion models. CVPR 2022, 10684–10695.',
  'echt-oder-fake': { de: 'Mit Midjourney erzeugtes Bild, zuerst am 24. März 2023 im Forum Reddit veröffentlicht; Berichte u. a. NBC News, 27. März 2023: „AI-generated images of Pope Francis in puffer jacket fool the internet“.', en: 'Image made with Midjourney, first posted on Reddit on 24 March 2023; reports include NBC News, 27 March 2023: “AI-generated images of Pope Francis in puffer jacket fool the internet”.' },
  fair: 'Buolamwini, J. & Gebru, T. (2018). Gender Shades: Intersectional accuracy disparities in commercial gender classification. Proceedings of Machine Learning Research 81, 77–91.',
  'mein-feed': 'Bennett, J. & Lanning, S. (2007). The Netflix Prize. Proceedings of KDD Cup and Workshop 2007.',
  'stimmt-das': 'Mata v. Avianca, Inc., 678 F. Supp. 3d 443 (S.D.N.Y. 2023).',
  'meine-daten': { de: 'Verordnung (EU) 2016/679 (Datenschutz-Grundverordnung, DSGVO), anwendbar seit 25. Mai 2018.', en: 'Regulation (EU) 2016/679 (General Data Protection Regulation, GDPR), applicable since 25 May 2018.' },
  energie: 'International Energy Agency (2025). Energy and AI. Paris: IEA; Google (2025). Measuring the environmental impact of delivering AI at Google scale (technical paper); Patterson, D. et al. (2021). Carbon emissions and large neural network training. arXiv:2104.10350.',
  'schlau-nutzen': { de: 'Verordnung (EU) 2024/1689 (KI-Verordnung, „AI Act“), Amtsblatt der EU vom 12. Juli 2024.', en: 'Regulation (EU) 2024/1689 (Artificial Intelligence Act), Official Journal of the EU, 12 July 2024.' },
};
