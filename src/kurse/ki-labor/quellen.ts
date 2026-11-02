import type { Localized } from '../../i18n/config';

/**
 * Quellen der Wissenskarten im KI-Labor (Originalarbeiten). Für Lehrkräfte
 * und Neugierige; die Kartentexte selbst sind eigene Zusammenfassungen.
 */
export const SOURCES: Record<string, string | Localized> = {
  imitationsspiel: 'Turing, A. M. (1950). Computing Machinery and Intelligence. Mind 59(236), 433–460.',
  eliza: 'Weizenbaum, J. (1966). ELIZA – a computer program for the study of natural language communication between man and machine. Communications of the ACM 9(1), 36–45.',
  expertensystem: 'Shortliffe, E. H. (1976). Computer-Based Medical Consultations: MYCIN. New York: Elsevier.',
  wegsuche: 'Hart, P. E., Nilsson, N. J. & Raphael, B. (1968). A formal basis for the heuristic determination of minimum cost paths. IEEE Transactions on Systems Science and Cybernetics 4(2), 100–107.',
  minimax: 'Campbell, M., Hoane, A. J. & Hsu, F. (2002). Deep Blue. Artificial Intelligence 134(1–2), 57–83; Knuth, D. E. & Moore, R. W. (1975). An analysis of alpha-beta pruning. Artificial Intelligence 6(4), 293–326.',
  'monte-carlo': 'Silver, D. et al. (2016). Mastering the game of Go with deep neural networks and tree search. Nature 529, 484–489; Kocsis, L. & Szepesvári, C. (2006). Bandit based Monte-Carlo planning. ECML 2006, 282–293.',
  regression: 'Legendre, A.-M. (1805). Nouvelles méthodes pour la détermination des orbites des comètes. Paris: Courcier.',
  gradient: 'Cauchy, A. (1847). Méthode générale pour la résolution des systèmes d’équations simultanées. Comptes rendus de l’Académie des sciences 25, 536–538.',
  ueberanpassung: 'Stone, M. (1974). Cross-validatory choice and assessment of statistical predictions. Journal of the Royal Statistical Society B 36(2), 111–147.',
  bayes: 'Bayes, T. (1763). An essay towards solving a problem in the doctrine of chances. Philosophical Transactions of the Royal Society 53, 370–418.',
  entscheidungsbaum: 'Quinlan, J. R. (1986). Induction of decision trees. Machine Learning 1(1), 81–106.',
  logikneuron: 'McCulloch, W. S. & Pitts, W. (1943). A logical calculus of the ideas immanent in nervous activity. Bulletin of Mathematical Biophysics 5, 115–133.',
  perzeptron: 'Rosenblatt, F. (1958). The perceptron: a probabilistic model for information storage and organization in the brain. Psychological Review 65(6), 386–408.',
  'ki-winter': 'Minsky, M. & Papert, S. (1969). Perceptrons: An Introduction to Computational Geometry. Cambridge, MA: MIT Press.',
  'xor-netz': 'Rumelhart, D. E., Hinton, G. E. & Williams, R. J. (1986). Learning representations by back-propagating errors. Nature 323, 533–536.',
  backprop: { de: 'Linnainmaa, S. (1970). Masterarbeit, Universität Helsinki (Rückwärtsmodus der automatischen Differentiation); veröffentlicht als: Linnainmaa, S. (1976). Taylor expansion of the accumulated rounding error. BIT 16, 146–160.', en: 'Linnainmaa, S. (1970). Master’s thesis, University of Helsinki (reverse-mode automatic differentiation); published as: Linnainmaa, S. (1976). Taylor expansion of the accumulated rounding error. BIT 16, 146–160.' },
  spielplatz: 'Cybenko, G. (1989). Approximation by superpositions of a sigmoidal function. Mathematics of Control, Signals and Systems 2(4), 303–314; Hornik, K., Stinchcombe, M. & White, H. (1989). Neural Networks 2(5), 359–366.',
  faltung: 'Hubel, D. H. & Wiesel, T. N. (1959). Receptive fields of single neurones in the cat’s striate cortex. Journal of Physiology 148(3), 574–591.',
  imagenet: 'Krizhevsky, A., Sutskever, I. & Hinton, G. E. (2012). ImageNet classification with deep convolutional neural networks. NeurIPS 25, 1097–1105.',
  taeuschung: 'Szegedy, C. et al. (2013). Intriguing properties of neural networks. arXiv:1312.6199; Goodfellow, I., Shlens, J. & Szegedy, C. (2015). Explaining and harnessing adversarial examples. ICLR 2015.',
  tokens: 'Sennrich, R., Haddow, B. & Birch, A. (2016). Neural machine translation of rare words with subword units. ACL 2016, 1715–1725.',
  einbettungen: 'Mikolov, T., Chen, K., Corrado, G. & Dean, J. (2013). Efficient estimation of word representations in vector space. arXiv:1301.3781.',
  sprachmodell: 'Shannon, C. E. (1948). A mathematical theory of communication. Bell System Technical Journal 27, 379–423, 623–656.',
  aufmerksamkeit: 'Vaswani, A. et al. (2017). Attention is all you need. NeurIPS 30, 5998–6008.',
  assistent: 'Ouyang, L. et al. (2022). Training language models to follow instructions with human feedback. NeurIPS 35; Christiano, P. et al. (2017). Deep reinforcement learning from human preferences. NeurIPS 30.',
  banditen: 'Robbins, H. (1952). Some aspects of the sequential design of experiments. Bulletin of the American Mathematical Society 58(5), 527–535.',
  'q-lernen': 'Watkins, C. J. C. H. (1989). Learning from Delayed Rewards. PhD thesis, University of Cambridge; Watkins, C. J. C. H. & Dayan, P. (1992). Q-learning. Machine Learning 8, 279–292.',
  diffusion: 'Ho, J., Jain, A. & Abbeel, P. (2020). Denoising diffusion probabilistic models. NeurIPS 33, 6840–6851; Sohl-Dickstein, J. et al. (2015). Deep unsupervised learning using nonequilibrium thermodynamics. ICML 2015.',
  fairness: 'Angwin, J., Larson, J., Mattu, S. & Kirchner, L. (2016). Machine Bias. ProPublica (2016); Kleinberg, J., Mullainathan, S. & Raghavan, M. (2017). Inherent trade-offs in the fair determination of risk scores. ITCS 2017; Chouldechova, A. (2017). Big Data 5(2), 153–163.',
  'ai-act': { de: 'Verordnung (EU) 2024/1689 (KI-Verordnung, „AI Act“), Amtsblatt der EU vom 12. Juli 2024, in Kraft seit 1. August 2024.', en: 'Regulation (EU) 2024/1689 (Artificial Intelligence Act), Official Journal of the EU, 12 July 2024, in force since 1 August 2024.' },
};
