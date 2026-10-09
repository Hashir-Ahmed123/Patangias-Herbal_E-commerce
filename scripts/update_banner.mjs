import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

const bannerSvg = `
<svg width="1200" height="500" viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgBanner" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07261C"/>
      <stop offset="50%" stop-color="#0B3D2E"/>
      <stop offset="100%" stop-color="#051C14"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE89C"/>
      <stop offset="50%" stop-color="#C9A227"/>
      <stop offset="100%" stop-color="#A68016"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1B634D" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0B3D2E" stop-opacity="0"/>
    </radialGradient>
    <pattern id="leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M40,10 C45,25 50,30 65,35 C50,40 45,45 40,60 C35,45 30,40 15,35 C30,30 35,25 40,10 Z" fill="#C9A227" opacity="0.04"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="500" fill="url(#bgBanner)"/>
  <rect width="1200" height="500" fill="url(#leaves)"/>
  <circle cx="950" cy="250" r="380" fill="url(#glow)"/>

  <!-- Left Side Badges and Text -->
  <g transform="translate(80, 70)">
    <rect x="0" y="0" width="270" height="34" rx="17" fill="#134E3B" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <circle cx="18" cy="17" r="5" fill="#C9A227"/>
    <text x="35" y="22" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FCE082" letter-spacing="1">EXCLUSIVE KARACHI LAUNCH</text>
  </g>

  <!-- Big Headline -->
  <text x="80" y="160" font-family="'Playfair Display', 'Cinzel', 'Georgia', serif" font-size="48" font-weight="bold" fill="#FFFFFF" letter-spacing="1">
    Patangia's Herbal Shampoo
  </text>

  <!-- Tagline -->
  <text x="80" y="210" font-family="'Playfair Display', 'Georgia', serif" font-size="22" font-style="italic" fill="url(#goldGrad)">
    Nature's Goodness for Strong, Healthy &amp; Beautiful Hair
  </text>

  <!-- Key Benefits List -->
  <g transform="translate(80, 255)">
    <g transform="translate(0, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="15" font-weight="600" fill="#F3EFE6">Stop Hair Fall</text>
    </g>
    <g transform="translate(170, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="15" font-weight="600" fill="#F3EFE6">Stronger Roots</text>
    </g>
    <g transform="translate(340, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="15" font-weight="600" fill="#F3EFE6">12 Pure Herbs</text>
    </g>
  </g>

  <!-- Second row benefits -->
  <g transform="translate(80, 300)">
    <g transform="translate(0, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="15" font-weight="600" fill="#F3EFE6">Prevents White Hair</text>
    </g>
    <g transform="translate(210, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="15" font-weight="600" fill="#F3EFE6">Fast Delivery Across Karachi</text>
    </g>
  </g>

  <!-- Price & Call to Action banner area -->
  <g transform="translate(80, 365)">
    <rect x="0" y="0" width="280" height="70" rx="14" fill="#C9A227"/>
    <text x="20" y="24" font-family="'Montserrat', sans-serif" font-size="11" font-weight="800" fill="#0B3D2E" letter-spacing="1">LIMITED PROMO (WILL INCREASE)</text>
    <text x="20" y="55" font-family="'Montserrat', sans-serif" font-size="32" font-weight="900" fill="#0B3D2E">Rs. 500</text>
    <text x="160" y="53" font-family="'Montserrat', sans-serif" font-size="16" font-weight="500" fill="#5A470E" text-decoration="line-through">Rs. 700</text>

    <!-- Cash on delivery pill -->
    <g transform="translate(300, 16)">
      <rect x="0" y="0" width="230" height="38" rx="10" fill="rgba(255,255,255,0.12)" stroke="#C9A227" stroke-width="1.5"/>
      <text x="115" y="24" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">Karachi Cash On Delivery</text>
    </g>
  </g>

  <!-- Right side decorative preview -->
  <g transform="translate(930, 240)">
    <circle cx="0" cy="0" r="180" fill="#0E4837" stroke="url(#goldGrad)" stroke-width="3" stroke-dasharray="12,6"/>
    <circle cx="0" cy="0" r="150" fill="#135641"/>

    <!-- Shampoo Bottle Silhouette Graphic -->
    <rect x="-50" y="-120" width="100" height="240" rx="25" fill="#2E1B0E" stroke="url(#goldGrad)" stroke-width="3.5"/>
    <rect x="-24" y="-155" width="48" height="35" rx="6" fill="#1A1A1A" stroke="#C9A227" stroke-width="1.5"/>
    
    <!-- Bottle label -->
    <rect x="-42" y="-60" width="84" height="130" rx="8" fill="#FDFBF7"/>
    <text x="0" y="-30" text-anchor="middle" font-family="'Playfair Display', serif" font-size="13" font-weight="900" fill="#0B3D2E">PATANGIA'S</text>
    <line x1="-30" y1="-20" x2="30" y2="-20" stroke="#C9A227" stroke-width="1.5"/>
    <text x="0" y="-5" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="9" font-weight="700" fill="#0B3D2E">HERBAL</text>
    <text x="0" y="10" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" font-weight="700" fill="#0B3D2E">SHAMPOO</text>
    <circle cx="0" cy="25" r="8" fill="#C9A227"/>
    <text x="0" y="47" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7" font-weight="600" fill="#555">12 HERBAL BLEND</text>
    <text x="0" y="60" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" font-weight="800" fill="#0B3D2E">250 ML</text>

    <!-- Floating badge -->
    <g transform="translate(75, -80)">
      <circle cx="0" cy="0" r="44" fill="#C9A227" stroke="#FFFFFF" stroke-width="2"/>
      <text x="0" y="-8" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" font-weight="800" fill="#0B3D2E">PROMO</text>
      <text x="0" y="8" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="900" fill="#0B3D2E">Rs. 500</text>
      <text x="0" y="22" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" font-weight="700" fill="#0B3D2E">KARACHI</text>
    </g>
  </g>
</svg>
`;

async function run() {
  await sharp(Buffer.from(bannerSvg)).png().toFile(path.join(publicDir, 'banner.png'));
  console.log('banner.png regenerated with Rs. 500 promo and Karachi delivery!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
