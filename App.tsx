import React, { useState, useEffect } from 'react';
import HistorySidebar from './components/Sidebar';
import Header from './components/Header';
import UnifiedChat from './pages/UnifiedChat';
import { useTheme } from './hooks/useTheme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ChatSession, Message, Tool } from './types';
import ApiKeyModal from './components/ApiKeyModal';
import { initializeAi, isAiAvailable } from './services/geminiService';

const App: React.FC = () => {
    useTheme();
    const [sessions, setSessions] = useLocalStorage<ChatSession[]>('oneverse-sessions', []);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [apiKey, setApiKey] = useLocalStorage<string | null>('oneverse-api-key', null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (apiKey) {
            initializeAi(apiKey);
        }
        // This marks that we've checked for the key, so we can decide what to render.
        setIsInitialized(true); 
    }, [apiKey]);

    const activeSession = sessions.find(s => s.id === activeSessionId);

    useEffect(() => {
        if (!isAiAvailable()) return;

        if (sessions.length > 0 && !activeSessionId) {
            setActiveSessionId(sessions[0].id);
        } else if (sessions.length === 0) {
            handleNewSession();
        }
    }, [sessions, activeSessionId, apiKey]);

    const handleKeySubmit = (key: string) => {
        setApiKey(key);
    };

    const handleNewSession = () => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
        };
        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        setActiveSessionId(newSession.id);
    };

    const handleDeleteSession = (sessionId: string) => {
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);
        if (activeSessionId === sessionId) {
            setActiveSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
        }
    };

    const handleRenameSession = (sessionId: string, newTitle: string) => {
        setSessions(sessions.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
    };

    const updateMessages = (newMessages: Message[]) => {
        if (!activeSessionId) return;
        const updatedSessions = sessions.map(s =>
            s.id === activeSessionId ? { ...s, messages: newMessages } : s
        );
        setSessions(updatedSessions);
    };
    
    const getHeaderTitle = () => {
        if (!activeSession) return "OneVerse AI";
        const lastUserMessage = [...activeSession.messages].reverse().find(m => m.sender === 'user');
        if (lastUserMessage?.tool) {
            return lastUserMessage.tool;
        }
        return "AI Chat";
    }

    if (!isInitialized) {
        // Render nothing while checking for the key to prevent flashes of content
        return null;
    }

    if (!apiKey) {
        return <ApiKeyModal onKeySubmit={handleKeySubmit} />;
    }

    return (
        <div className="flex h-screen bg-dark-bg text-white font-sans">
            <HistorySidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSessionSelect={setActiveSessionId}
                onNewSession={handleNewSession}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
            />
            <main className="flex-1 flex flex-col">
                 <Header pageTitle={getHeaderTitle()} />
                <div className="flex-1 p-6 pt-0 overflow-y-auto">
                    {activeSession ? (
                        <UnifiedChat
                            key={activeSession.id} // Re-mount component when session changes
                            session={activeSession}
                            updateMessages={updateMessages}
                        />
                    ) : (
                         <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select or create a new chat.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
