import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
const DeliveryInfoScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Delivery Charges</Text>
        {/* Free Delivery Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Standard Delivery</Text>
          <Text style={[styles.amount, styles.free]}>Free</Text>
        </View>

        {/* Paid Delivery Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Express Delivery</Text>
          <Text style={styles.amount}>Rs. 5.00</Text>
        </View>

        {/* Extra Info Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Note</Text>
          <Text style={styles.info}>
            Orders above Rs. 50 get free standard delivery.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: width > 400 ? 24 : 20,
    fontWeight: 'bold',
    color: '#A62A22',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  free: {
    color: '#2196F3',
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
});

export default DeliveryInfoScreen;
