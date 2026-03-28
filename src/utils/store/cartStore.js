import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const state = get();

        // Normalize product ID
        const productId = item._id || item.id;
        if (!productId) return false;

        // Only allow one restaurant at a time
        if (state.items.length > 0) {
          const cartRestaurantId =
            state.items[0].restaurant?._id || state.items[0].restaurant?.id;
          const currentRestaurantId =
            item.restaurant?._id || item.restaurant?.id;

          if (
            cartRestaurantId &&
            currentRestaurantId &&
            cartRestaurantId !== currentRestaurantId
          ) {
            return false; // Block adding from another restaurant
          }
        }

        // Optimistic update: update state immediately
        set((state) => {
          const existing = state.items.find((i) => i._id === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i._id === productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });

        // Persistence happens automatically in background via persist middleware
        return true;
      },

      decreaseItem: (id) =>
        set((state) => {
          const item = state.items.find((i) => i._id === id);
          if (!item) return { items: state.items };

          if (item.quantity > 1) {
            return {
              items: state.items.map((i) =>
                i._id === id
                  ? { ...i, quantity: i.quantity - 1 }
                  : i
              ),
            };
          }

          return {
            items: state.items.filter((i) => i._id !== id),
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i._id !== id),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);