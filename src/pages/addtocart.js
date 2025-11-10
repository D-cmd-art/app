import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useCartStore } from "../utils/store/cartStore";
import Toast from "react-native-toast-message";
const { width } = Dimensions.get("window");

const Addtocart = () => {
  const navigation = useNavigation();
  const { items, removeItem, decreaseItem, addItem } = useCartStore();

  // Calculate total and discount
  const Subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Subtotal * 0.02; // 10% discount
  const total = Subtotal - discount;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.photos?.[0] }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
       
        <Text style={styles.price}>Rs. {item.price.toFixed(2)}</Text>
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => decreaseItem(item._id)} style={styles.qtyBtn}>
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => addItem(item)} style={styles.qtyBtn}>
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.trashBtn}>
            <Ionicons name="trash-outline" size={22} color="#FF4D4D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Cart</Text>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 150 }}
          />

          {/* Confirm Order Section */}
          <View style={styles.confirmSection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Sub Total</Text>
              <Text style={styles.summaryText}>Rs. {Subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Discount</Text>
              <Text style={[styles.summaryText, { color: "#e4040448" }]}>- Rs. {discount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryText, styles.finalTotal]}> Total</Text>
              <Text style={[styles.summaryText, styles.finalTotal]}>Rs. {total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => navigation.navigate("ConfirmOrder")}
            >
              <Text style={styles.confirmBtnText}>Confirm Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Addtocart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f1f1ff",
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
    color: "#333",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 10,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  price: {
    fontSize: 15,
    color: "green",
    marginVertical: 6,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyBtn: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  trashBtn: {
    marginLeft: 12,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
  },
  confirmSection: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: width * 0.12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  summaryText: {
    fontSize: 16,
    color: "#363638ff",
  },
  finalTotal: {
    fontWeight: "bold",
    fontSize: 18,
  },
  confirmBtn: {
    marginTop: 10,
    backgroundColor: "#28A745",
    paddingVertical: 14,
   paddingBottom: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
