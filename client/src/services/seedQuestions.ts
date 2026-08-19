import { QuestionDTO } from '../../../shared/types';

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. PUZZLE 1: CAMPUS TECH PARK & CLOCK TOWER
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
  <rect width="800" height="420" fill="url(#sky1)"/>
  <circle cx="120" cy="90" r="45" fill="#facc15" filter="drop-shadow(0 0 10px #fbbf24)"/>
  <g fill="#ffffff" opacity="0.9">
    <ellipse cx="280" cy="80" rx="50" ry="25"/>
    <ellipse cx="310" cy="70" rx="40" ry="25"/>
    <ellipse cx="250" cy="85" rx="35" ry="20"/>
  </g>
  <g fill="#ffffff" opacity="0.9">
    <ellipse cx="640" cy="95" rx="45" ry="22"/>
    <ellipse cx="670" cy="85" rx="35" ry="20"/>
  </g>
  <rect y="420" width="800" height="180" fill="url(#grass1)"/>
  <path d="M0 500 Q 400 480 800 500 L 800 600 L 0 600 Z" fill="#334155"/>
  <line x1="0" y1="550" x2="800" y2="550" stroke="#fef08a" stroke-width="6" stroke-dasharray="30, 20"/>
  <rect x="360" y="160" width="160" height="280" fill="url(#tower1)" rx="4"/>
  <polygon points="440,80 340,160 540,160" fill="#991b1b"/>
  <circle cx="440" cy="220" r="38" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
  <line x1="440" y1="220" x2="440" y2="195" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
  <line x1="440" y1="220" x2="465" y2="220" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
  <rect x="390" y="280" width="35" height="45" fill="#fde047" rx="3" stroke="#475569" stroke-width="2"/>
  <rect x="455" y="280" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <rect x="390" y="345" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <rect x="455" y="345" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <rect x="180" y="330" width="30" height="110" fill="#78350f"/>
  <circle cx="195" cy="300" r="65" fill="#15803d"/>
  <circle cx="175" cy="285" r="10" fill="#ef4444"/>
  <circle cx="215" cy="320" r="10" fill="#ef4444"/>
  <g id="car-left">
    <rect x="520" y="520" width="130" height="40" rx="8" fill="#ef4444"/>
    <path d="M545 520 L565 490 L615 490 L635 520 Z" fill="#b91c1c"/>
    <rect x="568" y="495" width="42" height="22" rx="3" fill="#bae6fd"/>
    <circle cx="550" cy="560" r="14" fill="#0f172a"/>
    <circle cx="550" cy="560" r="6" fill="#cbd5e1"/>
    <circle cx="620" cy="560" r="14" fill="#0f172a"/>
    <circle cx="620" cy="560" r="6" fill="#cbd5e1"/>
    <circle cx="645" cy="535" r="5" fill="#fef08a"/>
  </g>
</svg>`;

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
  <rect width="800" height="420" fill="url(#sky1)"/>
  <circle cx="120" cy="90" r="45" fill="#facc15" filter="drop-shadow(0 0 10px #fbbf24)"/>
  <g fill="#ffffff" opacity="0.9">
    <ellipse cx="280" cy="80" rx="50" ry="25"/>
    <ellipse cx="310" cy="70" rx="40" ry="25"/>
    <ellipse cx="250" cy="85" rx="35" ry="20"/>
  </g>
  <rect y="420" width="800" height="180" fill="url(#grass1)"/>
  <path d="M0 500 Q 400 480 800 500 L 800 600 L 0 600 Z" fill="#334155"/>
  <line x1="0" y1="550" x2="800" y2="550" stroke="#fef08a" stroke-width="6" stroke-dasharray="30, 20"/>
  <rect x="360" y="160" width="160" height="280" fill="url(#tower1)" rx="4"/>
  <polygon points="440,80 340,160 540,160" fill="#991b1b"/>
  <circle cx="440" cy="220" r="38" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
  <line x1="440" y1="220" x2="440" y2="245" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
  <line x1="440" y1="220" x2="465" y2="220" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
  <rect x="390" y="280" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <rect x="455" y="280" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <rect x="390" y="345" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <rect x="455" y="345" width="35" height="45" fill="#1e293b" rx="3" stroke="#475569" stroke-width="2"/>
  <rect x="180" y="330" width="30" height="110" fill="#78350f"/>
  <circle cx="195" cy="300" r="65" fill="#15803d"/>
  <circle cx="175" cy="285" r="10" fill="#ef4444"/>
  <g id="car-right">
    <rect x="520" y="520" width="130" height="40" rx="8" fill="#3b82f6"/>
    <path d="M545 520 L565 490 L615 490 L635 520 Z" fill="#1d4ed8"/>
    <rect x="568" y="495" width="42" height="22" rx="3" fill="#bae6fd"/>
    <circle cx="550" cy="560" r="14" fill="#0f172a"/>
    <circle cx="550" cy="560" r="6" fill="#cbd5e1"/>
    <circle cx="620" cy="560" r="14" fill="#0f172a"/>
    <circle cx="620" cy="560" r="6" fill="#cbd5e1"/>
    <circle cx="645" cy="535" r="5" fill="#fef08a"/>
  </g>
</svg>`;

