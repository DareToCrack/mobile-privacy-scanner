'use strict';

/**
 * Shared light palette — "normal human colors".
 * Same palette as PhishSim, SecureShare and CloudGuard (restyled Nov 2026):
 * warm off-white background, white cards, dark readable text, one calm blue.
 */

const colors = {
  bg: '#f7f7f4',
  surface: '#ffffff',
  border: '#e7e4de',
  text: '#22262b',
  muted: '#667085',
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  successText: '#15803d',
  successBg: '#f0fdf4',
  warningText: '#92400e',
  warningBg: '#fef3c7',
  dangerText: '#b91c1c',
  dangerBg: '#fef2f2',
  infoText: '#1e3a5f',
  infoBg: '#eff6ff',
  // Risk badge colors (same values as the band colors).
  risk: {
    critical: '#b91c1c',
    high: '#b45309',
    medium: '#d9a441',
    low: '#2563eb',
    info: '#667085',
  },
  // Muted per-category accent colors for app avatars (soft, readable, no purple).
  category: {
    messaging: '#2563eb',
    social: '#0e7490',
    finance: '#15803d',
    games: '#b45309',
    health: '#65a30d',
    shopping: '#9a3412',
    news: '#475569',
    productivity: '#1d4ed8',
    navigation: '#0284c7',
    media: '#dc2626',
    tools: '#57534e',
    system: '#667085',
  },
};

module.exports = { colors };
