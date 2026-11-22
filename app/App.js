import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/ui/theme';
import { scanDevice } from './src/scanner';
import { getNativeScanner } from './src/scanner/native-bridge';
import { analyzeDevice } from './src/risk/engine';
import Dashboard from './src/ui/Dashboard';
import AppList from './src/ui/AppList';
import AppDetail from './src/ui/AppDetail';
import Findings from './src/ui/Findings';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', testID: 'tab-dashboard' },
  { id: 'apps', label: 'Apps', testID: 'tab-apps' },
  { id: 'findings', label: 'Findings', testID: 'tab-findings' },
];

function ModePill({ source }) {
  if (source === 'live') {
    return (
      <View style={[styles.modePill, styles.modeLive]}>
        <Text style={[styles.modeText, styles.modeLiveText]}>LIVE SCAN</Text>
      </View>
    );
  }
  if (source === 'demo') {
    return (
      <View style={[styles.modePill, styles.modeDemo]}>
        <Text style={[styles.modeText, styles.modeDemoText]}>DEMO MODE</Text>
      </View>
    );
  }
  return null;
}

export default function App() {
  const [scan, setScan] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [selectedApp, setSelectedApp] = useState(null);
  const [scanning, setScanning] = useState(false);

  const runScan = useCallback(async (forceDemo = false) => {
    setScanning(true);
    try {
      const result = await scanDevice({
        platform: Platform.OS,
        nativeScanner: getNativeScanner(),
        forceDemo,
      });
      setScan(result);
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    runScan(false);
  }, [runScan]);

  const analysis = useMemo(
    () => (scan && scan.apps ? analyzeDevice(scan.apps) : null),
    [scan],
  );

  const openApp = useCallback((packageName) => {
    setSelectedApp(packageName);
  }, []);

  const goTab = useCallback((tabId) => {
    setSelectedApp(null);
    setTab(tabId);
  }, []);

  const selectedItem =
    analysis && selectedApp
      ? analysis.analyzed.find((a) => a.app.packageName === selectedApp) || null
      : null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>PS</Text>
          </View>
          <View>
            <Text style={styles.title}>Privacy Scanner</Text>
            <Text style={styles.subtitle}>Mobile app permission audit</Text>
          </View>
        </View>
        {scan ? <ModePill source={scan.source} /> : null}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {!scan || scanning ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Scanning installed apps…</Text>
          </View>
        ) : scan.source === 'unavailable' ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableTitle}>Scanning isn’t possible on iOS</Text>
            <Text style={styles.unavailableText}>{scan.message}</Text>
            <TouchableOpacity
              testID="explore-demo-button"
              style={styles.primaryButton}
              onPress={() => runScan(true)}
            >
              <Text style={styles.primaryButtonText}>Explore demo data</Text>
            </TouchableOpacity>
          </View>
        ) : selectedItem ? (
          <AppDetail item={selectedItem} onBack={() => setSelectedApp(null)} />
        ) : (
          <View>
            {scan.source === 'demo' && tab === 'dashboard' ? (
              <View style={styles.demoNote}>
                <Text style={styles.demoNoteText}>
                  Demo mode — showing sample data for 17 apps. Run a development build on
                  an Android device for a real scan of your installed apps.
                </Text>
              </View>
            ) : null}
            {tab === 'dashboard' ? (
              <Dashboard
                analysis={analysis}
                source={scan.source}
                fallbackFromLive={scan.fallbackFromLive === true}
                onOpenApp={openApp}
                onRescan={() => runScan(scan.source === 'demo')}
                scanning={scanning}
              />
            ) : null}
            {tab === 'apps' ? <AppList analysis={analysis} onOpenApp={openApp} /> : null}
            {tab === 'findings' ? <Findings analysis={analysis} onOpenApp={openApp} /> : null}
          </View>
        )}
      </ScrollView>

      {scan && scan.source !== 'unavailable' ? (
        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              testID={t.testID}
              style={[styles.tab, tab === t.id && !selectedItem ? styles.tabActive : null]}
              onPress={() => goTab(t.id)}
            >
              <Text style={[styles.tabText, tab === t.id && !selectedItem ? styles.tabTextActive : null]}>
                {t.label}
              </Text>
              {t.id === 'findings' && analysis ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{analysis.totalFindings}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted },
  modePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  modeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  modeLive: { backgroundColor: colors.successBg },
  modeLiveText: { color: colors.successText },
  modeDemo: { backgroundColor: colors.warningBg },
  modeDemoText: { color: colors.warningText },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 96,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  loading: { alignItems: 'center', marginTop: 80 },
  loadingText: { marginTop: 12, fontSize: 15, color: colors.muted },
  unavailableCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  unavailableTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  unavailableText: { fontSize: 14, color: colors.muted, lineHeight: 21, marginTop: 8 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  demoNote: {
    backgroundColor: colors.infoBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  demoNoteText: { fontSize: 13, color: colors.infoText, lineHeight: 19 },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  tabActive: { borderTopWidth: 2, borderTopColor: colors.primary, marginTop: -10, paddingTop: 16 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.primary },
  tabBadge: {
    backgroundColor: colors.dangerText,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
});
