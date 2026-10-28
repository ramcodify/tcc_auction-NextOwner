import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, Gavel, User, Sparkles } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import CountdownTimer from './CountdownTimer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const AuctionCard = ({ auction, onWatchToggle, isInitiallyWatched = false }) => {
  const { user } = useAuth();
  const [isWatched, setIsWatched] = useState(isInitiallyWatched);
  const [watchLoading, setWatchLoading] = useState(false);

  const handleWatchClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in to add items to your watchlist.');
      return;
    }

    setWatchLoading(true);
    try {
      const res = await fetch(`/api/watchlist/${auction._id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setIsWatched(data.isWatched);
        if (onWatchToggle) onWatchToggle(auction._id, data.isWatched);
      }
    } catch (err) {
      console.error('[Watchlist error]', err);
    } finally {
      setWatchLoading(false);
    }
  };

  const photoUrl =
    auction.photos && auction.photos.length > 0
      ? auction.photos[0]
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const conditionLabels = {
    new: 'Brand New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Needs Repair'
  };

  const isLive = auction.status === 'live';

  return (
    <div className="group rounded border border-border bg-stone hover:bg-stone-hover transition-all duration-150 flex flex-col justify-between overflow-hidden relative">
      <Link to={`/auction/${auction._id}`} className="block relative">
        {/* Photo Container */}
        <div className="relative aspect-[4/3] bg-paper overflow-hidden border-b border-border/80">
          <img
            src={photoUrl}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Category Tag overlay */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-paper/90 backdrop-blur-sm text-ink border border-border">
              {auction.category}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-paper/90 backdrop-blur-sm text-forest border border-border">
              {conditionLabels[auction.condition] || auction.condition}
            </span>
          </div>

          {/* Watchlist Toggle Button */}
          <button
            type="button"
            onClick={handleWatchClick}
            disabled={watchLoading}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
            className={`
              absolute top-2.5 right-2.5 p-1.5 rounded-full border transition-colors shadow-sm
              ${isWatched
                ? 'bg-forest text-paper border-forest'
                : 'bg-paper/90 text-olive hover:text-ink border-border hover:bg-paper'}
            `}
            aria-label="Toggle Watchlist"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isWatched ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-ink line-clamp-2 leading-snug group-hover:text-forest transition-colors mb-2">
            {auction.title}
          </h3>

          {/* Pricing & Bids */}
          <div className="mt-auto pt-2 border-t border-border/60 flex items-end justify-between">
            <div>
              <span className="text-[10px] text-olive uppercase font-medium block">
                {auction.bidCount > 0 ? 'Leading Bid' : 'Starting Price'}
              </span>
              <span className="text-base font-bold text-ink font-sans">
                ₹{auction.currentPrice?.toLocaleString('en-IN') || auction.startingPrice?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-medium text-forest block">
                {auction.bidCount > 0 ? `${auction.bidCount} bid${auction.bidCount > 1 ? 's' : ''}` : 'No bids yet'}
              </span>
              {isLive ? (
                <CountdownTimer closesAt={auction.closesAt} compact={true} />
              ) : (
                <Badge variant={auction.status === 'completed' ? 'forest' : 'olive'} size="sm">
                  {auction.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Seller and campus metadata footer */}
      <div className="px-4 py-2 border-t border-border/60 bg-paper/50 flex items-center justify-between text-[11px] text-olive">
        <span className="flex items-center gap-1.5 truncate max-w-[180px]">
          <User className="w-3 h-3 text-forest shrink-0" />
          <span className="truncate">{auction.sellerId?.name || 'Campus Student'}</span>
        </span>
        <span className="text-[10px] text-olive/80 truncate">
          {auction.sellerId?.campus || 'Main Campus'}
        </span>
      </div>
    </div>
  );
};

export default AuctionCard;
