import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateChatResponseStream } from '../services/geminiService';
import { Message } from '../types';
import { SendIcon, MicIcon, VolumeUpIcon, VolumeOffIcon, TrashIcon, StopIcon } from '../components/icons/Icons';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}
declare global {
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition };
        webkitSpeechRecognition: { new (): SpeechRecognition };
    }
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-brand-cyan rounded-full animate-typing-dot"></div>
        <div className="w-2 h-2 bg-brand-cyan rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-brand-cyan rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={index}>{part.slice(1, -1)}</em>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={index} className="bg-dark-card px-1 py-0.5 rounded text-sm text-brand-cyan">{part.slice(1, -1)}</code>;
                }
                return part;
            })}
        </>
    );
};

const AIChat: React.FC = () => {
    const [messages, setMessages] = useLocalStorage<Message[]>('oneverse-chat', []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isTtsEnabled, setIsTtsEnabled] = useLocalStorage('oneverse-tts-enabled', false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stopStreamRef = useRef(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const speak = (text: string) => {
        if (isTtsEnabled && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async (textToSend?: string) => {
        const messageText = (textToSend || input).trim();
        if (!messageText) return;
        stopStreamRef.current = false;

        const newUserMessage: Message = { id: Date.now().toString(), text: messageText, sender: 'user' };
        const currentMessages = [...messages, newUserMessage];
        setMessages(currentMessages);
        setInput('');
        setIsLoading(true);

        const history = currentMessages.slice(0, -1).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        })) as { role: 'user' | 'model', parts: { text: string }[] }[];
        
        const newAiMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: newAiMessageId, text: '', sender: 'ai' }]);
        
        let fullResponse = "";
        try {
            const stream = generateChatResponseStream(history, messageText);
            for await (const chunk of stream) {
                if (stopStreamRef.current) break;
                fullResponse += chunk;
                setMessages(prev => prev.map(m => m.id === newAiMessageId ? { ...m, text: fullResponse } : m));
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(m => m.id === newAiMessageId ? { ...m, text: "An error occurred." } : m));
        } finally {
            setIsLoading(false);
            stopStreamRef.current = false;
            speak(fullResponse);
        }
    };

    const handleStop = () => {
        stopStreamRef.current = true;
    };
    
    const toggleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto animate-fade-in">
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan flex-shrink-0"></div>}
                        <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-purple text-white rounded-br-none' : 'glass-card text-gray-200 rounded-bl-none'}`}>
                            {msg.sender === 'ai' && msg.text === '' && isLoading ? <TypingIndicator /> : <p className="text-sm md:text-base leading-relaxed"><SimpleMarkdownRenderer text={msg.text} /></p>}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-6">
                {isLoading && (
                    <div className="text-center mb-2">
                        <button onClick={handleStop} className="flex items-center gap-2 mx-auto px-4 py-1 bg-dark-card/80 border border-white/10 rounded-full text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors">
                           <StopIcon className="w-5 h-5" /> Stop Generating
                        </button>
                    </div>
                )}
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder={isListening ? "Listening..." : "Ask OneVerse anything..."}
                        disabled={isLoading}
                        className="w-full pl-5 pr-28 py-3 bg-dark-card/80 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center space-x-2">
                        <button
                            onClick={toggleListen}
                            disabled={!recognitionRef.current || isLoading}
                            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50'}`}
                        >
                            <MicIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleSend()} disabled={isLoading || !input} className="p-2 rounded-full bg-brand-cyan text-dark-bg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-brand-cyan/80 transition-colors">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                 <div className="flex justify-between items-center mt-3 text-xs text-gray-500 px-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsTtsEnabled(!isTtsEnabled)} className="flex items-center gap-1 hover:text-gray-300">
                            {isTtsEnabled ? <VolumeUpIcon className="w-4 h-4 text-brand-cyan" /> : <VolumeOffIcon className="w-4 h-4" />}
                            <span>{isTtsEnabled ? "ON" : "OFF"}</span>
                        </button>
                    </div>
                    {messages.length > 0 && <button onClick={() => {if (!isLoading) setMessages([])}} className="flex items-center gap-1 hover:text-red-400 transition-colors disabled:opacity-50" disabled={isLoading}>
                        <TrashIcon className="w-4 h-4" /> Clear Chat
                    </button>}
                </div>
            </div>
        </div>
    );
};

export default AIChat;