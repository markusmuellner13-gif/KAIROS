// Asset generation script — creates icon.png, splash-icon.png, favicon.png
// These are 100% original, copyright-free programmatic graphics.
// Run with: node scripts/generate-assets.js

const sharp = require('sharp');
const path = require('path');

// ─── Color palette (matching app theme) ─────────────────────────────────────
const BG = '#0A0E1A';
const CYAN = '#00D4FF';
const CYAN_DIM = '#0088AA';
const WHITE = '#E8EEFF';

// ─── SVG templates ───────────────────────────────────────────────────────────

function buildIconSVG(size) {
  const r = size / 2;
  const strokeW = Math.round(size * 0.012);
  const ringR1 = r * 0.82;
  const ringR2 = r * 0.68;
  const fontSize = Math.round(size * 0.38);
  const crossSize = Math.round(size * 0.18);
  const cx = r;
  const cy = r;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141828"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${size * 0.018}" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size * 0.18}"/>

  <!-- Outer ring -->
  <circle cx="${cx}" cy="${cy}" r="${ringR1}" fill="none" stroke="${CYAN}" stroke-width="${strokeW}" opacity="0.4"/>

  <!-- Inner ring -->
  <circle cx="${cx}" cy="${cy}" r="${ringR2}" fill="none" stroke="${CYAN}" stroke-width="${strokeW * 0.6}" opacity="0.25"/>

  <!-- Ring tick marks (compass/clock) -->
  ${Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const isMain = i % 3 === 0;
    const len = isMain ? ringR1 * 0.08 : ringR1 * 0.04;
    const x1 = cx + ringR1 * Math.cos(angle);
    const y1 = cy + ringR1 * Math.sin(angle);
    const x2 = cx + (ringR1 - len) * Math.cos(angle);
    const y2 = cy + (ringR1 - len) * Math.sin(angle);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${CYAN}" stroke-width="${isMain ? strokeW * 1.5 : strokeW}" opacity="${isMain ? 0.8 : 0.4}"/>`;
  }).join('\n  ')}

  <!-- K letter (bold, glowing) -->
  <text x="${cx}" y="${cy + fontSize * 0.36}" font-family="Arial Black,Arial,sans-serif"
        font-size="${fontSize}" font-weight="900" fill="${CYAN}" text-anchor="middle"
        filter="url(#glow)" opacity="0.95">K</text>

  <!-- Small cross below K (Catholic symbol) -->
  <line x1="${cx}" y1="${cy + fontSize * 0.54}" x2="${cx}" y2="${cy + fontSize * 0.54 + crossSize}" stroke="${CYAN}" stroke-width="${strokeW * 1.2}" opacity="0.6"/>
  <line x1="${cx - crossSize * 0.6}" y1="${cy + fontSize * 0.54 + crossSize * 0.35}" x2="${cx + crossSize * 0.6}" y2="${cy + fontSize * 0.54 + crossSize * 0.35}" stroke="${CYAN}" stroke-width="${strokeW * 1.2}" opacity="0.6"/>
