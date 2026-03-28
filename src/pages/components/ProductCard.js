// ProductCard.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCartStore } from "../../utils/store/cartStore";
import { useFavouritesContext } from "../FavoritesContext";

const ProductCard = ({ item, onPress }) => {
  const { favourites, toggleFavourite } = useFavouritesContext();
  const [blockMessage, setBlockMessage] = useState("");
  const { addItem, decreaseItem, items } = useCartStore();

  const productId = item?._id || item?.id;
  const cartItem = items.find((i) => i._id === productId);
  const isFavourite = favourites.some((p) => p && (p._id || p.id) === productId);

  const isOpen = checkRestaurantOpenStatus(item?.restaurant?.time);
  const photoUrl = item?.photos?.[0];

  // Animation for button feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleAddToCart = () => {
    if (!isOpen) return;
    const success = addItem(item); // Zustand updates state instantly
    animatePress();

    if (!success) {
      setBlockMessage("You can only order from one restaurant at a time");
      setTimeout(() => setBlockMessage(""), 2500);
    } else {
      setBlockMessage("");
    }
  };

  const renderStars = (rating = 0) =>
    [...Array(5)].map((_, i) => (
      <Ionicons
        key={`star-${i}`}
        name="star"
        size={15}
        color={i < rating ? "#fbbf24" : "#e5e7eb"}
      />
    ));

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Favourite button */}
      <TouchableOpacity
        style={styles.favBtn}
        onPress={() => {
          toggleFavourite(item);
          animatePress();
        }}
      >
        <Ionicons
          name={isFavourite ? "heart" : "heart-outline"}
          color="#ef4444"
          size={22}
        />
      </TouchableOpacity>

      {/* Product image */}
      {photoUrl && <Image source={{ uri: photoUrl }} style={styles.image} />}

      {/* Open/Closed badge */}
      <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
        <Text style={styles.badgeText}>{isOpen ? "Open" : "Closed"}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item?.name}</Text>

        <View style={styles.ratingRow}>
          {renderStars(item?.rating?.average)}
          <Text style={styles.ratingText}>{item?.rating?.average?.toFixed(1)}</Text>
        </View>

        <Text style={styles.provider} numberOfLines={1}>By {item?.restaurant?.name}</Text>
        <Text style={styles.price}>Rs. {item?.price}</Text>

        {cartItem ? (
          <View style={styles.cartRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => decreaseItem(productId)}>
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyCount}>{cartItem.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleAddToCart}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.addBtn, !isOpen && styles.disabledBtn]}
                onPress={handleAddToCart}
              >
                <Text style={styles.addText}>{!isOpen ? "Closed" : "Add to cart"}</Text>
              </TouchableOpacity>
            </Animated.View>
            {blockMessage !== "" && (
              <Text style={styles.blockMessage}>{blockMessage}</Text>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

// --- Helper
function checkRestaurantOpenStatus(time) {
  if (!time) return true;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = time.open.split(":").map(Number);
  const [closeH, closeM] = time.closed.split(":").map(Number);
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  return currentMinutes >= openMin && currentMinutes < closeMin;
}

// --- Styles
const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
    borderColor: "#eee",
    borderWidth: 1,
    elevation: 3,
  },
  favBtn: {
    position: "absolute",
    zIndex: 2,
    right: 12,
    top: 12,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  image: { width: "100%", height: 150 },
  badge: { position: "absolute", top: 12, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeOpen: { backgroundColor: "#22c55e" },
  badgeClosed: { backgroundColor: "#ef4444" },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  content: { padding: 12 },
  name: { fontSize: 16, fontWeight: "600", color: "#111", marginBottom: 6 },
  provider: { fontSize: 13, color: "#6b7280", marginTop: 2, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, marginLeft: 4, fontWeight: "600", color: "#7e7a7a" },
  price: { fontSize: 17, color: "#f16915", fontWeight: "700", marginBottom: 10 },
  addBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  disabledBtn: {
    backgroundColor: "#FFD0D0",
    borderColor: "#ff1f1f",
  },
  addText: { color: "#000", fontWeight: "700" },
  cartRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16 },
  qtyBtn: { backgroundColor: "#ff1f1f", width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  qtyText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  qtyCount: { fontSize: 17, fontWeight: "700", color: "#333" },
  blockMessage: { color: "#ef4444", marginTop: 6, fontWeight: "600", textAlign: "center" },
});