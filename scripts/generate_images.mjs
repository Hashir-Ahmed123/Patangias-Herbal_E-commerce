import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Logo (512x512)
const logoSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0F4C3A"/>
      <stop offset="100%" stop-color="#07281E"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE082"/>
      <stop offset="40%" stop-color="#C9A227"/>
      <stop offset="70%" stop-color="#E5C158"/>
      <stop offset="100%" stop-color="#997711"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="url(#gold)" stroke-width="8"/>
  <circle cx="256" cy="256" r="226" fill="none" stroke="url(#gold)" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- Botanical Leaf Motif at Top -->
  <g transform="translate(256, 120)" fill="url(#gold)" filter="url(#shadow)">
    <!-- Central leaf -->
    <path d="M0,-45 C15,-25 20,-5 0,20 C-20,-5 -15,-25 0,-45 Z"/>
    <!-- Left leaf -->
    <path d="M-5,-5 C-25,-25 -45,-15 -35,5 C-20,15 -10,5 -5,-5 Z"/>
    <!-- Right leaf -->
    <path d="M5,-5 C25,-25 45,-15 35,5 C20,15 10,5 5,-5 Z"/>
    <!-- Small dots -->
    <circle cx="0" cy="28" r="3"/>
    <circle cx="-12" cy="24" r="2"/>
    <circle cx="12" cy="24" r="2"/>
  </g>

  <!-- Brand Name -->
  <text x="256" y="240" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', 'Georgia', serif" font-size="52" font-weight="bold" fill="url(#gold)" letter-spacing="4" filter="url(#shadow)">PATANGIA'S</text>
  
  <!-- Divider -->
  <line x1="130" y1="262" x2="210" y2="262" stroke="url(#gold)" stroke-width="2"/>
  <circle cx="256" cy="262" r="5" fill="url(#gold)"/>
  <line x1="302" y1="262" x2="382" y2="262" stroke="url(#gold)" stroke-width="2"/>

  <!-- Subtitle -->
  <text x="256" y="295" text-anchor="middle" font-family="'Cinzel', 'Georgia', serif" font-size="22" font-weight="600" fill="#FDF8E2" letter-spacing="8">HERBAL CARE</text>
  
  <text x="256" y="340" text-anchor="middle" font-family="'Montserrat', 'Arial', sans-serif" font-size="14" font-weight="500" fill="#C9A227" letter-spacing="4">100% PURE &amp; NATURAL</text>
  
  <!-- Est tag -->
  <g transform="translate(256, 390)">
    <rect x="-65" y="-14" width="130" height="28" rx="14" fill="#0B3D2E" stroke="url(#gold)" stroke-width="1.5"/>
    <text x="0" y="5" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="600" fill="#FCE082" letter-spacing="2">EST. 2024</text>
  </g>
