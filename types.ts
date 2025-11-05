
export enum Tool {
    Chat = 'AI Chat',
    Writer = 'AI Writer',
    Image = 'AI Image Gen',
    Code = 'AI Coder',
    Planner = 'Planner',
    Notes = 'Notes',
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  tool?: Tool; // To know which tool generated the message
  imageUrl?: string;
  code?: {
    language: string;
    content: string;
  };
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
}

export enum Tone {
    Professional = 'Professional',
    Casual = 'Casual',
    Enthusiastic = 'Enthusiastic',
    Informational = 'Informational',
    Funny = 'Funny',
}

export enum AspectRatio {
    Square = '1:1',
    Portrait = '9:16',
    Landscape = '16:9',
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}
