import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const CashbackSystem = () => {
    const navigation=useNavigation();
  const cashbackBalance = 120; // Example balance in NPR
  const transactions = [
    { id: 1, title: 'Order #1234', amount: 20, date: 'Oct 5, 2025' },
    { id: 2, title: 'Order #1220', amount: 15, date: 'Oct 2, 2025' },
    { id: 3, title: 'Promo Bonus', amount: 50, date: 'Sep 28, 2025' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#000" />
                  </TouchableOpacity>
        <Text style={styles.headerTitle}>Cashback Wallet</Text>
        <Ionicons name="wallet-outline" size={24} color="#000" />
      </View>

      {/* Balance Section */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Cashback Balance</Text>
        <Text style={styles.balanceAmount}>Rs. {cashbackBalance}</Text>
        <TouchableOpacity style={styles.redeemButton}>
          <Text style={styles.redeemText}>Redeem Cashback</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <Text style={styles.sectionTitle}>Recent Cashback Activity</Text>
      <ScrollView style={styles.transactionList}>
        {transactions.map(tx => (
          <View key={tx.id} style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionTitle}>{tx.title}</Text>
              <Text style={styles.transactionDate}>{tx.date}</Text>
            </View>
            <Text style={styles.transactionAmount}>+ Rs. {tx.amount}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CashbackSystem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#777',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 10,
  },
  redeemButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 13,
    color: '#888',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});