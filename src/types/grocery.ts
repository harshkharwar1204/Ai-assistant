export type StockLevel = 'High' | 'Medium' | 'Low' | 'Out';

export interface GroceryItem {
    id: string;
    name: string;
    stockLevel: StockLevel;
    category: string;
    isEssential: boolean; // If true, auto-add to list when Low/Out
}
