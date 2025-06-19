export interface CheapEnergyPrices {
  variable_fixed_prices: {
    [key: string]: {
      '3_months': number;
      '6_months': number;
      '1_year': number;
      '2_years': number;
      '3_years': number;
      '4_years': number;
      '5_years': number;
      '10_years': number;
    };
  };
  spot_prices: {
    [key: string]: number;
  };
  fixed_fees: {
    all_customers: number;
    all_customers_discount: number;
    green_electricity: number;
  };
}

export type ElectricityArea = 'se1' | 'se2' | 'se3' | 'se4';

// Mapping av postnummer till elområden
export const getElectricityArea = (postalCode: string): ElectricityArea => {
  const prefix = postalCode.substring(0, 2);
  const prefixNum = parseInt(prefix);
  
  if (prefixNum >= 98) return 'se1';
  if (prefixNum >= 85 && prefixNum <= 97) return 'se2';
  if (prefixNum >= 62 && prefixNum <= 84) return 'se3';
  return 'se4';
}; 