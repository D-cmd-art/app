import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Modal,
  ActivityIndicator,
  ScrollView,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRestaurantProducts } from "../../hooks/useRestaurantList";
import ProductCard from "../components/ProductCard";

const RestaurantFood = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurantName } = route.params;

  const { data, isLoading, error } = useRestaurantProducts(restaurantName);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ Automatically adapt columns to screen width
  const { width } = useWindowDimensions();
  const numColumns = width < 400 ? 1 : 2; // 1 for small screens, 2 for larger ones

  // ✅ Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);

  // ✅ Loading & Error handling
  if (isLoading)
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#92400e" />
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={{ color: "red" }}>Error: {error.message}</Text>
      </SafeAreaView>
    );

  // ✅ Extract categories & subcategories
  const categories = Array.from(new Set(data?.products?.map((p) => p.category)));
  const subCategories = Array.from(
    new Set(
      data?.products
        ?.filter((p) => p.category === selectedCategory)
        .map((p) => p.subCategory)
    )
  );

  const filteredProducts = data?.products?.filter((p) => {
    return (
      (!selectedCategory || p.category === selectedCategory) &&
      (!selectedSubCategory || p.subCategory === selectedSubCategory)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <RestaurantHeader restaurant={data?.restaurants?.[0]} />

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tabButton,
                  selectedCategory === cat && styles.tabActive,
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setSelectedSubCategory(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedCategory === cat && styles.tabTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Subcategory Dropdown */}
        {selectedCategory && (
          <View style={styles.subcategoryContainer}>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.dropdownText}>
                {selectedSubCategory || "All Subcategories"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>

            {/* Modal */}
            <Modal
              transparent
              animationType="slide"
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Subcategory</Text>

                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      setSelectedSubCategory(null);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>All</Text>
                  </TouchableOpacity>

                  {subCategories.map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      style={styles.modalOption}
                      onPress={() => {
                        setSelectedSubCategory(sub);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{sub}</Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCloseText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        )}

        {/* ✅ Product Grid - Safe & Responsive */}
        <View style={styles.productsGrid}>
          {filteredProducts?.length > 0 ? (
            <FlatList
              data={filteredProducts}
              key={numColumns} // Force re-render on layout change
              keyExtractor={(item) => item._id}
              numColumns={numColumns}
              scrollEnabled={false}
              // ✅ Only include columnWrapperStyle if numColumns > 1
              {...(numColumns > 1 ? { columnWrapperStyle: styles.row } : {})}
              contentContainerStyle={{
                justifyContent:
                  numColumns === 1 ? "center" : "space-between",
                paddingBottom: 20,
              }}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.productWrapper,
                    numColumns === 1 && {
                      width: "90%",
                      alignSelf: "center",
                    },
                  ]}
                >
                  <ProductCard item={item} />
                </View>
              )}
            />
          ) : (
            <Text style={styles.noProducts}>No products found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* -------------------- HEADER -------------------- */
const RestaurantHeader = ({ restaurant }) => {
  const navigation = useNavigation();
  if (!restaurant) return null;

  return (
    <View style={styles.headerCard}>
      <Image
        source={{
          uri:
            restaurant.photos?.[0] ||
            "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
        }}
        style={styles.headerImage}
      />

      <View style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#2e0909ff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <Text style={styles.headerDescription}>
          {restaurant.description || "Delicious food served fresh!"}
        </Text>

        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" color="#f59e0b" size={16} />
            <Text style={styles.statText}>
              {restaurant.rating?.average || 4.7}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" color="#16a34a" size={16} />
            <Text style={styles.statText}>Free</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" color="#ef4444" size={16} />
            <Text style={styles.statText}>
              {restaurant.deliveryTime?.min || 15}–
              {restaurant.deliveryTime?.max || 25} min
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* Header */
  headerCard: { position: "relative" },
  headerImage: {
    width: "100%",
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerOverlay: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  menuButton: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  headerInfo: { marginTop: 10, paddingHorizontal: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#3a3c41ff" },
  headerDescription: { fontSize: 14, color: "#252629ff", marginVertical: 6 },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 20,
    justifyContent: "center",
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { color: "#05080eff", fontWeight: "500" },

  /* Category Tabs */
  tabsContainer: { marginTop: 16, paddingHorizontal: 16 },
  tabButton: {
    backgroundColor: "#c4c0bfff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabActive: { backgroundColor: "#92400e" },
  tabText: { color: "#111827", fontWeight: "500" },
  tabTextActive: { color: "#fff" },

  /* Subcategory Dropdown */
  subcategoryContainer: { paddingHorizontal: 16, marginTop: 12 },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  dropdownText: { fontSize: 15, color: "#374151", fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  modalOption: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  modalOptionText: { fontSize: 16, color: "#333", textAlign: "center" },
  modalClose: {
    backgroundColor: "#92400e",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  modalCloseText: { color: "#fff", fontWeight: "600" },

  /* Product Grid */
  productsGrid: { paddingHorizontal: 16, marginTop: 16 },
  row: { justifyContent: "space-between", marginBottom: 16 },
  productWrapper: { flex: 1, marginHorizontal: 4 },
  noProducts: { textAlign: "center", color: "#6b7280", marginTop: 20 },
});

export default RestaurantFood;
