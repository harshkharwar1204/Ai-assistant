'use client';

import React, { useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { useExpenses } from '@/context/ExpenseContext';
import { useHabits } from '@/context/HabitContext';
import { useGrocery } from '@/context/GroceryContext';
import { analyzeData } from '@/services/IntelligenceService';
import { CheckCircle, TrendingUp, Flame, ShoppingBag, ArrowRight, Lightbulb } from 'lucide-react';
import { Header } from '@/components/Header';

interface DashboardProps {
    onNavigate: (view: 'tasks' | 'expenses' | 'grocery' | 'habits') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { tasks } = useTasks();
    const { getDailyTotal } = useExpenses();
    const { habits } = useHabits();
    const { shoppingList } = useGrocery();

    // Task Stats
    const today = new Date().setHours(0, 0, 0, 0);
    const todaysTasks = tasks.filter(t => new Date(t.createdAt).setHours(0, 0, 0, 0) === today);
    const completedTasks = todaysTasks.filter(t => t.status === 'completed').length;
    const totalTasks = todaysTasks.length;
    const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    // Insights
    const insights = useMemo(() =>
        analyzeData(tasks, getDailyTotal(), habits, shoppingList),
        [tasks, getDailyTotal, habits, shoppingList]
    );

    return (
        <div style={{ padding: '24px 24px', paddingBottom: '120px', height: '100%', overflowY: 'auto' }}>
            <Header />

            {/* Smart Insights */}
            {insights.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Insights
                    </h2>
                    <div className="flex flex-col gap-4">
                        {insights.map(insight => (
                            <div key={insight.id} className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'start', borderColor: 'var(--border-color)' }}>
                                <Lightbulb size={20} color="var(--primary-color)" />
                                <div>
                                    <div style={{ fontSize: '15px', lineHeight: '1.5', color: '#eee' }}>{insight.message}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h1 style={{ fontSize: '32px', marginBottom: '40px' }}>Overview</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                {/* Execution Card */}
                <div
                    className="card card-highlight"
                    onClick={() => onNavigate('tasks')}
                    style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '10px', background: 'rgba(0, 229, 153, 0.1)', borderRadius: '10px' }}>
                                <CheckCircle size={24} color="var(--primary-color)" />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '20px' }}>Execution</span>
                        </div>
                        <ArrowRight size={24} color="var(--text-secondary)" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '56px', fontWeight: 'bold', lineHeight: 1 }}>{Math.round(progress)}%</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>completed</div>
                    </div>

                    <div style={{ height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary-color)', borderRadius: '3px', boxShadow: '0 0 12px var(--primary-color)' }} />
                    </div>
                </div>

                {/* Grid for Wallet & Habits */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    {/* Wallet */}
                    <div className="card card-highlight" onClick={() => onNavigate('expenses')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ color: 'var(--primary-color)', marginBottom: 'auto' }}>
                            <TrendingUp size={28} />
                        </div>
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>₹{getDailyTotal().toFixed(2)}</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Spent today</div>
                        </div>
                    </div>

                    {/* Habits */}
                    <div className="card card-highlight" onClick={() => onNavigate('habits')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ color: 'var(--primary-color)', marginBottom: 'auto' }}>
                            <Flame size={28} />
                        </div>
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                                {habits.filter(h => h.streak > 0).length}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active streaks</div>
                        </div>
                    </div>
                </div>

                {/* Restock Alert */}
                {shoppingList.length > 0 && (
                    <div className="card" onClick={() => onNavigate('grocery')} style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        borderColor: 'var(--danger-color)',
                        background: 'rgba(255, 69, 58, 0.05)'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'rgba(255, 69, 58, 0.1)',
                            color: 'var(--danger-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ShoppingBag size={28} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--danger-color)', fontSize: '18px' }}>Restock Needed</div>
                            <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>{shoppingList.length} items are low</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
