# Jetlag Tracker — Mobile

A React Native/Expo app for tracking live game state in [Jet Lag: The Game](https://en.wikipedia.org/wiki/Jet_Lag:_The_Game) — specifically modelled on the [Taiwan: Rail Rush](https://jetlag.fandom.com/wiki/Taiwan:_Rail_Rush) season.

This is the frontend companion to the [Jetlag Tracker backend](https://github.com/nilskulawiak/jetlagtracker). It connects to that Spring Boot API to display and control live game state.

## What is Jet Lag: The Game?

Jet Lag is a travel competition show where two teams race across a country by train, claiming stations and completing challenges to earn chips. The team that controls the most stations wins.

This app gives every player a live view of the game — which stations each team owns, chip balances, available challenges, and a full action log — regardless of where they are on the map.

## Features

- **Interactive map** — pannable, zoomable map with stations and challenges as draggable markers; tap any marker to inspect or act on it
- **Game creation** — create a game manually or from a preset (Taiwan Rail Rush included); tap the map to place stations and challenges at exact coordinates
- **Challenge lifecycle** — start, complete, or fail challenges directly from the map; all challenge types supported (`CHIPS`, `MULTIPLIER`, `STEAL`, `CALL_YOUR_SHOT`)
- **Station chip placement** — place chips on a station from your team's balance.
- **Teams view** — overview of all teams, chip balances, and owned station counts
- **Action log** — append-only feed of every game event
- **GM Tools** — admin panel for adjusting game state: edit teams, challenges, and stations; delete challenge attempts if you ever misclicked during the game.
- **Responsive layout** — tab-based layout on mobile (Map / Teams / Log), sidebar layout on wider screens (tablet, web)
- **Auto-polling** — game state refreshes automatically in the background
- **Runtime backend URL** — configure the backend address in the app's Settings screen without needing to rebuild

## Tech Stack

- React Native + Expo SDK 54
- expo-router (file-based routing)
- TypeScript

## Getting Started

### Prerequisites

The backend must be running. See the [backend repository](https://github.com/nilskulawiak/jetlagtracker) for setup instructions — it runs at `http://localhost:8080` by default.

### Install and run

```bash
npm install
npx expo start
```

Scan the QR code with the [Expo Go](https://expo.dev/go) app on your phone, or press `a` / `i` to open an Android or iOS emulator.

### Configure the backend URL

The app auto-detects the backend on your local network when running via Expo Go on a physical device. If it can't connect, open the **Settings** screen in the app and enter the correct URL (e.g. `http://192.168.1.100:8080`).

Alternatively, set it at build time via an environment variable:

```bash
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:8080
```

## Commands

```bash
npm install              # install dependencies
npx expo start           # start dev server
npx expo start --android # open on Android emulator
npx expo start --ios     # open on iOS simulator
npm test                 # jest-expo
npm run lint             # eslint
```

## Project Structure

```
app/                expo-router entry point and root layout (_layout.tsx, index.tsx)
screens/
  ├── pages/        Full-page views (HomePage, PresetsPage, PresetFormPage,
  │                 ManualGameFormPage, ContinueGamePage, SettingsPage)
  ├── GameScreen.tsx       Active game view (map + challenge list)
  ├── MenuScreen.tsx       Pre-game menu
  ├── TeamChoiceScreen.tsx Team selection before entering a game
  ├── DesktopGameLayout.tsx
  └── MobileGameLayout.tsx
components/         Reusable UI pieces
hooks/              Custom React hooks
utils/              Pure helper functions
types/game.ts       TypeScript types mirroring the backend contract
api/gameApi.ts      Single API client — all backend calls go through here
assets/             Images and fonts
tests/              Jest test files
```
