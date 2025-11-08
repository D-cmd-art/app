import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useCarouselList } from '../../hooks/useCarousel';

const { width } = Dimensions.get('window');

const Slideshow = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data, isLoading, error } = useCarouselList();

  const photos = Array.isArray(data?.[0]?.photos) ? data[0].photos : [];

  useEffect(() => {
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [photos]);

  // Conditional UI
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1521C4" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Something went wrong!</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No images available</Text>
      </View>
    );
  }

  // Main Render
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Image
          source={{ uri: photos[currentImageIndex] }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.dotContainer}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentImageIndex
                      ? '#1521C4'
                      : 'rgba(255,255,255,0.5)',
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 15,
  },
  container: {
    width: width * 0.9,
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
  },
});

export default Slideshow;
