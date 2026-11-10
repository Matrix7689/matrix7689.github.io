---
# Facts from the Overplanner repo (README.md, docs/DETAILS.md, CHANGELOG.md, package.json) and Jay's brief; see docs/reports/overplanner-project.md. Summary is (proposed).
# NEEDS INPUT: the "How it was built" section (the vibe-coded disclosure) is (proposed). Jay to approve or reword it.
# NEEDS INPUT: confirm the GitHub repo is public. `git ls-remote` returned its head on 2026-11-11.
# No live demo: the app is self-hosted, so there is no `live` link. No version number or last-updated date: it is still in development.
title: Overplanner
summary: A self-hosted task and notes app, an alternative to Google Keep, with plain JSON file storage and quick capture from a phone.
year: 2026
stack: [TypeScript, React, Vite, Tailwind CSS, Express, Zod, PWA]
context: Personal project · self-hosted
license: MIT
builtWith: Claude (vibe coded)
links:
  github: https://github.com/Matrix7689/overplanner
cover: ../../assets/projects/overplanner/dashboard.png
# Screenshots use demo data. Alt text describes only what is visible in each image.
gallery:
  - src: ../../assets/projects/overplanner/dashboard.png
    alt: "The Overplanner dashboard in a brown theme: cards for open tasks, tasks due today and the inbox, a quick-add box, and category cards for Friends, Family and Shopping listing their tasks."
  - src: ../../assets/projects/overplanner/task-editor.png
    alt: "A task editor dialog titled Prepare for Thursday's interview, with a details box, a due date, a three-item checklist with one item checked, a Career category and a tags field."
  - src: ../../assets/projects/overplanner/calendar.png
    alt: "The calendar page listing tasks under Overdue, Today and Tomorrow, each with its category label, such as Finances, Workout and Health."
  - src: ../../assets/projects/overplanner/category-page.png
    alt: "The Workout category page: a quick-add box, three tasks with due dates, a collapsed Done list and a pinned note with a push day routine."
  - src: ../../assets/projects/overplanner/phone-capture.png
    alt: "The phone capture screen in dark mode: a text box reading Add a task, note or link, Task and Note buttons, an Add button and the message All sent to your Inbox."
featured: true
# order 0: listed first (Jay).
order: 0
---

Started in October 2026 and still in development. Released under the MIT license.

## Features

- Built tasks, notes, checklists and pins, with categories and lists that are suggested as you type.
- Added a dashboard of cards that can be dragged to reorder, with a pie chart of open tasks per category.
- Included a calendar, a Results page with progress charts, and search across everything.
- Added light and dark modes, five theme presets (Mocha, Orange, Teal, Deep Ocean and Forest) and custom colors.
- Checked the theme colors against WCAG AA contrast.
- Offered a choice of seven fonts, six of them bundled with the app so they work offline.

## How suggestions work

Keyword rules run first. Optional AI suggestions use TypeSafe AI and are off unless an API key is set. When they are enabled, the text being classified is sent to that service.

Saving never waits on the AI call. If the call fails or times out, the keyword guess is used.

## Your data

- Stored all data in plain JSON files in a local `data/` folder, which is git-ignored.
- Wrote files atomically (temp file, then rename) and validated every read and write.
- Backed up automatically every 6 hours to any chosen folder, including a Google Drive for desktop folder, keeping the newest 28 snapshots by default.

## Phone capture

The capture app lives at `/capture/` on the same server.

- Built an installable PWA that works offline, holding items in a queue on the phone until they can be sent.
- Sent items one way, from the phone to the PC's Inbox.
- Received items from Android's share menu.
- Connected the phone and PC privately over Tailscale, so nothing is exposed to the internet.

## Importers

- Added importers for Google Keep (Takeout) and WhatsApp exports.
- Made the importer a dry run unless `--apply` is passed, and safe to re-run without creating duplicates.
- Added a secret scan that withholds anything that looks like a password or code.

## How it was built

Vibe coded with Claude: the app was described in plain language and built through conversation, with Claude writing the code.
