// store/cartStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i._id === item._id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          }
        }),
        decreaseItem: (id) =>
          set((state) => {
            const item = state.items.find((i) => i._id === id)
            if (!item) return { items: state.items }
        
            if (item.quantity > 1) {
              return {
                items: state.items.map((i) =>
                  i._id === id ? { ...i, quantity: i.quantity - 1 } : i
                ),
              }
            }
        
            // If quantity is 1, remove the item
            return {
              items: state.items.filter((i) => i._id !== id),
            }
          }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i._id !== id),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', // key in localStorage
    }
  )
)