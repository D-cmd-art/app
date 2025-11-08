import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useProductList } from "../../hooks/useProductList";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ProductCard from "../components/ProductCard";

const AllFood = () => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");
  const { data, isLoading, error } = useProductList();

  // ✅ Format data for ProductCard
  const foods = data?.map((item, index) => ({
    id: item._id ?? item.id ?? `food-${index}`,
    name: item.name ?? "Unnamed",
    price: item.price ?? 0,
    rating: item.rating?.average ?? 0,
    photos: item.photos ?? [],
    ...item, // include other props if needed
  })) ?? [];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#15c415ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Error loading categories</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="red" />
        </TouchableOpacity>

        <Text style={styles.title}>All Foods</Text>

        <TouchableOpacity
          style={[styles.iconButton, { marginLeft: 10 }]}
          onPress={() =>
            navigation.navigate("Home", {
              screen: "Favorites",
            })
          }
        >
          <Ionicons name="heart-outline" size={28} color="red" />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => <ProductCard item={item} />}
      />
    </SafeAreaView>
  );
};

export default AllFood;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  iconButton: {
    padding: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});