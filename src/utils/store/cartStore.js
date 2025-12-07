import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const state = get();

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

        const existing = state.items.find((i) => i._id === item._id);
        if (existing) {
          set({
            items: state.items.map((i) =>
              i._id === item._id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...state.items, { ...item, quantity: 1 }],
          });
        }

        return true; // Successfully added
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
