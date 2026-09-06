# EA-Fitness-Clothing-Store

Premium MERN storefront for **EA Fitness Clothing** — training apparel for men and women.

## Stack

- MongoDB, Express, React (Vite), Node.js
- Framer Motion, Lucide React

## Setup

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:5001

MongoDB must be running locally (`mongodb://127.0.0.1:27017/ea-fitness-clothing-store`).

## Demo accounts

- Admin: `admin@eafitness.com` / `Admin123!`
- Customer: `alex@eafitness.com` / `Customer123!`
- Coupon: `TRAIN10` (10% over $60)

Payment runs in mock mode until `PAYMENT_MODE` and gateway keys are set. Secrets stay in `.env` only.
