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

## Troubleshooting: Expo stuck on "loading" / never opens

Almost always the phone can't reach the Metro bundler over your LAN (different
network, VPN, or a firewall blocking port 8081). Fixes, in order:

1. **Use tunnel mode** (works across networks): `npm run start:tunnel`
2. Make sure the phone and computer are on the **same Wi‑Fi**.
3. Clear the cache: `npm run start:clear`
4. Force-close and reopen **Expo Go**, then rescan.

The app also wraps itself in an error boundary, so a real crash shows the error
on screen instead of a blank loading view.

## Downloadable APK (Android sideload)

Build an installable APK with EAS (no Play Store needed):

```bash
npm install -g eas-cli
eas login                      # your Expo account
eas build -p android --profile preview
```

EAS returns a URL to the `.apk`. Share that link, or download the `.apk` and
host it (e.g. put it in the web app's `public/` and set `NEXT_PUBLIC_APK_URL` so
the "Get the Android app" button on the site links to it).

## Store binaries + submission

```bash
# Production builds
eas build -p android --profile production   # .aab for Google Play
eas build -p ios     --profile production   # .ipa (needs an Apple Developer account, $99/yr)

# Submit
eas submit -p android    # uploads the .aab to Google Play (needs a Play Console account, $25 one-time)
eas submit -p ios        # uploads to App Store Connect
```

Store submission requires the developer accounts and signing credentials, which
EAS will prompt you to create/manage. See
<https://docs.expo.dev/submit/introduction/>.

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
