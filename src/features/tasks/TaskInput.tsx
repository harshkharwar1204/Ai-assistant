'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { PredictionService } from '@/services/PredictionService';
import { TaskPriority } from '@/types/task';

const PRIORITY_CYCLE: TaskPriority[] = ['none', 'high', 'medium', 'low'];
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
    none: { label: '', color: '', bg: '' },
    high: { label: '!!!', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' },
    medium: { label: '!!', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' },
    low: { label: '!', color: '#007AFF', bg: 'rgba(0, 122, 255, 0.15)' },
};

interface TaskInputProps {
    selectedDate: string; // YYYY-MM-DD
}

export const TaskInput: React.FC<TaskInputProps> = ({ selectedDate }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('none');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { addTask } = useTasks();

    useEffect(() => {
        const updatePredictions = () => {
            const preds = PredictionService.getSuggestions();
            setSuggestions(preds);
        };

        updatePredictions();
        const interval = setInterval(updatePredictions, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        addTask(title, selectedDate, undefined, priority);
        setTitle('');
        setPriority('none');
    };

    const handleSuggestionClick = (sug: string) => {
        addTask(sug, selectedDate);
        setSuggestions(prev => prev.filter(s => s !== sug));
    };

    const cyclePriority = () => {
        const currentIndex = PRIORITY_CYCLE.indexOf(priority);
        const nextIndex = (currentIndex + 1) % PRIORITY_CYCLE.length;
        setPriority(PRIORITY_CYCLE[nextIndex]);
    };

    const isToday = (() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return selectedDate === `${year}-${month}-${day}`;
    })();
    const dateLabel = isToday
        ? ''
        : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const pConfig = PRIORITY_CONFIG[priority];

    return (
        <div style={{
            position: 'fixed',
            bottom: '130px',
            left: '20px',
            right: '90px', // Avoid FAB overlap
            zIndex: 100
        }}>
            {/* AI Suggestions Chips */}
            {suggestions.length > 0 && !title && (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '12px',
                    overflowX: 'auto',
                    paddingBottom: '4px'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', color: 'var(--primary-color)', fontWeight: 600,
                        background: 'rgba(0, 229, 153, 0.1)', padding: '6px 10px', borderRadius: '16px',
                        border: '1px solid rgba(0, 229, 153, 0.2)'
                    }}>
                        <Sparkles size={12} /> Suggested
                    </div>
                    {suggestions.map(s => (
                        <button
                            key={s}
                            onClick={() => handleSuggestionClick(s)}
                            style={{
                                background: 'var(--card-bg)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--border-color)',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: 'var(--text-color)',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer'
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-panel" style={{
                display: 'flex',
                padding: '8px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                alignItems: 'center'
            }}>
                {/* Priority Toggle */}
                <button
                    type="button"
                    onClick={cyclePriority}
                    style={{
                        background: priority !== 'none' ? pConfig.bg : 'transparent',
                        border: priority !== 'none' ? `1px solid ${pConfig.color}` : '1px solid var(--border-color)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginLeft: '4px',
                        color: priority !== 'none' ? pConfig.color : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0,
                        transition: 'all 0.2s',
                    }}
                    title={`Priority: ${priority} (tap to cycle)`}
                >
                    {priority !== 'none' ? pConfig.label : '○'}
                </button>

                {!isToday && dateLabel && (
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--primary-color)',
                        background: 'rgba(0, 229, 153, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        marginLeft: '8px',
                        whiteSpace: 'nowrap'
                    }}>
                        {dateLabel}
                    </span>
                )}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isToday ? 'New task...' : `Task for ${dateLabel}...`}
                    style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        padding: '12px 16px',
                        fontSize: '16px',
                        outline: 'none',
                        color: 'var(--text-color)'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'var(--primary-color)',
                        color: '#000',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={24} />
                </button>
            </form>
        </div>
    );
};
