// MapPicker.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { useMapStore } from '../../utils/store/mapStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

const { width } = Dimensions.get('window');
const defaultLocation = { latitude: 26.664578, longitude:  87.693876 }; // Damak

// 🔹 Request location permission (works for both Android & iOS)
const requestLocationPermission = async () => {
  try {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const result = await request(permission);
    return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
  } catch (error) {
    console.warn('Permission error:', error);
    return false;
  }
};

const MapPicker = () => {
  const navigation = useNavigation();
  const webRef = useRef(null);
  const { setLocation } = useMapStore();

  const [webReady, setWebReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAddress, setCurrentAddress] = useState('Fetching location...');
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 🔹 Debounce utility
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // 🔹 HTML for Leaflet map
  const leafletHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height:100%; margin:0; padding:0; }
      .location-marker { background:#2f9e44; border-radius:50%; width:24px; height:24px; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3); }
      .location-popup { font-family:Arial; font-size:14px; text-align:center; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      let map, marker;
      function initMap(lat, lng) {
        map = L.map('map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);
        marker = L.marker([lat, lng], { draggable:true, icon: L.divIcon({className:'location-marker'}) }).addTo(map);
        marker.on('dragend', function() {
          const pos = marker.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type:'locationSelected',
            latitude:pos.lat,
            longitude:pos.lng
          }));
        });
      }
      document.addEventListener('message', e => {
        const data = JSON.parse(e.data);
        if (data.type === 'setCurrentLocation') {
          if (!map) initMap(data.lat, data.lng);
          else {
            marker.setLatLng([data.lat, data.lng]);
            map.setView([data.lat, data.lng]);
          }
        }
      });
      initMap(${defaultLocation.latitude}, ${defaultLocation.longitude});
    </script>
  </body>
  </html>`;

  // 🔹 Reverse geocoding (debounced)
  const debouncedGetAddress = useCallback(
    debounce(async (lat, lng) => {
      setIsGettingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
          headers: { 'User-Agent': 'ReactNativeApp/1.0', 'Accept-Language': 'en' },
        });
        const data = await res.json();
        const display = data.display_name || 'Unknown location';
        setCurrentAddress(display);
      } catch {
        setCurrentAddress('Location selected');
      } finally {
        setIsGettingAddress(false);
      }
    }, 500),
    []
  );

  // 🔹 Get current location
  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
     
      setSelectedLocation(defaultLocation);
      sendLocationToWebView(defaultLocation.latitude, defaultLocation.longitude);
      setCurrentAddress('Damak');
      setLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedLocation({ latitude, longitude });
        sendLocationToWebView(latitude, longitude);
        debouncedGetAddress(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        console.log('Location error:', err);
        Alert.alert('Location ', 'Move marker to Select Your current location');
        setSelectedLocation(defaultLocation);
        sendLocationToWebView(defaultLocation.latitude, defaultLocation.longitude);
        setCurrentAddress('Damak');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [debouncedGetAddress]);

  // 🔹 Send location to WebView
  const sendLocationToWebView = useCallback((lat, lng) => {
    if (webRef.current && webReady) {
      webRef.current.postMessage(JSON.stringify({ type: 'setCurrentLocation', lat, lng }));
    }
  }, [webReady]);

  // 🔹 WebView message handler
  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected') {
        const newLoc = { latitude: data.latitude, longitude: data.longitude };
        setSelectedLocation(newLoc);
        debouncedGetAddress(data.latitude, data.longitude);
      }
    } catch (e) {
      console.log('WebView message error:', e);
    }
  }, [debouncedGetAddress]);

  // 🔹 Save selected location
  const handleSetLocation = useCallback(() => {
    if (!selectedLocation) {
      Alert.alert('Please wait', 'Fetching location...');
      return;
    }
    setLocation({
      ...selectedLocation,
      address: currentAddress,
      timestamp: new Date().toISOString(),
    });
    Alert.alert('Saved', 'Location saved successfully!');
    navigation.goBack();
  }, [selectedLocation, currentAddress, setLocation, navigation]);

  // 🔹 Lifecycle
  useEffect(() => { getCurrentLocation(); }, [getCurrentLocation]);
  useEffect(() => {
    if (webReady && selectedLocation)
      sendLocationToWebView(selectedLocation.latitude, selectedLocation.longitude);
  }, [webReady, selectedLocation, sendLocationToWebView]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSetLocation}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Address display */}
      <View style={styles.addressBar}>
        <Icon name="map-pin" size={16} color="#2f9e44" />
        <Text style={styles.addressText} numberOfLines={1}>
          {currentAddress}
        </Text>
        {isGettingAddress && <ActivityIndicator size="small" color="#2f9e44" style={{ marginLeft: 6 }} />}
      </View>

      {/* WebView map */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2f9e44" />
          <Text>Finding location...</Text>
        </View>
      ) : (
        <WebView
          ref={webRef}
          source={{ html: leafletHTML }}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => setWebReady(true)}
          originWhitelist={['*']}
          javaScriptEnabled
          style={styles.webview}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  saveBtn: {
    backgroundColor: '#2f9e44',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9f7ef',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    color: '#2f9e44',
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: { flex: 1, width },
});

export default MapPicker;
