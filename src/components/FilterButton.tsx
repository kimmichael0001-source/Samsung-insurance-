import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

interface FilterButtonProps {
  label: string;
  active?: boolean;
  activeCount?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function FilterButton({ label, active = false, activeCount, icon = 'options-outline', onPress }: FilterButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, active && styles.buttonActive]}>
      <Ionicons name={icon} size={16} color={active ? colors.textInverse : colors.textPrimary} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {activeCount ? (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{activeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelActive: {
    color: colors.textInverse,
  },
  countBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
