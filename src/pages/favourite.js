// FavouriteLocal.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavouritesContext } from "../pages/FavoritesContext";
import { useCartStore } from "../utils/store/cartStore";

const { width } = Dimensions.get("window");

const Favourite = () => {
  const { favourites, toggleFavourite } = useFavouritesContext();
  const { addItem, decreaseItem, items } = useCartStore();

  const safeFavourites = favourites.filter((item) => item && item._id);

  if (safeFavourites.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={72} color="#F87979" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            Explore delicious dishes and tap the{" "}
            <Ionicons name="heart-outline" size={18} color="#C71111" /> icon to
            save them here!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    const cartItem = items.find((i) => i._id === item._id);

    return (
      <View style={styles.cardRow}>
        {/* Left Image */}
        <Image source={{ uri: item?.photos?.[0] }} style={styles.image} />

        {/* Middle Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.restaurant} numberOfLines={1}>
            {item.restaurant?.name || ""}
          </Text>
          <Text style={styles.price}>Rs. {item.price}</Text>
        </View>

        {/* Right Actions */}
        <View style={styles.actions}>
          {/* Favourite toggle */}
          <TouchableOpacity onPress={() => toggleFavourite(item)}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>

          {/* Cart controls */}
          {cartItem ? (
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={() => decreaseItem(item._id)}>
                <Ionicons name="remove-circle" size={26} color="#ef4444" />
              </TouchableOpacity>
              <Text style={styles.qty}>{cartItem.quantity}</Text>
              <TouchableOpacity onPress={() => addItem(item)}>
                <Ionicons name="add-circle" size={26} color="#22c55e" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addItem(item)}
            >
              <Text style={styles.addText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>My Favorites</Text>
        <FlatList
          data={safeFavourites}
          keyExtractor={(item, index) => item._id ?? index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default Favourite;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: width * 0.03,
  },
  header: {
    fontSize: width * 0.065,
    fontWeight: "800",
    color: "#E64A4A",
    textAlign: "center",
    marginBottom: width * 0.04,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAEDE8",
    borderRadius: 10,
    elevation: 2,
    padding: 10,
    marginBottom: 12,
  },
  image: { width: 90, height: 90, borderRadius:25},
  info: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 16, fontWeight: "700", color: "#111" },
  restaurant: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  price: { fontSize: 16, fontWeight: "700", color: "#f97316", marginTop: 4 },
  actions: { alignItems: "center", gap: 18 },
  addBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qty: { fontWeight: "700", fontSize: 14 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.1,
  },
  emptyTitle: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#333",
    marginTop: width * 0.03,
  },
  emptyText: {
    fontSize: width * 0.04,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});