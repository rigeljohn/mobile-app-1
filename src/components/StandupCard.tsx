import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Animated, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { LogEntry } from '../types';
import { colors, spacing, radius, typography } from '../utils/theme';
import { useStandupStore } from '../store/standupStore';

interface Props {
  entry: LogEntry;
}

export function StandupCard({ entry }: Props) {
  const deleteLog = useStandupStore(s => s.deleteLog);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const buildCopyText = () => {
    if (!entry.formattedStandup) return entry.rawLog;
    const { yesterday, today, blockers } = entry.formattedStandup;
    const fmt = (items: string[]) => items.map(i => `  • ${i}`).join('\n');
    return `✅ Yesterday:\n${fmt(yesterday)}\n\n🔨 Today:\n${fmt(today)}\n\n🚧 Blockers:\n${fmt(blockers)}`;
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(buildCopyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Remove this standup log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog(entry.id) },
    ]);
  };

  const Section = ({ icon, label, items, color }: {
    icon: string; label: string; items: string[]; color: string;
  }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={[styles.sectionLabel, { color }]}>{label}</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.bullet, { backgroundColor: color }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
          {entry.sprint && (
            <View style={styles.sprintBadge}>
              <Text style={styles.sprintText}>{entry.sprint}</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleCopy}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copied ? colors.success : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Formatted standup */}
      {entry.formattedStandup ? (
        <View style={styles.body}>
          <Section icon="✅" label="Yesterday" items={entry.formattedStandup.yesterday} color={colors.yesterday} />
          <View style={styles.divider} />
          <Section icon="🔨" label="Today" items={entry.formattedStandup.today} color={colors.today} />
          <View style={styles.divider} />
          <Section icon="🚧" label="Blockers" items={entry.formattedStandup.blockers} color={colors.blockers} />
        </View>
      ) : (
        <View style={styles.rawLog}>
          <Text style={styles.rawText}>{entry.rawLog}</Text>
          <View style={styles.generatingRow}>
            <Ionicons name="sync" size={13} color={colors.primary} />
            <Text style={styles.generatingText}>Formatting with AI...</Text>
          </View>
        </View>
      )}

      {/* Copy bar */}
      <TouchableOpacity style={[styles.copyBar, copied && styles.copyBarActive]} onPress={handleCopy}>
        <Ionicons
          name={copied ? 'checkmark-circle' : 'copy'}
          size={14}
          color={copied ? colors.success : colors.primary}
        />
        <Text style={[styles.copyBarText, copied && { color: colors.success }]}>
          {copied ? 'Copied to clipboard!' : 'Tap to copy for Slack / Teams'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  date: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sprintBadge: {
    marginTop: 4,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  sprintText: {
    ...typography.caption,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  section: {
    gap: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionLabel: {
    ...typography.label,
    textTransform: 'uppercase',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    opacity: 0.8,
  },
  bulletText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 2,
  },
  rawLog: {
    padding: spacing.md,
    gap: 8,
  },
  rawText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  generatingText: {
    ...typography.caption,
    color: colors.primary,
  },
  copyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: spacing.sm,
    backgroundColor: colors.primaryMuted,
  },
  copyBarActive: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  copyBarText: {
    ...typography.caption,
    color: colors.primary,
  },
});
