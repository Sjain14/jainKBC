# Jain KBC — कौन बनेगा ज्ञानवान

Real-time KBC-style quiz game for **Madhavganj Parivar Dashlakshan Mahaparvа**.

## URLs
| URL | Purpose |
|-----|---------|
| `/play` or `/view` | Player / audience screen (TV / mobile) |
| `/admin` | Host control panel (laptop) |
| `/admin/login` | Admin login |

## Quick Start

### 1. Install dependencies
```bash
cd jain-kbc
npm install
npm install firebase-admin --save-dev   # for seed script only
```

### 2. Configure Firebase
```bash
cp .env.example .env
# Fill in your Firebase project values in .env
```

### 3. Seed questions into Firebase
```bash
# Download service account JSON from Firebase Console
# Project Settings → Service Accounts → Generate new private key
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json"
$env:VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"
node scripts/seedQuestions.js
```

### 4. Run locally
```bash
npm run dev
# Admin: http://localhost:5173/admin
# Player: http://localhost:5173/play
```

### 5. Deploy to Vercel
```bash
# Push to GitHub, connect repo in Vercel
# Add all VITE_* env vars in Vercel project settings
```

## Sound Files
Add these 8 MP3 files to `public/sounds/`:
- `idle-bg.mp3` — ambient loop (idle screen)
- `question-bg.mp3` — tense loop (question active)
- `timer-tick.mp3` — tick sound (last 10s)
- `option-select.mp3` — option locked sound
- `correct.mp3` — correct answer fanfare
- `wrong.mp3` — wrong answer sound
- `winner.mp3` — grand winner fanfare
- `lifeline.mp3` — lifeline activation chime

## Firebase Security Rules
```json
{
  "rules": {
    "gameState": {
      ".read": true,
      ".write": "auth != null"
    },
    "questions": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "gameResults": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Keyboard Shortcuts (Admin)
| Key | Action |
|-----|--------|
| `1` | Select Option A |
| `2` | Select Option B |
| `3` | Select Option C |
| `4` | Select Option D |
| `R` | Reveal Answer |
| `P` | Pause / Resume Timer |
