import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MdSend, MdTag, MdLocationOn, MdMyLocation, MdClose } from 'react-icons/md';
import api from '../assets/api';

export default function CreatePost() {
  const navigate = useNavigate();
  const { addToast } = useOutletContext();
  const [form, setForm] = useState({ title: '', body: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [mood, setMood] = useState('');

  const MOODS = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '💡', label: 'Inspired' },
    { emoji: '🔥', label: 'Excited' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '😎', label: 'Confident' },
    { emoji: '💪', label: 'Motivated' },
  ];

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation not supported by your browser', 'error');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        // Reverse geocode using free API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
          const state = data.address?.state || '';
          const country = data.address?.country || '';
          const name = [city, state, country].filter(Boolean).join(', ');
          setLocationName(name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          addToast('📍 Location attached!', 'success');
        } catch {
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocationLoading(false);
      },
      (err) => {
        addToast('Could not get location. Please allow access.', 'error');
        setLocationLoading(false);
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and content are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const tags = form.tags.trim().split(/\s+/).filter(Boolean);
      await api.post('/posts', {
        title: form.title,
        body: form.body,
        tags,
        mood: mood || null,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          name: locationName,
        } : null,
      });
      addToast('🎉 Post published!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = form.body.length;
  const maxChars = 2000;

  return (
    <div className="create-post-page">
      <div className="create-post-card">
        <div className="create-post-header">
          <h2>✍️ Create a Post</h2>
          <p>Share your thoughts, ideas, or updates with the community.</p>
        </div>

        {error && <div className="alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Mood Selector */}
          <div className="form-group">
            <label className="form-label">How are you feeling?</label>
            <div className="mood-picker">
              {MOODS.map(m => (
                <button
                  type="button"
                  key={m.label}
                  className={`mood-btn ${mood === m.label ? 'active' : ''}`}
                  onClick={() => setMood(prev => prev === m.label ? '' : m.label)}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Post Title *</label>
            <input
              name="title"
              className="form-control-styled"
              placeholder="What's on your mind today?"
              value={form.title}
              onChange={handleChange}
              maxLength={120}
              required
            />
            <div className="char-counter">{form.title.length}/120</div>
          </div>

          <div className="form-group">
            <label className="form-label">Post Content *</label>
            <textarea
              name="body"
              className="form-control-styled"
              placeholder="Tell the community more about it..."
              value={form.body}
              onChange={handleChange}
              rows={6}
              maxLength={maxChars}
              required
              style={{ resize: 'vertical', minHeight: 140 }}
            />
            <div className="char-counter" style={{ color: charCount > maxChars * 0.9 ? 'var(--accent)' : '' }}>
              {charCount}/{maxChars}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MdTag style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Hashtags <span style={{ fontWeight: 400, color: 'var(--mid)' }}>(space separated)</span>
            </label>
            <input
              name="tags"
              className="form-control-styled"
              placeholder="coding placement internship react"
              value={form.tags}
              onChange={handleChange}
            />
            {form.tags.trim() && (
              <div className="tag-preview">
                {form.tags.trim().split(/\s+/).filter(Boolean).map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              <MdLocationOn style={{ marginRight: 4, verticalAlign: 'middle', color: 'var(--accent)' }} />
              Add Location
            </label>
            {location ? (
              <div className="location-badge">
                <MdLocationOn size={16} />
                <span>{locationName}</span>
                <button type="button" onClick={clearLocation} className="location-clear">
                  <MdClose size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="location-btn"
                onClick={fetchLocation}
                disabled={locationLoading}
              >
                <MdMyLocation size={16} />
                {locationLoading ? 'Getting location...' : 'Attach my location'}
              </button>
            )}
          </div>

          <button type="submit" className="btn-primary-styled" disabled={loading}>
            {loading ? 'Publishing...' : <><MdSend style={{ marginRight: 6 }} />Publish Post</>}
          </button>
        </form>
      </div>
    </div>
  );
}
