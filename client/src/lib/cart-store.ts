import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  type?: string;
  customization?: any;
}

interface CartStore {
  isCartOpen: boolean;
  items: CartItem[];
  cartCount: number;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  addToCart: (item: CartItem) => void; // Alias for addItem
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  isCartOpen: false,
  items: [],
  cartCount: 0,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  addItem: (item: CartItem) => set((state) => {
    const existingItem = state.items.find(i => i.id === item.id);
    if (existingItem) {
      const newItems = state.items.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      return {
        items: newItems,
        cartCount: newItems.reduce((total, item) => total + item.quantity, 0)
      };
    }
    const newItems = [...state.items, item];
    return { 
      items: newItems,
      cartCount: newItems.reduce((total, item) => total + item.quantity, 0)
    };
  }),
  addToCart: (item: CartItem) => get().addItem(item), // Alias for addItem
  removeItem: (id: string) => set((state) => {
    const newItems = state.items.filter(item => item.id !== id);
    return {
      items: newItems,
      cartCount: newItems.reduce((total, item) => total + item.quantity, 0)
    };
  }),
  updateQuantity: (id: string, quantity: number) => set((state) => {
    const newItems = state.items.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    return {
      items: newItems,
      cartCount: newItems.reduce((total, item) => total + item.quantity, 0)
    };
  }),
  clearCart: () => set({ items: [], cartCount: 0 }),
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
