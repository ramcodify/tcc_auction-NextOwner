import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const AssistantContext = createContext(null);

export const AssistantProvider = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionConfirming, setActionConfirming] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'assistant',
      text: 'Hello! I am your NEXTowner campus market guide. I can locate active items, compare pricing, and set up automatic proxy bids with your explicit consent.\n\nTry asking:\n• *"Find me a cycle under ₹2,500"*\n• *"Show calculators closing soon"*\n• *"Auto-bid on the Hero cycle up to ₹2,800"*',
      auctions: []
    }
  ]);

  const openAssistant = (initialPrompt = null) => {
    setIsOpen(true);
    if (initialPrompt && typeof initialPrompt === 'string') {
      setInputText(initialPrompt);
    }
  };

  const closeAssistant = () => {
    setIsOpen(false);
  };

  const toggleAssistant = () => {
    setIsOpen((prev) => !prev);
  };

  const sendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMessage = {
      id: String(Date.now()),
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Extract the most recently referenced auction from message history or proposal
    let contextAuctionId = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.actionProposal?.auctionId) {
        contextAuctionId = msg.actionProposal.auctionId;
        break;
      }
      if (msg.auctions && msg.auctions.length > 0) {
        contextAuctionId = msg.auctions[0].id;
        break;
      }
    }

    // Check if user is currently viewing an auction page
    const pageAuctionId =
      typeof window !== 'undefined' && window.location.pathname.startsWith('/auction/')
        ? window.location.pathname.split('/')[2]
        : null;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: text,
          contextAuctionId: contextAuctionId || pageAuctionId || null,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
            auctionIds:
              m.auctions?.map((a) => a.id) ||
              (m.actionProposal?.auctionId ? [m.actionProposal.auctionId] : [])
          }))
        })
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
            text: data.message || 'I encountered an error querying campus inventory. Please try again.',
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

  const confirmAction = async (proposal) => {
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
            text: `✅ **Action Confirmed:** Configured automatic proxy bid on **"${proposal.title}"** up to **₹${proposal.maxAmount.toLocaleString('en-IN')}**. The server will maintain your lead automatically.`,
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

  const clearChat = () => {
    setMessages([
      {
        id: 'init-' + Date.now(),
        sender: 'assistant',
        text: 'Chat history cleared. How can I help you find campus items today?',
        auctions: []
      }
    ]);
  };

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        messages,
        inputText,
        setInputText,
        sendMessage,
        confirmAction,
        clearChat,
        loading,
        actionConfirming,
        actionResult
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};

export default AssistantContext;
