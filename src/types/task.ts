export type TaskStatus = 'pending' | 'completed' | 'snoozed';

export type TaskPriority = 'high' | 'medium' | 'low' | 'none';

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    dueTime?: string; // ISO String
    scheduledDate: string; // YYYY-MM-DD format
    createdAt: string;
    priority?: TaskPriority;
    notes?: string;
    list?: string;         // Reminder list name (e.g. "Shopping", "Work")
    flagged?: boolean;
    icloudUid?: string;    // For dedup on re-sync
}
