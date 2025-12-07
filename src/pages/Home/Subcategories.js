import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useProductList } from "../../hooks/useProductList";
import { useCartStore } from "../../utils/store/cartStore";
import ProductCard from "../components/ProductCard";

const SubcategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const selectedCategory = route.params?.category;
  const { data: allProducts, isLoading, error } = useProductList();

  const filteredProducts =
    selectedCategory && selectedCategory !== "All"
      ? allProducts?.filter((p) => p.category === selectedCategory)
      : allProducts;

  // 🔹 Loading
  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ee1212ff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );

  // 🔹 Error
  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Failed to load products</Text>
      </View>
    );

  // 🔹 Empty category
  if (!filteredProducts || filteredProducts.length === 0)
    return (
      <View style={styles.center}>
        <Text style={styles.noItemsText}>
          No items found in "{selectedCategory}"
        </Text>
      </View>
    );

  // 🔹 2-column product card
  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <ProductCard
        item={item}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
        onFavouriteUpdate={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedCategory}</Text>
      </View>

      {/* Product Grid */}
      <View style={{ flex: 1, marginBottom: 70 }}>
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 16 }}
        />
      </View>

      {/* 🔥 Bottom Floating Cart Bar */}
      <BottomCartBar navigation={navigation} />
    </SafeAreaView>
  );
};

export default SubcategoryScreen;

//
// 🔥 Bottom Floating Cart Bar Component
//
const BottomCartBar = ({ navigation }) => {
  const { items } = useCartStore();

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

//
// =============================================
// Styles
// =============================================
//
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Grid Layout
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardWrapper: {
    width: "48%",
  },

  // Center loader
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 8, color: "#ee1212ff" },
  noItemsText: { fontSize: 16, color: "#888", textAlign: "center" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ee1212ff",
    paddingVertical: 14,
  },
  backBtn: { position: "absolute", left: 16 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  // 🔥 Bottom Cart Bar
  bottomCartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
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

  cartBottomText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  cartBottomBtn: {
    backgroundColor: "#ee1212ff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  cartBottomBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
