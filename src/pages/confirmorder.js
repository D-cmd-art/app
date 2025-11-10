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
  Linking,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserStore } from '../utils/store/userStore';
import { useCartStore } from '../utils/store/cartStore';
import { useMapStore } from '../utils/store/mapStore';
import { useOrder } from '../hooks/useOrder';

const PAYMENT_OPTIONS = [
  { key: 'cashondelivery', label: '💵 Cash on Delivery (COD)' },
  { key: 'QRPAY', label: '📱 Pay with QR' },
];

export default function ConfirmOrder() {
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0].key);
  const [phone, setPhone] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  const { mutate } = useOrder(); // ✅ hook at top level
  const navigation = useNavigation();
  const user = useUserStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const location = useMapStore((state) => state.location);

  const CART_SUBTOTAL = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const CART_DISCOUNT = CART_SUBTOTAL * 0.02;
  const CART_TOTAL = CART_SUBTOTAL - CART_DISCOUNT;

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const createOrderPayload = () => {
    if (!phone) {
      Alert.alert('Missing Info', 'Please enter your phone number.');
      return null;
    }

    if (paymentMethod === 'QRPAY' && !remark) {
      Alert.alert('Missing Info', 'Please enter your username in Remarks.');
      return null;
    }

    const status = paymentMethod === 'cashondelivery' ? 'unpaid' : 'paid';

    const payload = {
      user: { name: user.name, id: user.id, phone: user.phone, email: user.email },
      location: { name: location.address, lat: location.latitude, lng: location.longitude },
      totalPayment: parseFloat(CART_TOTAL),
      products: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
      status,
      deliveryNumber: phone,
      payment_method: paymentMethod,
    };

    if (paymentMethod === 'QRPAY') payload.Remark = remark;

    return payload;
  };

  const handleConfirmOrder = () => {
    const payload = createOrderPayload();
    if (!payload) return;

    setLoading(true);

    mutate(payload, {
      onSuccess: () => {
        setLoading(false);
        Alert.alert('Order Placed', 'Your order has been placed!');
        clearCart();
        navigation.navigate('Tabs');
      },
      onError: () => {
        setLoading(false);
        Alert.alert('Order Failed', 'Something went wrong.');
      },
    });
  };

  const handleWhatsAppRedirect = () => {
    const message = `QRPAY Payment details: ${remark}`;
    const phoneNumber = '9709095168';
    Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>Confirm Your Order</Text>

          {/* User Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Info</Text>
            <Text style={styles.detail}>Name: {user.name}</Text>
            <Text style={styles.detail}>Email: {user.email}</Text>
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.detail}>{location.address}</Text>
          </View>

          {/* Phone Number */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {PAYMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.radio, paymentMethod === option.key && styles.radioSelected]}
                onPress={() => setPaymentMethod(option.key)}
              >
                <Text style={styles.radioText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* QRPAY Section */}
          {paymentMethod === 'QRPAY' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Add Funds via QRPAY, Imepay, Khalti or Mobile Banking
              </Text>
              <Image source={require('../assets/QR.jpg')} style={styles.qrImage} resizeMode="contain" />
              <Text>Remarks</Text>
              <TextInput
                style={styles.Remarksinput}
                placeholder="Write your username"
                value={remark}
                onChangeText={setRemark}
              />
              <Text style={styles.noteText}>
                Note: After payment, share a screenshot on our WhatsApp
              </Text>
              <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppRedirect}>
                <Text style={styles.whatsappText}>Send to WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>Rs. {CART_TOTAL.toFixed(2)}</Text>
          </View>
        </ScrollView>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, loading && { opacity: 0.7 }]}
          onPress={handleConfirmOrder}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.confirmText}>CONFIRM ORDER</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingBottom: Platform.OS === 'ios' ? 30 : 0 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  header: { fontSize: width > 400 ? 24 : 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: width > 400 ? 16 : 14, fontWeight: '600', color: '#A62A22', marginBottom: 6 },
  detail: { fontSize: 15, color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  Remarksinput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  radio: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 10, backgroundColor: '#fff' },
  radioSelected: { borderColor: '#007AFF', backgroundColor: '#e6f2ff' },
  radioText: { fontSize: 16, fontWeight: '500', color: '#333' },
  qrImage: { width: 200, height: 200, alignSelf: 'center', marginVertical: 10 },
  noteText: { color: '#ff0000' },
  whatsappButton: { backgroundColor: '#25D366', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  whatsappText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 0.5, borderTopWidth: 0.5, borderTopColor: '#aa1212ff', marginTop: width > 400 ? 10 : 12 },
  totalText: { fontSize: 18, fontWeight: '500', color: '#333' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  confirmButton: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FF5733', paddingVertical: 18, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
