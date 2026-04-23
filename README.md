# PostureFix iOS App

A posture correction and exercise app built with React, TypeScript, and Vite — designed from the Figma Make prototype.

## 🎨 Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#4F46E5` | Main brand, CTAs, active states |
| Primary Light | `#818CF8` | Gradients, hover states |
| Primary Dark | `#3730A3` | Pressed states |
| Accent/Success | `#10B981` | Positive feedback, tips |
| Warning | `#F59E0B` | Streaks, moderate severity |
| Danger | `#EF4444` | Severe severity |
| Background | `#F8FAFC` | App background |
| Surface | `#FFFFFF` | Cards, panels |
| Text | `#0F172A` | Primary text |
| Text Secondary | `#64748B` | Descriptions |

### Category Colors
| Category | Color | Background |
|----------|-------|------------|
| Neck | `#8B5CF6` | `#F5F3FF` |
| Shoulder | `#3B82F6` | `#EFF6FF` |
| Back | `#EC4899` | `#FDF2F8` |
| Hip | `#F97316` | `#FFF7ED` |
| Knee | `#14B8A6` | `#F0FDFA` |
| Wrist | `#6366F1` | `#EEF2FF` |

### Typography
- **Display**: DM Sans (700–800 weight)
- **Body**: DM Sans (400–600 weight)
- **Mono**: JetBrains Mono

## 📁 Project Structure

```
posturefix/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── postcss.config.mjs
├── tailwind.config.js
├── .gitignore
├── README.md
├── public/
├── guidelines/
│   └── Guidelines.md                    # Design system rules & patterns
└── src/
    ├── main.tsx                          # Entry point
    ├── styles/
    │   ├── index.css                     # Global styles + animations
    │   ├── theme.css                     # CSS variables / design tokens
    │   ├── fonts.css                     # Font imports (DM Sans, JetBrains Mono)
    │   └── tailwind.css                  # Tailwind directives
    └── app/
        ├── App.tsx                       # Root component with BrowserRouter
        ├── routes.tsx                    # Route definitions (7 screens)
        ├── data/
        │   └── postureData.ts            # 6 posture problems, 16 exercises, progress data
        ├── screens/
        │   ├── Onboarding.tsx            # 3-step onboarding carousel for new users
        │   ├── Home.tsx                  # Main screen: search, categories, problem cards
        │   ├── ProblemDetail.tsx          # Problem info, affected areas, exercises, tips
        │   ├── ExerciseFlow.tsx           # Timer with intro → active → rest phases
        │   ├── Completion.tsx             # Celebration with confetti + session stats
        │   ├── Progress.tsx               # Bar charts, streaks, weekly activity
        │   └── Settings.tsx               # Toggles, profile, reminder schedule
        └── components/
            ├── Layout.tsx                 # App shell + iOS-style bottom tab bar
            ├── PostureCard.tsx            # Posture problem card with category badge
            ├── ui/
            │   ├── index.ts              # Barrel export for all UI components
            │   ├── button.tsx            # Variant button (primary/secondary/ghost/danger)
            │   ├── card.tsx              # Hoverable card with shadow transitions
            │   ├── progress.tsx          # Animated progress bar
            │   ├── badge.tsx             # Category/severity badge
            │   ├── switch.tsx            # iOS-style toggle switch
            │   ├── tabs.tsx              # Segmented tab control
            │   ├── input.tsx             # Styled input with icon support
            │   ├── avatar.tsx            # Avatar with image fallback
            │   ├── skeleton.tsx          # Shimmer loading placeholder
            │   ├── separator.tsx         # Horizontal/vertical divider
            │   ├── utils.ts              # Utility functions
            │   └── use-mobile.ts         # Mobile detection hook
            └── figma/
                └── ImageWithFallback.tsx  # Image component with emoji fallback
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## ☁️ Deploy Online (Vercel + Supabase)

1. Create a Supabase project and enable **Anonymous sign-ins** in Authentication.
2. In Supabase SQL Editor, run `supabase-minimal.sql`.
3. In Vercel, import this repo and set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. `vercel.json` already handles SPA rewrites.

### Data minimization (already implemented)

- Cloud sync stores only compact progress stats in `user_progress_snapshots`.
- No camera photos, keypoints, or full scan payloads are sent to Supabase.
- Local reset clears both `localStorage` and `sessionStorage`.

## 📲 Play Store path (after web deploy)

This app is already set up with Capacitor. For Android release:

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Then in Android Studio:

1. Build signed `AAB` (`Build > Generate Signed Bundle/APK`).
2. Create Google Play Console app.
3. Complete Data Safety + privacy policy.
4. Upload the `AAB` to internal testing, then production.

## 📱 Screens

1. **Onboarding** — 3-step carousel introducing the app, with skip option
2. **Home** — Browse posture problems by category, search, view daily stats & streak
3. **Problem Detail** — Learn about a condition, see affected areas, preview exercises
4. **Exercise Flow** — Guided exercise with countdown timer, pause/skip, rest between sets
5. **Completion** — Celebration screen with confetti animation + session stats
6. **Progress** — Weekly bar charts, duration tracking, most addressed problems
7. **Settings** — Preference toggles, reminder schedule, profile card

## 🧩 Reusable UI Components

All available via `import { Button, Card, ... } from './components/ui'`:

| Component | Description |
|-----------|-------------|
| `Button` | 4 variants (primary, secondary, ghost, danger) × 3 sizes |
| `Card` | Hoverable card with shadow transition |
| `Progress` | Animated bar with optional label |
| `Badge` | Category/severity colored badge |
| `Switch` | iOS-style toggle with smooth animation |
| `Tabs` | Segmented control (week/month, etc.) |
| `Input` | Styled input with optional icon |
| `Avatar` | Image with gradient fallback |
| `Skeleton` | Shimmer loading placeholder |
| `Separator` | Horizontal or vertical divider |
