# Stage 0 report: repo prep and inventory

Date: 2026-10-31 · Branch: `revamp` · Status: **all acceptance criteria pass; waiting at the human checkpoint**

## What changed

| Item | Result |
|---|---|
| CRLF noise check | Working tree was already clean (0 modified files, empty `--ignore-all-space` diff). `git stash push` printed `No local changes to save`, so no stash exists. |
| `master` vs `origin/master` | Both `5881795cf93e28827b2e7dd41b9b9aa30c117bef` after `git fetch origin`. |
| `legacy-2024` | Created from `origin/master` and pushed to GitHub. |
| `revamp` | Created from `master` and checked out. Not pushed (pushing starts in Stage 10). |
| Specs | `SPEC.md`, `CLAUDE.md` and `docs/DesignSpec.md` copied in from `C:\Jay Data\portfolio revamp\`. |
| `.gitattributes` | `* text=auto eol=lf` plus `binary` for jpg, jpeg, png, gif, webp, avif, pdf, woff2, mp4 and webm. No file is stored with CRLF in the index (`git ls-files --eol`: 38 `i/lf`, 104 `i/-text`, 5 `i/none`), so adding it causes no renormalisation churn. |
| `.gitignore` | `node_modules/`, `dist/`, `.astro/`, `.lighthouseci/`. |
| `package.json` | Scripts `inventory` and `repo:size`. Dev dependency `sharp` pinned to `0.35.5`. `engines.node >= 24.11.0`. `package-lock.json` added for `npm ci` later. |
| `scripts/inventory.mjs` | Reads the file tree of `legacy-2024` (`git ls-tree -r -l`), parses `index.html` and `works-2.html`, measures every image with sharp and HEAD-checks every external link. Writes `docs/content-manifest.json` and `docs/inventory.md`. `--offline` skips the link check. |
| `scripts/repo-size.mjs` | Prints the `.git` pack size, loose-object size, working-tree size (excluding `.git`, `node_modules`, `dist`) and the `dist/` size if it exists. `--json` gives the same data as JSON. |
| Old site | No old file was deleted or moved. |

## Verification output

`git ls-remote origin legacy-2024`
```
5881795cf93e28827b2e7dd41b9b9aa30c117bef	refs/heads/legacy-2024
```
This is the same SHA as `origin/master` (`5881795 Updated Work experience section and Resume`).

`git branch -a -vv`
```
  legacy-2024                5881795 [origin/legacy-2024] Updated Work experience section and Resume
  master                     5881795 [origin/master] Updated Work experience section and Resume
* revamp                     5881795 Updated Work experience section and Resume
  remotes/origin/HEAD        -> origin/master
  remotes/origin/legacy-2024 5881795 Updated Work experience section and Resume
  remotes/origin/master      5881795 Updated Work experience section and Resume
```

`npm run inventory`
```
inventory of legacy-2024 @ 5881795 Updated Work experience section and Resume
  maps 12, map JPEGs 62, software projects 4
  project GIFs 2, project PNGs 2
  images missing bytes/width/height: 0
  map image-count mismatches vs SPEC §4.7: 0
  external links 17, failing 0
  hw8react: status 200
  wrote docs/content-manifest.json and docs/inventory.md
```

`npm run repo:size` (baseline, before the Stage 0 commits)
```
repo size
  .git size-pack      53.12 MB (333 objects in pack)
  .git loose objects  0 B
  working tree        39.28 MB in 158 files (excl. .git, node_modules, dist)
  dist/               not built
```
The working tree includes the new `docs/` and `scripts/` files. The old site alone is 147 files, 39.02 MB (from the inventory).

## Acceptance criteria

| Criterion | Result |
|---|---|
| `git ls-remote origin legacy-2024` equals `origin/master` (`5881795`) | **Pass** |
| Manifest lists 12 maps | **Pass** (12) |
| 63 JPEGs in total | **62**: see deviation 2. Every per-map count matches the SPEC §4.7 table, which itself sums to 62. |
| 4 software projects | **Pass** |
| 2 GIFs + 2 PNG project images | **Pass** |
| Each image has bytes, width and height | **Pass** (0 missing) |
| `inventory.md` flags `http://hw8react.appspot.com/` with its actual status | **Pass**: `200` (see notes) |
| No old-site file deleted or moved | **Pass** |

Project image dimensions match SPEC §4.5: `react_news.png` 800 × 600, `android_news.png` 800 × 800, `halma.gif` 480 × 480 (498 frames, 2.77 MB), `bfs.gif` 567 × 320 (225 frames, 780.6 KB).

## External link results

| URL | Status | Disposition |
|---|---|---|
| `http://hw8react.appspot.com/` | 200 | review (§4.5) |
| GitHub profile + 4 project repos | 200 each | keep |
| `https://matrix7689.github.io/Jay_Parekh_Resume.pdf` | 200 | keep (becomes relative) |
| `https://steamcommunity.com/id/MatrixIN` | 200 | keep (archive only) |
| `https://twitter.com/jayp_or_jp` | 200 | keep |
| `https://www.linkedin.com/in/jaymparekh` | 999 | keep; LinkedIn blocks bots, so check it by hand |
| Instagram, Spotify, Monkeytype | 200 | drop (Q4) |
| 2 YouTube embeds, Font Awesome kit | 200 | drop (third-party) |
| `mailto:jay.parekh7689@gmail.com` | not checked | keep (N2) |

