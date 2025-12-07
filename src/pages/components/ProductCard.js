import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFavourites, useFavouritesList } from "../../hooks/useFavourites";
import { useUserStore } from "../../utils/store/userStore";
import { useCartStore } from "../../utils/store/cartStore";

const ProductCard = ({ item, onPress, onFavouriteUpdate }) => {
  const [isFavourite, setIsFavourite] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");

  const photoUrl = item?.photos?.[0];
  const { user } = useUserStore();
  const { addItem, decreaseItem, items, clearCart } = useCartStore();
  const { mutate } = useFavourites();
  const { data: favouriteData } = useFavouritesList(user?.id) || {};

  const cartItem = items.find((i) => i._id === item._id);
  const isOpen = checkRestaurantOpenStatus(item?.restaurant?.time);

  // Favourite setup
  useEffect(() => {
    if (favouriteData?.productIds) {
      setIsFavourite(favouriteData.productIds.includes(item._id));
    }
  }, [favouriteData, item._id]);

  // --- Auto-clear cart if restaurant closes
  useEffect(() => {
    if (!isOpen) {
      const hasItemsFromThisRestaurant = items.some(
        (i) => i.restaurant?._id === item.restaurant?._id
      );
      if (hasItemsFromThisRestaurant) {
        clearCart();
        setBlockMessage("Cart cleared as the restaurant is now closed");
        setTimeout(() => setBlockMessage(""), 3000);
      }
    }
  }, [isOpen]);

  const toggleFavourite = () => {
    if (!user) return;

    const newState = !isFavourite;
    setIsFavourite(newState);

    mutate(
      {
        userId: user.id,
        productId: item._id,
        restaurantId: null,
        isFavourite: newState,
      },
      {
        onSuccess: () => onFavouriteUpdate?.(),
        onError: () => setIsFavourite(!newState),
      }
    );
  };

  const handleAddToCart = () => {
    if (!isOpen) return;

    const success = addItem(item);

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
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <TouchableOpacity style={styles.favBtn} onPress={toggleFavourite}>
        <Ionicons
          name={isFavourite ? "heart" : "heart-outline"}
          color="#ef4444"
          size={22}
        />
      </TouchableOpacity>

      <Image source={{ uri: photoUrl }} style={styles.image} />

      <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
        <Text style={styles.badgeText}>{isOpen ? "Open" : "Closed"}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.ratingRow}>
          {renderStars(item.rating?.average)}
          <Text style={styles.ratingText}>{item.rating?.average?.toFixed(1)}</Text>
        </View>
        <Text style={styles.provider} numberOfLines={1}>By {item.restaurant?.name}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>

        {cartItem ? (
          <View style={styles.cartRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => decreaseItem(item._id)}>
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyCount}>{cartItem.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleAddToCart}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.addBtn, !isOpen && styles.disabledBtn]}
              onPress={handleAddToCart}
            >
              <Text style={styles.addText}>{!isOpen ? "Closed" : "Add to cart"}</Text>
            </TouchableOpacity>
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

// --- Styles (same as before)
const styles = StyleSheet.create({
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", marginBottom: 18, borderColor: "#eee", borderWidth: 1, elevation: 3 },
  favBtn: { position: "absolute", zIndex: 2, right: 12, top: 12, backgroundColor: "#fff", padding: 6, borderRadius: 20, elevation: 3 },
  image: { width: "100%", height: 150, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
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
  addBtn: { backgroundColor: "#59920e", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  disabledBtn: { backgroundColor: "#fc3e04" },
  addText: { color: "#fff", fontWeight: "700" },
  cartRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16 },
  qtyBtn: { backgroundColor: "#ff1f1fff", width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  qtyText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  qtyCount: { fontSize: 17, fontWeight: "700", color: "#333" },
  blockMessage: { color: "#ef4444", marginTop: 6, fontWeight: "600", textAlign: "center" },
});
