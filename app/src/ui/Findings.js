import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from './theme';
import { RiskBadge, Chip, Card } from './components';

const RISK_FILTERS = ['All', 'critical', 'high', 'medium'];
const RISK_LABELS = { All: 'All severities', critical: 'Critical', high: 'High', medium: 'Medium' };
const RISK_RANK = { critical: 0, high: 1, medium: 2 };

export default function Findings({ analysis, onOpenApp }) {
  const [risk, setRisk] = useState('All');
  const [overOnly, setOverOnly] = useState(false);

  const rows = useMemo(() => {
    const filtered = analysis.findings.filter((f) => {
      if (risk !== 'All' && f.risk !== risk) return false;
      if (overOnly && !f.overPrivilege) return false;
      return true;
    });
    filtered.sort(
      (a, b) =>
        RISK_RANK[a.risk] - RISK_RANK[b.risk] ||
        a.appLabel.localeCompare(b.appLabel),
    );
    return filtered;
  }, [analysis, risk, overOnly]);

  return (
    <View>
      <View style={styles.chipWrap}>
        {RISK_FILTERS.map((r) => (
          <Chip
            key={r}
            label={RISK_LABELS[r]}
            testID={`findings-filter-${r}`}
            selected={risk === r}
            onPress={() => setRisk(r)}
          />
        ))}
        <Chip
          label="⚠ Over-privilege only"
          testID="findings-filter-overprivilege"
          selected={overOnly}
          onPress={() => setOverOnly(!overOnly)}
        />
      </View>

      <Text style={styles.countText}>
        {rows.length} finding{rows.length === 1 ? '' : 's'}
        {analysis.overPrivilegeFindings > 0 ? ` · ${analysis.overPrivilegeFindings} over-privilege` : ''}
      </Text>

      {rows.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No findings match these filters.</Text>
        </Card>
      ) : (
        rows.map((f) => (
          <TouchableOpacity key={`${f.appPackage}:${f.permissionId}`} onPress={() => onOpenApp(f.appPackage)}>
            <Card>
              <View style={styles.findHead}>
                <Text style={styles.findName}>{f.permissionName}</Text>
                <RiskBadge risk={f.risk} />
              </View>
              <Text style={styles.findApp}>
                {f.appLabel} · {f.granted ? 'Granted' : 'Requested, not granted'}
                {f.overPrivilege ? ' · ⚠ Unexpected for this kind of app' : ''}
              </Text>
              <Text style={styles.findText}>{f.exposes}</Text>
              {f.masvs ? <Text style={styles.masvsTag}>{f.masvs} (OWASP MASVS v2.1.0)</Text> : null}
              <Text style={styles.findGuidance}>{f.guidance}</Text>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  countText: { fontSize: 13, color: colors.muted, marginBottom: 10 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  findHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  findName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  findApp: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 16 },
  findText: { fontSize: 13, color: colors.text, lineHeight: 19, marginTop: 8 },
  masvsTag: { fontSize: 12, color: colors.infoText, fontWeight: '600', marginTop: 6 },
  findGuidance: { fontSize: 13, color: colors.muted, lineHeight: 19, marginTop: 6 },
});
