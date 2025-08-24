# Campus Canteen (MERN) — Live Priority Order Queue

A full‑stack **MERN** application where students (and staff) order food online from the campus canteen. The key challenge solved here is a **live, dynamic order queue** that supports **priority orders** (e.g., staff) which can jump ahead of normal student orders **without breaking fairness** or real‑time updates.

---

## ✨ Features

* **Role‑based auth**: Student, Staff, Admin using JWT (httpOnly cookies).
* **Place orders** with items, notes, pickup window, and payment status.
* **Priority queue**: Staff (or flagged orders) get **higher priority** and are served earlier.
* **Live updates** via WebSockets (Socket.io): queue position, order status, and kitchen screen.
* **Admin dashboard**: Manage menu, mark orders as in‑progress/ready/completed, throttle or pause intake.
* **Resilient queue**: Atomic operations, indexes, and server restarts safe.
* **Mobile‑first UI** with React + Axios.

---

## 🧠 Priority Queue Design

This project demonstrates two interchangeable strategies. Default is **Mongo‑only**; optional Redis can be enabled for scale.

### Option A — MongoDB‑only (default)

Each order document stores:

* `priority` (number) → e.g., **2 = staff**, **1 = student**, larger number = higher priority.
* `enqueuedAt` (Date) → time order entered the queue.
* `status` → `queued | in_progress | ready | completed | cancelled`.

The **ranking** is computed as a sort on: `priority DESC, enqueuedAt ASC, _id ASC` with compound index:

```text
{ status: 1, priority: -1, enqueuedAt: 1, _id: 1 }
```

**Pop next order (atomic):**
Use `findOneAndUpdate(
  { status: 'queued' },
  { $set: { status: 'in_progress', startedAt: new Date() } },
  { sort: { priority: -1, enqueuedAt: 1, _id: 1 }, returnDocument: 'after' }
)`

**Fairness:** Students are FIFO within `priority=1`; staff FIFO within `priority=2`. Staff can “jump” because sort ranks higher priority first.

**Real‑time:** MongoDB Change Streams on the `orders` collection broadcast queue diffs over Socket.io.

### Option B — Redis (optional)

Maintain a Redis **sorted set** `queue:z` with score `score = -(priority * 1e9) + enqueuedEpochMs` so higher priority yields a **lower** (better) score. Use Lua script for atomic pop → write‑back to Mongo for persistence. Recommended for very high throughput.

---

## 🧱 Tech Stack

* **Frontend**: React (JavaScript), React Router, Axios, Socket.io client.
* **Backend**: Node.js, Express, Mongoose, Socket.io, JWT, bcrypt, Joi/Zod validation.
* **DB**: MongoDB (Change Streams). Optional: Redis for accelerated queue ops.
* **Tooling**: Nodemon, ESLint/Prettier, Vitest/Jest, Supertest.

---

## 🗂️ Project Structure

```text
root
├─ client/                # React app (JS)
│  ├─ src/
│  │  ├─ api/axios.js
│  │  ├─ components/
│  │  │  ├─ Register.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ PlaceOrder.jsx
│  │  │  ├─ Profile.jsx
│  │  │  ├─ QueueBoard.jsx     # live queue view
│  │  │  └─ AdminDashboard.jsx
│  │  ├─ context/AuthContext.jsx
│  │  ├─ hooks/useSocket.js
│  │  ├─ pages/
│  │  └─ App.jsx
│  └─ vite.config.js / CRA
├─ server/
│  ├─ src/
│  │  ├─ models/
│  │  │  ├─ User.js
│  │  │  └─ Order.js
│  │  ├─ routes/
│  │  │  ├─ auth.routes.js
│  │  │  ├─ order.routes.js
│  │  │  └─ admin.routes.js
│  │  ├─ controllers/
│  │  ├─ middlewares/
│  │  │  ├─ auth.js            # JWT + role check
│  │  │  └─ error.js
│  │  ├─ services/
│  │  │  ├─ queue.service.js   # atomic next/pop
│  │  │  └─ socket.service.js
│  │  ├─ utils/
│  │  └─ index.js (Express + Socket.io)
│  └─ .env.example
└─ README.md
```

---

## 🧾 Data Models (Mongoose)

### User

```js
{
  _id,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
  createdAt, updatedAt
}
```

**Indexes**: `{ email: 1, unique: true }`

### Order

```js
{
  _id,
  user: ObjectId(User),
  items: [ { itemId, name, price, qty } ],
  notes: String,
  priority: Number,       // 2=staff, 1=student (configurable)
  enqueuedAt: Date,       // set at creation
  status: {
    type: String,
    enum: ['queued','in_progress','ready','completed','cancelled'],
    default: 'queued'
  },
  position: Number,       // optional denormalized for UI
  startedAt: Date,
  readyAt: Date,
  completedAt: Date,
  payment: { method, status, txnId }
}
```

