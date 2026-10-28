import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAssistant } from '../context/AssistantContext.jsx';

export const AssistantPage = () => {
  const { user } = useAuth();
  const {
    openAssistant,
    messages,
    inputText,
    setInputText,
    sendMessage,
    confirmAction,
    clearChat,
    loading,
    actionConfirming
  } = useAssistant();

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;
    sendMessage();
  };

  const handlePromptClick = (text) => {
    sendMessage(text);
  };

  const samplePrompts = [
    'Find me a cycle under ₹2,500',
    'Show calculators closing soon',
    'Engineering textbooks'
  ];

  return (
    <PageContainer
      title="AI Campus Market Assistant"
      subtitle="Intelligent natural-language search with strict consent-based bidding actions."
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Floating pop-up trigger banner */}
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-stone border border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-forest text-paper flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">Prefer a floating window?</p>
              <p className="text-[11px] text-olive">You can keep the assistant open as a pop-up window anywhere on NEXTowner.</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openAssistant()}
            className="text-xs"
          >
            Launch Pop-up
          </Button>
        </div>

        {/* Chat Stream Window */}
        <Card variant="stone" padding="lg" className="min-h-[500px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink">Active Session</span>
              <Badge variant="success" size="sm" className="text-[9px]">Online</Badge>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="text-xs text-olive hover:text-ink flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear Chat
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] text-olive flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-forest" /> Quick queries:
            </span>
            {samplePrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePromptClick(p)}
                className="text-xs bg-paper hover:bg-stone text-ink border border-border px-2.5 py-1 rounded transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[520px] pr-2 flex-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-forest text-paper flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded p-3.5 space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-forest text-paper ml-auto'
                      : 'bg-paper border border-border text-ink'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Auction Result Cards */}
                  {msg.auctions && msg.auctions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {msg.auctions.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded bg-stone border border-border flex items-center gap-2.5"
                        >
                          <img
                            src={
                              item.photo ||
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'
                            }
                            alt=""
                            className="w-12 h-12 object-cover rounded border border-border shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-ink truncate text-[11px]">{item.title}</h4>
                            <p className="text-forest font-semibold text-xs">
                              ₹{item.currentPrice?.toLocaleString('en-IN')}
                            </p>
                            <Link
                              to={`/auction/${item.id}`}
                              className="text-[10px] text-olive hover:text-ink font-medium flex items-center gap-0.5 mt-0.5"
                            >
                              Open Lot <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Consent-Based Action Confirmation Box */}
                  {msg.actionProposal && (
                    <div className="p-3 rounded bg-forest/10 border border-forest/30 space-y-2 mt-2">
                      <div className="flex items-center gap-1.5 font-bold text-forest">
                        <ShieldCheck className="w-4 h-4" /> Explicit Student Consent Required
                      </div>
                      <p className="text-[11px] text-ink">
                        Confirm proxy bidding for <strong>"{msg.actionProposal.title}"</strong> up to a maximum limit of{' '}
                        <strong className="text-forest">
                          ₹{msg.actionProposal.maxAmount?.toLocaleString('en-IN')}
                        </strong>
                        ?
                      </p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionConfirming}
                          onClick={() => confirmAction(msg.actionProposal)}
                        >
                          {actionConfirming ? 'Authorizing...' : 'Confirm & Authorize Bid'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-stone text-ink flex items-center justify-center shrink-0 mt-0.5 border border-border font-bold text-[10px]">
                    YOU
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-olive p-2">
                <Bot className="w-4 h-4 text-forest animate-spin" />
                <span>Assistant is consulting active campus listings...</span>
              </div>
            )}
          </div>

          {/* Assistant Input Bar */}
          <form onSubmit={handleSend} className="pt-4 border-t border-border mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Ask about textbooks, cycles, prices, or auto-bidding..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs text-ink bg-paper border border-border rounded focus:outline-none focus:ring-1 focus:ring-forest"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !inputText.trim()}
              icon={Send}
            >
              Ask
            </Button>
          </form>
        </Card>

        {/* Assistant Security & Consent Assurance */}
        <div className="p-3.5 rounded bg-stone/50 border border-border text-[11px] text-olive leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            <strong>Safe AI Policy:</strong> The assistant will never place a bid solely because you asked a question or mentioned an item budget. All bidding actions require your explicit, one-click authorization before execution.
          </span>
        </div>
      </div>
    </PageContainer>
  );
};

export default AssistantPage;
