import React, { useState } from 'react';
import { View, FlatList, Dimensions, StyleSheet, } from 'react-native';
import Location from '../pages/Home/location';
import Categories from '../pages/Home/menu';
import Slideshow from '../pages/Home/slideshowimage';
import BestReviewedFood from '../pages/Home/Bestreviewedfood';
import { SafeAreaView } from 'react-native-safe-area-context';
import VegFood from '../pages/Home/VegFood';
import NonVegFood from '../pages/Home/NonVegFood';
import AllRestaurants from './Home/resturantHome';
import appData from '../data/appData';
import useBackHandler from '../hooks/useBackHandler'; // ✅ Import hook

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const Home = () => {
  const [likedFoods, setLikedFoods] = useState(new Set());

  // ✅ Enable double-back exit on this screen
  useBackHandler(true);

  const handleFoodLike = (id) => {
    setLikedFoods((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.flatList}
        data={[]} // No actual list data ; only header content
        keyExtractor={() => 'dummy'}
        ListHeaderComponent={
          <>
            <Location screenOptions={{ headerShown: true }} />
            <Categories categories={appData.categories} deviceWidth={deviceWidth} />
            <Slideshow images={appData.slideshowImages} deviceWidth={deviceWidth} style={styles.slideshow} />
            <BestReviewedFood
              foods={appData.bestReviewedFoods}
              likedFoods={likedFoods}
              onLike={handleFoodLike}
              deviceWidth={deviceWidth}
            />
            <VegFood deviceWidth={deviceWidth} />
            <NonVegFood />
            <AllRestaurants restaurants={appData.AllRestaurants} deviceWidth={deviceWidth} />
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>

);
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fc0b0bff',
  },
  flatList: {
    backgroundColor: '#ffffffff',
  },
});
