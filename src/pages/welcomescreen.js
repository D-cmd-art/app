import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Search your Food',
    description: 'Search your desired food to order',
    image: require('../assets/foodsearching.png'),
  },
  {
    id: '2',
    title: 'Order your Food',
    description: 'Order Your Favourite and delicious foods on one click',
    image: require('../assets/Order.png'),
  },
  {
    id: '3',
    title: 'Enjoy Our Fast Delivery Services',
    description: 'Get your order delivered at your doorstep quickly and safely.',
    image: require('../assets/delivery.png'),
  },
];

export default function Welcome() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      navigation.navigate('Login');
    }
  };

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  return (
    <SafeAreaView>
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
                    style={[styles.dot, currentIndex === index && styles.activeDot]}
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
    color: '#92400e',
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
    backgroundColor: '#92400e',
    width: 16,
  },
  button: {
    backgroundColor: '#92400e',
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
});