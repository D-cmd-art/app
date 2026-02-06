import React, { useEffect, useState, useMemo } from "react";
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

const RestaurantProductCard = React.memo(({ item, onPress, onFavouriteUpdate }) => {
  const [isFavourite, setIsFavourite] = useState(false);

  const { user } = useUserStore();
  const { addItem, decreaseItem, items } = useCartStore();
  const { mutate } = useFavourites();
  const { data: favouriteData } = useFavouritesList(user?.id) || {};

  const cartItem = items.find(i => i._id === item._id);
  const isOpen = checkRestaurantOpenStatus(item?.restaurant?.time);

  // Set favourite state only when favouriteData changes
  useEffect(() => {
    if (favouriteData?.productIds) {
      setIsFavourite(favouriteData.productIds.includes(item._id));
    }
  }, [favouriteData, item._id]);

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

  // Memoized stars to avoid re-render
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
        <TouchableOpacity onPress={toggleFavourite}>
          <Ionicons
            name={isFavourite ? "heart" : "heart-outline"}
            size={22}
            color="#ef4444"
          />
        </TouchableOpacity>

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
            style={[styles.addBtn, !isOpen && styles.disabled]}
            onPress={() => isOpen && addItem(item)}
          >
            <Text style={styles.addText}>{isOpen ? "ADD" : "CLOSED"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

// Helper
function checkRestaurantOpenStatus(time) {
  if (!time) return true;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  const [oh, om] = time.open.split(":").map(Number);
  const [ch, cm] = time.closed.split(":").map(Number);

  return current >= oh * 60 + om && current < ch * 60 + cm;
}

// Styles
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
  image: { width: 110, height: 110, borderRadius: 10 },
  info: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 15, fontWeight: "700", color: "#111" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginVertical: 2 },
  ratingText: { marginLeft: 6, fontSize: 12, color: "#6b7280" },
  restaurant: { fontSize: 12, color: "#6b7280" },
  price: { fontSize: 15, fontWeight: "700", color: "#f97316", marginTop: 4 },
  actions: { alignItems: "center", gap: 10 },
  addBtn: { backgroundColor: "#22c55e", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  disabled: { backgroundColor: "#ef4444" },
  addText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qty: { fontWeight: "700", fontSize: 14 },
});

export default RestaurantProductCard;
