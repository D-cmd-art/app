import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { useRestaurantList } from "../../hooks/useRestaurantList";
import RestaurantCard from "../components/RestaurantCard";

const { width: deviceWidth } = Dimensions.get("window");

const AllRestaurants = () => {
  const { data, isLoading, error } = useRestaurantList();

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <SkeletonPlaceholder borderRadius={10}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonLogo} />
            <View style={styles.skeletonText} />
            <View style={styles.skeletonSubtext} />
          </View>
        ))}
      </SkeletonPlaceholder>
    </View>
  );

  const renderError = () => (
    <View style={styles.center}>
      <Text style={styles.errorText}>Error loading restaurants</Text>
    </View>
  );

  const renderRestaurants = () => (
    <ScrollView contentContainerStyle={styles.content}>
      {data?.map((item) => (
        <RestaurantCard key={item._id} restaurant={item} />
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>All Restaurants</Text>
        <Ionicons
                     name="arrow-forward-circle-outline"
                     size={deviceWidth * 0.08}
                     color="#92400e"
                   />
      </View>

      {isLoading ? renderLoader() : error ? renderError() : renderRestaurants()}
    </View>
  );
};

export default AllRestaurants;

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: deviceWidth * 0.045,
    fontWeight: "bold",
        color: "#92400e",
  },
  content: {
    paddingBottom: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "500",
  },
  loaderContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  skeletonCard: {
    marginBottom: 20,
  },
  skeletonImage: {
    width: "100%",
    height: 140,
    borderRadius: 10,
  },
  skeletonLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    top: 10,
    left: 10,
  },
  skeletonText: {
    marginTop: 10,
    width: 120,
    height: 14,
    borderRadius: 4,
    alignSelf: "center",
  },
  skeletonSubtext: {
    marginTop: 6,
    width: 100,
    height: 10,
    borderRadius: 4,
    alignSelf: "center",
  },
});