import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MdBookmark } from 'react-icons/md';
import api from '../assets/api';
import PostCard from '../component/PostCard';

export default function Bookmarks() {
  const { addToast } = useOutletContext();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts', { params: { limit: 100 } })
      .then(res => {
        const uid = user?._id || user?.id;
        const saved = res.data.posts.filter(p => p.bookmarks?.includes(uid));
        setPosts(saved);
      })
      .catch(() => addToast('Failed to load bookmarks', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handleUpdate = (updated) => {
    const uid = user?._id || user?.id;
    if (!updated.bookmarks?.includes(uid)) {
      setPosts(prev => prev.filter(p => p._id !== updated._id));
    } else {
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdBookmark color="var(--primary)" /> Saved Posts
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {posts.length} bookmark{posts.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔖</div>
          <h3>No bookmarks yet</h3>
          <p>Save posts from the feed to find them here.</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            addToast={addToast}
          />
        ))
      )}
    </div>
  );
}
