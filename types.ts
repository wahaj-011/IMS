
export enum StockStatus {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock',
  EXPIRED = 'Expired'
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string; // kg, liters, grams, units
  minStockLevel: number;
  unitCost: number; // In PKR
  expiryDate: string;
  supplierId: string;
  lastRestocked: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  location: string; // City in Pakistan
  paymentTerms: string;
  balance: number; // PKR
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  ingredients: {
    ingredientId: string;
    quantity: number;
  }[];
}

export interface WastageLog {
  id: string;
  ingredientId: string;
  quantity: number;
  reason: 'burnt' | 'spoiled' | 'expired' | 'dropped';
  date: string;
  loggedBy: string;
}

export interface QuickStats {
  totalInventoryValue: number;
  lowStockItems: number;
  expiringSoon: number;
  pendingPayables: number;
}
