import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from './theme';

/** Tinted backgrounds for risk pills (dark text on a light tint: readable). */
const RISK_TINTS = {
  critical: { bg: '#fef2f2', fg: '#b91c1c' },
  high: { bg: '#fef3c7', fg: '#92400e' },
  medium: { bg: '#fdf6e3', fg: '#8a6d1a' },
  low: { bg: '#eff6ff', fg: '#1e3a5f' },
  info: { bg: '#f5f5f2', fg: '#667085' },
};

const BAND_RISK = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' };

function RiskBadge({ risk, label }) {
  const tint = RISK_TINTS[risk] || RISK_TINTS.info;
  return (
    <View style={[styles.badge, { backgroundColor: tint.bg }]}>
      <Text style={[styles.badgeText, { color: tint.fg }]}>
        {(label || risk || '').toUpperCase()}
      </Text>
    </View>
  );
}

function BandPill({ band }) {
  return <RiskBadge risk={BAND_RISK[band] || 'info'} label={band} />;
}

function initials(label) {
  const words = (label || '?').split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function AppAvatar({ label, category, size = 44 }) {
  const bg = (colors.category && colors.category[category]) || colors.muted;
  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: bg, width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials(label)}</Text>
    </View>
  );
}

function Chip({ label, selected, onPress, testID }) {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextDefault]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontWeight: '700' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipDefault: { backgroundColor: '#ffffff', borderColor: colors.border },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextDefault: { color: colors.text },
  chipTextSelected: { color: '#ffffff' },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#22262b',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
});

export { RiskBadge, BandPill, AppAvatar, Chip, Card, SectionTitle, RISK_TINTS };
