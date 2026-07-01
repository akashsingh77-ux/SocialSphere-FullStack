import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MdTrendingUp, MdFilterList } from 'react-icons/md';
import api from '../assets/api';
import PostCard from '../component/PostCard';

export default function Home() {
  const { search, addToast } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTag, setActiveTag] = useState('');
  const [trendingTags, setTrendingTags] = useState([]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (activeTag) params.tag = activeTag;
      const res = await api.get('/posts', { params });
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);

      // Build trending tags from this batch
      const tagMap = {};
      res.data.posts.forEach(p => p.tags?.forEach(t => { if (t) tagMap[t] = (tagMap[t] || 0) + 1; }));
      setTrendingTags(Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 8));
    } catch {
      addToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTag]);

  useEffect(() => {
    const delay = setTimeout(fetchPosts, search ? 400 : 0);
    return () => clearTimeout(delay);
  }, [fetchPosts]);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handleUpdate = (updated) => setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Feed */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Tag filter chips */}
        {trendingTags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              className={`tag ${activeTag === '' ? '' : ''}`}
              style={activeTag === '' ? { background: 'var(--primary)', color: 'white' } : {}}
              onClick={() => { setActiveTag(''); setPage(1); }}
            >
              All
            </button>
            {trendingTags.map(([tag]) => (
              <button
                key={tag}
                className="tag"
                style={activeTag === tag ? { background: 'var(--primary)', color: 'white' } : {}}
                onClick={() => { setActiveTag(tag); setPage(1); }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏜️</div>
            <h3>No posts found</h3>
            <p>{search ? `No results for "${search}"` : 'Be the first to share something!'}</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                addToast={addToast}
              />
            ))}
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                <button
                  className="action-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ opacity: page === 1 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>
                <span style={{ padding: '7px 14px', fontSize: 13, color: 'var(--mid)' }}>
                  {page} / {totalPages}
                </span>
                <button
                  className="action-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ opacity: page === totalPages ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Trending sidebar — hidden on small screens */}
      {trendingTags.length > 0 && (
        <div style={{ width: 200, flexShrink: 0 }} className="d-none d-xl-block">
          <div className="trending-card">
            <h4><MdTrendingUp /> Trending Tags</h4>
            {trendingTags.map(([tag, count]) => (
              <div
                key={tag}
                className="trending-tag-item"
                onClick={() => { setActiveTag(tag); setPage(1); }}
              >
                <span className="tag-name">#{tag}</span>
                <span className="tag-count">{count} posts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
