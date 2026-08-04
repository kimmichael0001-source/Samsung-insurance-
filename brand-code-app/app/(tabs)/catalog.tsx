import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandChip, EmptyState, FilterButton, ProductCard, ScreenHeader, SearchBar } from '../../src/components';
import { brands } from '../../src/data/brands';
import { categoryLabels } from '../../src/data/labels';
import { products } from '../../src/data/products';
import { useAppState } from '../../src/store/AppStateContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { ProductCategory } from '../../src/types';

type SortOption = 'new' | 'price_asc' | 'price_desc' | 'discount' | 'ending_soon';
type PricePreset = 'all' | 'under30' | '30_60' | 'over60';

const CATEGORY_OPTIONS: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'clothing', label: categoryLabels.clothing },
  { id: 'shoes', label: categoryLabels.shoes },
  { id: 'bags', label: categoryLabels.bags },
  { id: 'accessories', label: categoryLabels.accessories },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'new', label: 'Сначала новые' },
  { id: 'discount', label: 'Больше скидка' },
  { id: 'price_asc', label: 'Сначала дешевле' },
  { id: 'price_desc', label: 'Сначала дороже' },
  { id: 'ending_soon', label: 'Успей заказать' },
];

const PRICE_OPTIONS: { id: PricePreset; label: string }[] = [
  { id: 'all', label: 'Любая цена' },
  { id: 'under30', label: 'До 30 000 ₸' },
  { id: '30_60', label: '30 000 – 60 000 ₸' },
  { id: 'over60', label: 'От 60 000 ₸' },
];

const ALL_SIZES = Array.from(new Set(products.flatMap((product) => product.availableSizes))).sort();

function matchesPricePreset(price: number, preset: PricePreset): boolean {
  if (preset === 'under30') return price < 30000;
  if (preset === '30_60') return price >= 30000 && price <= 60000;
  if (preset === 'over60') return price > 60000;
  return true;
}

export default function CatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ brand?: string; sort?: string }>();
  const { isFavorite, toggleFavorite } = useAppState();

  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [pricePreset, setPricePreset] = useState<PricePreset>('all');
  const [sortBy, setSortBy] = useState<SortOption>('new');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);

  useEffect(() => {
    if (params.brand) {
      setSelectedBrands([params.brand]);
    }
    if (params.sort === 'ending_soon' || params.sort === 'new') {
      setSortBy(params.sort);
    }
  }, [params.brand, params.sort]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand],
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((current) =>
      current.includes(size) ? current.filter((item) => item !== size) : [...current, size],
    );
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setPricePreset('all');
  };

  const activeFilterCount = selectedBrands.length + selectedSizes.length + (pricePreset !== 'all' ? 1 : 0);

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (category !== 'all' && product.category !== category) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
      if (selectedSizes.length > 0 && !product.availableSizes.some((size) => selectedSizes.includes(size))) {
        return false;
      }
      if (!matchesPricePreset(product.salePrice, pricePreset)) return false;
      if (query) {
        const haystack = `${product.brand} ${product.title}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'discount':
        sorted.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'ending_soon':
        sorted.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
        break;
      case 'new':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return sorted;
  }, [category, selectedBrands, selectedSizes, pricePreset, searchValue, sortBy]);

  const currentSortLabel = SORT_OPTIONS.find((option) => option.id === sortBy)?.label ?? 'Сортировка';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Каталог" subtitle={`${filteredProducts.length} товаров`} />

      <View style={styles.searchWrap}>
        <SearchBar value={searchValue} onChangeText={setSearchValue} />
      </View>

      <View style={styles.categoryRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          {CATEGORY_OPTIONS.map((option) => (
            <BrandChip
              key={option.id}
              label={option.label}
              selected={category === option.id}
              onPress={() => setCategory(option.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.toolbarRow}>
        <FilterButton
          label="Фильтры"
          icon="options-outline"
          active={activeFilterCount > 0}
          activeCount={activeFilterCount}
          onPress={() => setFiltersVisible(true)}
        />
        <FilterButton label={currentSortLabel} icon="swap-vertical-outline" onPress={() => setSortVisible(true)} />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Ничего не найдено"
            description="Попробуйте изменить параметры поиска или сбросить фильтры"
            actionLabel={activeFilterCount > 0 ? 'Сбросить фильтры' : undefined}
            onAction={activeFilterCount > 0 ? resetFilters : undefined}
          />
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            style={styles.card}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => router.push(`/product/${item.id}`)}
          />
        )}
      />

      <Modal visible={filtersVisible} animationType="slide" transparent onRequestClose={() => setFiltersVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Фильтры</Text>
              <Pressable onPress={() => setFiltersVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.groupTitle}>Бренд</Text>
              <View style={styles.chipWrap}>
                {brands.map((brand) => (
                  <BrandChip
                    key={brand.id}
                    label={brand.name}
                    selected={selectedBrands.includes(brand.name)}
                    onPress={() => toggleBrand(brand.name)}
                  />
                ))}
              </View>

              <Text style={styles.groupTitle}>Размер</Text>
              <View style={styles.chipWrap}>
                {ALL_SIZES.map((size) => (
                  <BrandChip
                    key={size}
                    label={size}
                    selected={selectedSizes.includes(size)}
                    onPress={() => toggleSize(size)}
                  />
                ))}
              </View>

              <Text style={styles.groupTitle}>Цена</Text>
              <View style={styles.chipWrap}>
                {PRICE_OPTIONS.map((option) => (
                  <BrandChip
                    key={option.id}
                    label={option.label}
                    selected={pricePreset === option.id}
                    onPress={() => setPricePreset(option.id)}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Pressable style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Сбросить</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={() => setFiltersVisible(false)}>
                <Text style={styles.applyButtonText}>Показать {filteredProducts.length}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={sortVisible} animationType="slide" transparent onRequestClose={() => setSortVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSortVisible(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Сортировка</Text>
              <Pressable onPress={() => setSortVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={styles.sortRow}
                onPress={() => {
                  setSortBy(option.id);
                  setSortVisible(false);
                }}
              >
                <Text style={styles.sortRowLabel}>{option.label}</Text>
                {sortBy === option.id ? <Ionicons name="checkmark" size={20} color={colors.accent} /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrap: {
    paddingHorizontal: spacing.xl,
  },
  categoryRow: {
    marginTop: spacing.md,
  },
  categoryContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  toolbarRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    ...typography.h2,
  },
  groupTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    ...typography.bodyMedium,
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortRowLabel: {
    ...typography.body,
  },
});
