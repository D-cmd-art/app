// MapPicker.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useMapStore } from '../../utils/store/mapStore';
import { SafeAreaView } from 'react-native-safe-area-context';

// CORRECT GEOLOCATION IMPORT
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');
const defaultLocation = { latitude: 26.664578, longitude: 87.693876 }; // Damak

const MapPicker = () => {
  const navigation = useNavigation();
  const webRef = useRef(null);
  const { setLocation } = useMapStore();

  const [webReady, setWebReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [currentAddress, setCurrentAddress] = useState('Finding your location...');
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true); // Start with loading true
  const [autoLocationFetched, setAutoLocationFetched] = useState(false);

  // Send location to WebView
  const sendLocationToWebView = useCallback((lat, lng) => {
    if (webRef.current && webReady) {
      setTimeout(() => {
        try {
          const message = JSON.stringify({ 
            type: 'setCurrentLocation', 
            lat, 
            lng 
          });
          webRef.current.postMessage(message);
          console.log('Location sent to WebView:', lat, lng);
        } catch (e) {
          console.log('WebView error:', e);
        }
      }, 500);
    }
  }, [webReady]);

  // Get address from coordinates
  const getAddressFromCoords = async (lat, lng) => {
    setIsGettingAddress(true);
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.locality || data.city || data.principalSubdivision || 'Unknown location';
        setCurrentAddress(address);
      } else {
        setCurrentAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      // Fallback to OpenStreetMap
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentAddress(data.display_name || `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } else {
          setCurrentAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } catch {
        setCurrentAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } finally {
      setIsGettingAddress(false);
    }
  };

  // Request Android permission
  const requestAndroidPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your current position.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  // Get current location - FIXED VERSION
  const getCurrentLocation = async (isAutoFetch = false) => {
    if (!isAutoFetch) {
      setLocationLoading(true);
    }
    setCurrentAddress('Finding your location...');

    try {
      console.log('Starting location fetch...', isAutoFetch ? '(Auto)' : '(Manual)');
      
      // For Android, request permission first
      if (Platform.OS === 'android') {
        console.log('Requesting Android location permission...');
        const hasPermission = await requestAndroidPermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Location permission is required to get your current location.'
          );
          setLocationLoading(false);
          setCurrentAddress('Permission denied - select location manually');
          return;
        }
        console.log('Android location permission granted');
      }

      // Use Geolocation directly - IT'S NOW PROPERLY IMPORTED
      console.log('Calling Geolocation.getCurrentPosition...');
      
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location success:', position);
          const { latitude, longitude } = position.coords;
          console.log('Got coordinates:', latitude, longitude);
          
          setSelectedLocation({ latitude, longitude });
          sendLocationToWebView(latitude, longitude);
          getAddressFromCoords(latitude, longitude);
          setLocationLoading(false);
          if (isAutoFetch) {
            setAutoLocationFetched(true);
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
          if (isAutoFetch) {
            // For auto-fetch, don't show alert, just use default location
            console.log('Auto location fetch failed, using default location');
            setSelectedLocation(defaultLocation);
            sendLocationToWebView(defaultLocation.latitude, defaultLocation.longitude);
            setCurrentAddress('Damak (Default Location)');
            setLocationLoading(false);
            setAutoLocationFetched(true);
          } else {
            handleLocationError(error);
            setLocationLoading(false);
          }
        },
        {
          enableHighAccuracy: false, // Changed to false for faster response
          timeout: 15000, // 15 seconds for auto-fetch
          maximumAge: 300000, // 5 minutes - accept cached location
          distanceFilter: 10
        }
      );

    } catch (error) {
      console.log('Location service error:', error);
      if (isAutoFetch) {
        // For auto-fetch, fail silently and use default
        setSelectedLocation(defaultLocation);
        sendLocationToWebView(defaultLocation.latitude, defaultLocation.longitude);
        setCurrentAddress('Damak');
        setLocationLoading(false);
        setAutoLocationFetched(true);
      } else {
        Alert.alert(
          'Location Service Unavailable',
          'Please select your location manually on the map.'
        );
        setCurrentAddress('Select location on map');
        setLocationLoading(false);
      }
    }
  };

  const handleLocationError = (error) => {
    let errorMessage = 'Unable to get your current location. ';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += 'Location permission was denied.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage += 'Location request timed out.';
        break;
      default:
        errorMessage += 'Please try again or select manually.';
    }
    
    Alert.alert('Location Error', errorMessage);
    setCurrentAddress('Please select location on map');
  };

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);
      
      if (data.type === 'locationSelected') {
        const newLoc = { latitude: data.latitude, longitude: data.longitude };
        setSelectedLocation(newLoc);
        getAddressFromCoords(data.latitude, data.longitude);
      }

      if (data.type === 'mapReady') {
        setWebReady(true);
        console.log('Map is ready');
        // If we haven't fetched location yet and map is ready, fetch now
        if (!autoLocationFetched && locationLoading) {
          getCurrentLocation(true);
        }
      }
    } catch (e) {
      console.log('WebView message error:', e);
    }
  };

  // Save location
  const handleSetLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Please select a location first');
      return;
    }
    
    setLocation({
      ...selectedLocation,
      address: currentAddress,
      timestamp: new Date().toISOString(),
    });
    
  
    navigation.goBack();
  };

  // Auto-fetch location when component mounts
  useEffect(() => {
    // Start location fetch immediately when component loads
    getCurrentLocation(true);
  }, []);

  // Send location to WebView when both are ready
  useEffect(() => {
    if (webReady && selectedLocation && autoLocationFetched) {
      sendLocationToWebView(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [webReady, selectedLocation, autoLocationFetched, sendLocationToWebView]);

  const leafletHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body, #map { 
        height: 100%; 
        width: 100%; 
      }
      .location-marker { 
        background: #2f9e44; 
        border-radius: 50%; 
        width: 20px; 
        height: 20px; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3); 
      }
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        flex-direction: column;
      }
      .loading-text {
        margin-top: 10px;
        color: #666;
        font-family: system-ui;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="loadingOverlay" class="loading-overlay">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2f9e44; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <div class="loading-text">Loading map and your location...</div>
      </div>
    </div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      let map, marker;
      let isMapReady = false;

      function initMap() {
        try {
          console.log('Initializing map...');
          
          map = L.map('map').setView([${defaultLocation.latitude}, ${defaultLocation.longitude}], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
          }).addTo(map);
          
          marker = L.marker([${defaultLocation.latitude}, ${defaultLocation.longitude}], { 
            draggable: true,
            icon: L.divIcon({ 
              className: 'location-marker',
              iconSize: [26, 26]
            }) 
          }).addTo(map);
          
          marker.on('dragend', function() {
            const pos = marker.getLatLng();
            sendToReactNative({
              type: 'locationSelected',
              latitude: pos.lat,
              longitude: pos.lng
            });
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            sendToReactNative({
              type: 'locationSelected',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            });
          });

          isMapReady = true;
          
          // Hide loading overlay
          document.getElementById('loadingOverlay').style.display = 'none';
          
          sendToReactNative({ type: 'mapReady' });
          console.log('Map initialized successfully');
          
        } catch (error) {
          console.error('Map error:', error);
          document.getElementById('loadingOverlay').innerHTML = 'Error loading map';
        }
      }

      function setCurrentLocation(lat, lng) {
        if (!isMapReady) {
          console.log('Map not ready yet');
          return;
        }
        
        try {
          console.log('Setting location in map:', lat, lng);
          marker.setLatLng([lat, lng]);
          map.setView([lat, lng], 15);
        } catch (error) {
          console.error('Error setting location:', error);
        }
      }

      function sendToReactNative(message) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        } else {
          console.log('ReactNativeWebView not available');
        }
      }

      // Handle messages from React Native
      document.addEventListener('message', function(e) {
        try {
          const message = JSON.parse(e.data);
          console.log('Received message from RN:', message);
          
          if (message.type === 'setCurrentLocation') {
            setCurrentLocation(message.lat, message.lng);
          }
        } catch (error) {
          console.error('Message error:', error);
        }
      });

      window.addEventListener('message', function(e) {
        try {
          const message = JSON.parse(e.data);
          console.log('Received window message:', message);
          
          if (message.type === 'setCurrentLocation') {
            setCurrentLocation(message.lat, message.lng);
          }
        } catch (error) {
          console.error('Window message error:', error);
        }
      });

      // Add CSS animation for spinner
      const style = document.createElement('style');
      style.textContent = \`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      \`;
      document.head.appendChild(style);

      // Initialize map
      initMap();
    </script>
  </body>
  </html>`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSetLocation}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addressBar}>
        <Icon name="map-pin" size={16} color="#A62A32" />
        <Text style={styles.addressText} numberOfLines={2}>
          {currentAddress}
        </Text>
        {(isGettingAddress || locationLoading) && (
          <ActivityIndicator size="small" color="#A62A32" style={styles.loadingIndicator} />
        )}
      </View>

      {/* Manual refresh button in case auto-fetch fails */}
      {!locationLoading && (
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => getCurrentLocation(false)}
        >
          <Icon name="refresh-cw" size={16} color="#ffffffff "/>
          <Text style={styles.refreshButtonText}>
            Refresh Location
          </Text>
        </TouchableOpacity>
      )}

      {locationLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#faf8f9ff" />
          <Text style={styles.loadingText}>Getting your current location...</Text>
        </View>
      ) : (
        <WebView
          ref={webRef}
          source={{ html: leafletHTML }}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => {
            console.log('WebView loaded completely');
            setWebReady(true);
          }}
          onError={(error) => console.log('WebView error:', error)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          style={styles.webview}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#f0f0f0', 
    borderBottomWidth: 1 
  },
  backButton: {
    padding: 4,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  saveBtn: { 
    backgroundColor: '#A62A32', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 6 
  },
  saveText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16
  },
  addressBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#e9ecef',
    borderBottomWidth: 1
  },
  addressText: { 
    flex: 1, 
    marginLeft: 8, 
    color: '#495057', 
    fontWeight: '500',
    fontSize: 14
  },
  loadingIndicator: {
    marginLeft: 8
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A32A32',
  },
  refreshButtonText: {
    color: '#A62A32',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  webview: { 
    flex: 1, 
    width 
  },
});

export default MapPicker;
