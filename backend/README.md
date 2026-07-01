# Backend — PrimeTrade Task Manager

Express REST API with JWT auth, RBAC, and MongoDB.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with your values
npm run dev
```

## Environment Variables

| Variable       | Description                            |
|----------------|----------------------------------------|
| PORT           | HTTP port (default 5000)               |
| MONGO_URI      | MongoDB connection string              |
| JWT_SECRET     | Secret for signing JWTs               |
| JWT_EXPIRE     | Token expiry (default `1d`)            |
| CLIENT_ORIGIN  | Allowed CORS origin                    |
| NODE_ENV       | `development` or `production`          |

## API Docs

Swagger UI available at `http://localhost:5000/api/docs` once the server is running.

## Example Requests

**Register**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

**Login**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

**Create Task** (use token from login)
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy API","priority":"high"}'
```

**Get Tasks with filter**
```bash
curl "http://localhost:5000/api/v1/tasks?status=pending&page=1&limit=5" \
  -H "Authorization: Bearer <token>"
```
