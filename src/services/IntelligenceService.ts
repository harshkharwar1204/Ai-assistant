import { Task } from '../types/task';
import { Habit } from '../types/habit';
import { GroceryItem } from '../types/grocery';

export interface Insight {
    id: string;
    type: 'warning' | 'success' | 'tip';
    message: string;
    actionLabel?: string;
    actionLink?: 'tasks' | 'expenses' | 'grocery' | 'habits';
}

export const analyzeData = (
    tasks: Task[],
    dailyExpenseTotal: number,
    habits: Habit[],
    shoppingList: GroceryItem[]
): Insight[] => {
    const insights: Insight[] = [];

    // 1. Task Overload Warning
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length > 5) {
        insights.push({
            id: 'task-overload',
            type: 'warning',
            message: `You have ${pendingTasks.length} tasks pending. Consider rescheduling the non-urgent ones.`,
            actionLabel: 'Review Tasks',
            actionLink: 'tasks'
        });
    }

    // 2. Spending Velocity
    if (dailyExpenseTotal > 100) { // Arbitrary threshold for demo
        insights.push({
            id: 'high-spending',
            type: 'warning',
            message: `Daily spending is $${dailyExpenseTotal.toFixed(0)}. You're burning cash fast today.`,
            actionLabel: 'Check Wallet',
            actionLink: 'expenses'
        });
    }

    // 3. Habit Momentum
    const activeStreaks = habits.filter(h => h.streak >= 3);
    if (activeStreaks.length > 0) {
        insights.push({
            id: 'habit-momentum',
            type: 'success',
            message: `You're on fire! ${activeStreaks.length} habits have streaks of 3+ days. Keep it up!`,
            actionLabel: 'View Habits',
            actionLink: 'habits'
        });
    } else if (habits.length > 0 && habits.every(h => h.streak === 0)) {
        insights.push({
            id: 'habit-start',
            type: 'tip',
            message: "A fresh start. Complete one small habit today to build momentum.",
            actionLabel: 'Do it',
            actionLink: 'habits'
        });
    }

    // 4. Grocery Critical
    const outItems = shoppingList.filter(i => i.stockLevel === 'Out');
    if (outItems.length > 0) {
        insights.push({
            id: 'grocery-out',
            type: 'warning',
            message: `You are completely out of ${outItems[0].name}${outItems.length > 1 ? ` and ${outItems.length - 1} others` : ''}.`,
            actionLabel: 'Restock',
            actionLink: 'grocery'
        });
    }

    return insights;
};
