// PredictionService - Local AI-driven task suggestions

interface CompletionRecord {
    title: string;
    dayOfWeek: number; // 0-6
    hour: number; // 0-23
    count: number;
}

const STORAGE_KEY = 'life-os-predictions';

export const PredictionService = {
    // Learn: Save a completion record
    recordCompletion: (taskTitle: string) => {
        const now = new Date();
        const records: CompletionRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        const existing = records.find(r =>
            r.title === taskTitle &&
            r.dayOfWeek === now.getDay() &&
            Math.abs(r.hour - now.getHours()) <= 1 // Group within +/- 1 hour
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
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();
        const records: CompletionRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        // Filter for relevant context (Same day, similar time)
        const relevant = records.filter(r =>
            r.dayOfWeek === currentDay &&
            Math.abs(r.hour - currentHour) <= 2 // +/- 2 hours window
        );

        // Sort by frequency
        return relevant
            .sort((a, b) => b.count - a.count)
            .map(r => r.title)
            .slice(0, 3); // Top 3
    }
};
