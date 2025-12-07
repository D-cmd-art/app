// components/Categories.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, FlatList,
  TouchableOpacity, StyleSheet, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useCategoryList } from '../../hooks/useCategoryList';

const { width: deviceWidth } = Dimensions.get('window');

const Categories = () => {
  const navigation = useNavigation();
  const { data, isLoading, error } = useCategoryList();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setCategories(data);
    }
  }, [data]);

  const handlePress = (categoryName) => {
    navigation.navigate('Subcategory', { category: categoryName });
  };

  const renderItem = ({ item }) => {
    const imageUrl = encodeURI(item.photos?.[0] || '');
    return (
      <TouchableOpacity style={styles.card} onPress={() => handlePress(item.name)}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <SkeletonPlaceholder borderRadius={10}>
      <View style={styles.scrollContainer}>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonText} />
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>What's on your minds ?</Text>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error loading categories</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        />
      )}
    </View>
  );
};

export default Categories;
const styles = StyleSheet.create({
  section: {
    marginVertical: deviceWidth * 0.04,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: deviceWidth * 0.025,
    paddingHorizontal: deviceWidth * 0.04,
  },
  title: {
    fontSize: deviceWidth * 0.045,
    fontWeight: 'bold',
  color: "#92400e",
  },
  scrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: deviceWidth * 0.04,
  },
  card: {
    alignItems: 'center',
    marginRight: deviceWidth * 0.05,
  },
  image: {
    width: deviceWidth * 0.18,
    height: deviceWidth * 0.18,
    borderRadius: deviceWidth * 0.09,
    borderWidth: 2,
    borderColor: '#15c415ff',
    marginBottom: 6,
  },
  name: {
    fontSize: deviceWidth * 0.03,
    fontWeight: '500',
    color: '#333',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '500',
  },
  skeletonCard: {
    alignItems: 'center',
    marginRight: deviceWidth * 0.05,
  },
  skeletonImage: {
    width: deviceWidth * 0.18,
    height: deviceWidth * 0.18,
    borderRadius: deviceWidth * 0.09,
    marginBottom: 6,
  },
  skeletonText: {
    width: deviceWidth * 0.12,
    height: 10,
    borderRadius: 4,
  },
});
