'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Mic, MicOff, Send, Paperclip, Sparkles, BookOpen, Gift, Smile, Dumbbell, Calendar } from 'lucide-react';

export const ChatbotView: React.FC = () => {
    const { messages, sendMessage, isTyping } = useAssistant();
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInputValue(transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, []);

    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setInputValue('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Quick suggestions
    const suggestions = [
        { icon: <Gift size={16} />, label: 'Gift Ideas', prompt: 'I need gift ideas for...' },
        { icon: <Calendar size={16} />, label: 'Weekend plan', prompt: 'Plan a weekend itinerary for...' },
        { icon: <Smile size={16} />, label: 'Tell me a joke', prompt: 'Tell me a funny joke' },
        { icon: <Dumbbell size={16} />, label: 'Workout ideas', prompt: 'Give me a 30 min workout routine' },
        { icon: <BookOpen size={16} />, label: 'Read a story', prompt: 'Tell me a short bedtime story' },
        { icon: <Sparkles size={16} />, label: 'Surprise me', prompt: 'Tell me an interesting fun fact' },
    ];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            background: '#0a0a0a', // Fallback
            color: '#fff',
            overflow: 'hidden'
        }}>
            {/* Green Pulse Background Layer */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(0, 229, 153, 0.15) 0%, transparent 70%)',
                animation: 'pulse-bg 4s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Overlay to darken/texture if needed */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("/noise.png") opacity(0.05)', // Optional texture
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header / Greeting Area - Centered when no messages/few messages, otherwise top */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: messages.length <= 1 ? 'center' : 'flex-start',
                    paddingBottom: '140px' // Space for input area
                }}>
                    {messages.length <= 1 ? (
                        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ fontSize: '16px', color: '#888', marginBottom: '8px' }}>Hey Boss 👋</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                What's on your mind?
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {messages.slice(1).map((msg, idx) => ( // Skip initial greeting system msg if desired, or keep it
                                <div key={idx} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    padding: '12px 16px',
                                    borderRadius: '20px',
                                    borderTopRightRadius: msg.role === 'user' ? '4px' : '20px',
                                    borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '20px',
                                    background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                    color: msg.role === 'user' ? '#000' : '#fff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    fontSize: '15px',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.content}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                                        <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.16s' }}></span>
                                        <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.32s' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Bottom Controls Area */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '16px 110px 16px 16px', // Increased right padding for FAB overlap
                    background: 'linear-gradient(0deg, #0a0a0a 80%, transparent 100%)',
                    zIndex: 10
                }}>
                    {/* Suggestion Chips */}
                    {messages.length <= 1 && (
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            paddingBottom: '16px',
                            marginBottom: '8px',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(s.prompt)}
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '8px 16px',
                                        borderRadius: '100px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {s.icon} {s.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: '8px 8px 8px 16px',
                        borderRadius: '32px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Paperclip size={20} color="#888" style={{ cursor: 'pointer' }} />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '16px',
                                outline: 'none',
                                padding: '8px 0'
                            }}
                        />

                        {inputValue.trim() ? (
                            <button
                                onClick={handleSend}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-color)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#000'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={toggleListening}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: isListening
                                        ? 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)'
                                        : 'linear-gradient(135deg, #6e45e2 0%, #88d3ce 100%)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {/* Pulsating Effect Layer */}
                                {isListening && (
                                    <div style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        background: 'inherit',
                                        animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                                        opacity: 0.5,
                                        zIndex: -1
                                    }}></div>
                                )}
                                {isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
                            </button>
                        )}
                    </div>
                </div>

                <style jsx>{`
                @keyframes bounce {
                    0%, 100% { transform: scale(0); }
                    50% { transform: scale(1); }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-bg {
                    0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.5; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.5; }
                }
            `}</style>
            </div>
        </div>
    );
};
