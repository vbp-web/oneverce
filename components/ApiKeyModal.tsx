import React, { useState } from 'react';

interface ApiKeyModalProps {
    onKeySubmit: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-dark-bg bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-card p-8 rounded-2xl w-full max-w-md text-center border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4">Enter Your Gemini API Key</h2>
                <p className="text-gray-400 mb-6">
                    To use the AI features of OneVerse, please provide your Google Gemini API key. Your key will be stored securely in your browser's local storage.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key here"
                        className="w-full px-4 py-3 bg-dark-card/80 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!apiKey.trim()}
                        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform transition-transform duration-300"
                    >
                        Save and Continue
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-4">
                    You can get your API key from{' '}
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-cyan hover:underline"
                    >
                        Google AI Studio
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyModal;
