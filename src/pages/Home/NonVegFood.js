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
import { useCart } from "../CartContext";
import { useNavigation } from "@react-navigation/native";
import { useProductList } from "../../hooks/useProductList.js";
import SkeletonLoader from "./Loader/SkeletonLoader";
import ProductCard from "../components/ProductCard";

const { width: deviceWidth } = Dimensions.get("window");

const VegFood = () => {
  const { addToCart } = useCart();
  const navigation = useNavigation();
  const { data, isLoading, error } = useProductList();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const vegItems = data?.filter((item) => item.subCategory === "meat") || [];

  useEffect(() => {
    if (!vegItems.length) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % vegItems.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, vegItems.length]);

  if (isLoading) return <SkeletonLoader />;
  if (error) return <Text>Error occurred while loading food items.</Text>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Non-Veg Food</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllFood")}>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={deviceWidth * 0.08}
            color="#92400e"
          />
        </TouchableOpacity>
      </View>

      {/* Auto-Swiping Horizontal List */}
      <FlatList
        ref={flatListRef}
        data={vegItems}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard item={item} />
          </View>
        )}
        keyExtractor={(item, index) => item.id?.toString() || `food-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: deviceWidth * 0.45 + 15,
          offset: (deviceWidth * 0.45 + 15) * index,
          index,
        })}
      />
    </View>
  );
};

export default VegFood;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingLeft: 19,
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: deviceWidth * 0.05,
    marginBottom: 15,
  },
  title: {
    fontSize: deviceWidth * 0.045,
    fontWeight: "bold",
    color: "#92400e",
  },
  cardWrapper: {
    width: deviceWidth * 0.45,
    marginRight: 15,
  },
});