import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from './theme';
import { BandPill, AppAvatar, Chip, Card } from './components';
import { CATEGORY_LABELS } from '../risk/expectations';

const BAND_FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function AppList({ analysis, onOpenApp }) {
  const [query, setQuery] = useState('');
  const [band, setBand] = useState('All');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('risk');

  const categories = useMemo(() => {
    const seen = new Set(analysis.analyzed.map((a) => a.app.category));
    return [...seen].sort();
  }, [analysis]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = analysis.analyzed.filter((item) => {
      if (band !== 'All' && item.band !== band) return false;
      if (category !== 'all' && item.app.category !== category) return false;
      if (q) {
        const hay = `${item.app.label} ${item.app.packageName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    filtered.sort((a, b) =>
      sortBy === 'risk'
        ? b.score - a.score || a.app.label.localeCompare(b.app.label)
        : a.app.label.localeCompare(b.app.label),
    );
    return filtered;
  }, [analysis, query, band, category, sortBy]);

  return (
    <View>
      <TextInput
        testID="search-input"
        style={styles.search}
        placeholder="Search apps by name or package…"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {BAND_FILTERS.map((b) => (
          <Chip key={b} label={b} testID={`filter-${b.toLowerCase()}`} selected={band === b} onPress={() => setBand(b)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Chip label="All categories" testID="filter-category-all" selected={category === 'all'} onPress={() => setCategory('all')} />
        {categories.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_LABELS[c] || c}
            testID={`filter-category-${c}`}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.countText}>
          {rows.length} app{rows.length === 1 ? '' : 's'}
        </Text>
        <TouchableOpacity testID="sort-toggle" onPress={() => setSortBy(sortBy === 'risk' ? 'name' : 'risk')}>
          <Text style={styles.sortText}>Sort: {sortBy === 'risk' ? 'highest risk' : 'name A–Z'} ↕</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.listCard}>
        {rows.length === 0 ? (
          <Text style={styles.emptyText}>No apps match these filters.</Text>
        ) : (
          rows.map((item, index) => (
            <TouchableOpacity
              key={item.app.packageName}
              testID={`app-row-${item.app.packageName}`}
              style={[styles.appRow, index === rows.length - 1 && styles.appRowLast]}
              onPress={() => onOpenApp(item.app.packageName)}
            >
              <AppAvatar label={item.app.label} category={item.app.category} />
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{item.app.label}</Text>
                <Text style={styles.appMeta} numberOfLines={1}>
                  {item.app.packageName}
                </Text>
                <Text style={styles.appMeta}>
                  {CATEGORY_LABELS[item.app.category] || item.app.category}
                  {item.app.isSystem ? ' · System app' : ''}
                  {item.overPrivilegeCount > 0 ? ` · ${item.overPrivilegeCount} unexpected` : ''}
                </Text>
              </View>
              <View style={styles.appScore}>
                <Text style={styles.appScoreNumber}>{item.score}</Text>
                <BandPill band={item.band} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  chipRow: { marginBottom: 4 },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countText: { fontSize: 13, color: colors.muted },
  sortText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  listCard: { padding: 0, overflow: 'hidden' },
  emptyText: { padding: 16, fontSize: 14, color: colors.muted, textAlign: 'center' },
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
});
