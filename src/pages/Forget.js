import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail } from '../utils/validation'; // replicate your validation logic
import { useForgot } from '../hooks/useForget'; // same hook logic
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function Forgot() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ email: '' });

  const { mutate, isLoading } = useForgot({
    onSuccess: (resData) => {
      Toast.show({ type: 'success', text1: resData.message });
      setEmail('');
    },
    onError: (error) => {
      Toast.show({ type: 'error', text1: error?.response?.data?.error || 'Something went wrong' });
    },
  });

  const handleForgot = () => {
    let newErrors = {};
    if (!isValidEmail(email)) {
      newErrors.email = 'A valid email is required.';
      setErrors(newErrors);
    }
    if (Object.keys(newErrors).length === 0) {
      mutate({ email });
    }
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleForgot}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Remembered your password?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Login here
          </Text>
        </Text>
      </View>
      <Toast />
    </KeyboardAvoidingView>
  );
}
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
    color: '#A62A22',
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
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#A62A22',
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
    color: '#A62A22',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});