**Indexes**: `{ status: 1, priority: -1, enqueuedAt: 1, _id: 1 }` and `{ user: 1, createdAt: -1 }`

---

## 🔌 API Reference (REST)

**Base URL**: `/api`

### Auth

* `POST /auth/register` → body `{ name, email, password, role? }`
* `POST /auth/login` → body `{ email, password }` → sets `accessToken` httpOnly cookie
* `POST /auth/logout`
* `GET /auth/me` → current user profile

### Orders

* `POST /orders` (auth: student/staff) → create order

  * body: `{ items, notes, priority? }`
    If user role is `staff`, server overrides to `priority=2`; else `1`.
* `GET /orders/my` → list user’s orders
* `GET /orders/:id` → order detail
* `PATCH /orders/:id/cancel` → cancel if still `queued`

### Queue (Kitchen/Admin)

* `GET /queue` → current queue (paginated): sorts by `priority DESC, enqueuedAt ASC`
* `POST /queue/next` (admin) → **atomically pop** next order to `in_progress`
* `PATCH /queue/:id/ready` (admin) → mark ready
* `PATCH /queue/:id/complete` (admin) → complete
* `POST /queue/pause` / `POST /queue/resume` (admin)

**Errors** use a consistent shape: `{ status, message, details? }`

---

## 📡 Real‑time (Socket.io)

* **Server events** (namespace `/queue`):

  * `queue:update` → emits when orders change (Mongo Change Stream)
  * `order:update` → emits to room `order:<id>` for per‑order updates
* **Client emits**:

  * `queue:subscribe` / `queue:unsubscribe`
  * `order:subscribe { orderId }`

**Frontend pattern**: `useEffect(() => join rooms; return () => leave rooms)`. Axios for CRUD, Socket for live state.

---

## 🧪 Atomicity & Consistency

* **Single operation pop** using `findOneAndUpdate` with sort + status filter ensures only one worker gets the next order.
* **Idempotency keys** on create (optional) to avoid duplicate orders on retry.
* **Validation**: Joi/Zod for request bodies; Mongoose schema validation.
* **Transactions** (optional): For multi‑doc operations (e.g., payment then enqueue).

---

## 🔐 Security

* JWT in **httpOnly** cookie `accessToken` + `SameSite=Strict`, `Secure` in production.
* Rate limit auth + order creation.
* Input validation and sanitization.
* CORS restricted to frontend origin.
* Do **not** expose priority as a client‑settable field for staff; derive from user role.

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* MongoDB 6+ (replica set enabled for Change Streams—even a single‑node replica set works)
* (Optional) Redis 7+

### Environment

Create `server/.env` (or use these keys in your own config):

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/canteen
JWT_SECRET=supersecret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
USE_REDIS=false
REDIS_URL=redis://localhost:6379
```

Create `client/.env`:

```env
VITE_API_BASE=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

### Install & Run

```bash
# in root
npm run install:all         # runs npm i in client and server

# dev (concurrently)
npm run dev                 # server:4000 + client:5173

# or run separately
cd server && npm run dev
cd client && npm run dev
```

### Useful Scripts (suggested)

```json
{
  "scripts": {
    "install:all": "npm --prefix client i && npm --prefix server i",
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:client\"",
    "dev:server": "npm --prefix server run dev",
    "dev:client": "npm --prefix client run dev",
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

---

## 🧩 Frontend (React + Axios)

* `api/axios.js` preconfigures baseURL, credentials, and interceptors for refresh/401.
* Components:

  * `Register.jsx` & `Login.jsx` — forms → `/auth/register` & `/auth/login`.
  * `PlaceOrder.jsx` — menu view, cart, POST `/orders`.
  * `Profile.jsx` — show user orders via `/orders/my` + live `order:update`.
  * `QueueBoard.jsx` — live queue via `queue:update` for students; admin sees actions.
  * `AdminDashboard.jsx` — buttons for `queue/next`, mark ready/complete.

---


## 📈 Scaling Notes

* Use **MongoDB TTL** on completed/cancelled orders to auto‑purge after N days.
* If throughput rises: enable **Redis Option B** and **bullmq** for background jobs.
* Shard by day/canteen if multi‑canteen.
* Horizontal scale Socket.io with **Redis adapter**.

---

## 🛠️ Testing

* Unit: services (queue pop logic) with Vitest/Jest.
* API: Supertest over Express.
* E2E: Playwright/Cypress simulating order placement and admin pops.

---

## 🧭 Troubleshooting

* **Change Streams require replica set**: run `mongod --replSet rs0` &
