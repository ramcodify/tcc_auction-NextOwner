import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  X,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getImageUrl } from '../../utils/imageUrl.js';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';

export const AIAssistantPopup = () => {
  const { user } = useAuth();
  const {
    isOpen,
    openAssistant,
    closeAssistant,
    messages,
    inputText,
    setInputText,
    sendMessage,
    confirmAction,
    clearChat,
    loading,
    actionConfirming
  } = useAssistant();

  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    sendMessage();
  };

  const handlePromptClick = (promptText) => {
    sendMessage(promptText);
  };

  const quickPrompts = [
    'Cycles under ₹2,500',
    'Calculators closing soon',
    'Textbooks'
  ];

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Launcher Button (visible when popup is closed) */}
      {!isOpen && (
        <>
          {/* Mobile compact floating circle */}
          <button
            type="button"
            onClick={() => openAssistant()}
            className="fixed bottom-[74px] right-3 z-40 sm:hidden flex items-center justify-center w-11 h-11 bg-forest text-paper rounded-full shadow-lg border-2 border-paper active:scale-95 transition-transform"
            aria-label="Open AI Assistant"
            title="Open AI Assistant"
          >
            <Bot className="w-5 h-5 text-paper" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-paper" />
          </button>

          {/* Desktop floating pill button */}
          <button
            type="button"
            onClick={() => openAssistant()}
            className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2.5 px-4 py-2.5 bg-forest text-paper rounded-full shadow-lg hover:bg-forest-dark border-2 border-paper transition-all transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-forest"
            aria-label="Open NEXTowner AI Assistant"
          >
            <div className="w-6 h-6 rounded-full bg-paper/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-paper" />
            </div>
            <span className="text-xs font-semibold tracking-wide">
              AI Assistant
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-paper animate-pulse" />
          </button>
        </>
      )}

      {/* Floating Popup Window - Compact on Mobile */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="NEXTowner AI Assistant Window"
          className={`fixed z-50 bg-paper border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${
            isExpanded
              ? 'bottom-[74px] sm:bottom-6 right-2 sm:right-6 w-[94vw] sm:w-[400px] max-w-[420px] h-[72vh] sm:h-[540px]'
              : 'bottom-[74px] sm:bottom-6 right-2 sm:right-6 w-[88vw] sm:w-[390px] max-w-[360px] sm:max-w-[400px] h-[300px] sm:h-[500px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-stone border-b border-border select-none">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-forest text-paper flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[11px] sm:text-xs font-bold text-ink leading-tight">
                    NEXTowner Assistant
                  </h3>
                  <Badge variant="success" size="sm" className="text-[8px] sm:text-[9px] py-0 px-1">
                    Live
                  </Badge>
                </div>
                <p className="text-[9px] sm:text-[10px] text-olive leading-tight hidden xs:block">
                  Campus search & proxy bidding
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Expand / Minimize height toggle for mobile */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 sm:p-1.5 rounded text-olive hover:text-ink hover:bg-paper transition-colors"
                title={isExpanded ? 'Compact view' : 'Expand view'}
                aria-label={isExpanded ? 'Compact view' : 'Expand view'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={clearChat}
                className="p-1 sm:p-1.5 rounded text-olive hover:text-ink hover:bg-paper transition-colors"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                type="button"
                onClick={closeAssistant}
                className="p-1 sm:p-1.5 rounded text-olive hover:text-ink hover:bg-paper transition-colors"
                title="Minimize window"
                aria-label="Close assistant window"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Quick suggestions pills */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-paper/60 border-b border-border overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[9px] sm:text-[10px] text-olive font-medium shrink-0 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 text-forest" /> Try:
            </span>
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePromptClick(p)}
                className="text-[9px] sm:text-[10px] bg-stone hover:bg-stone-hover text-ink border border-border px-2 py-0.5 rounded-full whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-2.5 sm:p-3 overflow-y-auto space-y-2.5 bg-paper text-[11px] sm:text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-forest text-paper flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-lg p-2 sm:p-2.5 space-y-2 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-forest text-paper ml-auto'
                      : 'bg-stone/80 border border-border text-ink'
                  }`}
                >
                  <p className="whitespace-pre-line text-[11px] sm:text-xs">{msg.text}</p>

                  {/* Auction Matching Items Cards */}
                  {msg.auctions && msg.auctions.length > 0 && (
                    <div className="space-y-1.5 pt-0.5">
                      {msg.auctions.map((item) => (
                        <div
                          key={item.id}
                          className="p-1.5 sm:p-2 rounded bg-paper border border-border flex items-center gap-2 hover:border-forest transition-colors"
                        >
                          <img
                            src={getImageUrl(item.photo)}
                            alt=""
                            className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded border border-border shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-ink truncate text-[10px] sm:text-[11px]">
                              {item.title}
                            </h4>
                            <p className="text-forest font-semibold text-[10px] sm:text-xs">
                              ₹{item.currentPrice?.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <Link
                            to={`/auction/${item.id}`}
                            className="text-[9px] sm:text-[10px] bg-stone hover:bg-stone-hover text-ink font-semibold px-2 py-0.5 rounded border border-border flex items-center gap-0.5 shrink-0"
                          >
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explicit User Consent Bidding Card */}
                  {msg.actionProposal && (
                    <div className="p-2 sm:p-2.5 rounded bg-paper border-2 border-forest/30 space-y-1.5 mt-1.5">
                      <div className="flex items-center gap-1 text-forest font-bold text-[10px] sm:text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Consent-Based Action Required</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-ink leading-tight">
                        Auto-bid on <strong>"{msg.actionProposal.title}"</strong> up to{' '}
                        <strong className="text-forest">
                          ₹{msg.actionProposal.maxAmount?.toLocaleString('en-IN')}
                        </strong>
                        .
                      </p>
                      <div className="p-1.5 rounded bg-stone text-[9px] sm:text-[10px] text-olive leading-tight">
                        Server bids minimally to maintain lead without exceeding authorized maximum.
                      </div>
                      <div className="pt-0.5">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionConfirming}
                          onClick={() => confirmAction(msg.actionProposal)}
                          className="text-[10px] sm:text-xs py-0.5 sm:py-1 px-2.5 w-full"
                        >
                          {actionConfirming ? 'Authorizing...' : 'Confirm Auto-Bid'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-olive text-[11px]">
                <div className="w-5 h-5 rounded-full bg-forest text-paper flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-stone px-2.5 py-1.5 rounded-lg border border-border flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-forest animate-bounce" />
                  <span className="w-1 h-1 rounded-full bg-forest animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 rounded-full bg-forest animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-olive ml-1">Searching campus listings...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 bg-stone border-t border-border flex items-center gap-1.5"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about cycles, calculators, books..."
              className="flex-1 bg-paper border border-border rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs text-ink placeholder:text-olive focus:outline-none focus:ring-1 focus:ring-forest"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !inputText.trim()}
              className="px-2.5 py-1.5 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistantPopup;
