// src/pages/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';

export default function SplashScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo bounce animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // Rotating circle animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login'); // or 'Home' if user is logged in
    }, 30000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.circle,
            { transform: [{ rotate: rotateInterpolation }] },
          ]}
        />
        <Animated.Image
          source={require('../assets/applogo.png')} // replace with your logo
          style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
        />
      </View>
   
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f00c0cff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#fff',
    borderTopColor: 'transparent', // makes it look like a spinning loader
    position: 'absolute',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 40,
  },
});
