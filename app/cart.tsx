import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../src/components';
import { useAppState } from '../src/store/AppStateContext';
import { colors, radius, spacing, typography } from '../src/theme';
import type { CartItem } from '../src/types';
import { formatPrice } from '../src/utils';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateCartQuantity, removeFromCart, cartTotal } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Корзина</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="bag-outline"
            title="Корзина пуста"
            description="Добавляйте товары из каталога, чтобы оформить заказ"
            actionLabel="В каталог"
            onAction={() => router.dismissTo('/(tabs)/catalog')}
          />
        }
        renderItem={({ item }) => (
          <CartRow
            item={item}
            onIncrease={() => updateCartQuantity(item.id, item.quantity + 1)}
            onDecrease={() => updateCartQuantity(item.id, item.quantity - 1)}
            onRemove={() => removeFromCart(item.id)}
          />
        )}
      />

      {cartItems.length > 0 ? (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Итого</Text>
            <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
          </View>
          <Pressable style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
            <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function CartRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardInfo}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTexts}>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.size}>Размер: {item.size}</Text>
          </View>
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.cardBottomRow}>
          <Text style={styles.price}>{formatPrice(item.price, item.currency)}</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperButton} onPress={onDecrease} hitSlop={6}>
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.stepperValue}>{item.quantity}</Text>
            <Pressable style={styles.stepperButton} onPress={onIncrease} hitSlop={6}>
              <Ionicons name="add" size={16} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  image: {
    width: 76,
    height: 96,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTexts: {
    flex: 1,
  },
  brand: {
    ...typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.bodyMedium,
    marginTop: 2,
  },
  size: {
    ...typography.caption,
    marginTop: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  price: {
    ...typography.bodyMedium,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    height: 32,
  },
  stepperButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...typography.bodyMedium,
    minWidth: 18,
    textAlign: 'center',
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
  checkoutButton: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
  },
});