</svg>
`;

// 2. Banner (1200x500)
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
  <!-- Top Tag -->
  <g transform="translate(80, 75)">
    <rect x="0" y="0" width="230" height="34" rx="17" fill="#134E3B" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <circle cx="18" cy="17" r="5" fill="#C9A227"/>
    <text x="35" y="22" font-family="'Montserrat', sans-serif" font-size="13" font-weight="700" fill="#FCE082" letter-spacing="1.5">100% ORGANIC FORMULA</text>
  </g>

  <!-- Big Headline -->
  <text x="80" y="165" font-family="'Playfair Display', 'Cinzel', 'Georgia', serif" font-size="52" font-weight="bold" fill="#FFFFFF" letter-spacing="1">
    Patangia's Herbal Shampoo
  </text>

  <!-- Tagline -->
  <text x="80" y="215" font-family="'Playfair Display', 'Georgia', serif" font-size="24" font-style="italic" fill="url(#goldGrad)">
    Nature's Goodness for Strong, Healthy &amp; Beautiful Hair
  </text>

  <!-- Key Benefits List -->
  <g transform="translate(80, 260)">
    <!-- Benefit 1 -->
    <g transform="translate(0, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="16" font-weight="600" fill="#F3EFE6">Stop Hair Fall</text>
    </g>
    <!-- Benefit 2 -->
    <g transform="translate(170, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="16" font-weight="600" fill="#F3EFE6">Stronger Roots</text>
    </g>
    <!-- Benefit 3 -->
    <g transform="translate(340, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="16" font-weight="600" fill="#F3EFE6">Thick &amp; Long Hair</text>
    </g>
  </g>

  <!-- Second row benefits -->
  <g transform="translate(80, 305)">
    <!-- Benefit 4 -->
    <g transform="translate(0, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="16" font-weight="600" fill="#F3EFE6">Prevents Early White Hair</text>
    </g>
    <!-- Benefit 5 -->
    <g transform="translate(250, 0)">
      <circle cx="10" cy="10" r="8" fill="#C9A227"/>
      <path d="M7 10 L9 12 L13 8" stroke="#0B3D2E" stroke-width="2" fill="none"/>
      <text x="26" y="15" font-family="'Montserrat', sans-serif" font-size="16" font-weight="600" fill="#F3EFE6">12 Pure Herbal Ingredients</text>
    </g>
  </g>

  <!-- Price & Call to Action banner area -->
  <g transform="translate(80, 370)">
    <rect x="0" y="0" width="220" height="65" rx="12" fill="#C9A227"/>
    <text x="20" y="26" font-family="'Montserrat', sans-serif" font-size="13" font-weight="700" fill="#0B3D2E" letter-spacing="1">SPECIAL INTRO PRICE</text>
    <text x="20" y="52" font-family="'Montserrat', sans-serif" font-size="28" font-weight="900" fill="#0B3D2E">Rs. 1,499</text>
    <text x="145" y="50" font-family="'Montserrat', sans-serif" font-size="15" font-weight="500" fill="#4B3B09" text-decoration="line-through">Rs. 2,200</text>

    <!-- Cash on delivery pill -->
    <g transform="translate(240, 15)">
      <rect x="0" y="0" width="240" height="36" rx="8" fill="rgba(255,255,255,0.12)" stroke="#C9A227" stroke-width="1"/>
      <text x="120" y="23" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="14" font-weight="600" fill="#FFFFFF">Cash On Delivery Available</text>
    </g>
  </g>

  <!-- Right side decorative product graphic preview -->
  <g transform="translate(930, 240)">
    <!-- Decorative golden circular backdrop -->
    <circle cx="0" cy="0" r="180" fill="#0E4837" stroke="url(#goldGrad)" stroke-width="3" stroke-dasharray="12,6"/>
    <circle cx="0" cy="0" r="150" fill="#135641"/>

    <!-- Shampoo Bottle Silhouette Graphic -->
    <rect x="-50" y="-120" width="100" height="240" rx="30" fill="#07221A" stroke="url(#goldGrad)" stroke-width="4"/>
    <!-- Bottle neck and cap -->
    <rect x="-24" y="-155" width="48" height="35" rx="6" fill="#C9A227" stroke="#FDE89C" stroke-width="2"/>
    <!-- Bottle label -->
    <rect x="-42" y="-60" width="84" height="130" rx="8" fill="#FDFBF7"/>
    <text x="0" y="-30" text-anchor="middle" font-family="'Playfair Display', serif" font-size="13" font-weight="900" fill="#0B3D2E">PATANGIA'S</text>
    <line x1="-30" y1="-20" x2="30" y2="-20" stroke="#C9A227" stroke-width="1.5"/>
    <text x="0" y="-5" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="9" font-weight="700" fill="#0B3D2E">HERBAL</text>
    <text x="0" y="10" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" font-weight="700" fill="#0B3D2E">SHAMPOO</text>
    <circle cx="0" cy="25" r="8" fill="#C9A227"/>
    <text x="0" y="47" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7" font-weight="600" fill="#555">12 HERBAL BLEND</text>
    <text x="0" y="60" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7" font-weight="700" fill="#0B3D2E">300 ML</text>

    <!-- Floating badge -->
    <g transform="translate(70, -80)">
      <circle cx="0" cy="0" r="42" fill="#C9A227" stroke="#FFFFFF" stroke-width="2"/>
      <text x="0" y="-8" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="11" font-weight="800" fill="#0B3D2E">100%</text>
      <text x="0" y="8" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="11" font-weight="800" fill="#0B3D2E">NATURAL</text>
      <text x="0" y="20" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" font-weight="700" fill="#0B3D2E">ORGANIC</text>
    </g>
  </g>
</svg>
`;

