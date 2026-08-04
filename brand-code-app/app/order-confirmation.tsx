import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderStatusBadge, PriceBlock } from '../src/components';
import { getProductById } from '../src/data/products';
import { useAppState } from '../src/store/AppStateContext';
import { colors, radius, spacing, typography } from '../src/theme';
import type { Order } from '../src/types';

export default function OrderConfirmationScreen() {
  const { productId, size } = useLocalSearchParams<{ productId: string; size: string }>();
  const router = useRouter();
  const { createOrder } = useAppState();

  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const product = getProductById(productId ?? '');

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Товар не найден</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirm = () => {
    const order = createOrder({ productId: product.id, size: size ?? product.availableSizes[0] });
    setCreatedOrder(order);
  };

  if (createdOrder) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={36} color={colors.textInverse} />
          </View>
          <Text style={styles.successTitle}>Заявка оформлена</Text>
          <Text style={styles.successOrderNumber}>№ {createdOrder.orderNumber}</Text>
          <View style={{ marginTop: spacing.md }}>
            <OrderStatusBadge status={createdOrder.status} />
          </View>
          <Text style={styles.successDescription}>
            Байер проверит наличие товара в аутлете и подтвердит заявку. Деньги пока не списаны — мы свяжемся
            с вами после подтверждения.
          </Text>

          <Pressable
            style={[styles.primaryButton, styles.fullWidthButton]}
            onPress={() => router.dismissTo('/(tabs)/orders')}
          >
            <Text style={styles.primaryButtonText}>Перейти к заказам</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, styles.fullWidthButton]}
            onPress={() => router.dismissTo('/(tabs)/catalog')}
          >
            <Text style={styles.secondaryButtonText}>Продолжить покупки</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Оформление заявки</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.productCard}>
        <Image source={{ uri: product.images[0] }} style={styles.image} />
        <View style={styles.productInfo}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.size}>Размер: {size}</Text>
          <PriceBlock originalPrice={product.originalPrice} salePrice={product.salePrice} currency={product.currency} />
        </View>
      </View>

      <View style={styles.noticeBox}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.noticeText}>
          Заявка получит статус «Ожидает подтверждения». Оплата не производится — байер свяжется с вами
          после проверки наличия товара в аутлете.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={handleConfirm}>
          <Text style={styles.primaryButtonText}>Подтвердить заявку</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Отмена</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...typography.body,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
  },
  productCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 84,
    height: 104,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  brand: {
    ...typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.bodyMedium,
  },
  size: {
    ...typography.caption,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
  noticeText: {
    flex: 1,
    ...typography.caption,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h1,
  },
  successOrderNumber: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  successDescription: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  fullWidthButton: {
    width: '100%',
  },
});
