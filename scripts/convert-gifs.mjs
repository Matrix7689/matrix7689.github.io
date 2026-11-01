// One-off GIF → video conversion (SPEC D10, Stage 2 task 3). Run with `npm run media:gifs`
// and commit the outputs; the build never runs ffmpeg.
// For each src/assets/projects/<slug>/demo.gif it writes:
//   public/media/<slug>/demo.mp4    H.264, yuv420p, faststart
//   public/media/<slug>/demo.webm   VP9
//   src/assets/projects/<slug>/poster.png   first frame, fed to Img/Video (detail preset) at build time
// CRF starts at a high-quality value and steps up until the file is ≤ 400 KB.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PROJECTS = join(ROOT, 'src', 'assets', 'projects');
const MEDIA = join(ROOT, 'public', 'media');
const CAP = 400 * 1024;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

// Even dimensions are required by yuv420p.
const EVEN = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
const CODECS = {
  mp4: { start: 23, args: ['-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'] },
  webm: { start: 32, args: ['-c:v', 'libvpx-vp9', '-b:v', '0', '-row-mt', '1', '-pix_fmt', 'yuv420p'] },
};

function encode(input, output, { start, args }) {
  for (let crf = start; crf <= 51; crf += 2) {
    execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-vf', EVEN, '-an', ...args, '-crf', String(crf), output]);
    const size = statSync(output).size;
    if (size <= CAP) return { crf, size };
  }
  throw new Error(`${output}: still > ${kb(CAP)} at CRF 51`);
}

for (const slug of readdirSync(PROJECTS)) {
  const gif = join(PROJECTS, slug, 'demo.gif');
  if (!existsSync(gif)) continue;
  const out = join(MEDIA, slug);
  mkdirSync(out, { recursive: true });

  await sharp(gif, { pages: 1 }).png({ compressionLevel: 9 }).toFile(join(PROJECTS, slug, 'poster.png'));
  const meta = await sharp(gif).metadata();
  console.log(`${slug}: ${meta.width}×${meta.height}, ${meta.pages} frames, gif ${kb(statSync(gif).size)}`);
  for (const [ext, codec] of Object.entries(CODECS)) {
    const { crf, size } = encode(gif, join(out, `demo.${ext}`), codec);
    console.log(`  demo.${ext}  CRF ${crf}  ${kb(size)}`);
  }
}
