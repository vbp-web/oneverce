import { GoogleGenAI } from "@google/genai";
import { Tone, AspectRatio } from '../types';

// This will be initialized at runtime.
let ai: GoogleGenAI | null = null;

/**
 * Initializes the GoogleGenAI instance with the provided API key.
 * @param apiKey The user's Google Gemini API key.
 */
export function initializeAi(apiKey: string) {
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        console.warn("AI initialization failed: No API key provided.");
        ai = null;
    }
}

/**
 * Checks if the AI service has been initialized with a valid key.
 * @returns {boolean} True if the AI service is available, false otherwise.
 */
export function isAiAvailable(): boolean {
    return !!ai;
}


export async function* generateChatResponseStream(history: { role: 'user' | 'model'; parts: { text: string }[] }[], newMessage: string) {
    if (!isAiAvailable()) {
        yield "API key not configured. Please enter your API key to use AI features.";
        return;
    }
    try {
        const model = 'gemini-2.5-flash';
        const chat = ai!.chats.create({ model, history });
        const result = await chat.sendMessageStream({ message: newMessage });

        for await (const chunk of result) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Gemini API error in chat stream:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        yield `Sorry, I encountered an error. This might be due to an invalid API key, network issues, or content restrictions.\n\nDetails: ${errorMessage}`;
    }
}


export const generateTextWithTone = async (prompt: string, tone: Tone) => {
    if (!isAiAvailable()) return "API key not configured. Please enter your API key.";
    try {
        const model = 'gemini-2.5-flash';
        const fullPrompt = `Please generate content based on the following prompt. The desired tone is ${tone}.

Prompt: "${prompt}"`;

        const response = await ai!.models.generateContent({ model, contents: fullPrompt });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in writer:", error);
        return "Failed to generate content. Please check your API key and try again.";
    }
};

export const generateCode = async (prompt: string, language: string) => {
    if (!isAiAvailable()) return "// API key not configured. Please enter your API key.";
    try {
        const model = 'gemini-2.5-pro'; // Use a more powerful model for coding
        const fullPrompt = `Generate a code snippet in ${language} for the following task: "${prompt}". 
IMPORTANT: Only output the raw code for the specified language. Do not include any explanations, comments, or markdown formatting like \`\`\`${language} ... \`\`\`.`;

        const response = await ai!.models.generateContent({ model, contents: fullPrompt });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in code generation:", error);
        return `// Error generating code. Please check your API key and console.`;
    }
};


export const generateImageFromPrompt = async (prompt: string, aspectRatio: AspectRatio) => {
    if (!isAiAvailable()) return null;
    try {
        // Use a more powerful model for better quality and feature support
        const model = 'imagen-4.0-generate-001'; 
        const response = await ai!.models.generateImages({
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
