import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Loader2, Send, AlertCircle, Search, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage, validateApiKeyHealth } from '../services/aiService';
import Button from '../components/Button';

const QUICK_QUESTIONS = [
  'عندي وجيعة في كرشي، شنوّا نعمل؟',
  'عندي حموضة وحرقة، خطيرة ولا لا؟',
  'عندي إسهال من ثلاثة أيام، وقتاش نمشي للطبيب؟',
  'بديت ما ناكلش، شنوّا بيا؟',
];

const FAQ_ITEMS = [
  {
    question: 'شنوّا نجم نحكي مع الأسيستان؟',
    answer:
      'تنجم تحكي على الأعراض متاعك بالتونسي: وجيعة، إسهال، حرقة، غثيان... وهو يعطيك توجيه أوّلي.',
  },
  {
    question: 'كي يقلي يلزمك طبيب، شنوّا نعمل؟',
    answer:
      'إلا الأعراض يبدوا موش عاديين، الأسيستان ينجم ينصحك بزيارة طبية ويحضرلك المعلومات المهمّة.',
  },
  {
    question: 'شنوّا أهمّ وثايق لازم نجيبهم؟',
    answer:
      'الأهمّ: lettre de liaison، carte d’identité، و carnet CNAM. وكان عندك تحاليل ولا ordonnance جديدة، جيبهم زادة.',
  },
  {
    question: 'المعلومات متاعي محفوظة؟',
    answer:
      'نستعملوا المعلومات باش نعاونوك في المتابعة. ما تعطيش معلومات حسّاسة برشة في الشات.',
  },
  {
    question: 'نجم نسأل سؤال مباشر من الصفحة اللولة؟',
    answer:
      'إي، اكتب سؤالك في خانة البحث لتحت، وتبدا جلسة الشات بوت مباشرة.',
  },
];

const ChatPage: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'عالسلامة! لباس عليك؟ أنا الأسيستان متاعك. شنوّا تحسّ اليوم؟' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [landingQuery, setLandingQuery] = useState('');
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ ok: boolean; message: string } | null>(null);
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

      const message = error instanceof Error ? error.message : 'Erreur de connexion. Vérifiez votre clé API.';
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: message, isError: true },
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

  const handleApiCheck = async () => {
    setIsCheckingApi(true);
    try {
      const result = await validateApiKeyHealth();
      setApiStatus(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Test API échoué.';
      setApiStatus({ ok: false, message });
    } finally {
      setIsCheckingApi(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-teal-600 p-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">مساعد باكت</h2>
          <p className="text-teal-100 text-xs">دعم باللهجة التونسية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleApiCheck}
            disabled={isCheckingApi}
            variant="secondary"
            className="text-xs px-3 py-1.5"
          >
            {isCheckingApi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            اختبر الـ API
          </Button>
          <MessageCircle className="w-5 h-5 opacity-80" />
        </div>
      </div>

      {apiStatus && (
        <div
          className={`px-4 py-2 text-sm border-b ${apiStatus.ok ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}
        >
          {apiStatus.message}
        </div>
      )}

      {/* Main Content Area */}
      {!hasUserSpoken ? (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 via-emerald-50 to-white p-6 md:p-8">
            <div className="max-w-5xl mx-auto" dir="rtl">
              <div className="bg-white border border-teal-100 rounded-3xl p-6 md:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center border border-teal-200">
                  <MessageCircle className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <p className="text-xs tracking-widest text-teal-600">شات بوت باكت</p>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900">مساعد الجهاز الهضمي باللهجة التونسية</h3>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-6">
                مرحبا بيك! تنجم تسأل على الأعراض، تكتب سؤالك مباشرة، ولا تبدا بواحد من الأسئلة المتداولة.
              </p>

              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 md:p-4 mb-7">
                <p className="text-sm text-teal-900 mb-2">سؤال مباشر:</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" />
                    <input
                      type="text"
                      value={landingQuery}
                      onChange={(e) => setLandingQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLandingSearch()}
                      placeholder="مثال: عندي وجيعة في كرشي بعد الماكلة..."
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-teal-200 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <Button
                    onClick={handleLandingSearch}
                    disabled={isLoading || !landingQuery.trim()}
                    className="rounded-xl px-5 min-h-[48px]"
                  >
                    <Sparkles className="w-4 h-4" />
                    ابدا الشات
                  </Button>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2 text-sm text-teal-700">
                <Sparkles className="w-4 h-4" />
                أسئلة وأجوبة متداولة
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

              <div className="mb-3 text-sm text-slate-600">ولا جرّب بسرعة:</div>
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
                عالسلامة! أنا الأسيستان متاعك. كان عندك وجيعة ولا قلق، أحكيلي.
                نعطيك توجيه واضح حسب حالتك وخطواتك الجاية.
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
                <span className="text-slate-400 text-sm">يكتب...</span>
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
            placeholder={!hasUserSpoken ? 'اكتب هوني...' : 'احكي معايا هوني...'}
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
