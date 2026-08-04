import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize?: string | null;
  onSelect: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <View style={styles.wrap}>
      {sizes.map((size) => {
        const selected = size === selectedSize;
        return (
          <Pressable
            key={size}
            onPress={() => onSelect(size)}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{size}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    minWidth: 48,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  itemSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.textInverse,
  },
});
