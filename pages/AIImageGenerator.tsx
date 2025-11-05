import React, { useState } from 'react';
import { generateImageFromPrompt } from '../services/geminiService';
import { DownloadIcon } from '../components/icons/Icons';
import { AspectRatio } from '../types';

const AIImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        const result = await generateImageFromPrompt(prompt, aspectRatio);
        
        if (result) {
            setImageUrl(result);
        } else {
            setError('Failed to generate image. Please try a different prompt.');
        }

        setIsLoading(false);
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${prompt.slice(0, 20).replace(/\s+/g, '_')}_oneverse.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A futuristic city skyline at sunset, cyberpunk style"
                        className="flex-grow p-3 bg-dark-card/80 border border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-colors"
                        disabled={isLoading}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform transition-transform duration-300"
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {Object.values(AspectRatio).map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                disabled={isLoading}
                                className={`px-4 py-1.5 text-sm rounded-md transition-colors disabled:opacity-50 ${aspectRatio === ratio ? 'bg-brand-cyan text-dark-bg font-semibold' : 'bg-dark-card/80 text-gray-300 hover:bg-white/10'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg">{error}</div>}

            {isLoading && (
                 <div className={`w-full glass-card rounded-2xl flex items-center justify-center ${
                    aspectRatio === AspectRatio.Square ? 'aspect-square' :
                    aspectRatio === AspectRatio.Portrait ? 'aspect-[9/16]' :
                    'aspect-video'
                }`}>
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-cyan"></div>
                </div>
            )}

            {imageUrl && !isLoading && (
                <div className="relative group glass-card p-2 rounded-2xl">
                    <img src={imageUrl} alt={prompt} className="w-full h-auto rounded-xl" />
                    <div className="absolute inset-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
                        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
                            <DownloadIcon className="w-5 h-5" />
                            Download
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIImageGenerator;