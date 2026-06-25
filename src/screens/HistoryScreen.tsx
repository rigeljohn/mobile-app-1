import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStandupStore } from '../store/standupStore';
import { StandupCard } from '../components/StandupCard';
import { colors, spacing, radius, typography } from '../utils/theme';
import { LogEntry } from '../types';

type Filter = 'all' | 'today' | 'week';

export function HistoryScreen() {
  const { logs, clearAll } = useStandupStore();
  const [filter, setFilter] = useState<Filter>('all');

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filtered = logs.filter(l => {
    if (filter === 'today') return l.date === today;
    if (filter === 'week') return l.date >= weekAgo;
    return true;
  });

  // Group by date
  const grouped: { date: string; items: LogEntry[] }[] = [];
  filtered.forEach(entry => {
    const existing = grouped.find(g => g.date === entry.date);
    if (existing) existing.items.push(entry);
    else grouped.push({ date: entry.date, items: [entry] });
  });

  const handleClearAll = () => {
    Alert.alert('Clear All Logs', 'This will delete all standup history. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearAll },
    ]);
  };

  const formatGroupDate = (dateStr: string) => {
    if (dateStr === today) return 'Today';
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === yesterday) return 'Yesterday';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  };

  const renderGroup = ({ item }: { item: { date: string; items: LogEntry[] } }) => (
    <View>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{formatGroupDate(item.date)}</Text>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{item.items.length}</Text>
        </View>
      </View>
      {item.items.map(entry => (
        <StandupCard key={entry.id} entry={entry} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {logs.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {logs.length > 0 && (
        <View style={styles.filterRow}>
          {(['all', 'today', 'week'] as Filter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : 'This Week'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* List */}
      {grouped.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📭</Text>
          <Text style={styles.emptyTitle}>No standup logs yet</Text>
          <Text style={styles.emptySubtitle}>
            Head to the Log tab and create your first standup entry.
          </Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={item => item.date}
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,92,114,0.1)',
  },
  clearText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: spacing.sm,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateText: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateBadge: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