## Notes for Jay

- **NewsApp React live demo:** `hw8react.appspot.com` returns 200 and serves the React app shell (page title "CSCI 571 NewsApp"). I only checked that the page loads. Whether its news APIs still return data is unknown. Under §4.5 the live link stays for now, and Stage 6 asks you to confirm it.
- **GitHub warning on push:** GitHub reported "2 vulnerabilities on the default branch (2 moderate)". These come from the old site's vendored JS on `master` and go away when `master` is replaced in Stage 11.
- **Old-site facts recorded for later stages** (no copy written yet): old-site stats (55 maps, 1,052,075 downloads, 12,340,926 views, 32 eSports events, plus the dropped fun stats), the full education and experience timeline, and the tech-stack logo list. All are in `content-manifest.json` under `content`.

## NEEDS INPUT

`check:inputs` arrives in Stage 1. No content files exist yet. All 13 register items (N1–N13, SPEC §4.11) are still open.

## Deviations from the spec

1. **No stash.** SPEC assumption 4 expected 19 CRLF-modified files. The tree was clean, so `git stash push` created nothing. Stage 11 task 7 (delete the stash) does not apply.
2. **62 map JPEGs, not 63.** The disk, `git ls-files` and the 66 image references in the old pages (all of which resolve) all give 62. The SPEC §4.7 table also sums to 62 (7+6+5+5+5+4+3+6+5+6+5+5). The "63" in assumption 5 and in the Stage 0 criterion looks like a miscount.
3. **Extra files:** `.gitignore` (keeps `node_modules/` out of git) and `package-lock.json` (needed for `npm ci` in CI). Neither is in the Stage 0 file list.
4. **Link check:** HEAD first, then one GET retry if HEAD returns 403, 404, 405 or 501, because some hosts reject HEAD. LinkedIn's 999 is recorded as "verify manually", not as a failure.
5. **Node version:** this machine runs Node **v24.22.1** (npm 11.19.1), not Node 22. At the checkpoint Jay chose to **switch to Node 24 LTS**. SPEC §1.4, the Stage 1 `.nvmrc` input (now `24`), CLAUDE.md and `package.json` `engines` (`>= 24.11.0`) are updated to match.
6. **Git identity:** git had no author identity configured on this machine. On Jay's instruction it is now set for this repo only (`git config --local`) to `Jay Parekh <jay.parekh7689@gmail.com>`. Earlier history uses `jmparekh@usc.edu`.

## Open questions for the checkpoint

- **Q1–Q6 (SPEC §2.2):** the defaults apply unless you override them.

## Checkpoint decisions (Jay, 2026-10-31)

1. `legacy-2024` confirmed on GitHub.
2. **"Level Designer" is removed as a role** everywhere (SPEC §4.2, Stage 3 task 3, Stage 8 task 1). The 12 level designs stay as projects (`/projects/level-design/`).
3. **Blog launches with Jay's 3 Medium posts** as full cross-posts, imported in Stage 3 (SPEC D5, assumption 2, Stage 3 task 1a, Stages 4/5 criteria, Lighthouse URL list). Medium profile `https://medium.com/@jay.parekh7689` fills N1.
4. **Q1: light theme by default** (SPEC Q1, Stage 1 task 4, DesignSpec §4 palette).
5. **Q4: keep Monkeytype and Steam**, with Steam pointing at `https://steamcommunity.com/id/MatrixIN/myworkshopfiles/` (SPEC Q4, Stage 1 task 3, §4.1, §4.7, §4.9, §4.10). The inventory dispositions are updated to match.
6. Q2, Q3, Q5, Q6: defaults kept.

Link checks on the new URLs (HEAD, no browser spoofing):
- Steam Workshop URL: **404**. Steam may simply reject HEAD requests, but it may also mean the workshop page is private or the path is different. Please open it in a browser to confirm.
- Medium profile and all 3 posts: **403** (Medium blocks automated requests). Stage 3 will likely need Jay's Medium export (*Settings → Security and apps → Download your information*) to import the posts.

Points left for Jay to confirm later (not blocking):
- The proposed About bio (§4.6, N4) still says "spent years designing 3D game levels". That describes the hobby, not a role, so it was kept. Jay can remove it when approving the bio.
- Monkeytype and Steam Workshop go in the footer `CONNECT` column, not in the home intro links row, which stays recruiter-focused.

## Human checkpoint

1. Confirm `legacy-2024` exists on GitHub: https://github.com/Matrix7689/matrix7689.github.io/tree/legacy-2024
2. Review `docs/inventory.md`, especially the external-link table and the keep / transform / drop columns.
3. Answer any of Q1–Q6 you want to override.
