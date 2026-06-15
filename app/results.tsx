import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Star, Home, BarChart2, CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/GameColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import * as Haptics from 'expo-haptics';

const BASE_URL = 'https://p85df9uqmvg68rwnzwrt7e2zf325zy92.app.specular.dev';

type GameMode = 'scramble' | 'fill_in_blank' | 'books_blitz';

const MODE_LABELS: Record<GameMode, string> = {
  scramble: 'Word Scramble',
  fill_in_blank: 'Scripture Fill-in',
  books_blitz: 'Books Blitz',
};

function getEncouragement(score: number, total: number): { quote: string; ref: string; tier: 'high' | 'mid' | 'low' } {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.7) {
    return {
      quote: '"Well done, good and faithful servant!"',
      ref: '— Matthew 25:23',
      tier: 'high',
    };
  } else if (pct >= 0.4) {
    return {
      quote: '"I can do all things through Christ who strengthens me."',
      ref: '— Philippians 4:13',
      tier: 'mid',
    };
  } else {
    return {
      quote: '"Be strong and courageous. Do not be afraid."',
      ref: '— Joshua 1:9',
      tier: 'low',
    };
  }
}

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    score: string;
    correct_answers: string;
    total_questions: string;
    time_taken: string;
    game_mode: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const score = Number(params.score) || 0;
  const correctAnswers = Number(params.correct_answers) || 0;
  const totalQuestions = Number(params.total_questions) || 10;
  const timeTaken = Number(params.time_taken) || 0;
  const gameMode = (params.game_mode as GameMode) || 'scramble';

  const [playerName, setPlayerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const encouragement = getEncouragement(score, totalQuestions * 10);
  const modeLabel = MODE_LABELS[gameMode] || gameMode;

  // Entrance animations
  const trophyScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.spring(trophyScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 6,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [trophyScale, contentOpacity, contentTranslate, contentTranslate]);

  async function handleSubmitScore() {
    if (!playerName.trim()) return;
    console.log('[ResultsScreen] Submitting score:', {
      player_name: playerName,
      game_mode: gameMode,
      score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      time_taken_seconds: timeTaken,
    });

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: playerName.trim(),
          game_mode: gameMode,
          score,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          time_taken_seconds: timeTaken,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
      }

      const data = await res.json();
      console.log('[ResultsScreen] Score submitted successfully:', data);
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[ResultsScreen] Score submission failed:', msg);
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePlayAgain() {
    console.log('[ResultsScreen] Play again pressed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/(home)');
  }

  function handleViewLeaderboard() {
    console.log('[ResultsScreen] View leaderboard pressed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/leaderboard');
  }

  const tierColor =
    encouragement.tier === 'high'
      ? COLORS.accent
      : encouragement.tier === 'mid'
      ? COLORS.primary
      : COLORS.textSecondary;

  const minutesDisplay = Math.floor(timeTaken / 60);
  const secondsDisplay = timeTaken % 60;
  const timeDisplay = minutesDisplay > 0
    ? `${minutesDisplay}m ${secondsDisplay}s`
    : `${secondsDisplay}s`;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ title: 'Results', headerShown: true }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trophy */}
        <View style={styles.trophySection}>
          <Animated.View
            style={[
              styles.trophyCircle,
              {
                transform: [{ scale: trophyScale }],
                borderColor: tierColor,
                backgroundColor: `${tierColor}15`,
              },
            ]}
          >
            <Trophy size={52} color={tierColor} strokeWidth={1.5} />
          </Animated.View>

          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={styles.modeLabel}>{modeLabel}</Text>
            <Text style={styles.finalScore}>{score}</Text>
            <Text style={styles.finalScoreLabel}>points</Text>
          </Animated.View>
        </View>

        {/* Stats */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}
        >
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={styles.statValue}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{timeDisplay}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </Animated.View>

        {/* Encouragement */}
        <Animated.View
          style={[
            styles.encouragementCard,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
              borderColor: `${tierColor}30`,
            },
          ]}
        >
          <Star size={16} color={tierColor} strokeWidth={2} />
          <Text style={[styles.encouragementQuote, { color: tierColor }]}>
            {encouragement.quote}
          </Text>
          <Text style={styles.encouragementRef}>{encouragement.ref}</Text>
        </Animated.View>

        {/* Submit score */}
        <Animated.View
          style={[
            styles.submitSection,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}
        >
          <Text style={styles.submitTitle}>Save to Leaderboard</Text>

          {submitted ? (
            <View style={styles.submittedRow}>
              <CheckCircle size={20} color={COLORS.success} strokeWidth={2} />
              <Text style={styles.submittedText}>Score saved!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.inputLabel}>Your name</Text>
              <TextInput
                style={styles.input}
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="Enter your name..."
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSubmitScore}
                maxLength={30}
              />
              {submitError && (
                <Text style={styles.errorText}>
                  Couldn't save score. Try again.
                </Text>
              )}
              <AnimatedPressable
                onPress={handleSubmitScore}
                disabled={submitting || !playerName.trim()}
                style={[
                  styles.submitBtn,
                  (!playerName.trim() || submitting) && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Saving...' : 'Submit Score'}
                </Text>
              </AnimatedPressable>
            </>
          )}
        </Animated.View>

        {/* Navigation buttons */}
        <Animated.View
          style={[
            styles.navButtons,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}
        >
          <AnimatedPressable onPress={handlePlayAgain} style={styles.playAgainBtn}>
            <Home size={18} color={COLORS.background} strokeWidth={2} />
            <Text style={styles.playAgainBtnText}>Play Again</Text>
          </AnimatedPressable>

          <AnimatedPressable onPress={handleViewLeaderboard} style={styles.leaderboardBtn}>
            <BarChart2 size={18} color={COLORS.accent} strokeWidth={2} />
            <Text style={styles.leaderboardBtnText}>Leaderboard</Text>
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
  },
  trophySection: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  modeLabel: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 13,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  finalScore: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 56,
    color: COLORS.accent,
    letterSpacing: -1,
    lineHeight: 64,
    fontVariant: ['tabular-nums'],
  },
  finalScoreLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  statCardMiddle: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  statValue: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 20,
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  encouragementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  encouragementQuote: {
    fontFamily: 'Lato_400Regular_Italic',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  encouragementRef: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 12,
    color: COLORS.textTertiary,
    letterSpacing: 0.3,
  },
  submitSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitTitle: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  inputLabel: {
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Lato_400Regular',
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: COLORS.danger,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
  },
  submitBtnText: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: COLORS.background,
    letterSpacing: 0.3,
  },
  submittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  submittedText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
    color: COLORS.success,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 52,
  },
  playAgainBtnText: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: COLORS.background,
    letterSpacing: 0.3,
  },
  leaderboardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 52,
  },
  leaderboardBtnText: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: COLORS.accent,
    letterSpacing: 0.3,
  },
});
