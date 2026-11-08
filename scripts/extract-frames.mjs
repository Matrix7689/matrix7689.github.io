// Still frames from a local video, for project screenshots (Antariksh project). Uses ffmpeg-static; the
// videos themselves stay outside the repo.
//
//   npm run media:frames -- <video> --sheet --out <dir> [--every 10]
//       Contact sheets (30 labelled frames each, one frame every N seconds) to choose frames by eye.
//   npm run media:frames -- <video> --times 12,1:05,2:30.5 --out <dir>
//       Full-size PNGs at those timestamps (seconds or m:ss), named <video>-m-ss.png.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const TILE_W = 320;
const COLS = 5;
const ROWS = 6;

function fail(message) {
  console.error(message);
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const video = args[0];
const out = flag('--out');
const times = flag('--times');
const sheet = args.includes('--sheet');
const every = Number(flag('--every') ?? 10);
if (!video || video.startsWith('--') || !out || sheet === Boolean(times) || !(every > 0)) {
  fail('usage: extract-frames.mjs <video> (--sheet [--every 10] | --times 12,1:05) --out <dir>');
}
const stem = basename(video, extname(video));

const seconds = (t) => t.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
const label = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function frame(at, file, width) {
  const scale = width ? ['-vf', `scale=${width}:-2`] : [];
  const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', String(at), '-i', video, '-frames:v', '1', ...scale, file], { encoding: 'utf8' });
  if (r.status !== 0) fail(`ffmpeg failed at ${label(at)}: ${r.stderr}`);
}

function duration() {
  // ffmpeg with no output exits non-zero but still prints the header.
  const { stderr } = spawnSync(ffmpeg, ['-i', video], { encoding: 'utf8' });
  const m = stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) fail(`could not read a duration from ${video}`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

mkdirSync(out, { recursive: true });

if (times) {
  for (const t of times.split(',')) {
    const at = seconds(t.trim());
    const file = join(out, `${stem}-${label(at).replace(':', '-')}.png`);
    frame(at, file);
    console.log(`${label(at)}  ${file}`);
  }
} else {
  const total = duration();
  const stamps = [];
  for (let t = 0; t < total; t += every) stamps.push(t);
  const tmp = mkdtempSync(join(tmpdir(), 'frames-'));
  const tiles = [];
  for (const [i, t] of stamps.entries()) {
    const file = join(tmp, `${i}.png`);
    frame(t, file, TILE_W);
    const { height } = await sharp(file).metadata();
    const tag = Buffer.from(`<svg width="70" height="24"><rect width="70" height="24" fill="#000"/><text x="6" y="17" font-family="monospace" font-size="15" fill="#fff">${label(t)}</text></svg>`);
    tiles.push({ input: await sharp(file).composite([{ input: tag, top: 0, left: 0 }]).png().toBuffer(), height });
  }
  rmSync(tmp, { recursive: true, force: true });

  const tileH = Math.max(...tiles.map((t) => t.height));
  const perSheet = COLS * ROWS;
  for (let s = 0; s * perSheet < tiles.length; s++) {
    const page = tiles.slice(s * perSheet, (s + 1) * perSheet);
    const file = join(out, `${stem}-sheet-${String(s + 1).padStart(2, '0')}.png`);
    await sharp({ create: { width: COLS * TILE_W, height: Math.ceil(page.length / COLS) * tileH, channels: 3, background: '#000' } })
      .composite(page.map((t, i) => ({ input: t.input, left: (i % COLS) * TILE_W, top: Math.floor(i / COLS) * tileH })))
      .png()
      .toFile(file);
    console.log(file);
  }
  console.log(`${stamps.length} frames from ${label(total)} of video, one every ${every} s`);
}
