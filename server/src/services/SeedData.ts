import { store, StoredQuestion } from '../models/store';

// Helper to encode SVG into Data URL
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. PUZZLE 1: CAMPUS TECH PARK & CLOCK TOWER (Differences: Clock hands, Red Car color, Extra Cloud, Tree Apple, Window Light)
const puzzle1_LeftSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <linearGradient id="grass1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="tower1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>
  <!-- Sky & Sun -->
  <rect width="800" height="420" fill="url(#sky1)"/>
  <circle cx="120" cy="90" r="45" fill="#facc15" filter="drop-shadow(0 0 10px #fbbf24)"/>

  <!-- Clouds -->
  <g fill="#ffffff" opacity="0.9">
    <ellipse cx="280" cy="80" rx="50" ry="25"/>
    <ellipse cx="310" cy="70" rx="40" ry="25"/>
    <ellipse cx="250" cy="85" rx="35" ry="20"/>
  </g>
  <!-- Extra Cloud Left ONLY -->
  <g fill="#ffffff" opacity="0.9">
    <ellipse cx="640" cy="95" rx="45" ry="22"/>
    <ellipse cx="670" cy="85" rx="35" ry="20"/>
  </g>

  <!-- Ground -->
  <rect y="420" width="800" height="180" fill="url(#grass1)"/>
  <!-- Road -->
  <path d="M0 500 Q 400 480 800 500 L 800 600 L 0 600 Z" fill="#334155"/>
  <line x1="0" y1="550" x2="800" y2="550" stroke="#fef08a" stroke-width="6" stroke-dasharray="30, 20"/>

  <!-- College Building & Clock Tower -->
  <rect x="360" y="160" width="160" height="280" fill="url(#tower1)" rx="4"/>
  <polygon points="440,80 340,160 540,160" fill="#991b1b"/>
  <!-- Clock -->
  <circle cx="440" cy="220" r="38" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
  <!-- Clock hands: 3:00 on Left -->
  <line x1="440" y1="220" x2="440" y2="195" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
  <line x1="440" y1="220" x2="465" y2="220" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>

  <!-- Windows -->
  <!-- Window 1 (Lit Yellow on Left) -->
  <rect x="390" y="280" width="35" height="45" fill="#fde047" rx="3" stroke="#475569" stroke-width="2"/>
  <!-- Window 2 (Dark) -->
  <rect x="455" y="280" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <!-- Window 3 -->
  <rect x="390" y="345" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <!-- Window 4 -->
  <rect x="455" y="345" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>

  <!-- Tree on Left Side -->
  <rect x="180" y="330" width="30" height="110" fill="#78350f"/>
  <circle cx="195" cy="300" r="65" fill="#15803d"/>
  <!-- Red Apple on Left Tree -->
  <circle cx="170" cy="285" r="10" fill="#ef4444"/>

  <!-- Sports Car on Road (RED on Left) -->
  <g transform="translate(180, 480)">
    <rect x="0" y="20" width="130" height="35" rx="10" fill="#ef4444"/>
    <path d="M 25 20 Q 45 0 75 0 Q 100 0 115 20 Z" fill="#ef4444"/>
    <circle cx="35" cy="55" r="15" fill="#0f172a"/>
    <circle cx="35" cy="55" r="7" fill="#94a3b8"/>
    <circle cx="105" cy="55" r="15" fill="#0f172a"/>
    <circle cx="105" cy="55" r="7" fill="#94a3b8"/>
    <circle cx="125" cy="30" r="6" fill="#fef08a"/>
  </g>
