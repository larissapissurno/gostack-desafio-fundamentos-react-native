import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}
const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.removeItem('goMarketplace:cart');
      const productsString = await AsyncStorage.getItem('goMarketplace:cart');
      setProducts(JSON.parse(productsString || '') as Product[]);
    }

    loadProducts();
  }, []);

  const logCart = useCallback(async (title = '') => {
    const productsString = await AsyncStorage.getItem('goMarketplace:cart');
    const productsStorared = JSON.parse(productsString || '');

    console.log(title || 'PRODUTOS =', productsStorared);

    console.log('TOTAL DE ITENS NO CARRINHO =', productsStorared.length);
  }, []);
  logCart();

  const addToCart = useCallback(
    async product => {
      const productsCopy = Object.assign([], products) as Product[];
      const productExistsIndex = (products || []).findIndex(
        prod => prod.id === product.id,
      );

      if (productExistsIndex > -1) {
        productsCopy[productExistsIndex].quantity += 1;
      } else {
        productsCopy.push({ ...product, ...{ quantity: 1 } });
      }

      setProducts(productsCopy);
      await AsyncStorage.setItem(
        'goMarketplace:cart',
        JSON.stringify(productsCopy),
      );

      logCart('PRODUTO ADICIONADO');
    },
    [logCart, products],
  );

  const increment = useCallback(
    async id => {
      const productsCopy = Object.assign([], products) as Product[];
      const productIndex = products.findIndex(prod => prod.id === id);

      if (productIndex > -1) {
        productsCopy[productIndex].quantity += 1;

        setProducts(productsCopy);
        await AsyncStorage.setItem(
          'goMarketplace:cart',
          JSON.stringify(productsCopy),
        );

        logCart(`PRODUTO ${productsCopy[productIndex].id} INCREMENTADO`);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsCopy = Object.assign([], products) as Product[];
      const productIndex = products.findIndex(prod => prod.id === id);

      if (productIndex > -1) {
        productsCopy[productIndex].quantity -= 1;

        setProducts(productsCopy);
        await AsyncStorage.setItem(
          'goMarketplace:cart',
          JSON.stringify(productsCopy),
        );

        logCart(`PRODUTO ${productsCopy[productIndex].id} DECREMENTADO`);
      }
    },
    [logCart, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
