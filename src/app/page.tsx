'use client';

import React, { useState } from 'react';
import { TaskProvider } from '@/context/TaskContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { GroceryProvider } from '@/context/GroceryContext';
import { HabitProvider } from '@/context/HabitContext';
import { DailyTaskView } from '@/features/tasks/DailyTaskView';
import { TaskInput } from '@/features/tasks/TaskInput';
import { ExpenseView } from '@/features/expenses/ExpenseView';
import { GroceryView } from '@/features/grocery/GroceryView';
import { HabitView } from '@/features/habits/HabitView';
import { ChatbotView } from '@/features/chat/ChatbotView';

import { Dashboard } from '@/features/dashboard/Dashboard';
import { BottomNav } from '@/components/BottomNav';
import { AssistantProvider } from '@/context/AssistantContext';
import { AssistantFab } from '@/components/Assistant/AssistantFab';
import { AssistantModal } from '@/components/Assistant/AssistantModal';

type ViewState = 'chat' | 'dashboard' | 'tasks' | 'expenses' | 'grocery' | 'habits';

export default function Home() {
    const [currentView, setCurrentView] = useState<ViewState>('chat');
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [weekOffset, setWeekOffset] = useState(0);
    const [isNavOpen, setIsNavOpen] = useState(false);

    return (
        <TaskProvider>
            <ExpenseProvider>
                <GroceryProvider>
                    <HabitProvider>
                        <AssistantProvider>
                            <div style={{
                                height: '100dvh',
                                width: '100vw',
                                paddingTop: 'env(safe-area-inset-top)',
                                backgroundColor: 'var(--bg-color)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                                    <div key={currentView} className="page-transition" style={{ height: '100%', overflow: 'auto' }}>
                                        {currentView === 'chat' && <ChatbotView />}
                                        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}

                                        {currentView === 'tasks' && (
                                            <>
                                                <DailyTaskView
                                                    selectedDate={selectedDate}
                                                    onSelectDate={setSelectedDate}
                                                    weekOffset={weekOffset}
                                                    onWeekChange={setWeekOffset}
                                                />
                                                <TaskInput selectedDate={selectedDate} />
                                            </>
                                        )}

                                        {currentView === 'expenses' && <ExpenseView />}

                                        {currentView === 'grocery' && <GroceryView />}

                                        {currentView === 'habits' && <HabitView />}
                                    </div>
                                </div>


                                {(currentView !== 'chat' || isNavOpen) && (
                                    <BottomNav
                                        currentView={currentView}
                                        setView={(v) => { setCurrentView(v); setIsNavOpen(false); }}
                                        variant={currentView === 'chat' ? 'vertical' : 'horizontal'}
                                    />
                                )}

                                {currentView !== 'chat' && <AssistantFab />}

                                {/* Chat Menu Button (Green Speed Dial) */}
                                {currentView === 'chat' && !isNavOpen && (
                                    <button
                                        onClick={() => setIsNavOpen(true)}
                                        style={{
                                            position: 'fixed',
                                            bottom: '24px',
                                            right: '24px',
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-color)', // Green #00E599
                                            border: 'none',
                                            color: '#000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 1000,
                                            boxShadow: '0 8px 32px rgba(0,229,153,0.3)', // Green glow
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="3" y1="12" x2="21" y2="12"></line>
                                            <line x1="3" y1="6" x2="21" y2="6"></line>
                                            <line x1="3" y1="18" x2="21" y2="18"></line>
                                        </svg>
                                    </button>
                                )}

                                <AssistantModal />
                            </div>
                        </AssistantProvider>
                    </HabitProvider>
                </GroceryProvider>
            </ExpenseProvider>
        </TaskProvider>
    );
}
