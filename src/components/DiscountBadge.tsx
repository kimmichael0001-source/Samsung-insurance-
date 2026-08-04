import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

interface DiscountBadgeProps {
  percent: number;
}

export function DiscountBadge({ percent }: DiscountBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>-{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
});
