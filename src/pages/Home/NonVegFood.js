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
  const [userTouched, setUserTouched] = useState(false);

  // ✅ Filter non-veg items
  const vegItems = data?.filter((item) => item.subCategory === "meat") || [];

  // ✅ Animated values for fade/slide in
  const animatedValues = useRef([]);

  useEffect(() => {
    if (vegItems.length > 0) {
      vegItems.forEach((_, i) => {
        if (!animatedValues.current[i]) {
          animatedValues.current[i] = new Animated.Value(0);
        }
      });

      const animations = vegItems.map((_, i) =>
        Animated.timing(animatedValues.current[i], {
          toValue: 1,
          duration: 500,
          delay: i * 120,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, animations).start();
    }
  }, [vegItems]);

  // ✅ Auto-scroll with looping
  useEffect(() => {
    if (!vegItems.length) return;

    const interval = setInterval(() => {
      if (userTouched) return; // pause while user interacts

      const nextIndex = (currentIndex + 1) % vegItems.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, vegItems.length, userTouched]);

  // ✅ Reset userTouched after 5s
  useEffect(() => {
    if (userTouched) {
      const timeout = setTimeout(() => setUserTouched(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [userTouched]);

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
            color="#e91313ff"
          />
        </TouchableOpacity>
      </View>

      {/* Auto-Swiping Horizontal List */}
      <FlatList
        ref={flatListRef}
        data={vegItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item._id || `food-${index}`}
        getItemLayout={(data, index) => ({
          length: deviceWidth * 0.5,
          offset: deviceWidth * 0.5 * index,
          index,
        })}
        snapToInterval={deviceWidth * 0.5}   // ✅ snap to card width
        snapToAlignment="center"             // ✅ center cards
        decelerationRate="fast"              // ✅ smooth momentum
        contentContainerStyle={{
          paddingHorizontal: deviceWidth * 0.04,
        }}
        onScrollBeginDrag={() => setUserTouched(true)}
        renderItem={({ item, index }) => {
          const opacity = animatedValues.current[index] || new Animated.Value(1);
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
    width: deviceWidth * 0.5, // ✅ slightly wider for better snap
    marginRight: 15,
  },
});