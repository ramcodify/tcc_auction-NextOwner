import React, { useState } from 'react';
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
  Zap,
  ArrowRight
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const AssistantPage = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'assistant',
      text: 'Hello! I am your NEXTowner campus market guide. I can locate active items, compare pricing, and set up automatic proxy bids with your explicit consent.\n\nTry asking:\n• *"Find me a cycle under ₹2,500"*\n• *"Show calculators closing soon"*\n• *"Auto-bid on the Hero cycle up to ₹2,800"*',
      auctions: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionConfirming, setActionConfirming] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: inputText.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage.text })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'assistant',
            text: data.reply,
            auctions: data.auctions || [],
            actionProposal: data.actionProposal || null
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'assistant',
            text: 'I encountered an error querying campus inventory. Please try again.',
            auctions: []
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: 'Unable to reach the assistant service. Make sure the server is connected.',
          auctions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Explicit user consent action confirmation
  const handleConfirmAction = async (proposal) => {
    if (!user) {
      alert('Please sign in to place proxy bids.');
      return;
    }

    setActionConfirming(true);
    setActionResult(null);

    try {
      const res = await fetch(`/api/auctions/${proposal.auctionId}/auto-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ maxAmount: proposal.maxAmount })
      });

      const data = await res.json();
      if (res.ok) {
        setActionResult({
          success: true,
          message: `Consent confirmed: ${data.message}`
        });

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'assistant',
            text: `✅ **Action Confirmed:** I have configured your automatic proxy bid on **"${proposal.title}"** up to **₹${proposal.maxAmount.toLocaleString('en-IN')}**. The server will now bid on your behalf whenever competing bids arrive!`,
            auctions: []
          }
        ]);
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err) {
      alert('Error executing confirmed bidding action');
    } finally {
      setActionConfirming(false);
    }
  };

  return (
    <PageContainer
      title="AI Campus Market Assistant"
      subtitle="Intelligent natural-language search with strict consent-based bidding actions."
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Chat Stream Window */}
        <Card variant="stone" padding="lg" className="min-h-[500px] flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto max-h-[520px] pr-2">
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
                            src={item.photo || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'}
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
                  {msg.actionProposal && !actionResult && (
                    <div className="p-3 rounded bg-forest/10 border border-forest/30 space-y-2 mt-2">
                      <div className="flex items-center gap-1.5 font-bold text-forest">
                        <ShieldCheck className="w-4 h-4" /> Explicit Student Consent Required
                      </div>
                      <p className="text-[11px] text-ink">
                        Confirm proxy bidding for <strong>"{msg.actionProposal.title}"</strong> up to a maximum limit of{' '}
                        <strong>₹{msg.actionProposal.maxAmount?.toLocaleString('en-IN')}</strong>?
                      </p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={actionConfirming}
                          onClick={() => handleConfirmAction(msg.actionProposal)}
                        >
                          Confirm & Authorize Bid
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
