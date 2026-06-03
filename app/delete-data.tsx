import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/GameColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';

const BASE_URL = 'https://5d3mwfcssu8hxwz88va2peyxv4tkxk9r.app.specular.dev';

export default function DeleteDataScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('[DeleteDataScreen] Mounted');
  }, []);

  const trimmedName = playerName.trim();
  const isDisabled = trimmedName.length === 0 || loading;

  function handleDeletePress() {
    console.log('[DeleteDataScreen] Delete button pressed for player:', trimmedName);
    Alert.alert(
      'Delete all data?',
      `This will permanently delete all scores submitted under "${trimmedName}". This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  }

  async function confirmDelete() {
    const url = `${BASE_URL}/api/scores/by-player`;
    console.log('[DeleteDataScreen] Request sent — DELETE', url, 'player:', trimmedName);
    setLoading(true);

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: trimmedName }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      const data = await res.json();
      const deletedCount: number = data.deleted_count ?? 0;
      console.log('[DeleteDataScreen] Response received — deleted_count:', deletedCount);

      const successMessage =
        deletedCount === 0
          ? `No scores found for that name.`
          : `Removed ${deletedCount} score(s) for "${trimmedName}".`;

      Alert.alert('Data deleted', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            setPlayerName('');
            router.back();
          },
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error('[DeleteDataScreen] Error:', msg);
      Alert.alert("Couldn't delete data", msg, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  }

  const buttonBg = isDisabled ? 'rgba(224,82,82,0.35)' : COLORS.danger;
  const buttonBorderColor = isDisabled ? 'rgba(224,82,82,0.2)' : COLORS.danger;

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: 'Delete My Data',
          headerTitleStyle: {
            fontFamily: 'Cinzel_600SemiBold',
            color: COLORS.accent,
            fontSize: 17,
          },
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Explanation card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Your Privacy Matters</Text>
          <Text style={styles.infoBody}>
            If you've submitted scores under a player name, you can permanently delete all
            scores associated with that name. This action cannot be undone.
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Player Name</Text>
          <TextInput
            style={styles.input}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Enter the player name"
            placeholderTextColor={COLORS.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            editable={!loading}
          />
        </View>

        {/* Delete button */}
        <AnimatedPressable
          onPress={handleDeletePress}
          disabled={isDisabled}
          style={[
            styles.deleteBtn,
            { backgroundColor: buttonBg, borderColor: buttonBorderColor },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.deleteBtnText}>Delete My Data</Text>
          )}
        </AnimatedPressable>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Deletion is permanent and cannot be reversed. Only scores matching the exact
          player name will be removed.
        </Text>
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
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 8,
  },
  infoTitle: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  infoBody: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 12,
    color: COLORS.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Lato_400Regular',
    fontSize: 16,
    color: COLORS.text,
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 52,
    marginTop: 4,
  },
  deleteBtnText: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
