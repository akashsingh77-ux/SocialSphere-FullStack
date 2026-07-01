# 🌐 SocialSphere — Full Stack MERN Social Platform

A feature-rich social media platform built with the MERN stack (MongoDB, Express, React, Node.js). Perfect for placement portfolios.

---

## ✨ Features

### Core
- 🔐 User Authentication (Register / Login / Logout) with session-based auth
- 📝 Create, Read, Delete posts
- ❤️ Like / Unlike posts
- 🔖 Bookmark / Save posts
- 💬 Comment on posts
- 🔍 Search posts by title/content
- 🏷️ Hashtag filtering with trending tags

### Enhanced (v2.0)
- 🌙 **Dark / Light Mode** — toggle from topbar or sidebar, persists in localStorage
- 📍 **Live Location** — attach your GPS location to posts via browser Geolocation API; reverse-geocoded to a readable city/country name; clickable to open in Google Maps
- 😊 **Mood Selector** — express how you feel when creating a post (Happy, Inspired, Excited, etc.)
- 👤 **Profile Page** — view your stats (posts, likes, comments, saves) and all your posts
- 📊 **Stats Dashboard** — post analytics with animated stat cards
- 🎨 **Polished UI** — Inter font, gradient accents, smooth hover transitions, glassmorphism effects

---

## 🛠 Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18, Vite, React Router v6       |
| Styling   | Custom CSS with CSS variables (Dark/Light) |
| Backend   | Node.js, Express.js                   |
| Database  | MongoDB Atlas + Mongoose              |
| Session   | express-session + connect-mongodb-session |
| Icons     | react-icons (Material Design)         |
| Location  | Browser Geolocation API + Nominatim   |

---

## 🚀 Getting Started

### Backend
```bash
cd backend
npm install
node app.js
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 📁 Project Structure

```
socialsphere/
├── backend/
│   ├── app.js              # Express server, DB connection
│   ├── models/
│   │   ├── User.js         # User schema
│   │   └── Post.js         # Post schema (with location, mood)
│   ├── routes/
│   │   ├── auth.js         # Register, Login, Logout
│   │   └── posts.js        # CRUD + like/bookmark/comment
│   └── middleware/
│       └── auth.js         # Session auth guard
└── frontend/
    └── src/
        ├── App.jsx          # Router + providers
        ├── hooks/
        │   ├── useAuth.jsx  # Auth context
        │   ├── useTheme.js  # Dark/Light mode context
        │   └── useToast.js  # Toast notifications
        ├── component/
        │   ├── Layout.jsx   # Sidebar, topbar, nav
        │   ├── PostCard.jsx # Post display with location/mood
        │   └── ToastContainer.jsx
        └── pages/
            ├── Home.jsx     # Feed with tag filters
            ├── CreatePost.jsx # Post form with location + mood
            ├── Bookmarks.jsx  # Saved posts
            └── Profile.jsx    # User stats + their posts
```

---

## 🔑 API Endpoints

| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | /api/auth/register          | Create account       |
| POST   | /api/auth/login             | Log in               |
| POST   | /api/auth/logout            | Log out              |
| GET    | /api/auth/me                | Current user         |
| GET    | /api/posts                  | Get posts (paginated)|
| GET    | /api/posts/user/:userId     | Get user's posts     |
| POST   | /api/posts                  | Create post          |
| DELETE | /api/posts/:id              | Delete post          |
| PATCH  | /api/posts/:id/like         | Toggle like          |
| PATCH  | /api/posts/:id/bookmark     | Toggle bookmark      |
| POST   | /api/posts/:id/comments     | Add comment          |

---

Built with ❤️ using React + Node.js + MongoDB
