
import React, { useState } from 'react';
import { ChatSession } from '../types';
import { PlusIcon, ChatIcon, TrashIcon, PencilIcon, CheckIcon, XIcon } from './icons/Icons';

interface HistorySidebarProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSessionSelect: (id: string) => void;
    onNewSession: () => void;
    onDeleteSession: (id: string) => void;
    onRenameSession: (id: string, newTitle: string) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
    sessions,
    activeSessionId,
    onSessionSelect,
    onNewSession,
    onDeleteSession,
    onRenameSession,
}) => {
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameText, setRenameText] = useState('');

    const handleStartRename = (session: ChatSession) => {
        setRenamingId(session.id);
        setRenameText(session.title);
    };

    const handleConfirmRename = () => {
        if (renamingId && renameText.trim()) {
            onRenameSession(renamingId, renameText.trim());
        }
        setRenamingId(null);
        setRenameText('');
    };
    
    const handleCancelRename = () => {
        setRenamingId(null);
        setRenameText('');
    }

    return (
        <aside className="hidden md:flex w-72 glass-card p-4 flex-col">
            <div className="flex items-center justify-between gap-2 mb-6">
                 <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-purple to-brand-cyan"></div>
                    <h1 className="text-xl font-bold text-white">OneVerse</h1>
                </div>
                <button onClick={onNewSession} className="p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <h2 className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">Chat History</h2>
            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => onSessionSelect(session.id)}
                        className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors duration-200 ${
                            activeSessionId === session.id
                                ? 'bg-brand-cyan/20'
                                : 'hover:bg-white/5'
                        }`}
                    >
                        {renamingId === session.id ? (
                            <div className="flex items-center w-full">
                                <input
                                    type="text"
                                    value={renameText}
                                    onChange={(e) => setRenameText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleConfirmRename();
                                        if (e.key === 'Escape') handleCancelRename();
                                    }}
                                    className="flex-grow bg-transparent text-sm focus:outline-none ring-1 ring-brand-cyan rounded px-1"
                                    autoFocus
                                />
                                <button onClick={(e) => { e.stopPropagation(); handleConfirmRename(); }} className="ml-2 text-green-400 hover:text-green-300"><CheckIcon className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleCancelRename(); }} className="ml-1 text-red-400 hover:text-red-300"><XIcon className="w-4 h-4" /></button>
                            </div>
                        ) : (
                             <>
                                <div className="flex items-center gap-3 truncate">
                                    <ChatIcon className={`w-5 h-5 ${activeSessionId === session.id ? 'text-brand-cyan' : 'text-gray-400'}`} />
                                    <span className={`text-sm truncate ${activeSessionId === session.id ? 'text-white font-semibold' : 'text-gray-300'}`}>{session.title}</span>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleStartRename(session); }} className="p-1 text-gray-400 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </nav>
            <div className="mt-auto text-center text-xs text-gray-500">
                <p>&copy; {new Date().getFullYear()} OneVerse AI.</p>
            </div>
        </aside>
    );
};

export default HistorySidebar;
