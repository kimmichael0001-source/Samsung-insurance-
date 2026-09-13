import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderStatusBadge, PriceBlock, ShippingOptionList } from '../src/components';
import { useAppState } from '../src/store/AppStateContext';
import type { ShippingSelection } from '../src/store/AppStateContext';
import { colors, radius, spacing, typography } from '../src/theme';
import type { Order, ShippingDestination } from '../src/types';
import { formatPrice } from '../src/utils';

function toSelection(destination: ShippingDestination): ShippingSelection {
  return {
    countryCode: destination.countryCode,
    cost: destination.cost,
    etaMinDays: destination.etaMinDays,
    etaMaxDays: destination.etaMaxDays,
  };
}

export default function OrderConfirmationScreen() {
  const { productId, size } = useLocalSearchParams<{ productId: string; size: string }>();
  const router = useRouter();
  const { getProductById, createOrder, shippingDestinations } = useAppState();

  const [selectedDestination, setSelectedDestination] = useState<ShippingDestination | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const product = getProductById(productId ?? '');

  useEffect(() => {
    if (selectedDestination || shippingDestinations.length === 0) return;
    setSelectedDestination(
      shippingDestinations.find((destination) => destination.countryCode === 'KZ') ?? shippingDestinations[0],
    );
  }, [shippingDestinations, selectedDestination]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Товар не найден</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirm = async () => {
    if (!selectedDestination) return;

    setIsSubmitting(true);
    try {
      const order = await createOrder(
        { productId: product.id, size: size ?? product.availableSizes[0] },
        toSelection(selectedDestination),
      );
      if (order) {
        setCreatedOrder(order);
      }
    } catch (error) {
      Alert.alert(
        'Не удалось оформить заявку',
        error instanceof Error ? error.message : 'Попробуйте ещё раз чуть позже.',
      );
    } finally {
      setIsSubmitting(false);
    }
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.productCard}>
          <Image source={{ uri: product.images[0] }} style={styles.image} contentFit="cover" transition={150} />
          <View style={styles.productInfo}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {product.title}
            </Text>
            <Text style={styles.size}>Размер: {size}</Text>
            <PriceBlock originalPrice={product.originalPrice} salePrice={product.salePrice} currency={product.currency} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Страна доставки</Text>
        {shippingDestinations.length > 0 ? (
          <ShippingOptionList
            destinations={shippingDestinations}
            selectedCountryCode={selectedDestination?.countryCode ?? null}
            onSelect={setSelectedDestination}
          />
        ) : (
          <Text style={styles.size}>Загружаем варианты доставки…</Text>
        )}

        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.noticeText}>
            Заявка получит статус «Ожидает подтверждения». Оплата не производится — байер свяжется с вами
            после проверки наличия товара в аутлете.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {selectedDestination ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Товар + доставка</Text>
            <Text style={styles.totalValue}>{formatPrice(product.salePrice + selectedDestination.cost)}</Text>
          </View>
        ) : null}
        <Pressable
          style={[styles.primaryButton, (isSubmitting || !selectedDestination) && styles.primaryButtonDisabled]}
          onPress={handleConfirm}
          disabled={isSubmitting || !selectedDestination}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'Оформляем…' : 'Подтвердить заявку'}
          </Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()} disabled={isSubmitting}>
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  productCard: {
    flexDirection: 'row',
    gap: spacing.md,
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.h3,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
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
