import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { Lightbulb, SkipForward, Send, CheckCircle, XCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/GameColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { BIBLE_BOOKS, getCanonicalBookName } from '@/constants/BibleBooks';
import * as Haptics from 'expo-haptics';

const BASE_URL = 'https://jywq8gxb4m4zxstgqncjyjbn3wbk3m9r.app.specular.dev';

interface Question {
  id: string;
  category: string;
  question: string;
  answer: string;
  hint: string;
  difficulty: string;
  points: number;
  created_at: string;
}

type GameMode = 'scramble' | 'fill_in_blank' | 'books_blitz';

const MODE_TITLES: Record<GameMode, string> = {
  scramble: 'Word Scramble',
  fill_in_blank: 'Scripture Fill-in',
  books_blitz: 'Books Blitz',
};

const TOTAL_QUESTIONS = 10;
const SCRAMBLE_TIME = 30;
const FILL_TIME = 45;
const BLITZ_TIME = 60;

function SkeletonLine({ width, height = 14 }: { width: number | string; height?: number }) {
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
    <Animated.View
      style={{
        width,
        height,
        borderRadius: height / 2,
        backgroundColor: COLORS.surfaceSecondary,
        opacity,
      }}
    />
  );
}

export default function GameScreen() {
  const { mode, difficulty } = useLocalSearchParams<{ mode: string; difficulty: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const gameMode = (mode as GameMode) || 'scramble';
  const gameDifficulty = difficulty || 'medium';

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answer, setAnswer] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(gameMode === 'books_blitz' ? BLITZ_TIME : gameMode === 'fill_in_blank' ? FILL_TIME : SCRAMBLE_TIME);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Books Blitz state
  const [blitzInput, setBlitzInput] = useState('');
  const [foundBooks, setFoundBooks] = useState<string[]>([]);
  const blitzInputRef = useRef<TextInput>(null);

  // Animations
  const flashAnim = useRef(new Animated.Value(0)).current;
  const timerShake = useRef(new Animated.Value(0)).current;
  const timerScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch questions
  useEffect(() => {
    if (gameMode === 'books_blitz') {
      setLoading(false);
      setGameStarted(true);
      startTimeRef.current = Date.now();
      return;
    }

    const category = gameMode === 'scramble' ? 'scramble' : 'fill_in_blank';
    const url = `${BASE_URL}/api/questions?category=${category}&difficulty=${gameDifficulty}&limit=${TOTAL_QUESTIONS}`;
    console.log('[GameScreen] Fetching questions:', url);

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('[GameScreen] Questions loaded:', data.questions?.length);
        setQuestions(data.questions || []);
        setLoading(false);
        setGameStarted(true);
        startTimeRef.current = Date.now();
      })
      .catch((err) => {
        console.error('[GameScreen] Failed to fetch questions:', err.message);
        setError(err.message);
        setLoading(false);
      });
  }, [gameMode, gameDifficulty]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        if (prev <= 10) {
          // Pulse animation
          Animated.sequence([
            Animated.timing(timerScale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
            Animated.timing(timerScale, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]).start();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver]);

  function handleTimeUp() {
    if (gameMode === 'books_blitz') {
      navigateToResults(score, foundBooks.length, BLITZ_TIME);
    } else {
      // Move to next question or end game
      if (currentIndex >= TOTAL_QUESTIONS - 1 || currentIndex >= questions.length - 1) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        navigateToResults(score, correctAnswers, elapsed);
      } else {
        nextQuestion();
      }
    }
  }

  function navigateToResults(finalScore: number, correct: number, timeTaken: number) {
    console.log('[GameScreen] Game over. Score:', finalScore, 'Correct:', correct, 'Time:', timeTaken);
    setGameOver(true);
    router.replace({
      pathname: '/results',
      params: {
        score: String(finalScore),
        correct_answers: String(correct),
        total_questions: gameMode === 'books_blitz' ? '66' : String(TOTAL_QUESTIONS),
        time_taken: String(timeTaken),
        game_mode: gameMode,
      },
    });
  }

  function flashFeedback(type: 'correct' | 'wrong') {
    setFeedback(type);
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setFeedback(null));
  }

  function nextQuestion() {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= TOTAL_QUESTIONS || nextIdx >= questions.length) {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      navigateToResults(score, correctAnswers, elapsed);
      return;
    }
    setCurrentIndex(nextIdx);
    setAnswer('');
    setHintVisible(false);
    const newTime = gameMode === 'fill_in_blank' ? FILL_TIME : SCRAMBLE_TIME;
    setTimeLeft(newTime);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: nextIdx / TOTAL_QUESTIONS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }

  function handleSubmit() {
    if (!answer.trim()) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentQ.answer.trim().toLowerCase();
    const isCorrect = userAnswer === correctAnswer;

    console.log('[GameScreen] Answer submitted:', answer, '| Correct:', currentQ.answer, '| Match:', isCorrect);

    if (isCorrect) {
      const pts = hintVisible ? Math.max(0, currentQ.points - 5) : currentQ.points;
      setScore((s) => s + pts);
      setCorrectAnswers((c) => c + 1);
      flashFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => nextQuestion(), 600);
    } else {
      flashFeedback('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleSkip() {
    console.log('[GameScreen] Question skipped');
    setScore((s) => Math.max(0, s - 10));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextQuestion();
  }

  function handleHint() {
    console.log('[GameScreen] Hint requested');
    setHintVisible(true);
    setScore((s) => Math.max(0, s - 5));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleBlitzSubmit() {
    const input = blitzInput.trim();
    if (!input) return;

    const canonical = getCanonicalBookName(input);
    console.log('[GameScreen] Books Blitz entry:', input, '| Valid:', !!canonical);

    if (canonical && !foundBooks.includes(canonical)) {
      const newBooks = [...foundBooks, canonical];
      setFoundBooks(newBooks);
      setScore(newBooks.length * 10);
      flashFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (!canonical) {
      flashFeedback('wrong');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBlitzInput('');
  }

  const currentQuestion = questions[currentIndex];
  const progress = gameMode === 'books_blitz' ? foundBooks.length / 66 : currentIndex / TOTAL_QUESTIONS;
  const timerColor = timeLeft <= 10 ? COLORS.danger : timeLeft <= 20 ? COLORS.primary : COLORS.accent;
  const modeTitle = MODE_TITLES[gameMode] || 'Game';

  const flashBgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      'transparent',
      feedback === 'correct' ? 'rgba(76,175,125,0.15)' : 'rgba(224,82,82,0.15)',
    ],
  });

  // Render loading skeleton
  if (loading) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ title: modeTitle }} />
        <View style={styles.loadingContainer}>
          <SkeletonLine width="60%" height={20} />
          <View style={{ height: 16 }} />
          <SkeletonLine width="90%" height={80} />
          <View style={{ height: 12 }} />
          <SkeletonLine width="70%" height={16} />
          <View style={{ height: 24 }} />
          <SkeletonLine width="100%" height={52} />
          <View style={{ height: 12 }} />
          <SkeletonLine width="100%" height={52} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ title: modeTitle }} />
        <View style={styles.errorContainer}>
          <XCircle size={48} color={COLORS.danger} strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Couldn't load questions</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <AnimatedPressable onPress={() => router.back()} style={styles.errorBtn}>
            <Text style={styles.errorBtnText}>Go back</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <Stack.Screen options={{ title: modeTitle }} />
      <Animated.View style={[styles.root, { backgroundColor: flashBgColor }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top bar: score + timer + progress */}
          <View style={styles.topBar}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>

            <Animated.View
              style={[
                styles.timerBox,
                {
                  transform: [{ scale: timerScale }],
                  borderColor: timerColor,
                  backgroundColor: `${timerColor}15`,
                },
              ]}
            >
              <Text style={[styles.timerValue, { color: timerColor }]}>{timeLeft}</Text>
              <Text style={[styles.timerLabel, { color: timerColor }]}>sec</Text>
            </Animated.View>

            {gameMode !== 'books_blitz' && (
              <View style={styles.progressBox}>
                <Text style={styles.progressLabel}>
                  {currentIndex + 1}/{TOTAL_QUESTIONS}
                </Text>
                <Text style={styles.progressSub}>questions</Text>
              </View>
            )}
            {gameMode === 'books_blitz' && (
              <View style={styles.progressBox}>
                <Text style={styles.progressLabel}>{foundBooks.length}</Text>
                <Text style={styles.progressSub}>found</Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: timerColor,
                },
              ]}
            />
          </View>

          {/* Game content */}
          {gameMode === 'scramble' && currentQuestion && (
            <ScrambleMode
              question={currentQuestion}
              answer={answer}
              setAnswer={setAnswer}
              hintVisible={hintVisible}
              onSubmit={handleSubmit}
              onHint={handleHint}
              onSkip={handleSkip}
              feedback={feedback}
            />
          )}

          {gameMode === 'fill_in_blank' && currentQuestion && (
            <FillInBlankMode
              question={currentQuestion}
              answer={answer}
              setAnswer={setAnswer}
              hintVisible={hintVisible}
              onSubmit={handleSubmit}
              onHint={handleHint}
              onSkip={handleSkip}
              feedback={feedback}
            />
          )}

          {gameMode === 'books_blitz' && (
            <BooksBlitzMode
              blitzInput={blitzInput}
              setBlitzInput={setBlitzInput}
              foundBooks={foundBooks}
              onSubmit={handleBlitzSubmit}
              inputRef={blitzInputRef}
              feedback={feedback}
            />
          )}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ─── Scramble Mode ───────────────────────────────────────────────────────────

