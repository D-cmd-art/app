import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
  FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useProductList } from "../../hooks/useProductList.js";
import SkeletonLoader from "./Loader/SkeletonLoader.js";
import ProductCard from "../components/ProductCard.js";

const { width: deviceWidth } = Dimensions.get("window");

const BestReviewedFood = () => {
  const navigation = useNavigation();
  const { data, isLoading, error } = useProductList();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTouched, setUserTouched] = useState(false);

  const products = data?.filter((item) => item.rating?.average > 4) || [];

  // Animated values for fade/slide in
  const animatedValues = useRef([]);

  useEffect(() => {
    if (products.length > 0) {
      products.forEach((_, i) => {
        if (!animatedValues.current[i]) {
          animatedValues.current[i] = new Animated.Value(0);
        }
      });

      const animations = products.map((_, i) =>
        Animated.timing(animatedValues.current[i], {
          toValue: 1,
          duration: 500,
          delay: i * 150,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, animations).start();
    }
  }, [products]);

  // Auto-scroll with pause on user touch
  useEffect(() => {
    if (!products.length) return;

    const interval = setInterval(() => {
      if (userTouched) return; // skip auto-scroll while user is interacting

      const nextIndex = (currentIndex + 1) % products.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, products.length, userTouched]);

  // Reset userTouched after 5s
  useEffect(() => {
    if (userTouched) {
      const timeout = setTimeout(() => setUserTouched(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [userTouched]);

  if (isLoading) return <SkeletonLoader />;
  if (error)
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading food items.</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Best Reviewed Food</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AllFood")}
            style={styles.iconButton}
          >
            <Ionicons
              name="arrow-forward-circle-outline"
              size={deviceWidth * 0.08}
              color="#e91313ff"
            />
          </TouchableOpacity>
        </View>

        {/* Auto-Swiping Animated FlatList */}
        <FlatList
          ref={flatListRef}
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item._id || `product-${index}`}
          getItemLayout={(data, index) => ({
            length: deviceWidth * 0.55,
            offset: deviceWidth * 0.55 * index,
            index,
          })}
          snapToInterval={deviceWidth * 0.55}   // ✅ snap to card width
          snapToAlignment="center"              // ✅ center cards
          decelerationRate="fast"               // ✅ smooth momentum
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
    </SafeAreaView>
  );
};

export default BestReviewedFood;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  container: {
    backgroundColor: "#fff",
    paddingVertical: deviceWidth * 0.04,
    paddingHorizontal: deviceWidth * 0.04,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: deviceWidth * 0.02,
    marginRight: deviceWidth * 0.01,
  },
  title: {
    fontSize: deviceWidth * 0.05,
    fontWeight: "700",
    color: "#e91313ff",
  },
  cardWrapper: {
    marginRight: deviceWidth * 0.04,
    width: deviceWidth * 0.55, // ✅ slightly wider for better snap
  },
  noProducts: {
    fontSize: deviceWidth * 0.04,
    color: "#666",
    textAlign: "center",
    paddingVertical: deviceWidth * 0.1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: deviceWidth * 0.04,
  },
});