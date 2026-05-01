# ⚡ TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking progress with role-based access control.

---

## ✨ Features

- **🔐 Authentication:** Secure Signup / Login with JWT.
- **👑 Role-Based Access:** Admin (full control) and Member (view & update own tasks) roles.
- **📁 Project Management:** Create, update, and organize projects with your team.
- **✅ Task Management:** Assign tasks, set priorities, and track due dates.
- **📊 Interactive Dashboard:** View real-time stats, recent tasks, and overdue alerts.
- **🗂️ Kanban Board:** Drag-and-drop task organization across To Do, In Progress, and Completed columns.

---

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + Vanilla CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt

---

## 🚀 Quick Start (Local Development)

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
# Edit .env with your MongoDB URI
npm run dev
```

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔒 Role-Based Access

| Action | Admin | Member |
|---|---|---|
| Create / delete projects & tasks | ✅ | ❌ |
| Add / remove team members | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks) |
| View dashboard & assigned projects | ✅ | ✅ |
___
