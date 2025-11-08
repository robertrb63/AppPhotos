
import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { createChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SendIcon, UserIcon, BotIcon, AlertTriangleIcon } from './Icons';
import Spinner from './Spinner';

const Chatbot: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setChat(createChat());
        setMessages([
            { role: 'model', text: 'Hello! How can I help you today?' }
        ]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const result = await chat.sendMessageStream({ message: input });
            let modelResponse = '';
            
            // Add a placeholder for the model's response
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of result) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }

        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching the response. Please try again.');
             setMessages(prev => prev.slice(0, -1)); // remove model placeholder
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[65vh]">
            <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <BotIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-gray-700 text-white rounded-br-none' : 'bg-gray-700/50 text-gray-300 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text || '...'}</p>
                        </div>
                         {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && messages[messages.length-1].role === 'user' && (
                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <BotIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-md p-3 rounded-xl bg-gray-700/50 text-gray-300 rounded-bl-none">
                            <Spinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-6 flex-shrink-0">
                {error && (
                    <div className="bg-red-900/50 text-red-300 border border-red-700 p-3 rounded-lg flex items-center text-sm mb-2">
                        <AlertTriangleIcon className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}
                <div className="flex items-center bg-gray-900 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask anything..."
                        className="w-full bg-transparent p-3 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-3 text-gray-400 hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
