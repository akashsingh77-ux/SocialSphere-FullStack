import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import {
  MdHome, MdAdd, MdBookmark, MdLogout, MdMenu, MdSearch,
  MdClose, MdPerson, MdWbSunny, MdNightlight
} from 'react-icons/md';
import { RiSparklingFill } from 'react-icons/ri';
import ToastContainer from './ToastContainer';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { toasts, addToast } = useToast();

  const navItems = [
    { label: 'Home Feed', icon: <MdHome />, path: '/' },
    { label: 'Create Post', icon: <MdAdd />, path: '/create' },
    { label: 'Bookmarks', icon: <MdBookmark />, path: '/bookmarks' },
    { label: 'My Profile', icon: <MdPerson />, path: '/profile' },
  ];

  const pageTitle = {
    '/': '🏠 Home Feed',
    '/create': '✍️ Create Post',
    '/bookmarks': '🔖 Bookmarks',
    '/profile': '👤 My Profile',
  }[location.pathname] || 'SocialSphere';

  const handleLogout = async () => {
    await logout();
    addToast('Logged out. See you soon! 👋', 'info');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <RiSparklingFill color="white" size={20} />
          </div>
          <span>SocialSphere</span>
          <button onClick={closeSidebar} className="sidebar-close-btn">
            <MdClose size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); closeSidebar(); }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light'
              ? <><MdNightlight size={16}/> Dark Mode</>
              : <><MdWbSunny size={16}/> Light Mode</>
            }
          </button>
          <div className="sidebar-user" onClick={handleLogout} title="Logout">
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7)' }}>
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">@{user?.username}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <MdLogout size={16} style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }} />
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <MdMenu />
          </button>
          <span className="topbar-title">{pageTitle}</span>
          <div className="search-box">
            <MdSearch className="search-icon" />
            <input
              placeholder="Search posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="topbar-theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <MdNightlight size={20} /> : <MdWbSunny size={20} />}
          </button>
        </header>

        <div className="page-body">
          <Outlet context={{ search, addToast }} />
        </div>

        <footer className="footer">
          © 2026 <span>SocialSphere</span> — Built with React + Node.js + MongoDB
        </footer>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
