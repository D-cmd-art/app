import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,

  TouchableOpacity,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavouriteListAll } from "../hooks/useFavourites";
import { useUserStore } from "../utils/store/userStore";
import ProductCard from "./components/ProductCard";

const { width } = Dimensions.get("window");

const Favourite = () => {
  const { user } = useUserStore();
  const { data, isLoading, error, refetch } = useFavouriteListAll(user?.id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#92400e" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="alert-closes-outline" size={width * 0.1} color="red" />
        <Text style={styles.errorText}>
          Something went wrong. Please try again.
        </Text>
      </SafeAreaView>
    );
  }

  const products = data?.productIds ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 🔹 Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            
            <Text style={styles.title}>My Favorites</Text>
          </View>
         
        </View>

        {/* 🔹 Empty State */}
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
           
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>
              You haven’t added any favorites yet. Explore products and tap the{" "}
              <Ionicons name="heart-outline" size={16} color="#92400e" /> icon
              to add them here!
            </Text>
           
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item._id ?? item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <ProductCard item={item} onFavouriteUpdate={refetch} />
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Favourite;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: width * 0.02,
  },

  /* 🔹 Header */
  header: {
    alignItems: "center",
    marginBottom: width * 0.04,
  },
  headerLeft: {

    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#92400e",
    marginLeft: 8,
  },

  /* 🔹 Grid Layout */
  gridContainer: {
    paddingBottom: width * 0.1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: width * 0.04,
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: width * 0.01,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#c7c5c5ff",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },

  /* 🔹 Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: width * 0.1,
    paddingHorizontal: width * 0.1,
  },
  emptyImage: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: width * 0.05,
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#333",
    marginBottom: width * 0.02,
  },
  emptyText: {
    fontSize: width * 0.04,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  exploreButton: {
    marginTop: width * 0.06,
    backgroundColor: "#92400e",
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.1,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontWeight: "600",
  },

  /* 🔹 Loading & Error */
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: width * 0.04,
    color: "#666",
  },
  errorText: {
    fontSize: width * 0.04,
    color: "red",
    marginTop: 8,
  },
});
