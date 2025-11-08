import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PaymentSuccess() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ Payment Successful!</Text>
      <Button title="Back to Home" onPress={() => navigation.navigate('Tabs')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});
