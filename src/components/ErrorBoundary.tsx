import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { logger } from '../lib/logger';
import { colors, radius, spacing, typography } from '../theme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time crashes anywhere below it and shows a recoverable
 * screen instead of the default red error screen. This is the mobile
 * equivalent of a web app's 500 page — there is no server to render one.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('Unhandled render error caught by ErrorBoundary', error, {
      componentStack: info.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={styles.title}>Что-то пошло не так</Text>
          <Text style={styles.description}>
            Произошла непредвиденная ошибка. Попробуйте вернуться назад — если проблема повторится,
            перезапустите приложение.
          </Text>
          <Pressable style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Попробовать снова</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  description: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 19,
  },
  button: {
    marginTop: spacing.lg,
    height: 48,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
});
