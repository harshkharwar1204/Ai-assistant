// PredictionService - Local AI-driven task suggestions

interface CompletionRecord {
    title: string;
    dayOfWeek: number; // 0-6
    hour: number; // 0-23
    count: number;
}

const STORAGE_KEY = 'omni-predictions';

const getRecords = (): CompletionRecord[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

export const PredictionService = {
    // Learn: Save a completion record
    recordCompletion: (taskTitle: string) => {
        if (typeof window === 'undefined') return;
        const now = new Date();
        const records = getRecords();

        const existing = records.find(r =>
            r.title === taskTitle &&
            r.dayOfWeek === now.getDay() &&
            Math.abs(r.hour - now.getHours()) <= 1
        );

        if (existing) {
            existing.count += 1;
        } else {
            records.push({
                title: taskTitle,
                dayOfWeek: now.getDay(),
                hour: now.getHours(),
                count: 1
            });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    },

    // Predict: Get top suggestions for right now
    getSuggestions: (): string[] => {
        if (typeof window === 'undefined') return [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();
        const records = getRecords();

        const relevant = records.filter(r =>
            r.dayOfWeek === currentDay &&
            Math.abs(r.hour - currentHour) <= 2
        );

        return relevant
            .sort((a, b) => b.count - a.count)
            .map(r => r.title)
            .slice(0, 3);
    }
};
