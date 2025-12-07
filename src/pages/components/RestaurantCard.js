// components/RestaurantCard.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMapStore } from "../../utils/store/mapStore";

export default function RestaurantCard({ restaurant }) {
  const navigation = useNavigation();
  const userLocation = useMapStore((state) => state.location);

  const [distance, setDistance] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const photoUrl = restaurant?.photos?.[0] ?? null;
  const rating = restaurant?.rating?.average ?? "N/A";
  const minTime = restaurant?.deliveryTime?.min ?? "-";
  const maxTime = restaurant?.deliveryTime?.max ?? "-";

  // ✅ Calculate distance using normalized { lat, lng }
  useEffect(() => {
    if (
      userLocation?.lat != null &&
      userLocation?.lng != null &&
      restaurant?.location?.lat != null &&
      restaurant?.location?.lng != null
    ) {
      const lat1 = Number(userLocation.lat);
      const lon1 = Number(userLocation.lng);
      const lat2 = Number(restaurant.location.lat);
      const lon2 = Number(restaurant.location.lng);

      if (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)) {
        const dist = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
        setDistance(dist.toFixed(2));
      } else {
        setDistance(null);
      }
    } else {
      setDistance(null);
    }
  }, [userLocation, restaurant]);

  // ✅ Check Open/Closed status
  useEffect(() => {
    if (!restaurant?.time?.open || !restaurant?.time?.closed) return;

    const checkStatus = () => {
      const now = new Date();
      const [openH, openM] = restaurant.time.open.split(":").map(Number);
      const [closeH, closeM] = restaurant.time.closed.split(":").map(Number);

      const openMin = openH * 60 + openM;
      const closeMin = closeH * 60 + closeM;
      const currentMin = now.getHours() * 60 + now.getMinutes();

      setIsOpen(currentMin >= openMin && currentMin < closeMin);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // update every min
    return () => clearInterval(interval);
  }, [restaurant]);

  const handlePress = () => {
    navigation.navigate("ResturantFood", {
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
    });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        {photoUrl && <Image source={{ uri: photoUrl }} style={styles.image} />}

        {/* Open/Closed badge */}
        <View style={[styles.statusBadge, isOpen ? styles.open : styles.closed]}>
          <Text style={styles.statusText}>{isOpen ? "Open" : "Closed"}</Text>
        </View>

        {/* Name */}
        <Text style={styles.name}>{restaurant?.name ?? "Unknown"}</Text>

        {/* Rating + Delivery + Distance */}
        <View style={styles.details}>
          <Ionicons name="star" size={14} color="gold" />
          <Text style={styles.text}>{rating}</Text>

          <Text style={styles.dot}>•</Text>

          <Ionicons name="time-outline" size={16} color="#052aa1" />
          <Text style={styles.text}>
            {minTime}-{maxTime} min
          </Text>

          <Text style={styles.dot}>•</Text>

          {userLocation ? (
            distance ? (
              <>
                <Ionicons name="location-outline" size={16} color="#052aa1" />
                <Text style={styles.text}>{distance} km</Text>
              </>
            ) : (
              <Text style={styles.text}>Distance unavailable</Text>
            )
          ) : (
            <TouchableOpacity
              onPress={() => alert("Please pick location from top-right corner")}
              style={styles.pickLocationBtn}
            >
              <Text style={styles.pickLocationText}>Pick Location</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

/* ✅ Distance calculator (Haversine formula) */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffffff",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: "#a8a8a8ff",
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  statusBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  open: { backgroundColor: "rgba(34,197,94,0.9)" },
  closed: { backgroundColor: "rgba(239,68,68,0.9)" },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  name: {
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
    color: "#333",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    flexWrap: "wrap",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: 3,
    color: "#8088a1",
  },
  dot: { marginHorizontal: 5, color: "gray" },
  pickLocationBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pickLocationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});