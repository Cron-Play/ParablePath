import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import NativeAdCard from '@/components/NativeAdCard';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shuffle, BookOpen, Zap, Trophy, Cross } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/GameColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import * as Haptics from 'expo-haptics';

type Difficulty = 'easy' | 'medium' | 'hard';

const GAME_MODES = [
  {
    id: 'scramble',
    name: 'Word Scramble',
    description: 'Unscramble Bible words before time runs out!',
    icon: Shuffle,
    color: '#C9922A',
    gradient: ['#1E3048', '#162436'] as [string, string],
  },
  {
    id: 'fill_in_blank',
    name: 'Scripture Fill-in',
    description: 'Complete the missing word in Bible verses',
    icon: BookOpen,
    color: '#E8C56A',
    gradient: ['#1E3048', '#162436'] as [string, string],
  },
  {
    id: 'books_blitz',
    name: 'Books Blitz',
    description: 'Name as many Bible books as you can in 60 seconds!',
    icon: Zap,
    color: '#4CAF7D',
    gradient: ['#1E3048', '#162436'] as [string, string],
  },
];

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

function AnimatedCard({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslate]);

  function handleModePress(modeId: string) {
    console.log('[HomeScreen] Game mode selected:', modeId, 'difficulty:', difficulty);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/game/${modeId}?difficulty=${difficulty}`);
  }

  function handleDifficultyPress(d: Difficulty) {
    console.log('[HomeScreen] Difficulty changed to:', d);
    Haptics.selectionAsync();
    setDifficulty(d);
  }

  function handleLeaderboardPress() {
    console.log('[HomeScreen] Leaderboard button pressed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/leaderboard');
  }

  function handleDeleteDataPress() {
    console.log('[HomeScreen] Delete My Data link pressed');
    router.push('/delete-data');
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslate }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(201,146,42,0.12)', 'transparent']}
            style={styles.headerGlow}
          />
          <View style={styles.crossContainer}>
            <Cross size={28} color={COLORS.accent} strokeWidth={2.5} />
          </View>
          <Text style={styles.appTitle}>Bible Word</Text>
          <Text style={styles.appTitleAccent}>Challenge</Text>
          <Text style={styles.tagline}>Test your knowledge of God's Word</Text>
        </Animated.View>

        {/* Difficulty Selector */}
        <AnimatedCard index={0}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Select Difficulty</Text>
          </View>
          <View style={styles.difficultyRow}>
            {DIFFICULTIES.map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <AnimatedPressable
                  key={d.id}
                  onPress={() => handleDifficultyPress(d.id)}
                  style={[
                    styles.difficultyBtn,
                    isSelected && styles.difficultyBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyBtnText,
                      isSelected && styles.difficultyBtnTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </AnimatedCard>

        {/* Game Mode Cards */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Choose Your Challenge</Text>
        </View>

        {GAME_MODES.map((mode, index) => {
          const Icon = mode.icon;
          const difficultyBadgeColor =
            difficulty === 'easy'
              ? COLORS.success
              : difficulty === 'medium'
              ? COLORS.primary
              : COLORS.danger;
          const difficultyLabel =
            difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

          return (
            <AnimatedCard key={mode.id} index={index + 1}>
              <AnimatedPressable
                onPress={() => handleModePress(mode.id)}
                style={styles.modeCard}
              >
                <LinearGradient
                  colors={mode.gradient}
                  style={styles.modeCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.modeCardBorder} />
                  <View style={styles.modeCardInner}>
                    <View
                      style={[
                        styles.modeIconCircle,
                        { backgroundColor: `${mode.color}20` },
                      ]}
                    >
                      <Icon size={26} color={mode.color} strokeWidth={2} />
                    </View>
                    <View style={styles.modeCardText}>
                      <View style={styles.modeCardTitleRow}>
                        <Text style={styles.modeCardTitle}>{mode.name}</Text>
                        <View
                          style={[
                            styles.difficultyBadge,
                            { backgroundColor: `${difficultyBadgeColor}20` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.difficultyBadgeText,
                              { color: difficultyBadgeColor },
                            ]}
                          >
                            {difficultyLabel}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.modeCardDesc}>{mode.description}</Text>
                    </View>
                  </View>
                  <View style={styles.modeCardArrow}>
                    <Text style={[styles.modeCardArrowText, { color: mode.color }]}>
                      ›
                    </Text>
                  </View>
                </LinearGradient>
              </AnimatedPressable>
            </AnimatedCard>
          );
        })}

        {/* Native Ad (Android only) */}
        {Platform.OS === 'android' && (
          <AnimatedCard index={4}>
            <NativeAdCard />
          </AnimatedCard>
        )}

        {/* Leaderboard Button */}
        <AnimatedCard index={5}>
          <AnimatedPressable
            onPress={handleLeaderboardPress}
            style={styles.leaderboardBtn}
          >
            <Trophy size={20} color={COLORS.accent} strokeWidth={2} />
            <Text style={styles.leaderboardBtnText}>View Leaderboard</Text>
          </AnimatedPressable>
        </AnimatedCard>

        {/* Footer verse */}
        <AnimatedCard index={6}>
          <View style={styles.footerVerse}>
            <Text style={styles.footerVerseText}>
              "Your word is a lamp to my feet and a light to my path."
            </Text>
            <Text style={styles.footerVerseRef}>— Psalm 119:105</Text>
          </View>
        </AnimatedCard>

        {/* Delete My Data */}
        <AnimatedCard index={7}>
          <AnimatedPressable onPress={handleDeleteDataPress} style={styles.deleteDataLink}>
            <Text style={styles.deleteDataLinkText}>Delete My Data</Text>
          </AnimatedPressable>
        </AnimatedCard>
      </ScrollView>
    </View>
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
    gap: 12,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: -20,
    height: 200,
    borderRadius: 100,
  },
  crossContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 32,
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  appTitleAccent: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 32,
    color: COLORS.accent,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'Lato_400Regular_Italic',
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionLabelText: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 12,
    color: COLORS.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  difficultyBtnActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  difficultyBtnText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  difficultyBtnTextActive: {
    color: COLORS.accent,
  },
  modeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  modeCardGradient: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  modeCardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modeCardText: {
    flex: 1,
    gap: 4,
  },
  modeCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  modeCardTitle: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  modeCardDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modeCardArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -14,
  },
  modeCardArrowText: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '300',
  },
  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  leaderboardBtnText: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: COLORS.accent,
    letterSpacing: 0.3,
  },
  footerVerse: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
  },
  footerVerseText: {
    fontFamily: 'Lato_400Regular_Italic',
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerVerseRef: {
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  deleteDataLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteDataLinkText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
});
