import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Gavel,
  Clock,
  User,
  ShieldCheck,
  Bookmark,
  Share2,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Phone,
  HelpCircle,
  Send,
  Zap,
  Check,
  X
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Dialog from '../components/common/Dialog.jsx';
import CountdownTimer from '../components/auction/CountdownTimer.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export const AuctionDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinAuction, leaveAuction } = useSocket();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isWatched, setIsWatched] = useState(false);
  const [userAutoBid, setUserAutoBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Photo in Gallery
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Manual Bidding Form
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');

  // Auto-Bidding Form
  const [autoBidMax, setAutoBidMax] = useState('');
  const [autoBidLoading, setAutoBidLoading] = useState(false);
  const [autoBidMessage, setAutoBidMessage] = useState('');

  // Questions Form
  const [newQuestion, setNewQuestion] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState({});

  // Real-time Extension Banner
  const [extensionNotice, setExtensionNotice] = useState('');

  // Seller Decision State
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [handoverLoading, setHandoverLoading] = useState(false);

  const fetchAuction = async () => {
    try {
      const res = await fetch(`/api/auctions/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Auction not found or unavailable');
      const data = await res.json();
      setAuction(data.auction);
      setBidHistory(data.bidHistory || []);
      setQuestions(data.questions || []);
      setIsWatched(Boolean(data.isWatched));
      setUserAutoBid(data.userAutoBid);

      // Pre-fill next minimum bid
      const nextMin =
        data.auction.bidCount === 0
          ? data.auction.startingPrice
          : data.auction.currentPrice + data.auction.minimumIncrement;
      setBidAmount(String(nextMin));
    } catch (err) {
      setError(err.message || 'Failed to load auction.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
    joinAuction(id);

    return () => {
      leaveAuction(id);
    };
  }, [id]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    if (!socket) return;

    const handleBidPlaced = (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentPrice: data.currentPrice,
            bidCount: data.bidCount,
            closesAt: data.closesAt
          };
        });

        if (data.newBid) {
          setBidHistory((prev) => [data.newBid, ...prev]);
        }

        // Update prefilled bid
        setBidAmount(String(data.currentPrice + (auction?.minimumIncrement || 20)));
      }
    };

    const handleAuctionExtended = (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => (prev ? { ...prev, closesAt: data.closesAt } : prev));
        setExtensionNotice(data.message);
        setTimeout(() => setExtensionNotice(''), 8000);
      }
    };

    const handleAuctionClosed = (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
    };

    socket.on('bid_placed', handleBidPlaced);
    socket.on('auction_extended', handleAuctionExtended);
    socket.on('auction_closed', handleAuctionClosed);

    return () => {
      socket.off('bid_placed', handleBidPlaced);
      socket.off('auction_extended', handleAuctionExtended);
      socket.off('auction_closed', handleAuctionClosed);
    };
  }, [socket, id, auction?.minimumIncrement]);

  // Handle Manual Bid Submission
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/auction/${id}` } } });
      return;
    }

    setBidError('');
    setBidSuccess('');
    setBidLoading(true);

    try {
      const res = await fetch(`/api/auctions/${id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: Number(bidAmount) })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Bid submission failed');
      }

      setBidSuccess(`Bid of ₹${Number(bidAmount).toLocaleString('en-IN')} accepted! You hold the leading bid.`);
      setTimeout(() => setBidSuccess(''), 5000);
    } catch (err) {
      setBidError(err.message || 'Failed to place bid.');
    } finally {
      setBidLoading(false);
    }
  };

  // Handle Proxy Auto-Bidding
  const handleSetAutoBid = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/auction/${id}` } } });
      return;
    }

    setAutoBidLoading(true);
    setAutoBidMessage('');
    try {
      const res = await fetch(`/api/auctions/${id}/auto-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ maxAmount: Number(autoBidMax) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to configure auto-bid');

      setAutoBidMessage(data.message);
      setUserAutoBid(data.autoBid);
    } catch (err) {
      alert(err.message);
    } finally {
      setAutoBidLoading(false);
    }
  };

  // Handle Question Submission
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newQuestion.trim()) return;

    setQuestionLoading(true);
    try {
      const res = await fetch(`/api/auctions/${id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question: newQuestion })
      });

      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) => [data.question, ...prev]);
        setNewQuestion('');
      } else {
        alert(data.message || 'Failed to post question');
      }
    } catch (err) {
      alert('Error posting question');
    } finally {
      setQuestionLoading(false);
    }
  };

  // Handle Seller Answering Question
  const handleAnswerSubmit = async (qId) => {
    const answerText = answerDrafts[qId];
    if (!answerText || !answerText.trim()) return;

    try {
      const res = await fetch(`/api/auctions/${id}/questions/${qId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answer: answerText })
      });

      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q._id === qId ? data.question : q))
        );
        setAnswerDrafts((prev) => ({ ...prev, [qId]: '' }));
      }
    } catch (err) {
      alert('Error answering question');
    }
  };

  // Handle Watchlist Toggle
  const handleToggleWatch = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/watchlist/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) setIsWatched(data.isWatched);
    } catch (err) {
      console.error(err);
    }
  };

  // Seller Decision (Approve / Reject)
  const handleDecision = async (decision) => {
    setDecisionLoading(true);
    try {
      const res = await fetch(`/api/auctions/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (res.ok) {
        setAuction(data.auction);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error processing decision');
    } finally {
      setDecisionLoading(false);
    }
  };

  // Handover Confirmation
  const handleConfirmHandover = async () => {
    setHandoverLoading(true);
    try {
      const res = await fetch(`/api/auctions/${id}/handover-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setAuction(data.auction);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error confirming handover');
    } finally {
      setHandoverLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="py-24">
          <LoadingState message="Loading auction lot..." description="Synchronizing server countdown and bids" />
        </div>
      </PageContainer>
    );
  }

  if (error || !auction) {
    return (
      <PageContainer>
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-[#9E392F] mx-auto" />
          <h2 className="text-lg font-bold text-ink">Auction Not Found</h2>
          <p className="text-xs text-olive leading-relaxed">{error || 'This listing does not exist.'}</p>
          <Link to="/explore">
            <Button variant="primary">Return to Marketplace</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isSeller = user && auction.sellerId && auction.sellerId._id.toString() === user.id.toString();
  const isLeader = user && auction.leadingBidderId && (auction.leadingBidderId._id || auction.leadingBidderId).toString() === user.id.toString();
  const nextMinBid = auction.bidCount === 0 ? auction.startingPrice : auction.currentPrice + auction.minimumIncrement;
  const isLive = auction.status === 'live';

  return (
    <PageContainer>
      {/* Real-time Last-Minute 30-Second Extension Notice Banner */}
      {extensionNotice && (
        <div className="mb-6 p-4 rounded border border-[#9E392F]/40 bg-[#9E392F]/15 text-ink flex items-center gap-3 animate-bounce">
          <Zap className="w-5 h-5 text-[#9E392F] shrink-0" />
          <div className="text-xs font-semibold">
            {extensionNotice}
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photos & Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo & Thumbnails */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded border border-border bg-stone overflow-hidden">
              <img
                src={auction.photos[activePhotoIdx] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                alt={auction.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="stone" size="sm" className="bg-paper/90 uppercase font-semibold">
                  {auction.category}
                </Badge>
                <Badge variant="forest" size="sm" className="bg-paper/90">
                  {auction.condition.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Thumbnails row */}
            {auction.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {auction.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-16 h-16 rounded border overflow-hidden shrink-0 transition-opacity ${
                      activePhotoIdx === idx ? 'border-forest ring-2 ring-forest/30' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Item Specs */}
          <Card variant="stone" padding="lg">
            <div className="pb-4 border-b border-border/80">
              <h1 className="text-xl sm:text-2xl font-bold text-ink leading-snug">
                {auction.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-olive mt-2">
                <span>Listed by: <strong>{auction.sellerId?.name}</strong></span>
                <span>Campus: <strong>{auction.sellerId?.campus || 'Main Campus'}</strong></span>
                <span>Views: {auction.viewsCount || 1}</span>
              </div>
            </div>

            <div className="py-4 text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
              {auction.description}
            </div>

            <div className="pt-4 border-t border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-olive block text-[11px]">Starting Price</span>
                <span className="font-semibold text-ink font-sans">₹{auction.startingPrice.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-olive block text-[11px]">Min Increment</span>
                <span className="font-semibold text-ink font-sans">₹{auction.minimumIncrement.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-olive block text-[11px]">Condition</span>
                <span className="font-semibold text-ink capitalize">{auction.condition.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-olive block text-[11px]">Status</span>
                <span className="font-semibold text-forest capitalize">{auction.status.replace('_', ' ')}</span>
              </div>
            </div>
          </Card>

          {/* Public Questions & Answers */}
          <Card variant="stone" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-forest" />
                Questions & Answers
              </CardTitle>
              <CardDescription>
                Ask the seller about product condition, accessories, and campus pickup points.
              </CardDescription>
            </CardHeader>

            {/* Question Input Form */}
            {!isSeller && isLive && (
              <form onSubmit={handleQuestionSubmit} className="mb-6 pt-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about this item..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    wrapperClassName="flex-1"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={questionLoading}
                    icon={Send}
                  >
                    Ask
                  </Button>
                </div>
              </form>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {questions.length === 0 ? (
                <p className="text-xs text-olive py-4 text-center">No questions asked yet.</p>
              ) : (
                questions.map((q) => (
                  <div key={q._id} className="p-3.5 rounded bg-paper border border-border text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-ink">
                        <User className="w-3.5 h-3.5 text-forest" />
                        <span>{q.askerId?.name || 'Student'}</span>
                      </div>
                      <span className="text-[10px] text-olive font-mono">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-ink pl-5">{q.question}</p>

                    {/* Seller Answer */}
                    {q.answer ? (
                      <div className="ml-5 p-2.5 rounded bg-stone/70 border border-border/80 text-[11px] text-ink space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-forest">
                          <Check className="w-3 h-3" /> Seller Response:
                        </div>
                        <p>{q.answer}</p>
                      </div>
                    ) : isSeller ? (
                      <div className="ml-5 pt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your answer as seller..."
                          value={answerDrafts[q._id] || ''}
                          onChange={(e) =>
                            setAnswerDrafts({ ...answerDrafts, [q._id]: e.target.value })
                          }
                          className="flex-1 bg-paper border border-border rounded px-2.5 py-1 text-xs"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAnswerSubmit(q._id)}
                        >
                          Reply
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Bidding Engine & Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Action Box */}
          <Card variant="stone" padding="lg" className="border-forest/30">
            {/* Header: Countdown & Status */}
            <div className="pb-4 mb-4 border-b border-border/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-olive uppercase font-bold tracking-wider block">
                  Auction Status
                </span>
                <span className="text-xs font-semibold text-forest capitalize">
                  {auction.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-olive uppercase font-bold tracking-wider block text-right">
                  Time Remaining
                </span>
                <CountdownTimer closesAt={auction.closesAt} onExpire={fetchAuction} />
              </div>
            </div>

            {/* Price Showcase */}
            <div className="mb-6">
              <span className="text-xs text-olive block mb-0.5">
                {auction.bidCount > 0 ? 'Current Highest Bid' : 'Starting Reserve Price'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="editorial-heading text-3xl sm:text-4xl font-bold text-ink">
                  ₹{auction.currentPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-forest">
                  ({auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'} placed)
                </span>
              </div>
              {isLeader && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-forest/10 border border-forest/20 text-xs font-semibold text-forest">
                  <CheckCircle2 className="w-3.5 h-3.5" /> You hold the leading bid!
                </div>
              )}
            </div>

            {/* Status-Specific Action Flows */}
            {isLive ? (
              <div className="space-y-4">
                {/* Manual Bid Form */}
                {isSeller ? (
                  <div className="p-3.5 rounded bg-paper border border-border text-xs text-olive leading-relaxed">
                    <strong>Seller Notice:</strong> You are the author of this listing. Sellers cannot place bids on their own items.
                  </div>
                ) : (
                  <form onSubmit={handlePlaceBid} className="space-y-3">
                    {bidError && (
                      <div className="p-2.5 rounded border border-[#9E392F]/30 bg-[#9E392F]/10 text-xs text-[#9E392F] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{bidError}</span>
                      </div>
                    )}
                    {bidSuccess && (
                      <div className="p-2.5 rounded border border-forest/30 bg-forest/10 text-xs text-forest flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{bidSuccess}</span>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-ink">Your Bid Amount</span>
                        <span className="text-olive">Minimum valid bid: <strong>₹{nextMinBid.toLocaleString('en-IN')}</strong></span>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-xs text-olive font-bold">₹</span>
                          <input
                            type="number"
                            min={nextMinBid}
                            step={auction.minimumIncrement}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 text-sm font-bold text-ink bg-paper border border-border rounded focus:outline-none focus:ring-1 focus:ring-forest"
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setBidAmount(String(Number(bidAmount || nextMinBid) + auction.minimumIncrement))}
                        >
                          +₹{auction.minimumIncrement}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={bidLoading}
                      icon={Gavel}
                    >
                      Place Authorized Bid
                    </Button>
                  </form>
                )}

                {/* Auto-Bidding Box (Proxy Bidding) */}
                {!isSeller && (
                  <div className="pt-4 border-t border-border/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-forest" /> Automatic Proxy Bidding
                      </span>
                      {userAutoBid && (
                        <Badge variant="forest" size="sm">Max ₹{userAutoBid.maxAmount}</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-olive mb-2 leading-relaxed">
                      Authorizes the system to bid competitively on your behalf up to your configured limit.
                    </p>
                    <form onSubmit={handleSetAutoBid} className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Max limit ₹"
                        min={nextMinBid}
                        value={autoBidMax}
                        onChange={(e) => setAutoBidMax(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-paper border border-border rounded focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        isLoading={autoBidLoading}
                      >
                        Set Limit
                      </Button>
                    </form>
                    {autoBidMessage && (
                      <p className="text-[11px] text-forest font-semibold mt-1.5">{autoBidMessage}</p>
                    )}
                  </div>
                )}
              </div>
            ) : auction.status === 'awaiting_approval' ? (
              /* Seller Decision Workflow */
              <div className="p-4 rounded bg-paper border border-border space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <Clock className="w-4 h-4 text-forest" />
                  Auction Closed: Awaiting Seller Decision
                </div>
                <p className="text-olive leading-relaxed">
                  The auction concluded with a winning bid of <strong>₹{auction.currentPrice.toLocaleString('en-IN')}</strong> by{' '}
                  <strong>{auction.leadingBidderId?.name || 'Provisional Winner'}</strong>.
                </p>

                {isSeller ? (
                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant="primary"
                      className="w-full"
                      isLoading={decisionLoading}
                      onClick={() => handleDecision('approved')}
                    >
                      Approve Winning Price (₹{auction.currentPrice})
                    </Button>
                    <Button
                      variant="danger"
                      className="w-full"
                      isLoading={decisionLoading}
                      onClick={() => handleDecision('rejected')}
                    >
                      Decline Offer
                    </Button>
                  </div>
                ) : isLeader ? (
                  <div className="p-2.5 rounded bg-forest/10 border border-forest/20 text-forest font-medium">
                    You hold the provisional winning offer. Waiting for the seller to confirm pickup coordinates.
                  </div>
                ) : null}
              </div>
            ) : auction.status === 'reserved' ? (
              /* Handover Coordination Workflow */
              <div className="p-4 rounded bg-paper border border-forest/40 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-forest">
                  <CheckCircle2 className="w-4 h-4" /> Item Reserved for Handover
                </div>
                <p className="text-olive leading-relaxed">
                  Winning offer was approved! Please meet on campus to inspect the item and finalize exchange.
                </p>

                <div className="p-3 rounded bg-stone border border-border space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-olive">Seller Contact:</span>
                    <span className="font-semibold text-ink">{auction.sellerId?.phone || 'Available via Chat'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-olive">Campus Pickup:</span>
                    <span className="font-semibold text-ink">{auction.sellerId?.campus || 'Main Campus'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    isLoading={handoverLoading}
                    onClick={handleConfirmHandover}
                  >
                    Confirm Handover & Inspection
                  </Button>
                </div>
              </div>
            ) : auction.status === 'completed' ? (
              <div className="p-4 rounded bg-forest/10 border border-forest/30 text-center py-6 text-xs text-forest space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <h3 className="text-sm font-bold">Sale Completed Successfully</h3>
                <p className="text-olive">Both parties confirmed physical handover on campus.</p>
              </div>
            ) : (
              <div className="p-4 rounded bg-stone border border-border text-center py-4 text-xs text-olive">
                This auction is <strong>{auction.status.replace('_', ' ')}</strong>.
              </div>
            )}

            {/* Quick Actions (Watchlist & Share) */}
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between">
              <Button
                variant={isWatched ? 'secondary' : 'outline'}
                size="sm"
                icon={Bookmark}
                onClick={handleToggleWatch}
              >
                {isWatched ? 'Watched' : 'Add to Watchlist'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon={Share2}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Auction link copied to clipboard!');
                }}
              >
                Share Lot
              </Button>
            </div>
          </Card>

          {/* Public Bid History Table */}
          <Card variant="stone" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Public Bid History</span>
                <span className="text-xs font-normal text-olive">({bidHistory.length} total)</span>
              </CardTitle>
              <CardDescription>
                Authoritative record of all bids accepted by the server.
              </CardDescription>
            </CardHeader>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {bidHistory.length === 0 ? (
                <p className="text-xs text-olive py-4 text-center">No bids recorded yet. Be the first to bid!</p>
              ) : (
                bidHistory.map((bid, idx) => (
                  <div
                    key={bid._id || bid.id || idx}
                    className="p-2.5 rounded bg-paper border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-forest/10 text-forest text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-semibold text-ink">
                          {bid.bidder?.name || 'Student Bidder'}
                        </span>
                        <span className="text-[10px] text-olive font-mono block">
                          {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-ink font-sans">
                        ₹{bid.amount.toLocaleString('en-IN')}
                      </span>
                      {bid.bidType === 'auto' && (
                        <span className="text-[9px] uppercase tracking-wider text-forest font-semibold block">
                          Proxy Auto
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AuctionDetailsPage;
