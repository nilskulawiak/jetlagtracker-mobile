@AGENTS.md

# Jetlag Tracker — Mobile

Expo Go app (SDK 54) that connects to the Spring Boot backend to display and control live game state.

Always check versioned docs before writing Expo/React Native code: https://docs.expo.dev/versions/v54.0.0/

## Commands

```bash
npm install          # install dependencies
npx expo start       # start dev server (scan QR with Expo Go)
npx expo start --android
npx expo start --ios
npm test             # jest-expo
npm run lint         # eslint
```

## Project Structure

```
app/                 expo-router entry point and root layout only (_layout.tsx, index.tsx)
screens/
  ├── pages/         Full-page views (HomePage, PresetsPage, PresetFormPage,
  │                  ManualGameFormPage, ContinueGamePage, SettingsPage)
  ├── GameScreen.tsx       Active game view (map + challenge list)
  ├── MenuScreen.tsx       Pre-game menu
  ├── TeamChoiceScreen.tsx Team selection before entering a game
  ├── DesktopGameLayout.tsx
  └── MobileGameLayout.tsx
components/          Reusable UI pieces
hooks/               Custom React hooks
utils/               Pure helper functions
types/game.ts        All TypeScript types shared with the backend contract
api/gameApi.ts       Single API client — all backend calls go through here
assets/              Images and fonts
tests/               Jest test files
```

## API Client

`api/gameApi.ts` is the single source of truth for backend communication.

- Base URL defaults to `http://<expo-host-ip>:8080` (auto-detected from Expo's `hostUri`) so Expo Go on a physical device reaches the backend running on the dev machine without manual config.
- Override with `EXPO_PUBLIC_API_BASE_URL` env var, or at runtime via `setApiBaseUrl()`.
- Throws `ApiError` (with `.status`) on non-2xx responses.
- 204 responses return `undefined`.

## TypeScript Types

`types/game.ts` mirrors the backend's response/request shapes exactly. When the backend contract changes, update this file first, then fix callsites.

Key types: `GameState` (the full polling response), `ChallengeResponse`, `StationStateResponse`, `TeamResponse`.

## Backend Contract Notes

The backend runs at `:8080`. See the backend CLAUDE.md or README for full API docs. Key points relevant to UI:

- `StationStateResponse.ownerTeamId` is `null` when no team owns a station.
- `ChallengeResponse.challengeAttempts` shows each team's attempt status (`IN_PROGRESS` | `SUCCESS` | `FAILED`).
- `CALL_YOUR_SHOT` challenges require a `callShot` number in the `/complete` request body.
- `STEAL` challenges require an `enemyTeamId` in the `/complete` request body.
- Failing a challenge increases its reward by 50%; it stays `AVAILABLE` until all teams fail it.
