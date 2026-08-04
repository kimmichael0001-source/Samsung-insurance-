import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { Product } from '../types';
import { DiscountBadge } from './DiscountBadge';
import { PriceBlock } from './PriceBlock';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  style?: ViewStyle;
}

export function ProductCard({ product, onPress, isFavorite = false, onToggleFavorite, style }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, style]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.images[0] }} style={styles.image} />
        <View style={styles.badgeSlot}>
          <DiscountBadge percent={product.discountPercent} />
        </View>
        {onToggleFavorite ? (
          <Pressable style={styles.favoriteButton} onPress={onToggleFavorite} hitSlop={8}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.accent : colors.textPrimary}
            />
          </Pressable>
        ) : null}
        {!product.isAvailable ? (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Раскуплено</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <PriceBlock originalPrice={product.originalPrice} salePrice={product.salePrice} currency={product.currency} />
        <Text style={styles.sizes} numberOfLines={1}>
          Размеры: {product.availableSizes.join(', ')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrap: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeSlot: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlay,
    paddingVertical: 6,
    alignItems: 'center',
  },
  unavailableText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    padding: spacing.md,
    gap: 4,
  },
  brand: {
    ...typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    minHeight: 36,
  },
  sizes: {
    ...typography.small,
    marginTop: 2,
  },
});
