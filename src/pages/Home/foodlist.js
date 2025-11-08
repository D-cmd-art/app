// components/OrderFood.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../utils/api'; // Axios instance with baseURL
import {useProductList} from '../../hooks/useProductList';
import {useCategoryList} from '../../hooks/useCategoryList';
import { useNavigation } from '@react-navigation/native';
// Get device width for responsive design
const { width: deviceWidth } = Dimensions.get('window');
const cardMargin = deviceWidth * 0.025;
const cardWidth = (deviceWidth - cardMargin * 3) / 2;

const OrderFood = ({ likedFoods = new Set(), onLike = () => {} }) => {
const navigation=useNavigation();
  const {data,isLoading,error,refetch}=useCategoryList();
    const [foods, setFoods] = useState(data||[]);
    console.log("from the Order food here",data);
    console.log("error",error);
    useEffect(()=>{
       setFoods(data); 
    },[data])
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#15c415ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Error loading categories</Text>
      </View>
    );
  }

  const renderFoodItem = ({ item }) => {
     const rawUrl = item.photos[0];
const encodedUrl = encodeURI(rawUrl);   

    return (
      <View style={styles.card}>
                <Image source={{ uri: item?.photos?.[0] }} key={item} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
        <TouchableOpacity style={styles.button} onPress={() =>navigation.navigate('subcategory')}>
          <Text style={styles.buttonText}>See Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Food</Text>
        <Ionicons
          name="arrow-forward-circle"
          size={deviceWidth * 0.1}
          color="gray"
        />
      </View>

      <FlatList
        data={foods}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderFoodItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrderFood;


const styles = StyleSheet.create({
  section: {
    marginVertical: deviceWidth * 0.04,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: deviceWidth * 0.03,
    paddingHorizontal: deviceWidth * 0.04,
    paddingLeft:15,
    alignItems: 'center',
    paddingRight:10,
  },
  title: {
    fontSize: deviceWidth * 0.045,
    fontWeight: 'bold',
    color: '#333',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: deviceWidth * 0.04,
    paddingHorizontal: deviceWidth * 0.03,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: deviceWidth * 0.03,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    alignSelf: 'center',
    width: '60%',
    height: deviceWidth * 0.26,
    borderRadius: 10,
  },
  name: {
    marginVertical: deviceWidth * 0.02,
    fontWeight: 'bold',
    fontSize: deviceWidth * 0.038,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1521C4',
    paddingVertical: deviceWidth * 0.015,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: deviceWidth * 0.035,
  },
  like: {
    position: 'absolute',
    padding: deviceWidth * 0.015,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    top: deviceWidth * 0.02,
    right: deviceWidth * 0.02,
  },
});
