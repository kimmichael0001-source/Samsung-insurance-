import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Ionicons name="compass-outline" size={40} color={colors.textMuted} />
          <Text style={styles.title}>Такой страницы нет</Text>
          <Text style={styles.description}>Похоже, вы перешли по неверной ссылке.</Text>
          <Link href="/(tabs)" asChild>
            <Pressable style={styles.link}>
              <Text style={styles.linkText}>На главную</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.caption,
    textAlign: 'center',
  },
  link: {
    marginTop: spacing.lg,
    height: 48,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
});
