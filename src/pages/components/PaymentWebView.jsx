import React from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PaymentWebView() {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentUrl } = route.params;

  const handleNavigationChange = (event) => {
    // Detect success/failure redirect URLs
    if (event.url.includes('payment-success')) {
      navigation.replace('PaymentSuccess');
    } else if (event.url.includes('payment-failed')) {
      navigation.goBack();
    }
  };

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={handleNavigationChange}
      startInLoadingState
    />
  );
}
