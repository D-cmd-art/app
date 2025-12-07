// FavoritesContext.js
import React, { createContext, useContext, useState } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);

  // Function to add an item to favorites
  const addToFavorites = (item) => {
    // Check if item is already in favorites
    const exists = favoriteItems.some(fav => fav.id === item.id);
    if (!exists) {
      setFavoriteItems((prevItems) => [...prevItems, item]);
      return true; // Added successfully
    }
    return false; // Already exi
  };

  // Function to remove an item from favorites
  const removeFromFavorites = (itemId) => {
    setFavoriteItems((prevItems) => prevItems.filter(item => item.id !== itemId));
  };
  
  // Function to check if an item is a favorite
  const isFavorite = (itemId) => {
      return favoriteItems.some(item => item.id === itemId);
  }

  // Function to clear all favorites
  const clearFavorites = () => {
      setFavoriteItems([]);
  }

  const value = {
    favoriteItems,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
