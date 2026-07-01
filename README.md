# PrimeTrade Task Manager

A full-stack task management application built as part of the PrimeTrade Backend Developer Intern assignment. Features JWT authentication, role-based access control (user / admin), full CRUD for tasks, and a clean React frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js (ES Modules) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| API Docs | Swagger UI (`/api/docs`) |
| Frontend | React 18, Vite, Tailwind CSS |
| HTTP Client | Axios (with JWT interceptor) |

---

## Project Structure

```
primetrade-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # authController, taskController
│   │   ├── middleware/     # protect, authorize, validators, errorHandler
│   │   ├── models/         # User, Task (Mongoose schemas)
│   │   ├── routes/         # authRoutes, taskRoutes
│   │   ├── utils/          # generateToken
│   │   ├── app.js          # Express app setup, Swagger, middleware
│   │   └── server.js       # Entry point
│   ├── swagger.json        # OpenAPI 3.0 spec
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Login, Register, Dashboard, TaskList
│   │   ├── context/        # AuthContext (global user state)
│   │   ├── api.js          # Axios instance + JWT interceptor
│   │   ├── App.jsx         # Routes + ProtectedRoute
│   │   └── main.jsx
│   ├── index.html
│   ├── .env.example
│   └── package.json
├── SCALABILITY.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (MongoDB Atlas free tier works)

---

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/primetrade-task-manager.git
cd primetrade-task-manager
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/primetrade
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Backend runs on **http://localhost:5000**

---

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## API Documentation (Swagger)

With the backend running, open:

```
http://localhost:5000/api/docs
```

The interactive Swagger UI lists every endpoint with request/response schemas. Click **Authorize 🔒** and paste your JWT token to test protected routes directly in the browser.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | ❌ | Register a new user |
| POST | `/api/v1/auth/login` | ❌ | Login and receive JWT |
| GET | `/api/v1/auth/me` | ✅ | Get current user profile |

### Tasks

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/v1/tasks` | ✅ | Any | List tasks (admin sees all, user sees own) |
| POST | `/api/v1/tasks` | ✅ | Any | Create a task |
| GET | `/api/v1/tasks/:id` | ✅ | Any | Get a single task |
| PATCH | `/api/v1/tasks/:id` | ✅ | Owner / Admin | Update a task |
| DELETE | `/api/v1/tasks/:id` | ✅ | Owner / Admin | Delete a task |

#### Query parameters for GET `/api/v1/tasks`

| Param | Values | Default |
|---|---|---|
| `status` | `pending`, `in-progress`, `completed` | — |
| `priority` | `low`, `medium`, `high` | — |
| `page` | number | `1` |
| `limit` | number | `10` |

---

## Roles

| Role | Permissions |
|---|---|
| `user` | Create tasks, view/edit/delete **own** tasks only |
| `admin` | View, edit, and delete **all** tasks from all users |

Select your role during registration on the signup page.

---

## Security Highlights

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT signed with `HS256`, expires in 7 days
- **express-validator** sanitizes and validates all inputs
- **express-mongo-sanitize** prevents NoSQL injection
- **Helmet** sets secure HTTP headers
- **express-rate-limit** limits requests per IP (100 req / 15 min)
- ProtectedRoute in React prevents accessing dashboard without a valid token

---

## Scalability

See [`SCALABILITY.md`](./SCALABILITY.md) for a detailed note on how this architecture can grow — covering stateless JWT scaling, MongoDB indexing, Redis caching, and the microservices path.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWTs | `a_long_random_string` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `NODE_ENV` | Environment | `development` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

---

## Scripts

### Backend
```bash
npm run dev    # Start with nodemon (hot reload)
npm start      # Start without hot reload
```

### Frontend
```bash
npm run dev    # Start Vite dev server
npm run build  # Build for production
```

---

*Built by Ashish · PrimeTrade Intern Assignment · 2025*
