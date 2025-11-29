import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

export const usePrice = (amount: number, fromCurrency: string = 'EUR') => {
  const { selectedCurrency, convertPrice, formatPrice } = useCurrency();
  const [convertedAmount, setConvertedAmount] = useState<number>(amount);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const convert = async () => {
      if (fromCurrency === selectedCurrency) {
        setConvertedAmount(amount);
        return;
      }

      setIsConverting(true);
      try {
        const converted = await convertPrice(amount, fromCurrency);
        setConvertedAmount(converted);
      } catch (error) {
        console.error('Error converting price:', error);
        setConvertedAmount(amount);
      } finally {
        setIsConverting(false);
      }
    };

    convert();
  }, [amount, fromCurrency, selectedCurrency, convertPrice]);

  return {
    amount: convertedAmount,
    formattedPrice: formatPrice(convertedAmount),
    isConverting,
    currency: selectedCurrency,
  };
};
