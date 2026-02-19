export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Other';

export interface Expense {
    id: string;
    amount: number;
    category: ExpenseCategory;
    note: string;
    date: string; // ISO String
}
