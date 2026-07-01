import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MdEdit, MdBarChart, MdFavorite, MdBookmark, MdChatBubble } from 'react-icons/md';
import { RiSparklingFill } from 'react-icons/ri';
import api from '../assets/api';
import PostCard from '../component/PostCard';

const GRADIENTS = [
  'linear-gradient(135deg, #6c63ff, #a855f7)',
  'linear-gradient(135deg, #f12711, #f5af19)',
  'linear-gradient(135deg, #00c6ff, #0072ff)',
  'linear-gradient(135deg, #11998e, #38ef7d)',
  'linear-gradient(135deg, #ee0979, #ff6a00)',
];
const getGradient = (str) => GRADIENTS[str?.charCodeAt(0) % GRADIENTS.length];

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, likes: 0, comments: 0, bookmarks: 0 });

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    api.get(`/posts/user/${userId}`)
      .then(res => {
        const p = res.data.posts;
        setPosts(p);
        const totalLikes = p.reduce((a, b) => a + (b.reactions || 0), 0);
        const totalComments = p.reduce((a, b) => a + (b.comments?.length || 0), 0);
        const totalBookmarks = p.reduce((a, b) => a + (b.bookmarks?.length || 0), 0);
        setStats({ posts: p.length, likes: totalLikes, comments: totalComments, bookmarks: totalBookmarks });
      })
      .catch(() => addToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));

  const gradient = getGradient(user?.username);
  const joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="profile-page">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-banner" />
        <div className="profile-info">
          <div className="profile-avatar" style={{ background: gradient }}>
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="profile-details">
            <h2>@{user?.username}</h2>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-join">Member since {joinDate}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7)' }}>
            <RiSparklingFill size={20} color="white" />
          </div>
          <div className="stat-value">{stats.posts}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f12711, #f5af19)' }}>
            <MdFavorite size={20} color="white" />
          </div>
          <div className="stat-value">{stats.likes}</div>
          <div className="stat-label">Likes Received</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
            <MdChatBubble size={20} color="white" />
          </div>
          <div className="stat-value">{stats.comments}</div>
          <div className="stat-label">Comments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #00c6ff, #0072ff)' }}>
            <MdBookmark size={20} color="white" />
          </div>
          <div className="stat-value">{stats.bookmarks}</div>
          <div className="stat-label">Times Saved</div>
        </div>
      </div>

      {/* My Posts */}
      <div className="profile-posts">
        <h3 className="section-title">
          <MdBarChart size={20} /> My Posts
        </h3>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Share your first post with the community!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} onDelete={handleDelete} onUpdate={() => {}} addToast={addToast} />
          ))
        )}
      </div>
    </div>
  );
}