</svg>
`;

const puzzle1_RightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <linearGradient id="grass1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="tower1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>
  <!-- Sky & Sun -->
  <rect width="800" height="420" fill="url(#sky1)"/>
  <circle cx="120" cy="90" r="45" fill="#facc15" filter="drop-shadow(0 0 10px #fbbf24)"/>

  <!-- Clouds (Left cloud present) -->
  <g fill="#ffffff" opacity="0.9">
    <ellipse cx="280" cy="80" rx="50" ry="25"/>
    <ellipse cx="310" cy="70" rx="40" ry="25"/>
    <ellipse cx="250" cy="85" rx="35" ry="20"/>
  </g>
  <!-- DIFFERENCE 1: Missing cloud on top right -->

  <!-- Ground -->
  <rect y="420" width="800" height="180" fill="url(#grass1)"/>
  <!-- Road -->
  <path d="M0 500 Q 400 480 800 500 L 800 600 L 0 600 Z" fill="#334155"/>
  <line x1="0" y1="550" x2="800" y2="550" stroke="#fef08a" stroke-width="6" stroke-dasharray="30, 20"/>

  <!-- College Building & Clock Tower -->
  <rect x="360" y="160" width="160" height="280" fill="url(#tower1)" rx="4"/>
  <polygon points="440,80 340,160 540,160" fill="#991b1b"/>
  <!-- Clock -->
  <circle cx="440" cy="220" r="38" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
  <!-- DIFFERENCE 2: Clock hands changed (9:00 on Right) -->
  <line x1="440" y1="220" x2="440" y2="195" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
  <line x1="440" y1="220" x2="415" y2="220" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>

  <!-- Windows -->
  <!-- DIFFERENCE 3: Window 1 is dark (not yellow) -->
  <rect x="390" y="280" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <!-- Window 2 -->
  <rect x="455" y="280" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <!-- Window 3 -->
  <rect x="390" y="345" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <!-- Window 4 -->
  <rect x="455" y="345" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>

  <!-- Tree on Left Side -->
  <rect x="180" y="330" width="30" height="110" fill="#78350f"/>
  <circle cx="195" cy="300" r="65" fill="#15803d"/>
  <!-- DIFFERENCE 4: Apple is missing from tree -->

  <!-- Sports Car on Road (DIFFERENCE 5: Car is BLUE on Right) -->
  <g transform="translate(180, 480)">
    <rect x="0" y="20" width="130" height="35" rx="10" fill="#2563eb"/>
    <path d="M 25 20 Q 45 0 75 0 Q 100 0 115 20 Z" fill="#2563eb"/>
    <circle cx="35" cy="55" r="15" fill="#0f172a"/>
    <circle cx="35" cy="55" r="7" fill="#94a3b8"/>
    <circle cx="105" cy="55" r="15" fill="#0f172a"/>
    <circle cx="105" cy="55" r="7" fill="#94a3b8"/>
    <circle cx="125" cy="30" r="6" fill="#fef08a"/>
  </g>
</svg>
`;

