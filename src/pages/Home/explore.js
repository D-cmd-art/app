import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';

const exploreItems = [
  {
    id: '1',
    title: 'Avocado Toast',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
  },
  {
    id: '2',
    title: 'Iced Latte',
    category: 'Drink',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
  },
  {
    id: '3',
    title: 'Berry Smoothie',
    category: 'Drink',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0',
  },
  {
    id: '4',
    title: 'Pasta Primavera',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  },
  {
    id: '5',
    title: 'Matcha Tea',
    category: 'Drink',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
  },
];

export default function ExploreScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Explore Food & Drinks</Text>

      <FlatList
        data={exploreItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingLeft: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  list: {
    paddingRight: 20,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    marginRight: 20,
    width: 220,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 140,
  },
  cardContent: {
    padding: 12,
  },
  category: {
    color: '#ff7f50',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 5,
    color: '#333',
  },
});
