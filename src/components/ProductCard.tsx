import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { Product } from '../types';
import { DiscountBadge } from './DiscountBadge';
import { PriceBlock } from './PriceBlock';
import { SizeSelector } from './SizeSelector';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onQuickAdd?: (size: string) => void;
  style?: ViewStyle;
}

export function ProductCard({
  product,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  onQuickAdd,
  style,
}: ProductCardProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [pickedSize, setPickedSize] = useState<string | null>(null);

  const openSizeSheet = () => {
    setPickedSize(product.availableSizes.length === 1 ? product.availableSizes[0] : null);
    setSheetVisible(true);
  };

  const confirmQuickAdd = () => {
    if (!pickedSize || !onQuickAdd) return;
    onQuickAdd(pickedSize);
    setSheetVisible(false);
    Alert.alert('Добавлено в корзину', `${product.brand} · ${product.title}, размер ${pickedSize}`);
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.images[0] }} style={styles.image} />
          <View style={styles.badgeSlot}>
            <DiscountBadge percent={product.discountPercent} />
          </View>
          {product.images.length > 1 ? (
            <View style={styles.galleryPill}>
              <Ionicons name="images-outline" size={11} color={colors.textInverse} />
              <Text style={styles.galleryPillText}>{product.images.length}</Text>
            </View>
          ) : null}
          {onToggleFavorite ? (
            <Pressable style={styles.favoriteButton} onPress={onToggleFavorite} hitSlop={8}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? colors.accent : colors.textPrimary}
              />
            </Pressable>
          ) : null}
          {onQuickAdd && product.isAvailable ? (
            <Pressable style={styles.quickAddButton} onPress={openSizeSheet} hitSlop={8}>
              <Ionicons name="bag-add-outline" size={17} color={colors.textInverse} />
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

      <Modal visible={sheetVisible} animationType="slide" transparent onRequestClose={() => setSheetVisible(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setSheetVisible(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Выберите размер</Text>
              <Pressable onPress={() => setSheetVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>
            <Text style={styles.sheetProduct} numberOfLines={1}>
              {product.brand} · {product.title}
            </Text>
            <View style={styles.sheetSizes}>
              <SizeSelector sizes={product.availableSizes} selectedSize={pickedSize} onSelect={setPickedSize} />
            </View>
            <Pressable
              style={[styles.sheetConfirm, !pickedSize && styles.sheetConfirmDisabled]}
              onPress={confirmQuickAdd}
              disabled={!pickedSize}
            >
              <Text style={styles.sheetConfirmText}>Добавить в корзину</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#151312',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardPressed: {
    opacity: 0.92,
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
  galleryPill: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.overlay,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  galleryPillText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
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
  quickAddButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
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
  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    ...typography.h3,
  },
  sheetProduct: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  sheetSizes: {
    marginTop: spacing.lg,
  },
  sheetConfirm: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  sheetConfirmDisabled: {
    backgroundColor: colors.textMuted,
  },
  sheetConfirmText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
});
