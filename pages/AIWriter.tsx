
import React, { useState } from 'react';
import { Tone } from '../types';
import { generateTextWithTone } from '../services/geminiService';
import { CopyIcon, DownloadIcon } from '../components/icons/Icons';

const AIWriter: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState<Tone>(Tone.Casual);
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setGeneratedContent('');
        const content = await generateTextWithTone(prompt, tone);
        setGeneratedContent(content);
        setIsLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([generatedContent], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "oneverse-ai-writer-output.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };
    
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4 text-white">Your Prompt</h2>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Write a short email to my team about the upcoming project deadline..."
                    className="w-full h-32 p-3 bg-dark-card/80 border border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-colors"
                    disabled={isLoading}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                    <div>
                        <label htmlFor="tone-select" className="block text-sm font-medium text-gray-400 mb-2">Select Tone</label>
                        <select
                            id="tone-select"
                            value={tone}
                            onChange={(e) => setTone(e.target.value as Tone)}
                            className="bg-dark-card/80 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                            disabled={isLoading}
                        >
                            {Object.values(Tone).map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform transition-transform duration-300"
                    >
                        {isLoading ? 'Generating...' : 'Generate Content'}
                    </button>
                </div>
            </div>

            {(isLoading || generatedContent) && (
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">Generated Content</h2>
                        {generatedContent && !isLoading && (
                            <div className="flex items-center space-x-2">
                                <button onClick={handleCopy} className="p-2 rounded-md hover:bg-white/10 text-gray-300 transition-colors">
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                 <button onClick={handleDownload} className="p-2 rounded-md hover:bg-white/10 text-gray-300 transition-colors">
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    {isLoading ? (
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-700/50 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">{generatedContent}</div>
                    )}
                     {copied && <div className="text-center mt-4 text-sm text-green-400">Copied to clipboard!</div>}
                </div>
            )}
        </div>
    );
};

export default AIWriter;
