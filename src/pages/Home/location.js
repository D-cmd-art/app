import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMapStore } from "../../utils/store/mapStore";
import { useNotificationsList } from "../../hooks/useNotification";

const LocationBar = () => {
  const navigation = useNavigation();
  const location = useMapStore((state) => state.location);

  // Fetch notifications safely
  const { data: notifications = [], isLoading } = useNotificationsList();

  const handleLocationPress = () => navigation.navigate("MapPicker");
  const handleNotificationPress = () => navigation.navigate("Notifications");
  const handleSearchPress = () => navigation.navigate("Search");

  const formatLocationText = () =>
    location?.address || "Tap to set your delivery location";

  const notificationCount = notifications.length;

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContent}>
        {/* 📍 Location + Notification */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.locationSection}
            activeOpacity={0.8}
            onPress={handleLocationPress}
          >
            <View style={styles.iconWrapper}>
              <Icon name="map-pin" size={18} color="#fff" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.deliverTo}>Deliver To</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {formatLocationText()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.8}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" style={styles.badge} />
            ) : notificationCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* 🔍 Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={handleSearchPress}
        >
          <Ionicons name="search-outline" size={20} color="#8a1405ff" />
          <Text style={styles.searchPlaceholder}>
            Are you Hungry? Search for delicious foods...
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationBar;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: "#A62A22",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  headerContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#facc15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textWrapper: { flex: 1 },
  deliverTo: {
    fontSize: 11,
    color: "#f5e8dc",
    fontWeight: "600",
  },
  locationText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
    marginTop: 2,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafaff",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: "#9b1010ff",
    fontSize: 14,
  },
});
