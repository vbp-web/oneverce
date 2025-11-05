
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Task } from '../types';
import { PlusIcon, TrashIcon } from '../components/icons/Icons';

const Planner: React.FC = () => {
    const [tasks, setTasks] = useLocalStorage<Task[]>('oneverse-tasks', []);
    const [newTaskText, setNewTaskText] = useState('');

    const addTask = () => {
        if (newTaskText.trim() === '') return;
        const newTask: Task = {
            id: Date.now().toString(),
            text: newTaskText.trim(),
            completed: false,
        };
        setTasks(prev => [newTask, ...prev]);
        setNewTaskText('');
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    
    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">My Planner</h2>
                <p className="text-gray-400 mb-6">{totalTasks > 0 ? `You've completed ${completedTasks} of ${totalTasks} tasks.` : 'Add your first task below!'}</p>

                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Add a new task..."
                        className="flex-grow p-3 bg-dark-card/80 border border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-colors"
                    />
                    <button onClick={addTask} className="p-3 bg-brand-cyan text-dark-bg rounded-lg hover:bg-brand-cyan/80 transition-colors">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center p-3 bg-dark-card/70 rounded-lg hover:bg-dark-card transition-colors duration-200">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="w-5 h-5 rounded bg-white/10 border-white/20 text-brand-purple focus:ring-brand-purple"
                            />
                            <span className={`flex-grow mx-4 text-gray-300 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                {task.text}
                            </span>
                            <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Planner;
