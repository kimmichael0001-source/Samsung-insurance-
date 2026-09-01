import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartButton, EmptyState, ProductCard, ScreenHeader } from '../../src/components';
import { useAppState } from '../../src/store/AppStateContext';
import { colors, spacing } from '../../src/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { products, favoriteIds, isFavorite, toggleFavorite, addToCart, cartCount } = useAppState();

  const favoriteProducts = useMemo(
    () => products.filter((product) => favoriteIds.includes(product.id)),
    [products, favoriteIds],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Избранное"
        subtitle={favoriteProducts.length > 0 ? `${favoriteProducts.length} товаров` : undefined}
        rightElement={<CartButton count={cartCount} onPress={() => router.push('/cart')} />}
      />

      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={favoriteProducts.length > 0 ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Пока пусто"
            description="Сохраняйте понравившиеся вещи, нажимая на сердечко в карточке товара"
          />
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            style={styles.card}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onQuickAdd={(size) => addToCart({ productId: item.id, size })}
            onPress={() => router.push(`/product/${item.id}`)}
          />
        )}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    marginBottom: spacing.md,
  },
});
