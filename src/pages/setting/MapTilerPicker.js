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
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { useMapStore } from '../../utils/store/mapStore';

const { width, height } = Dimensions.get('window');

// Default location as fallback
const defaultLocation = { latitude: 26.6717, longitude:87.6680 }; // Kathmandu

const MapPicker = () => {
  const navigation = useNavigation();
  const webRef = useRef(null);
  
  // Use the store
  const { setLocation } = useMapStore();
  
  const [webReady, setWebReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAddress, setCurrentAddress] = useState('Fetching location...');
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Optimized Leaflet HTML
  const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body { margin: 0; height: 100%; }
    #map { width: 100%; height: 100%; }
    .location-marker {
      background: #2f9e44;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: move;
    }
    .location-popup {
      font-family: Arial, sans-serif;
      font-size: 14px;
      text-align: center;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      text-align: center;
    }
    .drag-hint {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255,255,255,0.9);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 1000;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="loading" class="loading">📍 Finding your location...</div>
  <div id="dragHint" class="drag-hint" style="display: none;">🎯 Drag marker to adjust location</div>
  
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    let map, marker;
    let currentLocation = null;
    let isDragging = false;
    let dragEndTimeout;
    
    function initMap(lat, lng) {
      const loading = document.getElementById('loading');
      const dragHint = document.getElementById('dragHint');
      if (loading) loading.style.display = 'none';
      
      map = L.map('map').setView([lat, lng], 16);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      // Create marker with better drag handling
      marker = L.marker([lat, lng], { 
        draggable: true,
        icon: L.divIcon({
          className: 'location-marker',
          iconSize: [24, 24]
        }),
        autoPan: true
      }).addTo(map);
      
      currentLocation = { lat: lat, lng: lng };
      updatePopup();
      
      // Show drag hint briefly
      if (dragHint) {
        dragHint.style.display = 'block';
        setTimeout(() => {
          dragHint.style.display = 'none';
        }, 3000);
      }
      
      // DRAG START - set flag
      marker.on('dragstart', function(event) {
        isDragging = true;
        sendDragStatus(true);
      });
      
      // DRAG - throttle updates during drag
      marker.on('drag', function(event) {
        const position = marker.getLatLng();
        currentLocation = { lat: position.lat, lng: position.lng };
        updatePopupPosition(position);
      });
      
      // DRAG END - send final position
      marker.on('dragend', function(event) {
        isDragging = false;
        const position = marker.getLatLng();
        currentLocation = { lat: position.lat, lng: position.lng };
        updatePopup();
        
        if (dragEndTimeout) clearTimeout(dragEndTimeout);
        
        dragEndTimeout = setTimeout(() => {
          sendLocationToApp();
          sendDragStatus(false);
        }, 100);
      });
      
      // CLICK on map - move marker
      map.on('click', function(event) {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        currentLocation = { lat, lng };
        updatePopup();
        
        setTimeout(() => {
          sendLocationToApp();
        }, 50);
      });
    }
    
    function updatePopup() {
      const popupContent = \`
        <div class="location-popup">
          <strong>📍 Your Location</strong><br>
          Lat: \${currentLocation.lat.toFixed(6)}<br>
          Lng: \${currentLocation.lng.toFixed(6)}<br>
          <small>Drag to adjust position</small>
        </div>
      \`;
      marker.bindPopup(popupContent).openPopup();
    }
    
    function updatePopupPosition(position) {
      const popupContent = \`
        <div class="location-popup">
          <strong>📍 Your Location</strong><br>
          Lat: \${position.lat.toFixed(6)}<br>
          Lng: \${position.lng.toFixed(6)}<br>
          <small>Dragging...</small>
        </div>
      \`;
      marker.bindPopup(popupContent).openPopup();
    }
    
    function sendLocationToApp() {
      if (window.ReactNativeWebView && currentLocation) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'locationSelected',
            latitude: currentLocation.lat,
            longitude: currentLocation.lng
          })
        );
      }
    }
    
    function sendDragStatus(dragging) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'dragStatus',
            isDragging: dragging
          })
        );
      }
    }
    
    // Handle messages from React Native
    document.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'setCurrentLocation') {
          const { lat, lng } = data;
          if (!map) {
            initMap(lat, lng);
          } else if (!isDragging) {
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng]);
            currentLocation = { lat, lng };
            updatePopup();
          }
        }
      } catch(err) {
        console.log('Error parsing message:', err);
      }
    });
    
    // Initialize with default location first
    initMap(${defaultLocation.latitude}, ${defaultLocation.longitude});
  </script>
</body>
</html>
`;

  // Debounced address fetching with useCallback
  const debouncedGetAddress = useCallback(
    debounce(async (lat, lng) => {
      setIsGettingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: {
              'User-Agent': 'YourAppName/1.0',
              'Accept-Language': 'en',
            },
          }
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (data && data.address) {
          const address = data.address;
          let locationName = '';
          
          // Build address from available components
          if (address.road) locationName = address.road;
          if (address.suburb) locationName = locationName ? `${locationName}, ${address.suburb}` : address.suburb;
          if (address.city) locationName = locationName ? `${locationName}, ${address.city}` : address.city;
          if (address.town) locationName = locationName ? `${locationName}, ${address.town}` : address.town;
          if (address.village) locationName = locationName ? `${locationName}, ${address.village}` : address.village;
          if (address.state) locationName = locationName ? `${locationName}, ${address.state}` : address.state;
          if (address.country) locationName = locationName ? `${locationName}, ${address.country}` : address.country;
          
          const finalAddress = locationName || data.display_name || 'Unknown Location';
          setCurrentAddress(finalAddress);
        } else {
          setCurrentAddress(data.display_name || 'Location selected');
        }
      } catch (error) {
        console.log('Geocoding failed:', error);
        setCurrentAddress('Location selected');
      } finally {
        setIsGettingAddress(false);
      }
    }, 500),
    []
  );

  // Get current location
  const getCurrentLocation = useCallback(() => {
    console.log('Getting current location...');
    setLoading(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Current location found:', latitude, longitude);
        
        setSelectedLocation({ latitude, longitude });
        sendLocationToWebView(latitude, longitude);
        setLoading(false);
        
        // Get address for the location
        debouncedGetAddress(latitude, longitude);
      },
      (error) => {
        console.log('Location error:', error);
        
        // Use default location
        setSelectedLocation(defaultLocation);
        sendLocationToWebView(defaultLocation.latitude, defaultLocation.longitude);
        setLoading(false);
        setCurrentAddress('Damak');
        
        let errorMessage = 'Using default location. Drag the marker to your actual position.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Using default location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Using default location.';
            break;
          
        }
        
        Alert.alert('Location Service', errorMessage, [{ text: 'OK' }]);
      },
      { 
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  }, [debouncedGetAddress]);

  // Send location to WebView
  const sendLocationToWebView = useCallback((lat, lng) => {
    if (webRef.current && webReady && !isDragging) {
      webRef.current.postMessage(
        JSON.stringify({ 
          type: 'setCurrentLocation', 
          lat, 
          lng 
        })
      );
    }
  }, [webReady, isDragging]);

  // Handle messages from WebView
  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'locationSelected') {
        const newLocation = {
          latitude: data.latitude,
          longitude: data.longitude
        };
        setSelectedLocation(newLocation);
        
        // Get address for new location when marker is moved
        debouncedGetAddress(data.latitude, data.longitude);
      }
      
      if (data.type === 'dragStatus') {
        setIsDragging(data.isDragging);
      }
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
  }, [debouncedGetAddress]);

  // Handle set location with navigation guard
  const handleSetLocation = useCallback(() => {
    if (!selectedLocation) {
      Alert.alert('Location Not Ready', 'Please wait while we get your location...');
      return;
    }

    // Save to Zustand store
    const locationData = {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: currentAddress,
      timestamp: new Date().toISOString()
    };
    
    setLocation(locationData);
    
    // Use setTimeout to ensure navigation happens after current render cycle
    setTimeout(() => {
      navigation.goBack();
    }, 0);
    
    // Show success message
    Alert.alert(
      'Location Saved', 
      'Your location has been saved successfully!',
      [{ text: 'OK' }]
    );
  }, [selectedLocation, currentAddress, setLocation, navigation]);

  // Retry location
  const handleRetryLocation = useCallback(() => {
    setLoading(true);
    setCurrentAddress('Fetching location...');
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Get location when component mounts - FIXED: added proper dependencies
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Send location when WebView is ready - FIXED: added proper dependencies
  useEffect(() => {
    if (webReady && selectedLocation && !isDragging) {
      sendLocationToWebView(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [webReady, selectedLocation, isDragging, sendLocationToWebView]);

  // Handle back button press
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Select Location</Text>
        
        <TouchableOpacity 
          style={[styles.setLocationButton, isDragging && styles.disabledButton]}
          onPress={handleSetLocation}
          disabled={isDragging}
        >
          <Text style={styles.setLocationText}>
            {isDragging ? 'Dragging...' : 'Save Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      <View style={styles.locationInfo}>
        <View style={styles.addressContainer}>
          <Icon name="map-pin" size={16} color="#2f9e44" />
          <Text style={styles.locationText}>
            {currentAddress}
            {isDragging && ' (Dragging...)'}
          </Text>
          {isGettingAddress && !isDragging && (
            <ActivityIndicator size="small" color="#2f9e44" style={styles.addressLoader} />
          )}
        </View>
        
        {selectedLocation && (
          <Text style={styles.coordinates}>
            {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </Text>
        )}
        
        {/* Retry Button */}
        <TouchableOpacity 
          style={[styles.retryButton, isDragging && styles.disabledButton]} 
          onPress={handleRetryLocation}
          disabled={isDragging}
        >
          <Icon name="refresh-cw" size={14} color="#495057" />
          <Text style={styles.retryText}> Refresh Location</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2f9e44" />
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
      )}

      {/* Map */}
      <WebView
        ref={webRef}
        source={{ html: leafletHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        domStorageEnabled={true}
        onLoadEnd={() => setWebReady(true)}
        onMessage={handleWebViewMessage}
        onError={(error) => {
          console.error('WebView error:', error);
          setLoading(false);
        }}
      />

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          {isDragging ? '🎯 Releasing marker...' : '✅ Drag the marker to adjust your exact position'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  setLocationButton: {
    backgroundColor: '#2f9e44',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  setLocationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  locationInfo: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2f9e44',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#2d5a2d',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  addressLoader: {
    marginLeft: 8,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  retryText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 1000,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
  webview: {
    flex: 1,
    width,
  },
  instructions: {
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  instructionsText: {
    fontSize: 12,
    color: '#0369a1',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MapPicker;