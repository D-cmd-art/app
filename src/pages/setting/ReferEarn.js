import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const ReferAndEarn = () => {
  const navigation = useNavigation();
  const referralCode = 'FOOD123';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="gift-outline" size={60} color="#fff" />
          <Text style={styles.bannerText}>Invite friends & earn rewards!</Text>
        </View>

        {/* Referral Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.code}>{referralCode}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.step}>
          <Ionicons name="person-add-outline" size={24} color="#2e7d32" />
          <Text style={styles.stepText}>Invite your friends using your referral code.</Text>
        </View>
        <View style={styles.step}>
          <Ionicons name="fast-food-outline" size={24} color="#2e7d32" />
          <Text style={styles.stepText}>They place their first order.</Text>
        </View>
        <View style={styles.step}>
          <Ionicons name="cash-outline" size={24} color="#2e7d32" />
          <Text style={styles.stepText}>You both earn Rs. 50 cashback!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReferAndEarn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  banner: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  codeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 16,
    color: '#777',
  },
  code: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 10,
  },
  shareButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  shareText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
});