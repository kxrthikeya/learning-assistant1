import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; isUser: boolean }>>([
    {
      id: '1',
      text: 'Hi! I\'m Easy AI, your study companion. How can I help you today?',
      isUser: false,
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m here to help! Try asking me about study tips, quiz generation, or anything related to your learning journey.',
        isUser: false,
      };
      setMessages(prev => [...prev, response]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-primary text-white shadow-soft-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
        aria-label="AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* AI Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-96 glass-card rounded-2xl flex flex-col overflow-hidden shadow-soft-lg animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-200">
            <h3 className="text-lg font-semibold text-slate-900">Ask Easy AI</h3>
            <p className="text-sm text-slate-600">Your AI-powered study assistant</p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-xl ${
                    msg.isUser
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="px-4 py-4 border-t border-primary-200 bg-white/40">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 bg-white border border-primary-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all active:scale-95"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
