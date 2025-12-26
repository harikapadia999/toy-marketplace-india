import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  toyId: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  seller: {
    id: string;
    name: string;
  };
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (toyId: string) => void;
  updateQuantity: (toyId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalSavings: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.toyId === item.toyId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.toyId === item.toyId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }
      },

      removeItem: (toyId) => {
        set({
          items: get().items.filter((i) => i.toyId !== toyId),
        });
      },

      updateQuantity: (toyId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(toyId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.toyId === toyId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalSavings: () => {
        return get().items.reduce(
          (total, item) =>
            total + (item.originalPrice - item.price) * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
