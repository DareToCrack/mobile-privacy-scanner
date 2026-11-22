import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from './theme';
import { BandPill, AppAvatar, Card, SectionTitle } from './components';
import { CATEGORY_LABELS } from '../risk/expectations';

function StatCell({ value, label }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SeverityBar({ label, count, total, color }) {
  const width = total > 0 ? Math.max(4, Math.round((count / total) * 100)) : 0;
  return (
    <View style={styles.sevRow}>
      <Text style={styles.sevLabel}>{label}</Text>
      <View style={styles.sevTrack}>
        <View style={[styles.sevFill, { width: `${width}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.sevCount}>{count}</Text>
    </View>
  );
}

export default function Dashboard({ analysis, source, fallbackFromLive, onOpenApp, onRescan, scanning }) {
  const riskiest = [...analysis.analyzed]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const maxSev = Math.max(
    analysis.findingsByRisk.critical,
    analysis.findingsByRisk.high,
    analysis.findingsByRisk.medium,
    1,
  );

  return (
    <View>
      <Card>
        <Text style={styles.scoreLabel}>Device privacy risk</Text>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreNumber, { color: colors.risk[analysis.band.toLowerCase()] || colors.text }]}>
            {analysis.score}
          </Text>
          <Text style={styles.scoreOutOf}>/ 100</Text>
          <View style={styles.bandWrap}>
            <BandPill band={analysis.band} />
          </View>
        </View>
        <Text style={styles.scoreNote}>
          Average risk across {analysis.totalApps} apps. A high score means apps hold a lot of
          sensitive access — not proof any of them misuse it.
        </Text>
        <TouchableOpacity testID="rescan-button" style={styles.rescanButton} onPress={onRescan} disabled={scanning}>
          <Text style={styles.rescanText}>{scanning ? 'Scanning…' : source === 'live' ? 'Re-scan device' : 'Re-scan demo data'}</Text>
        </TouchableOpacity>
        {fallbackFromLive ? (
          <Text style={styles.fallbackNote}>
            The live scan failed, so demo data is shown instead. Check the native module and try again.
          </Text>
        ) : null}
      </Card>

      <View style={styles.statGrid}>
        <Card style={styles.statCard}>
          <StatCell value={analysis.totalApps} label="Apps scanned" />
        </Card>
        <Card style={styles.statCard}>
          <StatCell value={analysis.totalFindings} label="Risky permissions" />
        </Card>
        <Card style={styles.statCard}>
          <StatCell value={analysis.overPrivilegedApps} label="Over-privileged apps" />
        </Card>
        <Card style={styles.statCard}>
          <StatCell value={analysis.byBand.Critical} label="Critical-risk apps" />
        </Card>
      </View>

      <SectionTitle>Findings by severity</SectionTitle>
      <Card>
        <SeverityBar label="Critical" count={analysis.findingsByRisk.critical} total={maxSev} color={colors.risk.critical} />
        <SeverityBar label="High" count={analysis.findingsByRisk.high} total={maxSev} color={colors.risk.high} />
        <SeverityBar label="Medium" count={analysis.findingsByRisk.medium} total={maxSev} color={colors.risk.medium} />
      </Card>

      <SectionTitle>Riskiest apps</SectionTitle>
      <Card style={styles.listCard}>
        {riskiest.map((item, index) => (
          <TouchableOpacity
            key={item.app.packageName}
            testID={`top-app-${item.app.packageName}`}
            style={[styles.appRow, index === riskiest.length - 1 && styles.appRowLast]}
            onPress={() => onOpenApp(item.app.packageName)}
          >
            <AppAvatar label={item.app.label} category={item.app.category} />
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{item.app.label}</Text>
              <Text style={styles.appMeta}>
                {CATEGORY_LABELS[item.app.category] || item.app.category}
                {item.overPrivilegeCount > 0 ? ` · ${item.overPrivilegeCount} unexpected permission${item.overPrivilegeCount === 1 ? '' : 's'}` : ''}
              </Text>
            </View>
            <View style={styles.appScore}>
              <Text style={styles.appScoreNumber}>{item.score}</Text>
              <BandPill band={item.band} />
            </View>
          </TouchableOpacity>
        ))}
      </Card>

      <Text style={styles.footnote}>
        Scores measure exposure: what an app could access. Over-privilege flags mark access a
        {''} kind of app does not usually need. Check the app’s detail page before revoking
        anything — some permissions are genuinely needed.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  scoreNumber: { fontSize: 56, fontWeight: '800', lineHeight: 60 },
  scoreOutOf: { fontSize: 20, color: colors.muted, marginLeft: 4 },
  bandWrap: { marginLeft: 12, paddingBottom: 10 },
  scoreNote: { fontSize: 14, color: colors.muted, lineHeight: 20, marginTop: 8 },
  rescanButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  rescanText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  fallbackNote: { fontSize: 13, color: colors.warningText, marginTop: 10, lineHeight: 18 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', padding: 14, alignItems: 'flex-start' },
  statCell: {},
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },
  sevRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sevLabel: { width: 64, fontSize: 13, color: colors.text },
  sevTrack: { flex: 1, height: 8, backgroundColor: '#f1f1ed', borderRadius: 4, marginHorizontal: 8 },
  sevFill: { height: 8, borderRadius: 4 },
  sevCount: { width: 28, textAlign: 'right', fontSize: 13, fontWeight: '700', color: colors.text },
  listCard: { padding: 0, overflow: 'hidden' },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appRowLast: { borderBottomWidth: 0 },
  appInfo: { flex: 1, marginLeft: 12 },
  appName: { fontSize: 15, fontWeight: '700', color: colors.text },
  appMeta: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },
  appScore: { alignItems: 'flex-end', gap: 4 },
  appScoreNumber: { fontSize: 20, fontWeight: '800', color: colors.text },
  footnote: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 4, marginBottom: 8 },
});
