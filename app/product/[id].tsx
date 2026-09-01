import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartButton, DiscountBadge, PriceBlock, ScreenHeader, SizeSelector } from '../../src/components';
import { conditionLabels } from '../../src/data/labels';
import { useAppState } from '../../src/store/AppStateContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import { getTimeRemaining } from '../../src/utils';

const DELIVERY_STEPS = [
  'Байер подтверждает наличие товара в аутлете',
  'Товар выкупается и упаковывается на складе в Корее',
  'Посылка отправляется международной доставкой',
  'Прибытие в Казахстан и передача покупателю',
];

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { getProductById, isFavorite, toggleFavorite, addToCart, cartCount } = useAppState();

  const product = useMemo(() => getProductById(id ?? ''), [id, getProductById]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(() =>
    product ? getTimeRemaining(product.expiresAt) : null,
  );

  useEffect(() => {
    if (!product) return;
    const intervalId = setInterval(() => {
      setTimeRemaining(getTimeRemaining(product.expiresAt));
    }, 60000);
    return () => clearInterval(intervalId);
  }, [product]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="Товар" showBack />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Товар не найден</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(index);
  };

  const handleSubmitRequest = () => {
    if (!selectedSize) {
      Alert.alert('Выберите размер', 'Пожалуйста, укажите размер перед оформлением заявки.');
      return;
    }
    router.push({ pathname: '/order-confirmation', params: { productId: product.id, size: selectedSize } });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Выберите размер', 'Пожалуйста, укажите размер перед добавлением в корзину.');
      return;
    }
    addToCart({ productId: product.id, size: selectedSize });
    Alert.alert('Добавлено в корзину', `${product.brand} · ${product.title}, размер ${selectedSize}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title={product.brand}
        showBack
        rightElement={<CartButton count={cartCount} onPress={() => router.push('/cart')} />}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          >
            {product.images.map((uri, index) => (
              <Image key={`${uri}-${index}`} source={{ uri }} style={[styles.image, { width }]} />
            ))}
          </ScrollView>
          <View style={styles.dotsRow}>
            {product.images.map((_, index) => (
              <View key={index} style={[styles.dot, index === activeImageIndex && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.badgeSlot}>
            <DiscountBadge percent={product.discountPercent} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.title}>{product.title}</Text>
            </View>
            <Pressable onPress={() => toggleFavorite(product.id)} hitSlop={8}>
              <Ionicons
                name={isFavorite(product.id) ? 'heart' : 'heart-outline'}
                size={26}
                color={isFavorite(product.id) ? colors.accent : colors.textPrimary}
              />
            </Pressable>
          </View>

          <PriceBlock originalPrice={product.originalPrice} salePrice={product.salePrice} currency={product.currency} size="lg" />

          {timeRemaining ? (
            <View style={[styles.timerRow, timeRemaining.isExpired && styles.timerRowExpired]}>
              <Ionicons name="time-outline" size={16} color={timeRemaining.isExpired ? colors.danger : colors.warning} />
              <Text style={[styles.timerText, timeRemaining.isExpired && styles.timerTextExpired]}>
                {timeRemaining.label}
              </Text>
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{conditionLabels[product.condition]}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{product.outletName}</Text>
          </View>

          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sectionTitle}>Размер</Text>
          <SizeSelector sizes={product.availableSizes} selectedSize={selectedSize} onSelect={setSelectedSize} />

          <View style={styles.warningBox}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.warningText}>
              Товар находится в аутлете. Наличие будет подтверждено байером после оформления заявки.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Как проходит доставка</Text>
          <View style={styles.stepsList}>
            {DELIVERY_STEPS.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {product.isAvailable ? (
          <Pressable style={styles.cartButton} onPress={handleAddToCart}>
            <Ionicons name="bag-add-outline" size={18} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        <Pressable
          disabled={!product.isAvailable}
          style={[styles.submitButton, !product.isAvailable && styles.submitButtonDisabled]}
          onPress={handleSubmitRequest}
        >
          <Text style={styles.submitButtonText}>
            {product.isAvailable ? 'Оформить заявку' : 'Товар раскуплен'}
          </Text>
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
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...typography.body,
  },
  image: {
    aspectRatio: 4 / 5,
    backgroundColor: colors.surfaceMuted,
  },
  dotsRow: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    backgroundColor: colors.surface,
    width: 16,
  },
  badgeSlot: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.xl,
  },
  body: {
    padding: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  brand: {
    ...typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.h2,
    marginTop: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningMuted,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  timerRowExpired: {
    backgroundColor: colors.dangerMuted,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
  timerTextExpired: {
    color: colors.danger,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metaText: {
    ...typography.caption,
  },
  metaDot: {
    ...typography.caption,
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  warningBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.warningMuted,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  warningText: {
    flex: 1,
    ...typography.caption,
    color: colors.warning,
    lineHeight: 18,
  },
  stepsList: {
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepText: {
    flex: 1,
    ...typography.caption,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cartButton: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
  },
});
