
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, Message, Tool, Tone, AspectRatio } from '../types';
import { generateChatResponseStream, generateTextWithTone, generateCode, generateImageFromPrompt } from '../services/geminiService';
import { SendIcon, MicIcon, StopIcon, SparklesIcon, WriterIcon, CodeIcon, ImageIcon, PlannerIcon, NotesIcon, CopyIcon, DownloadIcon } from '../components/icons/Icons';
import Planner from './Planner';
import Notes from './Notes';

interface UnifiedChatProps {
    session: ChatSession;
    updateMessages: (messages: Message[]) => void;
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
                if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
                if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
                if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="bg-dark-card px-1 py-0.5 rounded text-sm text-brand-cyan">{part.slice(1, -1)}</code>;
                return part;
            })}
        </>
    );
};

const UnifiedChat: React.FC<UnifiedChatProps> = ({ session, updateMessages }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTool, setActiveTool] = useState<Tool>(Tool.Chat);
    const [showToolSelector, setShowToolSelector] = useState(false);

    // Tool-specific states
    const [tone, setTone] = useState<Tone>(Tone.Casual);
    const [language, setLanguage] = useState('javascript');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stopStreamRef = useRef(false);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || [Tool.Planner, Tool.Notes].includes(activeTool)) return;

        stopStreamRef.current = false;
        const newUserMessage: Message = { id: Date.now().toString(), text: input, sender: 'user', tool: activeTool };
        const currentMessages = [...session.messages, newUserMessage];
        updateMessages(currentMessages);
        setInput('');
        setIsLoading(true);

        const newAiMessageId = (Date.now() + 1).toString();
        let newAiMessage: Message = { id: newAiMessageId, text: '', sender: 'ai', tool: activeTool };
        
        // Add placeholder AI message
        updateMessages([...currentMessages, newAiMessage]);

        try {
            switch (activeTool) {
                case Tool.Chat:
                    const history = currentMessages.slice(0, -1).map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }],
                    })) as { role: 'user' | 'model', parts: { text: string }[] }[];
                    
                    let fullResponse = "";
                    const stream = generateChatResponseStream(history, newUserMessage.text);
                    for await (const chunk of stream) {
                        if (stopStreamRef.current) break;
                        fullResponse += chunk;
                        updateMessages([...currentMessages, { ...newAiMessage, text: fullResponse }]);
                    }
                    break;

                case Tool.Writer:
                    const content = await generateTextWithTone(newUserMessage.text, tone);
                    updateMessages([...currentMessages, { ...newAiMessage, text: content }]);
                    break;

                case Tool.Code:
                    const code = await generateCode(newUserMessage.text, language);
                    newAiMessage.code = { language, content: code };
                    updateMessages([...currentMessages, newAiMessage]);
                    break;

                case Tool.Image:
                    const url = await generateImageFromPrompt(newUserMessage.text, aspectRatio);
                    newAiMessage.imageUrl = url ?? undefined;
                    newAiMessage.text = url ? "" : "Failed to generate image.";
                    updateMessages([...currentMessages, newAiMessage]);
                    break;
            }
        } catch (error) {
            console.error(error);
            updateMessages([...currentMessages, { ...newAiMessage, text: "An error occurred." }]);
        } finally {
            setIsLoading(false);
            stopStreamRef.current = false;
        }
    };
    
    const handleStop = () => {
        stopStreamRef.current = true;
    };

    const tools = [
        { name: Tool.Chat, icon: SparklesIcon },
        { name: Tool.Writer, icon: WriterIcon },
        { name: Tool.Code, icon: CodeIcon },
        { name: Tool.Image, icon: ImageIcon },
        { name: Tool.Planner, icon: PlannerIcon },
        { name: Tool.Notes, icon: NotesIcon },
    ];

    const renderToolContent = () => {
        if (activeTool === Tool.Planner) return <Planner />;
        if (activeTool === Tool.Notes) return <Notes />;
        
        return (
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {session.messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan flex-shrink-0"></div>}
                        <div className={`max-w-md lg:max-w-2xl p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-purple text-white rounded-br-none' : 'glass-card text-gray-200 rounded-bl-none'}`}>
                            {msg.sender === 'ai' && msg.text === '' && !msg.imageUrl && isLoading ? <TypingIndicator /> : <p className="text-sm md:text-base leading-relaxed"><SimpleMarkdownRenderer text={msg.text} /></p>}
                            {msg.imageUrl && <img src={msg.imageUrl} alt="Generated" className="rounded-lg mt-2" />}
                            {msg.code && (
                                <div className="bg-dark-card/80 rounded-lg mt-2 w-full">
                                   <div className="flex justify-between items-center text-xs px-4 py-1.5 bg-black/20 rounded-t-lg">
                                       <span className="text-gray-400">{msg.code.language}</span>
                                       <button onClick={() => navigator.clipboard.writeText(msg.code?.content || '')} className="flex items-center gap-1.5 text-gray-400 hover:text-white"><CopyIcon className="w-3 h-3" /> Copy</button>
                                   </div>
                                    <pre className="p-4 text-sm text-gray-200 overflow-x-auto"><code>{msg.code.content}</code></pre>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        )
    };
    
    const renderToolOptions = () => {
        switch(activeTool) {
            case Tool.Writer:
                return (
                     <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="text-xs bg-dark-card/80 border border-white/10 rounded-full py-1 px-3 text-gray-300 focus:outline-none">
                        {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                );
            case Tool.Code:
                 return (
                     <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-xs bg-dark-card/80 border border-white/10 rounded-full py-1 px-3 text-gray-300 focus:outline-none">
                         {['javascript', 'python', 'html', 'css', 'sql'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                );
            case Tool.Image:
                return (
                    <div className="flex gap-1">
                        {Object.values(AspectRatio).map(r => <button key={r} onClick={() => setAspectRatio(r)} className={`text-xs px-2 py-0.5 rounded-full ${aspectRatio === r ? 'bg-brand-cyan text-dark-bg' : 'bg-dark-card/80 text-gray-300'}`}>{r}</button>)}
                    </div>
                )
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto animate-fade-in">
            {renderToolContent()}

            <div className="mt-6">
                {isLoading && (
                    <div className="text-center mb-2">
                        <button onClick={handleStop} className="flex items-center gap-2 mx-auto px-4 py-1 bg-dark-card/80 border border-white/10 rounded-full text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors">
                           <StopIcon className="w-5 h-5" /> Stop Generating
                        </button>
                    </div>
                )}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <button onClick={() => setShowToolSelector(!showToolSelector)} className="p-2 rounded-full hover:bg-white/10 text-brand-cyan transition-colors">
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        {showToolSelector && (
                            <div className="absolute bottom-full mb-2 w-48 glass-card rounded-xl p-2 animate-fade-in" onMouseLeave={() => setShowToolSelector(false)}>
                                {tools.map(tool => (
                                    <button key={tool.name} onClick={() => { setActiveTool(tool.name); setShowToolSelector(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left ${activeTool === tool.name ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                                        <tool.icon className="w-5 h-5" /> {tool.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder={`Ask ${activeTool}...`}
                        disabled={isLoading || [Tool.Planner, Tool.Notes].includes(activeTool)}
                        className="w-full pl-14 pr-16 py-3 bg-dark-card/80 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        <button onClick={handleSend} disabled={isLoading || !input || [Tool.Planner, Tool.Notes].includes(activeTool)} className="p-2 rounded-full bg-brand-cyan text-dark-bg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-brand-cyan/80 transition-colors">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                 <div className="flex justify-between items-center mt-3 text-xs text-gray-500 px-4">
                    <div className="flex items-center gap-2">
                        {renderToolOptions()}
                    </div>
                     <p>Use the ✨ button to switch between AI tools.</p>
                </div>
            </div>
        </div>
    );
};

export default UnifiedChat;
