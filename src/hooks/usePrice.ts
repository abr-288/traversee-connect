import { useCurrency } from '@/contexts/CurrencyContext';

export const usePrice = (amount: number, fromCurrency: string = 'XOF') => {
  const { selectedCurrency, formatPrice } = useCurrency();

  // No conversion needed - all prices in XOF
  return {
    amount: amount,
    formattedPrice: formatPrice(amount),
    isConverting: false,
    currency: selectedCurrency,
  };
};
