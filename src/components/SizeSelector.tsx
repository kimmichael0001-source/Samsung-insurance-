import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize?: string | null;
  onSelect: (size: string) => void;
  /** Sizes to show as unavailable (e.g. zero stock) — not selectable. */
  outOfStockSizes?: string[];
}

export function SizeSelector({ sizes, selectedSize, onSelect, outOfStockSizes }: SizeSelectorProps) {
  return (
    <View style={styles.wrap}>
      {sizes.map((size) => {
        const selected = size === selectedSize;
        const outOfStock = outOfStockSizes?.includes(size) ?? false;
        return (
          <Pressable
            key={size}
            onPress={() => onSelect(size)}
            disabled={outOfStock}
            style={[styles.item, selected && styles.itemSelected, outOfStock && styles.itemOutOfStock]}
          >
            <Text
              style={[
                styles.label,
                selected && styles.labelSelected,
                outOfStock && styles.labelOutOfStock,
              ]}
            >
              {size}
            </Text>
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
  itemOutOfStock: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.textInverse,
  },
  labelOutOfStock: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
