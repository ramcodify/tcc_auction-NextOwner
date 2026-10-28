import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  X,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Gavel
} from 'lucide-react';
import { getImageUrl, handleImageError } from '../../utils/imageUrl.js';
import Badge from './Badge.jsx';

export const SearchAutocomplete = ({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Search cycles, calculators, textbooks, gear...',
  className = '',
  inputClassName = '',
  autoFocus = false
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const navigate = useNavigate();

  // Keep internal query synchronized with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch live suggestions as the user types
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auctions?q=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.ok) {
          const json = await res.json();
          setSuggestions(json.data || []);
          setIsOpen(true);
          setHighlightedIdx(-1);
        }
      } catch (err) {
        console.error('[SearchAutocomplete fetch error]', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);
    if (!isOpen && val.trim()) setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerSubmit(query);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIdx >= 0 && highlightedIdx < suggestions.length) {
        const selected = suggestions[highlightedIdx];
        handleSelectAuction(selected._id);
      } else {
        triggerSubmit(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const triggerSubmit = (searchVal) => {
    setIsOpen(false);
    if (onSubmit) {
      onSubmit(searchVal);
    } else {
      if (searchVal.trim()) {
        navigate(`/explore?q=${encodeURIComponent(searchVal.trim())}`);
      } else {
        navigate('/explore');
      }
    }
  };

  const handleSelectAuction = (auctionId) => {
    setIsOpen(false);
    navigate(`/auction/${auctionId}`);
  };

  const handleClear = () => {
    setQuery('');
    if (onChange) onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-olive pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-10 pr-10 py-2.5 bg-paper border border-border rounded text-xs sm:text-sm text-ink placeholder:text-olive focus:outline-none focus:ring-1 focus:ring-forest transition-colors ${inputClassName}`}
        />

        {/* Clear or loading indicator */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-olive hover:text-ink transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Related Items Dropdown Suggestions */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-paper border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[420px] flex flex-col">
          {/* Header */}
          <div className="px-3.5 py-2 bg-stone/70 border-b border-border flex items-center justify-between text-[11px] text-olive select-none">
            <span className="font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-forest" /> Related Items matching "{query.trim()}"
            </span>
            <span>{suggestions.length} found</span>
          </div>

          {/* Results list */}
          <div className="overflow-y-auto divide-y divide-border/60">
            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => {
                const isHighlighted = idx === highlightedIdx;
                const photoSrc =
                  item.photos && item.photos.length > 0
                    ? getImageUrl(item.photos[0])
                    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80';

                return (
                  <div
                    key={item._id}
                    onClick={() => handleSelectAuction(item._id)}
                    onMouseEnter={() => setHighlightedIdx(idx)}
                    className={`px-3.5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-stone' : 'hover:bg-stone/50'
                    }`}
                  >
                    {/* Item Thumbnail */}
                    <div className="w-11 h-11 rounded border border-border shrink-0 bg-paper overflow-hidden flex items-center justify-center p-0.5">
                      <img
                        src={photoSrc}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          handleImageError(
                            e,
                            item.photos?.[0],
                            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'
                          );
                        }}
                      />
                    </div>

                    {/* Title & Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-stone border border-border text-ink">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-olive capitalize">
                          {item.condition?.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-ink truncate leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-olive truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Price & Bids */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-forest">
                        ₹{item.currentPrice?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-olive mt-0.5">
                        {item.bidCount === 0 ? 'No bids yet' : `${item.bidCount} bid${item.bidCount > 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center space-y-1.5">
                <p className="text-xs font-medium text-ink">
                  No active auctions found matching "{query}"
                </p>
                <p className="text-[11px] text-olive">
                  Press Enter to explore all marketplace listings or try a different term.
                </p>
              </div>
            )}
          </div>

          {/* Footer view all results */}
          <div
            onClick={() => triggerSubmit(query)}
            className="p-2.5 bg-stone border-t border-border flex items-center justify-between text-xs text-forest font-semibold hover:bg-stone-hover cursor-pointer transition-colors"
          >
            <span>View all matching results in Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
