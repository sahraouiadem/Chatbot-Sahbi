import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Loader2, Send, AlertCircle, Search, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../../../backend/services/aiService';
import Button from '../components/Button';

const QUICK_QUESTIONS = [
  "3andi wji3a fel karsha, chnowa n3mel?",
  "3andi 7moriya w 7ar9an, khatar9ech?",
  "3andi ishal mel 3 eyem, wa9tech nemchi lil tebib?",
  "Bdit ma nakol, chnowa biya?",
];

const FAQ_ITEMS = [
  {
    question: 'Chnowa najm na7ki m3a l-assistant?',
    answer:
      'Tnajem t7ki 3la l-a3rath mte3ek b tounsi: wji3a, ishal, 7ar9an, ghathyan... w howa y3tik tawjih awwali.',
  },
  {
    question: 'Ki y9olli lezmek tebib, chnawa na3mel?',
    answer:
      'Ila l-a3rath yebdou mouch aadiyin, l-assistant ynajjem ynas7ek b visite médicale w y7addherlek l-ma3loumet el mohema.',
  },
  {
    question: 'El ma3loumet mte3i mahfoutha?',
    answer:
      'Naamlou usage lel ma3loumet bch n3awnouk fel suivi. Mat3tich ma3loumet 7assessa barcha fel chat.',
  },
  {
    question: 'Najem nse2el sou2el direct men l-page loula?',
    answer:
      'Ey, ekteb sou2lek fel barre de recherche louta, w tebdé session chatbot direct.',
  },
];

const ChatPage: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "3aslema! Labes 3lik? Ena l'assistant mte3ek. Chnowa t7ess lyoum?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [landingQuery, setLandingQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If a user message exists, the chat has fully started
  const hasUserSpoken = messages.some((m) => m.role === 'user');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text = chatInput) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text };
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

  const handleLandingSearch = () => {
    const query = landingQuery.trim();
    if (!query || isLoading) return;
    setLandingQuery('');
    void handleSendMessage(query);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-teal-600 p-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Assistant PACTE</h2>
          <p className="text-teal-100 text-xs">Support en Dialecte Tunisien</p>
        </div>
        <MessageCircle className="w-5 h-5 opacity-80" />
      </div>

      {/* Main Content Area */}
      {!hasUserSpoken ? (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 via-emerald-50 to-white p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-teal-100 rounded-3xl p-6 md:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center border border-teal-200">
                  <MessageCircle className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-teal-600">PACTE Chatbot</p>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900">Assistant Gastro en dialecte tunisien</h3>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-6">
                Mar7bé bik! Tnajem tse2el 3la a3rath, tekteb sou2lek direct, wala tabda b wa7ed men les questions fréquentes.
              </p>

              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 md:p-4 mb-7">
                <p className="text-sm text-teal-900 mb-2">Sou2el direct:</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" />
                    <input
                      type="text"
                      value={landingQuery}
                      onChange={(e) => setLandingQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLandingSearch()}
                      placeholder="Ex: 3andi wji3a fel karsha ba3d l-mekla..."
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-teal-200 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <Button
                    onClick={handleLandingSearch}
                    disabled={isLoading || !landingQuery.trim()}
                    className="rounded-xl px-5 min-h-[48px]"
                  >
                    <Sparkles className="w-4 h-4" />
                    Démarrer chat
                  </Button>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2 text-sm text-teal-700">
                <Sparkles className="w-4 h-4" />
                Questions / réponses fréquentes
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-7">
                {FAQ_ITEMS.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-2xl border border-teal-100 bg-white p-4 md:p-5 shadow-sm"
                  >
                    <h4 className="font-semibold text-slate-900 mb-2 leading-snug">{faq.question}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mb-3 text-sm text-slate-600">Ou essaie rapidement:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="bg-white hover:bg-teal-50 transition-all text-slate-800 p-4 rounded-xl text-left text-sm font-medium shadow-sm border border-teal-100 hover:-translate-y-0.5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Normal Chat State
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
          {/* Static welcome bubble remains in the scroll view once chat starts */}
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm max-w-[80%]">
              <p className="leading-relaxed">
                3aslema! Ena l'assistant mta3ek. Si 3andek wji3a wala 9ala9, a7kili.
                Si lezem temchi l'tabib, n9ollek t3ammer formulaire bech t7adher dossier mte3ek.
              </p>
            </div>
          </div>

          {/* Dynamic messages */}
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
      )}

      {/* Input */}
      <div className={`p-4 border-t transition-colors ${!hasUserSpoken ? 'bg-teal-50 border-teal-100' : 'bg-white border-slate-100'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={!hasUserSpoken ? "Akteb houni..." : "Ahki m3aya houni..."}
            className={`flex-1 px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none ${
              !hasUserSpoken 
                ? 'bg-white border border-teal-200 text-slate-900 placeholder-slate-400 focus:bg-white' 
                : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
            }`}
          />
          <Button
            onClick={() => handleSendMessage()}
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
