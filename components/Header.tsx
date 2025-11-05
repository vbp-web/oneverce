
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from './icons/Icons';

const Header: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
    const [theme, toggleTheme] = useTheme();

    return (
        <header className="flex justify-between items-center p-6 pb-4">
            <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
        </header>
    );
};

export default Header;
