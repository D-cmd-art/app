import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { isValidEmail } from '../utils/validation';
import { useForgot } from '../hooks/useForget';

// Prevents "Object is not valid as a React child" crash
const safeText = (value) =>
  typeof value === 'string' ? value : JSON.stringify(value || '');

export default function Forgot() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const { mutate, isPending } = useForgot({
    onSuccess: (res) => {
      Toast.show({
        type: 'success',
        text1: '✅ Reset Link Sent',
        text2: safeText(res?.message || 'Check your inbox for reset instructions.'),
      });
      setEmail('');
    },

    onError: (err) => {
      const backendMsg = err?.response?.data?.message;
      const msgLower = typeof backendMsg === 'string' ? backendMsg.toLowerCase() : '';

      let title = '⚠️ Error';
      let desc = 'Please try again later.';

      if (msgLower.includes('not found')) {
        title = '❌ Email Not Found';
        desc = 'We couldn’t find an account with that email.';
      } else if (backendMsg) {
        desc = safeText(backendMsg);
      }

      Toast.show({
        type: 'error',
        text1: title,
        text2: safeText(desc),
      });
    },
  });

  const handleForgot = () => {
    if (!isValidEmail(email)) {
      setError('A valid email is required.');
      return;
    }
    setError('');
    mutate({ email });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>Bhok Express</Text>
        <Text style={styles.subtitle}>Reset your password</Text>

        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.description}>
          Enter your email and we'll send you a reset link
        </Text>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, isPending && { opacity: 0.7 }]}
          onPress={handleForgot}
          disabled={isPending}
        >
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <Text style={styles.footerText}>
          Remembered your password?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Login here
          </Text>
        </Text>
      </View>

      {/* Loading Modal */}
      <Modal transparent visible={isPending} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#ee1212ff" />
            <Text style={styles.loadingText}>Processing your request...</Text>
          </View>
        </View>
      </Modal>

      <Toast />
    </KeyboardAvoidingView>
  );
}

/* ----------------------------------
            STYLES
---------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ee1212ff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  error: {
    color: '#ee1212ff',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#ee1212ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#141010ff',
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: '#ee1212ff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
});
