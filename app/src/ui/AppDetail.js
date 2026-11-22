import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from './theme';
import { RiskBadge, BandPill, AppAvatar, Card, SectionTitle } from './components';
import { CATEGORY_LABELS } from '../risk/expectations';
import { getPermission } from '../permissions/permission-db';

const RISK_ORDER = ['critical', 'high', 'medium', 'low', 'info'];
const RISK_TITLES = {
  critical: 'Critical permissions',
  high: 'High-risk permissions',
  medium: 'Medium-risk permissions',
  low: 'Low-risk permissions',
  info: 'Informational permissions',
};

function PermissionRow({ entry, categoryLabel }) {
  const permission = getPermission(entry.permissionId);
  return (
    <View style={styles.permRow}>
      <View style={styles.permHead}>
        <Text style={styles.permName}>{permission.name}</Text>
        <RiskBadge risk={permission.risk} />
      </View>
      <Text style={styles.permId}>{permission.id}</Text>
      <View style={styles.permFlags}>
        <Text style={[styles.flag, entry.granted ? styles.flagGranted : styles.flagRequested]}>
          {entry.granted ? '● Granted' : '○ Requested, not granted'}
        </Text>
        {entry.unexpected ? <Text style={[styles.flag, styles.flagUnexpected]}>⚠ Unexpected for {categoryLabel}</Text> : null}
        {entry.unknown ? <Text style={[styles.flag, styles.flagUnknown]}>? Not in database</Text> : null}
      </View>
      <Text style={styles.permText}>{permission.exposes}</Text>
      {permission.masvs ? <Text style={styles.masvsTag}>{permission.masvs} (OWASP MASVS v2.1.0)</Text> : null}
      <Text style={styles.permGuidance}>{permission.guidance}</Text>
    </View>
  );
}

export default function AppDetail({ item, onBack }) {
  const { app } = item;
  const categoryLabel = CATEGORY_LABELS[app.category] || app.category;
  const unexpected = item.breakdown.filter((b) => b.unexpected);

  return (
    <View>
      <TouchableOpacity testID="back-button" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Card>
        <View style={styles.headRow}>
          <AppAvatar label={app.label} category={app.category} size={56} />
          <View style={styles.headInfo}>
            <Text style={styles.appName}>{app.label}</Text>
            <Text style={styles.appMeta}>{app.packageName}</Text>
            <Text style={styles.appMeta}>
              {categoryLabel}
              {app.version ? ` · v${app.version}` : ''}
              {app.isSystem ? ' · System app' : ''}
            </Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Privacy risk</Text>
          <Text style={[styles.scoreNumber, { color: colors.risk[item.band.toLowerCase()] || colors.text }]}>
            {item.score} / 100
          </Text>
          <BandPill band={item.band} />
        </View>
        <Text style={styles.scoreExplain}>
          {item.basePoints} points from declared permissions
          {item.overPrivilegeBonus > 0 ? ` + ${item.overPrivilegeBonus} over-privilege bonus` : ''}.
          Scores measure exposure — what the app could access — not proof of misuse.
        </Text>
        {app.isSystem ? (
          <Text style={styles.systemNote}>
            This is a system app: the OS needs broad access to do its job, so it is not
            flagged for over-privilege. Review its permissions anyway.
          </Text>
        ) : null}
      </Card>

      {unexpected.length > 0 ? (
        <View style={styles.warnBox}>
          <Text style={styles.warnTitle}>⚠ Over-privileged for a {categoryLabel.toLowerCase()} app</Text>
          <Text style={styles.warnText}>
            This app asks for {unexpected.length} permission{unexpected.length === 1 ? '' : 's'} a{' '}
            {categoryLabel.toLowerCase()} app does not usually need:{' '}
            {unexpected.map((b) => getPermission(b.permissionId).name).join(', ')}. That does not
            prove malicious intent — but it is worth asking why the app needs them, and revoking
            the ones you do not use.
          </Text>
        </View>
      ) : (
        <View style={styles.okBox}>
          <Text style={styles.okText}>
            ✓ No unexpected permissions for a {categoryLabel.toLowerCase()} app. Everything it
            asks for fits what this kind of app does.
          </Text>
        </View>
      )}

      {RISK_ORDER.map((risk) => {
        const entries = item.breakdown.filter((b) => b.risk === risk);
        if (entries.length === 0) return null;
        return (
          <View key={risk}>
            <SectionTitle>
              {RISK_TITLES[risk]} ({entries.length})
            </SectionTitle>
            <Card style={styles.permCard}>
              {entries.map((entry, i) => (
                <View key={entry.permissionId} style={i > 0 ? styles.permDivider : null}>
                  <PermissionRow entry={entry} categoryLabel={categoryLabel} />
                </View>
              ))}
            </Card>
          </View>
        );
      })}

      {item.breakdown.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>This app declares no permissions.</Text>
        </Card>
      ) : null}

      <Text style={styles.footnote}>
        How to revoke a permission on Android: Settings → Apps → {app.label} → Permissions,
        then switch the permission off. The app may ask for it again when the feature is used.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { paddingVertical: 8, marginBottom: 4, alignSelf: 'flex-start' },
  backText: { fontSize: 15, color: colors.primary, fontWeight: '700' },
  headRow: { flexDirection: 'row', alignItems: 'center' },
  headInfo: { flex: 1, marginLeft: 12 },
  appName: { fontSize: 20, fontWeight: '800', color: colors.text },
  appMeta: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  scoreLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  scoreNumber: { fontSize: 22, fontWeight: '800' },
  scoreExplain: { fontSize: 13, color: colors.muted, lineHeight: 19, marginTop: 8 },
  systemNote: { fontSize: 13, color: colors.infoText, backgroundColor: colors.infoBg, borderRadius: 8, padding: 10, marginTop: 12, lineHeight: 19 },
  warnBox: { backgroundColor: colors.warningBg, borderRadius: 12, padding: 14, marginBottom: 12 },
  warnTitle: { fontSize: 14, fontWeight: '800', color: colors.warningText },
  warnText: { fontSize: 13, color: colors.warningText, lineHeight: 19, marginTop: 6 },
  okBox: { backgroundColor: colors.successBg, borderRadius: 12, padding: 14, marginBottom: 12 },
  okText: { fontSize: 13, color: colors.successText, lineHeight: 19 },
  permCard: { padding: 0, overflow: 'hidden' },
  permDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  permRow: { padding: 14 },
  permHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  permName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  permId: { fontSize: 11, color: colors.muted, marginTop: 3 },
  permFlags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  flag: { fontSize: 12, fontWeight: '600' },
  flagGranted: { color: colors.dangerText },
  flagRequested: { color: colors.muted },
  flagUnexpected: { color: colors.warningText },
  flagUnknown: { color: colors.muted },
  permText: { fontSize: 13, color: colors.text, lineHeight: 19, marginTop: 8 },
  masvsTag: { fontSize: 12, color: colors.infoText, fontWeight: '600', marginTop: 6 },
  permGuidance: { fontSize: 13, color: colors.muted, lineHeight: 19, marginTop: 6 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  footnote: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 4, marginBottom: 8 },
});
