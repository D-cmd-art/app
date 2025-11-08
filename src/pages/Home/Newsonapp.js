import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

const NewsFeed = () => {
  const newsItems = [
    {
      id: 1,
      title: 'New Food Festival in Kathmandu',
      image: 'https://www.pexels.com/photo/gray-and-brown-mountain-417173/',
      date: 'Oct 10, 2025',
    },
    {
      id: 2,
      title: 'Top 5 Trending Dishes This Week',
      image: 'https://www.pexels.com/photo/gray-and-brown-mountain-417173/',
      date: 'Oct 9, 2025',
    },
    {
      id: 3,
      title: 'Cashback Offers Extended for Dashain',
      image: 'https://www.pexels.com/photo/gray-and-brown-mountain-417173/',
      date: 'Oct 8, 2025',
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📰 Latest News</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {newsItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => console.log('News clicked:', item.title)}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default NewsFeed;

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 90,
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});