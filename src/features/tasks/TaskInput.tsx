import React, { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { PredictionService } from '../../services/PredictionService';
import '../../styles/main.css';

interface TaskInputProps {
    selectedDate: string; // YYYY-MM-DD
}

export const TaskInput: React.FC<TaskInputProps> = ({ selectedDate }) => {
    const [title, setTitle] = useState('');
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
        addTask(title, selectedDate);
        setTitle('');
    };

    const handleSuggestionClick = (sug: string) => {
        addTask(sug, selectedDate);
        setSuggestions(prev => prev.filter(s => s !== sug));
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const dateLabel = isToday
        ? ''
        : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div style={{
            position: 'fixed',
            bottom: '130px',
            left: '20px',
            right: '20px',
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
