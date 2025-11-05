
import { GoogleGenAI } from "@google/genai";
import { Tone, AspectRatio } from '../types';

// IMPORTANT: Do not expose this key publicly.
// In a real application, this should be handled on a secure backend.
// For this frontend-only example, we're using an environment variable
// which you should set up in your development environment.
const apiKey = process.env.API_KEY;

// Fix: Initialize ai only if apiKey is present.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
    console.error("API_KEY environment variable not set. AI features will not work.");
}

export async function* generateChatResponseStream(history: { role: 'user' | 'model'; parts: { text: string }[] }[], newMessage: string) {
    // Fix: Check for initialized ai instance.
    if (!ai) {
        yield "API key not configured. Please set up your API_KEY.";
        return;
    }
    try {
        const model = 'gemini-2.5-flash';
        const chat = ai.chats.create({ model, history });
        const result = await chat.sendMessageStream({ message: newMessage });

        for await (const chunk of result) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Gemini API error in chat stream:", error);
        yield "Sorry, I encountered an error. Please check the console for details.";
    }
}


export const generateTextWithTone = async (prompt: string, tone: Tone) => {
    // Fix: Check for initialized ai instance.
    if (!ai) return "API key not configured. Please set up your API_KEY.";
    try {
        const model = 'gemini-2.5-flash';
        const fullPrompt = `Please generate content based on the following prompt. The desired tone is ${tone}.

Prompt: "${prompt}"`;

        const response = await ai.models.generateContent({ model, contents: fullPrompt });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in writer:", error);
        return "Failed to generate content. Please check your prompt and try again.";
    }
};

export const generateCode = async (prompt: string, language: string) => {
    // Fix: Check for initialized ai instance.
    if (!ai) return "API key not configured. Please set up your API_KEY.";
    try {
        const model = 'gemini-2.5-pro'; // Use a more powerful model for coding
        const fullPrompt = `Generate a code snippet in ${language} for the following task: "${prompt}". 
IMPORTANT: Only output the raw code for the specified language. Do not include any explanations, comments, or markdown formatting like \`\`\`${language} ... \`\`\`.`;

        const response = await ai.models.generateContent({ model, contents: fullPrompt });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in code generation:", error);
        return `// Error generating code. Please check the console.`;
    }
};


export const generateImageFromPrompt = async (prompt: string, aspectRatio: AspectRatio) => {
    // Fix: Check for initialized ai instance.
    if (!ai) return null;
    try {
        // Use a more powerful model for better quality and feature support
        const model = 'imagen-4.0-generate-001'; 
        const response = await ai.models.generateImages({
            model,
            prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio,
            },
        });
        
        const base64ImageBytes: string | undefined = response.generatedImages[0]?.image.imageBytes;
        
        if (base64ImageBytes) {
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        return null;

    } catch (error) {
        console.error("Gemini API error in image generation:", error);
        return null;
    }
};
