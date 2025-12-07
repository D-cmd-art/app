import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  ToastAndroid,
  Linking,
  BackHandler,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserStore } from '../utils/store/userStore';
import { useCartStore } from '../utils/store/cartStore';
import { useMapStore } from '../utils/store/mapStore';

import { useOrder } from '../hooks/useOrder';
import { useFreeDelivery } from '../hooks/useFreeDelivery';
import { isValidNepaliPhone } from '../utils/validation';

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getSuggestedDeliveryCharge(km) {
  if (km <= 1) return 20;
  if (km <= 2) return 30;
  if (km <= 3) return 40;
  if (km <= 4) return 50;
  return 60;
}

export default function ConfirmOrder() {
  const navigation = useNavigation();
  const { mutate } = useOrder();

  const user = useUserStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const location = useMapStore((s) => s.location);
  const setDistance = useMapStore((s) => s.setDistance);
  const distance = useMapStore((s) => s.distance);

  const userPhone = user?.phone || ''; // fetched from DB
  const [deliveryPhone, setDeliveryPhone] = useState(userPhone); // default editable phone

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [txnId, setTxnId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const userId = user?.id ?? 'no-user';
  const { data: freeDeliveryNumber = 0, refetch } = useFreeDelivery(userId);

  const restaurantLocation =
    items.length > 0 && items[0].restaurant
      ? {
          lat: parseFloat(
            items[0].restaurant.lat ?? items[0].restaurant.location?.lat
          ),
          lng: parseFloat(
            items[0].restaurant.lng ?? items[0].restaurant.location?.lng
          ),
        }
      : null;

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);

  // Calculate distance
  useEffect(() => {
    if (location && restaurantLocation) {
      const dist = getDistanceFromLatLonInKm(
        location.lat,
        location.lng,
        restaurantLocation.lat,
        restaurantLocation.lng
      );
      setDistance(dist);
    }
  }, [location, restaurantLocation]);

  // Calculate delivery charge
  useEffect(() => {
    if (!distance) return;
    setDeliveryCharge(freeDeliveryNumber > 0 ? 0 : getSuggestedDeliveryCharge(distance));
  }, [distance, freeDeliveryNumber]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * 0.02;
  const discountedTotal = subtotal - discount;
  const finalPrice = discountedTotal + deliveryCharge;

  const createOrderPayload = () => {
    if (!user || !location) {
      Alert.alert('Error', 'Please select your delivery location.');
      return null;
    }
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty.');
      return null;
    }
    if (!isValidNepaliPhone(deliveryPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid Nepali delivery phone number.');
      return null;
    }
    if (paymentMethod === 'cash' && subtotal > 3000) {
      Alert.alert('Restriction', 'Cannot place orders above NPR 3000 using COD.');
      return null;
    }
    if (paymentMethod === 'QRPAY' && (!txnId.trim() || !note.trim())) {
      Alert.alert('Required', 'Please enter transaction details.');
      return null;
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: userPhone, // registered user phone
      },
      location: {
        name: location.address,
        lat: location.lat,
        lng: location.lng,
      },
      totalPayment: parseFloat(finalPrice),
      deliveryCharge,
      products: items.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      })),
      status: paymentMethod === 'QRPAY' ? 'paid' : 'unpaid',
      deliveryNumber: deliveryPhone, // user-entered delivery phone
      payment_method: paymentMethod,
      ...(paymentMethod === 'QRPAY' && { transactionId: txnId, note }),
    };

    console.log('📦 Order Payload:', JSON.stringify(payload, null, 2));
    return payload;
  };

  const handleConfirm = async () => {
    if (finalPrice > 3000 && paymentMethod === 'cash') {
      ToastAndroid.show(
        '❌ Cannot order more than Rs. 3000 Through COD',
        ToastAndroid.LONG
      );
      return;
    }

    const payload = createOrderPayload();
    if (!payload) return;

    setLoading(true);

    mutate(payload, {
      onSuccess: async () => {
        setLoading(false);
        Alert.alert('Success', 'Order placed successfully!');
        clearCart();
        await refetch();

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs' }], // replace 'Tabs' with your home page
          })
        );
      },
      onError: (error) => {
        setLoading(false);
        Alert.alert('Failed', error?.response?.data?.message || 'Something went wrong.');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Confirm Your Order</Text>

        {freeDeliveryNumber > 0 ? (
          <Text style={styles.freeText}>
            🎉 Free Deliveries Left: {freeDeliveryNumber}
          </Text>
        ) : (
          <View style={styles.tableBox}>
            <Text style={styles.tableTitle}>Delivery Charges</Text>
            {[1, 2, 3, 4].map((km) => (
              <View key={km} style={styles.tableRow}>
                <Text>{km} km</Text>
                <Text>{getSuggestedDeliveryCharge(km)} NPR</Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text>5+ km</Text>
              <Text>60 NPR</Text>
            </View>
          </View>
        )}

        <View style={styles.box}>
          <Text style={styles.title}>Delivery Location</Text>
          <Text style={styles.detail}>{location?.address || 'No location selected'}</Text>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => navigation.navigate('MapPicker')}
          >
            <Text style={styles.mapBtnText}>📍 Choose Location on Map</Text>
          </TouchableOpacity>
        </View>

        

        <View style={styles.box}>
          <Text style={styles.title}>Delivery Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter delivery phone number"
            value={deliveryPhone}
            onChangeText={setDeliveryPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.box}>
          <Text style={styles.title}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.radio, paymentMethod === 'cash' && styles.selected]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Text>💵 Cash on Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radio, paymentMethod === 'QRPAY' && styles.selected]}
            onPress={() => setPaymentMethod('QRPAY')}
          >
            <Text>📱 Pay with QRPAY</Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === 'QRPAY' && (
          <View style={styles.box}>
            <Text style={styles.note}>Add Fund via QRPAY, eSewa, Khalti, IMEPay or Mobile Banking</Text>
            <Image source={require('../assets/QR.jpeg')} style={styles.QRPAY} />
            <Text style={styles.title}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={note}
              onChangeText={setNote}
            />
            <Text style={styles.title}>Transaction ID</Text>
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Enter transaction ID"
              value={txnId}
              onChangeText={setTxnId}
            />
            <Text style={styles.note}>NOTE: After payment, share a screenshot on WhatsApp</Text>

            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() => {
                if (!note.trim() || !txnId.trim()) {
                  Alert.alert(
                    'Required',
                    'Please enter account holder name and transaction ID before contacting via WhatsApp.'
                  );
                  return;
                }
                const phoneNumber = '9709095168';
                const message = `Hello, I have completed the payment.\nAccount Holder Name: ${note}\nTransaction ID: ${txnId}`;
                const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
                Linking.openURL(url).catch(() => {
                  Alert.alert('Error', 'Make sure WhatsApp is installed on your device.');
                });
              }}
            >
              <Text style={styles.whatsappText}>💬 Contact via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.box}>
          <Text style={styles.sectionTitle}>🛍️ Cart Items</Text>
          {items.map((item) => (
            <View key={item._id} style={styles.cartRow}>
              <Text style={styles.cartItem}>
                {item.name} x {item.quantity}
              </Text>
              <Text style={styles.cartPrice}>Rs. {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>🛒 Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount (2%)</Text>
            <Text style={styles.summaryValue}>- Rs. {discount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charge</Text>
            <Text style={styles.summaryValue}>
              {deliveryCharge === 0 ? 'Free' : `Rs. ${deliveryCharge.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.finalLabel}>Grand Total</Text>
            <Text style={styles.finalValue}>Rs. {finalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleConfirm}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>CONFIRM ORDER</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#333' },
  box: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#444' },
  detail: { fontSize: 15, color: '#555' },
  note: { fontSize: 15, fontWeight: '600', color: '#ff2e2eff', marginVertical: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 15, backgroundColor: '#fafafa' },
  mapBtn: { marginTop: 10, backgroundColor: '#fa6109ff', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  mapBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  radio: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 6, backgroundColor: '#fafafa' },
  selected: { borderColor: '#ec4b00ff', backgroundColor: '#ffe6e6' },
  QRPAY: { width: 180, height: 180, alignSelf: 'center', marginVertical: 12 },
  freeText: { fontSize: 16, fontWeight: '600', color: 'green', marginBottom: 12, textAlign: 'center' },
  tableBox: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  tableTitle: { fontWeight: '600', marginBottom: 8, fontSize: 15 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10, color: '#333' },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  cartItem: { fontSize: 15, color: '#555' },
  cartPrice: { fontSize: 15, fontWeight: '600', color: '#333' },
  summaryBox: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginTop: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  summaryLabel: { fontSize: 15, color: '#555' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 8 },
  finalLabel: { fontSize: 16, fontWeight: '700', color: '#222' },
  finalValue: { fontSize: 18, fontWeight: 'bold', color: '#f80707ff' },
  confirmBtn: { backgroundColor: '#ff0707ff', padding: 16, borderRadius: 10, margin: 16, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  whatsappBtn: { backgroundColor: '#25D366', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  whatsappText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
