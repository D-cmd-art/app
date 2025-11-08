import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';

// WalletCard Component
const WalletCard = ({ wallet, isSelected, onSelect }) => {
  const { name, color, icon, description } = wallet;

  const cardStyle = [
    styles.walletCard,
    { backgroundColor: name === 'Khalti' ? '#5D2E8E' : '#374151' },
    isSelected && {
      borderColor: color,
      borderWidth: 4,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={() => onSelect(wallet)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        {icon}
        <Text style={styles.walletName}>
          {name === 'Cash on Delivery' ? 'CoD' : name}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.descriptionType}>{description.type}</Text>
        <Text style={styles.descriptionDetail}>{description.detail}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Main App Component
const Wallets = () => {
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Wallet Icons as React Native SVG-like components (using simple View for demonstration)
  // In a real app, you'd use react-native-svg or icon libraries
  const WalletIcon = ({ size = 36, color = '#FFFFFF' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Simplified wallet icon representation */}
      <View style={[styles.iconBackground, { backgroundColor: color }]} />
    </View>
  );

  const CashIcon = ({ size = 36, color = '#FFFFFF' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Simplified cash icon representation */}
      <View style={[styles.iconBackground, { backgroundColor: color }]} />
    </View>
  );

  const walletOptions = [
    {
      id: 'khalti',
      name: 'Khalti',
      color: '#5D2E8E',
      icon: <WalletIcon />,
      description: {
        type: 'Digital Wallet',
        detail: 'Instant, secure mobile payments.',
      },
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      color: '#4A5568',
      icon: <CashIcon />,
      description: {
        type: 'Physical Payment',
        detail: 'Pay upon receiving the order.',
      },
    },
  ];

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainCard}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile Wallet Setup</Text>
            <Text style={styles.subtitle}>
              Choose one method to associate with your default payment profile.
            </Text>
          </View>

          {/* Wallet Selection Grid */}
          <View style={styles.walletGrid}>
            {walletOptions.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                isSelected={selectedWallet?.id === wallet.id}
                onSelect={handleSelectWallet}
              />
            ))}
          </View>

          {/* Selected Wallet Status Display */}
          <View
            style={[
              styles.selectionStatus,
              {
                backgroundColor: selectedWallet
                  ? `${selectedWallet.color}20`
                  : '#F3F4F6',
                borderLeftColor: selectedWallet
                  ? selectedWallet.color
                  : '#D1D5DB',
              },
            ]}
          >
            <Text style={styles.statusTitle}>Current Selection</Text>
            <Text
              style={[
                styles.statusName,
                { color: selectedWallet ? selectedWallet.color : '#1F2937' },
              ]}
            >
              {selectedWallet ? selectedWallet.name : 'Awaiting Selection...'}
            </Text>
            <Text style={styles.statusDescription}>
              {selectedWallet
                ? selectedWallet.description.detail
                : 'Click on Khalti or CoD above to select your primary payment method.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  walletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  walletCard: {
    flex: 1,
    minWidth: Dimensions.get('window').width * 0.35,
    minHeight: 160,
    borderRadius: 16,
    padding: 24,
    borderColor: 'transparent',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  cardContent: {
    marginTop: 16,
  },
  descriptionType: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    opacity: 0.8,
  },
  descriptionDetail: {
    fontSize: 12,
    color: 'white',
    opacity: 0.6,
    marginTop: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: 24,
    height: 24,
    borderRadius: 6,
    opacity: 0.8,
  },
  selectionStatus: {
    marginTop: 40,
    padding: 24,
    borderRadius: 12,
    borderLeftWidth: 6,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  statusName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default Wallets;