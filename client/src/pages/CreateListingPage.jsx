import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const CreateListingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tomorrow's date formatted as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    category: 'cycle',
    description: '',
    condition: 'good',
    startingPrice: '',
    minimumIncrement: '50',
    closingDate: defaultDate,
    closingTime: '18:00'
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (photoFiles.length + files.length > 5) {
      alert('You can upload a maximum of 5 photos.');
      return;
    }

    const newFiles = [...photoFiles, ...files];
    setPhotoFiles(newFiles);

    // Create object URLs for preview
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const handleRemovePhoto = (idx) => {
    const newFiles = [...photoFiles];
    newFiles.splice(idx, 1);
    setPhotoFiles(newFiles);

    const newPreviews = [...photoPreviews];
    URL.revokeObjectURL(newPreviews[idx]);
    newPreviews.splice(idx, 1);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.startingPrice) {
      setError('Please complete all required fields.');
      return;
    }

    const priceNum = Number(formData.startingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid starting price.');
      return;
    }

    const closingDateTime = new Date(`${formData.closingDate}T${formData.closingTime}`);
    if (closingDateTime <= new Date()) {
      setError('Closing deadline must be a future date and time.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('condition', formData.condition);
      data.append('startingPrice', formData.startingPrice);
      data.append('minimumIncrement', formData.minimumIncrement || '20');
      data.append('closingDate', formData.closingDate);
      data.append('closingTime', formData.closingTime);

      // Append all photo files
      photoFiles.forEach((file) => {
        data.append('photos', file);
      });

      const res = await fetch('/api/auctions', {
        method: 'POST',
        credentials: 'include',
        body: data
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to create auction');
      }

      navigate(`/auction/${json.auction._id}`);
    } catch (err) {
      setError(err.message || 'Server error creating listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Create Auction Listing"
      subtitle="Publish an item for time-bound campus bidding. Both buyers and sellers share one unified student account."
    >
      <div className="max-w-2xl mx-auto py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded border border-[#9E392F]/30 bg-[#9E392F]/10 text-xs text-[#9E392F] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Uploader */}
          <Card variant="stone" padding="lg">
            <h3 className="text-sm font-semibold text-ink mb-1">Item Photography (Up to 5)</h3>
            <p className="text-xs text-olive mb-4">
              Upload clear photos showing the current condition and any included campus accessories.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photoPreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded border border-border overflow-hidden bg-paper group">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-ink/70 text-paper hover:bg-[#9E392F] transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {photoPreviews.length < 5 && (
                <label className="aspect-square rounded border-2 border-dashed border-border hover:border-forest bg-paper flex flex-col items-center justify-center cursor-pointer transition-colors text-olive hover:text-forest">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[11px] font-medium">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </Card>

          {/* Main Details */}
          <Card variant="stone" padding="lg" className="space-y-4">
            <Input
              label="Listing Title *"
              placeholder="e.g. Hero Sprint 21-Speed Cycle with Helmet & Lock"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-paper border border-border text-xs text-ink rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                >
                  <option value="cycle">Bicycles & Cycles</option>
                  <option value="calculator">Scientific Calculators</option>
                  <option value="books">Textbooks & Study Notes</option>
                  <option value="electronics">Electronics & Tech</option>
                  <option value="furniture">Dorm Furniture</option>
                  <option value="other">Other Campus Gear</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-ink block mb-1">Condition *</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full bg-paper border border-border text-xs text-ink rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                >
                  <option value="new">Brand New (Sealed/Unopened)</option>
                  <option value="like_new">Like New (Barely used)</option>
                  <option value="good">Good (Normal wear, fully functional)</option>
                  <option value="fair">Fair (Noticeable wear)</option>
                  <option value="poor">Needs Repair</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink block mb-1">Item Description *</label>
              <textarea
                rows={4}
                placeholder="Mention semester used, original purchase date, known scratches, and pickup locations on campus..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-paper border border-border text-xs text-ink rounded p-3 focus:outline-none focus:ring-1 focus:ring-forest"
                required
              />
            </div>
          </Card>

          {/* Pricing & Deadline */}
          <Card variant="stone" padding="lg" className="space-y-4">
            <h3 className="text-sm font-semibold text-ink mb-1">Pricing & Duration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Starting Price (₹) *"
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                required
              />

              <Input
                label="Minimum Bid Increment (₹)"
                type="number"
                min="5"
                placeholder="20"
                value={formData.minimumIncrement}
                onChange={(e) => setFormData({ ...formData, minimumIncrement: e.target.value })}
                helperText="Minimum difference required for subsequent bids"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Closing Date *"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.closingDate}
                onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                required
              />

              <Input
                label="Closing Time *"
                type="time"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                required
              />
            </div>
          </Card>

          {/* Rules Assurance */}
          <div className="p-3.5 rounded bg-paper border border-border text-xs text-olive leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
            <span>
              <strong>Marketplace Rule:</strong> Once student bids are placed, starting price and deadline cannot be altered. Bids placed in the final 30 seconds automatically extend the auction by 60 seconds to ensure fair pricing.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
          >
            Publish Live Auction
          </Button>
        </form>
      </div>
    </PageContainer>
  );
};

export default CreateListingPage;
