export type TaskStatus = 'pending' | 'completed' | 'snoozed';

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    dueTime?: string; // ISO String
    scheduledDate: string; // YYYY-MM-DD format
    createdAt: string;
}
