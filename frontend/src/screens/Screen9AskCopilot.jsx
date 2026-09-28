import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Mic, Sprout, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { sendCopilotChat } from '../services/api';

export default function Screen9AskCopilot({
  onNavigate,
  selectedCrop,
  farmData,
  soilIntelligence,
  initialMessages,
  quickChips,
  appMode,
  farmPlanContext = null
}) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync initial welcome message provenance with active appMode
  useEffect(() => {
    const isReal = appMode === 'REAL';
    setMessages((prev) =>
      prev.map((msg, idx) => {
        if (idx === 0 && msg.sender === 'bot' && msg.provenance) {
          return {
            ...msg,
            provenance: {
              ...msg.provenance,
              source: isReal
                ? 'Gemini AI Farm Copilot (gemini-3.6-flash)'
                : 'FarmAI Agronomy Assistant (Demo)',
              timestamp_or_period: isReal ? 'Live Session' : '2026-09-19',
              geographic_scope: farmData?.name || 'Gorakhpur, Uttar Pradesh',
              status: isReal ? 'live' : 'demo'
            }
          };
        }
        return msg;
      })
    );
  }, [appMode, farmData?.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle user submitting a question or clicking a chip
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const botResponse = await sendCopilotChat(
        query,
        {
          crop: farmPlanContext?.crop || selectedCrop?.name || 'Rice',
          soilPh: soilIntelligence?.parameters?.ph?.value ?? 6.7,
          soilType: soilIntelligence?.soil_type || 'Loamy',
          location: farmData?.name || 'Gorakhpur, Uttar Pradesh',
          farmPlanContext: farmPlanContext
        },
        appMode
      );

      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.warn('Copilot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: `For ${selectedCrop?.name || 'Rice'} in your soil conditions, consult local KVK agronomy officers for field application.`,
          provenance: {
            factor: 'copilot_advice',
            source: 'Local Agronomy Fallback',
            status: 'demo',
            methodology_note: 'Fallback advice triggered.'
          }
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Top Navigation Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => onNavigate(farmPlanContext ? 11 : 8)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Sprout className="w-3 h-3" />
          </div>
          <h2 className="font-bold text-sm text-slate-900 tracking-tight">Ask FarmAI</h2>
        </div>
        <div className="w-5" />
      </div>

      {farmPlanContext && (
        <div className="bg-emerald-50 px-3.5 py-1.5 border-b border-emerald-100 text-[10px] text-emerald-900 font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Plan Context: {farmPlanContext.crop} • {farmPlanContext.field_area}
          </span>
          <button
            onClick={() => onNavigate(11)}
            className="text-emerald-700 underline text-[10px] hover:text-emerald-950 font-bold"
          >
            View Plan
          </button>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-left">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed transition-all shadow-xs ${
                  isUser
                    ? 'bg-emerald-100/90 text-emerald-950 font-medium rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs space-y-2'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                      <Sprout className="w-3 h-3 text-emerald-600" />
                      FarmAI Agronomy Assistant
                    </span>
                    {msg.provenance && (
                      <ProvenanceBadge provenance={msg.provenance} />
                    )}
                  </div>
                )}

                <div className="whitespace-pre-line text-xs">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 max-w-[50%] shadow-xs">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-200" />
            </div>
            <span className="text-[11px] font-medium">FarmAI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips (Matching Reference) */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/60 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {(farmPlanContext
          ? ["Explain my farm plan summary", "What is my fertilizer dose?", ...quickChips]
          : quickChips
        ).map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 text-[11px] font-medium rounded-full shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field Bar */}
      <div className="p-3 bg-white border-t border-slate-100 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Audio Mic Button */}
          <button
            type="button"
            onClick={() => alert("Speech Recognition: Press and speak your agricultural query in English or Hindi.")}
            className="p-2.5 rounded-full text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-slate-200 cursor-pointer"
            title="Speak your question"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type or speak your question..."
            className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