// 3. Product (800x800)
const productSvg = `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="prodBg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F4EFE6"/>
      <stop offset="100%" stop-color="#E2DAC9"/>
    </radialGradient>
    <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#B8861B"/>
      <stop offset="25%" stop-color="#FCE588"/>
      <stop offset="50%" stop-color="#C9A227"/>
      <stop offset="75%" stop-color="#FFEFA7"/>
      <stop offset="100%" stop-color="#996E0F"/>
    </linearGradient>
    <linearGradient id="bottleBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#061D15"/>
      <stop offset="20%" stop-color="#0B3D2E"/>
      <stop offset="45%" stop-color="#145A45"/>
      <stop offset="70%" stop-color="#0B3D2E"/>
      <stop offset="100%" stop-color="#04150F"/>
    </linearGradient>
    <linearGradient id="bottleGloss" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="bottleShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="30" stdDeviation="25" flood-color="#092A20" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Studio Background -->
  <rect width="800" height="800" fill="url(#prodBg)"/>

  <!-- Soft Pedestal / Ground Shadow -->
  <ellipse cx="400" cy="710" rx="220" ry="32" fill="#A89A84" opacity="0.45" filter="blur(8px)"/>
  <ellipse cx="400" cy="708" rx="140" ry="18" fill="#0B3D2E" opacity="0.4"/>

  <!-- Bottle Group -->
  <g filter="url(#bottleShadow)">
    <!-- Pump Dispenser top -->
    <path d="M370,110 L430,110 L430,125 C430,135 440,140 455,140 L490,140 C495,140 500,145 498,150 L480,165 C475,170 468,172 460,172 L425,172 L425,190 L375,190 L375,172 L360,172 C350,172 345,160 350,150 Z" fill="url(#goldMetal)"/>
    <rect x="382" y="190" width="36" height="35" rx="3" fill="#222"/>

    <!-- Gold Collar Ring -->
    <rect x="355" y="220" width="90" height="35" rx="5" fill="url(#goldMetal)"/>
    <line x1="355" y1="230" x2="445" y2="230" stroke="#FFEFA7" stroke-width="2"/>
    <line x1="355" y1="245" x2="445" y2="245" stroke="#8A630D" stroke-width="2"/>

    <!-- Bottle Body -->
    <path d="M320,270 C320,250 350,250 360,250 L440,250 C450,250 480,250 480,270 L495,580 C495,640 475,670 450,670 L350,670 C325,670 305,640 305,580 Z" fill="url(#bottleBody)"/>
    
    <!-- Gloss Highlight strip -->
    <path d="M340,260 L360,260 L350,665 L335,665 Z" fill="url(#bottleGloss)"/>

    <!-- Label Backdrop -->
    <g transform="translate(325, 330)">
      <rect x="0" y="0" width="150" height="260" rx="14" fill="#FAF6EE" stroke="url(#goldMetal)" stroke-width="2.5"/>
      <rect x="6" y="6" width="138" height="248" rx="10" fill="none" stroke="#C9A227" stroke-width="1" stroke-dasharray="4,3"/>

      <!-- Label Brand Logo Icon -->
      <g transform="translate(75, 30)">
        <circle cx="0" cy="0" r="16" fill="#0B3D2E"/>
        <path d="M0,-10 C4,-5 6,-1 0,6 C-6,-1 -4,-5 0,-10 Z" fill="#C9A227"/>
      </g>

      <text x="75" y="65" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', serif" font-size="16" font-weight="900" fill="#0B3D2E" letter-spacing="2">PATANGIA'S</text>
      
      <line x1="25" y1="74" x2="125" y2="74" stroke="#C9A227" stroke-width="1"/>
      <circle cx="75" cy="74" r="2.5" fill="#C9A227"/>

      <text x="75" y="92" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="800" fill="#0B3D2E" letter-spacing="1">HERBAL SHAMPOO</text>
      <text x="75" y="108" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-size="8.5" font-style="italic" fill="#886B16">100% Organic &amp; Pure</text>

      <!-- 12 Herbs badge -->
      <rect x="20" y="120" width="110" height="24" rx="12" fill="#0B3D2E"/>
      <text x="75" y="136" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="9" font-weight="700" fill="#FCE082" letter-spacing="0.5">12 HERBAL BLEND</text>

      <!-- Herb icons list on label -->
      <text x="75" y="160" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" font-weight="600" fill="#444">Amla • Shikakai • Rosemary</text>
      <text x="75" y="172" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" font-weight="600" fill="#444">Flaxseed • Rose • Methi • Kalonji</text>
      <text x="75" y="184" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" font-weight="600" fill="#444">Rice Water • Vit E • Aloe Vera</text>

      <!-- Benefits bullet points -->
      <g transform="translate(18, 196)">
        <text x="0" y="10" font-family="'Montserrat', sans-serif" font-size="7" font-weight="700" fill="#0B3D2E">✓ Stops Hair Fall</text>
        <text x="0" y="21" font-family="'Montserrat', sans-serif" font-size="7" font-weight="700" fill="#0B3D2E">✓ Boosts Fast Growth</text>
        <text x="65" y="10" font-family="'Montserrat', sans-serif" font-size="7" font-weight="700" fill="#0B3D2E">✓ Strong Roots</text>
        <text x="65" y="21" font-family="'Montserrat', sans-serif" font-size="7" font-weight="700" fill="#0B3D2E">✓ Prevents White Hair</text>
      </g>

      <!-- Volume -->
      <text x="75" y="244" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="9" font-weight="800" fill="#0B3D2E" letter-spacing="1">NET WT. 300 ML</text>
    </g>
  </g>

  <!-- Side Floating Guarantee Badges -->
  <g transform="translate(130, 260)">
    <circle cx="0" cy="0" r="48" fill="#FFFFFF" stroke="url(#goldMetal)" stroke-width="2.5" filter="url(#bottleShadow)"/>
    <circle cx="0" cy="0" r="42" fill="#FDFBF7"/>
    <text x="0" y="-12" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" font-weight="800" fill="#0B3D2E">100%</text>
    <text x="0" y="2" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="9" font-weight="700" fill="#C9A227">NATURAL</text>
    <text x="0" y="15" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" font-weight="600" fill="#333">NO CHEMICALS</text>
  </g>

  <g transform="translate(670, 280)">
    <circle cx="0" cy="0" r="48" fill="#0B3D2E" stroke="url(#goldMetal)" stroke-width="2.5" filter="url(#bottleShadow)"/>
    <text x="0" y="-14" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="9" font-weight="700" fill="#FCE082">ORIGINAL</text>
    <text x="0" y="4" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="14" font-weight="900" fill="#FFFFFF">12</text>
    <text x="0" y="18" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" font-weight="600" fill="#FCE082">HERBS FORMULA</text>
  </g>

  <g transform="translate(680, 460)">
    <rect x="-60" y="-25" width="120" height="50" rx="25" fill="#FFFFFF" stroke="#0B3D2E" stroke-width="2" filter="url(#bottleShadow)"/>
    <text x="0" y="-4" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="9" font-weight="700" fill="#0B3D2E">MADE IN</text>
    <text x="0" y="12" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="11" font-weight="900" fill="#0B3D2E">PAKISTAN 🇵🇰</text>
  </g>
</svg>
`;

async function run() {
  console.log('Generating images...');
  await sharp(Buffer.from(logoSvg)).png().toFile(path.join(publicDir, 'logo.png'));
  console.log('logo.png generated');

  await sharp(Buffer.from(bannerSvg)).png().toFile(path.join(publicDir, 'banner.png'));
  console.log('banner.png generated');

  await sharp(Buffer.from(productSvg)).png().toFile(path.join(publicDir, 'product.png'));
  console.log('product.png generated');
  console.log('All images created in /public directory!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
