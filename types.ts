export enum SubscriptionType {
  DAILY = 'Daily',
  ALTERNATE = 'Alternate Days',
  CUSTOM = 'Custom'
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  mobile: string;
  defaultQuantity: number; // in Litres
  pricePerLitre: number;
  balance: number; // Positive = Due, Negative = Advance
  isActive: boolean;
  subscriptionType: SubscriptionType;
  coordinates?: { lat: number; lng: number };
}

export interface DeliveryLog {
  id: string;
  customerId: string;
  date: string; // ISO YYYY-MM-DD
  quantity: number;
  isDelivered: boolean;
  shift: 'Morning' | 'Evening';
}

export interface Payment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Transfer';
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  defaultPrice: number;
}