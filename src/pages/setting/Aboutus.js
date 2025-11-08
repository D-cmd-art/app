// screens/TermsAndConditions.js

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

const Aboutus = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ABOUT US</Text>
        <View style={{ width: 28 }} >
          <Ionicons name="alert-circle"size={24}  color="#fa0606ff" />
        </View>
       
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>About us</Text>
        {/* Section: Introduction */}
        <Text style={styles.sectionHeading}></Text>
        <Text style={styles.text}>
         Welcome to Bhok Express, your go-to food delivery app designed to bring delicious meals from your favorite restaurants straight to your doorstep.
          Whether you're craving spicy momos, gourmet burgers, or a healthy salad, we've got you covered.{'\n'}{'\n'}
              With lightning-fast delivery, real-time order tracking, and a curated selection of eateries, we make mealtime effortless. Our mission is simple: to connect food lovers with the best local flavors—quickly, reliably, and affordably.
We’re proud to support local businesses and offer eco-friendly packaging options to help reduce waste. Hungry? Let’s get you fed.
        </Text>
      </ScrollView>
    </View></SafeAreaView>
  );
};

export default Aboutus;

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

    textAlign: 'left',
    fontStyle:'italic',
    marginBottom: 16,
    color: '#110e0eff',
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
    marginLeft:15,
    color: '#000000ff',
    fontWeight:'500',
   
    paddingLeft:15,
    paddingRight:15,
    lineHeight: 20,
    color: '#555',
    marginBottom: 8,
  },
});
