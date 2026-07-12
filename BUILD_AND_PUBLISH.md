# Building the downloadable Android APK (EAS cloud build)

This produces a public `.apk` hosted on Expo's CDN. The URL Expo returns can be
downloaded by anyone on the internet — no Expo account needed to *download*, only
to *build*. You then point the web app's download button at that URL.

The commands below run on **your machine** (they need an interactive Expo login,
which can't be automated in CI-less environments). Everything else is already
configured in this repo (`eas.json`, `app.json`).

## One-time setup

1. Create a free Expo account at https://expo.dev (if you don't have one).
2. From this repo folder:
   ```bash
   npm install                       # installs deps
   npx eas-cli login                 # sign in to Expo (interactive)
   npx eas-cli init                  # links this repo to an Expo project (creates the projectId)
   ```
   `init` writes `extra.eas.projectId` into `app.json`. Commit that change.

## Build the APK

```bash
npx eas-cli build --platform android --profile preview
```

- The `preview` profile (see `eas.json`) is configured to output an **APK**
  (`buildType: "apk"`), which is the sideloadable file — not the Play Store
  `.aab` bundle.
- The build runs on Expo's servers (a few minutes). Signing keys are generated
  and stored by EAS the first time; accept when prompted.
- When it finishes, the CLI prints an artifact URL like:
  ```
  https://expo.dev/artifacts/eas/XXXXXXXXXXXXXXXX.apk
  ```
  That URL is publicly downloadable. You can also find it later on
  https://expo.dev under this project → Builds.

## Wire it into the web app's download button

The web app already renders a "Get the Android app (APK)" button when the
`NEXT_PUBLIC_APK_URL` environment variable is set (see `src/app/page.tsx`).

1. In the **web app's** Vercel project → Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_APK_URL = https://expo.dev/artifacts/eas/XXXXXXXXXXXXXXXX.apk
   ```
2. Redeploy the web app. The download button now appears for everyone.

### Releasing a new version later

Bump `version` (and `android.versionCode`) in `app.json`, rebuild with the same
`eas build` command, then update `NEXT_PUBLIC_APK_URL` to the new artifact URL and
redeploy the web app. Each build has its own permanent artifact URL.

## Notes

- **Backend URLs are baked in at build time** from `EXPO_PUBLIC_SOCKET_URL` /
  `EXPO_PUBLIC_WEB_URL`. The defaults in `src/config.ts` point at the hosted
  Render + Vercel stack, so a plain `eas build` ships an app that talks to
  production. To override, set those vars (e.g. in `eas.json` under the profile's
  `env`) before building.
- **Google Play / App Store** are separate from this sideload APK. For Play use
  the `production` profile (`buildType: "app-bundle"` → `.aab`) and
  `eas submit`. Those store listings are not set up yet.
