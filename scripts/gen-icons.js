const fs = require("fs");

function createIconSvg(size) {
  const padding = Math.round(size * 0.15);
  const inner = size - padding * 2;
  const rx = Math.round(size * 0.2);
  const fontSize = Math.round(size * 0.45);
  const barY = Math.round(size * 0.72);
  const barH = Math.round(size * 0.04);
  const barRx = Math.round(size * 0.02);
  const fillW = Math.round(inner * 0.65);
  const textY = Math.round(size * 0.62);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `  <rect width="${size}" height="${size}" rx="${rx}" fill="#323238"/>`,
    `  <text x="${size / 2}" y="${textY}" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="${fontSize}" fill="#e4007c">P</text>`,
    `  <rect x="${padding}" y="${barY}" width="${inner}" height="${barH}" rx="${barRx}" fill="#e4007c" opacity="0.4"/>`,
    `  <rect x="${padding}" y="${barY}" width="${fillW}" height="${barH}" rx="${barRx}" fill="#e4007c"/>`,
    `</svg>`,
  ].join("\n");
}

fs.writeFileSync("public/icon-192.svg", createIconSvg(192));
fs.writeFileSync("public/icon-512.svg", createIconSvg(512));
console.log("SVG icons created");
