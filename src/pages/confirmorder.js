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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../utils/store/userStore';
import { useCartStore } from '../utils/store/cartStore';
import { useMapStore } from '../utils/store/mapStore';
import { useOrder } from '../hooks/useOrder';
import { SafeAreaView } from 'react-native-safe-area-context';

const DELIVERY_SLOTS = [
  { label: 'Select Delivery Time', value: '' },
  { label: 'Within 45 Mins', value: '45 min' },
  { label: '1 Hour Slot', value: '1_HOUR' },
  { label: '2 Hour Slot', value: '2_HOUR' },
];

const PAYMENT_OPTIONS = [
  { key: 'cashondelivery', label: '💵 Cash on Delivery (COD)' },
  { key: 'esewa', label: '📱 Esewa (Digital Payment)' },
];

export default function ConfirmOrder() {
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0].key);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [phone, setPhone] = useState('');
  const [esewaName, setEsewaName] = useState('');
  const [esewaTxn, setEsewaTxn] = useState('');

  const { mutate } = useOrder();
  const navigation = useNavigation();
  const user = useUserStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const location = useMapStore((state) => state.location);

  const CART_SubTOTAL = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const CART_DISCOUNT = CART_SubTOTAL * 0.1; // 10% discount
  const CART_TOTAL = CART_SubTOTAL - CART_DISCOUNT;
  // Hardware back button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  const createOrderPayload = () => {
    if (!deliveryTime || !phone) {
      Alert.alert('Missing Info', 'Please fill all required fields.');
      return null;
    }

    return {
      user: { name: user.name, id: user.id, phone, email: user.email },
      location: { name: location.address, lat: location.latitude, lng: location.longitude },
      totalPayment: parseFloat(CART_TOTAL),
      products: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
      status: paymentMethod === 'cashondelivery' ? 'unpaid' : 'pending',
      deliveryNumber: phone,
      payment_method: paymentMethod,
      esewaName,
      esewaTxn,
    };
  };

  const handleConfirmOrder = () => {
    const payload = createOrderPayload();
    if (!payload) return;

    mutate(payload, {
      onSuccess: () => {
        Alert.alert('Order Placed', 'Your order has been placed!');
        clearCart();
        navigation.navigate('Tabs');
      },
      onError: () => {
        Alert.alert('Order Failed', 'Something went wrong.');
      },
    });
  };

  const handleWhatsAppRedirect = () => {
    const message = `Esewa Payment\nName: ${esewaName}\nTransaction ID: ${esewaTxn}`;
    const phoneNumber = '9709095168'; // Replace with your WhatsApp number
    Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
  };

  return (
   < SafeAreaView style={styles.container} >
    <View >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Confirm Your Order</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Info</Text>
          <Text style={styles.detail}>Name: {user.name}</Text>
          <Text style={styles.detail}>Email: {user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.detail}>{location.address}</Text>
        </View>

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

        {paymentMethod === 'esewa' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Esewa Payment</Text>
            <Image
              source={require('../assets/applogo.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <Text> Esewa Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={esewaName}
              onChangeText={setEsewaName}
            />
            <Text> Transaction ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Transaction ID"
              value={esewaTxn}
              onChangeText={setEsewaTxn}
            />
            <Text style={styles.noteText}>
              Note: Use the QR code, pay via Esewa, then send screenshot on WhatsApp before confirming.
            </Text>
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppRedirect}>
              <Text style={styles.whatsappText}>Send to WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Time</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={deliveryTime} onValueChange={setDeliveryTime} style={styles.picker}>
              {DELIVERY_SLOTS.map((slot) => (
                <Picker.Item key={slot.value} label={slot.label} value={slot.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalAmount}>Rs. {CART_TOTAL.toFixed(2)}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
        <Text style={styles.confirmText}>CONFIRM ORDER</Text>
      </TouchableOpacity>
    </View></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
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
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginBottom: 10 },
  detail: { fontSize: 15, color: '#444', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, backgroundColor: '#fff', marginBottom: 10 },
  radio: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 10, backgroundColor: '#fff' },
  radioSelected: { borderColor: '#007AFF', backgroundColor: '#e6f2ff' },
  radioText: { fontSize: 16, fontWeight: '500', color: '#333' },
  qrImage: { width: 200, height: 200, alignSelf: 'center', marginVertical: 10 },
  noteText: { color: '#ff0000' },
  whatsappButton: { backgroundColor: '#25D366', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  whatsappText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, overflow: 'hidden', backgroundColor: '#fff' },
  picker: { height: 50, width: '100%', color: '#333' },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 10 },
  totalText: { fontSize: 18, fontWeight: '500', color: '#333' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  confirmButton: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FF5733', paddingVertical: 18, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
