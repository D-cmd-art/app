import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  Easing,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../CartContext";
import { useProductList } from "../../hooks/useProductList";
import SkeletonLoader from "./Loader/SkeletonLoader";
import ProductCard from "../components/ProductCard";

const { width } = Dimensions.get("window");

const VegFood = () => {
  const navigation = useNavigation();
  const { data, isLoading, error } = useProductList();
  const flatListRef = useRef(null);

  const animatedValues = useRef([]);
  const hasAnimated = useRef(false);

  const vegItems =
    data?.filter(item => item.subCategory === "vegeterian") || [];

  /* 🔹 One-time animation */
  useEffect(() => {
    if (!vegItems.length || hasAnimated.current) return;

    hasAnimated.current = true;

    animatedValues.current = vegItems.map(
      () => new Animated.Value(0)
    );

    Animated.stagger(
      120,
      animatedValues.current.map(value =>
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [vegItems]);

  if (isLoading) return <SkeletonLoader />;
  if (error) return <SkeletonLoader />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Veg Food</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllFood")}>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={width * 0.08}
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
        snapToInterval={width * 0.5}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: width * 0.04 }}
        renderItem={({ item, index }) => {
          const opacity =
            animatedValues.current[index] ?? new Animated.Value(1);

          const translateY = opacity.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          });

          return (
            <Animated.View
              style={[
                styles.cardWrapper,
                { opacity, transform: [{ translateY }] },
              ]}
            >
              <ProductCard item={item} />
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

export default VegFood;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: width * 0.05,
    marginBottom: 15,
  },
  title: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#e91313ff",
  },
  cardWrapper: {
    width: width * 0.6,
    marginRight: 15,
  },
});
