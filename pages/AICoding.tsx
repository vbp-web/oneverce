import React, { useState, useMemo } from 'react';
import { generateCode } from '../services/geminiService';
import { CopyIcon } from '../components/icons/Icons';

const keywords: { [key: string]: RegExp } = {
    javascript: /\b(const|let|var|function|return|if|else|for|while|import|export|from|as|async|await|new|this|class|extends|super)\b/g,
    python: /\b(def|return|if|elif|else|for|while|import|from|as|class|try|except|finally|with|lambda|True|False|None)\b/g,
    html: /(&lt;[a-zA-Z0-9]+|&lt;\/[a-zA-Z0-9]+&gt;)/g,
    css: /(?<![:\s])([a-zA-Z-]+)(?=:)/g,
    sql: /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DATABASE|ALTER|DROP|INNER|LEFT|RIGHT|JOIN|ON)\b/gi,
};
const comments = /(\/\*[\s\S]*?\*\/|\/\/.*)/g;
const strings = /(".*?"|'.*?'|`.*?`)/g;

const SyntaxHighlighter: React.FC<{ code: string; language: string }> = React.memo(({ code, language }) => {
    const highlightedCode = useMemo(() => {
        let tempCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return tempCode
            .replace(keywords[language] || '', '<span class="text-pink-400">$1</span>')
            .replace(strings, '<span class="text-green-400">$1</span>')
            .replace(comments, '<span class="text-gray-500">$1</span>');

    }, [code, language]);

    return (
        <pre className="p-4 text-sm text-gray-200 overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
    );
});


const AICoding: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setGeneratedCode('');
        const code = await generateCode(prompt, language);
        setGeneratedCode(code);
        setIsLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const languages = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Swift', 'Go', 'Ruby', 'HTML', 'CSS', 'SQL'
    ];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4 text-white">AI Coding Assistant</h2>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Create a React component for a responsive button..."
                    className="w-full h-32 p-3 bg-dark-card/80 border border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-colors"
                    disabled={isLoading}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                    <div>
                        <label htmlFor="lang-select" className="block text-sm font-medium text-gray-400 mb-2">Select Language</label>
                        <select
                            id="lang-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-dark-card/80 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                            disabled={isLoading}
                        >
                            {languages.map((lang) => <option key={lang} value={lang.toLowerCase()}>{lang}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform transition-transform duration-300"
                    >
                        {isLoading ? 'Generating...' : 'Generate Code'}
                    </button>
                </div>
            </div>

            {(isLoading || generatedCode) && (
                <div className="glass-card p-1 rounded-2xl">
                    <div className="flex justify-between items-center mb-2 px-4 pt-4">
                        <h2 className="text-xl font-semibold text-white">Generated Code</h2>
                        {generatedCode && !isLoading && (
                            <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 text-gray-300 rounded-md hover:bg-white/20 transition-colors">
                                <CopyIcon className="w-4 h-4" />
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        )}
                    </div>
                    <div className="bg-dark-card/80 rounded-b-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-gray-700/50 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
                        </div>
                    ) : (
                        <SyntaxHighlighter code={generatedCode} language={language} />
                    )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AICoding;