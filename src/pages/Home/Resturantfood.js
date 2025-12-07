import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  ScrollView,
  BackHandler,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useRestaurantProducts } from "../../hooks/useRestaurantList";
import ProductCard from "../components/ProductCard";
import { useCartStore } from "../../utils/store/cartStore";

const RestaurantFood = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurantId } = route.params;

  const { data, isLoading, error } = useRestaurantProducts(restaurantId);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const addToCart = useCartStore((state) => state.addItem);
  const itemsInCart = useCartStore((state) => state.items);

  const { width } = useWindowDimensions();
  const numColumns = width < 400 ? 1 : 2;

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const bh = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => bh.remove();
  }, []);

  if (isLoading)
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#92400e" />
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={{ color: "red" }}>Error loading restaurant data</Text>
      </SafeAreaView>
    );

  const restaurant = data?.restaurant;
  const products = data?.products || [];

  const categories = [...new Set(products.map((p) => p.category))];
  const subCategories = [
    ...new Set(
      products
        .filter((p) => p.category === selectedCategory)
        .map((p) => p.subCategory)
    ),
  ];

  const filteredProducts = products.filter(
    (p) =>
      (!selectedCategory || p.category === selectedCategory) &&
      (!selectedSubCategory || p.subCategory === selectedSubCategory)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Restaurant Header */}
        <RestaurantHeader restaurant={restaurant} />

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

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              key={numColumns}
              keyExtractor={(item) => item._id}
              numColumns={numColumns}
              scrollEnabled={false}
              {...(numColumns > 1 ? { columnWrapperStyle: styles.row } : {})}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.productWrapper,
                    numColumns === 1 && { width: "90%", alignSelf: "center" },
                  ]}
                >
                  <ProductCard
                    item={item}
                    onAddToCart={() => addToCart(item)}
                  />
                </View>
              )}
            />
          ) : (
            <Text style={styles.noProducts}>No products found.</Text>
          )}
        </View>
      </ScrollView>

      {/* 🔥 Bottom Floating Cart Bar */}
      <BottomCartBar navigation={navigation} items={itemsInCart} />
    </SafeAreaView>
  );
};

/* ---------------- RESTAURANT HEADER ---------------- */
const RestaurantHeader = ({ restaurant }) => {
  const navigation = useNavigation();
  if (!restaurant) return null;

  const isOpen = checkOpenStatus(restaurant.time);

  return (
    <View style={styles.headerCard}>
      <Image
        source={{ uri: restaurant.photos?.[0] }}
        style={styles.headerImage}
      />

      <View style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#2e0909ff" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <Text style={styles.headerDescription}>{restaurant.description}</Text>
        <Text style={isOpen ? styles.open : styles.closed}>
          {isOpen ? "Open Now" : "Closed"}
        </Text>

        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" color="#f59e0b" size={16} />
            <Text style={styles.statText}>
              {restaurant.rating?.average || "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

/* ---------------- BOTTOM CART BAR ---------------- */
const BottomCartBar = ({ navigation, items }) => {
  if (!items || items.length === 0) return null;

  const totalQuantity = items.reduce((a, b) => a + b.quantity, 0);
  const totalPrice = items.reduce((a, b) => a + b.quantity * b.price, 0);

  return (
    <View style={styles.bottomCartBar}>
      <View>
        <Text style={styles.cartBottomText}>{totalQuantity} items</Text>
        <Text style={styles.cartBottomText}>Total: Rs. {totalPrice}</Text>
      </View>

      <TouchableOpacity
        style={styles.cartBottomBtn}
        onPress={() => navigation.navigate("Addtocart")}
      >
        <Text style={styles.cartBottomBtnText}>View Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ---------------- HELPER ---------------- */
function checkOpenStatus(time) {
  if (!time) return false;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = time.open.split(":").map(Number);
  const [closeH, closeM] = time.closed.split(":").map(Number);

  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;

  return current >= openMin && current <= closeMin;
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerCard: { position: "relative" },
  headerImage: {
    width: "100%",
    height: 220,
   
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
    padding: 6,
    borderRadius: 20,
  },
  headerInfo: { marginTop: 10, paddingHorizontal: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#3a3c41ff" },
  headerDescription: { color: "#4b5563", marginBottom: 6 },
  open: { color: "green", fontWeight: "700", marginTop: 4 },
  closed: { color: "red", fontWeight: "700", marginTop: 4 },
  headerStats: { flexDirection: "row", marginTop: 4, gap: 20, justifyContent: "center" },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { color: "#000", fontWeight: "500" },

  tabsContainer: { marginTop: 16, paddingHorizontal: 16 },
  tabButton: {
    backgroundColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabActive: { backgroundColor: "#92400e" },
  tabText: { color: "#111" },
  tabTextActive: { color: "#fff" },

  subcategoryContainer: { paddingHorizontal: 16, marginTop: 12 },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
  },
  dropdownText: { fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", marginHorizontal: 40, padding: 20, borderRadius: 10 },
  modalTitle: { textAlign: "center", fontSize: 18, fontWeight: "700" },
  modalOption: { paddingVertical: 12 },
  modalOptionText: { textAlign: "center", fontSize: 16 },
  modalClose: { backgroundColor: "#92400e", padding: 12, borderRadius: 10 },
  modalCloseText: { color: "#fff", textAlign: "center" },

  productsGrid: { paddingHorizontal: 16, marginTop: 16 },
  row: { justifyContent: "space-between", marginBottom: 16 },
  productWrapper: { flex: 1 },
  noProducts: { textAlign: "center", marginTop: 20 },

  bottomCartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -3 },
  },
  cartBottomText: { fontSize: 15, fontWeight: "600", color: "#333" },
  cartBottomBtn: { backgroundColor: "#ee1212ff", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  cartBottomBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default RestaurantFood;