// 2. PUZZLE 2: ROBOT LAB & AI ROBOT (Differences: Antenna bulb, Screen expression, Chest heart, Left robot arm angle, Power socket)
const puzzle2_LeftSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#0f172a"/>
  <!-- Lab background tiles -->
  <g stroke="#1e293b" stroke-width="2">
    <line x1="100" y1="0" x2="100" y2="600"/>
    <line x1="300" y1="0" x2="300" y2="600"/>
    <line x1="500" y1="0" x2="500" y2="600"/>
    <line x1="700" y1="0" x2="700" y2="600"/>
    <line x1="0" y1="150" x2="800" y2="150"/>
    <line x1="0" y1="350" x2="800" y2="350"/>
    <line x1="0" y1="500" x2="800" y2="500"/>
  </g>
  <!-- Power socket on wall (Left has socket) -->
  <rect x="680" y="400" width="40" height="50" rx="6" fill="#475569"/>
  <circle cx="693" cy="425" r="4" fill="#020617"/>
  <circle cx="707" cy="425" r="4" fill="#020617"/>

  <!-- Robot Character -->
  <!-- Antenna with Glowing Green Light -->
  <line x1="400" y1="140" x2="400" y2="70" stroke="#94a3b8" stroke-width="8"/>
  <circle cx="400" cy="60" r="18" fill="#22c55e" filter="drop-shadow(0 0 8px #4ade80)"/>

  <!-- Head -->
  <rect x="300" y="140" width="200" height="150" rx="24" fill="#3b82f6" stroke="#60a5fa" stroke-width="6"/>
  <!-- Face Screen -->
  <rect x="330" y="170" width="140" height="90" rx="14" fill="#020617"/>
  <!-- Eyes Smiling Curved -->
  <path d="M 350 215 Q 365 195 380 215" stroke="#38bdf8" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M 420 215 Q 435 195 450 215" stroke="#38bdf8" stroke-width="6" fill="none" stroke-linecap="round"/>

  <!-- Body -->
  <rect x="280" y="310" width="240" height="180" rx="20" fill="#1d4ed8"/>
  <!-- Chest Badge: Glowing Heart on Left -->
  <circle cx="400" cy="380" r="35" fill="#ef4444" filter="drop-shadow(0 0 10px #f87171)"/>

  <!-- Left Arm (Waving UP on Left) -->
  <path d="M 280 340 L 210 270 L 190 230" stroke="#93c5fd" stroke-width="20" stroke-linecap="round" fill="none"/>

  <!-- Right Arm -->
  <path d="M 520 340 L 590 390 L 610 440" stroke="#93c5fd" stroke-width="20" stroke-linecap="round" fill="none"/>

  <!-- Wheels / Legs -->
  <rect x="340" y="500" width="40" height="50" fill="#64748b"/>
  <rect x="420" y="500" width="40" height="50" fill="#64748b"/>
  <ellipse cx="400" cy="555" rx="110" ry="25" fill="#334155"/>
</svg>
`;

const puzzle2_RightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#0f172a"/>
  <!-- Lab background tiles -->
  <g stroke="#1e293b" stroke-width="2">
    <line x1="100" y1="0" x2="100" y2="600"/>
    <line x1="300" y1="0" x2="300" y2="600"/>
    <line x1="500" y1="0" x2="500" y2="600"/>
    <line x1="700" y1="0" x2="700" y2="600"/>
    <line x1="0" y1="150" x2="800" y2="150"/>
    <line x1="0" y1="350" x2="800" y2="350"/>
    <line x1="0" y1="500" x2="800" y2="500"/>
  </g>
  <!-- DIFFERENCE 1: Missing power socket on wall -->

  <!-- Robot Character -->
  <!-- Antenna: DIFFERENCE 2: Red Bulb (not green) -->
  <line x1="400" y1="140" x2="400" y2="70" stroke="#94a3b8" stroke-width="8"/>
  <circle cx="400" cy="60" r="18" fill="#ef4444" filter="drop-shadow(0 0 8px #f87171)"/>

  <!-- Head -->
  <rect x="300" y="140" width="200" height="150" rx="24" fill="#3b82f6" stroke="#60a5fa" stroke-width="6"/>
  <!-- Face Screen -->
  <rect x="330" y="170" width="140" height="90" rx="14" fill="#020617"/>
  <!-- Eyes: DIFFERENCE 3: Round Dots instead of Smiles -->
  <circle cx="365" cy="210" r="10" fill="#38bdf8"/>
  <circle cx="435" cy="210" r="10" fill="#38bdf8"/>

  <!-- Body -->
  <rect x="280" y="310" width="240" height="180" rx="20" fill="#1d4ed8"/>
  <!-- Chest: DIFFERENCE 4: Star instead of Heart -->
  <polygon points="400,350 408,372 432,372 412,386 420,408 400,394 380,408 388,386 368,372 392,372" fill="#eab308"/>

  <!-- Left Arm: DIFFERENCE 5: Arm pointing DOWN -->
  <path d="M 280 340 L 210 390 L 190 440" stroke="#93c5fd" stroke-width="20" stroke-linecap="round" fill="none"/>

  <!-- Right Arm -->
  <path d="M 520 340 L 590 390 L 610 440" stroke="#93c5fd" stroke-width="20" stroke-linecap="round" fill="none"/>

  <!-- Wheels / Legs -->
  <rect x="340" y="500" width="40" height="50" fill="#64748b"/>
  <rect x="420" y="500" width="40" height="50" fill="#64748b"/>
  <ellipse cx="400" cy="555" rx="110" ry="25" fill="#334155"/>
</svg>
`;

