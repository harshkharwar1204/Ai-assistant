'use client';

import React from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Bot, MessageSquare } from 'lucide-react';

export const AssistantFab: React.FC = () => {
    const { setIsOpen, isOpen } = useAssistant();

    if (isOpen) return null; // Hide FAB when modal is open

    return (
        <button
            onClick={() => setIsOpen(true)}
            style={{
                position: 'fixed',
                bottom: '100px', // Above bottom nav
                right: '24px',
                width: '56px',
                height: '56px',
                borderRadius: '28px',
                background: 'linear-gradient(135deg, #00E599 0%, #00B377 100%)',
                boxShadow: '0 4px 20px rgba(0, 229, 153, 0.4)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                zIndex: 1000,
                cursor: 'pointer',
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            className="hover:scale-110 active:scale-95"
            aria-label="Open Assistant"
        >
            <Bot size={28} strokeWidth={2} />
        </button>
    );
};
