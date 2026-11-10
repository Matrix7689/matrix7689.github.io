---
# Facts from Jay's brief only (docs/reports/antariksh-project.md); summary is (proposed). Date: December 2020, per Jay (some videos were uploaded later, in May 2021).
title: Antariksh Mobile Game
summary: "Antariksh: A Space Odyssey, a Unity game for Android with three mission types on each of four planets, built by a team of 7."
year: 2020
stack: [Unity, C#]
context: CSCI 526, USC · team of 7 · Android
# No public GitHub repo (Jay). Planet names and the playlist link confirmed by Jay.
links:
  more:
    - label: demo video
      url: https://www.youtube.com/watch?v=LiD0nzbBMu4
    - label: trailer
      url: https://www.youtube.com/watch?v=qahiBIzYVQ8
    - label: gameplay video
      url: https://www.youtube.com/watch?v=CPLfDAcMwsI
    - label: team site
      url: https://antariksh-site.netlify.app/
    - label: weekly progress
      url: https://youtube.com/playlist?list=PLLc9a_xp6wro
# Screenshots: Jay's stills from the gameplay video, converted to JPEG sources (max 1920 px, q82).
# Alt text describes only what is visible in each frame.
cover: ../../assets/projects/antariksh-mobile-game/cover.jpg
gallery:
  - src: ../../assets/projects/antariksh-mobile-game/02.jpg
    alt: "A character standing in a white-tiled interior room, seen from behind, with a thumbpad control at the bottom left."
  - src: ../../assets/projects/antariksh-mobile-game/05.jpg
    alt: "A spaceship at the bottom of a starfield firing upward at rows of small enemy ships."
  - src: ../../assets/projects/antariksh-mobile-game/04.jpg
    alt: "A character on a rocky desert slope beside a glowing crystal, facing a dark creature, with a crystal counter and a health bar."
  - src: ../../assets/projects/antariksh-mobile-game/06.jpg
    alt: "A character beside a large horned creature on glowing red lava rock."
  - src: ../../assets/projects/antariksh-mobile-game/08.jpg
    alt: "A character on a snowy slope facing a dark creature, with a crystal counter reading 7 and a health bar."
  - src: ../../assets/projects/antariksh-mobile-game/07.jpg
    alt: "A pause menu with resume, music and SFX volume sliders, abort mission and quit game, over a snowy level."
# order 1: after Overplanner (projects run newest to oldest).
order: 1
---

Antariksh: A Space Odyssey is a game built in Unity and C# for Android with touch controls, by a team of 7 for CSCI 526 (Advanced Mobile Devices and Game Consoles) at USC. Built December 2020. The team posted 13 weekly progress updates, with videos, on its team site.

The game has four planets: Earth, Arakis, Magmar and Aquilon. Each planet has three missions.

**3D spaceship mission.** Third-person, with a thumbpad and look control, collecting required items. On Earth these are a battery, a water bottle, a rifle and oxygen.

**2D space-invaders-style mission.** The player shoots enemies to reach a kill target, which varies with difficulty: 70 on Earth and 100 on Arakis.

**2.5D side-scrolling level.** 2D gameplay with a 3D look: move left and right, jump, shoot and collect crystals, with a health bar and repeat and abort mission options.

Arakis, Magmar and Aquilon use the same first two mission types at higher difficulty. Each has its own themed 2.5D level (desert, lava, ice) with hazards, moving platforms and end-of-level enemies. The pause menu has music and SFX volume sliders.

## Role

Other team members built the 2D mission, the website and the game documentation.

- Designed the game's levels.
- Sourced the game's assets, including sound effects and background music.
- Programmed gameplay in C#, including the 2.5D level mechanics, enemies, weapons and the settings menu.
