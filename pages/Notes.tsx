
import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Note } from '../types';
import { PlusIcon, SearchIcon, TrashIcon } from '../components/icons/Icons';

const Notes: React.FC = () => {
    const [notes, setNotes] = useLocalStorage<Note[]>('oneverse-notes', []);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                note.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [notes, searchTerm]);

    const handleNewNote = () => {
        setIsCreating(true);
        setSelectedNote({ id: '', title: '', content: '', createdAt: new Date().toISOString() });
    };

    const handleSaveNote = () => {
        if (!selectedNote || !selectedNote.title.trim()) return;

        if (isCreating) {
            const newNote = { ...selectedNote, id: Date.now().toString(), createdAt: new Date().toISOString() };
            setNotes(prev => [newNote, ...prev]);
        } else {
            setNotes(prev => prev.map(n => n.id === selectedNote.id ? selectedNote : n));
        }
        setIsCreating(false);
        setSelectedNote(null);
    };

    const handleDeleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNote?.id === id) {
            setSelectedNote(null);
            setIsCreating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    }

    if (selectedNote || isCreating) {
        return (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <input
                    type="text"
                    placeholder="Note Title"
                    value={selectedNote?.title || ''}
                    onChange={e => setSelectedNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full text-2xl font-bold bg-transparent text-white placeholder-gray-500 focus:outline-none mb-4"
                />
                <textarea
                    placeholder="Start writing..."
                    value={selectedNote?.content || ''}
                    onChange={e => setSelectedNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                    className="w-full h-[60vh] bg-dark-card/80 border border-white/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-colors"
                />
                <div className="flex items-center justify-end gap-4 mt-4">
                    <button onClick={() => { setSelectedNote(null); setIsCreating(false); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                    <button onClick={handleSaveNote} className="px-6 py-2 bg-brand-cyan text-dark-bg font-semibold rounded-lg hover:bg-brand-cyan/80 transition-colors">Save</button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                 <div className="relative w-full sm:w-auto">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 p-2 bg-dark-card/80 border border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                    />
                </div>
                <button onClick={handleNewNote} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-semibold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300">
                    <PlusIcon className="w-5 h-5" />
                    New Note
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map(note => (
                    <div key={note.id} className="glass-card rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-brand-cyan transition-colors" onClick={() => setSelectedNote(note)}>
                        <div>
                            <h3 className="font-bold text-lg text-white truncate mb-2">{note.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-3">{note.content}</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
             {notes.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                    <h3 className="text-xl">No notes yet</h3>
                    <p>Click "New Note" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default Notes;
