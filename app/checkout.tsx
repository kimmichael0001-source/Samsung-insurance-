import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { demoUser } from '../src/data/user';
import { useAppState } from '../src/store/AppStateContext';
import { colors, radius, spacing, typography } from '../src/theme';
import type { CartItem, Order } from '../src/types';
import { formatPrice } from '../src/utils';

function pluralizeOrders(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'заявка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'заявки';
  return 'заявок';
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, checkoutCart } = useAppState();
  const [createdOrders, setCreatedOrders] = useState<Order[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const orders = await checkoutCart();
    setIsSubmitting(false);
    if (orders.length > 0) {
      setCreatedOrders(orders);
    }
  };

  if (createdOrders) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={36} color={colors.textInverse} />
          </View>
          <Text style={styles.successTitle}>Заказ оформлен</Text>
          <Text style={styles.successDescription}>
            {createdOrders.length > 1
              ? `Создано ${createdOrders.length} ${pluralizeOrders(createdOrders.length)}. Байер проверит наличие каждого товара в аутлете и подтвердит заказ.`
              : 'Байер проверит наличие товара в аутлете и подтвердит заказ.'}
            {' '}Деньги пока не списаны — мы свяжемся с вами после подтверждения.
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

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Оформление заказа</Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Корзина пуста</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Оформление заказа</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Доставка</Text>
        <View style={styles.addressCard}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <View style={styles.addressTexts}>
            <Text style={styles.addressName}>{demoUser.name}</Text>
            <Text style={styles.addressLine}>{demoUser.phone}</Text>
            <Text style={styles.addressLine}>
              {demoUser.city}, {demoUser.deliveryAddress}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Товары ({cartItems.length})</Text>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => <SummaryRow item={item} />}
        />

        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.noticeText}>
            Каждый товар получит статус «Ожидает подтверждения». Оплата не производится — байер
            свяжется с вами после проверки наличия в аутлете.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Итого</Text>
          <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
        </View>
        <Pressable
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Оформляем…' : 'Подтвердить заказ'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ item }: { item: CartItem }) {
  return (
    <View style={styles.summaryRow}>
      <Image source={{ uri: item.image }} style={styles.summaryImage} />
      <View style={styles.summaryTexts}>
        <Text style={styles.summaryBrand}>{item.brand}</Text>
        <Text style={styles.summaryTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.summaryMeta}>
          Размер {item.size} · {item.quantity} шт.
        </Text>
      </View>
      <Text style={styles.summaryPrice}>{formatPrice(item.price * item.quantity, item.currency)}</Text>
    </View>
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
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  addressCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  addressTexts: {
    flex: 1,
    gap: 2,
  },
  addressName: {
    ...typography.bodyMedium,
  },
  addressLine: {
    ...typography.caption,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryImage: {
    width: 48,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  summaryTexts: {
    flex: 1,
  },
  summaryBrand: {
    ...typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryTitle: {
    ...typography.bodyMedium,
    marginTop: 2,
  },
  summaryMeta: {
    ...typography.caption,
    marginTop: 2,
  },
  summaryPrice: {
    ...typography.bodyMedium,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
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
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.h2,
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
