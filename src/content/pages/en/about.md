---
title: About the project
description: An open, free project for interactive simulations in STEM education.
---

## The idea

Mathematics and physics are best understood by trying things out: change a parameter and immediately see what happens. This project builds a growing collection of interactive simulations – **following the curriculum**, **free of charge** and **without barriers** for schools.

## Principles

- **Free and ad-free** – permanently.
- **No sign-up, no tracking** – privacy-friendly and simple to use in schools.
- **Sound content and good teaching** – with explanations, exercises and notes for teachers.
- **Any device** – from phones to interactive whiteboards.
- **Bilingual** – German first, English step by step.
- **Open source and OER** – code, texts and images are openly licensed. Anyone can check, improve and contribute their own simulations: [Contribute](../contribute/).

## Roadmap

Already there:

- **Secondary school mathematics and physics** – 182 simulations along the German educational standards, each with learning material and exercises.
- **State curricula** – mapping to the Gymnasium curricula of 14 German states; choose your state via the federal state button at the top.
- **Learning game** – the [Number Factory](../number-factory/) for grades 5–9.

Next:

1. **Chemistry.**
2. **More curricula** – Thuringia, Mecklenburg-Western Pomerania and other school types.
3. **University** – advanced simulations, e.g. Fourier series, differential equations and linear algebra.
4. **Community simulations** – see [Contribute](../contribute/).

## Technology

The site is a static website built with [Astro](https://astro.build). Simulations are written in TypeScript and drawn on an HTML canvas; formulas are typeset with KaTeX at build time. No external servers, fonts or scripts are loaded.

## Images

The photos in the simulations (objects, backgrounds, instruments) are generated with AI. They show no real people and no brands. Everything else – diagrams, arrows, labels and the preview images – is drawn within the project. If a photo is missing, the simulation draws its own graphic.

## Feedback

Feedback, bug reports and ideas are always welcome – simply use the [contact form](../contact/).

## Rights

The program code is licensed under the MIT licence; texts, exercises and images under CC BY-SA 4.0. You may use everything in class, put it on worksheets, adapt and share it – with the credit “Scitura (scitura.de), CC BY-SA 4.0”. The name and logo “Scitura” are excluded. The source code is on [GitHub](https://github.com/gori-creator/Simulations).

Third-party software: [KaTeX](https://katex.org) (formula typesetting), [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (QR codes) and [Astro](https://astro.build) (site generator), each under the MIT licence. The licence texts are in [lizenzen.txt](../../lizenzen.txt).
