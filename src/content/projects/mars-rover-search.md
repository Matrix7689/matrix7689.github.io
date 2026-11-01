---
# SPEC §4.5. Facts from the old site and resume only; summary is (proposed).
title: "Mars rover path search (BFS / UCS / A*)"
summary: C++11 program that finds the optimal safe path for a Mars rover to each target with BFS, UCS and A*.
year: 2019
stack: [C++11]
# NEEDS INPUT (N9): role/course context (likely a USC course; not stated until confirmed).
links:
  github: https://github.com/Matrix7689/BFS-UCS-AStar
video:
  mp4: /media/mars-rover-search/demo.mp4
  webm: /media/mars-rover-search/demo.webm
  poster: ../../assets/projects/mars-rover-search/poster.png
order: 4
---

A C++11 program that reads an input file describing a terrain map, a landing site, target sites and the limits of a Mars rover. For each target, it finds the optimal (shortest) safe path from the landing site. Built Sep 2019.

- A path is a sequence of elementary moves; each move goes to one of the rover's 8 neighbouring cells.
- The search runs with breadth-first search (BFS), uniform-cost search (UCS) or A*.
