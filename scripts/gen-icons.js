const fs = require("fs");
const sharp = require("sharp");

function createIconSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const stroke = Math.round(size * 0.045);
  const circumference = 2 * Math.PI * r;
  const progress = 0.72;
  const dashOffset = circumference * (1 - progress);
  const rx = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.38);
  const textY = Math.round(cy + fontSize * 0.35);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `  <defs>`,
    `    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">`,
    `      <stop offset="0%" style="stop-color:#e4007c"/>`,
    `      <stop offset="100%" style="stop-color:#ff3da1"/>`,
    `    </linearGradient>`,
    `  </defs>`,
    `  <rect width="${size}" height="${size}" rx="${rx}" fill="#1e1e22"/>`,
    `  <rect x="${Math.round(size * 0.04)}" y="${Math.round(size * 0.04)}" width="${Math.round(size * 0.92)}" height="${Math.round(size * 0.92)}" rx="${Math.round(rx * 0.85)}" fill="#27272b"/>`,
    `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#3b3b42" stroke-width="${stroke}" stroke-linecap="round"/>`,
    `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#grad)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${dashOffset.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`,
    `  <circle cx="${cx}" cy="${cy - r}" r="${Math.round(stroke * 0.7)}" fill="#e4007c"/>`,
    `  <text x="${cx}" y="${textY}" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="${fontSize}" fill="#f5f0eb" opacity="0.95">P</text>`,
    `</svg>`,
  ].join("\n");
}

async function main() {
  for (const size of [192, 512]) {
    const svg = createIconSvg(size);
    fs.writeFileSync(`public/icon-${size}.svg`, svg);
    await sharp(Buffer.from(svg)).png().toFile(`public/icon-${size}.png`);
  }
  console.log("SVG + PNG icons created");
}

main();
