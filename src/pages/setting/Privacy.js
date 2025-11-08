// screens/PrivacyPolicy.js

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Privacy Policy – Bhok Express</Text>

          <Text style={styles.sectionHeading}>1. Introduction</Text>
          <Text style={styles.text}>
            At Bhok Express, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our services.
          </Text>

          <Text style={styles.sectionHeading}>2. Information We Collect</Text>
          <Text style={styles.text}>
            • Personal Information: Name, email, phone number, address, profile photo.{'\n'}
            • Payment Information: Card details, e-wallet data (processed securely).{'\n'}
            • Location Data: For delivery tracking and optimization.{'\n'}
            • Usage Data: App interactions and device info.
          </Text>

          <Text style={styles.sectionHeading}>3. How We Use Your Information</Text>
          <Text style={styles.text}>
            • Process orders and deliveries.{'\n'}
            • Improve app functionality.{'\n'}
            • Communicate updates and support.{'\n'}
            • Comply with Nepalese legal obligations.
          </Text>

          <Text style={styles.sectionHeading}>4. Sharing Your Information</Text>
          <Text style={styles.text}>
            • With delivery partners and restaurants.{'\n'}
            • With payment processors.{'\n'}
            • With government authorities if required by law.{'\n'}
            We do not sell your personal data.
          </Text>

          <Text style={styles.sectionHeading}>5. Data Security</Text>
          <Text style={styles.text}>
            We use industry-standard security measures to protect your data. However, no method of transmission is 100% secure.
          </Text>

          <Text style={styles.sectionHeading}>6. Your Rights</Text>
          <Text style={styles.text}>
            • Access and update your data.{'\n'}
            • Request account deletion.{'\n'}
            • Opt out of promotional messages.
          </Text>

          <Text style={styles.sectionHeading}>7. Cookies and Tracking</Text>
          <Text style={styles.text}>
            We may use cookies to enhance your experience. You can manage preferences in your device settings.
          </Text>

          <Text style={styles.sectionHeading}>8. Third-Party Links</Text>
          <Text style={styles.text}>
            Our app may contain links to external sites. We are not responsible for their privacy practices.
          </Text>

          <Text style={styles.sectionHeading}>9. Changes to This Policy</Text>
          <Text style={styles.text}>
            We may update this policy. Continued use of the app implies acceptance of changes.
          </Text>

          <Text style={styles.sectionHeading}>10. Contact Us</Text>
          <Text style={styles.text}>
            📧 bhokexpress@gmail.com{'\n'}
            📞 9709095168{'\n'}
            📍 Damak,Jhapa, Nepal
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1b1a1aff',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    color: '#222',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 8,
  },
});