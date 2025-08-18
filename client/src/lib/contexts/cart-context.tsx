import React, { createContext, useContext, useState, useEffect } from 'react';
import { type PuzzleConfiguration } from '../../../../shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CartItem {
  id: string;
  puzzleConfig: PuzzleConfiguration;
  quantity: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (config: PuzzleConfiguration) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate session ID
let sessionId = localStorage.getItem('puzzlecraft-session-id');
if (!sessionId) {
  sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('puzzlecraft-session-id', sessionId);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Set session ID for all requests
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const headers = {
        'X-Session-Id': sessionId!,
        ...(init?.headers as Record<string, string>)
      };
      return originalFetch(input, { ...init, headers });
    };
  }, []);

  const { data: items = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    refetchOnWindowFocus: false,
  });

  const addItemMutation = useMutation({
    mutationFn: async (config: PuzzleConfiguration) => {
      const response = await apiRequest('POST', '/api/cart', {
        puzzleConfig: config,
        quantity: 1,
        totalPrice: (config as any).totalPrice || 0
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem: (config) => addItemMutation.mutate(config),
        removeItem: (id) => removeItemMutation.mutate(id),
        updateQuantity: (id, quantity) => updateQuantityMutation.mutate({ id, quantity }),
        clearCart: () => clearCartMutation.mutate(),
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
