export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextPaymentDate: string;
  category: string;
  reminderStatus: boolean;
  iconUrl?: string;
  color?: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}
