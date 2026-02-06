import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Search your Food',
    description:
      'Select your location and order your food from favourite restaurants',
    image: require('../assets/foodsearching.png'),
  },
  {
    id: '2',
    title: 'Select your location',
    description:
      'Discover your order from the nearby restaurant by selecting location',
    image: require('../assets/Order.png'),
  },
  {
    id: '3',
    title: 'Enjoy Our Fast Delivery Services',
    description:
      'Get your order delivered at your current location quickly and safely.',
    image: require('../assets/delivery.png'),
  },
];

export default function Welcome() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  // modal state
  const [showDisclosure, setShowDisclosure] = useState(false);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // show location disclosure modal instead of direct navigation
      setShowDisclosure(true);
    }
  };

  const handleAgree = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    await AsyncStorage.setItem('location_disclosure_accepted', 'true');
    setShowDisclosure(false);
    navigation.navigate('Login');
  };

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={slides}
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewRef.current}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            <View style={styles.imageSection}>
              <Image source={item.image} style={styles.image} />
            </View>
            <View style={styles.textSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.dots}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentIndex === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                  {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* ------------------- LOCATION DISCLOSURE MODAL ------------------- */}
      <Modal
        visible={showDisclosure}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Location Permission Required</Text>
            <Text style={styles.modalText}>
              Bhok Express collects location data to enable live order tracking
              and delivery services, even when the app is closed or not in use.
            </Text>
            <Text style={styles.modalText}>
              Location data is used only for delivery purposes and is not shared
              with third parties.
            </Text>
            <Pressable style={styles.modalButton} onPress={handleAgree}>
              <Text style={styles.modalButtonText}>Agree & Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    width,
    height,
    backgroundColor: '#fff',
  },
  imageSection: {
    flex: 2,
    justifyContent: 'center',
    marginTop: 60,
    alignItems: 'center',
  },
  textSection: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: undefined,
    aspectRatio: 4 / 3,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ee1212ff',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#ee1212ff',
    width: 16,
  },
  button: {
    backgroundColor: '#ee1212ff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  /* ------------------- Modal styles ------------------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#ee1212ff',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#ee1212ff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
