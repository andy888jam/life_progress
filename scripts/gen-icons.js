const fs = require("fs");

function createIconSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32; // radius for the progress arc
  const stroke = Math.round(size * 0.045);
  const circumference = 2 * Math.PI * r;
  const progress = 0.72; // 72% filled arc
  const dashOffset = circumference * (1 - progress);
  const rx = Math.round(size * 0.22); // rounded corners
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
    // Background
    `  <rect width="${size}" height="${size}" rx="${rx}" fill="#1e1e22"/>`,
    // Subtle inner glow
    `  <rect x="${Math.round(size * 0.04)}" y="${Math.round(size * 0.04)}" width="${Math.round(size * 0.92)}" height="${Math.round(size * 0.92)}" rx="${Math.round(rx * 0.85)}" fill="#27272b"/>`,
    // Track circle (background)
    `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#3b3b42" stroke-width="${stroke}" stroke-linecap="round"/>`,
    // Progress arc
    `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#grad)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${dashOffset.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`,
    // Start dot
    `  <circle cx="${cx}" cy="${cy - r}" r="${Math.round(stroke * 0.7)}" fill="#e4007c"/>`,
    // Letter P
    `  <text x="${cx}" y="${textY}" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="${fontSize}" fill="#f5f0eb" opacity="0.95">P</text>`,
    `</svg>`,
  ].join("\n");
}

fs.writeFileSync("public/icon-192.svg", createIconSvg(192));
fs.writeFileSync("public/icon-512.svg", createIconSvg(512));
console.log("SVG icons created");
