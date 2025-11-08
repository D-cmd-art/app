// components/RestaurantCard.js
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const { width: deviceWidth } = Dimensions.get("window");

const RestaurantCard = ({ restaurant }) => {
  const navigation = useNavigation();
  const photoUrl = restaurant?.photos?.[0];
  const rating = restaurant?.rating?.average ?? "N/A";
  const minTime = restaurant?.deliveryTime?.min ?? "-";
  const maxTime = restaurant?.deliveryTime?.max ?? "-";

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ResturantFood", {
            restaurantName: restaurant.name,
          })
        }
      >
        {photoUrl && (
          <>
            <Image source={{ uri: photoUrl }} style={styles.image} />
            <Image source={{ uri: photoUrl }} style={styles.logo} />
          </>
        )}
        <Text style={styles.name}>{restaurant.name}</Text>
        <View style={styles.details}>
          <Ionicons name="star" size={14} color="gold" />
          <Text style={styles.text}>{rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Ionicons name="time-outline" size={16} color="#052aa1ff" />
          <Text style={styles.text}>
            {minTime}-{maxTime} min
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default RestaurantCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f1f0eb",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: "#d1ced1ff",
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    top: 10,
    left: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
    color: "#333",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: 3,
    color: "#8088a1ff",
  },
  dot: {
    marginHorizontal: 5,
    color: "gray",
  },
});