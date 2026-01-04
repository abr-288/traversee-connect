import { memo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceProps {
  amount: number;
  fromCurrency?: string;
  className?: string;
  showCurrency?: boolean;
  showLoader?: boolean;
}

export const Price = memo(({ 
  amount, 
  fromCurrency = 'XOF',
  className = '', 
  showCurrency = true,
  showLoader = false 
}: PriceProps) => {
  const { formatPrice } = useCurrency();
  
  // All prices displayed in XOF without conversion
  const formattedPrice = formatPrice(amount);

  return <span className={className}>{formattedPrice}</span>;
});
