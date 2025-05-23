'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'rewrite' | 'ats'>('rewrite');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (mode === 'rewrite') {
        const [bullet, style] = input.split('|||').map(s => s.trim());
        const res = await axios.post('http://localhost:8000/rewrite', {
          bullet,
          style: style || 'results-driven',
        });
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: res.data.rewritten },
        ]);
      } else {
        const [bullet, jobDescription] = input.split('|||').map(s => s.trim());
        const res = await axios.post('http://localhost:8000/ats_score', {
          bullet,
          job_description: jobDescription,
        });
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `ATS Similarity Score: ${res.data.ats_score}%` },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <main className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">BulletBoost</h1>

      {/* Mode Switch */}
      <div className="mb-4">
        <button
          onClick={() => setMode('rewrite')}
          className={`px-3 py-1 mr-2 rounded ${
            mode === 'rewrite' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Rewrite
        </button>
        <button
          onClick={() => setMode('ats')}
          className={`px-3 py-1 rounded ${
            mode === 'ats' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          ATS Score
        </button>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-[70%] ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-black'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-300 rounded-xl px-4 py-2 max-w-[70%]">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.1s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.2s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col"
      >
        <textarea
          className="w-full border p-3 rounded resize-none h-24"
          placeholder={
            mode === 'rewrite'
              ? 'Enter your resume bullet point ||| desired style'
              : 'Resume bullet point ||| Job description'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 self-end bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
