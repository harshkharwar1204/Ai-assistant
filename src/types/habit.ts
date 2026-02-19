export interface Habit {
    id: string;
    name: string;
    streak: number;
    completedDates: string[]; // ISO date strings
    archived: boolean;
}
