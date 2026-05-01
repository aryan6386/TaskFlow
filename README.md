# ⚡ TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking progress with role-based access control.

**Live Demo:** `https://your-frontend.railway.app`  
**API:** `https://your-backend.railway.app`

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Signup / Login with JWT (7-day tokens) |
| 👑 Role-Based Access | Admin (full control) + Member (view & update own tasks) |
| 📁 Project Management | Create, update, delete projects; manage team members |
| ✅ Task Management | Create tasks, assign to members, set priority & due date |
| 📊 Dashboard | Animated stats, recent tasks, overdue alerts |
| 🗂️ Kanban Board | Per-project task board with To Do / In Progress / Completed columns |
| 🔍 Task Filters | Filter by status, priority, search by name |
| 🌱 Demo Data | Seed script with sample projects and tasks |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Vanilla CSS (Dark glassmorphism) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas) + Mongoose |
| Auth | JWT + bcrypt |
| Deployment | Railway |

---

## 📁 Project Structure

```
Task/
├── backend/               # Express REST API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/        # User, Project, Task
│   │   ├── middleware/    # JWT auth, role guard
│   │   ├── controllers/   # Business logic
│   │   └── routes/        # API routers
│   ├── seed.js            # Demo data seeder
│   └── server.js
└── frontend/              # Next.js 14
    ├── app/               # App Router pages
    ├── components/        # Sidebar, Modal, StatCard
    ├── context/           # Auth context
    └── lib/               # API client
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Seed Demo Data

```bash
npm run seed
```

This creates:
- **Admin:** admin@demo.com / password123
- **Member 1:** member1@demo.com / password123
- **Member 2:** member2@demo.com / password123
- 3 Projects + 10 Tasks with varied statuses

### 4. Frontend Setup

```bash
cd ../frontend
npm install
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment on Railway

### Step 1 — MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user + get connection string
3. Whitelist `0.0.0.0/0` in Network Access

### Step 2 — Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `backend/` folder (or set Root Directory to `backend`)
3. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_64_char_random_secret
   FRONTEND_URL=https://your-frontend.railway.app
   NODE_ENV=production
   ```
4. Railway auto-detects `npm start`

### Step 3 — Deploy Frontend on Railway
1. New Service → Deploy from same repo
2. Set Root Directory to `frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
4. Railway auto-runs `npm run build && npm start`

### Step 4 — Seed Production Data
```bash
MONGODB_URI=<your-atlas-uri> node seed.js
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/auth/users` | ✅ | List all users |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | ✅ | List projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | ✅ Member | Get project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Admin | Remove member |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks` | ✅ | List tasks (filters: status, priority) |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:id` | ✅ | Get task |
| PUT | `/api/tasks/:id` | Admin/Assignee | Update task |
| PATCH | `/api/tasks/:id/status` | Admin/Assignee | Update status |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/tasks/project/:id` | ✅ Member | Tasks by project |

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | ✅ | Aggregate stats |
| GET | `/api/dashboard/overdue` | ✅ | Overdue tasks |

---

## 🔒 Role-Based Access

| Action | Admin | Member |
|---|---|---|
| Create / delete project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Create / delete task | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks) |
| View projects & tasks | ✅ | ✅ (if member) |
| View dashboard | ✅ | ✅ |

---

## 📸 Screenshots

> Add screenshots after deployment

---

## 📄 License

MIT
