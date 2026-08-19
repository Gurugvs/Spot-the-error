# 🔍 SPOT THE ERRORS — Live Multiplayer Competition Platform

> **"Find the Difference. Beat the Clock. Become the Champion."**
> 
> A modern, real-time multiplayer "Spot the Difference" competition web application designed specifically for college technical and cultural events. Built for seamless execution on a single laptop + auditorium projector with mobile-first participant interfaces.

---

## 🌟 Key Features

### 💻 Organizer & Projector (Desktop / Laptop)
- **1-Click Room Creation**: Generates unique 6-character room codes (`A7K9P2`) and high-contrast dynamic QR codes.
- **Dedicated Projector Mode (`/admin/room/:roomId/presentation`)**: Fullscreen 1080p presentation display with huge fonts, timer rings, dynamic rank transitions, and champion victory screens.
- **Live Conductor Panel**: Pause, resume, next question, restart question, end game, and kick participants in real-time.
- **Visual Image Annotation Editor**: Interactive dual-image canvas allowing organizers to draw, resize, and label rectangular difference bounding boxes stored in normalized percentages (0-100%).
- **Automated 4-Tier Tie Breaker**: Authoritatively calculates ranks via `Score -> Lowest Total Time -> Accuracy -> Earliest Submission Timestamp`.
- **Instant Result Exports**: 1-Click Excel (`spot-the-errors-results.xlsx`), CSV, and Printable Score Sheets.
- **Recharts Performance Analytics**: Score distribution brackets, puzzle accuracy percentages, and completion time metrics.
- **Instant Demo Mode**: Includes 3 master SVG difference puzzles (Clock Tower, AI Lab, Greenhouse) and a "+ Add 10 Simulated Demo Participants" test bot simulator.

### 📱 Participants (Mobile Browsers)
- **Zero App Installs**: Scan QR code -> Enter Name & Roll No -> Enter Arena.
- **Dual-Image Tap Detection**: Responsive side-by-side or tabbed view with touch coordinates normalized to percentages.
- **Instant Feedback**: Green glowing hit markers with labels, ripple tap feedback, and celebratory chimes.
- **Anti-Cheat Protection**: Correct difference coordinates are strictly protected on the backend; rate limiter prevents spam taps.
- **Disconnection Resilience**: Session tokens stored locally allow participants to refresh or reconnect without losing their score or current question state.
- **Built-in Web Audio Synthesizer**: Rich chimes, warning ticks, and victory fanfares without external audio dependencies.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, QRCode.react, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, Socket.IO, Multer, XLSX, Zod, JWT, bcryptjs |
| **Database** | MongoDB & Mongoose (with built-in high-performance In-Memory Hybrid Store fallback for instant offline execution) |
| **Real-time** | Socket.IO WebSockets |
| **Audio** | Web Audio API Synthesizer (Zero external mp3 asset failures) |

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
# In project root
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell
copy .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
- **Organizer / Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Organizer Credentials**:
  - **Username**: `admin`
  - **Password**: `admin123`

---

## 🧪 Running Automated Tests

Run the test suite verifying room creation, coordinate hit detection, tie breaker rules, anti-cheat validation, and reconnect recovery:
```bash
npm test
```

---

## 📋 How to Conduct a College Event (Organizer Playbook)

```
1. Organizer Logs In (http://localhost:5173/login)
   ↓
2. Clicks "Create Room" (sets 30s timer, +10 pts, fastest finger bonus)
   ↓
3. Opens "Launch Projector Mode" on Auditorium Projector Screen
   ↓
4. Students scan the Projected QR Code on their mobile phones
   ↓
5. Students enter Name & Roll Number -> Appear live in Organizer Lobby
   ↓
6. Organizer clicks "START GAME"
   ↓
7. Question 1 begins simultaneously on all screens with countdown ring
   ↓
8. Students tap differences -> Server validates coordinates in real-time
   ↓
9. Live Leaderboard updates dynamically on the projector screen
   ↓
10. Final Question concludes -> Champion announced with Confetti Podium
   ↓
11. Organizer clicks "Download Excel (.xlsx)" to archive official results
```

---

## 🔒 Security & Anti-Cheat Architecture

1. **Authoritative Server Scoring**: Difference regions and coordinates are **NEVER sent to participants** during an active question.
2. **Normalized Coordinates**: Taps send normalized percentage values `(x: 0-100, y: 0-100)`.
3. **Rate Limiting**: Participants are limited to max 4 taps/sec to prevent blind screen tapping.
4. **JWT Protected Admin Endpoints**: Organizer mutations require signed JWT bearer tokens.

---

## 📂 Project Structure

```
├── shared/
│   └── types.ts                 # Shared TypeScript interfaces & Socket contracts
├── server/
│   ├── src/
│   │   ├── controllers/         # REST API Controllers (Auth, Rooms, Questions, Export)
│   │   ├── db/                  # MongoDB & Hybrid In-Memory connection manager
│   │   ├── models/              # Mongoose schemas & data access layer
│   │   ├── routes/              # Express API router
│   │   ├── services/            # GameEngine, SeedData, AnalyticsService, ExcelService
│   │   ├── sockets/             # Socket.IO event router & Demo bot simulator
│   │   └── server.ts            # Server entry point
│   ├── test/
│   │   └── gameEngine.test.ts   # Automated backend test suite
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── audio/               # Web Audio API sound synthesizer
│   │   ├── components/          # DualImageSpotter, ImageAnnotationEditor, Leaderboard, etc.
│   │   ├── context/             # AuthContext, GameContext
│   │   ├── pages/               # Landing, Lobby, LiveControl, Presentation, Results, Join
│   │   ├── services/            # REST API client & Socket.IO client
│   │   ├── App.tsx              # Router & page navigation
│   │   └── main.tsx             # React entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

---

## 📄 License
MIT License. Built for College Events and Tech Fests.
