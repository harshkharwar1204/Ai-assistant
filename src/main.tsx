import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TaskProvider } from './context/TaskContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { GroceryProvider } from './context/GroceryContext';
import { HabitProvider } from './context/HabitContext';
import { DailyTaskView } from './features/tasks/DailyTaskView';
import { TaskInput } from './features/tasks/TaskInput';
import { ExpenseView } from './features/expenses/ExpenseView';
import { GroceryView } from './features/grocery/GroceryView';
import { HabitView } from './features/habits/HabitView';
import { Dashboard } from './features/dashboard/Dashboard';
import { BottomNav } from './components/BottomNav';
import './styles/main.css';

type ViewState = 'dashboard' | 'tasks' | 'expenses' | 'grocery' | 'habits';

const App = () => {
    const [currentView, setCurrentView] = useState<ViewState>('dashboard');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [weekOffset, setWeekOffset] = useState(0);

    return (
        <TaskProvider>
            <ExpenseProvider>
                <GroceryProvider>
                    <HabitProvider>
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

                            <BottomNav currentView={currentView} setView={setCurrentView} />
                        </div>
                    </HabitProvider>
                </GroceryProvider>
            </ExpenseProvider>
        </TaskProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
