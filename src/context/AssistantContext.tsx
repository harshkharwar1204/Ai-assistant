'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTasks } from '@/context/TaskContext';
import { useHabits } from '@/context/HabitContext';
import { useGrocery } from '@/context/GroceryContext';
import { useExpenses } from '@/context/ExpenseContext';

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type AssistantContextType = {
    messages: Message[];
    sendMessage: (content: string) => Promise<void>;
    isTyping: boolean;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your Life OS Assistant. How can I help you today?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Contexts for tool execution
    const { addTask, clearTasksByDate } = useTasks();
    const { addHabit } = useHabits();
    const { addItem: addGrocery, clearPantry } = useGrocery();
    const { addExpense } = useExpenses();

    const sendMessage = async (content: string) => {
        const userMsg: Message = { role: 'user', content };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const res = await fetch('/api/assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content, history: messages.slice(-5) }) // Send last 5 for context
            });

            if (!res.ok) throw new Error('Failed to fetch response');

            const data = await res.json();

            let responseText = data.message;

            // Handle Tool Calls (Support multiple)
            const requests = data.requests || (data.tool ? [{ tool: data.tool, args: data.args }] : []);

            for (const req of requests) {
                console.log('Executing Tool:', req.tool, req.args);

                switch (req.tool) {
                    case 'addTask':
                        addTask(req.args.title, req.args.date, req.args.time);
                        break;
                    case 'addHabit':
                        addHabit(req.args.name);
                        break;
                    case 'addGrocery':
                        addGrocery(req.args.name, req.args.category || 'Other');
                        break;
                    case 'logExpense':
                        addExpense({
                            amount: req.args.amount,
                            category: req.args.category,
                            note: req.args.description,
                            date: new Date().toISOString()
                        });
                        break;
                    case 'clearPantry':
                        clearPantry();
                        break;
                    case 'clearTasks':
                        if (req.args?.date) {
                            clearTasksByDate(req.args.date);
                        }
                        break;
                    default:
                        console.warn('Unknown tool:', req.tool);
                }
                // Small delay to ensure state updates don't clash if needed (usually fine in React 18 batching)
            }

            const assistantMsg: Message = { role: 'assistant', content: responseText };
            setMessages(prev => [...prev, assistantMsg]);

        } catch (error) {
            console.error('Assistant Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <AssistantContext.Provider value={{ messages, sendMessage, isTyping, isOpen, setIsOpen }}>
            {children}
        </AssistantContext.Provider>
    );
};

export const useAssistant = () => {
    const context = useContext(AssistantContext);
    if (!context) throw new Error('useAssistant must be used within an AssistantProvider');
    return context;
};
