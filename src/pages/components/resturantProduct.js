import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFavouritesContext } from "../FavoritesContext";
import { useCartStore } from "../../utils/store/cartStore";

const RestaurantProductCard = ({ item, onPress }) => {
  const { favourites, toggleFavourite } = useFavouritesContext();
  const { addItem, decreaseItem, items } = useCartStore();
  const [toastMessage, setToastMessage] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;

  const cartItem = items.find(i => i._id === item._id);
  const isFavourite = favourites.some(p => p?._id === item._id);
  const isOpen = checkRestaurantOpenStatus(item?.restaurant?.time);

  // --- Show toast function
  const showToast = (msg) => {
    setToastMessage(msg);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastMessage(""));
      }, 2000);
    });
  };

  // --- Handle add to cart
  const handleAddToCart = () => {
    if (!isOpen) {
      showToast("Restaurant is closed.");
      return; // Exit early and do NOT add
    }
const toggleFavouriteHandler = () => {
  toggleFavourite(item); // your existing favourite toggle logic
  showToast(isFavourite ? "Removed from favourites ❌" : "Added to favourites ✅");
};

    const success = addItem(item); // returns false if different restaurant exists

    if (success) {
      showToast("Added to cart ✅");
    } else {
      showToast("You can only order from one restaurant at a time ❌");
    }
  };

  // Memoized stars
  const stars = useMemo(() => {
    const rating = item.rating?.average || 0;
    return [...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name="star"
        size={14}
        color={i < rating ? "#fbbf24" : "#d1d5db"}
      />
    ));
  }, [item.rating?.average]);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      {/* Left Image */}
      <Image source={{ uri: item?.photos?.[0] }} style={styles.image} />

      {/* Middle Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

        <View style={styles.ratingRow}>
          {stars}
          <Text style={styles.ratingText}>
            {item.rating?.average?.toFixed(1) || "0.0"}
          </Text>
        </View>

        <Text style={styles.restaurant} numberOfLines={1}>
          {item.restaurant?.name || ""}
        </Text>

        <Text style={styles.price}>Rs. {item.price}</Text>
      </View>

      {/* Right Actions */}
      <View style={styles.actions}>
        {/* Favourite button */}
        <TouchableOpacity onPress={() => toggleFavourite(item)}>
          <Ionicons
            name={isFavourite ? "heart" : "heart-outline"}
            size={30}
            color="#ef4444"
          />
        </TouchableOpacity>

        {/* Cart button */}
        {cartItem ? (
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => decreaseItem(item._id)}>
              <Ionicons name="remove-circle" size={26} color="#ef4444" />
            </TouchableOpacity>
            <Text style={styles.qty}>{cartItem.quantity}</Text>
            <TouchableOpacity onPress={handleAddToCart}>
              <Ionicons name="add-circle" size={26} color="#22c55e" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addBtn, !isOpen && styles.disabled]}
            onPress={handleAddToCart}
          >
            <Text style={styles.addText}>{isOpen ? "ADD" : "CLOSED"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Toast message */}
      {toastMessage !== "" && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

// --- Helper
function checkRestaurantOpenStatus(time) {
  if (!time) return true;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = time.open.split(":").map(Number);
  const [ch, cm] = time.closed.split(":").map(Number);
  return current >= oh * 60 + om && current < ch * 60 + cm;
}

// --- Styles
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 1,
    backgroundColor: "#fffdfd",
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  image: { width: 110, height: 110, borderRadius: 25 },
  info: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 15, fontWeight: "700", color: "#111" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginVertical: 2 },
  ratingText: { marginLeft: 6, fontSize: 12, color: "#6b7280" },
  restaurant: { fontSize: 12, color: "#6b7280" },
  price: { fontSize: 15, fontWeight: "700", color: "#f97316", marginTop: 4 },
  actions: { alignItems: "center", gap: 10 },
  addBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  disabled: { backgroundColor: "#ef4444" },
  addText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qty: { fontWeight: "700", fontSize: 14 },
  toast: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    backgroundColor: "#ef4444",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginHorizontal: 12,
  },
  toastText: { color: "#fff", fontSize: 12, textAlign: "center", fontWeight: "600" },
});

export default RestaurantProductCard;
