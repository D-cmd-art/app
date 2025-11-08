import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ReferAndEarn = () => {
    const navigation=useNavigation();
  const referralCode = 'FOOD123';

  return (
    <View style={styles.card}>
        <TouchableOpacity onPress={() => navigation.navigate('ReferAndEarn')}>
      <View style={styles.header}>
        <Ionicons name="gift-outline" size={28} color="#2e7d32" />
        <Text style={styles.title}>Refer & Earn</Text>
      </View>

      <Text style={styles.description}>
        Invite your friends and earn Rs. 50 cashback when they place their first order!
      </Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Your Code</Text>
        <Text style={styles.code}>{referralCode}</Text>
      </View>

      <TouchableOpacity style={styles.shareButton}>
        <Text style={styles.shareText}>Share Referral Code</Text>
      </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

export default ReferAndEarn;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    marginVertical: 20,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2e7d32',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: '#f1f8f4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 13,
    color: '#777',
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  shareButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareText: {
    color: '#fff',
    fontWeight: '600',
  },
});