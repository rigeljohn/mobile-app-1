import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStandupStore } from '../store/standupStore';
import { colors, spacing, radius, typography } from '../utils/theme';

const PLACEHOLDERS = [
  "Fixed the auth bug and reviewed 2 PRs. Today I'll work on the dashboard API. Waiting on design assets.",
  "Attended sprint planning. Worked on DB schema changes. Blocked by missing credentials.",
  "Shipped the notification feature. Starting on search indexing today. No blockers.",
];

export function HomeScreen() {
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const { addLog, isGenerating, logs } = useStandupStore();
  const inputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const interval = setInterval(() => {
      setPlaceholder(p => {
        const idx = PLACEHOLDERS.indexOf(p);
        return PLACEHOLDERS[(idx + 1) % PLACEHOLDERS.length];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setInput('');
    inputRef.current?.blur();
    await addLog(trimmed);
  };

  const charCount = input.length;
  const isOverLimit = charCount > 500;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.title}>DevStand</Text>
            </View>
            <View style={styles.headerRight}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.aiChip}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="flash" size={12} color="#fff" />
                <Text style={styles.aiChipText}>Claude AI</Text>
              </LinearGradient>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Log input card */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <View style={styles.inputHeaderLeft}>
                  <View style={styles.dot} />
                  <Text style={styles.inputLabel}>WHAT DID YOU WORK ON?</Text>
                </View>
                <Text style={[styles.charCount, isOverLimit && { color: colors.error }]}>
                  {charCount}/500
                </Text>
              </View>

              <TextInput
                ref={inputRef}
                style={[styles.textInput, isOverLimit && styles.textInputError]}
                value={input}
                onChangeText={setInput}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={600}
                textAlignVertical="top"
                returnKeyType="default"
              />

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!input.trim() || isGenerating || isOverLimit) && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!input.trim() || isGenerating || isOverLimit}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={input.trim() && !isOverLimit ? [colors.primary, colors.primaryDark] : [colors.bgElevated, colors.bgElevated]}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isGenerating ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.submitText}>Generating...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={18} color={input.trim() ? '#fff' : colors.textMuted} />
                        <Text style={[styles.submitText, !input.trim() && { color: colors.textMuted }]}>
                          Generate Standup
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <Text style={styles.hint}>
                Plain language is fine — AI will structure it into Yesterday / Today / Blockers
              </Text>
            </View>

            {/* Today's count */}
            {logs.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statChip}>
                  <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                  <Text style={styles.statText}>{getTodayCount(logs)} today</Text>
                </View>
                <View style={styles.statChip}>
                  <Ionicons name="layers-outline" size={13} color={colors.accent} />
                  <Text style={styles.statText}>{logs.length} total logs</Text>
                </View>
              </View>
            )}

            {/* Recent quick tips when empty */}
            {logs.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Text style={{ fontSize: 40 }}>📝</Text>
                </View>
                <Text style={styles.emptyTitle}>Start your first standup</Text>
                <Text style={styles.emptySubtitle}>
                  Type what you worked on in plain language. Claude will format it into a clean standup update ready to paste into Slack.
                </Text>
                <View style={styles.tipsGrid}>
                  {TIPS.map((tip, i) => (
                    <View key={i} style={styles.tipCard}>
                      <Text style={styles.tipIcon}>{tip.icon}</Text>
                      <Text style={styles.tipText}>{tip.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const TIPS = [
  { icon: '💬', text: 'Just describe your work naturally' },
  { icon: '🤖', text: 'AI structures it for you' },
  { icon: '📋', text: 'One tap to copy to Slack' },
  { icon: '📅', text: 'Logs organized by day' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 👋';
  if (h < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

function getTodayCount(logs: any[]) {
  const today = new Date().toISOString().split('T')[0];
  return logs.filter(l => l.date === today).length;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerRight: { paddingTop: 4 },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  aiChipText: { ...typography.caption, color: '#fff', fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  inputCard: {
    margin: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  inputLabel: {
    ...typography.label,
    color: colors.primary,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  textInput: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 120,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInputError: {
    borderColor: colors.error,
  },
  submitBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  submitText: {
    ...typography.body,
    fontWeight: '600',
    color: '#fff',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bgCard,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  tipCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.sm,
    width: '45%',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipIcon: { fontSize: 22 },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
