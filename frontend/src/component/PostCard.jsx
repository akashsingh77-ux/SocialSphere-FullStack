import { useState } from 'react';
import {
  MdDelete, MdThumbUp, MdBookmarkBorder, MdBookmark,
  MdChatBubbleOutline, MdSend, MdLocationOn, MdOpenInNew
} from 'react-icons/md';
import api from '../assets/api';
import { useAuth } from '../hooks/useAuth';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const GRADIENTS = [
  'linear-gradient(135deg, #6c63ff, #a855f7)',
  'linear-gradient(135deg, #f12711, #f5af19)',
  'linear-gradient(135deg, #00c6ff, #0072ff)',
  'linear-gradient(135deg, #11998e, #38ef7d)',
  'linear-gradient(135deg, #ee0979, #ff6a00)',
];

const getGradient = (str) => GRADIENTS[str?.charCodeAt(0) % GRADIENTS.length];

const MOOD_EMOJIS = {
  Happy: '😊', Inspired: '💡', Excited: '🔥',
  Thoughtful: '🤔', Confident: '😎', Motivated: '💪',
};

export default function PostCard({ post, onDelete, onUpdate, addToast }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const isOwner = user?._id === localPost.userId || user?.id === localPost.userId;
  const isLiked = localPost.likedBy?.includes(user?._id || user?.id);
  const isSaved = localPost.bookmarks?.includes(user?._id || user?.id);

  const handleLike = async () => {
    try {
      const res = await api.patch(`/posts/${localPost._id}/like`);
      setLocalPost(p => ({
        ...p,
        reactions: res.data.reactions,
        likedBy: res.data.liked
          ? [...(p.likedBy || []), user._id || user.id]
          : (p.likedBy || []).filter(id => id !== (user._id || user.id)),
      }));
      if (onUpdate) onUpdate({ ...localPost, reactions: res.data.reactions });
    } catch { addToast('Failed to like post', 'error'); }
  };

  const handleBookmark = async () => {
    try {
      const res = await api.patch(`/posts/${localPost._id}/bookmark`);
      setLocalPost(p => ({
        ...p,
        bookmarks: res.data.bookmarked
          ? [...(p.bookmarks || []), user._id || user.id]
          : (p.bookmarks || []).filter(id => id !== (user._id || user.id)),
      }));
      addToast(res.data.bookmarked ? '🔖 Post saved!' : 'Removed from bookmarks', 'success');
    } catch { addToast('Failed to bookmark', 'error'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${localPost._id}`);
      onDelete(localPost._id);
      addToast('Post deleted.', 'info');
    } catch { addToast('Failed to delete post', 'error'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${localPost._id}/comments`, { body: commentText });
      setLocalPost(p => ({ ...p, comments: [...(p.comments || []), res.data.comment] }));
      setCommentText('');
    } catch { addToast('Failed to post comment', 'error'); }
    finally { setSubmittingComment(false); }
  };

  const openInMaps = () => {
    const { latitude, longitude } = localPost.location;
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  const gradient = getGradient(localPost.username);

  return (
    <div className="post-card">
      <div className="post-accent" />
      <div className="post-card-body">
        {/* Author row */}
        <div className="post-author">
          <div className="avatar avatar-lg" style={{ background: gradient }}>
            {localPost.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="post-author-info">
            <div className="post-author-name">
              @{localPost.username}
              {localPost.mood && (
                <span className="mood-badge" title={localPost.mood}>
                  {MOOD_EMOJIS[localPost.mood] || ''} {localPost.mood}
                </span>
              )}
            </div>
            <div className="post-author-time">{timeAgo(localPost.createdAt)}</div>
          </div>
          {isOwner && (
            <button className="action-btn-danger" onClick={handleDelete} title="Delete">
              <MdDelete size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <h3 className="post-title">{localPost.title}</h3>
        <p className="post-body">{localPost.body}</p>

        {/* Location */}
        {localPost.location?.name && (
          <div className="post-location" onClick={openInMaps} title="Open in Google Maps">
            <MdLocationOn size={14} />
            <span>{localPost.location.name}</span>
            <MdOpenInNew size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </div>
        )}

        {/* Tags */}
        {localPost.tags?.length > 0 && (
          <div className="post-tags">
            {localPost.tags.filter(Boolean).map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="post-actions">
          <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
            <MdThumbUp size={16} />
            <span>{localPost.reactions}</span>
          </button>

          <button className="action-btn" onClick={() => setShowComments(v => !v)}>
            <MdChatBubbleOutline size={16} />
            <span>{localPost.comments?.length || 0}</span>
          </button>

          <button className={`action-btn ${isSaved ? 'saved' : ''}`} onClick={handleBookmark}>
            {isSaved ? <MdBookmark size={16} /> : <MdBookmarkBorder size={16} />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="comments-section">
          {(localPost.comments || []).length === 0 ? (
            <p className="no-comments">No comments yet. Be first!</p>
          ) : (
            localPost.comments.map((c, i) => (
              <div key={i} className="comment-item">
                <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, background: getGradient(c.username) }}>
                  {c.username?.substring(0, 2).toUpperCase()}
                </div>
                <div className="comment-bubble">
                  <div className="comment-author">@{c.username}</div>
                  <div className="comment-body">{c.body}</div>
                  <div className="comment-time">{timeAgo(c.createdAt)}</div>
                </div>
              </div>
            ))
          )}
          <form onSubmit={handleComment} className="comment-form">
            <input
              className="comment-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn-sm-styled" disabled={submittingComment}>
              <MdSend size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