// 2. PUZZLE 2: ROBOTICS AI LAB
const puzzle2_LeftSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="labBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#labBg)"/>
  <g stroke="#312e81" stroke-width="1" opacity="0.4">
    <line x1="0" y1="100" x2="800" y2="100"/>
    <line x1="0" y1="200" x2="800" y2="200"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="200" y1="0" x2="200" y2="600"/>
    <line x1="400" y1="0" x2="400" y2="600"/>
    <line x1="600" y1="0" x2="600" y2="600"/>
  </g>
  <rect x="250" y="80" width="300" height="180" rx="12" fill="#0f172a" stroke="#06b6d4" stroke-width="4"/>
  <polyline points="280,180 340,130 400,200 460,110 520,150" fill="none" stroke="#22c55e" stroke-width="4"/>
  <circle cx="460" cy="110" r="8" fill="#eab308"/>
  <rect x="80" y="380" width="640" height="190" fill="#1e293b" rx="8" stroke="#334155" stroke-width="3"/>
  <rect x="330" y="240" width="140" height="140" rx="20" fill="#64748b" stroke="#94a3b8" stroke-width="3"/>
  <circle cx="370" cy="290" r="14" fill="#06b6d4"/>
  <circle cx="430" cy="290" r="14" fill="#06b6d4"/>
  <path d="M375 340 Q400 360 425 340" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="395" y="210" width="10" height="30" fill="#475569"/>
  <circle cx="400" cy="205" r="12" fill="#ef4444"/>
  <rect x="130" y="320" width="45" height="60" rx="6" fill="#3b82f6"/>
  <path d="M600 380 L630 310 L670 310 L650 380 Z" fill="#a855f7" opacity="0.8"/>
  <circle cx="645" cy="335" r="8" fill="#ec4899"/>
</svg>`;

const puzzle2_RightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="labBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#labBg)"/>
  <g stroke="#312e81" stroke-width="1" opacity="0.4">
    <line x1="0" y1="100" x2="800" y2="100"/>
    <line x1="0" y1="200" x2="800" y2="200"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="200" y1="0" x2="200" y2="600"/>
    <line x1="400" y1="0" x2="400" y2="600"/>
    <line x1="600" y1="0" x2="600" y2="600"/>
  </g>
  <rect x="250" y="80" width="300" height="180" rx="12" fill="#0f172a" stroke="#06b6d4" stroke-width="4"/>
  <polyline points="280,180 340,130 400,200 460,110 520,150" fill="none" stroke="#22c55e" stroke-width="4"/>
  <rect x="80" y="380" width="640" height="190" fill="#1e293b" rx="8" stroke="#334155" stroke-width="3"/>
  <rect x="330" y="240" width="140" height="140" rx="20" fill="#64748b" stroke="#94a3b8" stroke-width="3"/>
  <circle cx="370" cy="290" r="14" fill="#06b6d4"/>
  <circle cx="430" cy="290" r="14" fill="#06b6d4"/>
  <path d="M375 350 Q400 330 425 350" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="395" y="210" width="10" height="30" fill="#475569"/>
  <circle cx="400" cy="205" r="12" fill="#22c55e"/>
  <path d="M600 380 L630 310 L670 310 L650 380 Z" fill="#a855f7" opacity="0.8"/>
</svg>`;

export const FALLBACK_SEED_QUESTIONS: QuestionDTO[] = [
  {
    id: 'q_campus_1',
    title: 'Round 1: Smart Campus Clock Tower',
    imageA: svgToDataUrl(puzzle1_LeftSvg),
    imageB: svgToDataUrl(puzzle1_RightSvg),
    difficulty: 'medium',
    timeLimit: 35,
    points: 10,
    totalDifferences: 5,
    differenceRegions: [
      { id: 'diff1_1', name: 'Clock Hand Position', x: 55.0, y: 38.3, width: 12.0, height: 12.0 },
      { id: 'diff1_2', name: 'Car Color (Red vs Blue)', x: 73.1, y: 88.3, width: 18.0, height: 15.0 },
      { id: 'diff1_3', name: 'Extra Cloud on Sky', x: 81.8, y: 15.8, width: 15.0, height: 10.0 },
      { id: 'diff1_4', name: 'Tree Fruit (Apple)', x: 26.8, y: 53.3, width: 10.0, height: 10.0 },
      { id: 'diff1_5', name: 'Lit Window Light', x: 50.9, y: 50.4, width: 8.0, height: 10.0 }
    ]
  },
  {
    id: 'q_robotics_2',
    title: 'Round 2: Robotics & AI Automation Lab',
    imageA: svgToDataUrl(puzzle2_LeftSvg),
    imageB: svgToDataUrl(puzzle2_RightSvg),
    difficulty: 'hard',
    timeLimit: 40,
    points: 10,
    totalDifferences: 5,
    differenceRegions: [
      { id: 'diff2_1', name: 'Antenna Light Color', x: 50.0, y: 34.1, width: 10.0, height: 10.0 },
      { id: 'diff2_2', name: 'Robot Smile Expression', x: 50.0, y: 57.5, width: 14.0, height: 10.0 },
      { id: 'diff2_3', name: 'Graph Indicator Point', x: 57.5, y: 18.3, width: 8.0, height: 8.0 },
      { id: 'diff2_4', name: 'Desktop Blue Mug', x: 19.1, y: 58.3, width: 10.0, height: 12.0 },
      { id: 'diff2_5', name: 'Flask Chemical Bubble', x: 80.6, y: 55.8, width: 8.0, height: 8.0 }
    ]
  }
];
