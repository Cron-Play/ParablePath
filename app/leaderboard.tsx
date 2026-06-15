import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Animated,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Medal, Trophy, RefreshCw } from 'lucide-react-native';
import { COLORS } from '@/constants/GameColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';

const BASE_URL = 'https://jywq8gxb4m4zxstgqncjyjbn3wbk3m9r.app.specular.dev';

interface Score {
  id: string;
  player_name: string;
  game_mode: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken_seconds: number;
  created_at: string;
}

type GameMode = 'scramble' | 'fill_in_blank' | 'books_blitz';

const TABS: { id: GameMode; label: string }[] = [
  { id: 'scramble', label: 'Scramble' },
  { id: 'fill_in_blank', label: 'Fill-in' },
  { id: 'books_blitz', label: 'Blitz' },
];

function SkeletonRow() {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);
  return (
    <Animated.View style={[styles.skeletonRow, { opacity }]}>
      <View style={styles.skeletonRank} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonName} />
        <View style={styles.skeletonSub} />
      </View>
      <View style={styles.skeletonScore} />
    </Animated.View>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function getRankStyle(rank: number): { bg: string; text: string; border: string } {
  if (rank === 1) return { bg: 'rgba(232,197,106,0.15)', text: '#E8C56A', border: 'rgba(232,197,106,0.4)' };
  if (rank === 2) return { bg: 'rgba(192,192,192,0.12)', text: '#C0C0C0', border: 'rgba(192,192,192,0.3)' };
  if (rank === 3) return { bg: 'rgba(205,127,50,0.12)', text: '#CD7F32', border: 'rgba(205,127,50,0.3)' };
  return { bg: 'transparent', text: COLORS.textTertiary, border: 'transparent' };
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<GameMode>('scramble');
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabIndicatorX = useRef(new Animated.Value(0)).current;

  const fetchScores = useCallback(
    async (mode: GameMode, isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      setError(null);

      const url = `${BASE_URL}/api/scores?game_mode=${mode}&limit=20`;
      console.log('[LeaderboardScreen] Fetching scores:', url);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
        }
        const data = await res.json();
        console.log('[LeaderboardScreen] Scores loaded:', data.scores?.length);
        setScores(data.scores || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[LeaderboardScreen] Failed to fetch scores:', msg);
        setError(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchScores(activeTab);
  }, [activeTab, fetchScores]);

  function handleTabPress(tab: GameMode, index: number) {
    console.log('[LeaderboardScreen] Tab changed to:', tab);
    setActiveTab(tab);
    Animated.timing(tabIndicatorX, {
      toValue: index,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  function handleRefresh() {
    console.log('[LeaderboardScreen] Pull-to-refresh triggered');
    setRefreshing(true);
    fetchScores(activeTab, true);
  }

  function renderScoreItem({ item, index }: { item: Score; index: number }) {
    const rank = index + 1;
    const rankStyle = getRankStyle(rank);
    const dateDisplay = formatDate(item.created_at);
    const correctDisplay = `${item.correct_answers}/${item.total_questions}`;
    const scoreDisplay = String(item.score);
    const nameDisplay = item.player_name || 'Anonymous';

    return (
      <Animated.View
        style={[
          styles.scoreRow,
          rank <= 3 && {
            backgroundColor: rankStyle.bg,
            borderColor: rankStyle.border,
          },
        ]}
      >
        <View
          style={[
            styles.rankBadge,
            rank <= 3 && {
              backgroundColor: rankStyle.bg,
              borderColor: rankStyle.border,
              borderWidth: 1,
            },
          ]}
        >
          {rank <= 3 ? (
            <Medal size={16} color={rankStyle.text} strokeWidth={2} />
          ) : (
            <Text style={[styles.rankNumber, { color: rankStyle.text }]}>{rank}</Text>
          )}
        </View>

        <View style={styles.scoreInfo}>
          <Text style={styles.playerName} numberOfLines={1}>
            {nameDisplay}
          </Text>
          <View style={styles.scoreMetaRow}>
            <Text style={styles.scoreMeta}>{correctDisplay}</Text>
            <Text style={styles.scoreMetaDot}>·</Text>
            <Text style={styles.scoreMeta}>{dateDisplay}</Text>
          </View>
        </View>

        <View style={styles.scoreValueContainer}>
          <Text style={[styles.scoreValue, rank <= 3 && { color: rankStyle.text }]}>
            {scoreDisplay}
          </Text>
          <Text style={styles.scoreValueLabel}>pts</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: 'Leaderboard',
          headerTitleStyle: {
            fontFamily: 'Cinzel_600SemiBold',
            color: COLORS.accent,
            fontSize: 17,
          },
        }}
      />

      {/* Tab selector */}
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <AnimatedPressable
              key={tab.id}
              onPress={() => handleTabPress(tab.id, index)}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                {tab.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.listContent}>
          {[...Array(8)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <RefreshCw size={40} color={COLORS.textTertiary} strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Couldn't load scores</Text>
          <Text style={styles.errorBody}>Check your connection and try again</Text>
          <AnimatedPressable
            onPress={() => fetchScores(activeTab)}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Try again</Text>
          </AnimatedPressable>
        </View>
      ) : scores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Trophy size={52} color={COLORS.textTertiary} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No scores yet</Text>
          <Text style={styles.emptyBody}>
            Be the first to complete a game and claim the top spot!
          </Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(item) => item.id}
          renderItem={renderScoreItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 32 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tabBtnText: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 13,
    color: COLORS.textTertiary,
    letterSpacing: 0.3,
  },
  tabBtnTextActive: {
    color: COLORS.accent,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    flexShrink: 0,
  },
  rankNumber: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  scoreInfo: {
    flex: 1,
    gap: 3,
  },
  playerName: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
    letterSpacing: -0.1,
  },
  scoreMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scoreMeta: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  scoreMetaDot: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  scoreValueContainer: {
    alignItems: 'flex-end',
    gap: 1,
  },
  scoreValue: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 20,
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  scoreValueLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 14,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  skeletonRank: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSecondary,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonName: {
    height: 14,
    width: '55%',
    borderRadius: 7,
    backgroundColor: COLORS.surfaceSecondary,
  },
  skeletonSub: {
    height: 11,
    width: '35%',
    borderRadius: 5,
    backgroundColor: COLORS.surfaceSecondary,
  },
  skeletonScore: {
    width: 44,
    height: 20,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorTitle: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
  },
  errorBody: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 4,
  },
  retryBtnText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
    color: COLORS.accent,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
