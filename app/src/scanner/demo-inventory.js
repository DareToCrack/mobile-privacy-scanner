'use strict';

/**
 * Demo inventory: a realistic mock device with 17 apps across 12 categories.
 *
 * All app names are fictional — no real app is accused of anything. The
 * permission profiles are deliberately varied: some apps are clean, some
 * hold a lot of access they genuinely need (high exposure, not suspicious),
 * and a few are clear over-privilege cases (a flashlight with location +
 * microphone, a calculator reading your texts).
 *
 * Each app: { packageName, label, category, version, isSystem, installed,
 *   permissions: [{ id, granted }] }
 * `granted: false` means the permission is declared in the manifest but the
 * user has not granted it (yet).
 */

const DEMO_APPS = [
  {
    packageName: 'com.chatwave.messenger',
    label: 'ChatWave Messenger',
    category: 'messaging',
    version: '4.12.0',
    isSystem: false,
    installed: '2025-03-14',
    permissions: [
      { id: 'android.permission.RECORD_AUDIO', granted: true },
      { id: 'android.permission.CAMERA', granted: true },
      { id: 'android.permission.READ_CONTACTS', granted: true },
      { id: 'android.permission.READ_MEDIA_IMAGES', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.snappic.social',
    label: 'SnapPic Social',
    category: 'social',
    version: '18.3.1',
    isSystem: false,
    installed: '2024-11-02',
    permissions: [
      { id: 'android.permission.CAMERA', granted: true },
      { id: 'android.permission.RECORD_AUDIO', granted: true },
      { id: 'android.permission.ACCESS_FINE_LOCATION', granted: true },
      { id: 'android.permission.READ_MEDIA_IMAGES', granted: true },
      { id: 'android.permission.READ_CONTACTS', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.quickbank.mobile',
    label: 'QuickBank',
    category: 'finance',
    version: '7.0.2',
    isSystem: false,
    installed: '2025-01-20',
    permissions: [
      { id: 'android.permission.CAMERA', granted: true },
      { id: 'android.permission.USE_BIOMETRIC', granted: true },
      { id: 'android.permission.READ_SMS', granted: false },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.brightlab.flashlight',
    label: 'FlashLight Pro',
    category: 'tools',
    version: '2.4.0',
    isSystem: false,
    installed: '2025-06-30',
    permissions: [
      { id: 'android.permission.CAMERA', granted: true },
      { id: 'android.permission.ACCESS_FINE_LOCATION', granted: true },
      { id: 'android.permission.RECORD_AUDIO', granted: true },
      { id: 'android.permission.READ_CONTACTS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.puzzlequest.game',
    label: 'Puzzle Quest',
    category: 'games',
    version: '3.9.4',
    isSystem: false,
    installed: '2025-08-11',
    permissions: [
      { id: 'android.permission.INTERNET', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.READ_CONTACTS', granted: true },
      { id: 'android.permission.RECORD_AUDIO', granted: true },
      { id: 'android.permission.ACCESS_COARSE_LOCATION', granted: false },
    ],
  },
  {
    packageName: 'com.fittrack.health',
    label: 'FitTrack',
    category: 'health',
    version: '5.2.0',
    isSystem: false,
    installed: '2025-02-08',
    permissions: [
      { id: 'android.permission.ACTIVITY_RECOGNITION', granted: true },
      { id: 'android.permission.BODY_SENSORS', granted: true },
      { id: 'android.permission.ACCESS_FINE_LOCATION', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.shopnow.store',
    label: 'ShopNow',
    category: 'shopping',
    version: '9.1.7',
    isSystem: false,
    installed: '2024-12-19',
    permissions: [
      { id: 'android.permission.CAMERA', granted: true },
      { id: 'android.permission.ACCESS_FINE_LOCATION', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.newsdaily.press',
    label: 'NewsDaily',
    category: 'news',
    version: '6.0.3',
    isSystem: false,
    installed: '2025-04-25',
    permissions: [
      { id: 'android.permission.INTERNET', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.READ_CONTACTS', granted: true },
    ],
  },
  {
    packageName: 'com.notepadplus.notes',
    label: 'NotePad+',
    category: 'productivity',
    version: '1.8.2',
    isSystem: false,
    installed: '2025-09-01',
    permissions: [
      { id: 'android.permission.READ_MEDIA_IMAGES', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.mapsgo.nav',
    label: 'MapsGo',
    category: 'navigation',
    version: '12.5.0',
    isSystem: false,
    installed: '2024-10-05',
    permissions: [
      { id: 'android.permission.ACCESS_FINE_LOCATION', granted: true },
      { id: 'android.permission.ACCESS_BACKGROUND_LOCATION', granted: true },
      { id: 'android.permission.RECORD_AUDIO', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.musicstream.player',
    label: 'MusicStream',
    category: 'media',
    version: '8.4.1',
    isSystem: false,
    installed: '2025-05-17',
    permissions: [
      { id: 'android.permission.READ_MEDIA_AUDIO', granted: true },
      { id: 'android.permission.BLUETOOTH_CONNECT', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.photovault.locker',
    label: 'PhotoVault',
    category: 'tools',
    version: '3.1.0',
    isSystem: false,
    installed: '2025-07-22',
    permissions: [
      { id: 'android.permission.READ_MEDIA_IMAGES', granted: true },
      { id: 'android.permission.CAMERA', granted: true },
      { id: 'android.permission.USE_BIOMETRIC', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.weathernow.forecast',
    label: 'WeatherNow',
    category: 'news',
    version: '4.0.9',
    isSystem: false,
    installed: '2025-03-03',
    permissions: [
      { id: 'android.permission.ACCESS_FINE_LOCATION', granted: true },
      { id: 'android.permission.ACCESS_BACKGROUND_LOCATION', granted: false },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.READ_CONTACTS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.calcplus.tools',
    label: 'CalcPlus',
    category: 'tools',
    version: '1.2.5',
    isSystem: false,
    installed: '2025-10-09',
    permissions: [
      { id: 'android.permission.ACCESS_FINE_LOCATION', granted: true },
      { id: 'android.permission.READ_SMS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.emailpro.mail',
    label: 'EmailPro',
    category: 'productivity',
    version: '11.6.0',
    isSystem: false,
    installed: '2024-09-27',
    permissions: [
      { id: 'android.permission.READ_CONTACTS', granted: true },
      { id: 'android.permission.READ_MEDIA_IMAGES', granted: true },
      { id: 'android.permission.CAMERA', granted: false },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
      { id: 'android.permission.INTERNET', granted: true },
    ],
  },
  {
    packageName: 'com.android.systemui',
    label: 'System UI',
    category: 'system',
    version: '14',
    isSystem: true,
    installed: '2024-08-15',
    permissions: [
      { id: 'android.permission.SYSTEM_ALERT_WINDOW', granted: true },
      { id: 'android.permission.READ_PHONE_STATE', granted: true },
      { id: 'android.permission.ACCESS_FINE_LOCATION', granted: true },
      { id: 'android.permission.POST_NOTIFICATIONS', granted: true },
    ],
  },
  {
    packageName: 'com.android.settings',
    label: 'Settings',
    category: 'system',
    version: '14',
    isSystem: true,
    installed: '2024-08-15',
    permissions: [
      { id: 'android.permission.QUERY_ALL_PACKAGES', granted: true },
      { id: 'android.permission.BLUETOOTH_CONNECT', granted: true },
      { id: 'android.permission.NFC', granted: true },
    ],
  },
];

/** Deep copy so callers can never mutate the shared inventory. */
function getDemoApps() {
  return JSON.parse(JSON.stringify(DEMO_APPS));
}

module.exports = { DEMO_APPS, getDemoApps };
