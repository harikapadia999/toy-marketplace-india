import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

export default function HomeScreen() {
  const { data: featuredToys } = useQuery({
    queryKey: ['featured-toys'],
    queryFn: () => api.getFeaturedToys(),
  });

  const categories = [
    { id: 1, name: 'Educational', icon: '📚', color: '#3b82f6' },
    { id: 2, name: 'Outdoor', icon: '⚽', color: '#10b981' },
    { id: 3, name: 'Arts', icon: '🎨', color: '#f59e0b' },
    { id: 4, name: 'Electronic', icon: '🎮', color: '#8b5cf6' },
    { id: 5, name: 'Dolls', icon: '👶', color: '#ec4899' },
    { id: 6, name: 'Vehicles', icon: '🚗', color: '#ef4444' },
    { id: 7, name: 'Puzzles', icon: '🧩', color: '#06b6d4' },
    { id: 8, name: 'Baby', icon: '🍼', color: '#84cc16' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.headerTitle}>Find Your Perfect Toy</Text>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color="#fff" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <Text style={styles.searchPlaceholder}>Search toys...</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: category.color + '20' }]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Toys */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Toys</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.toysScroll}
        >
          {[1, 2, 3, 4, 5].map((toy) => (
            <TouchableOpacity key={toy} style={styles.toyCard}>
              <View style={styles.toyImage}>
                <Text style={styles.toyEmoji}>🧸</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>33% OFF</Text>
                </View>
              </View>
              <View style={styles.toyInfo}>
                <Text style={styles.toyTitle} numberOfLines={2}>
                  LEGO City Police Station Building Set
                </Text>
                <View style={styles.toyPricing}>
                  <Text style={styles.toyPrice}>₹999</Text>
                  <Text style={styles.toyOriginalPrice}>₹1,499</Text>
                </View>
                <View style={styles.toyFooter}>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                  <TouchableOpacity style={styles.wishlistButton}>
                    <Ionicons name="heart-outline" size={18} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Popular Brands */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Brands</Text>
        <View style={styles.brandsGrid}>
          {['LEGO', 'Hot Wheels', 'Barbie', 'Nerf'].map((brand) => (
            <TouchableOpacity key={brand} style={styles.brandCard}>
              <Text style={styles.brandName}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchPlaceholder: {
    color: '#9ca3af',
    fontSize: 16,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAll: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginTop: 16,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  toysScroll: {
    marginTop: 16,
  },
  toyCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toyImage: {
    height: 180,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toyEmoji: {
    fontSize: 80,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  toyInfo: {
    padding: 12,
  },
  toyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  toyPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  toyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  toyOriginalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  toyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  wishlistButton: {
    padding: 4,
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  brandCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
