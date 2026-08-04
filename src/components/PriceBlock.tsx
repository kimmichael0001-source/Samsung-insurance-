import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { formatPrice } from '../utils';

interface PriceBlockProps {
  originalPrice: number;
  salePrice: number;
  currency?: string;
  size?: 'sm' | 'lg';
}

export function PriceBlock({ originalPrice, salePrice, currency = '₸', size = 'sm' }: PriceBlockProps) {
  const isLarge = size === 'lg';

  return (
    <View style={styles.row}>
      <Text style={[styles.salePrice, isLarge && styles.salePriceLg]}>
        {formatPrice(salePrice, currency)}
      </Text>
      {originalPrice > salePrice ? (
        <Text style={[styles.oldPrice, isLarge && styles.oldPriceLg]}>
          {formatPrice(originalPrice, currency)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: 8,
  },
  salePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  salePriceLg: {
    fontSize: 22,
  },
  oldPrice: {
    fontSize: 13,
    color: colors.priceOld,
    textDecorationLine: 'line-through',
  },
  oldPriceLg: {
    fontSize: 16,
  },
});
