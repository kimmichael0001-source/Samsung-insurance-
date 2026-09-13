import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { ShippingDestination } from '../types';
import { formatPrice } from '../utils';

interface ShippingOptionListProps {
  destinations: ShippingDestination[];
  selectedCountryCode: string | null;
  onSelect: (destination: ShippingDestination) => void;
}

export function ShippingOptionList({ destinations, selectedCountryCode, onSelect }: ShippingOptionListProps) {
  return (
    <View style={styles.list}>
      {destinations.map((destination) => {
        const selected = destination.countryCode === selectedCountryCode;
        return (
          <Pressable
            key={destination.countryCode}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onSelect(destination)}
          >
            <View style={styles.optionRow}>
              <View style={styles.radio}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.optionTexts}>
                <Text style={styles.countryName}>{destination.countryName}</Text>
                <Text style={styles.eta}>
                  {formatPrice(destination.cost, destination.currency)} · {destination.etaMinDays}–
                  {destination.etaMaxDays} дн.
                </Text>
              </View>
            </View>
            {selected ? (
              <View style={styles.customsBox}>
                <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.customsText}>{destination.customsNote}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  option: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.accent,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.accent,
  },
  optionTexts: {
    flex: 1,
  },
  countryName: {
    ...typography.bodyMedium,
  },
  eta: {
    ...typography.caption,
    marginTop: 2,
  },
  customsBox: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  customsText: {
    flex: 1,
    ...typography.small,
    lineHeight: 15,
  },
});
