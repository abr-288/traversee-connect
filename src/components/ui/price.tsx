import { memo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

// Taux de conversion fixes vers XOF (Franc CFA)
const EXCHANGE_RATES_TO_XOF: Record<string, number> = {
  'EUR': 656,      // 1 EUR = 656 XOF (taux fixe BCEAO)
  'USD': 615,      // 1 USD ≈ 615 XOF
  'GBP': 780,      // 1 GBP ≈ 780 XOF
  'XOF': 1,        // Déjà en XOF
  'FCFA': 1,       // Alias pour XOF
  'XAF': 1,        // Franc CFA CEMAC (parité 1:1)
};

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
  
  // Convertir le montant en XOF si nécessaire
  const normalizedCurrency = fromCurrency?.toUpperCase() || 'XOF';
  const rate = EXCHANGE_RATES_TO_XOF[normalizedCurrency] || 1;
  const amountInXOF = Math.round(amount * rate);
  
  const formattedPrice = formatPrice(amountInXOF);

  return <span className={className}>{formattedPrice}</span>;
});

Price.displayName = 'Price';
