import { usePrice } from '@/hooks/usePrice';
import { Loader2 } from 'lucide-react';

interface PriceProps {
  amount: number;
  fromCurrency?: string;
  className?: string;
  showCurrency?: boolean;
  showLoader?: boolean;
}

export const Price = ({ 
  amount, 
  fromCurrency = 'XOF', 
  className = '', 
  showCurrency = true,
  showLoader = false 
}: PriceProps) => {
  const { formattedPrice, isConverting } = usePrice(amount, fromCurrency);

  if (isConverting && showLoader) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>...</span>
      </span>
    );
  }

  return <span className={className}>{formattedPrice}</span>;
};
