import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, OrderStatusBadge, PriceBlock, ScreenHeader } from '../../src/components';
import { orderStatusPipeline } from '../../src/data/labels';
import { useAppState } from '../../src/store/AppStateContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { Order } from '../../src/types';
import { formatShortDate } from '../../src/utils';

const STEP_LABELS = ['Ожидает', 'Выкуплен', 'Склад', 'В пути', 'Готов'];

function OrderProgress({ status }: { status: Order['status'] }) {
  if (status === 'cancelled' || status === 'out_of_stock') {
    const message = status === 'cancelled' ? 'Заявка отменена байером' : 'Товар оказался распродан в аутлете';
    return (
      <View style={styles.terminatedBar}>
        <Text style={styles.terminatedText}>{message}</Text>
      </View>
    );
  }

  const currentIndex = orderStatusPipeline.indexOf(status);

  return (
    <View style={styles.stepsRow}>
      {orderStatusPipeline.map((step, index) => {
        const isDone = index <= currentIndex;
        const isFirst = index === 0;
        const isLast = index === orderStatusPipeline.length - 1;
        const leftLineDone = !isFirst && index <= currentIndex;
        const rightLineDone = !isLast && index < currentIndex;
        return (
          <View key={step} style={styles.stepItem}>
            <View style={styles.stepDotLine}>
              <View style={[styles.stepLineHalf, isFirst && styles.stepLineHidden, leftLineDone && styles.stepLineDone]} />
              <View style={[styles.stepDot, isDone && styles.stepDotDone]} />
              <View style={[styles.stepLineHalf, isLast && styles.stepLineHidden, rightLineDone && styles.stepLineDone]} />
            </View>
            <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]} numberOfLines={1}>
              {STEP_LABELS[index]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>№ {order.orderNumber}</Text>
        <Text style={styles.orderDate}>{formatShortDate(order.createdAt)}</Text>
      </View>

      <View style={styles.cardBody}>
        <Image source={{ uri: order.productImage }} style={styles.image} />
        <View style={styles.cardInfo}>
          <Text style={styles.brand}>{order.productBrand}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {order.productTitle}
          </Text>
          <Text style={styles.size}>Размер: {order.size}</Text>
          <PriceBlock originalPrice={order.price} salePrice={order.price} currency={order.currency} />
        </View>
      </View>

      <View style={styles.statusRow}>
        <OrderStatusBadge status={order.status} />
      </View>

      <OrderProgress status={order.status} />
    </View>
  );
}

export default function OrdersScreen() {
  const { orders } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Заказы" subtitle={orders.length > 0 ? `${orders.length} заявок` : undefined} />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Заявок пока нет"
            description="Оформите заявку на товар в каталоге — она появится здесь"
          />
        }
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  orderNumber: {
    ...typography.bodyMedium,
  },
  orderDate: {
    ...typography.caption,
  },
  cardBody: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 72,
    height: 90,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
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
  statusRow: {
    marginTop: spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepDotLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  stepDotDone: {
    backgroundColor: colors.accent,
  },
  stepLineHalf: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
  },
  stepLineHidden: {
    backgroundColor: 'transparent',
  },
  stepLineDone: {
    backgroundColor: colors.accent,
  },
  stepLabel: {
    ...typography.small,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  stepLabelDone: {
    color: colors.accent,
    fontWeight: '700',
  },
  terminatedBar: {
    marginTop: spacing.lg,
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  terminatedText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
});
