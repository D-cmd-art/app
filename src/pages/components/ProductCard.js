import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useFavourites, useFavouritesList } from "../../hooks/useFavourites";
import { useUserStore } from "../../utils/store/userStore";
import { useCartStore } from "../../utils/store/cartStore";

const ProductCard = ({ item, onPress, onFavouriteUpdate }) => {
  const [isFavourite, setIsFavourite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const photoUrl = item?.photos?.[0];
  const { user } = useUserStore();
  const productId = item.id ?? item._id ?? item.name ?? "unknown";
  const { addItem } = useCartStore();
  const { mutate } = useFavourites();
  const { data } = useFavouritesList(user?.id) || {};

  useEffect(() => {
    if (data && data.productIds) {
      const isFav = data.productIds.includes(item._id);
      setIsFavourite(isFav);
    }
  }, [data, item._id]);

  const ToggleFavourite = () => {
    const newState = !isFavourite;
    setIsFavourite(newState);
    mutate(
      {
        userId: user.id,
        productId: item._id,
        restaurantId: null,
        isFavourite: newState,
      },
      {
        onError: (error) => {
          setIsFavourite(!newState);
        },
        onSuccess: (resData) => {
          if (onFavouriteUpdate) {
            onFavouriteUpdate();
          }
        },
      }
    );
  };

  function handleCart() {
    addItem(item);
    setAddedToCart(true);

    // auto-hide the message after a delay
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  }

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Ionicons
        key={`star-${i}`}
        name="star"
        size={16}
        color={i < rating ? "gold" : "lightgray"}
      />
    ));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <TouchableOpacity style={styles.favoriteBtn} onPress={ToggleFavourite}>
        <Ionicons
          name={isFavourite ? "heart" : "heart-outline"}
          size={20}
          color="red"
        />
      </TouchableOpacity>

      <Image source={{ uri: photoUrl }} style={styles.image} />

      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.rating}>{renderStars(item.rating.average)}</View>
        <Text style={styles.price}>Rs. {item.price}</Text>

        <TouchableOpacity style={styles.button} onPress={handleCart}>
          <Text style={styles.buttonText}>Add to cart</Text>
        </TouchableOpacity>

        {addedToCart && (
          <View style={styles.addedMessageContainer}>
            <Text style={styles.addedMessageText}>Added to cart ✔</Text>
          </View>
        )}

      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },
  favoriteBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 4,
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  rating: {
    flexDirection: "row",
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: "green",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#92400e",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  addedMessageContainer: {
    marginTop: 8,
    backgroundColor: '#e0ffe0',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addedMessageText: {
    color: '#006400',
    fontSize: 14,
    fontWeight: '500',
  },
});
