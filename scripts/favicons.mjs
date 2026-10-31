// Render public/favicon.svg to the PNG icons (favicon-32.png, apple-touch-icon.png).
// Usage: npm run icons
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const svg = readFileSync(join(PUBLIC, 'favicon.svg'));

for (const [name, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
]) {
  const info = await sharp(svg, { density: 72 * (size / 16) })
    .resize(size, size)
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(PUBLIC, name));
  console.log(`${name}  ${info.width}×${info.height}  ${info.size} B`);
}
