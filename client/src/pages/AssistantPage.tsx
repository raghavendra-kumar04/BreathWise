import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  Send,
  Bot,
  Trash2,
  MapPin,
  Lightbulb,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextSnapshot?: {
    city?: string;
    aqi?: number;
    category?: string;
  };
}

const SCENARIO_CHIPS = [
  { label: '🧒 School walk safety', prompt: 'Can I walk my child to school safely today?' },
  { label: '🔥 Chulha vs induction', prompt: 'Should I cook on chulha or switch to induction today?' },
  { label: '🪟 Open windows now?', prompt: 'Best time to open windows for ventilation today?' },
  { label: '😷 Mask under ₹500', prompt: 'What mask should I buy under ₹500 for today\'s air quality?' },
  { label: '🏃 Safe to jog?', prompt: 'Is it safe to go jogging outside right now?' },
  { label: '🛡️ Top 3 air tips', prompt: 'What are today\'s top 3 air protection tips for me?' },
  { label: '🌾 Rural air quality', prompt: 'How is village air quality different from city air quality?' },
  { label: '🌬️ PM2.5 danger', prompt: 'Why is PM2.5 dangerous and how can I protect myself?' },
];

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inputMessage, setInputMessage] = useState('');
  const [chipsVisible, setChipsVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lat = user?.location?.latitude ?? 28.6139;
  const lon = user?.location?.longitude ?? 77.2090;
  const city = user?.location?.city ?? 'New Delhi';

  // 1. Fetch Conversation History
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const res = await api.get('/assistant/history');
      return res.data?.messages || [];
    },
  });

  // 2. Fetch Live Air Context for header banner
  const { data: airContext } = useQuery({
    queryKey: ['airQualityCurrent', lat, lon, city],
    queryFn: async () => {
      const res = await api.get(`/air-quality/current?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 15,
  });

  // 3. Send Message Mutation
  const chatMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const res = await api.post('/assistant/chat', {
        message: messageText,
        lat,
        lon,
        city,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    },
  });

  // 4. Clear History Mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/assistant/history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
      setChipsVisible(true);
    },
  });

  const messages: ChatMessage[] = historyData || [];

  // Hide chips once first message is sent
  useEffect(() => {
    if (messages.length > 0) {
      setChipsVisible(false);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setChipsVisible(false);
    chatMutation.mutate(text);
  };

  const handleChipClick = (prompt: string) => {
    if (chatMutation.isPending) return;
    setChipsVisible(false);
    chatMutation.mutate(`${prompt} (Location: ${city})`);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (chatMutation.isPending) return;
    chatMutation.mutate(prompt);
  };

  const suggestions = [
    `Is it safe to go jogging outside in ${city} right now?`,
    'What are the best indoor air tips without buying an expensive purifier?',
    'Why does PM2.5 increase so drastically during Indian winter mornings?',
    'How can I minimize smoke exposure while cooking with LPG?',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Top Header & Environmental Context Capsule */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-sage/20 gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-forest">
              BreatheWise AI Companion
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber/15 text-amber-dark font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini + Groq
            </span>
          </div>
          <p className="text-xs text-charcoal/70">
            Real-time environmental decision-support grounded in authentic CPCB data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {airContext && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-sage/30 text-xs shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span className="font-bold text-forest">{city}</span>
              <span className="text-charcoal/40">•</span>
              <span className="font-bold text-charcoal">AQI {airContext.aqi}</span>
              <span className="text-[10px] uppercase font-semibold text-charcoal/60">({airContext.category})</span>
            </div>
          )}

          {messages.length > 0 && (
            <button
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-charcoal/60 hover:bg-red-50 hover:text-red-500 transition border border-sage/20"
              title="Clear chat history"
              aria-label="Clear conversation history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Scenario Chips — shown before first message */}
      {chipsVisible && messages.length === 0 && (
        <div className="shrink-0 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-charcoal/50 uppercase tracking-widest">
            <Zap className="w-3 h-3 text-amber-dark" />
            Quick scenarios — tap to ask instantly
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {SCENARIO_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(chip.prompt)}
                disabled={chatMutation.isPending}
                className="snap-start shrink-0 px-3 py-2 rounded-2xl bg-white border border-sage/30 text-xs text-charcoal font-medium hover:bg-forest hover:text-ivory hover:border-forest transition whitespace-nowrap shadow-xs disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-3xl bg-white/60 p-4 space-y-3">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center shadow-inner">
              <Bot className="w-7 h-7 text-forest" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-forest">
                Ask BreatheWise Anything About Your Environment
              </h3>
              <p className="text-xs text-charcoal/70 mt-1">
                Your questions are answered using actual local CPCB monitoring measurements, wind dispersion, and household guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedPrompt(s)}
                  className="p-3 rounded-2xl bg-ivory hover:bg-sage/10 border border-sage/20 text-xs text-charcoal font-medium transition text-left flex items-start gap-2"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-dark shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{s}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message Bubbles */
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-forest text-ivory flex items-center justify-center shrink-0 shadow-sm mt-1">
                      <Bot className="w-4 h-4 text-sage" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-forest text-ivory rounded-br-none shadow-sm'
                        : 'bg-white border border-sage/30 text-charcoal rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className={`block text-[10px] mt-1.5 ${isUser ? 'text-ivory/60 text-right' : 'text-charcoal/40'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-sage/30 text-forest flex items-center justify-center shrink-0 shadow-sm mt-1 font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              );
            })}

            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-forest text-ivory flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-sage" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-sage/30 rounded-bl-none flex items-center gap-2 text-xs text-charcoal/70">
                  <div className="w-2 h-2 rounded-full bg-forest animate-ping" />
                  <span>Gemini is reasoning over {city} air telemetry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="shrink-0 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask about pollution, exercise, or health in ${city}...`}
          disabled={chatMutation.isPending}
          className="flex-1 px-4 py-3 bg-white rounded-2xl border border-sage/30 focus:outline-none focus:border-forest text-xs sm:text-sm text-charcoal shadow-xs"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || chatMutation.isPending}
          className="px-5 py-3 rounded-2xl bg-forest hover:bg-forest-light text-ivory text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