</svg>`;
}

function buildSplashSVG(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const logoSize = Math.min(width, height) * 0.22;
  const strokeW = Math.round(logoSize * 0.022);
  const ringR = logoSize * 0.52;
  const fontSize = Math.round(logoSize * 0.72);
  const titleSize = Math.round(Math.min(width, height) * 0.065);
  const subtitleSize = Math.round(Math.min(width, height) * 0.022);
  const crossSize = Math.round(logoSize * 0.16);
  const logoCY = cy - Math.min(width, height) * 0.06;

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sbg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#0D1429"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <filter id="sglow">
      <feGaussianBlur stdDeviation="${logoSize * 0.025}" result="cb"/>
      <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#sbg)"/>

  <!-- Subtle horizontal lines (scanline effect) -->
  ${Array.from({ length: 8 }, (_, i) => {
    const y = height * 0.1 + i * height * 0.1;
    return `<line x1="0" y1="${y.toFixed(0)}" x2="${width}" y2="${y.toFixed(0)}" stroke="${CYAN}" stroke-width="0.5" opacity="0.03"/>`;
  }).join('\n  ')}

  <!-- Logo ring -->
  <circle cx="${cx}" cy="${logoCY}" r="${ringR}" fill="none" stroke="${CYAN}" stroke-width="${strokeW}" opacity="0.45"/>
  <circle cx="${cx}" cy="${logoCY}" r="${ringR * 0.75}" fill="none" stroke="${CYAN}" stroke-width="${strokeW * 0.5}" opacity="0.2"/>

  <!-- Ring ticks -->
  ${Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const isMain = i % 3 === 0;
    const len = ringR * 0.08;
    const x1 = cx + ringR * Math.cos(angle);
    const y1 = logoCY + ringR * Math.sin(angle);
    const x2 = cx + (ringR - len) * Math.cos(angle);
    const y2 = logoCY + (ringR - len) * Math.sin(angle);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${CYAN}" stroke-width="${isMain ? strokeW * 1.5 : strokeW}" opacity="${isMain ? 0.8 : 0.35}"/>`;
  }).join('\n  ')}

  <!-- K letter -->
  <text x="${cx}" y="${logoCY + fontSize * 0.36}" font-family="Arial Black,Arial,sans-serif"
        font-size="${fontSize}" font-weight="900" fill="${CYAN}" text-anchor="middle"
        filter="url(#sglow)" opacity="0.95">K</text>

  <!-- Cross -->
  <line x1="${cx}" y1="${logoCY + fontSize * 0.52}" x2="${cx}" y2="${logoCY + fontSize * 0.52 + crossSize}" stroke="${CYAN}" stroke-width="${strokeW * 1.5}" opacity="0.55"/>
  <line x1="${cx - crossSize * 0.55}" y1="${logoCY + fontSize * 0.52 + crossSize * 0.38}" x2="${cx + crossSize * 0.55}" y2="${logoCY + fontSize * 0.52 + crossSize * 0.38}" stroke="${CYAN}" stroke-width="${strokeW * 1.5}" opacity="0.55"/>

  <!-- App name -->
  <text x="${cx}" y="${logoCY + ringR + titleSize * 1.8}" font-family="Arial Black,Arial,sans-serif"
        font-size="${titleSize}" font-weight="900" fill="${CYAN}" text-anchor="middle"
        letter-spacing="${titleSize * 0.35}" filter="url(#sglow)" opacity="0.95">KAIROS</text>

  <!-- Subtitle -->
  <text x="${cx}" y="${logoCY + ringR + titleSize * 1.8 + subtitleSize * 1.7}" font-family="Arial,sans-serif"
        font-size="${subtitleSize}" fill="${WHITE}" text-anchor="middle"
        letter-spacing="${subtitleSize * 0.18}" opacity="0.45">PERSONAL INTELLIGENCE SYSTEM</text>
</svg>`;
}

// ─── Generate files ───────────────────────────────────────────────────────────

async function generate() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  // App icon 1024×1024
  await sharp(Buffer.from(buildIconSVG(1024)))
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✓ icon.png (1024×1024)');

  // Android adaptive icon foreground 1024×1024
  await sharp(Buffer.from(buildIconSVG(1024)))
    .png()
    .toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png');

  // Android adaptive icon background (solid dark colour) 1024×1024
  const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${BG}"/>
  </svg>`;
  await sharp(Buffer.from(bgSvg)).png().toFile(path.join(assetsDir, 'android-icon-background.png'));
  console.log('✓ android-icon-background.png');

  // Android monochrome icon 1024×1024
  await sharp(Buffer.from(buildIconSVG(1024)))
    .png()
    .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
  console.log('✓ android-icon-monochrome.png');

  // Splash screen 1284×2778 (iPhone 14 Pro Max — safe for all phones)
  await sharp(Buffer.from(buildSplashSVG(1284, 2778)))
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png (1284×2778)');

  // Favicon 48×48
  await sharp(Buffer.from(buildIconSVG(256)))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✓ favicon.png (48×48)');

  console.log('\nAll assets generated successfully. 100% original, copyright-free.');
}

generate().catch(err => { console.error('Error:', err); process.exit(1); });
