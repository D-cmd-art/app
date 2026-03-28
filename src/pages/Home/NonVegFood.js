import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../CartContext";
import { useProductList } from "../../hooks/useProductList.js";
import SkeletonLoader from "./Loader/SkeletonLoader";
import ProductCard from "../components/ProductCard";

const { width: deviceWidth } = Dimensions.get("window");

const VegFood = () => {
  const { addToCart } = useCart();
  const navigation = useNavigation();
  const { data, isLoading, error } = useProductList();
  const flatListRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTouched, setUserTouched] = useState(false);

  // ✅ Filter non-veg items
  const vegItems = data?.filter(item => item.subCategory === "meat") || [];


  if (isLoading) return <SkeletonLoader />;
  if (error) return <SkeletonLoader />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Non-Veg Food</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllFood")}>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={deviceWidth * 0.08}
            color="#e91313ff"
          />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        ref={flatListRef}
        data={vegItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item._id}
        snapToInterval={deviceWidth * 0.6}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: deviceWidth * 0.04 }}
        onScrollBeginDrag={() => setUserTouched(true)}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard item={item} />
          </View>
        )}
      />
    </View>
  );
};

export default VegFood;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: deviceWidth * 0.05,
    marginBottom: 15,
  },
  title: {
    fontSize: deviceWidth * 0.045,
    fontWeight: "bold",
    color: "#e91313ff",
  },
  cardWrapper: {
    width: deviceWidth * 0.6,
    marginRight: 15,
  },
});
