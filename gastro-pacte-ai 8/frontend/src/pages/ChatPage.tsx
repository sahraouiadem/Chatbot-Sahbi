import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Loader2, Send, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../../../backend/services/aiService';
import Button from '../components/Button';

const ChatPage: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "3aslema! Labes 3lik? Ena l'assistant mte3ek. Chnowa t7ess lyoum?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(userMsg.text, messages);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Erreur de connexion. Vérifiez votre clé API.', isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full bg-white shadow-xl lg:my-4 lg:rounded-2xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-teal-600 p-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Assistant PACTE</h2>
          <p className="text-teal-100 text-xs">Support en Dialecte Tunisien</p>
        </div>
        <MessageCircle className="w-5 h-5 opacity-80" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
        {/* Static welcome bubble */}
        <div className="flex justify-start">
          <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm max-w-[80%]">
            <p className="leading-relaxed">
              3aslema! Ena l'assistant mta3ek. Si 3andek wji3a wala 9ala9, a7kili.
              Si lezem temchi l'tabib, n9ollek t3ammer formulaire bech t7adher dossier mte3ek.
            </p>
          </div>
        </div>

        {/* Dynamic messages (skip the initial model message, already shown above) */}
        {messages.slice(1).map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              {msg.isError && <AlertCircle className="w-4 h-4 mt-2 text-red-300" />}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span className="text-slate-400 text-sm">Yekteb...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ahki m3aya houni..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !chatInput.trim()}
            className="rounded-xl px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
