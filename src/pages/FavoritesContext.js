// src/context/FavouritesContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "../utils/store/userStore";

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
  const { user } = useUserStore();
  const [favourites, setFavourites] = useState([]);
  const storageKey = user ? `favourites_${user.id}` : null;

  const normalizeProduct = (product) => {
    if (!product) return null;
    return { ...product, _id: product._id || product.id };
  };

  // Load favourites once
  useEffect(() => {
    const loadFavourites = async () => {
      if (!storageKey) return setFavourites([]);
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        let parsed = stored ? JSON.parse(stored) : [];
        parsed = parsed.map(normalizeProduct).filter((p) => p && p?._id);
        setFavourites(parsed);
      } catch (err) {
        console.warn("Failed to load favourites:", err);
        setFavourites([]);
      }
    };
    loadFavourites();
  }, [storageKey]);

  // Optimistic toggle
  const toggleFavourite = (product) => {
    if (!storageKey) return;
    const normalized = normalizeProduct(product);
    if (!normalized?._id) return;

    setFavourites((prev) => {
      let updated;
      if (prev.some((p) => p && p._id === normalized._id)) {
        updated = prev.filter((p) => p && p._id !== normalized._id);
      } else {
        updated = [...prev, normalized];
      }

      // Persist in background (non-blocking)
      AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch((err) =>
        console.warn("Failed to save favourite:", err)
      );

      return updated;
    });
  };

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavouritesContext = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error("useFavouritesContext must be used within FavouritesProvider");
  }
  return context;
};