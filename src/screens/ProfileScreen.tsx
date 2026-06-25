import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStandupStore } from '../store/standupStore';
import { colors, spacing, radius, typography } from '../utils/theme';

export function ProfileScreen() {
  const { logs } = useStandupStore();
  const [notifications, setNotifications] = React.useState(true);

  const totalLogs = logs.length;
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === today).length;
  const streak = calcStreak(logs);

  const stats = [
    { label: 'Total Logs', value: totalLogs, icon: '📝' },
    { label: 'Today', value: todayLogs, icon: '📅' },
    { label: 'Day Streak', value: streak, icon: '🔥' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>👨‍💻</Text>
          </View>
          <Text style={styles.profileName}>Developer</Text>
          <Text style={styles.profileSub}>Using DevStand AI</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            <SettingRow
              icon="notifications-outline"
              label="Standup Reminders"
              subtitle="Daily 9am reminder"
              right={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.bgElevated, true: colors.primaryMuted }}
                  thumbColor={notifications ? colors.primary : colors.textMuted}
                />
              }
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="time-outline"
              label="Reminder Time"
              subtitle="9:00 AM"
              right={<Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI MODEL</Text>
          <View style={styles.card}>
            <SettingRow
              icon="flash-outline"
              label="Claude claude-sonnet-4-6"
              subtitle="Fast, intelligent standup formatting"
              right={
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.card}>
            <SettingRow
              icon="information-circle-outline"
              label="Version"
              subtitle="DevStand MVP 1.0"
              right={null}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="code-slash-outline"
              label="Built with"
              subtitle="React Native + Claude AI"
              right={null}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, subtitle, right }: {
  icon: string; label: string; subtitle: string; right: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

function calcStreak(logs: any[]) {
  const days = [...new Set(logs.map(l => l.date))].sort().reverse();
  let streak = 0;
  let d = new Date();
  for (const day of days) {
    const expected = d.toISOString().split('T')[0];
    if (day === expected) {
      streak++;
      d = new Date(d.getTime() - 86400000);
    } else break;
  }
  return streak;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  profileCard: {
    margin: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    ...typography.h2,
    color: '#fff',
  },
  profileSub: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: { fontSize: 20 },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 52 + spacing.md,
  },
  activeBadge: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  activeBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
});
