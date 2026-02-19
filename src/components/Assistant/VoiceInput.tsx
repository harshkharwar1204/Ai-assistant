'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
    onInput: (text: string) => void;
    disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onInput, disabled }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const startAlpha = new SpeechRecognition();
            startAlpha.continuous = false;
            startAlpha.interimResults = false;
            startAlpha.lang = 'en-US';

            startAlpha.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onInput(transcript);
                setIsListening(false);
            };

            startAlpha.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            startAlpha.onend = () => {
                setIsListening(false);
            };

            setRecognition(startAlpha);
        }
    }, [onInput]);

    const toggleListening = () => {
        if (!isSupported || disabled) return;

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            style={{
                background: isListening ? '#ff4d4d' : 'transparent',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                color: isListening ? 'white' : 'var(--text-secondary)'
            }}
            title="Voice Input"
        >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
    );
};
