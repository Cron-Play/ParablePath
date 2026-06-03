import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { WidgetProvider } from '@/contexts/WidgetContext';
import {
  Cinzel_400Regular,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  Lato_400Regular,
  Lato_700Bold,
  Lato_400Regular_Italic,
} from '@expo-google-fonts/lato';
import { COLORS } from '@/constants/GameColors';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const GameDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.danger,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Lato_400Regular,
    Lato_700Bold,
    Lato_400Regular_Italic,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" animated />
      <ThemeProvider value={GameDarkTheme}>
        <SafeAreaProvider>
          <WidgetProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: COLORS.surface },
                  headerTintColor: COLORS.text,
                  headerTitleStyle: {
                    fontFamily: 'Cinzel_600SemiBold',
                    color: COLORS.text,
                    fontSize: 17,
                  },
                  contentStyle: { backgroundColor: COLORS.background },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="game/[mode]"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: 'minimal',
                    headerStyle: { backgroundColor: COLORS.surface },
                    headerTintColor: COLORS.accent,
                    headerShadowVisible: false,
                  }}
                />
                <Stack.Screen
                  name="results"
                  options={{
                    headerShown: true,
                    title: 'Results',
                    headerBackButtonDisplayMode: 'minimal',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.accent,
                    headerShadowVisible: false,
                  }}
                />
                <Stack.Screen
                  name="leaderboard"
                  options={{
                    headerShown: true,
                    title: 'Leaderboard',
                    headerBackButtonDisplayMode: 'minimal',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.accent,
                    headerShadowVisible: false,
                    headerTitleStyle: {
                      fontFamily: 'Cinzel_600SemiBold',
                      color: COLORS.accent,
                      fontSize: 17,
                    },
                  }}
                />
                <Stack.Screen
                  name="delete-data"
                  options={{
                    headerShown: true,
                    title: 'Delete My Data',
                    headerBackButtonDisplayMode: 'minimal',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.accent,
                    headerShadowVisible: false,
                    headerTitleStyle: {
                      fontFamily: 'Cinzel_600SemiBold',
                      color: COLORS.accent,
                      fontSize: 17,
                    },
                  }}
                />
              </Stack>
              <SystemBars style="light" />
            </GestureHandlerRootView>
          </WidgetProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </>
  );
}
