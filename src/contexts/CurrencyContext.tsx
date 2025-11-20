import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  convertPrice: (amount: number, fromCurrency: string) => Promise<number>;
  formatPrice: (amount: number, currency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const currencies = [
  { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar US' },
  { code: 'GBP', symbol: '£', name: 'Livre Sterling' },
  { code: 'CAD', symbol: 'C$', name: 'Dollar Canadien' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinois' },
];

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    return localStorage.getItem('currency') || 'XOF';
  });
  const { convertCurrency } = useCurrencyExchange();

  useEffect(() => {
    localStorage.setItem('currency', selectedCurrency);
  }, [selectedCurrency]);

  const convertPrice = async (amount: number, fromCurrency: string): Promise<number> => {
    if (fromCurrency === selectedCurrency) {
      return amount;
    }

    const result = await convertCurrency(fromCurrency, selectedCurrency, amount);
    return result?.converted || amount;
  };

  const formatPrice = (amount: number, currency?: string): string => {
    const curr = currency || selectedCurrency;
    const currencyData = currencies.find(c => c.code === curr);
    
    if (curr === 'XOF') {
      return `${Math.round(amount).toLocaleString('fr-FR')} ${currencyData?.symbol || 'FCFA'}`;
    }
    
    return `${currencyData?.symbol || ''}${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
