import { Customer, SubscriptionType, DeliveryLog, Payment } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Sharma Ji',
    address: '102, Rose Apartments, MG Road',
    mobile: '9876543210',
    defaultQuantity: 1.5,
    pricePerLitre: 60,
    balance: 450,
    isActive: true,
    subscriptionType: SubscriptionType.DAILY,
  },
  {
    id: 'c2',
    name: 'Anjali Verma',
    address: 'Plot 45, Green Valley',
    mobile: '9898989898',
    defaultQuantity: 1,
    pricePerLitre: 62,
    balance: 0,
    isActive: true,
    subscriptionType: SubscriptionType.DAILY,
  },
  {
    id: 'c3',
    name: 'Rahul Techie',
    address: 'Flat 5B, Silicon Heights',
    mobile: '9988776655',
    defaultQuantity: 0.5,
    pricePerLitre: 65,
    balance: 1200,
    isActive: true,
    subscriptionType: SubscriptionType.ALTERNATE,
  },
  {
    id: 'c4',
    name: 'Mrs. Iyer',
    address: '12, Temple Street',
    mobile: '8877665544',
    defaultQuantity: 2,
    pricePerLitre: 60,
    balance: -200, // Advance
    isActive: true,
    subscriptionType: SubscriptionType.DAILY,
  }
];

export const MOCK_LOGS: DeliveryLog[] = [];
// Generate some logs for the past 7 days
const today = new Date();
for (let i = 0; i < 7; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  const dateStr = d.toISOString().split('T')[0];
  
  MOCK_CUSTOMERS.forEach(c => {
    if(Math.random() > 0.1) { // 90% delivery rate
      MOCK_LOGS.push({
        id: `log-${dateStr}-${c.id}`,
        customerId: c.id,
        date: dateStr,
        quantity: c.defaultQuantity,
        isDelivered: true,
        shift: 'Morning'
      });
    }
  });
}

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    customerId: 'c1',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    amount: 1000,
    method: 'UPI'
  }
];
