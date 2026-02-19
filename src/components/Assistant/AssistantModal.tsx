'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { X, Send } from 'lucide-react';
import { VoiceInput } from './VoiceInput';

export const AssistantModal: React.FC = () => {
    const { isOpen, setIsOpen, messages, sendMessage, isTyping } = useAssistant();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        await sendMessage(input);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center'
        }} onClick={() => setIsOpen(false)}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '80vh',
                    background: 'var(--bg-color)',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#00E599',
                            boxShadow: '0 0 10px #00E599'
                        }} />
                        <h2 style={{ margin: 0, fontSize: '18px' }}>Assistant</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                            borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                            background: msg.role === 'user' ? 'var(--primary-color)' : 'var(--card-bg)',
                            color: msg.role === 'user' ? 'black' : 'var(--text-color)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            fontSize: '15px',
                            lineHeight: '1.5'
                        }}>
                            {msg.content}
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{
                            alignSelf: 'flex-start',
                            background: 'var(--card-bg)',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            borderTopLeftRadius: '4px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px',
                            display: 'flex',
                            gap: '4px'
                        }}>
                            <span>•</span><span>•</span><span>•</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSend}
                    style={{
                        padding: '16px 20px', // Increased padding
                        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
                        borderTop: '1px solid var(--border-color)', // Added border
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        background: 'var(--bg-color)' // Ensure opaque background
                    }}
                >
                    <VoiceInput onInput={(text) => setInput(text)} />

                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type or speak..."
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)', // Slightly distinct bg
                            color: 'var(--text-color)',
                            fontSize: '16px',
                            outline: 'none'
                        }}
                    />

                    <button
                        type="submit"
                        disabled={!input.trim()}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: input.trim() ? 'var(--primary-color)' : 'var(--border-color)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: input.trim() ? 'black' : 'var(--text-secondary)',
                            cursor: input.trim() ? 'pointer' : 'default',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};
