# Codenames — Mobile (Expo / React Native)

The Android + iOS client for the Codenames game. It's a thin UI over the same
realtime backend the web app uses — no separate server. Guest play works over the
Socket.IO connection alone.

- **Backend (reused):** the standalone Socket.IO server on Render.
- **This app:** Expo React Native, one codebase for Android and iOS.

## Configure the backend

Endpoints live in [`src/config.ts`](src/config.ts). Defaults point at the
deployed Render server. Override without editing code via env vars:

```
EXPO_PUBLIC_SOCKET_URL=https://your-realtime-server.onrender.com
EXPO_PUBLIC_WEB_URL=https://your-web-app.vercel.app   # needed for Pictures card images
```

`SOCKET_URL` is required for play. `WEB_URL` is only needed to load
Codenames: Pictures images (they're served from the web app's `/public`).

## Run it (development)

Requires Node 18+ and the Expo Go app on your phone (App Store / Play Store).

```bash
npm install
npm start          # opens Expo Dev Tools + a QR code
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS). Or press
`a` for an Android emulator / `i` for an iOS simulator (Mac).

```bash
npm run android    # build & open on a connected Android device/emulator
npm run ios        # iOS simulator (macOS only)
npm run typecheck  # tsc --noEmit
```

## Build store binaries

Use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build -p android   # .aab / .apk
eas build -p ios       # .ipa (Apple Developer account required)
```

## What's included

- Guest identity (persisted name), create / join / **Quick Match**.
- All three game types: **Words**, **Pictures**, **Co-op**.
- Lobby (teams, roles, spectators, start), live board with clue-giving and
  guessing, scoreboard, turn flow, win/rematch, and in-room chat.

Accounts, friends, and direct messaging (available on the web app) can be added
here later against the same backend.

## License

Fan-made, for private play. Codenames is a trademark of Czech Games Edition.
Built by [Decodrs](https://decodrs.com).
