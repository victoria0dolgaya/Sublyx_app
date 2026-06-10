import { Subscription, CategorySpending } from '../types';
import dayjs from 'dayjs';

const today = dayjs();

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    currency: '$',
    billingCycle: 'monthly',
    nextPaymentDate: today.add(3, 'day').toISOString(),
    category: 'Entertainment',
    reminderStatus: true,
    color: '#E50914',
  },
  {
    id: '2',
    name: 'Spotify',
    price: 9.99,
    currency: '$',
    billingCycle: 'monthly',
    nextPaymentDate: today.add(7, 'day').toISOString(),
    category: 'Music',
    reminderStatus: true,
    color: '#1DB954',
  },
  {
    id: '3',
    name: 'Google Drive',
    price: 2.99,
    currency: '$',
    billingCycle: 'monthly',
    nextPaymentDate: today.add(12, 'day').toISOString(),
    category: 'Storage',
    reminderStatus: false,
    color: '#4285F4',
  },
  {
    id: '4',
    name: 'Coursera',
    price: 39.00,
    currency: '$',
    billingCycle: 'monthly',
    nextPaymentDate: today.add(15, 'day').toISOString(),
    category: 'Education',
    reminderStatus: true,
    color: '#0056D2',
  },
  {
    id: '5',
    name: 'Figma',
    price: 12.00,
    currency: '$',
    billingCycle: 'monthly',
    nextPaymentDate: today.add(20, 'day').toISOString(),
    category: 'Design',
    reminderStatus: false,
    color: '#F24E1E',
  },
  {
    id: '6',
    name: 'ChatGPT Plus',
    price: 20.00,
    currency: '$',
    billingCycle: 'monthly',
    nextPaymentDate: today.add(25, 'day').toISOString(),
    category: 'Productivity',
    reminderStatus: true,
    color: '#10A37F',
  },
  {
    id: '7',
    name: 'Notion',
    price: 8.00,
    currency: '$',
    billingCycle: 'monthly',
    nextPaymentDate: today.add(28, 'day').toISOString(),
    category: 'Productivity',
    reminderStatus: false,
    color: '#000000',
  }
];

export const mockCategories: CategorySpending[] = [
  { category: 'Entertainment', amount: 15.99, color: '#E50914' },
  { category: 'Music', amount: 9.99, color: '#1DB954' },
  { category: 'Productivity', amount: 28.00, color: '#10A37F' },
  { category: 'Education', amount: 39.00, color: '#0056D2' },
  { category: 'Design', amount: 12.00, color: '#F24E1E' },
  { category: 'Storage', amount: 2.99, color: '#4285F4' },
];
