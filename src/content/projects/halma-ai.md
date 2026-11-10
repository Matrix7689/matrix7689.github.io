---
# SPEC §4.5. Facts from the old site and resume only; summary is (proposed).
title: Halma game-playing agent
summary: C++11 agent that plays Halma on a 16×16 board, choosing moves with alpha-beta pruned minimax to 3-ply.
year: 2019
stack: [C++11]
# NEEDS INPUT (N9): role/course context (likely a USC course; not stated until confirmed).
links:
  github: https://github.com/Matrix7689/Halma-AI
video:
  mp4: /media/halma-ai/demo.mp4
  webm: /media/halma-ai/demo.webm
  poster: ../../assets/projects/halma-ai/poster.png
  caption: "Demo recording (33 s, no audio) of a game on the 16×16 board: each side starts with its 19 pieces in opposite corners."
order: 4
---

An AI agent, written in C++11, that plays Halma: an adversarial board game with some similarities to checkers. Built Nov 2019.

- The board is 16×16, and each player starts with 19 pieces clustered in diagonally opposite corners.
- A player wins by moving all of their pieces into the opponent's starting corner.
- The agent evaluates the board and outputs the best move using minimax with alpha-beta pruning, searching up to 3 ply.
