import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');

const LeafletMap = () => {
  const webRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [webReady, setWebReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock locations for testing
  const MOCK_LOCATIONS = {
    kathmandu: { latitude: 27.7172, longitude: 85.3240, name: 'Kathmandu' },
    delhi: { latitude: 28.6139, longitude: 77.2090, name: 'Delhi' },
    london: { latitude: 51.5074, longitude: -0.1278, name: 'London' },
  };

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
    .marker {
      background: #4285f4;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
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
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="loading" class="loading">Waiting for location...</div>
  
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    let map, marker;
    
    function initMap(lat, lng) {
      console.log('Initializing map at:', lat, lng);
      
      // Remove loading message
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
      
      // Initialize map
      map = L.map('map').setView([lat, lng], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      // Add marker
      marker = L.marker([lat, lng], { 
        icon: L.divIcon({
          className: 'marker',
          iconSize: [20, 20]
        }) 
      }).addTo(map);
      
      // Add popup
      marker.bindPopup('Your Location<br>Lat: ' + lat + '<br>Lng: ' + lng).openPopup();
    }

    function updateLocation(lat, lng) {
      console.log('Updating location to:', lat, lng);
      if (!map) {
        initMap(lat, lng);
      } else {
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng]);
        marker.bindPopup('Your Location<br>Lat: ' + lat + '<br>Lng: ' + lng).openPopup();
      }
    }

    // Listen for messages from React Native
    document.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log('Received message:', data);
        if (data.type === 'loc') { 
          updateLocation(data.lat, data.lng); 
        }
      } catch(err) { 
        console.log('Invalid message', e.data, err); 
      }
    });

    window.onload = () => {
      console.log('WebView loaded, waiting for location...');
    };
  </script>
</body>
</html>
`;

  const requestPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const sendLocation = (lat, lng) => {
    if (webRef.current && webReady) {
      console.log('Sending location to WebView:', lat, lng);
      webRef.current.postMessage(JSON.stringify({ type: 'loc', lat, lng }));
    }
  };

  const getLocationWithFallback = () => {
    if (!hasPermission) return;

    console.log('Attempting to get location...');
    setLoading(true);
    setError(null);

    // Try to get precise location first
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('GPS location obtained:', position.coords);
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLoading(false);
        sendLocation(latitude, longitude);
      },
      (error) => {
        console.warn('GPS failed, trying network location...', error);
        
        // Fallback to network location with less accuracy requirements
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('Network location obtained:', position.coords);
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
            setLoading(false);
            sendLocation(latitude, longitude);
          },
          (networkError) => {
            console.error('All location methods failed:', networkError);
            
            // Final fallback to mock location
            const mockLocation = MOCK_LOCATIONS.kathmandu;
            console.log('Using mock location:', mockLocation);
            setUserLocation(mockLocation);
            setError('Using demo location. Enable GPS for actual location.');
            setLoading(false);
            sendLocation(mockLocation.latitude, mockLocation.longitude);
            
            Alert.alert(
              'Location Unavailable',
              'Using demo location. Please enable location services for accurate positioning.',
              [{ text: 'OK' }]
            );
          },
          { 
            enableHighAccuracy: false, // Use network instead of GPS
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      },
      { 
        enableHighAccuracy: true, // Try GPS first
        timeout: 15000,
        maximumAge: 0 // Don't use cached position
      }
    );

    // Watch for location updates
    const watchId = Geolocation.watchPosition(
      (position) => {
        console.log('Location updated:', position.coords);
        const { latitude, longitude } = position.coords;
        sendLocation(latitude, longitude);
      },
      (error) => {
        console.log('Watch position error (non-critical):', error);
      },
      { 
        enableHighAccuracy: false,
        distanceFilter: 10,
        interval: 10000
      }
    );

    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    };
  };

  // Mock location for testing
  const useMockLocation = (locationKey) => {
    const location = MOCK_LOCATIONS[locationKey] || MOCK_LOCATIONS.kathmandu;
    setUserLocation(location);
    setError(`Using mock location: ${location.name}`);
    setLoading(false);
    sendLocation(location.latitude, location.longitude);
  };

  useEffect(() => {
    (async () => {
      const permissionGranted = await requestPermission();
      setHasPermission(permissionGranted);
    })();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      const cleanup = getLocationWithFallback();
      return cleanup;
    }
  }, [hasPermission]);

  useEffect(() => {
    if (webReady && userLocation) {
      sendLocation(userLocation.latitude, userLocation.longitude);
    }
  }, [webReady, userLocation]);

  return (
    <View style={styles.container}>
      {/* Location Picker for Testing */}
      <View style={styles.locationPicker}>
        <Text style={styles.pickerTitle}>Test Locations:</Text>
        <View style={styles.buttonContainer}>
          <Text 
            style={styles.locationButton}
            onPress={() => useMockLocation('kathmandu')}
          >
            Kathmandu
          </Text>
          <Text 
            style={styles.locationButton}
            onPress={() => useMockLocation('delhi')}
          >
            Delhi
          </Text>
          <Text 
            style={styles.locationButton}
            onPress={() => useMockLocation('london')}
          >
            London
          </Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285f4" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <WebView
        ref={webRef}
        source={{ html: leafletHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        domStorageEnabled={true}
        onLoadEnd={() => {
          console.log('WebView fully loaded');
          setWebReady(true);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        mixedContentMode="always"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  webview: { 
    width, 
    height: height - 100 
  },
  locationPicker: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  locationButton: {
    padding: 8,
    backgroundColor: '#4285f4',
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderBottomWidth: 1,
    borderBottomColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LeafletMap;