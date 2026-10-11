import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. High-fidelity SVG icon for AlterEgo
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0416" />
      <stop offset="50%" stop-color="#180a2e" />
      <stop offset="100%" stop-color="#05020a" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#fbbf24" />
      <stop offset="80%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-opacity="0.35" />

  <!-- Ambient background glow rings -->
  <circle cx="256" cy="256" r="160" fill="none" stroke="url(#purpleGlow)" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="8 6" />
  <circle cx="256" cy="256" r="190" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.25" />

  <!-- Crown Points -->
  <g filter="url(#glow)">
    <path d="M144 196 L184 256 L256 160 L328 256 L368 196 L352 300 H160 Z" fill="url(#goldGrad)" />
  </g>

  <!-- Center Celestial Starburst / Monogram "A" -->
  <path d="M256 180 L292 284 H220 Z" fill="#0b0416" />
  <path d="M256 220 L274 274 H238 Z" fill="url(#goldGrad)" />

  <!-- Golden Scepter Base Shield -->
  <path d="M176 312 H336 L256 416 Z" fill="url(#goldGrad)" />
  <circle cx="256" cy="356" r="16" fill="#0b0416" />
  <circle cx="256" cy="356" r="9" fill="url(#goldGrad)" />

  <!-- Floating Sparkles -->
  <polygon points="256,120 262,136 278,142 262,148 256,164 250,148 234,142 250,136" fill="#fef08a" />
  <polygon points="152,168 156,180 168,184 156,188 152,200 148,188 136,184 148,180" fill="#fef08a" opacity="0.8" />
  <polygon points="360,168 364,180 376,184 364,188 360,200 356,188 344,184 356,180" fill="#fef08a" opacity="0.8" />
</svg>`;

// 2. Maskable SVG icon with 15% safe padding around all sides (solid bleed background)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0416" />
      <stop offset="50%" stop-color="#180a2e" />
      <stop offset="100%" stop-color="#05020a" />
    </linearGradient>
    <linearGradient id="goldGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#fbbf24" />
      <stop offset="80%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="purpleGlowMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background for Android safe-zone masking -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Inner padded content (scaled down by 0.76 and centered) -->
  <g transform="translate(61.44, 61.44) scale(0.76)">
    <!-- Ambient glow rings -->
    <circle cx="256" cy="256" r="160" fill="none" stroke="url(#purpleGlowMask)" stroke-width="2" stroke-opacity="0.35" stroke-dasharray="8 6" />
    <circle cx="256" cy="256" r="190" fill="none" stroke="url(#goldGradMask)" stroke-width="2" stroke-opacity="0.3" />

    <!-- Crown Points -->
    <path d="M144 196 L184 256 L256 160 L328 256 L368 196 L352 300 H160 Z" fill="url(#goldGradMask)" />

    <!-- Center Starburst / Monogram "A" -->
    <path d="M256 180 L292 284 H220 Z" fill="#0b0416" />
    <path d="M256 220 L274 274 H238 Z" fill="url(#goldGradMask)" />

    <!-- Golden Scepter Base Shield -->
    <path d="M176 312 H336 L256 416 Z" fill="url(#goldGradMask)" />
    <circle cx="256" cy="356" r="16" fill="#0b0416" />
    <circle cx="256" cy="356" r="9" fill="url(#goldGradMask)" />

    <!-- Sparkles -->
    <polygon points="256,120 262,136 278,142 262,148 256,164 250,148 234,142 250,136" fill="#fef08a" />
    <polygon points="152,168 156,180 168,184 156,188 152,200 148,188 136,184 148,180" fill="#fef08a" opacity="0.8" />
    <polygon points="360,168 364,180 376,184 364,188 360,200 356,188 344,184 356,180" fill="#fef08a" opacity="0.8" />
  </g>
</svg>`;

async function generate() {
  const publicDir = path.resolve(process.cwd(), 'public');

  // Save base SVG
  fs.writeFileSync(path.join(publicDir, 'pwa-icon.svg'), standardSvg);

  // Generate 512x512 PNG
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Generate 192x192 PNG
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // Generate 180x180 Apple Touch Icon PNG
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Generate Maskable 512x512 PNG
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('✅ All PWA Icons generated successfully in public/');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
