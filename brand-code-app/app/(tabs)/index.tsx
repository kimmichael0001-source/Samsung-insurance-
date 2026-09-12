import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandChip, CartButton, ProductCard, SearchBar } from '../../src/components';
import { brands } from '../../src/data/brands';
import { products } from '../../src/data/products';
import { useAppState } from '../../src/store/AppStateContext';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { isFavorite, toggleFavorite, addToCart, cartCount } = useAppState();

  const newArrivals = useMemo(
    () =>
      [...products]
        .filter((product) => product.isAvailable)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [],
  );

  const endingSoon = useMemo(
    () =>
      [...products]
        .filter((product) => product.isAvailable)
        .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
        .slice(0, 6),
    [],
  );

  const openCatalog = (params?: Record<string, string>) => {
    router.push({ pathname: '/(tabs)/catalog', params });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>CODE</Text>
          <CartButton count={cartCount} onPress={() => router.push('/cart')} />
        </View>

        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeTitle}>Привет! 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Оригинальные вещи из корейских аутлетов — с проверкой перед покупкой
          </Text>
        </View>

        <Pressable onPress={() => openCatalog()} style={styles.searchWrap}>
          <SearchBar value="" onChangeText={() => {}} editable={false} />
        </Pressable>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Бренды из аутлетов Кореи{'\n'}со скидками до 40%</Text>
        </View>

        <Text style={styles.sectionTitle}>Бренды</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandRow}
        >
          {brands.map((brand) => (
            <BrandChip key={brand.id} label={brand.name} onPress={() => openCatalog({ brand: brand.name })} />
          ))}
        </ScrollView>

        <SectionHeader title="Новые поступления" onPress={() => openCatalog({ sort: 'new' })} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productRow}
        >
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              style={styles.productCard}
              isFavorite={isFavorite(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
              onQuickAdd={(size) => addToCart({ productId: product.id, size })}
              onPress={() => router.push(`/product/${product.id}`)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Успей заказать" onPress={() => openCatalog({ sort: 'ending_soon' })} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.productRow, styles.lastRow]}
        >
          {endingSoon.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              style={styles.productCard}
              isFavorite={isFavorite(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
              onQuickAdd={(size) => addToCart({ productId: product.id, size })}
              onPress={() => router.push(`/product/${product.id}`)}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.sectionAction}>Все</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  logo: {
    ...typography.logo,
  },
  welcomeBlock: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  welcomeTitle: {
    ...typography.h1,
  },
  welcomeSubtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  searchWrap: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  banner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  bannerTitle: {
    color: colors.textInverse,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
  },
  sectionTitle: {
    ...typography.h2,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  sectionAction: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  brandRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  productRow: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  lastRow: {
    paddingBottom: spacing.md,
  },
  productCard: {
    width: 172,
  },
});
