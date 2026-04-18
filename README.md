# NGO Connect

A full-stack MERN platform connecting donors, volunteers, and NGOs.

## Quick Start

```bash
# 1. Install all dependencies
npm install
cd server && npm install
cd ../client && npm install

# 2. Set up environment (edit server/.env)
# MONGO_URI=mongodb://localhost:27017/ngo-connect
# JWT_SECRET=your_secret_key

# 3. Run both server + client
cd ..
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

## Stack
- **Frontend**: React 18, Vite, React Router v6, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Design**: Plus Jakarta Sans, CSS Variables, custom design system

## Roles
| Role | Access |
|------|--------|
| `donor` | Donate to NGOs, view donation history |
| `volunteer` | Browse events, apply to NGOs |
| `ngo` | Post events, manage volunteer applications |
| `admin` | Approve NGOs, platform management |

## API Endpoints
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/auth/register` | ❌ |
| POST | `/api/auth/login` | ❌ |
| GET | `/api/auth/me` | ✅ |
| GET | `/api/ngos` | ❌ |
| POST | `/api/ngos` | NGO/Admin |
| POST | `/api/donations` | ✅ |
| GET | `/api/stats` | ❌ |
