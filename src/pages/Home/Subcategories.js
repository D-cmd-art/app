import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions, // Added for screen calculations
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useProductList } from "../../hooks/useProductList";
import { useCartStore } from "../../utils/store/cartStore";
import ProductCard from "../components/ProductCard";

// Get screen width to calculate grid spacing
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SubcategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const selectedCategory = route.params?.category;
  const { data: allProducts, isLoading, error } = useProductList();

  const filteredProducts =
    selectedCategory && selectedCategory !== "All"
      ? allProducts?.filter((p) => p.category === selectedCategory)
      : allProducts;

  // Responsive Grid Logic: Use 2 columns for phones, 3 or 4 for tablets
  const numColumns = SCREEN_WIDTH > 600 ? 3 : 2;

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ee1212ff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Failed to load products</Text>
      </View>
    );

  if (!filteredProducts || filteredProducts.length === 0)
    return (
      <View style={styles.center}>
        <Text style={styles.noItemsText}>
          No items found in "{selectedCategory}"
        </Text>
      </View>
    );

  const renderItem = ({ item }) => (
    <View style={[styles.cardWrapper, { maxWidth: SCREEN_WIDTH / numColumns - 16 }]}>
      <ProductCard
        item={item}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
        onFavouriteUpdate={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={SCREEN_WIDTH * 0.06} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedCategory}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          key={numColumns} // Changing numColumns requires a new key to re-render
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      </View>

      <BottomCartBar navigation={navigation} />
    </SafeAreaView>
  );
};

const BottomCartBar = ({ navigation }) => {
  const { items } = useCartStore();
  if (!items || items.length === 0) return null;

  const totalQuantity = items.reduce((a, b) => a + b.quantity, 0);
  const totalPrice = items.reduce((a, b) => a + b.quantity * b.price, 0);

  return (
    <View style={styles.bottomCartBar}>
      <View style={styles.cartInfo}>
        <Text style={styles.cartBottomText}>{totalQuantity} items</Text>
        <Text style={styles.cartBottomPrice}>Total: Rs. {totalPrice}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Responsive Grid
  row: {
    justifyContent: "flex-start", // Changed to flex-start for consistent spacing
    gap: 12, // Modern spacing property
  },
  cardWrapper: {
    flex: 1, // Let items grow to fill space
    marginBottom: 16,
  },
  flatListContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.04, // 4% of screen width
    paddingTop: 16,
    paddingBottom: 100, // Extra padding so content isn't hidden by Cart Bar
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 8, color: "#ee1212ff", fontSize: SCREEN_WIDTH * 0.04 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ee1212ff",
    paddingVertical: SCREEN_WIDTH * 0.035,
    minHeight: 60,
  },
  backBtn: { position: "absolute", left: SCREEN_WIDTH * 0.04 },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.05, // Font scales with screen width
    fontWeight: "700",
    color: "#fff",
  },

  bottomCartBar: {
    position: "absolute",
    bottom: 35, // Floating style
    left: "4%",
    right: "4%",
    width: "92%",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15, // Rounded corners for modern feel
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Shadows
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cartInfo: { flex: 1 },
  cartBottomText: { fontSize: 13, color: "#666" },
  cartBottomPrice: { fontSize: 16, fontWeight: "700", color: "#333" },

  cartBottomBtn: {
    backgroundColor: "#ee1212ff",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  cartBottomBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default SubcategoryScreen;