// 3. PUZZLE 3: BOTANICAL GARDEN & FLOWER POT (Differences: Flower Petal count, Butterfly color, Pot Stripe, Water Droplet, Snail)
const puzzle3_LeftSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#fdf4ff"/>
  <rect y="460" width="800" height="140" fill="#a7f3d0"/>
  <!-- Wooden Table -->
  <rect x="150" y="440" width="500" height="30" rx="4" fill="#92400e"/>
  <rect x="200" y="470" width="30" height="130" fill="#78350f"/>
  <rect x="570" y="470" width="30" height="130" fill="#78350f"/>

  <!-- Plant Pot -->
  <polygon points="320,440 480,440 450,290 350,290" fill="#ea580c"/>
  <!-- Pot horizontal band (YELLOW on Left) -->
  <rect x="345" y="350" width="110" height="20" fill="#facc15"/>

  <!-- Stem and Leaves -->
  <path d="M 400 290 Q 380 200 400 120" stroke="#16a34a" stroke-width="14" fill="none"/>
  <ellipse cx="340" cy="220" rx="40" ry="20" fill="#22c55e" transform="rotate(-25 340 220)"/>
  <ellipse cx="460" cy="190" rx="40" ry="20" fill="#22c55e" transform="rotate(25 460 190)"/>

  <!-- Giant Sunflower (8 Petals) -->
  <g transform="translate(400, 120)">
    <!-- Petals -->
    <circle cx="0" cy="-55" r="22" fill="#fbbf24"/>
    <circle cx="39" cy="-39" r="22" fill="#fbbf24"/>
    <circle cx="55" cy="0" r="22" fill="#fbbf24"/>
    <circle cx="39" cy="39" r="22" fill="#fbbf24"/>
    <circle cx="0" cy="55" r="22" fill="#fbbf24"/>
    <circle cx="-39" cy="39" r="22" fill="#fbbf24"/>
    <circle cx="-55" cy="0" r="22" fill="#fbbf24"/>
    <circle cx="-39" cy="-39" r="22" fill="#fbbf24"/>
    <!-- Center Core -->
    <circle cx="0" cy="0" r="38" fill="#713f12"/>
    <circle cx="0" cy="0" r="30" fill="#451a03"/>
  </g>

  <!-- Blue Butterfly Top Left -->
  <g transform="translate(180, 130)">
    <ellipse cx="-15" cy="-10" rx="20" ry="14" fill="#3b82f6"/>
    <ellipse cx="15" cy="-10" rx="20" ry="14" fill="#3b82f6"/>
    <ellipse cx="-10" cy="12" rx="14" ry="10" fill="#60a5fa"/>
    <ellipse cx="10" cy="12" rx="14" ry="10" fill="#60a5fa"/>
    <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="4"/>
  </g>

  <!-- Snail on Right Side of Table (Left has Snail) -->
  <g transform="translate(600, 410)">
    <circle cx="20" cy="15" r="20" fill="#b45309"/>
    <path d="M 0 30 Q 30 15 50 30" stroke="#d97706" stroke-width="12" fill="none" stroke-linecap="round"/>
  </g>
