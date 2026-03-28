import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  BackHandler,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useRestaurantProducts } from "../../hooks/useRestaurantList";
import ResturantProductCard from "../components/resturantProduct";
import { useCartStore } from "../../utils/store/cartStore";

export default function RestaurantFood() {
  const navigation = useNavigation();
  const { restaurantId } = useRoute().params;

  const { data, isLoading, error } = useRestaurantProducts(restaurantId);
  const addToCart = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { width, height } = useWindowDimensions();
  const numColumns = width < 400 ? 1 : 2;

  const flatListRef = useRef(null);

  // Scroll to top when category/subcategory changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [selectedCategory, selectedSubCategory]);

  // Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  if (isLoading)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#e11d48" />
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "red" }}>Failed to load data</Text>
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

      {/* ===== FIXED HEADER + CATEGORY ===== */}
      <View>
        <RestaurantHeader restaurant={restaurant} width={width} />

        {/* Categories */}
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                selectedCategory === item && styles.tabActive,
              ]}
              onPress={() => {
                setSelectedCategory(item);
                setSelectedSubCategory(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedCategory === item && styles.tabTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Subcategory */}
        {selectedCategory && (
          <View style={styles.subcategoryContainer}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setModalVisible(true)}
            >
              <Text>{selectedSubCategory || "All Subcategories"}</Text>
              <Ionicons name="chevron-down" size={18} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ===== PRODUCTS LIST ONLY SCROLLABLE ===== */}
      <FlatList
        ref={flatListRef}
        data={filteredProducts}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: height * 0.2 },
        ]}
        columnWrapperStyle={numColumns > 1 && styles.row}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => (
          <View
            style={[
              styles.productWrapper,
              numColumns === 1 && { width: "90%", alignSelf: "center" },
            ]}
          >
            <ResturantProductCard
              item={item}
              onAddToCart={() => addToCart(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No products found</Text>
        }
      />

      {/* Subcategory Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Subcategory</Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSelectedSubCategory(null);
                setModalVisible(false);
              }}
            >
              <Text>All</Text>
            </TouchableOpacity>

            {subCategories.map((sub) => (
              <TouchableOpacity
                key={sub}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedSubCategory(sub);
                  setModalVisible(false);
                }}
              >
                <Text>{sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <BottomCartBar navigation={navigation} items={cartItems} />
    </SafeAreaView>
  );
}

/* ======================= HEADER ======================= */
const RestaurantHeader = ({ restaurant, width }) => {
  const navigation = useNavigation();
  if (!restaurant) return null;

  return (
    <View>
      <Image
        source={{ uri: restaurant.photos?.[0] }}
        style={{ width, height: width * 0.5 }} // responsive height
      />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={22} />
      </TouchableOpacity>

      <View style={[styles.headerInfo, { paddingHorizontal: width * 0.03 }]}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.desc}>{restaurant.description}</Text>
      </View>
    </View>
  );
};

/* ======================= CART BAR ======================= */
const BottomCartBar = ({ navigation, items }) => {
  if (!items.length) return null;

  const qty = items.reduce((a, b) => a + b.quantity, 0);
  const price = items.reduce((a, b) => a + b.quantity * b.price, 0);

  return (
    <View style={styles.cartBar}>
      <Text>{qty} items • Rs. {price}</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Addtocart")}>
        <Text style={styles.cartBtn}>View Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ======================= STYLES ======================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff",padding:4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  listContent: { paddingHorizontal: "3%" },
  row: { justifyContent: "space-between" },

  backBtn: {
    position: "absolute",
    top: "5%",
    left: "3%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
  },
  headerInfo: { marginVertical: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  desc: { color: "#6b7280" },

  tabsContainer: { paddingVertical: 10, paddingHorizontal: "3%" },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginRight: 8,
  },
  tabActive: { backgroundColor: "#ef4444" },
  tabText: { color: "#000" },
  tabTextActive: { color: "#fff" },

  subcategoryContainer: { marginBottom: 12, paddingHorizontal: "3%" },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  empty: { textAlign: "center", marginTop: 40 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    
  },
  modal: {
    backgroundColor: "#FFFEFE",
    marginHorizontal: "8%",

    borderRadius: "5%",
    padding: 16,
  },
  modalTitle: { textAlign: "center",  fontWeight: "700", marginBottom: 12 },
  modalItem: { paddingVertical: 10, },

  productWrapper: { flex: 1, marginBottom: 16 ,},

  cartBar: {
    position: "absolute",
    bottom: "1%",
   left:"2%",
   right:"30%",
    backgroundColor: "#F8C6C6",
    
    paddingVertical: 14,
    paddingHorizontal: "5%",
    borderRadius: 14,
    flexDirection: "row",
    gap:20,
    justifyContent:"flex-start",
    
    elevation: 2,
  },
  cartBtn: { color: "#ef4444", fontWeight: "700" },
});