function ScrambleMode({
  question,
  answer,
  setAnswer,
  hintVisible,
  onSubmit,
  onHint,
  onSkip,
  feedback,
}: {
  question: Question;
  answer: string;
  setAnswer: (v: string) => void;
  hintVisible: boolean;
  onSubmit: () => void;
  onHint: () => void;
  onSkip: () => void;
  feedback: 'correct' | 'wrong' | null;
}) {
  const scrambled = question.question.toUpperCase();
  const letters = scrambled.split('');

  return (
    <View style={styles.gameSection}>
      <Text style={styles.gameModeLabel}>Unscramble this word</Text>

      {/* Letter tiles */}
      <View style={styles.letterTilesRow}>
        {letters.map((letter, i) => (
          <View key={i} style={styles.letterTile}>
            <Text style={styles.letterTileText}>{letter}</Text>
          </View>
        ))}
      </View>

      {hintVisible && (
        <View style={styles.hintBox}>
          <Lightbulb size={14} color={COLORS.accent} strokeWidth={2} />
          <Text style={styles.hintText}>{question.hint}</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            feedback === 'correct' && styles.inputCorrect,
            feedback === 'wrong' && styles.inputWrong,
          ]}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Type your answer..."
          placeholderTextColor={COLORS.textTertiary}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          autoCorrect={false}
        />
      </View>

      <View style={styles.actionRow}>
        <AnimatedPressable onPress={onSubmit} style={styles.submitBtn}>
          <Send size={18} color={COLORS.background} strokeWidth={2} />
          <Text style={styles.submitBtnText}>Submit</Text>
        </AnimatedPressable>

        {!hintVisible && (
          <AnimatedPressable onPress={onHint} style={styles.hintBtn}>
            <Lightbulb size={16} color={COLORS.accent} strokeWidth={2} />
            <Text style={styles.hintBtnText}>Hint (-5)</Text>
          </AnimatedPressable>
        )}

        <AnimatedPressable onPress={onSkip} style={styles.skipBtn}>
          <SkipForward size={16} color={COLORS.textSecondary} strokeWidth={2} />
          <Text style={styles.skipBtnText}>Skip (-10)</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

// ─── Fill in Blank Mode ───────────────────────────────────────────────────────

function FillInBlankMode({
  question,
  answer,
  setAnswer,
  hintVisible,
  onSubmit,
  onHint,
  onSkip,
  feedback,
}: {
  question: Question;
  answer: string;
  setAnswer: (v: string) => void;
  hintVisible: boolean;
  onSubmit: () => void;
  onHint: () => void;
  onSkip: () => void;
  feedback: 'correct' | 'wrong' | null;
}) {
  const parts = question.question.split('___');
  const before = parts[0] || '';
  const after = parts[1] || '';

  return (
    <View style={styles.gameSection}>
      <Text style={styles.gameModeLabel}>Fill in the missing word</Text>

      <View style={styles.verseCard}>
        <Text style={styles.verseText}>
          <Text style={styles.verseTextNormal}>{before}</Text>
          <Text style={styles.verseBlanks}>______</Text>
          <Text style={styles.verseTextNormal}>{after}</Text>
        </Text>
        <View style={styles.verseRefRow}>
          <Text style={styles.verseRef}>{question.hint}</Text>
        </View>
      </View>

      {hintVisible && (
        <View style={styles.hintBox}>
          <Lightbulb size={14} color={COLORS.accent} strokeWidth={2} />
          <Text style={styles.hintText}>Starts with: {question.answer.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            feedback === 'correct' && styles.inputCorrect,
            feedback === 'wrong' && styles.inputWrong,
          ]}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Type the missing word..."
          placeholderTextColor={COLORS.textTertiary}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          autoCorrect={false}
        />
      </View>

      <View style={styles.actionRow}>
        <AnimatedPressable onPress={onSubmit} style={styles.submitBtn}>
          <Send size={18} color={COLORS.background} strokeWidth={2} />
          <Text style={styles.submitBtnText}>Submit</Text>
        </AnimatedPressable>

        {!hintVisible && (
          <AnimatedPressable onPress={onHint} style={styles.hintBtn}>
            <Lightbulb size={16} color={COLORS.accent} strokeWidth={2} />
            <Text style={styles.hintBtnText}>Hint (-5)</Text>
          </AnimatedPressable>
        )}

        <AnimatedPressable onPress={onSkip} style={styles.skipBtn}>
          <SkipForward size={16} color={COLORS.textSecondary} strokeWidth={2} />
          <Text style={styles.skipBtnText}>Skip (-10)</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

// ─── Books Blitz Mode ─────────────────────────────────────────────────────────

function BooksBlitzMode({
  blitzInput,
  setBlitzInput,
  foundBooks,
  onSubmit,
  inputRef,
  feedback,
}: {
  blitzInput: string;
  setBlitzInput: (v: string) => void;
  foundBooks: string[];
  onSubmit: () => void;
  inputRef: React.RefObject<TextInput | null>;
  feedback: 'correct' | 'wrong' | null;
}) {
  const totalBooks = BIBLE_BOOKS.length;
  const remaining = totalBooks - foundBooks.length;

  return (
    <View style={styles.gameSection}>
      <Text style={styles.gameModeLabel}>Name Bible books!</Text>
      <Text style={styles.blitzSubtitle}>
        {remaining} of {totalBooks} remaining
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            feedback === 'correct' && styles.inputCorrect,
            feedback === 'wrong' && styles.inputWrong,
          ]}
          value={blitzInput}
          onChangeText={setBlitzInput}
          placeholder="Type a Bible book name..."
          placeholderTextColor={COLORS.textTertiary}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          autoCorrect={false}
          autoFocus
        />
      </View>

      <AnimatedPressable onPress={onSubmit} style={styles.submitBtn}>
        <Send size={18} color={COLORS.background} strokeWidth={2} />
        <Text style={styles.submitBtnText}>Submit Book</Text>
      </AnimatedPressable>

      {foundBooks.length > 0 && (
        <View style={styles.foundBooksSection}>
          <Text style={styles.foundBooksTitle}>
            Found: {foundBooks.length}
          </Text>
          <View style={styles.foundBooksGrid}>
            {foundBooks.map((book, i) => (
              <View key={i} style={styles.foundBookChip}>
                <CheckCircle size={12} color={COLORS.success} strokeWidth={2} />
                <Text style={styles.foundBookText}>{book}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
    paddingTop: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    padding: 24,
    gap: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 20,
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
  errorBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  errorBtnText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
    color: COLORS.accent,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 22,
    color: COLORS.accent,
    fontVariant: ['tabular-nums'],
  },
  timerBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  timerValue: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    lineHeight: 28,
  },
  timerLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressLabel: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 22,
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  progressSub: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  gameSection: {
    gap: 16,
  },
  gameModeLabel: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 13,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  letterTilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  letterTile: {
    width: 44,
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(201,146,42,0.2)',
  },
  letterTileText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 22,
    color: COLORS.accent,
    letterSpacing: 1,
  },
  verseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  verseText: {
    fontFamily: 'Lato_400Regular_Italic',
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 28,
    textAlign: 'center',
  },
  verseTextNormal: {
    fontFamily: 'Lato_400Regular_Italic',
    fontSize: 18,
    color: COLORS.text,
  },
  verseBlanks: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 18,
    color: COLORS.accent,
    letterSpacing: 4,
  },
  verseRefRow: {
    alignItems: 'center',
  },
  verseRef: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 13,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hintText: {
    fontFamily: 'Lato_400Regular_Italic',
    fontSize: 14,
    color: COLORS.accent,
    flex: 1,
    lineHeight: 20,
  },
  inputRow: {
    gap: 8,
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
  inputCorrect: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(76,175,125,0.1)',
  },
  inputWrong: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(224,82,82,0.1)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  submitBtnText: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: COLORS.background,
    letterSpacing: 0.3,
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  hintBtnText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
    color: COLORS.accent,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 48,
  },
  skipBtnText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  blitzSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  foundBooksSection: {
    gap: 10,
  },
  foundBooksTitle: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  foundBooksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foundBookChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(76,175,125,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(76,175,125,0.25)',
  },
  foundBookText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: COLORS.success,
  },
});
