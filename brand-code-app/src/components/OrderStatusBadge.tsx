import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { orderStatusLabels } from '../data/labels';
import { colors, radius, spacing } from '../theme';
import type { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string }> = {
  pending_confirmation: { bg: colors.warningMuted, text: colors.warning },
  purchased: { bg: colors.accentMuted, text: colors.accent },
  in_stock_korea: { bg: colors.accentMuted, text: colors.accent },
  in_transit: { bg: colors.accentMuted, text: colors.accent },
  ready_for_pickup: { bg: colors.successMuted, text: colors.success },
  cancelled: { bg: colors.dangerMuted, text: colors.danger },
  out_of_stock: { bg: colors.dangerMuted, text: colors.danger },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const palette = STATUS_STYLE[status];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>{orderStatusLabels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
