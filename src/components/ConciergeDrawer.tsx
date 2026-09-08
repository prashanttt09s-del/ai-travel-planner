import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MessageCircleQuestion, Compass } from 'lucide-react';
import { ChatMessage, SupportedLanguage, TravelPlan } from '../types';
import Markdown from 'react-markdown';

interface ConciergeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TravelPlan | null;
  language: SupportedLanguage;
}

export const ConciergeDrawer: React.FC<ConciergeDrawerProps> = ({
  isOpen,
  onClose,
  plan,
  language,
}) => {
  const isHinglish = language === 'hi_hinglish';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const destination = plan?.destination || 'your destination';

  // Seed initial greeting on open if empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: isHinglish
            ? `Namaste! Main aapka **AI Travel Concierge** hoon. ${destination} ke baare me kuch bhi poochhein — jaise scooter rental rates, vegetarian restaurants, SIM card, ya best sunset spots!`
            : `Hello! I'm your dedicated **AI Travel Concierge** for **${destination}**. Feel free to ask about local transit, scooter rentals, hidden cafes, photography spots, or currency tips!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, destination, isHinglish]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = isHinglish ? [
    `Scooter / Car rent karne ka kya process aur rate hai?`,
    `Pure vegetarian food kahan milega?`,
    `Local SIM card aur internet connectivity kaisa hai?`,
    `Best photography aur sunset viewpoints kaunse hain?`,
  ] : [
    `How much do scooter rentals and taxis usually cost?`,
    `Where can I find great vegetarian/vegan food?`,
    `What are the best viewpoints for photography?`,
    `Is tap water safe and what SIM card is best?`,
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ask-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          question: textToSend,
          planContext: plan ? {
            tagline: plan.tagline,
            budgetTier: plan.budgetTier,
            daysCount: plan.daysCount,
            bestTimeToVisit: plan.bestTimeToVisit,
          } : undefined,
          history: messages.slice(-6),
          language,
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply || (isHinglish ? 'Main aapki baat samajh nahi paya, kripya dobara poochhein.' : 'Sorry, could you rephrase that?'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          text: isHinglish ? 'Connection me dikkat aayi, kripya dobara try karein.' : 'Network connection error. Please try asking again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isHinglish ? 'AI Travel Concierge Guide' : 'AI Local Travel Concierge'}
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium">
                ● {destination} Local Expert Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="markdown-body">
                  <Markdown>{msg.text}</Markdown>
                </div>
                <span
                  className={`text-[10px] block mt-1.5 ${
                    msg.role === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3 rounded-tl-none flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <MessageCircleQuestion className="w-3 h-3" />
            <span>{isHinglish ? 'Suggested Questions' : 'Frequently Asked'}:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-medium rounded-lg shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isHinglish ? `${destination} ke baare me poochhein...` : `Ask anything about ${destination}...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