</svg>
`;

const puzzle3_RightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#fdf4ff"/>
  <rect y="460" width="800" height="140" fill="#a7f3d0"/>
  <!-- Wooden Table -->
  <rect x="150" y="440" width="500" height="30" rx="4" fill="#92400e"/>
  <rect x="200" y="470" width="30" height="130" fill="#78350f"/>
  <rect x="570" y="470" width="30" height="130" fill="#78350f"/>

  <!-- Plant Pot -->
  <polygon points="320,440 480,440 450,290 350,290" fill="#ea580c"/>
  <!-- DIFFERENCE 1: Pot band is WHITE/CYAN (not Yellow) -->
  <rect x="345" y="350" width="110" height="20" fill="#06b6d4"/>

  <!-- Stem and Leaves -->
  <path d="M 400 290 Q 380 200 400 120" stroke="#16a34a" stroke-width="14" fill="none"/>
  <!-- DIFFERENCE 2: Left Leaf Missing -->
  <ellipse cx="460" cy="190" rx="40" ry="20" fill="#22c55e" transform="rotate(25 460 190)"/>

  <!-- Giant Sunflower -->
  <g transform="translate(400, 120)">
    <!-- DIFFERENCE 3: Missing Top Petal -->
    <circle cx="39" cy="-39" r="22" fill="#fbbf24"/>
    <circle cx="55" cy="0" r="22" fill="#fbbf24"/>
    <circle cx="39" cy="39" r="22" fill="#fbbf24"/>
    <circle cx="0" cy="55" r="22" fill="#fbbf24"/>
    <circle cx="-39" cy="39" r="22" fill="#fbbf24"/>
    <circle cx="-55" cy="0" r="22" fill="#fbbf24"/>
    <circle cx="-39" cy="-39" r="22" fill="#fbbf24"/>
    <!-- Center Core -->
    <circle cx="0" cy="0" r="38" fill="#713f12"/>
    <circle cx="0" cy="0" r="30" fill="#451a03"/>
  </g>

  <!-- DIFFERENCE 4: Butterfly is PINK (not Blue) -->
  <g transform="translate(180, 130)">
    <ellipse cx="-15" cy="-10" rx="20" ry="14" fill="#ec4899"/>
    <ellipse cx="15" cy="-10" rx="20" ry="14" fill="#ec4899"/>
    <ellipse cx="-10" cy="12" rx="14" ry="10" fill="#f472b6"/>
    <ellipse cx="10" cy="12" rx="14" ry="10" fill="#f472b6"/>
    <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="4"/>
  </g>

  <!-- DIFFERENCE 5: Snail is completely missing -->
</svg>
`;

