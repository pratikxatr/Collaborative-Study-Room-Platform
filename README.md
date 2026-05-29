# 📚 Collaborative Study Room Platform

A real-time web platform where students can create virtual study rooms, invite peers, track focused study sessions, and collaborate through live chat — all in one place.

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| TailwindCSS v4 | Styling & CSS animations |
| React Router DOM | Client-side routing |
| Socket.io-client | Real-time communication |
| Axios | HTTP requests to backend API |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.io | WebSocket server for real-time events |
| MongoDB + Mongoose | Database & object modelling |
| bcryptjs | Password hashing |
| jsonwebtoken (JWT) | Authentication & session tokens |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

---

## ✅ Features Implemented

### Authentication
- User registration with username, email, and password
- Secure login with JWT tokens (7-day expiry)
- Password hashing with bcryptjs
- Protected routes — unauthenticated users redirected to login
- Persistent sessions via localStorage

### Study Room Management
- Create study rooms with a name and description
- Auto-generated unique 8-character invite codes
- Join any room using an invite code
- View all rooms you are a member of
- Delete rooms (owner only)

### Real-Time Session Timer
- Start and end study sessions inside a room
- Live timer synced across all members in the room via Socket.io
- Session start and end events broadcast to every connected user
- Progress bar that fills as the session runs
- Sessions saved to the database with start time, end time, and duration

### Room Chat
- Real-time messaging using Socket.io
- Messages persisted to MongoDB
- Chat bubbles — your messages on the right, others on the left
- Unread message badge when viewing the History tab
- Auto-scroll to latest message

### Real-Time Room Updates
- Session start/end events broadcast to all room members instantly
- User join and leave events emitted via Socket.io
- Live indicator badge on active rooms in the dashboard

### Activity Dashboard
- Total rooms joined
- Total sessions completed
- Total cumulative study time
- Per-room session history with duration, date, and who started it
- Skeleton loading placeholders while data fetches

---

## 🛠️ Project Setup

### Prerequisites
- Node.js v18 or higher
- MongoDB running locally on port `27017`

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd collaborative-study-room-platform
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (one already exists, edit if needed):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/studyroom
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server:

```bash
node server.js
```

You should see:
```
Server running on port 5000
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

---

## 📁 Project Structure

```
├── backend/
│   ├── controllers/
│   │   ├── authController.js     # Register, login, get current user
│   │   └── roomController.js     # Room CRUD, join, start/end session
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Room.js               # Room schema (messages, sessions embedded)
│   ├── routes/
│   │   ├── auth.js               # /api/auth routes
│   │   └── rooms.js              # /api/rooms routes
│   ├── .env                      # Environment variables
│   └── server.js                 # Express + Socket.io server entry point
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js          # Axios instance with auth interceptor
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state & methods
        │   └── SocketContext.jsx # Socket.io connection context
        ├── components/
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   └── Room.jsx
        ├── index.css             # Tailwind + custom keyframe animations
        └── App.jsx               # Routes definition
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current authenticated user |

### Rooms
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rooms` | Create a new room |
| GET | `/api/rooms` | Get all rooms for current user |
| GET | `/api/rooms/:id` | Get a single room with messages & sessions |
| POST | `/api/rooms/join` | Join a room via invite code |
| POST | `/api/rooms/:id/start` | Start a study session |
| POST | `/api/rooms/:id/end` | End a study session |
| DELETE | `/api/rooms/:id` | Delete a room (owner only) |

---

## 🔄 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `join-room` | Client → Server | Join a room's socket channel |
| `leave-room` | Client → Server | Leave a room's socket channel |
| `send-message` | Client → Server | Send a chat message |
| `new-message` | Server → Client | Broadcast new message to room |
| `session-started` | Client ↔ Server | Notify room a session has started |
| `session-ended` | Client ↔ Server | Notify room a session has ended |
| `user-joined` | Server → Client | Notify room a user joined |
| `user-left` | Server → Client | Notify room a user left |

---

## 🧪 Test Credentials

Two accounts are pre-created in the database for testing:

| Username | Email | Password |
|---|---|---|
| test | test@test.com | 123456 |
| john | john@test.com | 123456 |

---

## 📝 Notes

- The Vite dev server proxies `/api` and `/socket.io` requests to `http://localhost:5000`, so no CORS issues during development.
- All animations are hand-written using CSS keyframes — no animation libraries used.
- MongoDB must be running before starting the backend.
