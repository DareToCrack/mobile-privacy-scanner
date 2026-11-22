# privacy-scanner (local Expo module)

Android-only native module for Privacy Scanner. Lists installed apps and
their declared permissions via `PackageManager`, including each permission's
grant state (from `PackageInfo.requestedPermissionsFlags`).

## Files

- `src/index.js` — JavaScript interface (`getInstalledApps()`).
- `android/src/main/java/expo/modules/privacyscanner/PrivacyScannerModule.kt`
  — the native module (Expo Modules API, Kotlin).
- `android/src/main/AndroidManifest.xml` — declares `QUERY_ALL_PACKAGES`,
  required on Android 11+ to enumerate all installed apps.
- `expo-module.config.json` — autolinking config (Android only).

## Verification status

⚠️ **Not compiled or run on a device yet.** This module was written against
the Expo Modules API (SDK 58) and the Android PackageManager API, but the
environment it was written in has no Android SDK, so it has not been built.
Build and verify it with a development build:

```bash
cd app
npx expo prebuild
npx expo run:android
```

## Play Store note

`QUERY_ALL_PACKAGES` is a restricted permission under Google Play policy. A
Play Store release of an app using this module needs a declaration explaining
the core use case — a privacy scanner whose entire purpose is auditing
installed apps. Sideloaded and development builds are unaffected.

## expo-doctor note

`npx expo-doctor` reports 19/20 with one warning: "Missing peer dependency:
expo-modules-core. Required by: privacy-scanner". This is a known doctor
quirk for local modules — the peer dependency is satisfied transitively
through the `expo` package, which is installed, and the module resolves it
fine (the web export bundles without it). Do **not** "fix" it by adding
`expo-modules-core` as a direct dependency of the app: doctor then fails a
different check ("expo-modules-core should not be installed directly"),
because Expo's own guidance is to use the API exported from the `expo`
package. Leave it as is.