export const SEED_QUESTIONS: StoredQuestion[] = [
  {
    id: 'demo-q1',
    title: 'Puzzle 01 — Campus Clock Tower & Sports Car',
    difficulty: 'easy',
    timeLimit: 30,
    points: 10,
    totalDifferences: 5,
    imageA: svgToDataUrl(puzzle1_LeftSvg),
    imageB: svgToDataUrl(puzzle1_RightSvg),
    createdAt: new Date().toISOString(),
    differenceRegions: [
      {
        id: 'p1-d1',
        name: 'Top Right Cloud (Missing on Right)',
        x: 80.0, // (640 / 800) * 100
        y: 15.0, // (90 / 600) * 100
        width: 15.0,
        height: 12.0,
        imageTarget: 'both'
      },
      {
        id: 'p1-d2',
        name: 'Clock Tower Hand Position (3:00 vs 9:00)',
        x: 55.0, // (440 / 800) * 100
        y: 36.6, // (220 / 600) * 100
        width: 12.0,
        height: 15.0,
        imageTarget: 'both'
      },
      {
        id: 'p1-d3',
        name: 'Tower Top Left Window (Light On/Off)',
        x: 50.5, // (405 / 800) * 100
        y: 50.5, // (302 / 600) * 100
        width: 8.0,
        height: 10.0,
        imageTarget: 'both'
      },
      {
        id: 'p1-d4',
        name: 'Left Tree Apple (Present vs Missing)',
        x: 21.2, // (170 / 800) * 100
        y: 47.5, // (285 / 600) * 100
        width: 7.0,
        height: 8.0,
        imageTarget: 'both'
      },
      {
        id: 'p1-d5',
        name: 'Sports Car Color (Red vs Blue)',
        x: 30.6, // (245 / 800) * 100
        y: 84.5, // (507 / 600) * 100
        width: 20.0,
        height: 14.0,
        imageTarget: 'both'
      }
    ]
  },
  {
    id: 'demo-q2',
    title: 'Puzzle 02 — Cybernetics AI Robotics Lab',
    difficulty: 'medium',
    timeLimit: 30,
    points: 10,
    totalDifferences: 5,
    imageA: svgToDataUrl(puzzle2_LeftSvg),
    imageB: svgToDataUrl(puzzle2_RightSvg),
    createdAt: new Date().toISOString(),
    differenceRegions: [
      {
        id: 'p2-d1',
        name: 'Wall Power Socket (Right Wall)',
        x: 87.5,
        y: 71.0,
        width: 8.0,
        height: 12.0,
        imageTarget: 'both'
      },
      {
        id: 'p2-d2',
        name: 'Antenna Glow Color (Green vs Red)',
        x: 50.0,
        y: 10.0,
        width: 10.0,
        height: 12.0,
        imageTarget: 'both'
      },
      {
        id: 'p2-d3',
        name: 'Face Expression (Happy Curves vs Dots)',
        x: 50.0,
        y: 35.0,
        width: 18.0,
        height: 15.0,
        imageTarget: 'both'
      },
      {
        id: 'p2-d4',
        name: 'Chest Icon (Heart vs Star)',
        x: 50.0,
        y: 63.3,
        width: 14.0,
        height: 15.0,
        imageTarget: 'both'
      },
      {
        id: 'p2-d5',
        name: 'Robot Arm Position (Waving Up vs Down)',
        x: 25.0,
        y: 55.0,
        width: 15.0,
        height: 25.0,
        imageTarget: 'both'
      }
    ]
  },
  {
    id: 'demo-q3',
    title: 'Puzzle 03 — Botanical Greenhouse & Sunflower',
    difficulty: 'hard',
    timeLimit: 35,
    points: 12,
    totalDifferences: 5,
    imageA: svgToDataUrl(puzzle3_LeftSvg),
    imageB: svgToDataUrl(puzzle3_RightSvg),
    createdAt: new Date().toISOString(),
    differenceRegions: [
      {
        id: 'p3-d1',
        name: 'Pot Stripe Color (Yellow vs Cyan)',
        x: 50.0,
        y: 60.0,
        width: 18.0,
        height: 10.0,
        imageTarget: 'both'
      },
      {
        id: 'p3-d2',
        name: 'Left Stem Leaf (Present vs Missing)',
        x: 42.5,
        y: 36.6,
        width: 12.0,
        height: 12.0,
        imageTarget: 'both'
      },
      {
        id: 'p3-d3',
        name: 'Top Sunflower Petal (Missing on Right)',
        x: 50.0,
        y: 11.0,
        width: 10.0,
        height: 12.0,
        imageTarget: 'both'
      },
      {
        id: 'p3-d4',
        name: 'Flying Butterfly Color (Blue vs Pink)',
        x: 22.5,
        y: 21.6,
        width: 12.0,
        height: 12.0,
        imageTarget: 'both'
      },
      {
        id: 'p3-d5',
        name: 'Snail on Table (Present vs Missing)',
        x: 77.5,
        y: 71.6,
        width: 12.0,
        height: 12.0,
        imageTarget: 'both'
      }
    ]
  }
];

export async function seedInitialQuestions() {
  const existing = await store.getAllQuestions();
  if (existing.length === 0) {
    console.log('[Seed] Populating 3 master competition demo puzzles with SVG image pairs...');
    for (const q of SEED_QUESTIONS) {
      await store.saveQuestion(q);
    }
    console.log('[Seed] Successfully seeded master puzzles.');
  }
}
