import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useMapStore } from "../utils/store/mapStore"; // adjust path

// Utility: Calculate distance in km (exact)
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // return exact km
}

export default function DistanceBadge({ restaurantLocation }) {
  const location = useMapStore((state) => state.location);
  const setDistance = useMapStore((state) => state.setDistance);

  const [distance, setLocalDistance] = useState(null);

  // Recalculate distance if location or restaurantLocation changes
  useEffect(() => {
    if (location && restaurantLocation) {
      const dist = getDistanceFromLatLonInKm(
        location.lat,
        location.lng,
        parseFloat(restaurantLocation.lat),
        parseFloat(restaurantLocation.lng)
      ).toFixed(2);

      setLocalDistance(dist);
      setDistance(dist);
    }
  }, [location, restaurantLocation, setDistance]);

  if (!restaurantLocation) return null;

  return (
    <View style={styles.container}>
      {location ? (
        distance ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{distance} km</Text>
          </View>
        ) : (
          <Text style={styles.text}>Calculating distance…</Text>
        )
      ) : (
        <TouchableOpacity
          style={styles.pickButton}
          onPress={() =>
            Alert.alert("Location Required", "Please pick location from top right end of app")
          }
        >
          <Text style={styles.pickButtonText}>Pick Location</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    alignItems: "center",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 80,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  text: {
    fontSize: 12,
    color: "#333",
  },
  pickButton: {
    backgroundColor: "#22c55e", // green-500
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  pickButtonText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
});